from python:3.11-slim


COPY . app

RUN pip install fastapi
RUN pip install uvicorn
RUN pip install fastapi[all]

WORKDIR /app

USER 1001

EXPOSE 5005

CMD [ "python", "main.py"]