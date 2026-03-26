from fastapi import FastAPI

app = FastAPI()
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("Starting GenAI Service")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

@app.get("/health")
def read_health():
    return {"message": "GenAI Service running"}