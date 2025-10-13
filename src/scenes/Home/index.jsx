import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Box, Typography, useTheme, useMediaQuery, IconButton } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { DynamicFormOutlined, LogoutOutlined, RestaurantMenuOutlined, SummarizeRounded } from "@mui/icons-material";
import logo from "../../assets/images/logo.png";
import CustomButton from "../../components/CustomButton";
import { useLocalStorage } from "../../hooks";

const Home = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMdDevices = useMediaQuery("(min-width: 724px)");
    const [loading, setLoading] = useState(false);
    const [userData] = useLocalStorage("userData", null);
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const handleLogout = useCallback((e) => {
        e.preventDefault();

        setLoading(true);
        toast.success("Logged out!");

        setTimeout(() => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            setLoading(false);
            navigate("/", { replace: true });
        }, 1000);
    }, [navigate]);

    const handleNavigation = useCallback((path, state = {}) => {
        navigate(path, { state });
    }, [navigate]);

    const showDining = useMemo(() => userData?.show_dining === "1", [userData]);
    const showIncident = useMemo(() => userData?.show_incident === "1" && userData?.role !== "kitchen", [userData]);
    const isKitchen = useMemo(() => userData?.role === "kitchen", [userData]);
    const userRole = useMemo(() => {
        if (userData?.role === "admin") return "Admin";
        return userData?.role || "Guest";
    }, [userData]);
    
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
                <Box
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 24,
                        zIndex: 1,
                    }}
                >
                    <Typography variant="caption" sx={{ textAlign: "right" }}>
                        Logged in as {userRole}
                    </Typography>
                </Box>

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
                        {showDining && (
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <IconButton
                                    onClick={() => handleNavigation("/room")}
                                    sx={{
                                        color: colors.blueAccent[700],
                                        transition: "color 0.3s",
                                        "&:hover": {
                                            color: colors.blueAccent[800],
                                        },
                                    }}
                                    aria-label="Go to Dining"
                                >
                                    <RestaurantMenuOutlined sx={{ fontSize: 40 }} />
                                </IconButton>
                                <Typography variant="caption" sx={{ mt: 1 }}>
                                    Dining
                                </Typography>
                            </Box>
                        )}
                        {showIncident && (
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <IconButton
                                    onClick={() => handleNavigation("/staticForms")}
                                    sx={{
                                        color: colors.blueAccent[700],
                                        transition: "color 0.3s",
                                        "&:hover": {
                                            color: colors.blueAccent[800],
                                        },
                                    }}
                                    aria-label="Go to Incident Forms"
                                >
                                    <DynamicFormOutlined sx={{ fontSize: 40 }} />
                                </IconButton>
                                <Typography variant="caption" sx={{ mt: 1 }}>
                                    Incident
                                </Typography>
                            </Box>
                        )}
                        {isKitchen && (
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <IconButton
                                    onClick={() => handleNavigation("/order", { Kitchen_summery: true })}
                                    sx={{
                                        color: colors.blueAccent[700],
                                        transition: "color 0.3s",
                                        "&:hover": {
                                            color: colors.blueAccent[800],
                                        },
                                    }}
                                    aria-label="Go to Summary"
                                >
                                    <SummarizeRounded sx={{ fontSize: 40 }} />
                                </IconButton>
                                <Typography variant="caption" sx={{ mt: 1 }}>
                                    Summary
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