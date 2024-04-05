import { TreeMap, TreeMapSeries } from 'reaviz';

const data = [
  {
    key: 'backend',
    data: [
      {
        key: 'src/server.js',
        data: 100
      },
      {
        key: 'src/util.js',
        data: 20
      }
    ]
  },
  {
    key: 'frontend',
    data: [
      {
        key: 'src/App.js',
        data: 10
      },
      {
        key: 'src/core.js',
        data: 20
      }
    ]
  }
];

function App() {
  return <TreeMap height={450} width={450} data={data} series={<TreeMapSeries colorScheme="orrd" />} />;
}

export default App;
