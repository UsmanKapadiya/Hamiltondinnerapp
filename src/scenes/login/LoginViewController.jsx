import { Box, TextField, Typography, useTheme } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { LoginOutlined } from "@mui/icons-material";
import { tokens } from "../../theme";
import logo from "../../assets/images/logo.png";
import CustomButton from "../../components/CustomButton";

const LoginView = ({
  formData,
  errors,
  loading,
  handleChange,
  handleSubmit,
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

      <Box
        flex={7}
        sx={{
          backgroundColor: colors.blueAccent[700],
          height: "100vh",
          width: "100%",
          overflowX: "hidden",
        }}
      />

      <Box
        flex={5}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          backgroundColor: "white",
          height: "100vh",
          width: "100%",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
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

          <Typography
            variant="h6"
            gutterBottom
            sx={{
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Welcome to our
            <br />
            Exceptional
            <br />
            Senior Living
          </Typography>

          <TextField
            label="Room No"
            name="roomNo"
            type="text"
            value={formData.roomNo}
            onChange={handleChange}
            error={!!errors.roomNo}
            helperText={errors.roomNo}
            fullWidth
            margin="normal"
            autoComplete="username"
            disabled={loading}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
            margin="normal"
            autoComplete="current-password"
            disabled={loading}
          />

          <Box>
            <CustomButton
              type="submit"
              disabled={loading}
              startIcon={<LoginOutlined />}
              sx={{
                bgcolor: colors.blueAccent[50],
                color: colors.blueAccent[700],

                "&:hover": {
                  bgcolor: colors.blueAccent[100],

                  color: colors.blueAccent[800],
                },

                padding: "10px 32px",

                boxShadow: "none",

                borderRadius: 4,

                fontWeight: 600,

                fontSize: 16,

                cursor: "pointer",

                width: "auto",
              }}
            >
              {loading ? "Loading..." : "Login"}
            </CustomButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginView;
