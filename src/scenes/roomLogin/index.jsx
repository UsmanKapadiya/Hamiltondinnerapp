import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
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

const RoomEnter = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMdDevices = useMediaQuery("(min-width: 724px)");
    const [formData, setFormData] = useState({ roomNo: "", password: "" });
    const [errors, setErrors] = useState({ roomNo: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        navigate("/order")
        // const newErrors = {};
        // if (!formData.roomNo) newErrors.roomNo = "Room No is required";
        // if (!formData.password) newErrors.password = "Password is required";

        // if (Object.keys(newErrors).length > 0) {
        //     setErrors(newErrors);
        //     return;
        // }

        // Example: handle login logic here
        // setLoading(true);
        // try {
        //   let response = await AuthServices.login(formData);
        //   // ...handle response...
        //   toast.success("Login Successfully!");
        //   setTimeout(() => navigate("/"), 1000);
        // } catch (error) {
        //   toast.error("Login failed");
        // } finally {
        //   setLoading(false);
        // }
        toast.success("Form submitted!");
    };

    // Reusable styles
    const inputButtonSx = {
        borderRadius: "30px",
        background: colors.blueAccent[50],
        color: colors.blueAccent[700],
        boxShadow: "none",
        px: 3,
        py: 1.5,
        fontWeight: 600,
        fontSize: "1rem",
        textTransform: "none",
        "&:hover": {
            background: colors.blueAccent[100],
            color: colors.blueAccent[800],
            boxShadow: "none"
        },
        width: "60%",
        margin: "16px 0"
    };

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
                            boxShadow: "none",
                            borderRadius: "30px",
                            fontWeight: 600,
                            fontSize: "1rem",
                            textTransform: "none",
                            width: "60%",
                            margin: "16px 0",
                        }}
                    >
                        View Report
                    </CustomButton>
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
        </Box>
    );
};

export default RoomEnter;