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
    // <ColorModeContext.Provider value={colorMode}>
    //   <ThemeProvider theme={theme}>
    //     <CssBaseline />
    //     <ToggledContext.Provider value={values}>
    //       <Box sx={{ display: "flex", height: "100vh", maxWidth: "100%" }}>
    //         <SideBar />
    //         <Box
    //           sx={{
    //             flexGrow: 1,
    //             display: "flex",
    //             flexDirection: "column",
    //             height: "100%",
    //             maxWidth: "100%",
    //           }}
    //         >
    //           <Navbar />
    //           <Box sx={{ overflowY: "auto", flex: 1, maxWidth: "100%" }}>
    //             <Outlet />
    //           </Box>
    //         </Box>
    //       </Box>
    //     </ToggledContext.Provider>
    //   </ThemeProvider>
    // </ColorModeContext.Provider>
  );
}

export default App;
