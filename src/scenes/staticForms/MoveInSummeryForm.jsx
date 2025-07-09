import React, { useRef, useState } from "react";
import { Box, Checkbox, FormControlLabel, FormGroup, TextField, Button } from "@mui/material";
import CustomButton from "../../components/CustomButton";
import { LoginOutlined } from "@mui/icons-material";
import { Formik } from "formik";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import { Header } from "../../components";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import SignatureCanvas from "react-signature-canvas";

const initialValues = {
    suiteNumber: "",
    contarctSignDate: "",
    salesName: "",
    contartTeam: [],
    tenancyCommenceDate: "",
    contractExpiryDate: "",
    // 1st Resident
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    // 2nd Resident
    showSecondResident: false,
    secondFirstName: "",
    secondMiddleName: "",
    secondLastName: "",
    secondDob: "",
    // 1st Month Payment
    firstMonthPaymentReceived: false,
    monthlyRate: "",
    carePlanRate: "",
    parkingCount: 1,
    parkingFee: "",
    scooterCount: 1,
    scooterFee: "",
    windowScreenCount: 1,
    windowScreenFee: "",
    grabBarCount: 1,
    grabBarFee: "",
    othersFee: "",
    elpasCount: 1,
    garageFobCount: 1,
    othersFullRowFee: "",
    securityDepositReceived: false,
    padChecked: false,
    postDatedChequeChecked: false,
    padPayorName: "",
    padBankName: "",
    padBankId: "",
    padAccountNumber: "",
    padTransitNumber: "",
    unitKeyValue: "",
    elpasFobValue: "",
    suiteInsuranceCopyReceived: false,
    suiteInsuranceCoverageApproved: false,
    suiteInsuranceCopyReceivedDate: "",
    suiteInsuranceCoverageApprovedCompany: "",
    suiteInsuranceCoverageApprovedPolicy: "",
    reviewedBy: "",
    reviewedDate: "",
};

const MoveInSummeryForm = () => {
    const sigPadRef = useRef();

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
                        {({ values, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
                            <form onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap={2} mx="auto">
                                    <Box display="flex" gap={2}>
                                        <TextField
                                            label="Suite Number"
                                            name="suiteNumber"
                                            value={values.suiteNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant="filled"
                                            fullWidth
                                        />
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label="Contract Sign Date"
                                                value={values.contarctSignDate ? dayjs(values.contarctSignDate) : null}
                                                onChange={(newValue) =>
                                                    setFieldValue("contarctSignDate", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                }
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        variant: "filled",
                                                        sx: {},
                                                    },
                                                }}
                                            />
                                        </LocalizationProvider>
                                        <TextField
                                            label="Sales Name"
                                            name="salesName"
                                            value={values.salesName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant="filled"
                                            fullWidth
                                        />
                                    </Box>
                                    <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                        <FormGroup row>
                                            <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                                                Cotract Team
                                            </Box>
                                            {['Yearly', 'Monthly', 'Weekly', 'Daily'].map((option) => (
                                                <Box key={option} sx={{ width: "50%" }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={values.contartTeam?.includes(option) || false}
                                                                onChange={() => {
                                                                    const current = values.contartTeam || [];
                                                                    if (current.includes(option)) {
                                                                        setFieldValue(
                                                                            "contartTeam",
                                                                            current.filter((item) => item !== option)
                                                                        );
                                                                    } else {
                                                                        setFieldValue("contartTeam", [...current, option]);
                                                                    }
                                                                }}
                                                                name="contartTeam"
                                                            />
                                                        }
                                                        label={option}
                                                    />
                                                </Box>
                                            ))}
                                        </FormGroup>
                                    </Box>
                                    <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <Box display="flex" gap={2}>
                                                <DatePicker
                                                    label="Tenancy Commence Date"
                                                    value={values.tenancyCommenceDate ? dayjs(values.tenancyCommenceDate) : null}
                                                    onChange={(newValue) =>
                                                        setFieldValue("tenancyCommenceDate", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                    }
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            variant: "filled",
                                                        },
                                                    }}
                                                />
                                                <DatePicker
                                                    label="Contract Expiry Date"
                                                    value={values.contractExpiryDate ? dayjs(values.contractExpiryDate) : null}
                                                    onChange={(newValue) =>
                                                        setFieldValue("contractExpiryDate", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                    }
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            variant: "filled",
                                                        },
                                                    }}
                                                />
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
                                                name="firstName"
                                                value={values.firstName || ''}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                variant="filled"
                                                fullWidth
                                            />
                                            <TextField
                                                label="Middle Name"
                                                name="middleName"
                                                value={values.middleName || ''}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                variant="filled"
                                                fullWidth
                                            />
                                        </Box>
                                        <Box display="flex" gap={2}>
                                            <TextField
                                                label="Last Name"
                                                name="lastName"
                                                value={values.lastName || ''}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                variant="filled"
                                                fullWidth
                                            />
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Date of Birth"
                                                    value={values.dob ? dayjs(values.dob) : null}
                                                    onChange={(newValue) =>
                                                        setFieldValue("dob", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                    }
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            variant: "filled",
                                                        },
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </Box>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={values.showSecondResident || false}
                                                    onChange={e => setFieldValue('showSecondResident', e.target.checked)}
                                                />
                                            }
                                            label={<Box component="span" sx={{ fontWeight: 600, fontSize: 16, }}>2nd Resident</Box>}
                                            sx={{ mb: 1, mt: 3, width: '100%' }}
                                        />
                                        {values.showSecondResident && (
                                            <>
                                                <Box display="flex" gap={2} mb={2}>
                                                    <TextField
                                                        label="First Name"
                                                        name="secondFirstName"
                                                        value={values.secondFirstName || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="filled"
                                                        fullWidth
                                                    />
                                                    <TextField
                                                        label="Middle Name"
                                                        name="secondMiddleName"
                                                        value={values.secondMiddleName || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="filled"
                                                        fullWidth
                                                    />
                                                </Box>
                                                <Box display="flex" gap={2}>
                                                    <TextField
                                                        label="Last Name"
                                                        name="secondLastName"
                                                        value={values.secondLastName || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="filled"
                                                        fullWidth
                                                    />
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker
                                                            label="Date of Birth"
                                                            value={values.secondDob ? dayjs(values.secondDob) : null}
                                                            onChange={(newValue) =>
                                                                setFieldValue("secondDob", newValue ? newValue.format("YYYY-MM-DD") : "")
                                                            }
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    variant: "filled",
                                                                },
                                                            }}
                                                        />
                                                    </LocalizationProvider>
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
                                                        checked={values.firstMonthPaymentReceived}
                                                        onChange={e => setFieldValue('firstMonthPaymentReceived', e.target.checked)}
                                                        name="firstMonthPaymentReceived"
                                                    />
                                                }
                                                label={<Box component="span" sx={{ fontWeight: 600, fontSize: 14 }}>Received</Box>}
                                                sx={{ mt: 1 }}
                                            />
                                        </Box>
                                        <Box display="flex" gap={2} mt={2}>
                                            <TextField
                                                label="Monthly Rate $"
                                                name="monthlyRate"
                                                type="number"
                                                value={values.monthlyRate || ''}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                variant="filled"
                                                fullWidth
                                            />
                                            <TextField
                                                label="Care Plan Rate $"
                                                name="carePlanRate"
                                                type="number"
                                                value={values.carePlanRate || ''}
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
                                                    250
                                                </Box>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                    Parking X (
                                                    <TextField
                                                        name="parkingCount"
                                                        type="number"
                                                        value={values.parkingCount || 1}
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
                                                    name="parkingFee"
                                                    type="number"
                                                    value={values.parkingFee || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    variant="filled"
                                                    sx={{ width: 120 }}
                                                />
                                                <Box component="span" sx={{ fontWeight: 500, fontSize: 15, color: '#888' }}>+ GST 7.5</Box>
                                            </Box>
                                        </Box>
                                        <Box display="flex" gap={2} mt={2}>
                                            <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                    Scooter X (
                                                    <TextField
                                                        name="scooterCount"
                                                        type="number"
                                                        value={values.scooterCount || 1}
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
                                                    name="scooterFee"
                                                    type="number"
                                                    value={values.scooterFee || ''}
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
                                                        name="windowScreenCount"
                                                        type="number"
                                                        value={values.windowScreenCount || 1}
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
                                                    name="windowScreenFee"
                                                    type="number"
                                                    value={values.windowScreenFee || ''}
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
                                                        name="grabBarCount"
                                                        type="number"
                                                        value={values.grabBarCount || 1}
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
                                                    name="grabBarFee"
                                                    type="number"
                                                    value={values.grabBarFee || ''}
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
                                                    name="othersFee"
                                                    type="number"
                                                    value={values.othersFee || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    variant="filled"
                                                    sx={{ width: 120 }}
                                                />
                                            </Box>
                                        </Box>
                                        <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                            <Box component="label" sx={{ mb: 1, fontWeight: 600, fontSize: 16, width: '100%' }}>
                                                Security Deposit
                                            </Box>
                                            <Box>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={values.securityDepositReceived}
                                                            onChange={e => setFieldValue('securityDepositReceived', e.target.checked)}
                                                            name="securityDepositReceived"
                                                        />
                                                    }
                                                    label={<Box component="span" sx={{ fontWeight: 600, fontSize: 14 }}>Received</Box>}
                                                    sx={{ mt: 1 }}
                                                />
                                            </Box>
                                        </Box>
                                        <Box display="flex" gap={2} mt={2}>
                                            <Box component="label" sx={{ mb: 1, fontWeight: 600, fontSize: 16, width: '100%' }}>
                                                1/2 Month Rental Deposit for 1st Resident $
                                            </Box>
                                            <Box component="label" sx={{ mb: 1, fontWeight: 600, fontSize: 16, width: '100%' }}>
                                                1/2 Month Care Plan $
                                            </Box>
                                        </Box>
                                        <Box display="flex" gap={2} mt={2}>
                                            <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                    1/2 Month Rental Deposit for 2nd Resident $
                                                </Box>
                                                <Box component="span" sx={{ fontWeight: 600, fontSize: 16, ml: 2 }}>
                                                    500.0
                                                </Box>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                    Move In/Out $
                                                </Box>
                                                <Box component="span" sx={{ fontWeight: 600, fontSize: 16, ml: 2 }}>
                                                    500
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box display="flex" gap={2} mt={2}>
                                            <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                    Elpas X (
                                                    <TextField
                                                        name="elpasCount"
                                                        type="number"
                                                        value={values.elpasCount || 1}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="standard"
                                                        sx={{ width: 40, mx: 0.5, '& input': { textAlign: 'center', fontWeight: 600, fontSize: 16, } }}
                                                        inputProps={{ min: 1 }}
                                                    />
                                                    ) $
                                                </Box>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                <Box component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
                                                    Garage Fob X (
                                                    <TextField
                                                        name="garageFobCount"
                                                        type="number"
                                                        value={values.garageFobCount || 1}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        variant="standard"
                                                        sx={{ width: 40, mx: 0.5, '& input': { textAlign: 'center', fontWeight: 600, fontSize: 16, } }}
                                                        inputProps={{ min: 1 }}
                                                    />
                                                    ) $
                                                </Box>
                                                <Box component="span" sx={{ fontWeight: 600, fontSize: 16, ml: 2 }}>
                                                    250
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={2} mt={2}>
                                            <Box component="span" sx={{ fontWeight: 600, fontSize: 16, minWidth: 120 }}>
                                                Others $
                                            </Box>
                                            <TextField
                                                name="othersFullRowFee"
                                                type="number"
                                                value={values.othersFullRowFee || ''}
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
                                                {['PAD', 'Post Dated-Cheque'].map((option) => (
                                                    <Box key={option} sx={{ width: "50%" }}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={values.contartTeam?.includes(option) || false}
                                                                    onChange={() => {
                                                                        const current = values.contartTeam || [];
                                                                        if (current.includes(option)) {
                                                                            setFieldValue(
                                                                                "contartTeam",
                                                                                current.filter((item) => item !== option)
                                                                            );
                                                                        } else {
                                                                            setFieldValue("contartTeam", [...current, option]);
                                                                        }
                                                                    }}
                                                                    name="contartTeam"
                                                                />
                                                            }
                                                            label={option}
                                                        />
                                                    </Box>
                                                ))}
                                                {/* PAD extra fields */}
                                                {values.contartTeam?.includes('PAD') && (
                                                    <Box display="flex" flexDirection="column" gap={2} width="100%" mt={2}>
                                                        <Box display="flex" gap={2}>
                                                            <TextField
                                                                label="Payor's Name"
                                                                name="padPayorName"
                                                                value={values.padPayorName || ''}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                variant="filled"
                                                                fullWidth
                                                            />
                                                            <TextField
                                                                label="Bank Name"
                                                                name="padBankName"
                                                                value={values.padBankName || ''}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                variant="filled"
                                                                fullWidth
                                                            />
                                                        </Box>
                                                        <Box display="flex" gap={2}>
                                                            <TextField
                                                                label="Bank ID # (3 digits)"
                                                                name="padBankId"
                                                                value={values.padBankId || ''}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                variant="filled"
                                                                inputProps={{ maxLength: 3 }}
                                                                sx={{ maxWidth: 200 }}
                                                            />
                                                            <TextField
                                                                label="Account Number"
                                                                name="padAccountNumber"
                                                                value={values.padAccountNumber || ''}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                variant="filled"
                                                                sx={{ maxWidth: 250 }}
                                                            />
                                                            <TextField
                                                                label="Transit # (5 digits)"
                                                                name="padTransitNumber"
                                                                value={values.padTransitNumber || ''}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                variant="filled"
                                                                inputProps={{ maxLength: 5 }}
                                                                sx={{ maxWidth: 200 }}
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
                                                {['Unit Key', 'Elpas Fob'].map((option) => (
                                                    <Box key={option} sx={{ width: "50%" }}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={values.contartTeam?.includes(option) || false}
                                                                    onChange={() => {
                                                                        const current = values.contartTeam || [];
                                                                        if (current.includes(option)) {
                                                                            setFieldValue(
                                                                                "contartTeam",
                                                                                current.filter((item) => item !== option)
                                                                            );
                                                                        } else {
                                                                            setFieldValue("contartTeam", [...current, option]);
                                                                        }
                                                                    }}
                                                                    name="contartTeam"
                                                                />
                                                            }
                                                            label={option}
                                                        />
                                                        {/* Show input if checked */}
                                                        {option === 'Unit Key' && values.contartTeam?.includes('Unit Key') && (
                                                            <TextField
                                                                label="Unit Key Value"
                                                                name="unitKeyValue"
                                                                value={values.unitKeyValue || ''}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                variant="filled"
                                                                sx={{ mt: 1, width: '100%' }}
                                                            />
                                                        )}
                                                        {option === 'Elpas Fob' && values.contartTeam?.includes('Elpas Fob') && (
                                                            <TextField
                                                                label="Elpas Fob Value"
                                                                name="elpasFobValue"
                                                                value={values.elpasFobValue || ''}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                variant="filled"
                                                                sx={{ mt: 1, width: '100%' }}
                                                            />
                                                        )}
                                                    </Box>
                                                ))}
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
                                                <SignatureCanvas
                                                    ref={sigPadRef}
                                                    penColor="black"
                                                    backgroundColor="#fff"
                                                    canvasProps={{
                                                        width: 400,
                                                        height: 150,
                                                        style: {
                                                            border: '2px solid #1976d2',
                                                            borderRadius: 8,
                                                            background: '#fff',
                                                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                                                        },
                                                        className: "sigCanvas"
                                                    }}
                                                />
                                                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                                    <Button onClick={() => sigPadRef.current.clear()} sx={{ mt: 1 }} variant="outlined" color="primary">Clear</Button>
                                                </Box>
                                            </Box>
                                        </Box>
                                            <FormGroup row sx={{ mt: 2 }}>
                                                {[
                                                    { label: 'Suite insurance Copy Received', name: 'suiteInsuranceCopyReceived' },
                                                    { label: 'Suite insurance Coverage Approved', name: 'suiteInsuranceCoverageApproved' }
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
                                                        {/* Show date picker if Suite insurance Copy Received is checked */}
                                                        {item.name === 'suiteInsuranceCopyReceived' && values.suiteInsuranceCopyReceived && (
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <DatePicker
                                                                    label="Copy Received Date"
                                                                    value={values.suiteInsuranceCopyReceivedDate ? dayjs(values.suiteInsuranceCopyReceivedDate) : null}
                                                                    onChange={newValue => setFieldValue('suiteInsuranceCopyReceivedDate', newValue ? newValue.format('YYYY-MM-DD') : '')}
                                                                    slotProps={{
                                                                        textField: {
                                                                            fullWidth: true,
                                                                            variant: 'filled',
                                                                            sx: { mt: 1 }
                                                                        },
                                                                    }}
                                                                />
                                                            </LocalizationProvider>
                                                        )}
                                                        {/* Show insurance company and policy number if Coverage Approved is checked */}
                                                        {item.name === 'suiteInsuranceCoverageApproved' && values.suiteInsuranceCoverageApproved && (
                                                            <Box display="flex" flexDirection="column" gap={1} mt={1}>
                                                                <TextField
                                                                    label="Insurance Company Name"
                                                                    name="suiteInsuranceCoverageApprovedCompany"
                                                                    value={values.suiteInsuranceCoverageApprovedCompany || ''}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    variant="filled"
                                                                    fullWidth
                                                                />
                                                                <TextField
                                                                    label="Policy Number"
                                                                    name="suiteInsuranceCoverageApprovedPolicy"
                                                                    value={values.suiteInsuranceCoverageApprovedPolicy || ''}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    variant="filled"
                                                                    fullWidth
                                                                />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ))}
                                            </FormGroup>
                                        </Box>
                                        <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                                            <Box display="flex" gap={2}>
                                                <TextField
                                                    label="Reviewed by"
                                                    name="reviewedBy"
                                                    value={values.reviewedBy || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    variant="filled"
                                                    fullWidth
                                                />
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        label="Date"
                                                        value={values.reviewedDate ? dayjs(values.reviewedDate) : null}
                                                        onChange={newValue => setFieldValue('reviewedDate', newValue ? newValue.format('YYYY-MM-DD') : '')}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                variant: 'filled',
                                                            },
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            </Box>
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

export default MoveInSummeryForm;
