import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StaticFormServices from "../../../services/staticFormServices";
import {
    getRoomIdByNumber,
    getResidentNameByRoom,
    getAvailableRoomNumbers,
    prepareLogFormPayload,
} from "../utils/logFormHelpers";

// Main hook for logForm state and logic management
export const useLogForm = (userData, completedNames, addCompletedName) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Handle form submission
    const handleSubmit = async (values, actions) => {
        setLoading(true);
        try {
            // Add name to completed names list
            addCompletedName(values.logged_by);

            // Get room ID
            const roomId = getRoomIdByNumber(values.room_number, userData);

            if (!roomId) {
                toast.error("Room not found. Please select a valid room.");
                setLoading(false);
                return;
            }

            // Prepare payload
            const payload = prepareLogFormPayload(values, roomId);

            // Submit form
            const response = await StaticFormServices.logFormSubmit(payload);

            if (response?.ResponseCode === "1") {
                toast.success(response?.ResponseText || "Form submitted successfully.");
                setTimeout(() => {
                    navigate("/staticForms");
                }, 1200);
            } else {
                toast.error("Form submission failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during form submission:", error);
            toast.error("Form is not submitted. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle room number change with auto-fill resident name
    const handleRoomNumberChange = (newValue, setFieldValue) => {
        setFieldValue("room_number", newValue);
        
        const residentName = getResidentNameByRoom(newValue, userData);
        setFieldValue("resident_name", residentName);
    };

    // Get available room numbers for autocomplete
    const availableRoomNumbers = getAvailableRoomNumbers(userData);

    return {
        loading,
        handleSubmit,
        handleRoomNumberChange,
        availableRoomNumbers,
    };
};
