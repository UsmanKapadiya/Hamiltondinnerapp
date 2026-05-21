import * as Yup from "yup";

// Initial Form Values
export const initialLogFormValues = {
    room_number: "",
    resident_name: "",
    log_text: "",
    logged_by: "",
    action_taken: "",
    follow_up_required: "",
};

// Validation Schema
export const logFormValidationSchema = Yup.object({
    room_number: Yup.string().required("Room Number is required"),
    resident_name: Yup.string().required("Resident Name is required"),
    log_text: Yup.string().required("This field is required"),
    logged_by: Yup.string().required("Logged By is required"),
});
