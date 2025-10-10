import React, { useState, useCallback } from "react";
import {
    Box,
    TextField,
    Typography,
    useTheme,
    useMediaQuery,
    IconButton
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import {
    ArrowForwardIosOutlined,
    LogoutOutlined
} from "@mui/icons-material";
import logo from "../../assets/images/logo.png";
import CustomButton from "../../components/CustomButton";
import { useLocalStorage } from "../../hooks";
import { sanitizeInput } from "../../utils/validation";

const RoomEnter = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMdDevices = useMediaQuery("(min-width: 724px)");
    const [formData, setFormData] = useState({ roomNo: "" });
    const [errors] = useState({ roomNo: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [userData] = useLocalStorage("userData", null);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        const sanitizedValue = sanitizeInput(value);
        setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const roomNo = formData?.roomNo?.toString();
        const rooms = userData?.rooms || [];
        const matchedRoom = rooms.find(room => room.name.toLowerCase() === roomNo.toLowerCase());
        if (matchedRoom) {
            navigate("/order", { state: { roomNo: matchedRoom.name } });
        } else {
            toast.error("Room number not found!");
        }
    }, [formData, userData, navigate]);

    const handleLogout = useCallback(() => {
        toast.success("Logged out!");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            navigate("/", { replace: true });
        }, 1000);
    }, [navigate]);
    return (
        <Box
            display="flex"
            height="100vh"
            width="100%"
            sx={{
                overflowX: "hidden",
                overflowY: "auto"
            }}
        >
            <ToastContainer />
            <Box
                flex={7}
                sx={{
                    backgroundColor: colors.blueAccent[700],
                    height: "100vh",
                    width: "100%",
                    overflowX: "hidden"
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
                    width: "100%"
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
                        margin: "0 auto"
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
                            fontWeight: 700
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
                        InputProps={{
                            endAdornment: (
                                <IconButton
                                    onClick={handleSubmit}
                                    edge="end"
                                    aria-label="submit room number"
                                    sx={{
                                        color: colors.blueAccent[700],
                                        marginRight: 2
                                    }}
                                >
                                    <ArrowForwardIosOutlined />
                                </IconButton>
                            ),
                            sx: {
                                borderRadius: "30px",
                                background: colors.blueAccent[50],
                                paddingRight: 0
                            }
                        }}
                    />

                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={1}
                        width="100%"
                    >
                        <CustomButton
                            onClick={() => navigate('/report')}
                            endIcon={<ArrowForwardIosOutlined />}
                            sx={{
                                bgcolor: colors.blueAccent[50],
                                color: colors.blueAccent[700],
                                "&:hover": {
                                    bgcolor: colors.blueAccent[100],
                                    color: colors.blueAccent[800],
                                },
                                padding: "10px 32px",
                                boxShadow: "none",
                                border: "none",
                                borderRadius: 4,
                                fontWeight: 600,
                                fontSize: 16,
                                cursor: "pointer",
                                width: "240px",
                                maxWidth: "100%",
                            }}
                        >
                            View Report
                        </CustomButton>

                        <CustomButton
                            onClick={handleLogout}
                            startIcon={<LogoutOutlined />}
                            disabled={loading}
                            sx={{
                                bgcolor: colors.blueAccent[700],
                                color: "#fcfcfc",
                                fontSize: isMdDevices ? "14px" : "10px",
                                fontWeight: "bold",
                                padding: "10px 32px",
                                borderRadius: 4,
                                textDecoration: "none",
                                transition: ".3s ease",
                                opacity: loading ? 0.7 : 1,
                                pointerEvents: loading ? "none" : "auto",
                                cursor: loading ? "not-allowed" : "pointer",
                                width: "240px", // Same width as above
                                maxWidth: "100%",
                                "&:hover": {
                                    bgcolor: colors.blueAccent[800],
                                },
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

export default RoomEnter;