"""Demo app for experimenting with CO2 impurities reactions"""

def parse_reaction_string(reactions_string):
    reactions = {}
    index = 1
    for line in reactions_string.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        reaction_part, rate_part = line.split(";")
        rate = float(rate_part)
        reactants_part, products_part = reaction_part.split("->")
        reactants_terms, products_terms = reactants_part.split('+'), products_part.split('+')
        coefficients = {}
        for term in reactants_terms:
            term = term.strip()
            if ' ' in term:
                coeff, reactant = term.split()
                coeff = int(coeff)
            else:
                coeff = 1
                reactant = term
            coefficients[reactant] = -coeff
        for term in products_terms:
            term = term.strip()
            if ' ' in term:
                coeff, product = term.split()
                coeff = int(coeff)
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
        print(f"{v:8.2f}", end='')
    if newline:
        print()

def can_react(concentrations, reaction, *, timestep=1):
    for substance, coeff in reaction['coefficients'].items():
        if coeff < 0:
            if concentrations[substance] < -coeff * timestep:
                return False
    return True

def do_react(concentrations, reaction, *, timestep=1):
    for substance, coeff in reaction['coefficients'].items():
        concentrations[substance] += coeff * timestep

def run_model_1324(concentrations, reactions, *, verbose=False, stepping=False):

    if verbose:
        print_values(concentrations)

    did_react = True
    while did_react:

        reaction_order = [1, 3, 2, 4]
        did_react = False

        r = None
        for i in reaction_order:
            r = reactions[i]
            if can_react(concentrations, r):
                do_react(concentrations, r)
                did_react = True
                break
        if verbose or stepping:
            print_values(concentrations, newline=False)
            print("    ### after applying reaction", i, r, end='')
            if stepping:
                input()
            else:
                print()

def main():
    reactions_string = """
    NO2 + SO2 + H2O -> NO + H2SO4; 1
    2 NO + O2 -> 2 NO2; 1
    H2S + 3 NO2 -> SO2 + H2O + 3 NO; 1
    3 NO2 + H2O -> 2 HNO3 + NO; 0.001
    """

    reactions = parse_reaction_string(reactions_string)
    #print(*reactions.items(), sep='\n')

    initial_concentrations = {'H2O': 40, 'H2S': 35, 'H2SO4': 30, 'HNO3' : 25, 'NO': 20, 'NO2': 15, 'O2': 10, 'SO2': 5}

    concentrations = initial_concentrations.copy()
    print_header(concentrations)
    print_values(concentrations)
    run_model_1324(concentrations, reactions, verbose=True, stepping=False)
    print_values(concentrations)
    
if __name__ == "__main__":
    main()
