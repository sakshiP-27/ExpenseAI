## Upcoming performace fixes & features:

1. **DONE** **Receipt Duplication** [Performance]: Here if a user uploads a duplicate receipt basically a receipt which is already uploaded before then we should directly show the data we have stored in the DB for previous receipt and should not do processing for it again. This can be be done simply by preparing the MD5/SHA encoding of the image and storing it and whenever a new receipt is uplaoded we check if the hash matches any existing record.

2. **DONE** **Retry Logic** [Performance]: If for some reason OCR / LLMs fail with an error response then we should add a retry logic where the service tries to retry calling the API thrice before returning error response to the backend and then to frontend showing the user the services are temporarily down.

3. **Confidence Score** [Performance]: We're receiving the confidence scores in the response of the OCR, we should make sure if the OCR confidence_score are above certain threshold value only then we do the further processing otherwise ask the user on the frontend to upload better quality image.

4. **ML & Analytics** [Feature]: For the current analytics we should add another layer where we compare the spending of the current week vs the past week, current month vs the past month. Similarly also add a ML model predicting the users spending for the coming month.

5. **Usopp (Notification Service)** [NewService]: Build a dedicated event-driven microservice to handle outbound communication (e.g., weekly/monthly expense summary emails, budget limits/alerts). This service will integrate via message broker or webhooks.

6. **Implement OAuth** [Feature]: Implement OAuth using Google SSO for the users that don't want to create an account using email and password.