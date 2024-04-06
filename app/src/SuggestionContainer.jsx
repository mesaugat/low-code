import React from 'react';
import Suggestion from './Suggestion';
import { Typewriter } from 'react-simple-typewriter';

const demoText = `Question: Does the data indicate the tests are well maintained?

Answer: Yes, the data indicates that the tests are well maintained. This is evident from the fact that many test files have a significant amount of time spent on them, indicating that they are being regularly updated and maintained. For example, the file 'packages/react-dom/src/__tests__/ReactLegacyUpdates-test.js' has 4 minutes spent on it, and 'packages/react-dom/src/__tests__/ReactDeprecationWarnings-test.js' has 3 minutes spent on it.

Question: What are some of the files that indicated poorly defined ownership?
Answer: List of files:
- 'packages/react-server/src/ReactServerStreamConfigBrowser.js
- 'packages/react/src/ReactAct.js'
- 'packages/react-test-renderer/shallow.js'
- 'packages/react/src/__tests__/ReactProfiler-test.internal.js'
- 'packages/react-server-dom-turbopack/package.json'

These files have only 1 minute spent on them, indicating that they may not be regularly maintained or owned by a specific developer.

Question: What are some of the areas in the code that indicates knowledge gaps?
Answer: List of files:
- 'packages/react-reconciler/src/__tests__/ReactSuspensePlaceholder-test.internal.js'
- 'packages/react/src/__tests__/forwardRef-test.js'
- 'packages/react-dom/src/shared/ReactDOMFloat.js'
- 'packages/react-dom/src/__tests__/ReactDOMServerIntegrationNewContext-test.js'
- 'packages/react-server/src/ReactFlightServerConfigBundlerCustom.js'

These files also have only 1 minute spent on them, which could indicate that the developers may not be fully familiar with these areas of the code, or that these areas are not a current priority.

Question: Does the data indicate the documentation files are well maintained?
Answer: No, the data does not provide clear evidence that the documentation files are well maintained. While some documentation files do have time spent on them, such as 'ReactVersions.js' and 'packages/react-dom/npm/server.node.js', many other documentation files are not listed in the data. This could indicate that they are not being regularly updated or maintained. However, without a complete list of all documentation files, it's difficult to make a definitive conclusion.`;

const IS_DEMO = true;

const SuggestionContainer = (props) => {
  return (
    <div>
      <div className="whitespace-pre-line">
        {IS_DEMO ? <Typewriter words={[demoText]} typeSpeed={10} /> : <Suggestion {...props} />}
      </div>
    </div>
  );
};

export default SuggestionContainer;
