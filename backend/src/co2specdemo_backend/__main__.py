import uvicorn

if __name__ == "__main__":
    uvicorn.run("co2specdemo_backend.app:app", host="localhost", port=5005, reload=True)
