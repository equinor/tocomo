from fastapi import FastAPI
import itertools
import pandas as pd
from reactions import run_model_sm1, parse_reaction_string
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


@app.get("/api/hello")
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


@app.get("/api/run_reactions")
async def run_reactions(
    H2O: float = 0,
    O2: float = 0,
    SO2: float = 0,
    NO2: float = 0,
    H2S: float = 0,
    H2SO4: float = 0,
    HNO3: float = 0,
    NO: float = 0,
    HNO2: float = 0,
    S8: float = 0,
):
    concentrations = {
        "H2O": H2O,
        "O2": O2,
        "SO2": SO2,
        "NO2": NO2,
        "H2S": H2S,
        "H2SO4": H2SO4,
        "HNO3": HNO3,
        "NO": NO,
        "HNO2": HNO2,
        "S8": S8,
    }
    run_model_sm1(concentrations, verbose=False)

    return concentrations


CHEMICALS = [
    "H2O",
    "O2",
    "SO2",
    "NO2",
    "H2S",
    "H2SO4",
    "HNO3",
    "NO",
    "HNO2",
    "S8",
]


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


def constract_df(
    row,
    column,
    values,
    H2O,
    O2,
    SO2,
    NO2,
    H2S,
    H2SO4,
    HNO3,
    NO,
    HNO2,
    S8,
    inner_diameter,
    drop_out_length,
    flowrate,
):
    constituents = [column, row]

    indices = [(i / 2) + 0.5 for i in range(20)]

    result = pd.DataFrame(
        itertools.product(indices, repeat=len(constituents)), columns=constituents
    )
    if "H2O" not in [row, column]:
        result["H2O"] = H2O
    if "O2" not in [row, column]:
        result["O2"] = O2
    if "SO2" not in [row, column]:
        result["SO2"] = SO2
    if "NO2" not in [row, column]:
        result["NO2"] = NO2
    if "H2S" not in [row, column]:
        result["H2S"] = H2S
    if "inner_diameter" not in [row, column]:
        result["inner_diameter"] = inner_diameter
    if "drop_out_length" not in [row, column]:
        result["drop_out_length"] = drop_out_length
    if "flowrate" not in [row, column]:
        result["flowrate"] = flowrate

    result = result.apply(wrap_runmodel, axis=1)
    result = result.apply(wrap_corrosion_calc, axis=1)

    # The index parameter is used as the "vertical" axis, while the column parameter is the "horizontal" axis
    plot_df = result.pivot_table(index=row, columns=column, values=values)
    return plot_df


@app.get("/api/export_csv")
async def export_csv(
    row: str = "",
    column: str = "",
    values: str = "",
    H2O: float = 0,
    O2: float = 0,
    SO2: float = 0,
    NO2: float = 0,
    H2S: float = 0,
    H2SO4: float = 0,
    HNO3: float = 0,
    NO: float = 0,
    HNO2: float = 0,
    S8: float = 0,
    inner_diameter: float = 0,
    drop_out_length: float = 0,
    flowrate: float = 0,
):
    plot_df = constract_df(
        row,
        column,
        values,
        H2O,
        O2,
        SO2,
        NO2,
        H2S,
        H2SO4,
        HNO3,
        NO,
        HNO2,
        S8,
        inner_diameter,
        drop_out_length,
        flowrate,
    )
    return plot_df.to_csv()


@app.get("/api/run_matrix")
async def run_matrix(
    row: str = "",
    column: str = "",
    values: str = "",
    H2O: float = 0,
    O2: float = 0,
    SO2: float = 0,
    NO2: float = 0,
    H2S: float = 0,
    H2SO4: float = 0,
    HNO3: float = 0,
    NO: float = 0,
    HNO2: float = 0,
    S8: float = 0,
    inner_diameter: float = 0,
    drop_out_length: float = 0,
    flowrate: float = 0,
):
    plot_df = constract_df(
        row,
        column,
        values,
        H2O,
        O2,
        SO2,
        NO2,
        H2S,
        H2SO4,
        HNO3,
        NO,
        HNO2,
        S8,
        inner_diameter,
        drop_out_length,
        flowrate,
    )

    # Specify size for the final figure here
    fig, ax = plt.subplots(figsize=(12, 7))

    sns.heatmap(plot_df, annot=True, ax=ax, cmap="YlOrBr")
    ax.xaxis.tick_top()
    ax.xaxis.set_label_position('top')

    ax.set_yticklabels(ax.get_yticklabels(), rotation=0)

    # Save the Seaborn plot to a BytesIO object
    img = BytesIO()
    plt.savefig(img, format="svg")
    plt.close()
    img.seek(0)
    return StreamingResponse(img, media_type="image/svg+xml")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5005)
