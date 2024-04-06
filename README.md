# low-code

This project is a low-code VSCode extension and visualizer built with React, D3, Python and ClickHouse. It visualizes data in a treemap format, allowing users to understand the structure and distribution of code updates at a glance.

Visualizer Demo URL: https://d1qz38fr588bqj.cloudfront.net/?repo_url=github.com/mesaugat/low-code.git

# Things we've built

- VS Code Extension: The extension captures change data from the user's codebase and sends it to the backend for processing.

- Backend: The backend is written in Python and utilizes AWS Lambda, API gateway and ClickHouse installed in an EC2 instance using Terraform. The ingestion process involves parsing the change data and storing it in ClickHouse. The backend also provides an API to query the data through AWS API Gateway. The backend also uses AWS Bedrock to analyze the event data and generate insights using Mistral Large.

- Frontend: The frontend is built with React and D3. It fetches the data from the backend and visualizes it in a treemap format. It shows how much time has been spent in the codebase by different users. The treemap is interactive and you can filter by time spent, number of edits and user.
