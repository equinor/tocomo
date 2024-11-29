from fastapi.testclient import TestClient

from co2specdemo_backend.app import app
from co2specdemo_backend.authentication import authenticated_user_claims


def override_authenticated_user_claims():
    return {
        "oid": "the_oid",
        "upn": "theauthenticateduser@equinor.com",
        "roles": [],
    }


app.dependency_overrides[authenticated_user_claims] = override_authenticated_user_claims


def test_root_should_redirect_to_docs():
    test_client = TestClient(app)
    response = test_client.get("/", follow_redirects=False)
    print(response.content)
    assert response.status_code == 307
    assert response.headers["Location"] == "/docs"


def test_run_reaction():
    test_client = TestClient(app)
    input_concentrations = {
        "h2o": 1,
        "o2": 2,
        "so2": 3,
        "no2": 4,
        "h2s": 5,
        "no": 6,
        "h2so4": 0,
        "hno3": 0,
    }
    response = test_client.post(
        "/api/run_reaction",
        json=input_concentrations,
    )
    assert response.status_code == 200
    assert "initial" in response.json()
    assert response.json()["initial"] == input_concentrations
    assert "final" in response.json()
    assert "change" in response.json()
    assert response.json()["change"] == {
        key: response.json()["final"][key] - input_concentrations[key]
        for key in input_concentrations
    }


def test_run_matrix():
    test_client = TestClient(app)
    input_data = {
        "inputs": {"h2o": 30, "o2": 30, "so2": 10, "no2": 20, "h2s": 0},
        "pipeInputs": {"inner_diameter": 30, "drop_out_length": 1000, "flowrate": 20},
        "columnValue": "o2",
        "rowValue": "no2",
        "valueValue": "h2so4",
    }

    response = test_client.post(
        "/api/run_matrix",
        json=input_data,
    )
    assert response.status_code == 200
    assert "plot" in response.json()
    assert "layout" in response.json()
    assert "resultData" in response.json()
