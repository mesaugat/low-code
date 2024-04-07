const Header = ({ title, repo_url = '' }) => {
  const url = repo_url && `https://${repo_url.split('.git')[0]}`;

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="flex items-center">
        <img alt="LowCode Visualizer Logo" className="mr-4" width="40" src="/logo.png"></img>
        <h1 className="font-bold p-y-4">
          {title} ·{' '}
          {url && (
            <a href={url} className="text-sm text-red-500" target="_blank">
              {url}
            </a>
          )}
        </h1>
      </div>
    </header>
  );
};

export default Header;
