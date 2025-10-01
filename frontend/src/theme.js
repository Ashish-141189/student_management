// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // or "dark"
    primary: {
      main: "#1976d2", // AppBar, Buttons
    },
    secondary: {
      main: "#9c27b0",
    },
    background: {
      default: "#f4f6f8", // Page background
      paper: "#ffffff",   // Cards background
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: "Poppins, Roboto, sans-serif",
    h6: { fontWeight: 600 },
    button: { textTransform: "none" }, // disable uppercase buttons
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: "0px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "0px",
          padding: "6px 16px",
        },
      },
    },
  },
});

export default theme;
