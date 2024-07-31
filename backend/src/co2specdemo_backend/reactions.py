"""Demo app for experimenting with CO2 impurities reactions."""

from __future__ import annotations
from typing import TypedDict


class Reaction(TypedDict):
    coefficients: dict[str, float]
    id: int
    eq: str


def parse_reaction_string(reactions_strings: dict[int, str]) -> dict[int, Reaction]:
    """Parse dict of reaction strings into dict of reaction coefficients."""
    reactions: dict[int, Reaction] = {}
    for index, line in reactions_strings.items():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        reactants_part, products_part = line.split("->")
        reactants_terms, products_terms = reactants_part.split(
            "+"
        ), products_part.split("+")
        coefficients: dict[str, float] = {}
        for term in reactants_terms:
            term = term.strip()
            if " " in term:
                coeff_, reactant = term.split()
                coeff = float(coeff_)
            else:
                coeff = 1
                reactant = term
            coefficients[reactant] = -coeff
        for term in products_terms:
            term = term.strip()
            if " " in term:
                coeff_, product = term.split()
                coeff = float(coeff_)
            else:
                coeff = 1
                product = term
            coefficients[product] = +coeff
        reactions[index] = {
            "coefficients": coefficients,
            "id": index,
            "eq": line,
        }
    return reactions


def print_header(concentrations: dict[str, float], *, newline: bool = True) -> None:
    """Prettyprint a line with headers from the concentrations."""
    substances = sorted(concentrations.keys())
    for s in substances:
        print(f"{s:>8}", end="")
    if newline:
        print()


def print_values(concentrations: dict[str, float], *, newline: bool = True) -> None:
    """Prettyprint a line with values from the concentrations."""
    substances = sorted(concentrations.keys())
    for s in substances:
        v = concentrations[s]
        print(f"{v:8.1f}", end="")
    if newline:
        print()


def can_react(concentrations: dict[str, float], reaction: Reaction) -> float:
    """Return the number of times a given reaction can happen."""
    coeff_multipliers = []
    for substance, coeff in reaction["coefficients"].items():
        if coeff < 0:
            m = concentrations[substance] / -coeff
            coeff_multipliers.append(m)
    if any(m < 0.001 for m in coeff_multipliers):
        return 0
    else:
        return min(coeff_multipliers)


def do_react(
    concentrations: dict[str, float], reaction: Reaction, *, verbose: bool = False
) -> None:
    """Apply a given reaction and modify concentrations accordingly."""
    multiplier = can_react(concentrations, reaction)
    assert multiplier > 0
    for substance, coeff in reaction["coefficients"].items():
        concentrations[substance] += coeff * multiplier
    if verbose:
        print_values(concentrations, newline=False)
        print(
            f"    ### after applying eq {reaction['id']} * {multiplier:.3f} : {reaction['eq']} "
        )


def run_model_sm1(concentrations: dict[str, float], *, verbose: bool = False) -> None:
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
        6: "8 H2S + 4 O2 -> 8 H2O + S8",
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
