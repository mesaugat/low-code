import * as d3 from 'd3';
import useSWR from 'swr';
import { useState } from 'react';

import Header from './Header';
import Dropdown from './Dropdown';
import D3TreeMap from './D3TreeMap';
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
    `${API_ENDPOINT}?repo_url=${repoUrl}&user=${user}&metrics=${metric}&time_period=${timePeriod}&base_path=${basePath}`,
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
            {data && data.graph ? <D3TreeMap data={data.graph} tile={d3.treemapSquarify} /> : null}
          </div>
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

const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <svg
        aria-hidden="true"
        class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-red-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  );
};

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-xl">
      <p className="animate-pulse">Loading...</p>
    </div>
  );
};

const NoRepo = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-xl">
      <p>There&apos;s nothing low about you!</p>
      <p className="mt-4">
        <a
          href="/?repo_url=github.com/mesaugat/low-code"
          className="inline-block bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Go here!
        </a>
      </p>
    </div>
  );
};

export default App;
