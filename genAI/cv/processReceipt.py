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
    BytesInput,
    PathInput
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
        client = ClientV2(apiKey)
        params = InferenceParameters(
            model_id=  modelId, #
            rag = None,
            raw_text=  None,
            polygon= None,
            confidence= None
        )
        
        inputScore = PathInput(image)
        result = client.enqueue_and_get_result(
            InferenceResponse,
            inputScore,
            params
        )

        fields = result.inference.result.fields
        merchantName = fields.get("supplier_name").value
        date = fields.get("date").value
        totalAmount = fields.get("total_amount").value
        currencyCode = fields["locale"].fields["currency"].value

        print(f"Merchant Name: {merchantName}")
        print(f"Date: {date}")
        print(f"Total Amount: {totalAmount}")
        print(f"Currency Code: {currencyCode}")


        items = fields.get("line_items").items
        for item in items:
            itemFields    = item.fields
            description    = itemFields["description"].value
            quantity      = itemFields["quantity"].value
            price    = itemFields["total_price"].value
            print(f"Item Description: {description}, Quantity: {quantity}, Price: {price}")
        
        
        # Send the response back to the backend
        receiptData: dict = {}
        return receiptData

