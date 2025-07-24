import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme as darkTheme, lightTheme } from './theme';

const ThemeModeContext = createContext({
  mode: 'dark',
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'dark' | 'light'>('dark');
  const toggleTheme = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}; 