import React, { useState } from "react";
import { Box, TextField, Autocomplete } from "@mui/material";
import CustomButton from "../../components/CustomButton";
import { LoginOutlined } from "@mui/icons-material";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import { Header } from "../../components";
import { toast } from "react-toastify";
import StaticFormServices from "../../services/staticFormServices";
import { useNavigate } from "react-router-dom";

const initialValues = {
    room_number: "",
    resident_name: "",
    log_text: "",
    logged_by: "",
    action_taken: "",
    follow_up_required: "",
};

const validationSchema = Yup.object({
    room_number: Yup.string().required("Room Number is required"),
    resident_name: Yup.string().required("Resident Name is required"),
    log_text: Yup.string().required("This field is required"),
});

const LogForm = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [userData] = useState(() => {
        const userDatas = localStorage.getItem("userData");
        return userDatas ? JSON.parse(userDatas) : null;
    });

    const [completedNames, setCompletedNames] = useState(() => {
        const stored = localStorage.getItem("completedNames");
        return stored ? JSON.parse(stored) : [];
    });

    console.log(userData)

    // When room number changes, auto-fill resident name
    const handleRoomNumberChange = (e, handleChange, setFieldValue, values) => {
        handleChange(e);
        const roomNumber = e.target.value;
        if (userData?.rooms && Array.isArray(userData.rooms)) {
            const found = userData.rooms.find(r =>
                String(r.name).toLowerCase() === String(roomNumber).toLowerCase()
            );
            if (found && found.resident_name) {
                setFieldValue('resident_name', found.resident_name);
            } else {
                setFieldValue('resident_name', '');
            }
        }
    };

    const handleSubmit = async (values, actions) => {
        const name = values.logged_by?.trim();
        if (name && !completedNames.includes(name)) {
            const updated = [...completedNames, name];
            setCompletedNames(updated);
            localStorage.setItem("completedNames", JSON.stringify(updated));
        }
        //Room id Found in userData
        const found = userData.rooms.find(r =>
            String(r.name).toLowerCase() === String(values?.room_number).toLowerCase()
        );
        // Add is_completed and logged_at fields
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const logged_at = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        const rawStringData = { ...values };
        rawStringData['is_completed'] = 0;
        rawStringData['logged_at'] = logged_at;

        const payload = {
            form_type: 2,
            room_id: found?.id,
            data: JSON.stringify(rawStringData)
        };

        try {
            const response = await StaticFormServices.logFormSubmit(payload);
            // Only show toast if success and use ResponseText
            if (response?.ResponseCode === "1") {
                toast.success(response?.ResponseText || "Form submitted successfully.");
                setTimeout(() => {
                    navigate("/staticForms");
                }, 1200);

            }
        } catch (error) {
            toast.error("Form is not submitted. Please try again.");
        } finally {
            setLoading(false);
        }

        // console.log("Payload for API:", payload);
        // actions.resetForm();
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
                    <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema} validateOnBlur={true} validateOnChange={false}>
                        {({ values, handleChange, handleBlur, handleSubmit, setFieldValue, errors, touched, isSubmitting, isValid, submitCount }) => (
                            <form onSubmit={e => {
                                e.preventDefault();
                                handleSubmit();
                                if (!isValid && submitCount === 0) {
                                    toast.warn("Room Number is not valid.");
                                }
                            }}>
                                <Box display="flex" flexDirection="column" gap={2} mx="auto">
                                    <Box display="flex" gap={2}>
                                        <Autocomplete
                                            freeSolo
                                            options={userData?.rooms ? userData.rooms.map(r => r.name) : []}
                                            value={values.room_number}
                                            onInputChange={(e, newValue) => {
                                                setFieldValue('room_number', newValue);
                                                if (userData?.rooms && Array.isArray(userData.rooms)) {
                                                    const found = userData.rooms.find(r =>
                                                        String(r.name).toLowerCase() === String(newValue).toLowerCase()
                                                    );
                                                    if (found && found.resident_name) {
                                                        setFieldValue('resident_name', found.resident_name);
                                                    } else {
                                                        setFieldValue('resident_name', '');
                                                    }
                                                }
                                            }}
                                            onBlur={handleBlur}
                                            fullWidth
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Room Number"
                                                    name="room_number"
                                                    variant="filled"
                                                    fullWidth
                                                    error={touched.room_number && Boolean(errors.room_number)}
                                                    helperText={touched.room_number && errors.room_number}
                                                />
                                            )}
                                            ListboxProps={{
                                                style: {
                                                    maxHeight: 150,
                                                    overflowY: 'auto',
                                                },
                                            }}
                                        />
                                        <TextField
                                            label="Resident Name"
                                            name="resident_name"
                                            value={values.resident_name}
                                            onChange={handleChange}
                                            disabled={true}
                                            onBlur={handleBlur}
                                            variant="filled"
                                            fullWidth
                                            error={touched.resident_name && Boolean(errors.resident_name)}
                                            helperText={touched.resident_name && errors.resident_name}
                                        />
                                    </Box>
                                    <TextField
                                        label="What it is about"
                                        name="log_text"
                                        value={values.log_text}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        variant="filled"
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        error={touched.log_text && Boolean(errors.log_text)}
                                        helperText={touched.log_text && errors.log_text}
                                    />
                                    <Box display="flex" gap={2}>
                                        <Autocomplete
                                            freeSolo
                                            options={completedNames}
                                            value={values.logged_by}
                                            onInputChange={(e, newValue) => setFieldValue('logged_by', newValue)}
                                            fullWidth
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Logged By"
                                                    name="logged_by"
                                                    variant="filled"
                                                    fullWidth
                                                    onBlur={handleBlur}
                                                />
                                            )}
                                            ListboxProps={{
                                                style: {
                                                    maxHeight: 150,
                                                    overflowY: 'auto',
                                                },
                                            }}
                                        />
                                        <TextField
                                            label="Action Taken"
                                            name="action_taken"
                                            value={values.action_taken}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant="filled"
                                            fullWidth
                                        />
                                    </Box>
                                    <TextField
                                        label="Follow up required"
                                        name="follow_up_required"
                                        value={values.follow_up_required}
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
