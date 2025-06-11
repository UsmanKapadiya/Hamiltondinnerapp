import { createTheme } from "@mui/material";
import { useMemo } from "react";
import { useState } from "react";
import { createContext } from "react";

// Color Design Tokens
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        gray: {
          100: "#eaeaea",
          200: "#d4d4d4",
          300: "#b0b0b0",
          400: "#8c8c8c",
          500: "#666666",
          600: "#4d4d4d",
          700: "#333333",
          800: "#1a1a1a",
          900: "#0a0a0a",
        },
        primary: {
          100: "#c5d1d3", // pale steel
          200: "#9eb6bb",
          300: "#789ca2",
          400: "#527289",
          500: "#2c586f", // steel blue
          600: "#234558",
          700: "#1a3342",
          800: "#11222b",
          900: "#081114",
        },
        greenAccent: {
          100: "#d6e2d2",
          200: "#adc5a6",
          300: "#85a77a",
          400: "#5c8a4f",
          500: "#336d23", // English countryside green
          600: "#28571c",
          700: "#1e4215",
          800: "#142c0e",
          900: "#0a1707",
        },
        redAccent: {
          100: "#f2d6d6",
          200: "#e5adad",
          300: "#d98585",
          400: "#cc5c5c",
          500: "#bf3333", // British brick red
          600: "#992929",
          700: "#731f1f",
          800: "#4d1414",
          900: "#260a0a",
        },
        blueAccent: {
          100: "#d4dce8",
          200: "#a9b9d2",
          300: "#7e97bb",
          400: "#5374a5",
          500: "#28528e", // Royal navy blue
          600: "#204175",
          700: "#18315c",
          800: "#102044",
          900: "#08102b",
        },
      }
    : {
        gray: {
          100: "#0a0a0a",
          200: "#1a1a1a",
          300: "#333333",
          400: "#4d4d4d",
          500: "#666666",
          600: "#8c8c8c",
          700: "#b0b0b0",
          800: "#d4d4d4",
          900: "#eaeaea",
        },
        primary: {
          100: "#081114",
          200: "#11222b",
          300: "#1a3342",
          400: "#234558",
          500: "#2c586f",
          600: "#527289",
          700: "#789ca2",
          800: "#9eb6bb",
          900: "#c5d1d3",
        },
        greenAccent: {
          100: "#0a1707",
          200: "#142c0e",
          300: "#1e4215",
          400: "#28571c",
          500: "#336d23",
          600: "#5c8a4f",
          700: "#85a77a",
          800: "#adc5a6",
          900: "#d6e2d2",
        },
        redAccent: {
          100: "#260a0a",
          200: "#4d1414",
          300: "#731f1f",
          400: "#992929",
          500: "#bf3333",
          600: "#cc5c5c",
          700: "#d98585",
          800: "#e5adad",
          900: "#f2d6d6",
        },
        blueAccent: {
          100: "#08102b",
          200: "#102044",
          300: "#18315c",
          400: "#204175",
          500: "#28528e",
          600: "#5374a5",
          700: "#7e97bb",
          800: "#a9b9d2",
          900: "#d4dce8",
        },
      }),
});


// Mui Theme Settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);

  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.gray[700],
              main: colors.gray[500],
              light: colors.gray[100],
            },
            background: {
              default: colors.primary[500],
            },
          }
        : {
            primary: {
              main: colors.primary[100],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.gray[700],
              main: colors.gray[500],
              light: colors.gray[100],
            },
            background: {
              default: colors.primary[500],
            },
          }),
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};

// Context For Color Mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("dark");

  const colorMode = useMemo(() => ({
    toggleColorMode: () =>
      setMode((prev) => (prev === "light" ? "dark" : "light")),
  }));

  const theme = useMemo(() => createTheme(themeSettings(mode), [mode]));

  return [theme, colorMode];
};
