import * as d3 from 'd3';
import useSWR from 'swr';
import { useState } from 'react';

import Header from './Header';
import Select from './Select';
import D3TreeMap from './D3TreeMap';

const API_ENDPOINT = 'https://qsyjt1qvn9.execute-api.us-east-1.amazonaws.com/dev/evaluate';

const App = () => {
  const fetcher = url => fetch(url).then((res) => res.json());

  const queryParameters =  new URLSearchParams(window.location.search);
  const searchParamRepoUrl = queryParameters.get('repo_url');

  const [repoUrl, setRepoUrl] = useState(searchParamRepoUrl);
  const [user, setUser] = useState('');

  const { data, error, isLoading } = useSWR(`${API_ENDPOINT}?repo_url=${repoUrl}&user=${user}`, fetcher);

  if (!repoUrl) return <NoRepo />

  if (error) return <Error />
  if (isLoading) return <Loading />

  return (
    <>
      <Header title="LowCode Visualizer" />
      <p>
        Filter By:{' '}
        <Select
          options={data.users.map(user => ({ label: user, value: user }))}
          defaultValue=""
          onChange={(e) => setUser(e.target.value)}
        />
      </p>
      <div className="container">
        <div className="grid">
          <D3TreeMap data={data.graph} tile={d3.treemapSquarify} />
        </div>
        <div className="separator"></div>
        <div className="grid"></div>
      </div>
    </>
  );
}

const Error = () => {
  return (
    <div className="grid">
      <p>Error loading data!</p>
    </div>
  );
}

const Loading = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="animate-pulse">Loading...</p>
    </div>
  )
}

const NoRepo = () => {
  return (
    <div className="grid">
      <p>There's nothing low about you!</p>
    </div>
  );
}

export default App;
