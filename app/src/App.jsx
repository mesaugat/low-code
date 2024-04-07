import * as d3 from 'd3';
import useSWR from 'swr';
import React, { useState } from 'react';

import Header from './Header';
import Dropdown from './Dropdown';
import D3TreeMap from './D3TreeMap';
import { DropdownPreloader, TreeMapLoading } from './Preloaders';
import SuggestionContainer from './SuggestionContainer';

const API_ENDPOINT = 'https://qsyjt1qvn9.execute-api.us-east-1.amazonaws.com/dev/evaluate';

const App = () => {
  const fetcher = async (url) => {
    const res = await fetch(url);

    // If the status code is not in the range 200-299,
    // we still try to parse and throw it.
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      // Attach extra info to the error object.
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }

    return res.json();
  };

  const queryParameters = new URLSearchParams(window.location.search);
  const searchParamRepoUrl = queryParameters.get('repo_url');
  const searchParamTimePeriod = queryParameters.get('time_period') || '';
  const searchBasePath = queryParameters.get('base_path') || '';

  const [repoUrl, _setRepoUrl] = useState(searchParamRepoUrl);
  const [user, setUser] = useState('');
  const [metric, setMetric] = useState('');
  const [timePeriod, _setTimePeriod] = useState(searchParamTimePeriod);
  const [basePath, _setBasePath] = useState(searchBasePath);

  const { data, error, isLoading } = useSWR(
    `${API_ENDPOINT}?repo_url=${repoUrl}&user=${user}&metrics=${metric === 'Edits' ? 'edits' : 'time_spent'}&time_period=${timePeriod}&base_path=${basePath}`,
    fetcher,
  );

  if (!repoUrl) return <NoRepo />;

  if (error) return <Error />;

  const getTreeMap = () => {
    if (isLoading) {
      return <TreeMapLoading />;
    }

    return <>{data && data.graph ? <D3TreeMap data={data.graph} tile={d3.treemapSquarify} /> : null}</>;
  };

  return (
    <div className="p-8">
      <Header title="LowCode Visualizer" repo_url={repoUrl} />
      <div className="flex gap-x-2 mt-4">
        <div className="flex-1">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                />
              </svg>
            </div>

            {isLoading ? (
              <DropdownPreloader />
            ) : (
              <Dropdown name="Metrics" items={['Time Spent', 'Edits']} onClick={setMetric} />
            )}
            {isLoading ? <DropdownPreloader /> : <Dropdown name="Users" items={data.users} onClick={setUser} />}
          </div>
          <div className="mt-4">{getTreeMap()}</div>
        </div>
        <div className="w-1/3">
          <SuggestionContainer repoUrl={repoUrl} />
        </div>
      </div>
    </div>
  );
};

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-xl">
      <p>Error loading data!</p>
    </div>
  );
};

const NoRepo = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-xl">
      <p>There&apos;s nothing low about you!</p>
      <p className="mt-4">
        <a
          href="/?repo_url=github.com/mesaugat/low-code.git"
          className="inline-block bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Go here!
        </a>
      </p>
    </div>
  );
};

export default App;
