import React, { useState } from "react";
import { Box, TextField, Button, Typography, useTheme, useMediaQuery, FormControlLabel, Checkbox } from "@mui/material";
// import shipImage from "../../assets/images/ship.jpg";
// import AuthServices from "../../services/authServices";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { use } from "react";
import { tokens } from "../../theme";
import { DownloadOutlined, LoginOutlined } from "@mui/icons-material";
import logo from "../../assets/images/logo.png";
import CustomButton from "../../components/CustomButton";
import AuthServices from "../../services/authServices";
const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const [formData, setFormData] = useState({ roomNo: "", password: "" });
  const [errors, setErrors] = useState({ roomNo: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // navigate("/home");
    // console.log("navigate", formData)
    const newErrors = {};
    if (!formData.roomNo) newErrors.roomNo = "Room No is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      return;
    }

    try {
      setLoading(true);
      let response = await AuthServices.login({ roomNo: formData?.roomNo, password: formData?.password });

      if (response.ResponseCode === "1") {
        const { authentication_token, role, user_id, show_dining, show_incident, guideline, guideline_cn, room_id, rooms, form_types, user_list } = response;
        let userData = {
          role,
          user_id,
          show_dining,
          show_incident,
          guideline,
          guideline_cn,
          room_id,
          rooms,
          form_types,
          user_list
        };
        localStorage.setItem("authToken", authentication_token);
        localStorage.setItem("userData", JSON.stringify(userData));
        toast.success(response.ResponseText || "Successfully Login");
        setTimeout(() => {
          if (role === "user") {
            navigate("/order", { state: { roomNo: formData?.roomNo } });
          } else {
            navigate("/home");
          }
        }, 1000);
      } else {
        toast.error(response.ResponseText || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing login:", error);
      const errorMessage =
        error.response?.data?.error || "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }

  };

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
          backgroundColor: "white",//#022b63
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
          {/* Top side logo set */}
          {/* Logo */}
          <img
            src={logo}
            alt="Logo"
            style={{ width: 80, marginBottom: 16 }}
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
            Welcome to our <br /> Exceptional <br />Senior Living
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
                borderRadius: "30px",
                border: "none",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                width: 'auto'
              }}
            >
              {loading ? "Loading..." : "Login"}
            </CustomButton>
          </Box>
        </Box>
      </Box>
    </Box >
  );
};

export default Login;