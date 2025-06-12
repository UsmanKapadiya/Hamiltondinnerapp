import React, { useState } from "react";
import { Box, TextField, Button, Typography, useTheme, useMediaQuery, FormControlLabel, Checkbox, IconButton } from "@mui/material";
// import shipImage from "../../assets/images/ship.jpg";
// import AuthServices from "../../services/authServices";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { use } from "react";
import { tokens } from "../../theme";
import { DownloadOutlined, DynamicFormOutlined, LoginOutlined, LogoutOutlined, RestaurantMenuOutlined } from "@mui/icons-material";
import logo from "../../assets/images/logo.png";
import CustomButton from "../../components/CustomButton";
const Home = () => {
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
        const newErrors = {};
        if (!formData.roomNo) newErrors.roomNo = "Room No is required";
        if (!formData.password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        console.log("Form submitted", formData);

        // try {
        //   setLoading(true);
        //   let response = await AuthServices.login(formData);
        //   const { access_token, user } = response;

        //   console.log("response", access_token, user);
        //   localStorage.setItem("authToken", access_token);
        //   localStorage.setItem("userData", JSON.stringify(user));

        //   // Show success toast
        //   toast.success("Login Successfully!");

        //   // Delay navigation to ensure toast is displayed
        //   setTimeout(() => {
        //     navigate("/");
        //   }, 1000);
        // } catch (error) {
        //   console.error("Error processing login:", error);

        //   const errorMessage =
        //     error.response?.data?.error || "An unexpected error occurred. Please try again.";
        //   toast.error(errorMessage);

        //   setTimeout(() => {
        //     setLoading(false);
        //   }, 1500);
        // } finally {
        //   if (!error) {
        //     setLoading(false);
        //   }
        // }
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
                    {/* Top side logo set */}
                    {/* Logo */}
                    <img
                        src={logo}
                        alt="Logo"
                        style={{ width: 80, marginBottom: 16 }}
                    />

                    <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                        gap={5}
                        sx={{ marginTop: 7, marginBottom: 7 }}
                    >
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <IconButton
                                onClick={() => { navigate("/room"); }}
                                sx={{
                                    color: colors.blueAccent[700],
                                    transition: "color 0.3s",
                                    "&:hover": {
                                        color: colors.blueAccent[800],
                                    },
                                }}
                            >
                                <RestaurantMenuOutlined sx={{ fontSize: 40 }} />
                            </IconButton>
                            <Typography variant="caption" sx={{ mt: 1 }}>
                                Dinning
                            </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <IconButton
                                onClick={() => { /* handle DynamicForm click */ }}
                                sx={{
                                    color: colors.blueAccent[700],
                                    transition: "color 0.3s",
                                    "&:hover": {
                                        color: colors.blueAccent[800],
                                    },
                                }}
                            >
                                <DynamicFormOutlined sx={{ fontSize: 40 }} />
                            </IconButton>
                            <Typography variant="caption" sx={{ mt: 1 }}>
                                Incident
                            </Typography>
                        </Box>
                    </Box>
                    <Box>
                        <CustomButton
                            type="submit"
                            disabled={loading}
                            startIcon={<LogoutOutlined />}
                            sx={{
                                width: "100%",
                                bgcolor: colors.blueAccent[700],
                                color: "#fcfcfc",
                                fontSize: isMdDevices ? "14px" : "10px",
                                fontWeight: "bold",
                                p: "10px 20px",
                                mt: "18px",
                                transition: ".3s ease",
                                ":hover": {
                                    bgcolor: colors.blueAccent[800],
                                },
                            }}
                        >
                            {loading ? "Loading..." : "Log Out"}
                        </CustomButton>
                    </Box>
                </Box>
            </Box>
        </Box >
    );
};

export default Home;