import React from 'react';

export const Header: React.FC<{children?: React.ReactNode}> = ({ children }) => {
  return (
    <header className="text-center relative">
      <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 text-transparent bg-clip-text">
        CaptionGenie
      </h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
        Crafting viral captions and hashtags in seconds.
      </p>
      {children}
    </header>
  );
};