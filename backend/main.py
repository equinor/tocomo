from fastapi import FastAPI
from reactions import run_model_sm1, parse_reaction_string
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://co2spec.playground.radix.equinor.com",
    "https://frontend-c2d2-web-portal-test-dev.playground.radix.equinor.com",
]

@app.get("/hello")
async def hello():
    return {"message": "Hello from backend"}

# Setup CORS middleware so your React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows the frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5005)
