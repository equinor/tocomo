# given in  g/mol
H2O_MOL_WEIGHT = 18
FE_MOL_WEIGHT = 56
CO2_MOL_WEIGHT = 44
H2SO4_MOL_WEIGHT = 98
HNO3_MOL_WEIGHT = 63.01

# given in g/cm3
FE_DENSITY_S = 7.87

import math


def surface_area(inner_diameter, drop_out_length):
    # inner diameter in inch
    # drop out length in m
    # returns  cm2
    return math.pi * inner_diameter * 2.54 * drop_out_length * 100


def corrosion_rate(rate, surface_area):
    # rate is given in cm3/hour
    # surface area is given in cm2
    # returns mm/year
    return rate * 8760 * 10 / surface_area


def convert_iron_rate(mol_rate):
    # rate given in mol/hour
    # returns cm3/hour
    return mol_rate * FE_MOL_WEIGHT / FE_DENSITY_S


def corrosion_rate_H2SO4(surface_area, flowrate, molar_rate_H2SO4):
    """
    inner surface_area of pipeline
    flowrate of CO2 given in Millon tonnes per year MT/Y
    returns corrosion rate in millimeter per year
    """
    flowrate = flowrate * 10**6 / (24 * 365)  # ton/hour
    carbon_concentration = H2SO4_MOL_WEIGHT / CO2_MOL_WEIGHT * molar_rate_H2SO4  # mg/kg

    carbon_flowrate = carbon_concentration * flowrate  # g/hour

    sulfuric_acid_rate = carbon_flowrate / H2SO4_MOL_WEIGHT

    iron_rate = sulfuric_acid_rate  # (mol/hour)
    iron_rate = convert_iron_rate(iron_rate)  # cm3/hour

    corr_rate = corrosion_rate(iron_rate, surface_area)
    return corr_rate


def corrosion_rate_HNO3(surface_area, flowrate, molar_rate_HNO3):
    """
    inner surface_area of pipeline
    flowrate of CO2 given in Millon tonnes per year MT/Y
    returns corrosion rate in millimeter per year
    """
    flowrate = flowrate * 10**6 / (24 * 365)  # ton/hour
    carbon_concentration = HNO3_MOL_WEIGHT / CO2_MOL_WEIGHT * molar_rate_HNO3  # mg/kg

    carbon_flowrate = carbon_concentration * flowrate  # g/hour

    nitric_acid_rate = carbon_flowrate / HNO3_MOL_WEIGHT

    iron_rate = nitric_acid_rate  # (mol/hour)
    iron_rate = convert_iron_rate(iron_rate)  # cm3/hour

    corr_rate = corrosion_rate(iron_rate, surface_area) / 6
    return corr_rate
