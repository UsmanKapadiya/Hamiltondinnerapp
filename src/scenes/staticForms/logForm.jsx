import React from "react";
import { Box, TextField, Autocomplete } from "@mui/material";
import CustomButton from "../../components/CustomButton";
import { Formik } from "formik";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import { Header } from "../../components";
import { toast } from "react-toastify";

// Import configuration and utilities
import {
  initialLogFormValues,
  logFormValidationSchema,
} from "./config/logFormConfig";
import { useUserData, useCompletedNames } from "./hooks/useLogFormHooks";
import { useLogForm } from "./hooks/useLogForm";

const LogForm = () => {
  // Use custom hooks for state management
  const userData = useUserData();
  const { completedNames, addCompletedName } = useCompletedNames();
  const {
    loading,
    handleSubmit,
    handleRoomNumberChange,
    availableRoomNumbers,
  } = useLogForm(userData, completedNames, addCompletedName);

  return (
    <Box m="20px">
      <Header title={"LOG FORM"} Buttons={false} />
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
          <Formik
            initialValues={initialLogFormValues}
            onSubmit={handleSubmit}
            validationSchema={logFormValidationSchema}
            validateOnBlur={true}
            validateOnChange={false}
          >
            {({
              values,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              errors,
              touched,
              isSubmitting,
              isValid,
              submitCount,
            }) => (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                  if (!isValid && submitCount === 0) {
                    toast.warn("Room Number is not valid.");
                  }
                }}
              >
                <Box display="flex" flexDirection="column" gap={2} mx="auto">
                  <Box display="flex" gap={2}>
                    <Autocomplete
                      freeSolo
                      options={availableRoomNumbers}
                      value={values.room_number}
                      onInputChange={(e, newValue) => {
                        handleRoomNumberChange(newValue, setFieldValue);
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
                          error={
                            touched.room_number && Boolean(errors.room_number)
                          }
                          helperText={touched.room_number && errors.room_number}
                        />
                      )}
                      ListboxProps={{
                        style: {
                          maxHeight: 150,
                          overflowY: "auto",
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
                      error={
                        touched.resident_name && Boolean(errors.resident_name)
                      }
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
                      onInputChange={(e, newValue) =>
                        setFieldValue("logged_by", newValue)
                      }
                      fullWidth
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Logged By"
                          name="logged_by"
                          variant="filled"
                          fullWidth
                          onBlur={handleBlur}
                          error={touched.logged_by && Boolean(errors.logged_by)}
                          helperText={touched.logged_by && errors.logged_by}
                        />
                      )}
                      ListboxProps={{
                        style: {
                          maxHeight: 150,
                          overflowY: "auto",
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
                        bgcolor: "#1976d2",
                        color: "#fcfcfc",
                        fontSize: "16px",
                        fontWeight: "bold",
                        p: "10px 20px",
                        mt: "18px",
                        transition: ".3s ease",
                        ":hover": {
                          bgcolor: "#115293",
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
