'use client';

import { createContext, useContext } from 'react';

const ThemeContext = createContext({ darkMode: false });

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children, darkMode }) {
  return (
    <ThemeContext.Provider value={{ darkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}