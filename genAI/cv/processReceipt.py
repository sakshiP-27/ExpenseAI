import base64
from io import BytesIO
import json
from PIL import Image
import pytesseract
import requests

class ProcessReceipts:
    def __init__(self):
        pass

    def convertImageToData(self, image: str, currency: str) -> dict:
        # Creating the image from the bytes sent by the backend
        imageBytes = base64.b64decode(image)
        pilImage = Image.open(BytesIO(imageBytes))

        # TODO: Write the logic to extract data from the receipt image using Tessaract OCV and send back to the backend
        
        # Send the response back to the backend
        receiptData: dict = {}
        return receiptData
