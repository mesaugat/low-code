import * as d3 from 'd3';
import useSWR from 'swr';
import { useState } from 'react';

import Header from './Header';
import Dropdown from './Dropdown';
import D3TreeMap from './D3TreeMap';
import Suggestion from './Suggestion';

const API_ENDPOINT = 'https://qsyjt1qvn9.execute-api.us-east-1.amazonaws.com/dev/evaluate';

const App = () => {
  const fetcher = (url) => fetch(url).then((res) => res.json());

  const queryParameters = new URLSearchParams(window.location.search);
  const searchParamRepoUrl = queryParameters.get('repo_url');
  const searchParamTimePeriod = queryParameters.get('time_period') || '';

  const [repoUrl, setRepoUrl] = useState(searchParamRepoUrl);
  const [user, setUser] = useState('');
  const [metric, setMetric] = useState('');
  const [timePeriod, setTimePeriod] = useState(searchParamTimePeriod);

  const { data, error, isLoading } = useSWR(
    `${API_ENDPOINT}?repo_url=${repoUrl}&user=${user}&metrics=${metric}&time_period=${timePeriod}`,
    fetcher,
  );

  if (!repoUrl) return <NoRepo />;

  if (error) return <Error />;
  if (isLoading) return <Loading />;

  return (
    <div className="p-8">
      <Header title="LowCode Visualizer" />
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
            <Dropdown name="Metrics" items={['Time Spent', 'Edits']} onClick={setMetric} />
            <Dropdown name="Users" items={data.users} onClick={setUser} />
          </div>
          <div className="mt-4">
            <D3TreeMap data={data.graph} tile={d3.treemapSquarify} />
          </div>
        </div>
        <div className="w-1/4">
          <Suggestion />
        </div>
      </div>
    </div>
  );
};

const Error = () => {
  return (
    <div className="grid">
      <p>Error loading data!</p>
    </div>
  );
};

const Loading = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="animate-pulse">Loading...</p>
    </div>
  );
};

const NoRepo = () => {
  return (
    <div className="grid">
      <p>There&apos;s nothing low about you!</p>
    </div>
  );
};

export default App;
