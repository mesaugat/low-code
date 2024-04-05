import { TreeMap, TreeMapLabel, TreeMapRect, TreeMapSeries } from 'reaviz';

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
  },
  {
    key: 'core',
    data: [
      {
        key: 'src/util.js',
        data: 10
      },
      {
        key: 'src/jwt.js',
        data: 20
      },
      {
        key: 'src/haha.js',
        data: 30
      },
      {
        key: 'src/secret.js',
        data: 40
      }
    ]
  },
  {
    key: 'extension',
    data: [
      {
        key: 'src/asd.js',
        data: 10
      },
      {
        key: 'src/wild.js',
        data: 20
      },
      {
        key: 'src/comedy.js',
        data: 30
      },
      {
        key: 'src/lol.js',
        data: 40
      }
    ]
  }
];

function App() {
  return (
    <div className="container">
      <div className="grid">
        <TreeMap
          height={600}
          width={600}
          data={data}
          series={
            <TreeMapSeries
              colorScheme="pastel1"
              rect={<TreeMapRect onClick={(event, data) => console.log('onClick', event, data)} />}
              label={<TreeMapLabel wrap={true} fontSize={12} placement="middle" />}
            />
          }
        />
      </div>
      <div className="separator"></div>
      <div className="grid"></div>
    </div>
  );
}

export default App;
