"""Demo app for experimenting with CO2 impurities reactions."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Reaction:
    id: int
    lhs: list[tuple[int, str]]
    rhs: list[tuple[int, str]]
    active: bool = True

    def react(self, concentrations: dict[str, float]) -> bool:
        mult = min(concentrations.get(m, 0.0) / n for n, m in self.lhs)

        # No reaction
        if mult < 0.001:
            return False

        for n, m in self.lhs:
            concentrations[m] = concentrations.get(m, 0.0) - n * mult
        for n, m in self.rhs:
            concentrations[m] = concentrations.get(m, 0.0) + n * mult
        return True


def run_model_sm1(concentrations: dict[str, float]) -> None:
    """
    Run reaction model as discussed with Sven Morten June 18.
    Updated with two more equations (5 and 6)
    """

    reactions = [
        Reaction(
            id=3, lhs=[(1, "H2S"), (3, "NO2")], rhs=[(1, "SO2"), (1, "H2O"), (3, "NO")]
        ),
        Reaction(id=2, lhs=[(2, "NO"), (1, "O2")], rhs=[(2, "NO2")]),
        Reaction(
            id=1,
            lhs=[(1, "NO2"), (1, "SO2"), (1, "H2O")],
            rhs=[(1, "NO"), (1, "H2SO4")],
        ),
        Reaction(id=4, lhs=[(3, "NO2"), (1, "H2O")], rhs=[(2, "HNO3"), (1, "NO")]),
        Reaction(
            id=5,
            lhs=[(2, "NO2"), (1, "H2O")],
            rhs=[(1, "HNO3"), (1, "HNO2")],
            active=False,
        ),
        Reaction(id=6, lhs=[(8, "H2S"), (4, "O2")], rhs=[(8, "H2O"), (1, "S8")]),
    ]

    while True:
        for r in reactions:
            if r.react(concentrations):
                break
        else:
            return
