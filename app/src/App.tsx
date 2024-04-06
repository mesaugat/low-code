import Header from './Header';
import Select from './Select';
import Visualizer from './Visualizer';

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
          <Visualizer />
        </div>
        <div className="separator"></div>
        <div className="grid"></div>
      </div>
    </>
  );
}

export default App;
