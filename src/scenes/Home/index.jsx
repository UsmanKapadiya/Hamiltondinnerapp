import React, { useState } from "react";
import { Box, Typography, useTheme, useMediaQuery, IconButton } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { DynamicFormOutlined, LogoutOutlined, RestaurantMenuOutlined, SummarizeRounded } from "@mui/icons-material";
import logo from "../../assets/images/logo.png";
import CustomButton from "../../components/CustomButton";

const Home = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMdDevices = useMediaQuery("(min-width: 724px)");
    const [loading, setLoading] = useState(false);
    const [data] = useState(() => {
        const userData = localStorage.getItem("userData");
        return userData ? JSON.parse(userData) : null;
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        toast.success("Logged out!");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            navigate("/");
            window.location.reload()
        }, 1000);
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
                    position: "relative",
                }}
            >
                {/* Top right align */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 24,
                        zIndex: 1,
                    }}
                >
                    <Typography variant="caption" sx={{ textAlign: "right" }}>
                        Logged in as {data?.role === "admin" ? "Admin" : data?.role}
                    </Typography>
                </Box>

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
                        {data?.show_dining == 1 && (
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
                        )}
                        {data?.show_incident == 1 && data?.role !== "kitchen" && (
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <IconButton
                                    onClick={() => { navigate("/staticForms") }}
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
                        )}
                        {data?.role === "kitchen" && (
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <IconButton
                                    onClick={() => { navigate("/order", { state: { Kitchen_summery: true } }) }}
                                    sx={{
                                        color: colors.blueAccent[700],
                                        transition: "color 0.3s",
                                        "&:hover": {
                                            color: colors.blueAccent[800],
                                        },
                                    }}
                                >
                                    <SummarizeRounded sx={{ fontSize: 40 }} />
                                </IconButton>
                                <Typography variant="caption" sx={{ mt: 1 }}>
                                    Summery
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box>
                        <CustomButton
                            type="submit"
                            disabled={loading}
                            startIcon={<LogoutOutlined />}                        
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
                            {loading ? "Loading..." : "Log Out"}
                        </CustomButton>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Home;