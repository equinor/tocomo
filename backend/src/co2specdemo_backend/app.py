from __future__ import annotations
from typing import Any, Annotated
from io import StringIO
from contextlib import redirect_stdout

from fastapi import FastAPI, Request
from pydantic import BaseModel, Field
import itertools
import numpy as np
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

from .reactions import Molecule, Result, run_model_sm1
from .corrosion_calc import surface_area, corrosion_rate_HNO3, corrosion_rate_H2SO4


from fastapi.responses import RedirectResponse

app = FastAPI(debug=True)

origins = [
    "http://localhost:3000",
    "https://co2spec.playground.radix.equinor.com",
    "https://frontend-c2d2-web-portal-test-dev.playground.radix.equinor.com",
]


class DefaultComponents(BaseModel):
    inputs: dict[Molecule, float]
    outputs: list[Molecule]
    pipe_inputs: Annotated[dict[str, float], Field(serialization_alias="pipeInputs")]
    column: Molecule
    row: Molecule
    value: Molecule


M = Molecule
COMPOUNDS = DefaultComponents(
    inputs={
        M.H2O: 30.0,
        M.O2: 30.0,
        M.SO2: 10.0,
        M.NO2: 20.0,
        M.H2S: 0.0,
    },
    pipe_inputs={
        "inner_diameter": 30.0,
        "drop_out_length": 1000.0,
        "flowrate": 20.0,
    },
    outputs=[
        M.H2SO4,
        M.HNO3,
        M.NO,
        M.HNO2,
        M.S8,
        # "H2SO4_corrosion",
        # "HNO3_corrosion",
        # "corrosion_rate",
    ],
    column=M.O2,
    row=M.NO2,
    value=M.H2SO4,
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
    run_model_sm1(concentrations)
    return concentrations


# This is a helper function we use to apply over our data frame. Should not be edited
def wrap_corrosion_calc(argument: pd.Series[float]) -> pd.Series[float]:
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
    row: Molecule = Field(alias="rowValue")
    column: Molecule = Field(alias="columnValue")
    value: Molecule = Field(alias="valueValue")
    inputs: dict[Molecule, float]
    pipe_inputs: dict[str, float] = Field(default_factory=dict, alias="pipeInputs")


@app.post("/api/run_matrix")
async def run_matrix(data: RunMatrix) -> dict[str, Any]:
    xrange = np.arange(0.5, 10.5, 0.5)
    yrange = np.arange(0.5, 10.5, 0.5)
    values = np.empty(shape=(len(yrange), len(xrange)), dtype=np.float64)

    initial_concentrations = {**{m: 0.0 for m in M.__members__.values()}, **data.inputs}

    results: list[list[Result]] = []
    for yindex, yvalue in enumerate(yrange):
        results.append([])
        for xindex, xvalue in enumerate(xrange):
            result = run_model_sm1(
                {**initial_concentrations, data.row: yvalue, data.column: xvalue}
            )
            values[yindex, xindex] = result.final[data.value]
            results[yindex].append(result)

    # for key, val in {**data.inputs, **data.pipe_inputs}.items():
    #     if key in (data.column, data.row):
    #         continue
    #     result[key] = val

    # result = result.apply(wrap_runmodel, axis=1)
    # if data.pipe_inputs:
    #     result = result.apply(wrap_corrosion_calc, axis=1)

    return {
        "plot": {
            "z": values.tolist(),
            "x": xrange.tolist(),
            "y": yrange.tolist(),
        },
        "layout": {
            "grid": "bottom to top",
        },
        "resultData": results,
    }


@app.get("/")
async def root() -> RedirectResponse:
    return RedirectResponse("/docs")
