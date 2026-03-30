"""
Quick test script for receipt OCR extraction.
Fill in the variables below and run: python testReceipt.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from PIL import Image
from io import BytesIO
from mindee import ClientV2, InferenceParameters, InferenceResponse, BytesInput

OCR_API_KEY="md_smFOeVJ6XaFRClmReATP94V_j-DuW7Xka0GJTH16S1A"
MODEL_ID="c753cb76-c9e7-44e4-8fc3-44963d50c31c"
IMAGE_PATH = ""

def extract_receipt_data():
    if not OCR_API_KEY or not MODEL_ID or not IMAGE_PATH:
        print("Error: Fill in OCR_API_KEY, MODEL_ID, and IMAGE_PATH at the top of the file.")
        sys.exit(1)

    # Read the image
    with open(IMAGE_PATH, "rb") as f:
        image_bytes = f.read()

    pil_image = Image.open(BytesIO(image_bytes))
    extension = (pil_image.format or "jpg").lower()

    # Set up Mindee OCR
    client = ClientV2(OCR_API_KEY)
    params = InferenceParameters(
        model_id=MODEL_ID,
        rag=None,
        raw_text=None,
        polygon=None,
        confidence=True,
    )
    input_source = BytesInput(image_bytes, filename=f"receipt.{extension}")

    print(f"Processing: {IMAGE_PATH}\n")
    result = client.enqueue_and_get_result(InferenceResponse, input_source, params)

    # Extract fields
    fields = result.inference.result.fields
    merchant_name = fields.get("supplier_name").value
    date = fields.get("date").value
    total_amount = fields.get("total_amount").value
    currency = fields["locale"].fields["currency"].value

    # Print receipt info
    print("=" * 40)
    print(f"Merchant : {merchant_name}")
    print(f"Date     : {date}")
    print(f"Total    : {total_amount} {currency}")
    print("=" * 40)

    # Print items
    items = fields.get("line_items").items
    if items:
        print(f"\n{'Item':<30} {'Qty':>5} {'Price':>10}")
        print("-" * 47)
        for item in items:
            item_fields = item.fields
            name = item_fields["description"].value or "N/A"
            qty = item_fields["quantity"].value or "-"
            price = item_fields["total_price"].value or "-"
            print(f"{name:<30} {str(qty):>5} {str(price):>10}")
    else:
        print("\nNo line items found.")

    print()


if __name__ == "__main__":
    extract_receipt_data()