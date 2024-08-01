"""Demo app for experimenting with CO2 impurities reactions."""

from __future__ import annotations

from contextlib import redirect_stdout
from enum import StrEnum, auto
import io
from pydantic import BaseModel


class Molecule(StrEnum):
    H2SO4 = auto()
    HNO3 = auto()
    HNO2 = auto()
    SO2 = auto()
    NO2 = auto()
    H2S = auto()
    H2O = auto()
    S8 = auto()
    O2 = auto()
    NO = auto()


M = Molecule


MOLECULE_TEXT = {
    M.H2SO4: "H₂SO₄",
    M.HNO3: "HNO₃",
    M.HNO2: "HNO₂",
    M.SO2: "SO₂",
    M.NO2: "NO₂",
    M.H2S: "H₂S",
    M.H2O: "H₂O",
    M.S8: "S₈",
    M.O2: "O₂",
    M.NO: "NO",
}


class Reaction(BaseModel):
    lhs: list[tuple[int, Molecule]]
    rhs: list[tuple[int, Molecule]]
    index: int
    active: bool = True

    def do(self, concentrations: dict[Molecule, float]) -> float:
        mult = min(concentrations[m] / n for n, m in self.lhs)
        if mult < 0.001:
            return 0.0

        for n, m in self.lhs:
            concentrations[m] = concentrations[m] - mult * n
        for n, m in self.rhs:
            concentrations[m] = concentrations[m] + mult * n

        substances = sorted(concentrations.keys())
        for s in substances:
            v = concentrations[s]
            print(f"{v:8.1f}", end="")
        print(f"    ### after applying eq {self.index} * {mult:.3f} : {self}")
        return mult

    def __str__(self) -> str:
        return f"{self._tostr(self.lhs)} → {self._tostr(self.rhs)}"

    @staticmethod
    def _tostr(x: list[tuple[int, Molecule]]) -> str:
        return " + ".join(
            m if n == 1 else f"{n} {m}"
            for n, m in ((n, MOLECULE_TEXT[m]) for n, m in x)
        )


REACTIONS = [
    Reaction(
        index=3,
        lhs=[(1, M.H2S), (3, M.NO2)],
        rhs=[(1, M.SO2), (1, M.H2O), (3, M.NO)],
    ),
    Reaction(
        index=2,
        lhs=[(2, M.NO), (1, M.O2)],
        rhs=[(2, M.NO2)],
    ),
    Reaction(
        index=1,
        lhs=[(1, M.NO2), (1, M.SO2), (1, M.H2O)],
        rhs=[(1, M.NO), (1, M.H2SO4)],
    ),
    Reaction(
        index=4,
        lhs=[(3, M.NO2), (1, M.H2O)],
        rhs=[(2, M.HNO3), (1, M.NO)],
    ),
    Reaction(
        index=5,
        lhs=[(2, M.NO2), (1, M.H2O)],
        rhs=[(1, M.HNO3), (1, M.HNO2)],
        active=False,
    ),
    Reaction(
        index=6,
        lhs=[(8, M.H2S), (4, M.O2)],
        rhs=[(8, M.H2O), (1, M.S8)],
    ),
]


class Result(BaseModel):
    initial: dict[Molecule, float]
    final: dict[Molecule, float]
    max: dict[Molecule, float]
    log: str


def run_model_sm1(initial_concentrations: dict[Molecule, float]) -> Result:
    """
    Run reaction model as discussed with Sven Morten June 18.
    Updated with two more equations (5 and 6)
    """

    # Clone input
    concentrations = {**initial_concentrations}

    logs = io.StringIO()
    with redirect_stdout(logs):
        substances = sorted(concentrations.keys())
        for s in substances:
            s = MOLECULE_TEXT[s]
            print(f"{s:>8}", end="")
        print()

        while True:
            for r in REACTIONS:
                if r.active and r.do(concentrations):
                    break
            else:
                break

    return Result(
        initial=initial_concentrations,
        final=concentrations,
        max=concentrations,
        log=logs.getvalue(),
    )
