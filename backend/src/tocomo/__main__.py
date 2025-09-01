import uvicorn

if __name__ == "__main__":
    uvicorn.run("tocomo.app:app", host="localhost", port=5005, reload=True)
