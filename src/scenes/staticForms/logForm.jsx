import React, { useState } from "react";
import { Box, TextField } from "@mui/material";
import CustomButton from "../../components/CustomButton";
import { LoginOutlined } from "@mui/icons-material";
import { Formik } from "formik";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import { Header } from "../../components";

const initialValues = {
    roomNumber: "",
    residentName: "",
    about: "",
    loggedBy: "",
    actionTaken: "",
    followUpRequired: "",
};

const LogForm = () => {
    const [loading, setLoading] = useState(false);
    const handleSubmit = (values, actions) => {
        // Replace with your submit logic
        console.log("Log Form Values", values);
        actions.resetForm();
    };

    return (
        <Box m="20px">
            <Header
                title={"LOG FORM"}
                Buttons={false}
            />
            {loading ? (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="calc(100vh - 100px)"
                >
                    <CustomLoadingOverlay />
                </Box>
            ) : (
                <>
                    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                        {({ values, handleChange, handleBlur, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap={2} mx="auto">
                                    <Box display="flex" gap={2}>
                                        <TextField
                                            label="Room Number"
                                            name="roomNumber"
                                            value={values.roomNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant="filled"
                                            fullWidth
                                        />
                                        <TextField
                                            label="Resident Name"
                                            name="residentName"
                                            value={values.residentName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant="filled"
                                            fullWidth
                                        />
                                    </Box>
                                    <TextField
                                        label="What it is about"
                                        name="about"
                                        value={values.about}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        variant="filled"
                                        fullWidth
                                        multiline
                                        minRows={3}
                                    />
                                    <Box display="flex" gap={2}>


                                        <TextField
                                            label="Logged By"
                                            name="loggedBy"
                                            value={values.loggedBy}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant="filled"
                                            fullWidth
                                        />
                                        <TextField
                                            label="Action Taken"
                                            name="actionTaken"
                                            value={values.actionTaken}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant="filled"
                                            fullWidth
                                        />
                                    </Box>
                                    <TextField
                                        label="Follow up required"
                                        name="followUpRequired"
                                        value={values.followUpRequired}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        variant="filled"
                                        fullWidth
                                    />
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mt="20px"
                                    >
                                        <CustomButton
                                            type="submit"
                                            disabled={loading}
                                            // startIcon={<LoginOutlined />}
                                            sx={{
                                                width: "200px",
                                                bgcolor: '#1976d2',
                                                color: "#fcfcfc",
                                                fontSize: "16px",
                                                fontWeight: "bold",
                                                p: "10px 20px",
                                                mt: "18px",
                                                transition: ".3s ease",
                                                ":hover": {
                                                    bgcolor: '#115293',
                                                },
                                            }}
                                        >
                                            {loading ? "Loading..." : "Submit"}
                                        </CustomButton>
                                    </Box>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </>
            )}
        </Box>
    );
};

export default LogForm;
