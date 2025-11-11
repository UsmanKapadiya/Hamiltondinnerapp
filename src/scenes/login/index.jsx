import React, { useState, useCallback, useMemo } from "react";
import { Box, TextField, Button, Typography, useTheme, useMediaQuery, FormControlLabel, Checkbox } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { LoginOutlined } from "@mui/icons-material";
import logo from "../../assets/images/logo.png";
import CustomButton from "../../components/CustomButton";
import AuthServices from "../../services/authServices";
import { useLazyApi } from "../../hooks";
import { validateLoginForm, sanitizeInput } from "../../utils/validation";

const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const [formData, setFormData] = useState({ roomNo: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Use custom hook for API call
  const { execute: loginUser, loading } = useLazyApi(
    ({ roomNo, password }) => AuthServices.login({ roomNo, password }),
    {
      onSuccess: (response) => {
        if (response.ResponseCode === "1") {
          handleLoginSuccess(response);
        } else {
          toast.error(response.ResponseText || "Login failed. Please try again.");
        }
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.ResponseText ||
                           "An unexpected error occurred. Please try again.";
        toast.error(errorMessage);
      }
    }
  );

  const handleLoginSuccess = useCallback((response) => {
    const { 
      authentication_token, 
      role, 
      user_id, 
      show_dining, 
      show_incident, 
      language, 
      guideline, 
      guideline_cn, 
      room_id, 
      rooms, 
      form_types, 
      user_list,
      breakfast_guideline,
      breakfast_guideline_cn,
      lunch_guideline,
      lunch_guideline_cn,
      dinner_guideline,
      dinner_guideline_cn
    } = response;

    const langCode = language === 1 ? "cn" : "en";
    
    const userData = {
      role,
      user_id,
      show_dining,
      show_incident,
      language,
      langCode,
      guideline,
      guideline_cn,
      room_id,
      rooms,
      form_types,
      user_list,
      breakfast_guideline,
      breakfast_guideline_cn,
      lunch_guideline,
      lunch_guideline_cn,
      dinner_guideline,
      dinner_guideline_cn
    };

    localStorage.setItem("authToken", authentication_token);
    localStorage.setItem("userData", JSON.stringify(userData));
    
    toast.success(response.ResponseText || "Successfully Login");
    
    setTimeout(() => {
      if (role === "user") {
        navigate("/order", { state: { roomNo: formData?.roomNo } });
      } else {
        if((show_incident === 1 && role === "admin") || role === "kitchen"){
          navigate("/home");
        }else{
          navigate("/room");
        }
      }
    }, 1000);
  }, [navigate, formData.roomNo]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateLoginForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Clear errors and submit
    setErrors({});
    await loginUser(formData);
  }, [formData, loginUser]);

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
    </Box>
  );
};

export default Login;