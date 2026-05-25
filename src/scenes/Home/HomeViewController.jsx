import { Box, Typography, IconButton, useTheme } from "@mui/material";

import {
  DynamicFormOutlined,
  LogoutOutlined,
  RestaurantMenuOutlined,
  SummarizeRounded,
} from "@mui/icons-material";

import { ToastContainer } from "react-toastify";

import { tokens } from "../../theme";

import logo from "../../assets/images/logo.png";

import CustomButton from "../../components/CustomButton";

const HomeView = ({
  loading,
  userRole,
  showDining,
  showIncident,
  isKitchen,
  handleLogout,
  handleNavigation,
}) => {
  const theme = useTheme();

  const colors = tokens(theme.palette.mode);

  return (
    <Box
      display="flex"
      height="100vh"
      width="100%"
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <ToastContainer />

      {/* LEFT SIDE */}
      <Box
        flex={7}
        sx={{
          backgroundColor: colors.blueAccent[700],
          height: "100vh",
          width: "100%",
          overflowX: "hidden",
        }}
      />

      {/* RIGHT SIDE */}
      <Box
        flex={5}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          backgroundColor: "white",
          height: "100vh",
          width: "100%",
          position: "relative",
        }}
      >
        {/* USER ROLE */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 24,
            zIndex: 1,
          }}
        >
          <Typography variant="caption">Logged in as {userRole}</Typography>
        </Box>

        {/* CONTENT */}
        <Box
          component="form"
          onSubmit={handleLogout}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            maxWidth: "400px",
            padding: "20px",
            margin: "0 auto",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: 80,
              marginBottom: 16,
            }}
          />

          {/* MENU ICONS */}
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            gap={5}
            sx={{
              marginTop: 7,
              marginBottom: 7,
            }}
          >
            {showDining && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <IconButton
                  onClick={() => handleNavigation("/room")}
                  sx={{
                    color: colors.blueAccent[700],
                  }}
                >
                  <RestaurantMenuOutlined
                    sx={{
                      fontSize: 40,
                    }}
                  />
                </IconButton>

                <Typography variant="caption">Dining</Typography>
              </Box>
            )}

            {showIncident && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <IconButton
                  onClick={() => handleNavigation("/staticForms")}
                  sx={{
                    color: colors.blueAccent[700],
                  }}
                >
                  <DynamicFormOutlined
                    sx={{
                      fontSize: 40,
                    }}
                  />
                </IconButton>

                <Typography variant="caption">Incident</Typography>
              </Box>
            )}

            {isKitchen && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <IconButton
                  onClick={() =>
                    handleNavigation("/order", {
                      Kitchen_summery: true,
                    })
                  }
                  sx={{
                    color: colors.blueAccent[700],
                  }}
                >
                  <SummarizeRounded
                    sx={{
                      fontSize: 40,
                    }}
                  />
                </IconButton>

                <Typography variant="caption">Summary</Typography>
              </Box>
            )}
          </Box>

          {/* LOGOUT BUTTON */}
          <CustomButton
            type="submit"
            disabled={loading}
            startIcon={<LogoutOutlined />}
            sx={{
              bgcolor: colors.blueAccent[50],
              color: colors.blueAccent[700],
              padding: "10px 32px",
              boxShadow: "none",
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 16,
              width: "auto",
            }}
          >
            {loading ? "Loading..." : "Log Out"}
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeView;
