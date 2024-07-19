from __future__ import annotations
from typing import Any, Annotated
from io import StringIO
from contextlib import redirect_stdout

from fastapi import FastAPI, Request
from pydantic import BaseModel, Field
import itertools
import pandas as pd
from reactions import run_model_sm1
from corrosion_calc import surface_area, corrosion_rate_HNO3, corrosion_rate_H2SO4
from fastapi.middleware.cors import CORSMiddleware


from fastapi.responses import RedirectResponse

app = FastAPI(debug=True)

origins = [
    "http://localhost:3000",
    "https://co2spec.playground.radix.equinor.com",
    "https://frontend-c2d2-web-portal-test-dev.playground.radix.equinor.com",
]


class DefaultComponents(BaseModel):
    inputs: dict[str, float]
    outputs: list[str]
    pipe_inputs: Annotated[dict[str, float], Field(alias="pipeInputs")]
    column: str
    row: str
    value: str


COMPOUNDS = DefaultComponents(
    inputs={
        "H2O": 30.0,
        "O2": 30.0,
        "SO2": 10.0,
        "NO2": 20.0,
        "H2S": 0.0,
    },
    pipeInputs={
        "inner_diameter": 30.0,
        "drop_out_length": 1000.0,
        "flowrate": 20.0,
    },
    outputs=[
        "H2SO4",
        "HNO3",
        "NO",
        "HNO2",
        "S8",
        "H2SO4_corrosion",
        "HNO3_corrosion",
        "corrosion_rate",
    ],
    column="O2",
    row="NO2",
    value="H2SO4",
)


@app.get("/api/compounds")
async def get_compounds() -> DefaultComponents:
    return COMPOUNDS


@app.get("/api/hello")
async def hello() -> Any:
    return {"message": "Hello from backend"}


# Setup CORS middleware so your React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows the frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/run_reactions")
async def run_reactions(
    concentrations: dict[str, float],
) -> dict[str, float]:
    run_model_sm1(concentrations, verbose=False)
    return concentrations


# This is a helper function we use to apply over our data frame. Should not be edited
def wrap_runmodel(argument: pd.DataFrame) -> pd.DataFrame:
    concentrations = argument.to_dict()
    concentrations["NO"] = 0
    concentrations["H2SO4"] = 0
    concentrations["HNO3"] = 0
    run_model_sm1(concentrations, verbose=True)
    argument["H2SO4"] = concentrations["H2SO4"]
    argument["HNO3"] = concentrations["HNO3"]

    return argument


# This is a helper function we use to apply over our data frame. Should not be edited
def wrap_corrosion_calc(argument: pd.DataFrame) -> pd.DataFrame:
    kwargs = argument.to_dict()
    area = surface_area(kwargs["inner_diameter"], kwargs["drop_out_length"])
    argument["H2SO4_corrosion"] = corrosion_rate_H2SO4(
        area, kwargs["flowrate"], kwargs["H2SO4"]
    )
    argument["HNO3_corrosion"] = corrosion_rate_HNO3(
        area, kwargs["flowrate"], kwargs["HNO3"]
    )
    argument["corrosion_rate"] = (
        argument["H2SO4_corrosion"] + argument["HNO3_corrosion"]
    )
    return argument


class PipeInputs(BaseModel):
    inner_diameter: Annotated[float, Field(alias="innerDiameter")]
    drop_out_length: Annotated[float, Field(alias="dropOutLength")]
    flowrate: float


class RunMatrix(BaseModel):
    row: str = Field(alias="rowValue")
    column: str = Field(alias="columnValue")
    value: str = Field(alias="valueValue")
    inputs: dict[str, float]
    pipe_inputs: dict[str, float] = Field(default_factory=dict, alias="pipeInputs")


@app.post("/api/run_matrix")
async def run_matrix(request: Request):
    data = RunMatrix.model_validate_json(await request.body())

    indices = [(i / 2) + 0.5 for i in range(20)]

    result = pd.DataFrame(
        itertools.product(indices, repeat=2), columns=(data.column, data.row)
    )

    for key, val in {**data.inputs, **data.pipe_inputs}.items():
        if key in (data.column, data.row):
            continue
        result[key] = val

    logs = StringIO()
    with redirect_stdout(logs):
        result = result.apply(wrap_runmodel, axis=1)
        if data.pipe_inputs:
            result = result.apply(wrap_corrosion_calc, axis=1)

    # The index parameter is used as the "vertical" axis, while the column parameter is the "horizontal" axis
    df = result.pivot_table(index=data.row, columns=data.column, values=data.value)

    return {
        "plot": {
            "z": df.values.tolist(),
            "x": df.index.tolist(),
            "y": df.columns.tolist(),
        },
        "layout": {
            "grid": "bottom to top",
        },
        "logs": logs.getvalue(),
    }


@app.get("/")
async def root() -> RedirectResponse:
    return RedirectResponse("/docs")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5005)
