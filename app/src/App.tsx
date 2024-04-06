import Header from './Header';
import Select from './Select';
import D3TreeMap from './D3TreeMap';
import * as d3 from 'd3';
import flare from './flare.json';

function App() {
  return (
    <>
      <Header title="LowCode Visualizer" />
      <p>
        Group By:{' '}
        <Select
          options={[
            { value: 'Folder', label: 'Folder' },
            { value: 'User', label: 'User' },
            { value: 'Edits', label: 'Edits' }
          ]}
          defaultValue="option1"
          onChange={(e) => console.log(e.target.value)}
        />
      </p>
      <div className="container">
        <div className="grid">
          <D3TreeMap data={flare} tile={d3.treemapBinary} />
        </div>
        <div className="separator"></div>
        <div className="grid"></div>
      </div>
    </>
  );
}

export default App;
