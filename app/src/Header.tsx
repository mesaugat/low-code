import { ReactElement } from 'react';

function Header({ title }): ReactElement<{ title: string }> {
  return (
    <header>
      <h1>{title}</h1>
    </header>
  );
}

export default Header;
