import React, { createContext, useState } from "react";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { Navbar, SideBar } from "./scenes";
import { Outlet } from "react-router-dom";
import Home from "./scenes/Home";
import { Room } from "@mui/icons-material";
import RoomEnter from "./scenes/roomLogin";

export const ToggledContext = createContext(null);

function App() {
  const [theme, colorMode] = useMode();
  const [toggled, setToggled] = useState(false);
  const values = { toggled, setToggled };
  
  return (
    <div>
       <Outlet />
    </div>
  );
}

export default App;
