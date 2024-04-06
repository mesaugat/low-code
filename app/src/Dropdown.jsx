import React, { useState } from 'react';

const Dropdown = ({ name, items, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <div className="relative inline-block text-left mr-4 w-auto">
      <div>
        <button
          type="button"
          className="inline-flex outline-none justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selected || name}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {items &&
              items.map((item, index) => (
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  key={index}
                  onClick={(event) => {
                    event.preventDefault();
                    setSelected(item);
                    onClick(item);
                    setIsOpen(false);
                  }}
                >
                  {item}
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
