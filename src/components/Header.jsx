/* eslint-disable react/prop-types */
import { Box, Typography, useTheme, Button, useMediaQuery, IconButton, Menu, MenuItem } from "@mui/material";
import { tokens } from "../theme";
import { Icon } from "@mui/material";
import {
  AccountCircle,
  AddOutlined,
  DeleteOutline,
  MenuOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


const Header = ({ title, icon, addNewClick, addBulkDelete, buttons, addButton, deleteButton, profileScreen }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const [showDeleted, setShowDeleted] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleUserMenuClose();
    navigate("/profile"); // Change to your profile route
  };

  const handleLogout = () => {
    handleUserMenuClose();
    localStorage.clear();
    navigate("/");
  };
  return (
    <Box mb="30px">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          {icon && (
            <Icon
              sx={{
                color: colors.gray[100],
                fontSize: "32px",
                marginRight: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {icon}
            </Icon>
          )}
          <Typography
            variant="h6"
            fontWeight="bold"
            color={colors.gray[100]}
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            # {title}
          </Typography>
        </Box>
        {buttons && (
          <Box display="flex" gap="8px" ml="30px">
            {[
              {
                label: "Add New",
                color: colors.greenAccent[700],
                hoverColor: colors.greenAccent[800],
                icon: <AddOutlined />,
                onClick: addNewClick,
                disabled: !addButton,
              },
              {
                label: "Bulk Delete",
                color: colors.redAccent[700],
                hoverColor: colors.redAccent[800],
                icon: <DeleteOutline />,
                onClick: addBulkDelete,
                disabled: !deleteButton,
              },
            ].map((button, index) => (
              <Button
                key={index}
                variant="contained"
                onClick={button.onClick || (() => { })}
                sx={{
                  bgcolor: button.color,
                  color: "#fcfcfc",
                  fontSize: isMdDevices ? "12px" : "10px",
                  fontWeight: "bold",
                  p: "6px 12px",
                  transition: ".3s ease",
                  ":hover": {
                    bgcolor: button.hoverColor,
                  },
                }}
                startIcon={button.icon}
                disabled={button?.disabled}
              >
                {button.label}
              </Button>
            ))}
          </Box>
        )}
        {/* Right Align User Icon */}
        {profileScreen && (
          <Box ml="auto">
            <IconButton onClick={handleUserMenuOpen} sx={{ color: colors.gray[100] }}>
              <AccountCircle fontSize="large" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Header;
