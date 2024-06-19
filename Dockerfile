from python:3.11-slim


COPY backend app

RUN pip install fastapi

WORKDIR /app

USER 1001

CMD [ "fastapi", "run","--port", "5005", "main.py"]
