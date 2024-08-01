import pytest
from co2specdemo_backend.reactions import (
    M,
    Reaction,
    run_model_sm1,
)
from co2specdemo_backend.corrosion_calc import (
    convert_iron_rate,
    corrosion_rate,
    H2SO4_MOL_WEIGHT,
    CO2_MOL_WEIGHT,
    corrosion_rate_H2SO4,
    corrosion_rate_HNO3,
    surface_area,
)


def test_react():
    reaction = Reaction(index=0, lhs=[(2, M.NO), (1, M.O2)], rhs=[(2, M.NO2)])
    concentrations = {M.NO: 4.0, M.O2: 2.0}
    assert reaction.do(concentrations) == 2


def test_react_simple():
    concentrations = {
        M.H2O: 30,
        M.O2: 10,
        M.SO2: 0,
        M.NO2: 1.5,
        M.H2S: 3,
        M.H2SO4: 0,
        M.HNO3: 0,
        M.NO: 0,
    }
    reaction = Reaction(
        index=3,
        lhs=[(1, M.H2S), (3, M.NO2)],
        rhs=[(1, M.SO2), (1, M.H2O), (3, M.NO)],
    )
    assert reaction.do(concentrations) == 0.5


def test_corrosion_rate():
    inner_diameter = 36  # inch
    acid_drop_out_length = 1000  # m
    molar_rate_H2SO4 = 3
    flowrate = 20  # MT/Y
    flowrate = flowrate * 10**6 / (24 * 365)  # ton/hour
    carbon_concentration = H2SO4_MOL_WEIGHT / CO2_MOL_WEIGHT * molar_rate_H2SO4  # mg/kg
    assert carbon_concentration == pytest.approx(6.6818182)

    carbon_flowrate = carbon_concentration * flowrate  # g/hour
    assert carbon_flowrate == pytest.approx(15255.2926526)

    sulfuric_acid_rate = carbon_flowrate / H2SO4_MOL_WEIGHT
    assert sulfuric_acid_rate == pytest.approx(155.666252)  # mol/hour

    iron_rate = sulfuric_acid_rate  # (mol/hour)
    iron_rate = convert_iron_rate(iron_rate)  # cm3/hour
    assert iron_rate == pytest.approx(1107.663)

    area = surface_area(inner_diameter, acid_drop_out_length)
    assert area == pytest.approx(28726723.22)
    corr_rate = corrosion_rate(iron_rate, area)
    assert corr_rate == pytest.approx(3.3777366)


def test_corrosion_rate_H2SO4():
    area = surface_area(inner_diameter=36, drop_out_length=1000)
    assert corrosion_rate_H2SO4(
        surface_area=area, flowrate=20, molar_rate_H2SO4=3
    ) == pytest.approx(3.3777366)


def test_corrosion_rate_HNO3():
    area = surface_area(inner_diameter=36, drop_out_length=1000)
    assert corrosion_rate_HNO3(
        surface_area=area, flowrate=20, molar_rate_HNO3=4
    ) == pytest.approx(0.75060813)


def normalize(concentrations):
    """Round all values concentrations to 1 decimal precision."""
    for k, v in concentrations.items():
        concentrations[k] = round(v, 1)
    return concentrations


@pytest.mark.parametrize(
    "initial,expected",
    [
        pytest.param(
            {
                M.H2O: 40,
                M.O2: 15,
                M.SO2: 0,
                M.NO2: 15,
                M.H2S: 3,
                M.H2SO4: 0,
                M.HNO3: 0,
                M.NO: 0,
                M.HNO2: 0,
                M.S8: 0,
            },
            {
                M.H2O: 32.5,
                M.O2: 5.3,
                M.SO2: 0.0,
                M.NO2: 0.0,
                M.H2S: 0.0,
                M.H2SO4: 3.0,
                M.HNO3: 15.0,
                M.NO: 0.0,
                M.HNO2: 0,
                M.S8: 0,
            },
        ),
        pytest.param(
            {
                M.H2O: 20,
                M.O2: 15,
                M.SO2: 0,
                M.NO2: 15,
                M.H2S: 3,
                M.H2SO4: 0,
                M.HNO3: 0,
                M.NO: 0,
                M.HNO2: 0,
                M.S8: 0,
            },
            {
                M.H2O: 12.5,
                M.O2: 5.3,
                M.SO2: 0.0,
                M.NO2: 0.0,
                M.H2S: 0.0,
                M.H2SO4: 3.0,
                M.HNO3: 15.0,
                M.NO: 0.0,
                M.HNO2: 0,
                M.S8: 0,
            },
        ),
        pytest.param(
            {
                M.H2O: 20,
                M.O2: 5,
                M.SO2: 0,
                M.NO2: 8,
                M.H2S: 3,
                M.H2SO4: 0,
                M.HNO3: 0,
                M.NO: 0,
                M.HNO2: 0,
                M.S8: 0,
            },
            {
                M.H2O: 18.0,
                M.O2: 0.0,
                M.SO2: 0.0,
                M.NO2: 0.0,
                M.H2S: 0.0,
                M.H2SO4: 3.0,
                M.HNO3: 4.0,
                M.NO: 4.0,
                M.HNO2: 0,
                M.S8: 0,
            },
        ),
        pytest.param(
            {
                M.H2O: 20,
                M.O2: 5,
                M.SO2: 0,
                M.NO2: 8,
                M.H2S: 7,
                M.H2SO4: 0,
                M.HNO3: 0,
                M.NO: 0,
                M.HNO2: 0,
                M.S8: 0,
            },
            {
                M.H2O: 26.0,
                M.O2: 0.0,
                M.SO2: 6.0,
                M.NO2: 0.0,
                M.H2S: 1.0,
                M.H2SO4: 0.0,
                M.HNO3: 0.0,
                M.NO: 8.0,
                M.HNO2: 0,
                M.S8: 0,
            },
        ),
    ],
)
def test_run_model_sm1_cases(initial, expected):
    run_model_sm1(initial)
    assert normalize(initial) == normalize(expected)
