"""Demo app for experimenting with CO2 impurities reactions."""


def parse_reaction_string(reactions_strings):
    """Parse dict of reaction strings into dict of reaction coefficients."""
    reactions = {}
    for index, line in reactions_strings.items():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ';' in line:
            reaction_part, rate_part = line.split(";")
        else:
            reaction_part = line
            rate_part = 1
        rate = float(rate_part)
        reactants_part, products_part = reaction_part.split("->")
        reactants_terms, products_terms = reactants_part.split('+'), products_part.split('+')
        coefficients = {}
        for term in reactants_terms:
            term = term.strip()
            if ' ' in term:
                coeff, reactant = term.split()
                coeff = float(coeff)
            else:
                coeff = 1
                reactant = term
            coefficients[reactant] = -coeff
        for term in products_terms:
            term = term.strip()
            if ' ' in term:
                coeff, product = term.split()
                coeff = float(coeff)
            else:
                coeff = 1
                product = term
            coefficients[product] = +coeff
        reactions[index] = {'coefficients': coefficients, 'rate': rate, 'id': index, 'eq': line}
    return reactions


def print_header(concentrations, *, newline=True):
    """Prettyprint a line with headers from the concentrations."""
    substances = sorted(concentrations.keys())
    for s in substances:
        print(f"{s:>8}", end='')
    if newline:
        print()


def print_values(concentrations, *, newline=True):
    """Prettyprint a line with values from the concentrations."""
    substances = sorted(concentrations.keys())
    for s in substances:
        v = concentrations[s]
        print(f"{v:8.1f}", end='')
    if newline:
        print()


def can_react(concentrations, reaction):
    """Return the number of times a given reaction can happen."""
    coeff_multipliers = []
    for substance, coeff in reaction['coefficients'].items():
        if coeff < 0:
            m = concentrations[substance] / -coeff
            coeff_multipliers.append(m)
    if any(m < 0.001 for m in coeff_multipliers):
        return 0
    else:
        return min(coeff_multipliers)


def do_react(concentrations, reaction, *, verbose=False):
    """Apply a given reaction and modify concentrations accordingly."""
    multiplier = can_react(concentrations, reaction)
    assert multiplier > 0
    for substance, coeff in reaction['coefficients'].items():
        concentrations[substance] += coeff * multiplier
    if verbose:
        print_values(concentrations, newline=False)
        print(f"    ### after applying eq {reaction['id']} * {multiplier:.3f} : {reaction['eq']} ")


def run_model_sm1(concentrations, *, verbose=False):
    """
    Run reaction model as discussed with Sven Morten June 18.
    Updated with two more equations (5 and 6)
    """

    reactions_strings = {
        1: "NO2 + SO2 + H2O -> NO + H2SO4",
        2: "2 NO + O2 -> 2 NO2",
        3: "H2S + 3 NO2 -> SO2 + H2O + 3 NO",
        4: "3 NO2 + H2O -> 2 HNO3 + NO",
        5: "2 NO2 + H2O-> HNO3 + HNO2",
        6: "8 H2S + 4 O2 -> 8 H2O + S8"
    }
    reactions = parse_reaction_string(reactions_strings)

    reactions_possible = True
    while reactions_possible:
        if can_react(concentrations, reactions[3]):
            do_react(concentrations, reactions[3], verbose=verbose)
        elif can_react(concentrations, reactions[2]):
            do_react(concentrations, reactions[2], verbose=verbose)
        elif can_react(concentrations, reactions[1]):
            do_react(concentrations, reactions[1], verbose=verbose)
        elif can_react(concentrations, reactions[4]):
            do_react(concentrations, reactions[4], verbose=verbose)
        elif can_react(concentrations, reactions[6]):
            do_react(concentrations, reactions[6], verbose=verbose)
        else:
            reactions_possible = False
    return


def normalize(concentrations):
    """Round all values concentrations to 1 decimal precision."""
    for k, v in concentrations.items():
        concentrations[k] = round(v, 1)
    return concentrations


def selftest():
    """Test agains SM CO2 spec mass balance model Excel spread sheet (18 jun 2024)."""

    run_model = run_model_sm1

    concentrations = {'H2O': 40, 'O2': 15, 'SO2': 0, 'NO2': 15, 'H2S': 3, 'H2SO4': 0, 'HNO3': 0, 'NO': 0, 'HNO2': 0, 'S8': 0}
    run_model(concentrations)
    assert normalize(concentrations) == normalize({'H2O': 32.5, 'O2': 5.3, 'SO2': 0.0, 'NO2': 0.0, 'H2S': 0.0, 'H2SO4': 3.0, 'HNO3': 15.0, 'NO': 0.0, 'HNO2': 0, 'S8': 0})

    concentrations = {'H2O': 20, 'O2': 15, 'SO2': 0, 'NO2': 15, 'H2S': 3, 'H2SO4': 0, 'HNO3': 0, 'NO': 0, 'HNO2': 0, 'S8': 0}
    run_model(concentrations)
    assert normalize(concentrations) == normalize({'H2O': 12.5, 'O2': 5.3, 'SO2': 0.0, 'NO2': 0.0, 'H2S': 0.0, 'H2SO4': 3.0, 'HNO3': 15.0, 'NO': 0.0, 'HNO2': 0, 'S8': 0})

    concentrations = {'H2O': 20, 'O2': 5, 'SO2': 0, 'NO2': 8, 'H2S': 3, 'H2SO4': 0, 'HNO3': 0, 'NO': 0, 'HNO2': 0, 'S8': 0}
    run_model(concentrations)
    assert normalize(concentrations) == normalize({'H2O': 18.0, 'O2': 0.0, 'SO2': 0.0, 'NO2': 0.0, 'H2S': 0.0, 'H2SO4': 3.0, 'HNO3': 4.0, 'NO': 4.0, 'HNO2': 0, 'S8': 0})

    concentrations = {'H2O': 20, 'O2': 5, 'SO2': 0, 'NO2': 8, 'H2S': 7, 'H2SO4': 0, 'HNO3': 0, 'NO': 0, 'HNO2': 0, 'S8': 0}
    run_model(concentrations)
    assert normalize(concentrations) == normalize({'H2O': 26.0, 'O2': 0.0, 'SO2': 6.0, 'NO2': 0.0, 'H2S': 1.0, 'H2SO4': 0.0, 'HNO3': 0.0, 'NO': 8.0, 'HNO2': 0, 'S8': 0})


def main():
    """Main entry point when running program directly (for testing and development)"""

    selftest()

    initial_concentrations = {
        'H2O': 30,
        'O2': 10,
        'SO2': 0,
        'NO2': 1.5,
        'H2S': 3,
        'H2SO4': 0,
        'HNO3': 0,
        'NO': 0,
        'HNO2': 0,
        'S8': 0,
    }

    concentrations = initial_concentrations.copy()
    print_header(concentrations)
    print_values(concentrations)
    run_model_sm1(concentrations, verbose=False)
    print_header(concentrations)
    print_values(concentrations)


if __name__ == "__main__":
    main()
