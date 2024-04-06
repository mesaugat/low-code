const Header = ({ title }) => {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <h1 className="font-bold p-y-4">{title}</h1>
    </header>
  );
};

export default Header;
