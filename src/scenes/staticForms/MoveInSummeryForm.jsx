import React, { useEffect, useRef, useState } from "react";
import { Box, Checkbox, FormControlLabel, FormGroup, TextField, Button, Grid, Radio, Typography } from "@mui/material";
import CustomButton from "../../components/CustomButton";
import { Formik } from "formik";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import { Header } from "../../components";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import SignaturePad from 'react-signature-canvas'


import StaticFormServices from "../../services/staticFormServices";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const contarctTeam = [
    { 'Yearly': 'contract_term_yearly' },
    { 'Monthly': 'contract_term_monthly' },
    { 'Weekly': 'contract_term_weekly' },
    { 'Daily': 'contract_term_daily' }]

const payor_information = [
    { "PAD": "payor_information_PAD" },
    { "Post Dated-Cheque": "payor_information_Post_Dated_Cheque" }
]
const Others = [
    { 'Unit Key': 'unit_key' },
    { 'Elpas Fob': 'elpas_fob' }
]

const validationSchema = Yup.object().shape({
    suite_number: Yup.string()
        .trim()
        .required("Please enter Suite Number."),
    contract_signing_date: Yup.string()
        .required("Please select Contract Signing Date."),
    sales_name: Yup.string()
        .trim()
        .required("Please enter Sales Name."),
    contartTeam: Yup.array()
        .min(1, "Please select Contract Term."),
    tenancy_commence_date: Yup.string()
        .required("Please select Tenancy Commence Date."),
    contract_expiry_date: Yup.string()
        .required("Please select Contract Expiry Date."),
    first_resident_name_first_name: Yup.string()
        .trim()
        .required("Please enter First Name of 1st Resident."),
    first_resident_name_last_name: Yup.string()
        .trim()
        .required("Please enter Last Name of 1st Resident."),
    first_resident_dob: Yup.string()
        .required("Please select DOB of 1st Resident."),
    // 2nd Resident validations (conditional)
    second_resident_name_first_name: Yup.string().when('has_2nd_resident', {
        is: true,
        then: schema => schema.trim().required("Please enter First Name of 2nd Resident."),
        otherwise: schema => schema,
    }),
    second_resident_name_last_name: Yup.string().when('has_2nd_resident', {
        is: true,
        then: schema => schema.trim().required("Please enter Last Name of 2nd Resident."),
        otherwise: schema => schema,
    }),
    second_resident_dob: Yup.string().when('has_2nd_resident', {
        is: true,
        then: schema => schema.required("Please select DOB of 2nd Resident."),
        otherwise: schema => schema,
    }),

    first_month_payment_received: Yup.boolean(),
    first_month_payment_received_cheque_note: Yup.string().when('first_month_payment_received', {
        is: true,
        then: schema => schema.trim().required("Please enter Cheque Number for 1st Month Payment."),
        otherwise: schema => schema,
    }),
    first_month_payment_received_cheque_date: Yup.string().when('first_month_payment_received', {
        is: true,
        then: schema => schema.required("Please select Cheque Date for 1st Month Payment."),
        otherwise: schema => schema,
    }),
    first_month_payment_received_cheque_amount: Yup.number().when('first_month_payment_received', {
        is: true,
        then: schema => schema.typeError("Please enter Total for 1st Month Payment..").required("Please enter Total for 1st Month Payment."),
        otherwise: schema => schema,
    }),
    monthly_rate: Yup.string()
        .trim()
        .required("Please enter Monthly Rate."),
    security_deposit_received: Yup.boolean(),
    security_deposit_received_cheque_note: Yup.string().when('security_deposit_received', {
        is: true,
        then: schema => schema.trim().required("Please enter Cheque Number for Security Deposit."),
        otherwise: schema => schema,
    }),
    security_deposit_received_cheque_date: Yup.string().when('security_deposit_received', {
        is: true,
        then: schema => schema.required("Please select Cheque Date for Security Deposit."),
        otherwise: schema => schema,
    }),
    security_deposit_received_cheque_amount: Yup.number().when('security_deposit_received', {
        is: true,
        then: schema => schema.typeError("Please enter Total for Security Deposit.").required("Please enter Total for Security Deposit."),
        otherwise: schema => schema,
    }),
    payor_information_PAD: Yup.boolean(),
    payor_information_Post_Dated_Cheque: Yup.boolean(),
    payor_information_selected: Yup.string().test(
        "payor-information-required",
        "Please select Payor Information",
        function () {
            const { payor_information_PAD, payor_information_Post_Dated_Cheque } = this.parent;
            return payor_information_PAD || payor_information_Post_Dated_Cheque;
        }
    ),
    payor_name: Yup.string().when('payor_information_PAD', {
        is: true,
        then: schema => schema.trim().required("Please enter Payor's Name."),
        otherwise: schema => schema,
    }),
    bank_name: Yup.string().when('payor_information_PAD', {
        is: true,
        then: schema => schema.trim().required("Please enter Bank Name."),
        otherwise: schema => schema,
    }),
    bank_ID: Yup.string().when('payor_information_PAD', {
        is: true,
        then: schema => schema
            .trim()
            .required("Please enter Bank ID.")
            .length(3, "Bank ID must be of 3 digits Only.")
            .matches(/^\d{3}$/, "Bank ID must be of 3 digits Only."),
        otherwise: schema => schema,
    }),
    account_number: Yup.string().when('payor_information_PAD', {
        is: true,
        then: schema => schema.trim().required("Please enter Account Number."),
        otherwise: schema => schema,
    }),
    transit: Yup.string().when('payor_information_PAD', {
        is: true,
        then: schema => schema
            .trim()
            .required("Please enter Transit.")
            .length(5, "Transit must be of 5 digits Only.")
            .matches(/^\d{5}$/, "Transit must be of 5 digits Only."),
        otherwise: schema => schema,
    }),

    unit_key_value: Yup.string().when('unit_key', {
        is: (val) => Boolean(val),
        then: schema => schema.trim().required("Please enter Unit Key."),
        otherwise: schema => schema,
    }),
    elpas_fob_value: Yup.string().when('elpas_fob', {
        is: (val) => Boolean(val),
        then: schema => schema.trim().required("Please enter Elpas Fob."),
        otherwise: schema => schema,
    }),
    resident_signature: Yup.string().required("Signature is required"),
    suite_insurance_copy_received_date: Yup.string().when('suite_insurance_copy_received', {
        is: true,
        then: schema => schema.required("Please select Date for Suite Insurance Copy Received."),
        otherwise: schema => schema,
    }),

    insurance_company_name: Yup.string().when('suite_insurance_coverage_approved', {
        is: true,
        then: schema => schema.trim().required("Please enter Insurance Company Name."),
        otherwise: schema => schema,
    }),
    policy_number: Yup.string().when('suite_insurance_coverage_approved', {
        is: true,
        then: schema => schema.trim().required("Please enter Policy Number."),
        otherwise: schema => schema,
    }),
    reviewed_by: Yup.string()
        .trim()
        .required("Please enter Reviewed by."),
    date: Yup.string()
        .required("Please select Date."),
});

const initialValues = {
    id: "",
    suite_number: "",
    contract_signing_date: "",
    sales_name: "",
    contartTeam: [],
    contract_term_yearly: 0,
    contract_term_monthly: 0,
    contract_term_weekly: 0,
    contract_term_daily: 0,
    tenancy_commence_date: "",
    contract_expiry_date: "",
    // 1st Resident
    first_resident_name_first_name: "",
    first_resident_name_middle_name: "",
    first_resident_name_last_name: "",
    first_resident_dob: "",
    // 2nd Resident
    has_2nd_resident: false,
    second_resident_name_first_name: "",
    second_resident_name_middle_name: "",
    second_resident_name_last_name: "",
    second_resident_dob: "",
    // 1st Month Payment
    first_month_payment_received: false,

    first_month_payment_received_cheque_note: "",
    first_month_payment_received_cheque_date: "",
    first_month_payment_received_cheque_amount: "",

    monthly_rate: "",
    care_plan_rate: "",
    one_time_move_in_fee: null,

    parking_rate: "",
    parking_gst_val: "",
    parking_quantity: 1,

    scooter_rate: "",
    scooter_quantity: 1,

    window_screen_rate: "",
    window_screen_quantity: 1,
    grab_bar_rate: "",
    grab_bar_quantity: 1,
    payment_others_rate: "",

    security_deposit_received: false,
    security_deposit_received_cheque_note: "",
    security_deposit_received_cheque_date: "",
    security_deposit_received_cheque_amount: "",

    half_month_deposit_for_first_resident_rate: "",
    half_month_care_plan_rate: "",

    move_in_out_rate: "",

    elpas_rate: "",
    elpas_quantity: 1,
    garage_fob_rate: "",
    garage_fob_quantity: 1,
    deposit_others_rate: "",

    payor_information_PAD: false,
    payor_information_Post_Dated_Cheque: false,
    payor_information_selected: "",

    payor_name: "",
    bank_name: "",
    bank_ID: "",
    account_number: "",
    transit: "",

    unit_key: 0,
    unit_key_value: "",
    elpas_fob: 0,
    elpas_fob_value: "",

    resident_signature: "",

    suite_insurance_copy_received: false,
    suite_insurance_copy_received_date: "",

    suite_insurance_coverage_approved: false,
    insurance_company_name: "",
    policy_number: "",

    reviewed_by: "",
    date: "",
};

const MoveInSummeryForm = () => {
    const sigPadRef = useRef(null)
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formId, setFormId] = useState();
    const [initialFormValues, setInitialFormValues] = useState(initialValues);
    const [defaultElpasRate, setDefaultElpasRate] = useState(0);
    const [defaultGaregeFobRate, setDefaultGaregeFobRate] = useState(0);
    console.log(location?.state?.formData?.form_data);
    console.log(location?.state?.formData?.attachments)
    useEffect(() => {
        const fetchFormData = async () => {
            setLoading(true);
            try {

                if (location?.state?.formData?.form_data) {
                    setFormId(location.state?.id);
                    setInitialFormValues({
                        ...initialValues,
                        ...location.state.formData.form_data,
                        id: location.state?.id || location.state.formData?.form_data?.id || "",
                        resident_signature: "",
                    });
                    setLoading(false);
                    return;
                }

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
                    ...initialValues,
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
                // Handle error
            } finally {
                setLoading(false);
            }
        };
        fetchFormData();
    }, []);

    const toNumber = (value) => Number(value) || 0;

    const useSignatureHandler = (sigPadRef, values, setFieldValue, setFieldTouched) => {
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

    const useHalfMonthDeposit = (values, initialFormValues, setFieldValue) => {
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
        }, [values.has_2nd_resident, values.monthly_rate]);
    };

    const useHalfCarePlanRate = (values, setFieldValue) => {
        useEffect(() => {
            const rate = toNumber(values.care_plan_rate);
            setFieldValue("half_month_care_plan_rate", rate > 0 ? (rate / 2).toFixed(2) : "");
        }, [values.care_plan_rate]);
    };

    const useRateCalculator = (fieldName, quantity, rate, setFieldValue) => {
        useEffect(() => {
            const qty = toNumber(quantity);
            const unitRate = toNumber(rate);
            setFieldValue(fieldName, qty > 0 && unitRate > 0 ? qty * unitRate : "");
        }, [quantity]);
    };


    const handleSubmit = async (values, actions) => {
        setLoading(true);
        try {
            let signatureData = values.resident_signature;

            if (!signatureData) {
                signatureData = "";
            }

            const byteString = atob(signatureData.split(',')[1]);
            const mimeString = signatureData.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });

            const formData = new FormData();
            if (formId) {
                formData.append("form_id", formId);
            }

            if (signatureData) {
                formData.append("file", blob, `Img_${generateUUID()}.jpg`);
            }

            formData.append("form_type", "3");
            formData.append("data", JSON.stringify(values));

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
    // console.log(initialFormValues);

    return (
        <Box m="20px">
            <Header
                title={"MOVEIN SUMMARY FORM"}
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
                    <Formik
                        initialValues={initialFormValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({
                            values,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            setFieldValue,
                            setFieldTouched,
                            errors,
                            touched,
                            submitCount,
                        }) => {
                            const handleSignatureEnd = useSignatureHandler(sigPadRef, values, setFieldValue, setFieldTouched);

                            useHalfMonthDeposit(values, initialFormValues, setFieldValue);
                            useHalfCarePlanRate(values, setFieldValue);
                            useRateCalculator("elpas_rate", values.elpas_quantity, initialFormValues?.elpas_rate, setFieldValue);
                            useRateCalculator("garage_fob_rate", values.garage_fob_quantity, initialFormValues?.garage_fob_rate, setFieldValue);

                            return (
                                <form onSubmit={handleSubmit}>
                                    <Box display="flex" flexDirection="column" gap={2} mx="auto">
                                        <Box display="flex" gap={2}>
                                            <TextField
                                                label="Suite Number"
                                                name="suite_number"
                                                value={values.suite_number}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                variant="filled"
                                                fullWidth
                                                error={touched.suite_number && Boolean(errors.suite_number)}
                                                helperText={touched.suite_number && errors.suite_number}
                                            />
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Contract Sign Date"
                                                    value={values.contract_signing_date ? dayjs(values.contract_signing_date) : null}
                                                    onChange={(newValue) =>
                                                        setFieldValue("contract_signing_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                    }
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            variant: "filled",
                                                            sx: {},
                                                            error: touched.contract_signing_date && Boolean(errors.contract_signing_date),
                                                            helperText: touched.contract_signing_date && errors.contract_signing_date,
                                                        },
                                                    }}
                                                />
                                            </LocalizationProvider>
                                            <TextField
                                                label="Sales Name"
                                                name="sales_name"
                                                value={values.sales_name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                variant="filled"
                                                fullWidth
                                                error={touched.sales_name && Boolean(errors.sales_name)}
                                                helperText={touched.sales_name && errors.sales_name}
                                            />
                                        </Box>
                                        <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                            <FormGroup row>
                                                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                                                    Cotract Team
                                                </Box>
                                                {contarctTeam.map((item) => {
                                                    const label = Object.keys(item)[0];
                                                    const value = item[label];
                                                    return (
                                                        <Box key={value} sx={{ width: "50%" }}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Radio
                                                                        checked={Array.isArray(values.contartTeam) && values.contartTeam[0] === value}
                                                                        onChange={() => {
                                                                            setFieldValue("contartTeam", [value]); // <-- set as array
                                                                            setFieldValue("contract_term_yearly", value === "contract_term_yearly" ? 1 : 0);
                                                                            setFieldValue("contract_term_monthly", value === "contract_term_monthly" ? 1 : 0);
                                                                            setFieldValue("contract_term_weekly", value === "contract_term_weekly" ? 1 : 0);
                                                                            setFieldValue("contract_term_daily", value === "contract_term_daily" ? 1 : 0);
                                                                        }}
                                                                        name="contartTeam"
                                                                    />
                                                                }
                                                                label={label}
                                                            />
                                                        </Box>
                                                    );
                                                })}
                                            </FormGroup>
                                            {touched.contartTeam && errors.contartTeam && (
                                                <Box sx={{ color: "error.main", fontSize: 13, mt: 1 }}>
                                                    {errors.contartTeam}
                                                </Box>
                                            )}
                                        </Box>
                                        <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <Box display="flex" gap={2}>
                                                    <Box flex={1}>
                                                        <DatePicker
                                                            label="Tenancy Commence Date"
                                                            value={values.tenancy_commence_date ? dayjs(values.tenancy_commence_date) : null}
                                                            onChange={(newValue) =>
                                                                setFieldValue("tenancy_commence_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                            }
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    variant: "filled",
                                                                    error: touched.tenancy_commence_date && Boolean(errors.tenancy_commence_date),
                                                                },
                                                            }}
                                                        />
                                                        {touched.tenancy_commence_date && errors.tenancy_commence_date && (
                                                            <Box sx={{ color: "error.main", fontSize: 13, mt: 0.5 }}>
                                                                {errors.tenancy_commence_date}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <Box flex={1}>
                                                        <DatePicker
                                                            label="Contract Expiry Date"
                                                            value={values.contract_expiry_date ? dayjs(values.contract_expiry_date) : null}
                                                            onChange={(newValue) =>
                                                                setFieldValue("contract_expiry_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                            }
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    variant: "filled",
                                                                    error: touched.contract_expiry_date && Boolean(errors.contract_expiry_date),
                                                                },
                                                            }}
                                                        />
                                                        {touched.contract_expiry_date && errors.contract_expiry_date && (
                                                            <Box sx={{ color: "error.main", fontSize: 13, mt: 0.5 }}>
                                                                {errors.contract_expiry_date}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </LocalizationProvider>
                                        </Box>
                                        <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                            <Box component="label" sx={{ mb: 1, fontWeight: 600, fontSize: 16, width: '100%' }}>
                                                1st Resident
                                            </Box>
                                            <Box display="flex" gap={2} mb={2}>
                                                <TextField
                                                    label="First Name"
                                                    name="first_resident_name_first_name"
                                                    value={values.first_resident_name_first_name || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    variant="filled"
                                                    fullWidth
                                                    error={touched.first_resident_name_first_name && Boolean(errors.first_resident_name_first_name)}
                                                    helperText={touched.first_resident_name_first_name && errors.first_resident_name_first_name}
                                                />
                                                <TextField
                                                    label="Middle Name"
                                                    name="first_resident_name_middle_name"
                                                    value={values.first_resident_name_middle_name || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    variant="filled"
                                                    fullWidth
                                                />
                                            </Box>
                                            <Box display="flex" gap={2}>
                                                <TextField
                                                    label="Last Name"
                                                    name="first_resident_name_last_name"
                                                    value={values.first_resident_name_last_name || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    variant="filled"
                                                    fullWidth
                                                    error={touched.first_resident_name_last_name && Boolean(errors.first_resident_name_last_name)}
                                                    helperText={touched.first_resident_name_last_name && errors.first_resident_name_last_name}
                                                />
                                                <Box flex={1}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker
                                                            label="Date of Birth"
                                                            value={values.first_resident_dob ? dayjs(values.first_resident_dob) : null}
                                                            onChange={(newValue) =>
                                                                setFieldValue("first_resident_dob", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                            }
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    variant: "filled",
                                                                    error: touched.first_resident_dob && Boolean(errors.first_resident_dob),
                                                                },
                                                            }}
                                                        />
                                                    </LocalizationProvider>
                                                    {touched.first_resident_dob && errors.first_resident_dob && (
                                                        <Box sx={{ color: "error.main", fontSize: 13, mt: 0.5 }}>
                                                            {errors.first_resident_dob}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.has_2nd_resident || false}
                                                        onChange={e => setFieldValue('has_2nd_resident', e.target.checked)}
                                                    />
                                                }
                                                label={<Box component="span" sx={{ fontWeight: 600, fontSize: 16, }}>2nd Resident</Box>}
                                                sx={{ mb: 1, mt: 3, width: '100%' }}
                                            />
                                            {values.has_2nd_resident && (
                                                <>
                                                    <Box display="flex" gap={2} mb={2}>
                                                        <TextField
                                                            label="First Name"
                                                            name="second_resident_name_first_name"
                                                            value={values.second_resident_name_first_name || ''}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            variant="filled"
                                                            fullWidth
                                                            error={touched.second_resident_name_first_name && Boolean(errors.second_resident_name_first_name)}
                                                            helperText={touched.second_resident_name_first_name && errors.second_resident_name_first_name}
                                                        />
                                                        <TextField
                                                            label="Middle Name"
                                                            name="second_resident_name_middle_name"
                                                            value={values.second_resident_name_middle_name || ''}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            variant="filled"
                                                            fullWidth
                                                        />
                                                    </Box>
                                                    <Box display="flex" gap={2}>
                                                        <TextField
                                                            label="Last Name"
                                                            name="second_resident_name_last_name"
                                                            value={values.second_resident_name_last_name || ''}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            variant="filled"
                                                            fullWidth
                                                            error={touched.second_resident_name_last_name && Boolean(errors.second_resident_name_last_name)}
                                                            helperText={touched.second_resident_name_last_name && errors.second_resident_name_last_name}
                                                        />
                                                        <Box flex={1}>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <DatePicker
                                                                    label="Date of Birth"
                                                                    value={values.second_resident_dob ? dayjs(values.second_resident_dob) : null}
                                                                    onChange={(newValue) =>
                                                                        setFieldValue("second_resident_dob", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                                    }
                                                                    slotProps={{
                                                                        textField: {
                                                                            fullWidth: true,
                                                                            variant: "filled",
                                                                            error: touched.second_resident_dob && Boolean(errors.second_resident_dob),
                                                                        },
                                                                    }}
                                                                />
                                                            </LocalizationProvider>
                                                            {touched.second_resident_dob && errors.second_resident_dob && (
                                                                <Box sx={{ color: "error.main", fontSize: 13, mt: 0.5 }}>
                                                                    {errors.second_resident_dob}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </>
                                            )}
                                        </Box>
                                        <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                            <Box component="label" sx={{ mb: 1, fontWeight: 600, fontSize: 16, width: '100%' }}>
                                                1st Month Payment
                                            </Box>
                                            <Box>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={values.first_month_payment_received}
                                                            onChange={e => setFieldValue('first_month_payment_received', e.target.checked)}
                                                            name="first_month_payment_received"
                                                        />
                                                    }
                                                    label={<Box component="span" sx={{ fontWeight: 600, fontSize: 14 }}>Received</Box>}
                                                    sx={{ mt: 1 }}
                                                />
                                            </Box>
                                            {values.first_month_payment_received && (
                                                <Box display="flex" gap={2} mt={2}>
                                                    <TextField
                                                        label="Cheque Number"
                                                        name="first_month_payment_received_cheque_note"
                                                        value={values.first_month_payment_received_cheque_note || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="filled"
                                                        fullWidth
                                                        error={Boolean(errors.first_month_payment_received_cheque_note) && (touched.first_month_payment_received_cheque_note || submitCount > 0)}
                                                        helperText={Boolean(errors.first_month_payment_received_cheque_note) && (touched.first_month_payment_received_cheque_note || submitCount > 0) ? errors.first_month_payment_received_cheque_note : ""}
                                                    />

                                                    <Box flex={1}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                label="Cheque Date"
                                                                value={values.first_month_payment_received_cheque_date ? dayjs(values.first_month_payment_received_cheque_date) : null}
                                                                onChange={newValue =>
                                                                    setFieldValue("first_month_payment_received_cheque_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                                }
                                                                slotProps={{
                                                                    textField: {
                                                                        fullWidth: true,
                                                                        variant: "filled",
                                                                        error: touched.first_month_payment_received_cheque_date && Boolean(errors.first_month_payment_received_cheque_date),
                                                                    },
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                        {(Boolean(errors.first_month_payment_received_cheque_date) && (touched.first_month_payment_received_cheque_date || submitCount > 0)) && (
                                                            <Box sx={{ color: "error.main", fontSize: 13, mt: 0.5 }}>
                                                                {errors.first_month_payment_received_cheque_date}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <TextField
                                                        label="Total"
                                                        name="first_month_payment_received_cheque_amount"
                                                        type="number"
                                                        value={values.first_month_payment_received_cheque_amount || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="filled"
                                                        fullWidth
                                                        error={Boolean(errors.first_month_payment_received_cheque_amount) && (touched.first_month_payment_received_cheque_amount || submitCount > 0)}
                                                        helperText={Boolean(errors.first_month_payment_received_cheque_amount) && (touched.first_month_payment_received_cheque_amount || submitCount > 0) ? errors.first_month_payment_received_cheque_amount : ""}
                                                    />
                                                </Box>
                                            )}
                                            <Box display="flex" gap={2} mt={2}>
                                                <TextField
                                                    label="Monthly Rate $"
                                                    name="monthly_rate"
                                                    type="number"
                                                    value={values.monthly_rate || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    variant="filled"
                                                    fullWidth
                                                    error={Boolean(errors.monthly_rate) && (touched.monthly_rate || submitCount > 0)}
                                                    helperText={Boolean(errors.monthly_rate) && (touched.monthly_rate || submitCount > 0) ? errors.monthly_rate : ""}

                                                />
                                                <TextField
                                                    label="Care Plan Rate $"
                                                    name="care_plan_rate"
                                                    type="number"
                                                    value={values.care_plan_rate || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    variant="filled"
                                                    fullWidth
                                                />
                                            </Box>
                                            <Box display="flex" gap={2} mt={2}>
                                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                        One time move in Fees $
                                                    </Box>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16, ml: 2 }}>
                                                        {values?.one_time_move_in_fee}
                                                    </Box>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                        Parking X (
                                                        <TextField
                                                            name="parking_quantity"
                                                            type="number"
                                                            value={values.parking_quantity || 1}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            variant="standard"
                                                            sx={{ width: 40, mx: 0.5, '& input': { textAlign: 'center', fontWeight: 600, fontSize: 16, } }}
                                                            inputProps={{ min: 1 }}
                                                        />
                                                        ) $
                                                    </Box>
                                                    <TextField
                                                        label=""
                                                        name="parking_rate"
                                                        type="number"
                                                        value={values.parking_rate || ''}
                                                        onChange={e => {
                                                            const rate = Number(e.target.value) || 0;
                                                            setFieldValue("parking_rate", rate);

                                                            const gst = (rate * 0.05).toFixed(1);
                                                            setFieldValue("gst_percentage_for_parking", gst);
                                                        }}
                                                        onBlur={handleBlur}
                                                        variant="filled"
                                                        sx={{ width: 120 }}
                                                    />
                                                    <Box component="span" sx={{ fontWeight: 500, fontSize: 15, color: '#888' }}>
                                                        + GST {values?.gst_percentage_for_parking}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box display="flex" gap={2} mt={2}>
                                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                        Scooter X (
                                                        <TextField
                                                            name="scooter_quantity"
                                                            type="number"
                                                            value={values.scooter_quantity || 1}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            variant="standard"
                                                            sx={{ width: 40, mx: 0.5, '& input': { textAlign: 'center', fontWeight: 600, fontSize: 16, } }}
                                                            inputProps={{ min: 1 }}
                                                        />
                                                        ) $
                                                    </Box>
                                                    <TextField
                                                        label=""
                                                        name="scooter_rate"
                                                        type="number"
                                                        value={values.scooter_rate || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="filled"
                                                        sx={{ width: 120 }}
                                                    />
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                        Window Screen X (
                                                        <TextField
                                                            name="window_screen_quantity"
                                                            type="number"
                                                            value={values.window_screen_quantity || 1}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            variant="standard"
                                                            sx={{ width: 40, mx: 0.5, '& input': { textAlign: 'center', fontWeight: 600, fontSize: 16, } }}
                                                            inputProps={{ min: 1 }}
                                                        />
                                                        ) $
                                                    </Box>
                                                    <TextField
                                                        label=""
                                                        name="window_screen_rate"
                                                        type="number"
                                                        value={values.window_screen_rate || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="filled"
                                                        sx={{ width: 120 }}
                                                    />
                                                </Box>
                                            </Box>
                                            <Box display="flex" gap={2} mt={2}>
                                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                        Grab Bar X (
                                                        <TextField
                                                            name="grab_bar_quantity"
                                                            type="number"
                                                            value={values.grab_bar_quantity || 1}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            variant="standard"
                                                            sx={{ width: 40, mx: 0.5, '& input': { textAlign: 'center', fontWeight: 600, fontSize: 16, } }}
                                                            inputProps={{ min: 1 }}
                                                        />
                                                        ) $
                                                    </Box>
                                                    <TextField
                                                        label=""
                                                        name="grab_bar_rate"
                                                        type="number"
                                                        value={values.grab_bar_rate || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="filled"
                                                        sx={{ width: 120 }}
                                                    />
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                        Others $
                                                    </Box>
                                                    <TextField
                                                        name="payment_others_rate"
                                                        type="number"
                                                        value={values.payment_others_rate || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="filled"
                                                        sx={{ width: 120 }}
                                                    />
                                                </Box>
                                            </Box>
                                            <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                                <Box display="flex" alignItems="center" sx={{ mb: 1, fontWeight: 600, fontSize: 16, width: '100%' }}>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                        Security Deposit
                                                    </Box>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={values.security_deposit_received}
                                                                onChange={e => setFieldValue('security_deposit_received', e.target.checked)}
                                                                name="security_deposit_received"
                                                            />
                                                        }
                                                        label={<Box component="span" sx={{ fontWeight: 600, fontSize: 14 }}>Received</Box>}
                                                        sx={{ ml: 3 }}
                                                    />
                                                </Box>
                                                {values.security_deposit_received && (
                                                    <Box display="flex" gap={2} mt={2}>
                                                        <TextField
                                                            label="Cheque Number"
                                                            name="security_deposit_received_cheque_note"
                                                            value={values.security_deposit_received_cheque_note || ''}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            variant="filled"
                                                            fullWidth
                                                            error={Boolean(errors.security_deposit_received_cheque_note) && (touched.security_deposit_received_cheque_note || submitCount > 0)}
                                                            helperText={Boolean(errors.security_deposit_received_cheque_note) && (touched.security_deposit_received_cheque_note || submitCount > 0) ? errors.security_deposit_received_cheque_note : ""}
                                                        />
                                                        <Box flex={1}>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <DatePicker
                                                                    label="Cheque Date"
                                                                    value={values.security_deposit_received_cheque_date ? dayjs(values.security_deposit_received_cheque_date) : null}
                                                                    onChange={newValue =>
                                                                        setFieldValue("security_deposit_received_cheque_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                                    }
                                                                    slotProps={{
                                                                        textField: {
                                                                            fullWidth: true,
                                                                            variant: "filled",
                                                                            error: Boolean(errors.security_deposit_received_cheque_date) && (touched.security_deposit_received_cheque_date || submitCount > 0),
                                                                        },
                                                                    }}
                                                                />
                                                            </LocalizationProvider>
                                                            {(Boolean(errors.security_deposit_received_cheque_date) && (touched.security_deposit_received_cheque_date || submitCount > 0)) && (
                                                                <Box sx={{ color: "error.main", fontSize: 13, mt: 0.5 }}>
                                                                    {errors.security_deposit_received_cheque_date}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                        <TextField
                                                            label="Total"
                                                            name="security_deposit_received_cheque_amount"
                                                            type="number"
                                                            value={values.security_deposit_received_cheque_amount || ''}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            variant="filled"
                                                            fullWidth
                                                            error={Boolean(errors.security_deposit_received_cheque_amount) && (touched.security_deposit_received_cheque_amount || submitCount > 0)}
                                                            helperText={Boolean(errors.security_deposit_received_cheque_amount) && (touched.security_deposit_received_cheque_amount || submitCount > 0) ? errors.security_deposit_received_cheque_amount : ""}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                            <Box display="flex" gap={2} mt={2}>
                                                <Box component="label" sx={{ mb: 1, fontWeight: 600, fontSize: 16, width: '100%' }}>
                                                    1/2 Month Rental Deposit for 1st Resident $
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16, ml: 2 }}>
                                                        {values.half_month_deposit_for_first_resident_rate}
                                                    </Box>
                                                </Box>
                                                <Box component="label" sx={{ mb: 1, fontWeight: 600, fontSize: 16, width: '100%' }}>
                                                    1/2 Month Care Plan $
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16, ml: 2 }}>
                                                        {values.half_month_care_plan_rate}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box display="flex" gap={2} mt={2}>
                                                {values?.has_2nd_resident && (
                                                    <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                        <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                            1/2 Month Rental Deposit for 2nd Resident $
                                                        </Box>
                                                        <Box component="span" sx={{ fontWeight: 600, fontSize: 16, ml: 2 }}>
                                                            {values?.has_2nd_resident && values.halfRentalDeposit2ndRes}
                                                        </Box>
                                                    </Box>
                                                )}
                                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                        Move In/Out $
                                                    </Box>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16, ml: 2 }}>
                                                        {values?.move_in_out_rate}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box display="flex" gap={2} mt={2}>
                                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                        Elpas X (
                                                        <TextField
                                                            name="elpas_quantity"
                                                            type="number"
                                                            value={values.elpas_quantity || 1}
                                                            onChange={e => {
                                                                const count = Number(e.target.value) || 1;
                                                                setFieldValue("elpas_quantity", count);
                                                                setFieldValue("elpas_rate", count * defaultElpasRate);
                                                            }}
                                                            onBlur={handleBlur}
                                                            variant="standard"
                                                            sx={{ width: 40, mx: 0.5, '& input': { textAlign: 'center', fontWeight: 600, fontSize: 16, } }}
                                                            inputProps={{ min: 1 }}
                                                        />
                                                        ) $
                                                    </Box>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16, ml: 2 }}>
                                                        {values.elpas_rate}
                                                    </Box>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                        Garage Fob X (
                                                        <TextField
                                                            name="garage_fob_quantity"
                                                            type="number"
                                                            value={values.garage_fob_quantity || 1}
                                                            onChange={e => {
                                                                const count = Number(e.target.value) || 1;
                                                                setFieldValue("garage_fob_quantity", count);
                                                                setFieldValue("garage_fob_rate", count * defaultGaregeFobRate);
                                                            }}
                                                            onBlur={handleBlur}
                                                            variant="standard"
                                                            sx={{ width: 40, mx: 0.5, '& input': { textAlign: 'center', fontWeight: 600, fontSize: 16, } }}
                                                            inputProps={{ min: 1 }}
                                                        />
                                                        ) $
                                                    </Box>
                                                    <Box component="span" sx={{ fontWeight: 600, fontSize: 16, ml: 2 }}>
                                                        {values?.garage_fob_rate}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2} mt={2}>
                                                <Box component="span" sx={{ fontWeight: 600, fontSize: 16, minWidth: 120 }}>
                                                    Others $
                                                </Box>
                                                <TextField
                                                    name="deposit_others_rate"
                                                    type="number"
                                                    value={values.deposit_others_rate || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    variant="filled"
                                                    fullWidth
                                                    sx={{ maxWidth: 400 }}
                                                />
                                            </Box>
                                            <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                                <FormGroup row>
                                                    <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                                                        Payor Information
                                                    </Box>
                                                    {payor_information.map((item) => {
                                                        const label = Object.keys(item)[0];
                                                        const stateKey = item[label];
                                                        const checked = values[stateKey] || false;
                                                        return (
                                                            <Box key={label} sx={{ width: "50%" }}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={checked}
                                                                            onChange={() => {
                                                                                payor_information.forEach((itm) => {
                                                                                    const key = itm[Object.keys(itm)[0]];
                                                                                    setFieldValue(key, key === stateKey);
                                                                                });
                                                                                setFieldValue("payor_information_selected", label);
                                                                            }}
                                                                            name={stateKey}
                                                                        />
                                                                    }
                                                                    label={label}
                                                                />
                                                            </Box>
                                                        );
                                                    })}
                                                    {(Boolean(errors.payor_information_selected) && submitCount > 0) && (
                                                        <Box sx={{ color: "error.main", fontSize: 13, mt: 1, width: "100%" }}>
                                                            {errors.payor_information_selected}
                                                        </Box>
                                                    )}

                                                    {values.payor_information_PAD && (
                                                        <Box display="flex" flexDirection="column" gap={2} width="100%" mt={2}>
                                                            <Box display="flex" gap={2}>
                                                                <TextField
                                                                    label="Payor's Name"
                                                                    name="payor_name"
                                                                    value={values.payor_name || ''}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    variant="filled"
                                                                    fullWidth
                                                                    error={Boolean(errors.payor_name) && (touched.payor_name || submitCount > 0)}
                                                                    helperText={Boolean(errors.payor_name) && (touched.payor_name || submitCount > 0) ? errors.payor_name : ""}
                                                                />
                                                                <TextField
                                                                    label="Bank Name"
                                                                    name="bank_name"
                                                                    value={values.bank_name || ''}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    variant="filled"
                                                                    fullWidth
                                                                    error={Boolean(errors.bank_name) && (touched.bank_name || submitCount > 0)}
                                                                    helperText={Boolean(errors.bank_name) && (touched.bank_name || submitCount > 0) ? errors.bank_name : ""}
                                                                />
                                                            </Box>
                                                            <Box display="flex" gap={2} width="100%">
                                                                <TextField
                                                                    label="Bank ID # (3 digits)"
                                                                    name="bank_ID"
                                                                    value={values.bank_ID || ''}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    variant="filled"
                                                                    inputProps={{ maxLength: 3 }}
                                                                    fullWidth
                                                                    error={Boolean(errors.bank_ID) && (touched.bank_ID || submitCount > 0)}
                                                                    helperText={Boolean(errors.bank_ID) && (touched.bank_ID || submitCount > 0) ? errors.bank_ID : ""}
                                                                />
                                                                <TextField
                                                                    label="Account Number"
                                                                    name="account_number"
                                                                    value={values.account_number || ''}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    variant="filled"
                                                                    fullWidth
                                                                    error={Boolean(errors.account_number) && (touched.account_number || submitCount > 0)}
                                                                    helperText={Boolean(errors.account_number) && (touched.account_number || submitCount > 0) ? errors.account_number : ""}
                                                                />
                                                                <TextField
                                                                    label="Transit # (5 digits)"
                                                                    name="transit"
                                                                    value={values.transit || ''}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    variant="filled"
                                                                    inputProps={{ maxLength: 5 }}
                                                                    fullWidth
                                                                    error={Boolean(errors.transit) && (touched.transit || submitCount > 0)}
                                                                    helperText={Boolean(errors.transit) && (touched.transit || submitCount > 0) ? errors.transit : ""}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </FormGroup>
                                            </Box>
                                            <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                                <FormGroup row>
                                                    <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                                                        Others
                                                    </Box>
                                                    {Others.map((item) => {
                                                        const label = Object.keys(item)[0];
                                                        const stateKey = item[label];
                                                        const checked = Boolean(values[stateKey]);
                                                        const otherValKey = stateKey === "unit_key" ? "unit_key_value" : stateKey === "elpas_fob" ? "elpas_fob_value" : "";

                                                        return (
                                                            <Box key={label} sx={{ width: "50%" }}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={checked}
                                                                            onChange={() => {
                                                                                setFieldValue(stateKey, checked ? 0 : 1);
                                                                                if (!checked && otherValKey) setFieldValue(otherValKey, "");
                                                                            }}
                                                                            name={stateKey}
                                                                        />
                                                                    }
                                                                    label={label}
                                                                />
                                                                {checked && otherValKey && (
                                                                    <TextField
                                                                        label={`${label} Value`}
                                                                        name={otherValKey}
                                                                        value={values[otherValKey] || ''}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        variant="filled"
                                                                        sx={{ mt: 1, width: '95%' }}
                                                                        error={Boolean(errors[otherValKey]) && (touched[otherValKey] || submitCount > 0)}
                                                                        helperText={Boolean(errors[otherValKey]) && (touched[otherValKey] || submitCount > 0) ? errors[otherValKey] : ""}
                                                                    />
                                                                )}
                                                            </Box>
                                                        );
                                                    })}
                                                </FormGroup>
                                                <Box sx={{ mt: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#1976d2" />
                                                        </svg>
                                                        <Box component="label" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                            Resident Signature
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ position: 'relative', display: 'inline-block', width: 400 }}>
                                                        <SignaturePad
                                                            canvasProps={{
                                                                width: 400,
                                                                height: 150,
                                                                style: {
                                                                    border: '2px solid #1976d2',
                                                                    borderRadius: 8,
                                                                    background: '#fff',
                                                                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                                                                },
                                                            }}
                                                            ref={sigPadRef}
                                                            onEnd={handleSignatureEnd}
                                                        />

                                                        {Boolean(errors.resident_signature) &&
                                                            (touched.resident_signature || submitCount > 0) && (
                                                                <Typography sx={{ color: "error.main", fontSize: 13, mt: 1 }}>
                                                                    {errors.resident_signature}
                                                                </Typography>
                                                            )
                                                        }
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                                            <Button
                                                                onClick={() => {
                                                                    sigPadRef.current.clear()
                                                                    setFieldValue("resident_signature", "")
                                                                    setFieldTouched("resident_signature", true)
                                                                }}
                                                                sx={{ mt: 1 }}
                                                                variant="outlined"
                                                                color="primary"
                                                            >
                                                                Clear
                                                            </Button>
                                                        </Box>
                                                    </Box>

                                                </Box>
                                                <FormGroup row sx={{ mt: 2 }}>
                                                    {[
                                                        { label: 'Suite insurance Copy Received', name: 'suite_insurance_copy_received' },
                                                        { label: 'Suite insurance Coverage Approved', name: 'suite_insurance_coverage_approved' }
                                                    ].map((item) => (
                                                        <Box key={item.name} sx={{ width: "50%" }}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={values[item.name] || false}
                                                                        onChange={e => setFieldValue(item.name, e.target.checked)}
                                                                        name={item.name}
                                                                    />
                                                                }
                                                                label={item.label}
                                                            />
                                                            {item.name === 'suite_insurance_copy_received' && values.suite_insurance_copy_received && (
                                                                <>
                                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                        <DatePicker
                                                                            label="Copy Received Date"
                                                                            value={values.suite_insurance_copy_received_date ? dayjs(values.suite_insurance_copy_received_date) : null}
                                                                            onChange={newValue => setFieldValue('suite_insurance_copy_received_date', newValue ? newValue.format('YYYY-MM-DD') : '')}
                                                                            slotProps={{
                                                                                textField: {
                                                                                    fullWidth: true,
                                                                                    variant: 'filled',
                                                                                    sx: { mt: 1, width: '95%' }
                                                                                },
                                                                            }}
                                                                        />
                                                                    </LocalizationProvider>
                                                                    {Boolean(errors.suite_insurance_copy_received_date) && (touched.suite_insurance_copy_received_date || submitCount > 0) && (
                                                                        <Box sx={{ color: "error.main", fontSize: 13, mt: 0.5 }}>
                                                                            {errors.suite_insurance_copy_received_date}
                                                                        </Box>
                                                                    )}
                                                                </>
                                                            )}
                                                            {item.name === 'suite_insurance_coverage_approved' && values.suite_insurance_coverage_approved && (
                                                                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                                                                    <TextField
                                                                        label="Insurance Company Name"
                                                                        name="insurance_company_name"
                                                                        value={values.insurance_company_name || ''}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        variant="filled"
                                                                        fullWidth
                                                                        error={Boolean(errors.insurance_company_name) && (touched.insurance_company_name || submitCount > 0)}
                                                                        helperText={Boolean(errors.insurance_company_name) && (touched.insurance_company_name || submitCount > 0) ? errors.insurance_company_name : ""}
                                                                    />
                                                                    <TextField
                                                                        label="Policy Number"
                                                                        name="policy_number"
                                                                        value={values.policy_number || ''}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        variant="filled"
                                                                        fullWidth
                                                                        error={Boolean(errors.policy_number) && (touched.policy_number || submitCount > 0)}
                                                                        helperText={Boolean(errors.policy_number) && (touched.policy_number || submitCount > 0) ? errors.policy_number : ""}
                                                                    />
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    ))}
                                                </FormGroup>
                                            </Box>
                                            <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label="Reviewed by"
                                                            name="reviewed_by"
                                                            value={values.reviewed_by || ''}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            variant="filled"
                                                            fullWidth
                                                            error={Boolean(errors.reviewed_by) && (touched.reviewed_by || submitCount > 0)}
                                                            helperText={Boolean(errors.reviewed_by) && (touched.reviewed_by || submitCount > 0) ? errors.reviewed_by : ""}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                label="Date"
                                                                value={values.date ? dayjs(values.date) : null}
                                                                onChange={newValue => setFieldValue('date', newValue ? newValue.format('YYYY-MM-DD') : '')}
                                                                slotProps={{
                                                                    textField: {
                                                                        fullWidth: true,
                                                                        variant: 'filled',
                                                                        sx: { width: '95%' },
                                                                        error: Boolean(errors.date) && (touched.date || submitCount > 0), // <-- Add this line
                                                                    },
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                        {Boolean(errors.date) && (touched.date || submitCount > 0) && (
                                                            <Box sx={{ color: "error.main", fontSize: 13, mt: 0.5 }}>
                                                                {errors.date}
                                                            </Box>
                                                        )}

                                                    </Grid>
                                                </Grid>
                                            </Box>


                                        </Box>

                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            mt="20px"
                                        >
                                            <CustomButton
                                                type="submit"
                                                disabled={loading}
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
                            )
                        }}
                    </Formik>
                </>
            )}
        </Box>
    );
};

export default MoveInSummeryForm;
