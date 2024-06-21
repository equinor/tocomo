from python:3.11-slim


COPY . app

RUN pip install fastapi

WORKDIR /app

USER 1001

EXPOSE 5005

CMD [ "python", "main.py"]