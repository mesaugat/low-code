### Prompt Example

```
user|file_name|time_spent_min|total_edits
Bhagwan Thapa|Suggestion.tsx|34.58333333333333|844
silwalanish|lambda-suggest.py|27.666666666666668|766
Bhagwan Thapa|Suggestion.jsx|29.349999999999998|586
Bhagwan Thapa|services.ts|29.43333333333333|524
Bhagwan Thapa|TreePreloader.tsx|25.866666666666667|513
Bhagwan Thapa|App.jsx|45.61666666666666|507
Saphall|lambda-suggest.py|19.75|379
Saphall|lambda-check-suggest.py|10.783333333333333|277
silwalanish|lambda-run-ai.py|2.716666666666667|248
Bhagwan Thapa|BotoSummary.tsx|5.283333333333333|235
Saugat Acharya|Header.jsx|9.25|221
Bhagwan Thapa|constants.ts|7.666666666666666|219
Bhagwan Thapa|SuggestionContainer.jsx|11.700000000000001|164
Saugat Acharya|D3TreeMap.jsx|18.2|141
Bhagwan Thapa|SuggestionContainer.tsx|2.5833333333333335|110
Bhagwan Thapa|package.json|22.666666666666668|93
silwalanish|scrapper.js|9.866666666666667|89
Bhagwan Thapa|Summary.tsx|0.75|81
pranavpudasaini|README.md|1.3166666666666667|59
Saphall|requirements.txt|0.25|58
Saphall|lambda-ingest.py|3.1|57
Saphall|lambda-evaluate.py|3.6833333333333336|51
Saphall|json_maker.py|0.08333333333333333|29
Bhagwan Thapa|tailwind.config.js|2.966666666666667|29
Bhagwan Thapa|types.ts|1.0833333333333333|28
Bhagwan Thapa|extension.ts|0.6333333333333334|23
Bhagwan Thapa|settings.json|9.566666666666666|18
Saugat Acharya|index.html|0.1|18
Saugat Acharya|Dropdown.jsx|8.15|17
silwalanish|response.json|7.866666666666667|14
Saphall|lambda.tf|0.2|13
Bhagwan Thapa|commands.ts|1.05|9
Saphall|clickhouse.tf|0.7666666666666667|9
Saphall|index.js|0.21666666666666667|6
Saphall|apigateway.tf|9.366666666666667|5
Bhagwan Thapa|input|1.8666666666666667|5
pranavpudasaini|package-lock.json|5.766666666666667|5
Bhagwan Thapa|Header.jsx|0.03333333333333333|4
Saphall|services.ts|0.016666666666666666|3
silwalanish|prompt.txt|0.03333333333333333|2
Saphall|constants.ts|0.016666666666666666|2
Saphall|vomica-tribuo-tabgo.json|1.0|1
Saphall|lambda-bedrock.py|1.0|1
pranavpudasaini|asvetliakov.vscode-neovim.vscode-neovim|1.0|1
Bhagwan Thapa|request.ts|1.0|1
Bhagwan Thapa|.prettierrc|1.0|1
silwalanish|lambda-evaluate.py|1.0|1
Bhagwan Thapa|Suggestion.tsx.git|1.0|1 
```
 
Here's the data of a code repository of each user's total time spent and edits per file.
Based on the data please answer the following questions with short description for each:
- Does the data indicate the tests are well maintained?
- What are some of the files that indicated poorly defined ownership?
- What are some of the areas in the code that indicates knowledge gaps?
- Does the data indicate the documentation files are well maintained?
- Is there any potential bottlenecks while merging? 

Please follow the following format while answering:
Question: Does the data indicate the tests are well maintained?
Answer: Yes or No. [Your reasoning]

Question: What are some of the files that indicated poorly defined ownership?
Answer: List of files:
- file1.txt
- path/to/file2.js

Question: What are some of the areas in the code that indicates knowledge gaps?
Answer: List of files:
- file10.txt
- unmaintained/path/fil1.txt

Question: Does the data indicate the documentation files are well maintained?
Answer: Yes or No. [Your reasoning.]

Question: Is there any potential bottlenecks while merging? 
Answer: user1 and user2 spent most time updating `filename`. They might face conflicts while merging which can increase merge times.

### AI Response

Question: Does the data indicate the tests are well maintained?
Answer: No. The data does not provide any information about test files or test coverage, so it's impossible to determine if the tests are well maintained based on this data alone.

Question: What are some of the files that indicated poorly defined ownership?
Answer: List of files:
- lambda-suggest.py (Both 'silwalanish' and 'Saphall' have made significant contributions)
- lambda-check-suggest.py (Only 'Saphall' has contributed, but with less time and edits compared to other files)

Question: What are some of the areas in the code that indicates knowledge gaps?
Answer: List of files:
- lambda-run-ai.py (Only 'silwalanish' has contributed with very less time and edits)
- D3TreeMap.jsx (Only 'Saugat Acharya' has contributed with less time compared to other files)

Question: Does the data indicate the documentation files are well maintained?
Answer: No. The data shows very little time spent on documentation files like 'README.md' and 'package-lock.json' compared to other files.

Question: Is there any potential bottlenecks while merging?
Answer: 'Bhagwan Thapa' has spent a significant amount of time on multiple files like 'Suggestion.tsx', 'services.ts', 'TreePreloader.tsx', 'App.jsx', etc. If other users also contribute to these files, there might be potential conflicts while merging which can increase merge times. Additionally, 'lambda-suggest.py' has significant contributions from both 'silwalanish' and 'Saphall', which could also lead to potential merge conflicts.
