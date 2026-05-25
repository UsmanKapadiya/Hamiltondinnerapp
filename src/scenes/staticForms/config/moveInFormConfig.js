import * as Yup from "yup";

// Constants for form options
export const CONTRACT_TERMS = [
    { 'Yearly': 'contract_term_yearly' },
    { 'Monthly': 'contract_term_monthly' },
    { 'Weekly': 'contract_term_weekly' },
    { 'Daily': 'contract_term_daily' }
];

export const PAYOR_INFORMATION = [
    { "PAD": "payor_information_PAD" },
    { "Post Dated-Cheque": "payor_information_Post_Dated_Cheque" }
];

export const OTHERS_OPTIONS = [
    { 'Unit Key': 'unit_key' },
    { 'Elpas Fob': 'elpas_fob' }
];

// Validation Schema
export const moveInFormValidationSchema = Yup.object().shape({
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

// Initial Form Values
export const initialMoveInFormValues = {
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
