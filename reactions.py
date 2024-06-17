"""Demo app for experimenting with CO2 impurities reactions"""

def parse_reaction_string(reactions_strings):
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
        reactions[index] = {'coefficients': coefficients, 'rate': rate}
        index += 1
    return reactions

def print_header(concentrations, *, newline=True):
    substances = sorted(concentrations.keys())
    for s in substances:
        print(f"{s:>8}", end='')
    if newline:
        print()

def print_values(concentrations, *, newline=True):
    substances = sorted(concentrations.keys())
    for s in substances:
        v = concentrations[s]
        print(f"{v:8.1f}", end='')
    if newline:
        print()

def can_react(concentrations, reaction):
    """Return the number of times a given reaction can happen"""
    coeff_multipliers = []
    for substance, coeff in reaction['coefficients'].items():
        if coeff < 0:
            m = concentrations[substance] / -coeff
            coeff_multipliers.append(m)
    if any(m < 0.001 for m in coeff_multipliers):
        return 0
    else:
        return min(coeff_multipliers)

def do_react(concentrations, reaction, *, multiplier=1):
    for substance, coeff in reaction['coefficients'].items():
        concentrations[substance] += coeff * multiplier

def run_model_sm1(concentrations, reactions, *, verbose=False, stepping=False):
    reaction_priorities = [3, 2, 1, 4]
    if verbose:
        print("Priorities:", reaction_priorities)
    while True:    
        for i in reaction_priorities:
            r = reactions[i]
            if m := can_react(concentrations, r):
                do_react(concentrations, r, multiplier=m)
                if verbose:
                    print_values(concentrations, newline=False)
                    print("    ### after applying reaction", i, "*", m, r, end='')
                    if stepping:
                        input()
                    else:
                        print()
                break
        else:
            return

def main():
    reactions_strings = {
        1: "NO2 + SO2 + H2O -> NO + H2SO4",
        2: "2 NO + O2 -> 2 NO2",
        3: "H2S + 3 NO2 -> SO2 + H2O + 3 NO",
        4: "3 NO2 + H2O -> 2 HNO3 + NO"
    }

    for i, r in reactions_strings.items():
        print(f"Reaction {i}: {r}")
    reactions = parse_reaction_string(reactions_strings)

    initial_concentrations = {
        'H2O': 30, 
        'O2': 10, 
        'SO2': 0,
        'NO2': 1.5, 
        'H2S': 3, 
        'H2SO4': 0, 
        'HNO3' : 0, 
        'NO': 0, 
    }
    
    concentrations = initial_concentrations.copy()
    print_header(concentrations)
    print_values(concentrations)
    run_model_sm1(concentrations, reactions, verbose=True)
    print_values(concentrations)
    
if __name__ == "__main__":
    main()
