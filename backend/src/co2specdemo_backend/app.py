from __future__ import annotations
from typing import Any, Annotated
from io import StringIO
from contextlib import redirect_stdout
from dataclasses import dataclass

from fastapi import FastAPI, Request
from pydantic import BaseModel, Field
import itertools
import numpy as np
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

from .reactions import MOLECULE_TEXT, REACTIONS, Molecule, Result, run_model_sm1
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


@dataclass
class FormInput:
    name: str
    text: str
    init: float | None = None
    needs_pipe_input: Annotated[bool, Field(serialization_alias="needsPipeInput")] = (
        False
    )

    @classmethod
    def m(cls, molecule: Molecule, init: float | None = None) -> FormInput:
        return FormInput(name=molecule.value, text=MOLECULE_TEXT[molecule], init=init)


class FormConfig(BaseModel):
    inputs: list[FormInput]
    pipe_inputs: Annotated[list[FormInput], Field(serialization_alias="pipeInputs")]
    outputs: list[FormInput]
    column: Molecule
    row: Molecule
    value: Molecule | str
    molecules: dict[str, str]
    reactions: dict[int, str]


FORM_CONFIG = FormConfig(
    inputs=[
        FormInput.m(M.H2O, 30.0),
        FormInput.m(M.O2, 30.0),
        FormInput.m(M.SO2, 10.0),
        FormInput.m(M.NO2, 20.0),
        FormInput.m(M.H2S, 0.0),
    ],
    pipe_inputs=[
        FormInput("inner_diameter", "Inner Diameter", init=30.0),
        FormInput("drop_out_length", "Drop-out Length", init=1000.0),
        FormInput("flowrate", "Flow-rate", init=20.0),
    ],
    outputs=[
        FormInput.m(M.H2SO4),
        FormInput.m(M.HNO3),
        FormInput.m(M.NO),
        FormInput.m(M.HNO2),
        FormInput.m(M.S8),
        FormInput("H2SO4_corrosion", "H₂SO₄ Corrosion", needs_pipe_input=True),
        FormInput("HNO3_corrosion", "HNO₃ Corrosion", needs_pipe_input=True),
        FormInput("corrosion_rate", "Corrosion Rate", needs_pipe_input=True),
    ],
    column=M.O2,
    row=M.NO2,
    value=M.H2SO4,
    molecules={x.value: MOLECULE_TEXT[x] for x in Molecule.__members__.values()},
    reactions={x.index: str(x) for x in REACTIONS},
)


@app.get("/api/form_config")
async def get_config() -> FormConfig:
    return FORM_CONFIG


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


class PipeInputs(BaseModel):
    inner_diameter: Annotated[float, Field(alias="innerDiameter")]
    drop_out_length: Annotated[float, Field(alias="dropOutLength")]
    flowrate: float


class RunMatrix(BaseModel):
    row: Molecule = Field(alias="rowValue")
    column: Molecule = Field(alias="columnValue")
    value: str = Field(alias="valueValue")
    inputs: dict[Molecule, float]
    pipe_inputs: dict[str, float] = Field(default_factory=dict, alias="pipeInputs")


@app.post("/api/run_matrix")
async def run_matrix(data: RunMatrix) -> dict[str, Any]:
    xrange = np.arange(0.5, 10.5, 0.5)
    yrange = np.arange(0.5, 10.5, 0.5)
    values = np.empty(shape=(len(yrange), len(xrange)), dtype=np.float64)

    value_key: Molecule | str = data.value
    for m in Molecule.__members__.values():
        if m.value == data.value:
            value_key = m
            break

    initial_concentrations = {**{m: 0.0 for m in M.__members__.values()}, **data.inputs}

    results: list[list[Result]] = []
    for yindex, yvalue in enumerate(yrange):
        results.append([])
        for xindex, xvalue in enumerate(xrange):
            result = run_model_sm1(
                {**initial_concentrations, data.row: yvalue, data.column: xvalue}
            )
            results[yindex].append(result)

            if isinstance(value_key, Molecule):
                values[yindex, xindex] = result.final[value_key]
            else:
                area = surface_area(
                    data.pipe_inputs["inner_diameter"],
                    data.pipe_inputs["drop_out_length"],
                )
                flowrate = data.pipe_inputs["flowrate"]

                h2so4_corrosion = corrosion_rate_H2SO4(
                    area, flowrate, result.final[M.H2SO4]
                )
                hno3_corrosion = corrosion_rate_HNO3(
                    area, flowrate, result.final[M.HNO3]
                )
                corrosion_rate = h2so4_corrosion + hno3_corrosion

                values[yindex, xindex] = {
                    "H2SO4_corrision": h2so4_corrosion,
                    "HNO3_corrosion": hno3_corrosion,
                    "corrosion_rate": corrosion_rate,
                }[value_key]

            results[yindex].append(result)

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
