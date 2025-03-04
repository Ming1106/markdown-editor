import React, { createContext, useContext, useState } from 'react';
import { DefaultTheme, ThemeProvider as StyledThemeProvider } from 'styled-components';

const lightTheme: DefaultTheme = {
  colors: {
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#495057',
    textSecondary: '#6c757d',
    border: 'rgba(0, 0, 0, 0.1)',
    toolbarBg: '#ffffff',
    toolbarShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    buttonBg: '#f8f9fa',
    buttonHoverBg: '#e9ecef',
    buttonActiveBg: '#dee2e6',
    buttonDisabledBg: '#f1f3f5',
    buttonDisabledText: '#adb5bd',
    editorBg: '#ffffff',
    editorText: '#212529',
    dropdownBg: '#ffffff',
    dropdownHoverBg: '#f5f5f5',
    dropdownBorder: '#eee'
  }
};

const darkTheme: DefaultTheme = {
  colors: {
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#e9ecef',
    textSecondary: '#adb5bd',
    border: 'rgba(255, 255, 255, 0.1)',
    toolbarBg: '#2d2d2d',
    toolbarShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    buttonBg: '#3d3d3d',
    buttonHoverBg: '#4d4d4d',
    buttonActiveBg: '#5d5d5d',
    buttonDisabledBg: '#2d2d2d',
    buttonDisabledText: '#6c757d',
    editorBg: '#2d2d2d',
    editorText: '#e9ecef',
    dropdownBg: '#2d2d2d',
    dropdownHoverBg: '#3d3d3d',
    dropdownBorder: '#4d4d4d'
  }
};

interface ThemeContextType {
  theme: DefaultTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};