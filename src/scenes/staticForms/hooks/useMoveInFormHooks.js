import { useEffect } from "react";
import { toNumber } from "../utils/moveInFormHelpers";

// Handle signature canvas operations
export const useSignatureHandler = (sigPadRef, values, setFieldValue, setFieldTouched) => {
    const handleEnd = () => {
        if (sigPadRef.current?.isEmpty()) {
            setFieldValue("resident_signature", "");
            setFieldTouched("resident_signature", true, false);
        } else {
            const dataUrl = sigPadRef.current.getCanvas().toDataURL("image/png");
            setFieldValue("resident_signature", dataUrl, true);
            setFieldTouched("resident_signature", true, false);
        }
    };

    useEffect(() => {
        if (sigPadRef.current && values.resident_signature && sigPadRef.current.isEmpty()) {
            try {
                sigPadRef.current.fromDataURL(values.resident_signature);
            } catch (e) {
                console.error("Error loading signature:", e);
            }
        }
    }, [values.resident_signature]);

    return handleEnd;
};

// Calculate half month deposit for first resident based on monthly rate and second resident status
export const useHalfMonthDeposit = (values, initialFormValues, setFieldValue) => {
    useEffect(() => {
        const baseDeposit = toNumber(initialFormValues?.halfRentalDeposit2ndRes) * 2;
        const monthlyRate = toNumber(values.monthly_rate);

        if (monthlyRate > 0) {
            const value = values.has_2nd_resident
                ? (monthlyRate > baseDeposit ? ((monthlyRate - baseDeposit) / 2).toFixed(2) : "")
                : (monthlyRate / 2).toFixed(2);
            setFieldValue("half_month_deposit_for_first_resident_rate", value);
        } else {
            setFieldValue("half_month_deposit_for_first_resident_rate", "");
        }
    }, [values.has_2nd_resident, values.monthly_rate, initialFormValues, setFieldValue]);
};

// Calculate half month care plan rate
export const useHalfCarePlanRate = (values, setFieldValue) => {
    useEffect(() => {
        const rate = toNumber(values.care_plan_rate);
        setFieldValue("half_month_care_plan_rate", rate > 0 ? (rate / 2).toFixed(2) : "");
    }, [values.care_plan_rate, setFieldValue]);
};
