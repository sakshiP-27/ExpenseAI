import base64
import json
import requests
from io import BytesIO
import openai
from PIL import Image
from mindee import (
    ClientV2,
    InferenceParameters,
    InferenceResponse,
    BytesInput
)

class ProcessReceipts:
    def __init__(self, ocrApiKey, modelId, openAiApiKey):
        self.ocrApiKey = ocrApiKey
        self.openAiApiKey = openAiApiKey
        self.ocrClient = ClientV2(self.ocrApiKey)
        self.modelId = modelId

    def convertImageToData(self, image: str, currency: str) -> dict:
        # Creating the image from the bytes sent by the backend
        imageBytes = base64.b64decode(image)
        pilImage = Image.open(BytesIO(imageBytes))

        # TODO: Write the logic to extract data from the receipt image using Tessaract OCV and send back to the backend
        
        # Send the response back to the backend
        receiptData: dict = {}
        return receiptData
