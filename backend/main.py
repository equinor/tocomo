from fastapi import FastAPI
from reactions import run_model_sm1, parse_reaction_string

app = FastAPI()


@app.get("/run_reactions")
async def run_reactions(
    H2O: float = 0,
    O2: float = 0,
    SO2: float = 0,
    NO2: float = 0,
    H2S: float = 0,
    H2SO4: float = 0,
    HNO3: float = 0,
    NO: float = 0,
):

    reactions_strings = {
        1: "NO2 + SO2 + H2O -> NO + H2SO4",
        2: "2 NO + O2 -> 2 NO2",
        3: "H2S + 3 NO2 -> SO2 + H2O + 3 NO",
        4: "3 NO2 + H2O -> 2 HNO3 + NO",
    }

    reactions = parse_reaction_string(reactions_strings)
    concentrations = {
        "H2O": H2O,
        "O2": O2,
        "SO2": SO2,
        "NO2": NO2,
        "H2S": H2S,
        "H2SO4": H2SO4,
        "HNO3": HNO3,
        "NO": NO,
    }
    run_model_sm1(concentrations, reactions, verbose=False)

    return concentrations
