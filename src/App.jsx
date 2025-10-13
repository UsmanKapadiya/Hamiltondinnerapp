import React, { createContext, useState } from "react";
import { Outlet } from "react-router-dom";


export const ToggledContext = createContext(null);

function App() {
  const [toggled, setToggled] = useState(false);
  const values = { toggled, setToggled };
  
  return (
    <div>
       <Outlet />
    </div>
  );
}

export default App;
