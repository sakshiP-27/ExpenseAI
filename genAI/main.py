import logging
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from models.uploadModels import UploadReceiptRequest, UploadReceiptResponse
from configs.serverConfig import ServerConfig
from cv.processReceipt import ProcessReceipts

logger = logging.getLogger("genai")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

app = FastAPI()
config = ServerConfig()

print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("Starting the GenAI Service")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")


@app.get("/health")
def read_health():
    return {"message": "GenAI Service running"}


@app.post(config.GENAI_UPLOAD_API, response_model=UploadReceiptResponse)
def process_uploaded_receipt(request: UploadReceiptRequest):
    logger.info("Receipt upload request received | Currency=%s", request.userContext.currency)
    try:
        cvHandler = ProcessReceipts(config.OCR_API_KEY, config.MODEL_ID, config.GEMINI_API_KEY, config.GROQ_API_KEY, config.GEMINI_MODEL, config.GROQ_MODEL)
        receiptData = cvHandler.convertImageToData(request.image, request.userContext.currency)
        logger.info("Receipt processed successfully | Merchant=%s ItemCount=%d",
                     receiptData.get("merchant", "unknown"), len(receiptData.get("items", [])))
        return receiptData
    except Exception as e:
        logger.error("Receipt processing failed | Error=%s", str(e))
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.get(config.GENAI_GENERATE_SUMMARY_API)
def generate_llm_summary():
    # TODO: For later
    pass


@app.get(config.GENAI_GET_ANALYTICS_API)
def get_user_analytics():
    # TODO: For later
    pass
