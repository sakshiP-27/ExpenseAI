from pydantic import BaseModel


# Request models
class UserContext(BaseModel):
    currency: str
    country: str


class UploadReceiptRequest(BaseModel):
    image: str  # base64 encoded image
    userContext: UserContext


class ReceiptItem(BaseModel):
    name: str
    price: float
    quantity: int = 1
    category: str


class UserReceipt(BaseModel):
    merchant: str
    date: str
    totalAmount: float
    items: list[ReceiptItem]


class GetAnalyticsRequest(BaseModel):
    userID: str
    currency: str
    period: str
    receipts: list[UserReceipt]


class UploadReceiptResponse(BaseModel):
    merchant: str
    date: str
    totalAmount: float
    currency: str
    items: list[ReceiptItem]
    confidenceScore: float

class CategoryItem(BaseModel):
    category: str
    amount: float

class DailySpending(BaseModel):
    date: str
    amount: float

class GetAnalyticsResponse(BaseModel):
    totalAmount: float
    categoryBreakdown: list[CategoryItem]
    dailySpending: list[DailySpending]