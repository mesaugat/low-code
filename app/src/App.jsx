import * as d3 from 'd3';
import useSWR from 'swr';
import { useState } from 'react';

import Header from './Header';
import Select from './Select';
import D3TreeMap from './D3TreeMap';

// const API_ENDPOINT = 'https://qsyjt1qvn9.execute-api.us-east-1.amazonaws.com/dev';
const API_ENDPOINT = 'http://localhost:3001/output';

function App() {
  const fetcher = url => fetch(url).then((res) => res.json());

  // const queryParameters =  new URLSearchParams(window.location.search);
  // const searchParamRepoUrl = queryParameters.get('repoUrl');

  // const [repoUrl, setRepoUrl] = useState(searchParamRepoUrl);
  const { data, error, isLoading } = useSWR(`${API_ENDPOINT}`, fetcher);

  // if (!repoUrl) return <div className="container">Nothing low about you!</div>;

  if (error) return <div className="container">Error loading data</div>;
  if (isLoading) return <div className="container">Loading...</div>;

  return (
    <>
      <Header title="LowCode Visualizer" />
      <p>
        Group By:{' '}
        <Select
          options={[
            { value: 'something', label: 'something' }
          ]}
          defaultValue="something"
          onChange={(e) => console.log(e.target.value)}
        />
      </p>
      <div className="container">
        <div className="grid">
          <D3TreeMap data={data} tile={d3.treemapSquarify} />
        </div>
        <div className="separator"></div>
        <div className="grid"></div>
      </div>
    </>
  );
}

export default App;
