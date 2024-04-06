import React from 'react';
import Suggestion from './Suggestion';


const demoText = ` The JSON data provided contains information about a GitHub repository named 'low-code.git'. The repository has four main directories: 'extension', 'backend', 'app', and 'infra', as well as a few other files at the root level.

  1. The 'extension' directory primarily contains TypeScript files such as 'services.ts', 'extension.ts', 'request.ts', 'constants.ts', and 'commands.ts' under the 'src' subdirectory. It also contains 'package-lock.json' and 'package.json' files.
  
  2. The 'backend' directory contains Python files such as 'lambda-bedrock.py', 'json_maker.py', 'lambda-evaluate.py', 'lambda-ingest.py', and 'lambda-suggest.py'. It also has a 'requirements.txt' file.
  
  3. The 'app' directory contains 'Suggestion.tsx', 'Summary.tsx', 'App.jsx', and 'BotoSummary.tsx' files under the 'src' subdirectory.
  
  4. The 'infra' directory contains 'clickhouse.tf', 'apigateway.tf', and 'lambda.tf' files.
  
  5. At the root level, there are files like 'Untitled-1', 'asvetliakov.vscode-neovim.vscode-neovim', and 'README.md'. There is also a 'fake_payload_generator' directory containing a 'scrapper.js' file.
  
  Each file in the repository has an associated time value (in minutes) and a URL to its location in the GitHub repository. The users associated with the repository are 'Bhagwan Thapa', 'Saphall', 'pranavpudasaini', and 'silwalanish'.`;


const IS_DEMO = true;

const SuggestionContainer = (props) => {

  return (
    <div>
      <div className="whitespace-pre-line">
        { IS_DEMO ? demoText : <Suggestion {...props} />}
      </div>
    </div>
  )
};

export default SuggestionContainer;
