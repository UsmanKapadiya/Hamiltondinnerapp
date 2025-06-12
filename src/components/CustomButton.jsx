import React from "react";
import { Button } from "@mui/material";

const CustomButton = ({
  children,
  onClick,
  endIcon,
  startIcon,
  sx = {},
  ...props
}) => (
  <Button
    variant="contained"
    onClick={onClick}
    endIcon={endIcon}
    startIcon={startIcon}
    sx={{
      borderRadius: "30px",
      background: "#e3f2fd", // fallback color, override with sx if needed
      color: "#1976d2",
      boxShadow: "none",
      px: 3,
      py: 1.5,
      fontWeight: 600,
      fontSize: "1rem",
      textTransform: "none",
      "&:hover": {
        background: "#bbdefb",
        color: "#1565c0",
        boxShadow: "none"
      },
      width: "60%",
      margin: "16px 0",
      ...sx
    }}
    {...props}
  >
    {children}
  </Button>
);

export default CustomButton;