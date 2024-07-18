from __future__ import annotations
from typing import Any, TypedDict

from fastapi import FastAPI
from pydantic import BaseModel
import itertools
import pandas as pd
from reactions import run_model_sm1
from corrosion_calc import surface_area, corrosion_rate_HNO3, corrosion_rate_H2SO4
from fastapi.middleware.cors import CORSMiddleware
import seaborn as sns
import matplotlib.pyplot as plt
from io import BytesIO


from fastapi.responses import StreamingResponse

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://co2spec.playground.radix.equinor.com",
    "https://frontend-c2d2-web-portal-test-dev.playground.radix.equinor.com",
]


class DefaultComponents(BaseModel):
    inputs: dict[str, float]
    outputs: list[str]


COMPOUNDS = DefaultComponents(
    inputs={
        "H2O": 30.0,
        "O2": 30.0,
        "SO2": 10.0,
        "NO2": 20.0,
        "H2S": 0.0,
    },
    outputs=[
        "H2SO4",
        "HNO3",
        "NO",
        "HNO2",
        "S8",
    ],
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
def wrap_runmodel(argument):
    concentrations = argument.to_dict()
    concentrations["NO"] = 0
    concentrations["H2SO4"] = 0
    concentrations["HNO3"] = 0
    run_model_sm1(concentrations)
    argument["H2SO4"] = concentrations["H2SO4"]
    argument["HNO3"] = concentrations["HNO3"]

    return argument


# This is a helper function we use to apply over our data frame. Should not be edited
def wrap_corrosion_calc(argument):
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


def construct_df(
    row: str,
    column: str,
    values,
    concentrations: dict[str, float],
    parameters: dict[str, float],
):
    axes = [column, row]
    indices = [(i / 2) + 0.5 for i in range(20)]

    result = pd.DataFrame(
        itertools.product(indices, repeat=len(axes)), columns=axes
    )

    for key, val in {**concentrations, **parameters}.items():
        if key in axes:
            continue
        result[key] = val

    result = result.apply(wrap_runmodel, axis=1)
    result = result.apply(wrap_corrosion_calc, axis=1)

    # The index parameter is used as the "vertical" axis, while the column parameter is the "horizontal" axis
    plot_df = result.pivot_table(index=row, columns=column, values=values)
    return plot_df


@app.get("/api/export_csv")
async def export_csv(
    row: str,
    column: str,
    values: str,
    concentrations: dict[str, float],
    parameters: dict[str, float],
):
    plot_df = construct_df(
        row,
        column,
        values,
        concentrations,
        parameters,
    )
    return plot_df.to_csv()


@app.get("/api/run_matrix")
async def run_matrix(
    row: str,
    column: str,
    values: str,
    concentrations: dict[str, float],
    parameters: dict[str, float],
):
    plot_df = construct_df(
        row,
        column,
        values,
        concentrations,
        parameters,
    )

    # Specify size for the final figure here
    fig, ax = plt.subplots(figsize=(12, 7))

    sns.heatmap(plot_df, annot=True, ax=ax, cmap="YlOrBr", cbar=True)
    ax.xaxis.tick_top()
    ax.xaxis.set_label_position('top')
    ax.set_yticklabels(ax.get_yticklabels(), rotation=0)

    cbar = ax.collections[0].colorbar
    cbar.ax.set_title(values, loc='center')

    # Save the Seaborn plot to a BytesIO object
    img = BytesIO()
    plt.savefig(img, format="svg")
    plt.close()
    img.seek(0)
    return StreamingResponse(img, media_type="image/svg+xml")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5005)
