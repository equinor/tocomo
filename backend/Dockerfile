from python:3.11-slim

COPY . app

RUN pip install fastapi
RUN pip install uvicorn
RUN pip install fastapi[all]
RUN pip install pandas matplotlib seaborn

WORKDIR /app

USER 1001

EXPOSE 5005

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5005", "--reload"]
