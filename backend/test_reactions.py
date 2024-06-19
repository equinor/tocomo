from reactions import can_react, parse_reaction_string


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
