import pytest
from reactions import can_react, parse_reaction_string
from corrosion_calc import (
    convert_iron_rate,
    corrosion_rate,
    H2SO4_MOL_WEIGHT,
    CO2_MOL_WEIGHT,
    corrosion_rate_H2SO4,
    corrosion_rate_HNO3,
    surface_area,
)


def test_parse_reaction_string():
    expected_reaction = {
        "eq": "2 H + O -> H2O",
        "coefficients": {"H2O": 1, "O": -1, "H": -2},
        "rate": 1.0,
        "id": 0,
    }

    assert parse_reaction_string({0: "2 H + O -> H2O"})[0] == expected_reaction


def test_can_react():
    # reaction = 2H + O -> H2O
    reaction = {"coefficients": {"H2O": 2, "O": -1, "H": -2}}
    concentrations = {"H": 4, "O": 2, "H2O": 0}
    assert can_react(concentrations, reaction) == 2


def test_can_react_simple():
    concentrations = {
        "H2O": 30,
        "O2": 10,
        "SO2": 0,
        "NO2": 1.5,
        "H2S": 3,
        "H2SO4": 0,
        "HNO3": 0,
        "NO": 0,
    }
    reaction_string = {
        1: "NO2 + SO2 + H2O -> NO + H2SO4",
        2: "2 NO + O2 -> 2 NO2",
        3: "H2S + 3 NO2 -> SO2 + H2O + 3 NO",
        4: "3 NO2 + H2O -> 2 HNO3 + NO",
    }
    reaction = parse_reaction_string(reaction_string)
    assert can_react(concentrations, reaction[3]) == 0.5


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
