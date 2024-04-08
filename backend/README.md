# Backend

The backend of our application is designed to handle data processing and storage.
It utilizes AWS Lambda and API Gateway to provide a serverless architecture, ensuring scalability and performance.

## AWS Lambda

[AWS Lambda](https://aws.amazon.com/lambda/) is used to run our serverless functions. These functions are triggered by events, such as a user making a request to our API. The functions handle tasks such as parsing incoming data, interacting with our database, and returning responses to the client.

## API Gateway

[API Gateway](https://aws.amazon.com/api-gateway/) is used to create, deploy, and manage our APIs. It handles all the tasks involved in accepting and processing concurrent API calls, including traffic management, authorization and access control, monitoring, and API version management.

## Endpoints

- `/ingest`: Ingest the payload_json obtained from VSCode to Clickhouse

- `/evaluate`: Evaluate the Clickhouse records and sends to Frontend

- `/run-ai`: Sends data to AI prompt to get insights of the data in Clickhouse. And record the insights in Clickhouse.
