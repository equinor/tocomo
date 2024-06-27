# CO<sub>2</sub>specdemo

The CO<sub>2</sub> specification demo was made to simplify calculations of
chemical reactions, specifically when CO<sub>2</sub> is mixed with water
together with other reactants. The following reactions take place:

```
  1: NO2 + SO2 + H2O -> NO + H2SO4
  2: 2 NO + O2 -> 2 NO2
  3: H2S + 3 NO2 -> SO2 + H2O + 3 NO
  4: 3 NO2 + H2O -> 2 HNO3 + NO
```

The Pseudo algorithm use:

```
loop until no more reactions possible:
  do reaction 3 if possible
  else do reaction 2 if possible
  else do reaction 1 if possible
  else do reaction 4 if possible
  else stop the loop
```

## Developers

The application consist of a frontend in React and a backend in Python. Each
component contains a Dockerfile to build them, although they can also be build
natively (instructions follow). In addition a docker compose file is available
to set up the entire application in one step.

### Backend

The calculations are implemented in python and served through a web api using
fastapi.

In order to start the backend, create a python environment and do then following

```bash
cd backend
pip install fastapi
uvicorn main:app --port 5005
```

Include `--reload` to have the backend rebuild on changes. It is also possible
to start the backend using the Dockerfile:

```bash
docker build -t backend_image .
docker run -t backend_image --p 5005:5005
```

Go to <http://127.0.0.1:5005/docs> in your browser to see the swagger page for the
backend

### Frontend

The frontend is written in react. In order to start the frontend do the
following:

```bash
cd frontend
npm install
npm run dev
```

It is also possible to start the backend using the Dockerfile:

```bash
docker build -t frontend_image .
docker run -t frontend_image --p 3000:3000
```

Navigate to <http://localhost:3000> in your browser to see the frontend. Given
that the backend exists it should now be possible to insert numbers and click
the run reactions button

### Docker compose

The docker compose file builds and starts both frontend and backend.
