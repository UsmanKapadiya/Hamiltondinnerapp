import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StaticFormServices from "../../../services/staticFormServices";
import { initialMoveInFormValues } from "../config/moveInFormConfig";
import { processSignatureData, prepareFormData } from "../utils/moveInFormHelpers";

// Main hook for form state and logic management
export const useMoveInForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formId, setFormId] = useState();
    const [initialFormValues, setInitialFormValues] = useState(initialMoveInFormValues);
    const [defaultElpasRate, setDefaultElpasRate] = useState(0);
    const [defaultGaregeFobRate, setDefaultGaregeFobRate] = useState(0);

    // Fetch form data on component mount
    useEffect(() => {
        const fetchFormData = async () => {
            setLoading(true);
            try {
                // Check if editing existing form
                if (location?.state?.formData?.form_data) {
                    setFormId(location.state?.id);
                    setInitialFormValues({
                        ...initialMoveInFormValues,
                        ...location.state.formData.form_data,
                        id: location.state?.id || location.state.formData?.form_data?.id || "",
                        resident_signature: "",
                    });
                    setLoading(false);
                    return;
                }

                // Fetch default values for new form
                const response = await StaticFormServices.getDefaultValue();
                const data = response?.Data || {};

                const parkingRate = parseFloat(data.parking_rate || 0);
                const gstParkingPercentage = parseFloat(data.gst_percentage_for_parking || 0);
                const parkingGST = parkingRate * gstParkingPercentage / 100;
                const monthlyRate2ndRes = parseFloat(data.monthly_rate_for_second_resident || 0);
                const halfRentalDeposit2ndRes = monthlyRate2ndRes / 2;

                setDefaultElpasRate(Number(data?.elpas_rate) || 0);
                setDefaultGaregeFobRate(Number(data?.garage_fob_rate) || 0);
                
                setInitialFormValues({
                    ...initialMoveInFormValues,
                    elpas_rate: Number(data?.elpas_rate) || 0,
                    garage_fob_rate: Number(data.garage_fob_rate) || 0,
                    gst_percentage_for_parking: parkingGST.toFixed(2),
                    one_time_move_in_fee: data.one_time_move_in_fee || "",
                    parking_rate: data.parking_rate || "",
                    halfRentalDeposit2ndRes: halfRentalDeposit2ndRes.toFixed(2),
                    move_in_out_rate: data.move_in_out_rate || "",
                    elpas_quantity: 1,
                });
            } catch (error) {
                console.error("Error fetching form data:", error);
                toast.error("Failed to load form data");
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, [location]);

    // Handle form submission
    const handleSubmit = async (values, actions) => {
        setLoading(true);
        try {
            let signatureData = values.resident_signature;

            if (!signatureData) {
                signatureData = "";
            }

            const signatureBlob = processSignatureData(signatureData);
            const formData = prepareFormData(values, signatureBlob, formId, Boolean(formId));

            let response;
            if (formId) {
                response = await StaticFormServices.moveInSummeryUpdate(formData);
                if (response?.ResponseCode === "1") {
                    toast.success("Form Updated successfully.");
                    setTimeout(() => {
                        navigate("/staticForms");
                    }, 1200);
                }
            } else {
                response = await StaticFormServices.moveInSummerySubmit(formData);
                if (response?.ResponseCode === "1") {
                    toast.success(response?.ResponseText || "Form submitted successfully.");
                    setTimeout(() => {
                        navigate("/staticForms");
                    }, 1200);
                }
            }
        } catch (error) {
            console.error("Error during form submission:", error);
            toast.error("Form is not submitted. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        formId,
        initialFormValues,
        defaultElpasRate,
        defaultGaregeFobRate,
        handleSubmit,
    };
};
