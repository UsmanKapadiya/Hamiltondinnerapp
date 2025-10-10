import {
  Box,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Radio,
  Typography
} from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import { toast } from "react-toastify";
import StaticFormServices from "../../services/staticFormServices";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CustomButton from "../../components/CustomButton";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions'

const incidentInvolvedData = [
  { key: "inc_invl_resident", label: "Resident" },
  { key: "inc_invl_staff", label: "Staff" },
  { key: "inc_invl_visitor", label: "Visitor" },
  { key: "inc_invl_other", label: "Other" }
]
const typeOfIncidentOptions = [
  { key: "type_of_inc_fall", label: "Fall" },
  { key: "type_of_inc_fire", label: "Fire" },
  { key: "type_of_inc_security", label: "Security" },
  { key: "type_of_inc_elopement", label: "Elopement" },
  { key: "type_of_inc_death", label: "Death" },
  { key: "type_of_inc_resAbase", label: "Resident Abase" },
  { key: "type_of_inc_treatment", label: "Treatment" },
  { key: "type_of_inc_lossOfProp", label: "Loss of Property" },
  { key: "type_of_inc_choking", label: "Choking" },
  { key: "type_of_inc_aggresiveBeh", label: "Aggressive Behavior" },
  { key: "type_of_inc_other", label: "Other" }
];
const conditionAtTimeOptions = [
  { key: "condition_at_inc_oriented", label: "Oriented" },
  { key: "condition_at_inc_disOriented", label: "Disoriented" },
  { key: "condition_at_inc_sedated", label: "Sedated" },
  { key: "condition_at_inc_other", label: "Other (Specify)" }
];

const fallAssessmentOptions = [
  { key: "fall_assess_mediChange", label: "Medication Change" },
  { key: "fall_assess_cardMedi", label: "Cardiac Medications" },
  { key: "fall_assess_visDef", label: "Visual Deficit" },
  { key: "fall_assess_moodAltMedi", label: "Mood Altering Medication" },
  { key: "fall_assess_relocation", label: "Relocation" },
  { key: "fall_assess_tempIllness", label: "Temporary Illness" }
];

const ambulationOptions = [
  { key: "ambulation_unlimited", label: "Unlimited" },
  { key: "ambulation_limited", label: "Limited" },
  { key: "ambulation_reqAssist", label: "Required assistance" },
  { key: "ambulation_wheelChair", label: "Wheelchair" },
  { key: "ambulation_walker", label: "Walker" },
  { key: "ambulation_other", label: "Other (Specify)" }
];

const fireOptions = [
  { key: "fire_alarm_pulled", label: "Alarm pulled" },
  { key: "fire_false_alarm", label: "False alarm" },
  { key: "fire_extinguisher_used", label: "Extinguisher used" },
  { key: "fire_personal_injury", label: "Personal injury" },
  { key: "fire_property_damage", label: "Resident or facility property damage" },
]

const InformedOfIncident = [
  { key: "informed_of_inc_AGM", label: "Assistant General Manager" },
  { key: "informed_of_inc_GM", label: "General Manager" },
  { key: "informed_of_inc_RMC", label: "Risk Management Committee" },
  { key: "informed_of_inc_other", label: "Other" },
]
const notifiedResponsiblePartyOptions = [
  { key: "Yes", label: "Yes" },
  { key: "No", label: "No" }
];// Then use this in your form:

const validationSchema = yup.object({
  // Incident Involved
  incident_involved: yup.array().of(yup.string()).min(1, "Please select Incident Involved"),
  inc_invl_other_text: yup.string().when('incident_involved', {
    is: (val) => Array.isArray(val) && val.includes('Other'),
    then: (schema) => schema.required('Please enter other Incident Involved'),
    otherwise: (schema) => schema,
  }),

  incident_date: yup.string().required("Date is required"),
  incident_tm: yup.string().required("Time Of Incident is required"),
  incident_location: yup.string().required("Location Of Incident is required"),
  witnessed_by: yup.string().required("Witnessed By is required"),

  // Discovery
  discovery_date: yup.string().required("Date Of Discovery is required"),
  discovery_tm: yup.string().required("Time Of Discovery is required"),
  discovery_location: yup.string().required("Location Of Discovery is required"),
  discovered_by: yup.string().required("Discovered By is required"),

  // type_of_incident
  type_of_incident: yup.array().of(yup.string()),
  type_of_inc_other_text: yup.string().when('type_of_incident', {
    is: (val) => Array.isArray(val) && val.includes('Other'),
    then: (schema) => schema.required('Please enter Other Type Of Incident'),
    otherwise: (schema) => schema,
  }),

  // other_witnesses 
  other_witnesses: yup.string(),
  witness_name1: yup.string().when('other_witnesses', {
    is: 'Yes',
    then: (schema) => schema.required('Witness Name 1 is required'),
    otherwise: (schema) => schema,
  }),
  witness_position1: yup.string().when('other_witnesses', {
    is: 'Yes',
    then: (schema) => schema.required('Witness Position 1 is required'),
    otherwise: (schema) => schema,
  }),

  condition_at_incident: yup.array().of(yup.string()),
  condition_at_inc_other_text: yup.string().when('condition_at_incident', {
    is: (val) => Array.isArray(val) && val.includes('Other (Specify)'),
    then: (schema) => schema.required('Please specify Other Condition'),
    otherwise: (schema) => schema,
  }),


  ambulation: yup.array().of(yup.string()),
  ambulation_other_text: yup.string().when('ambulation', {
    is: (val) => Array.isArray(val) && val.includes('Other (Specify)'),
    then: (schema) => schema.required('Please specify Other Condition'),
    otherwise: (schema) => schema,
  }),

  // NOTIFICATION
  // Informed Of Incident
  informed_of_inc_other: yup.boolean(),
  informed_of_inc_other_text: yup.string().when('informed_of_inc_other', {
    is: true,
    then: (schema) => schema.required('Please specify Other Condition'),
    otherwise: (schema) => schema,
  }),

  notified_family_doctor: yup.string(),
  notified_family_doctor_date: yup.string().when('notified_family_doctor', {
    is: (val) => !!val, // not empty
    then: (schema) => schema.required('Date is required when Family Doctor is notified'),
    otherwise: (schema) => schema,
  }),
  notified_family_doctor_tm: yup.string().when('notified_family_doctor', {
    is: (val) => !!val,
    then: (schema) => schema.required('Time is required when Family Doctor is notified'),
    otherwise: (schema) => schema,
  }),

  // notified_resident_responsibl
  notified_resident_responsible_party: yup.string(),
  notified_resident_name: yup.string().when('notified_resident_responsible_party', {
    is: 'yes',
    then: (schema) => schema.required('Notified Resident Name is required'),
    otherwise: (schema) => schema,
  }),

  notified_resident_date: yup.string().when('notified_resident_responsible_party', {
    is: 'yes',
    then: (schema) => schema.required('Notified Resident Date is required'),
    otherwise: (schema) => schema,
  }),
  notified_resident_tm: yup.string().when('notified_resident_responsible_party', {
    is: 'yes',
    then: (schema) => schema.required('Notified Resident Time is required'),
    otherwise: (schema) => schema,
  }),

  notified_other: yup.string(),
  notified_other_date: yup.string().when('notified_other', {
    is: (val) => !!val && val.trim() !== '',
    then: (schema) => schema.required('Date is required when Other is notified'),
    otherwise: (schema) => schema,
  }),
  notified_other_tm: yup.string().when('notified_other', {
    is: (val) => !!val && val.trim() !== '',
    then: (schema) => schema.required('Time is required when Other is notified'),
    otherwise: (schema) => schema,
  }),

  //completed 
  completed_by: yup.string().required("Completed By is required"),
  completed_position: yup.string().required("Completed Position is required"),
  completed_date: yup.string().required("Completed Date is required"),
  completed_tm: yup.string().required("Completed Time is required"),

  follow_up_assigned_to: yup.string().required("Assign Follow Up to is required"),
});

const IncidentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const followUpRef = useRef(null);
  const [incidentFormDetails, setIncidentFormDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [formId, setFormId] = useState();
  const [userData] = useState(() => {
    const userDatas = localStorage.getItem("userData");
    return userDatas ? JSON.parse(userDatas) : null;
  });
  const canEditFollowUp = ["admin", "superadmin"].includes(userData?.role);
  const canUpdateFollowUp = canEditFollowUp || userData?.user_id === location?.state?.formData?.follow_up_user?.id;
  const [canEditFollowUpFields, setCanEditFollowUpFields] = useState(false);

  const [showFollowUpConfirm, setShowFollowUpConfirm] = useState(false);
  const [pendingSubmitValues, setPendingSubmitValues] = useState(null);
  const [pendingSubmitActions, setPendingSubmitActions] = useState(null);

  // Generic mapping function to reduce redundancy
  function mapOptions(rawString, options, otherLabel = "Other", otherTextKey = "other_text", arrKey = "arr") {
    if (!rawString) {
      return {
        [arrKey]: [],
        [otherTextKey]: "",
      };
    }
    const values = rawString.split(",").map(v => v.trim());
    const labels = options.map(opt => opt.label);
    const resultArr = [];
    let otherText = "";

    values.forEach(val => {
      if (labels.includes(val)) {
        resultArr.push(val);
      } else if (val) {
        resultArr.push(otherLabel);
        otherText = val;
      }
    });

    return {
      [arrKey]: resultArr,
      [otherTextKey]: otherText,
    };
  }

  const mapIncidentInvolved = (rawString) =>
    mapOptions(rawString, incidentInvolvedData, "Other", "inc_invl_other_text", "incident_involved");

  const mapTypeOfIncident = (rawString) =>
    mapOptions(rawString, typeOfIncidentOptions, "Other", "type_of_inc_other_text", "type_of_incident");

  const mapConditionAtIncident = (rawString) =>
    mapOptions(rawString, conditionAtTimeOptions, "Other (Specify)", "condition_at_inc_other_text", "condition_at_incident");

  const mapAmbulation = (rawString) =>
    mapOptions(rawString, ambulationOptions, "Other (Specify)", "ambulation_other_text", "ambulation");

  const mapInformedOfIncident = (rawString) =>
    mapOptions(rawString, InformedOfIncident, "Other", "informed_of_inc_other_text", "informed_of_incident");

  useEffect(() => {
    if (location.state?.scrollToFollowUp && followUpRef.current) {
      const checkAndScroll = () => {
        if (followUpRef.current) {
          followUpRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      };

      setTimeout(checkAndScroll, 500);
    }
  }, [location.state?.scrollToFollowUp, incidentFormDetails, loading]);

  useEffect(() => {
    setLoading(true);
    if (location.state?.formData?.ResponseCode === "1") {
      const data = location.state.formData.form_data || {};
      setFormId(location.state?.id);
      const followUpFilled = ["followUp_issue", "followUp_findings", "followUp_possible_solutions", "followUp_action_plan", "followUp_examine_result"]
        .some(key => !!data[key]);
      setIncidentFormDetails({
        ...data,
        ...mapIncidentInvolved(data.incident_involved),
        ...mapTypeOfIncident(data.type_of_incident),
        ...mapConditionAtIncident(data.condition_at_incident),
        ...mapAmbulation(data.ambulation),
        ...mapInformedOfIncident(data.informed_of_incident),
        fall_assessment: data.fall_assessment ? data.fall_assessment.split(",") : [],
        follow_up_assigned_to: data.follow_up_assigned_to || getDefaultFollowUpUser(),
        show_follow_up_details: formId ? true : (followUpFilled || incidentFormDetails?.show_follow_up_details || false),
        attachments: location.state.formData.attachments || [],
      });
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        setIncidentFormDetails({
          ...location.state,
          follow_up_assigned_to: getDefaultFollowUpUser()
        });
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [location.state]);


  const getDefaultFollowUpUser = () => {
    if (!userData?.user_list || !Array.isArray(userData.user_list)) {
      return '';
    }

    const adminUser = userData.user_list.find(
      user => user.role === 'admin' || user.role === 'superadmin' ||
        user.name?.toLowerCase() === 'admin'
    );

    if (adminUser) {
      return adminUser.id;
    }

    return userData.user_list.length > 0 ? userData.user_list[0].id : '';
  };


  const initialValues = useMemo(() => ({
    id: formId || "",
    formTypes: incidentFormDetails?.formTypes || "",
    incident_involved: incidentFormDetails?.incident_involved || [],
    inc_invl_other_text: incidentFormDetails?.inc_invl_other_text || "",
    incident_date: incidentFormDetails?.incident_date || "",
    incident_tm: incidentFormDetails?.incident_tm || "",
    incident_location: incidentFormDetails?.incident_location || "",
    witnessed_by: incidentFormDetails?.witnessed_by || "",
    discovery_date: incidentFormDetails?.discovery_date || "",
    discovery_tm: incidentFormDetails?.discovery_tm || "",
    discovery_location: incidentFormDetails?.discovery_location || "",
    discovered_by: incidentFormDetails?.discovered_by || "",
    type_of_incident: incidentFormDetails?.type_of_incident || [],
    type_of_inc_other_text: incidentFormDetails?.type_of_inc_other_text || "",
    safety_fob: incidentFormDetails?.safety_fob ?? "No",
    safety_callbell: incidentFormDetails?.safety_callbell ?? "No",
    safety_caution: incidentFormDetails?.safety_caution ?? "No",
    safety_other: incidentFormDetails?.safety_other ?? "",
    other_witnesses: incidentFormDetails?.other_witnesses ?? "No",
    witness_name1: incidentFormDetails?.witness_name1 || "",
    witness_position1: incidentFormDetails?.witness_position1 || "",
    witness_name2: incidentFormDetails?.witness_name2 || "",
    witness_position2: incidentFormDetails?.witness_position2 || "",
    condition_at_incident: incidentFormDetails?.condition_at_incident || [],
    condition_at_inc_other_text: incidentFormDetails?.condition_at_inc_other_text || "",
    fall_assessment: incidentFormDetails?.fall_assessment || [],
    ambulation: incidentFormDetails?.ambulation || [],
    ambulation_other_text: incidentFormDetails?.ambulation_other_text || "",
    fire_alarm_pulled: incidentFormDetails?.fire_alarm_pulled ?? "No",
    fire_false_alarm: incidentFormDetails?.fire_false_alarm ?? "No",
    fire_extinguisher_used: incidentFormDetails?.fire_extinguisher_used ?? "No",
    fire_personal_injury: incidentFormDetails?.fire_personal_injury ?? "No",
    fire_property_damage: incidentFormDetails?.fire_property_damage ?? "No",
    factual_description: incidentFormDetails?.factual_description || "",
    informed_of_incident: incidentFormDetails?.informed_of_incident || [],
    initial_assistant_gm: incidentFormDetails?.initial_assistant_gm || "",
    initial_gm: incidentFormDetails?.initial_gm || "",
    initial_risk_mng_committee: incidentFormDetails?.initial_risk_mng_committee || "",
    initial_other: incidentFormDetails?.initial_other || "",
    informed_of_inc_other_text: incidentFormDetails?.informed_of_inc_other_text,
    notified_family_doctor: incidentFormDetails?.notified_family_doctor || "",
    notified_family_doctor_date: incidentFormDetails?.notified_family_doctor_date || "",
    notified_family_doctor_dt: incidentFormDetails?.notified_family_doctor_dt || "",
    notified_family_doctor_tm: incidentFormDetails?.notified_family_doctor_tm || "",
    notified_other: incidentFormDetails?.notified_other || "",
    notified_other_date: incidentFormDetails?.notified_other_date || "",
    notified_other_tm: incidentFormDetails?.notified_other_tm || "",
    notified_resident_responsible_party: incidentFormDetails?.notified_resident_responsible_party || "no",
    notified_resident_name: incidentFormDetails?.notified_resident_name || "",
    notified_resident_date: incidentFormDetails?.notified_resident_date || "",
    notified_resident_tm: incidentFormDetails?.notified_resident_tm || "",
    completed_by: incidentFormDetails?.completed_by || "",
    completed_position: incidentFormDetails?.completed_position || "",
    completed_date: incidentFormDetails?.completed_date || "",
    completed_tm: incidentFormDetails?.completed_tm || "",
    follow_up_assigned_to: incidentFormDetails?.follow_up_assigned_to || getDefaultFollowUpUser(),
    followUp_issue: incidentFormDetails?.followUp_issue || '',
    followUp_findings: incidentFormDetails?.followUp_findings || '',
    followUp_possible_solutions: incidentFormDetails?.followUp_possible_solutions || '',
    followUp_action_plan: incidentFormDetails?.followUp_action_plan || '',
    followUp_examine_result: incidentFormDetails?.followUp_examine_result || '',
    attachments: incidentFormDetails?.attachments || [],
    show_follow_up_details: formId ? true : incidentFormDetails?.show_follow_up_details || false,
  }), [incidentFormDetails, formId]);


  const handleFormSubmit = useCallback(
    async (values, actions) => {
      const isFollowUpIncomplete = values.show_follow_up_details &&
        (
          !values.followUp_issue ||
          !values.followUp_findings ||
          !values.followUp_possible_solutions ||
          !values.followUp_action_plan ||
          !values.followUp_examine_result
        );


      const userRole = userData?.role;
      const isConciergeOrNurse = userRole === "concierge" || userRole === "nurse";
      const isFollowUpHidden = !values.show_follow_up_details;

      if (!isConciergeOrNurse && !isFollowUpHidden && isFollowUpIncomplete) {
        setPendingSubmitValues(values);
        setPendingSubmitActions(actions);
        setShowFollowUpConfirm(true);
        setLoading(false);
        return;
      }

      await submitIncidentForm(values, actions);
    },
    [initialValues, navigate]
  );

  const submitIncidentForm = async (values, actions) => {
    let incidentInvolvedArr = [];
    (values.incident_involved || []).forEach(val => {
      if (val !== "Other") {
        incidentInvolvedArr.push(val);
      }
    });
    if (values.incident_involved?.includes("Other") && values.inc_invl_other_text) {
      incidentInvolvedArr.push(values.inc_invl_other_text);
    }

    // Type Of Incident
    let typeOfIncidentArr = [];
    let otherTypeValue = "";
    (values.type_of_incident || []).forEach(type => {
      if (type === "Other" && values.type_of_inc_other_text) {
        otherTypeValue = values.type_of_inc_other_text;
      } else if (type !== "Other") {
        typeOfIncidentArr.push(type);
      }
    });
    if (otherTypeValue) {
      typeOfIncidentArr.push(otherTypeValue);
    }

    // Condition At Time of Incident
    let conditionAtIncidentArr = (values.condition_at_incident || []).filter(
      (item) => item !== "Other (Specify)"
    );
    if (
      values.condition_at_incident?.includes("Other (Specify)") &&
      values.condition_at_inc_other_text
    ) {
      conditionAtIncidentArr.push(values.condition_at_inc_other_text);
    }
    const conditionAtIncidentStr = conditionAtIncidentArr.join(",");

    // Build ambulation string for payload
    let ambulationArr = (values.ambulation || []).filter(item => item !== "Other (Specify)");
    if (
      values.ambulation?.includes("Other (Specify)") &&
      values.ambulation_other_text
    ) {
      ambulationArr.push(values.ambulation_other_text);
    }
    const ambulationStr = ambulationArr.length > 0 ? ambulationArr.join(",") : "";

    // informedOfIncident
    let informedOfIncidentArr = [];
    let otherValue = "";
    (values.informed_of_incident || []).forEach(label => {
      if (label === "Other" && values.informed_of_inc_other_text) {
        otherValue = values.informed_of_inc_other_text;
      } else {
        informedOfIncidentArr.push(label);
      }
    });
    if (otherValue) {
      informedOfIncidentArr.push(otherValue);
    }
    // IncidentDateTime set
    const incidentDateTime = values.incident_date && values.incident_tm
      ? dayjs(`${values.incident_date} ${values.incident_tm}`, "YYYY-MM-DD hh:mm A")  // Changed from "HH:mm"
      : null;
    const discoveryDateTime = values.discovery_date && values.discovery_tm
      ? dayjs(`${values.discovery_date} ${values.discovery_tm}`, "YYYY-MM-DD hh:mm A")  // Changed
      : null;

    const notifiedFamilyDoctorDateTime = values.notified_family_doctor_date && values.notified_family_doctor_tm
      ? dayjs(`${values.notified_family_doctor_date} ${values.notified_family_doctor_tm}`, "YYYY-MM-DD hh:mm A")  // Changed
      : null;

    const notifiedResidentDateTime = values.notified_resident_date && values.notified_resident_tm
      ? dayjs(`${values.notified_resident_date} ${values.notified_resident_tm}`, "YYYY-MM-DD hh:mm A")  // Changed
      : null;

    const completedDateTime = values.completed_date && values.completed_tm
      ? dayjs(`${values.completed_date} ${values.completed_tm}`, "YYYY-MM-DD hh:mm A")  // Changed
      : null;

    const notifiedOtherDateTime = values.notified_other_date && values.notified_other_tm
      ? dayjs(`${values.notified_other_date} ${values.notified_other_tm}`, "YYYY-MM-DD hh:mm A")
      : null;

    const payload = {
      incident_involved: incidentInvolvedArr.join(","),
      inc_invl_staff: values.incident_involved?.includes("Staff") ? 1 : 0,
      inc_invl_resident: values.incident_involved?.includes("Resident") ? 1 : 0,
      inc_invl_visitor: values.incident_involved?.includes("Visitor") ? 1 : 0,
      inc_invl_other: values.incident_involved?.includes("Other") ? 1 : 0,
      incident_date: incidentDateTime
        ? dayjs(incidentDateTime).format("DD MMM YYYY hh:mm A")
        : "",
      incident_dt: incidentDateTime
        ? dayjs(incidentDateTime).format("DD MMM YYYY")
        : "",
      incident_tm: values.incident_tm || "",
      incident_location: values.incident_location || "",
      witnessed_by: values.witnessed_by || "",
      discovery_date: discoveryDateTime
        ? dayjs(discoveryDateTime).format("DD MMM YYYY hh:mm A")
        : "",
      discovery_dt: discoveryDateTime
        ? dayjs(discoveryDateTime).format("DD MMM YYYY")
        : "",
      discovery_tm: values.discovery_tm || "",
      discovery_location: values.discovery_location || "",
      discovered_by: values.discovered_by || "",

      type_of_incident: typeOfIncidentArr.join(","),
      ...typeOfIncidentOptions.reduce((acc, option) => {
        acc[option.key] = values.type_of_incident?.includes(option.label) ? 1 : 0;
        return acc;
      }, {}),

      ...(values.type_of_inc_other_text
        ? { type_of_inc_other_text: values.type_of_inc_other_text }
        : {}),

      ...(values.safety_fob ? { safety_fob: values.safety_fob } : {}),
      ...(values.safety_callbell ? { safety_callbell: values.safety_callbell } : {}),
      ...(values.safety_caution ? { safety_caution: values.safety_caution } : {}),
      ...(values.safety_other ? { safety_other: values.safety_other } : {}),

      other_witnesses: values.other_witnesses || "",
      ...(values.other_witnesses === "Yes" && {
        ...(values.witness_name1 ? { witness_name1: values.witness_name1 } : {}),
        ...(values.witness_position1 ? { witness_position1: values.witness_position1 } : {}),
        ...(values.witness_name2 ? { witness_name2: values.witness_name2 } : {}),
        ...(values.witness_position2 ? { witness_position2: values.witness_position2 } : {}),
      }),

      condition_at_incident: conditionAtIncidentStr,
      ...conditionAtTimeOptions.reduce((acc, option) => {
        acc[option.key] = values.condition_at_incident?.includes(option.label) ? 1 : 0;
        return acc;
      }, {}),
      ...(values.condition_at_incident?.includes('Other (Specify)') && values.condition_at_inc_other_text
        ? { condition_at_inc_other_text: values.condition_at_inc_other_text }
        : {}),

      // fall_assessment 
      fall_assessment: (values.fall_assessment || []).join(","),
      ...fallAssessmentOptions.reduce((acc, option) => {
        acc[option.key] = values.fall_assessment?.includes(option.label) ? 1 : 0;
        return acc;
      }, {}),

      // ambulation: incidentFormDetails?.ambulation || [],
      ...(ambulationStr ? { ambulation: ambulationStr } : {}),
      ...(values.ambulation?.includes("Other (Specify)") && values.ambulation_other_text
        ? { ambulation_other_text: values.ambulation_other_text }
        : {}),
      ...ambulationOptions.reduce((acc, option) => {
        acc[option.key] = values.ambulation?.includes(option.label) ? 1 : 0;
        return acc;
      }, {}),

      // Fire
      ...(values.fire_alarm_pulled ? { fire_alarm_pulled: values.fire_alarm_pulled } : {}),
      ...(values.fire_false_alarm ? { fire_false_alarm: values.fire_false_alarm } : {}),
      ...(values.fire_extinguisher_used ? { fire_extinguisher_used: values.fire_extinguisher_used } : {}),
      ...(values.fire_personal_injury ? { fire_personal_injury: values.fire_personal_injury } : {}),
      ...(values.fire_property_damage ? { fire_property_damage: values.fire_property_damage } : {}),

      // Factual
      factual_description: values?.factual_description || "",

      // Informed Of Incidents
      informed_of_incident: informedOfIncidentArr.join(","),
      ...InformedOfIncident.reduce((acc, option) => {
        acc[option.key] = values.informed_of_incident?.includes(option.label) ? 1 : 0;
        return acc;
      }, {}),
      ...(values.informed_of_incident?.includes("Other") && values.informed_of_inc_other_text
        ? { informed_of_inc_other_text: values.informed_of_inc_other_text }
        : {}),
      initial_assistant_gm: values?.initial_assistant_gm || "",
      initial_gm: values?.initial_gm || "",
      initial_risk_mng_committee: values?.initial_risk_mng_committee || "",
      initial_other: values?.initial_other || "",

      notified_family_doctor: values.notified_family_doctor || "",
      notified_family_doctor_date: notifiedFamilyDoctorDateTime
        ? dayjs(notifiedFamilyDoctorDateTime).format("DD MMM YYYY hh:mm A")
        : "",
      notified_family_doctor_dt: notifiedFamilyDoctorDateTime
        ? dayjs(notifiedFamilyDoctorDateTime).format("DD MMM YYYY")
        : "",
      notified_family_doctor_tm: values.notified_family_doctor_tm || "",

      notified_other: values.notified_other || "",
      notified_other_date: notifiedOtherDateTime
        ? dayjs(notifiedOtherDateTime).format("DD MMM YYYY hh:mm A")
        : "",
      notified_other_dt: notifiedOtherDateTime
        ? dayjs(notifiedOtherDateTime).format("DD MMM YYYY")
        : "",
      notified_other_tm: values.notified_other_tm || "",


      notified_resident_responsible_party: values.notified_resident_responsible_party || "",
      notified_resident_name: values.notified_resident_name || "",
      notified_resident_date: notifiedResidentDateTime
        ? dayjs(notifiedResidentDateTime).format("DD MMM YYYY hh:mm A")
        : "",
      notified_resident_dt: notifiedResidentDateTime
        ? dayjs(notifiedResidentDateTime).format("DD MMM YYYY")
        : "",
      notified_resident_tm: values.notified_resident_tm || "",

      // Completed
      completed_by: values.completed_by || "",
      completed_position: values.completed_position || "",
      completed_date: completedDateTime
        ? dayjs(completedDateTime).format("DD MMM YYYY hh:mm A")
        : "",
      completed_dt: completedDateTime
        ? dayjs(completedDateTime).format("DD MMM YYYY")
        : "",
      completed_tm: values.completed_tm || "",

      follow_up_assigned_to: values.follow_up_assigned_to || "",
      followUp_issue: values.followUp_issue || "",
      followUp_findings: values?.followUp_findings || '',
      followUp_possible_solutions: values?.followUp_possible_solutions || '',
      followUp_action_plan: values?.followUp_action_plan || '',
      followUp_examine_result: values?.followUp_examine_result || '',

    };
    // console.log("Payload", payload);
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const logged_at = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const rawStringData = { ...payload };
    rawStringData['is_completed'] = incidentFormDetails?.is_completed ? incidentFormDetails?.is_completed : 0;
    rawStringData['logged_at'] = incidentFormDetails?.logged_at ? incidentFormDetails?.logged_at : logged_at;

    // console.log("rawStringData", rawStringData)
    const found = userData.rooms.find(r =>
      String(r.name).toLowerCase() === String(values?.room_number).toLowerCase()
    );
    const finalPayload = {
      form_type: 1,
      ...(formId && { form_id: formId }),
      ...(!formId && { room_id: found?.id }),
      follow_up_assigned_to: values?.follow_up_assigned_to,
      data: JSON.stringify(rawStringData)
    };
    // console.log("finalPayload", finalPayload)
    const formData = new FormData();
    formData.append('form_type', 1);
    if (formId) {
      formData.append('form_id', formId);
    } else {
      formData.append('room_id', found?.id);
    }
    formData.append('follow_up_assigned_to', values?.follow_up_assigned_to);
    formData.append('data', JSON.stringify(rawStringData));

    // Handle attachments
    if (Array.isArray(values.attachments) && values.attachments.length > 0) {
      let fileIndex = 0;

      values.attachments.forEach((file) => {
        if (file instanceof File) {
          // New file upload - append directly
          formData.append(`file${fileIndex}`, file, file.name);
          fileIndex++;
        } else if (file.id) {
          // Existing attachment from API - preserve by ID
          formData.append(`existing_attachments[]`, file.id);
        } else if (typeof file === 'string' && file.startsWith('data:')) {
          // Handle base64 encoded files (if any)
          const byteString = atob(file.split(',')[1]);
          const mimeString = file.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const extension = mimeString.split('/')[1];
          formData.append(`file${fileIndex}`, blob, `attachment_${Date.now()}_${fileIndex}.${extension}`);
          fileIndex++;
        }
      });
    }

    try {
      if (formId) {
        const response = await StaticFormServices.logFormUpdate(formData);
        if (response?.ResponseCode === "1") {
          toast.success("Form Updated successfully.");
          setTimeout(() => {
            navigate("/staticForms");
          }, 1200);
        }
      } else {
        const response = await StaticFormServices.logFormSubmit(formData);
        if (response?.ResponseCode === "1") {
          toast.success(response?.ResponseText || "Form submitted successfully.");
          setTimeout(() => {
            navigate("/staticForms");
          }, 1200);
        }
      }
    } catch (error) {
      toast.error("Form is not submitted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowFollowUpConfirm(false);
    setLoading(true);
    if (pendingSubmitValues && pendingSubmitActions) {
      await submitIncidentForm(pendingSubmitValues, pendingSubmitActions);
    }
  };

  const handleAttachmentUpload = async (files) => {
    if (!formId || !files || files.length === 0) return;

    const uploadFormData = new FormData();
    uploadFormData.append('form_id', formId);

    files.forEach((file, index) => {
      uploadFormData.append(`file${index}`, file, file.name);
    });

    try {
      const response = await StaticFormServices.addFormAttachment(uploadFormData);
      if (response?.ResponseCode === "1") {
        toast.success("Attachments uploaded successfully.");

        const uploadedAttachments = response.attachments || [];

        setIncidentFormDetails(prev => ({
          ...prev,
          attachments: [...uploadedAttachments]
        }));
      } else {
        toast.error("Failed to upload attachments.");
      }
    } catch (error) {
      console.error("Error uploading attachments:", error);
      toast.error("Error uploading attachments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box m="20px">
      <Header
        title={"INCIDENT FORM"}
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
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            setFieldValue,
            submitCount
          }) => (
            <form onSubmit={handleSubmit}>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%", fontSize: "18px" }}>
                    INCIDENT INVOLVED
                  </Box>
                  {incidentInvolvedData.map((option) => (
                    <Box key={option.key} sx={{ width: "50%" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.incident_involved?.includes(option.label) || false}
                            onChange={() => {
                              const current = values.incident_involved || [];
                              if (current.includes(option.label)) {
                                setFieldValue(
                                  "incident_involved",
                                  current.filter((item) => item !== option.label)
                                );
                              } else {
                                setFieldValue("incident_involved", [...current, option.label]);
                              }
                            }}
                            name="incident_involved"
                          />
                        }
                        label={option.label}
                      />
                    </Box>
                  ))}
                  {values.incident_involved?.includes("Other") && (
                    <Box sx={{ width: "100%", mt: 1 }}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Please enter Other Incident Involved"
                        name="inc_invl_other_text"
                        value={values.inc_invl_other_text || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.inc_invl_other_text && Boolean(errors.inc_invl_other_text)}
                        helperText={touched.inc_invl_other_text && errors.inc_invl_other_text}
                      />
                    </Box>
                  )}
                  {touched.incident_involved && errors.incident_involved && (
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <Typography color="error" variant="body2">{errors.incident_involved}</Typography>
                    </Box>
                  )}
                </FormGroup>
              </Box>

              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Date/Time of Incident
                </Box>
                <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={values.incident_date ? dayjs(values.incident_date) : null}
                      onChange={(newValue) => {
                        setFieldValue(
                          "incident_date",
                          newValue ? newValue.format("YYYY-MM-DD") : ""
                        );
                        if (newValue && !values.incident_tm) {
                          setFieldValue("incident_tm", "12:00 PM");
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.incident_date && Boolean(errors.incident_date),
                          helperText: touched.incident_date && errors.incident_date,
                          sx: { mt: 1 },
                        },
                      }}
                    />
                    <TimePicker
                      label="Time"
                      ampm={true}
                      value={
                        values.incident_tm
                          ? dayjs(values.incident_tm, values.incident_tm.includes("AM") || values.incident_tm.includes("PM") ? "hh:mm A" : "HH:mm")
                          : null
                      }
                      onChange={(newValue) =>
                        setFieldValue(
                          "incident_tm",
                          newValue ? newValue.format("HH:mm") : ""
                        )
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.incident_tm && Boolean(errors.incident_tm),
                          helperText: touched.incident_tm && errors.incident_tm,
                          sx: { mt: 1 },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>

              <Box sx={{ gridColumn: "span 4", mt: 2, display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Location Of Incident"
                  name="incident_location"
                  value={values.incident_location || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.incident_location && Boolean(errors.incident_location)}
                  helperText={touched.incident_location && errors.incident_location}
                  sx={{ flex: 1 }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  label="Witnessed By"
                  name="witnessed_by"
                  value={values.witnessed_by || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.witnessed_by && Boolean(errors.witnessed_by)}
                  helperText={touched.witnessed_by && errors.witnessed_by}
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Date/Time Of Discovery
                </Box>
                <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={values.discovery_date ? dayjs(values.discovery_date) : null}
                      onChange={(newValue) => {
                        setFieldValue("discovery_date", newValue ? newValue.format("YYYY-MM-DD") : "");
                        if (newValue && !values.discovery_tm) {
                          setFieldValue("discovery_tm", "12:00 PM");
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.discovery_date && Boolean(errors.discovery_date),
                          helperText: touched.discovery_date && errors.discovery_date,
                          sx: { mt: 1 },
                        },
                      }}
                    />
                    <TimePicker
                      label="Time"
                      ampm={true}
                      value={
                        values.discovery_tm
                          ? dayjs(values.discovery_tm, values.discovery_tm.includes("AM") || values.discovery_tm.includes("PM") ? "hh:mm A" : "HH:mm")
                          : null
                      }
                      onChange={(newValue) =>
                        setFieldValue(
                          "discovery_tm",
                          newValue ? newValue.format("hh:mm A") : ""
                        )
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.discovery_tm && Boolean(errors.discovery_tm),
                          helperText: touched.discovery_tm && errors.discovery_tm,
                          sx: { mt: 1 },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>

              <Box sx={{ gridColumn: "span 4", mt: 2, display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Location Of Discovery"
                  name="discovery_location"
                  value={values.discovery_location || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.discovery_location && Boolean(errors.discovery_location)}
                  helperText={touched.discovery_location && errors.discovery_location}
                  sx={{ flex: 1 }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  label="Discovered By"
                  name="discovered_by"
                  value={values.discovered_by || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.discovered_by && Boolean(errors.discovered_by)}
                  helperText={touched.discovered_by && errors.discovered_by}
                  sx={{ flex: 1 }}
                />
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    Type Of Incident
                  </Box>
                  {typeOfIncidentOptions.map((option) => (
                    <Box key={option.key} sx={{ width: "50%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.type_of_incident?.includes(option.label) || false}
                            onChange={() => {
                              const current = values.type_of_incident || [];
                              if (current.includes(option.label)) {
                                setFieldValue(
                                  "type_of_incident",
                                  current.filter((item) => item !== option.label)
                                );
                              } else {
                                setFieldValue("type_of_incident", [...current, option.label]);
                              }
                            }}
                            name="type_of_incident"
                          />
                        }
                        label={option.label}
                      />
                      {option.label === 'Other' && values.type_of_incident?.includes('Other') && (
                        <Box sx={{ ml: 2 }}>
                          <TextField
                            size="small"
                            variant="filled"
                            label="Please enter Other Type Of Incident"
                            name="type_of_inc_other_text"
                            value={values.type_of_inc_other_text || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.type_of_inc_other_text && Boolean(errors.type_of_inc_other_text)}
                            helperText={touched.type_of_inc_other_text && errors.type_of_inc_other_text}
                          />
                        </Box>

                      )}
                      {touched.type_of_incident && errors.type_of_incident && (
                        <Box sx={{ width: '100%', mt: 1 }}>
                          <Typography color="error" variant="body2">{errors.type_of_incident}</Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </FormGroup>
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    Safety Devices In Use Before Occurance
                  </Box>
                  {[
                    { key: "safety_fob", label: "Fob was within reach" },
                    { key: "safety_callbell", label: "Call bell within reach" },
                    { key: "safety_caution", label: "Caution signs in place" },
                  ].map((item) => (
                    <Box key={item.key} sx={{ display: "flex", alignItems: "center", width: "100%", mb: 1 }}>
                      <Box sx={{ flex: 1 }}>{item.label}</Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {["Yes", "No", "N/A"].map((option) => (
                          <FormControlLabel
                            key={option}
                            control={
                              <Radio
                                checked={values[item.key] === option}
                                onChange={() => setFieldValue(item.key, option)}
                                value={option}
                                name={item.key}
                              />
                            }
                            label={option}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </FormGroup>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Other"
                  name="safety_other"
                  value={values.safety_other || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.safety_other && Boolean(errors.safety_other)}
                  helperText={touched.safety_other && errors.safety_other}
                  sx={{ flex: 1, gridColumn: "span 4", }}
                />
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  {[
                    { key: "other_witnesses", label: "Other Witnesses?" },
                  ].map((item) => (
                    <Box key={item.key} sx={{ display: "flex", alignItems: "center", width: "100%", mb: 1, flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ flex: 1 }}>{item.label}</Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          {["Yes", "No"].map((option) => (
                            <FormControlLabel
                              key={option}
                              control={
                                <Radio
                                  checked={values[item.key] === option}
                                  onChange={() => setFieldValue(item.key, option)}
                                  value={option}
                                  name={item.key}
                                />
                              }
                              label={option}
                            />
                          ))}
                        </Box>
                      </Box>
                      {/* If Yes, show two sets of name/position fields, each on a new row */}
                      {values[item.key] === "Yes" && (
                        <>
                          <Box sx={{ width: "100%", mt: 2, display: 'flex', gap: 2 }}>
                            <TextField
                              fullWidth
                              variant="filled"
                              label="Witness Name 1"
                              name="witness_name1"
                              value={values.witness_name1 || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={Boolean(errors.witness_name1) && (touched.witness_name1 || submitCount > 0)}
                              helperText={Boolean(errors.witness_name1) && (touched.witness_name1 || submitCount > 0) ? errors.witness_name1 : ""}
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              fullWidth
                              variant="filled"
                              label="Witness Position 1"
                              name="witness_position1"
                              value={values.witness_position1 || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={Boolean(errors.witness_position1) && (touched.witness_position1 || submitCount > 0)}
                              helperText={Boolean(errors.witness_position1) && (touched.witness_position1 || submitCount > 0) ? errors.witness_position1 : ""}
                              sx={{ flex: 1 }}
                            />
                          </Box>
                          <Box sx={{ width: "100%", mt: 2, display: 'flex', gap: 2 }}>
                            <TextField
                              fullWidth
                              variant="filled"
                              label="Witness Name 2"
                              name="witness_name2"
                              value={values.witness_name2 || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              fullWidth
                              variant="filled"
                              label="Witness Position 2"
                              name="witness_position2"
                              value={values.witness_position2 || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              sx={{ flex: 1 }}
                            />
                          </Box>
                        </>
                      )}
                    </Box>
                  ))}
                </FormGroup>
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    Condition At Time of Incident
                  </Box>
                  {conditionAtTimeOptions.map((option) => (
                    <Box key={option.key} sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.condition_at_incident?.includes(option.label) || false}
                            onChange={() => {
                              const current = values.condition_at_incident || [];
                              if (current.includes(option.label)) {
                                setFieldValue(
                                  'condition_at_incident',
                                  current.filter((item) => item !== option.label)
                                );
                              } else {
                                setFieldValue('condition_at_incident', [...current, option.label]);
                              }
                            }}
                            name="condition_at_incident"
                          />
                        }
                        label={option.label}
                      />
                    </Box>
                  ))}
                  {values.condition_at_incident?.includes('Other (Specify)') && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Please specify Other Condition"
                        name="condition_at_inc_other_text"
                        value={values.condition_at_inc_other_text || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.condition_at_inc_other_text) && (touched.condition_at_inc_other_text || submitCount > 0)}
                        helperText={Boolean(errors.condition_at_inc_other_text) && (touched.condition_at_inc_other_text || submitCount > 0) ? errors.condition_at_inc_other_text : ""}
                      />
                    </Box>
                  )}
                </FormGroup>
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    Fall Assessment
                  </Box>
                  {fallAssessmentOptions.map((option) => (
                    <Box key={option.key} sx={{ width: "50%" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.fall_assessment?.includes(option.label) || false}
                            onChange={() => {
                              const current = values.fall_assessment || [];
                              if (current.includes(option.label)) {
                                setFieldValue(
                                  "fall_assessment",
                                  current.filter((item) => item !== option.label)
                                );
                              } else {
                                setFieldValue("fall_assessment", [...current, option.label]);
                              }
                            }}
                            name="fall_assessment"
                          />
                        }
                        label={option.label}
                      />
                    </Box>
                  ))}
                </FormGroup>
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    Ambulation
                  </Box>
                  {ambulationOptions.map((option) => (
                    <Box key={option.key} sx={{ width: "50%", display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.ambulation?.includes(option.label) || false}
                            onChange={() => {
                              const current = values.ambulation || [];
                              if (current.includes(option.label)) {
                                setFieldValue(
                                  "ambulation",
                                  current.filter((item) => item !== option.label)
                                );
                              } else {
                                setFieldValue("ambulation", [...current, option.label]);
                              }
                            }}
                            name="ambulation"
                          />
                        }
                        label={option.label}
                      />
                    </Box>
                  ))}
                  {values.ambulation?.includes('Other (Specify)') && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Please specify Other Ambulation"
                        name="ambulation_other_text"
                        value={values.ambulation_other_text || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.ambulation_other_text) && (touched.ambulation_other_text || submitCount > 0)}
                        helperText={
                          Boolean(errors.ambulation_other_text) && (touched.ambulation_other_text || submitCount > 0)
                            ? errors.ambulation_other_text
                            : ""
                        }
                      />
                    </Box>
                  )}
                </FormGroup>
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    Fire
                  </Box>
                  {fireOptions.map((item) => (
                    <Box key={item.key} sx={{ display: "flex", alignItems: "center", width: "100%", mb: 1 }}>
                      <Box sx={{ flex: 1 }}>{item.label}</Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {["Yes", "No"].map((option) => (
                          <FormControlLabel
                            key={option}
                            control={
                              <Radio
                                checked={values[item.key] === option}
                                onChange={() => setFieldValue(item.key, option)}
                                value={option}
                                name={item.key}
                              />
                            }
                            label={option}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </FormGroup>
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    FACTUAL CONCISE DESCRIPTION OF INCIDENT, INJURY AND ACTION TAKEN
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    variant="filled"
                    label="Description"
                    name="factual_description"
                    value={values.factual_description || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.factual_description && Boolean(errors.factual_description)}
                    helperText={touched.factual_description && errors.factual_description}
                    sx={{ mt: 1 }}
                  />
                </FormGroup>
              </Box>

              {/* <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    ATTACHMENT
                  </Box>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mt: 1 }}
                  >
                    Upload Photo/Video
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      hidden
                      onChange={(event) => {
                        const files = Array.from(event.currentTarget.files);
                        const prev = values.attachments || [];
                        // Add new files at the beginning instead of end
                        setFieldValue("attachments", [...files, ...prev]);
                      }}
                    />
                  </Button>
                  {Array.isArray(values.attachments) && values.attachments.length > 0 && (
                    <Box sx={{ width: '100%', mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {values.attachments.map((file, idx) => {
                        // Check if it's a File object (newly uploaded) or an object from API (existing)
                        const isFileObject = file instanceof File;
                        const isImage = isFileObject
                          ? file.type.startsWith('image/')
                          : file.type === 'image';
                        const isVideo = isFileObject
                          ? file.type.startsWith('video/')
                          : file.type === 'video';

                        // Get the appropriate URL
                        const mediaUrl = isFileObject
                          ? URL.createObjectURL(file)
                          : file.path;

                        const fileName = isFileObject ? file.name : file.name;

                        return (
                          <Box key={idx} sx={{ position: 'relative', display: 'inline-block' }}>
                            {isImage ? (
                              <img
                                src={mediaUrl}
                                alt={fileName}
                                style={{
                                  width: 80,
                                  height: 80,
                                  objectFit: 'cover',
                                  borderRadius: 4,
                                  border: '1px solid #ccc'
                                }}
                              />
                            ) : isVideo ? (
                              <video
                                src={mediaUrl}
                                style={{
                                  width: 80,
                                  height: 80,
                                  objectFit: 'cover',
                                  borderRadius: 4,
                                  border: '1px solid #ccc'
                                }}
                                controls
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid #ccc',
                                  borderRadius: 1,
                                  bgcolor: '#f5f5f5'
                                }}
                              >
                                <Typography variant="caption" sx={{ textAlign: 'center', p: 1 }}>
                                  {file.file_extension || 'File'}
                                </Typography>
                              </Box>
                            )}
                            <Button
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                minWidth: 0,
                                p: 0,
                                bgcolor: 'rgba(255,255,255,0.7)'
                              }}
                              onClick={() => {
                                const newArr = values.attachments.filter((_, i) => i !== idx);
                                setFieldValue('attachments', newArr);
                              }}
                            >
                              <span style={{ color: 'red', fontWeight: 'bold', fontSize: 18, lineHeight: 1 }}>×</span>
                            </Button>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </FormGroup>
              </Box> */}
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    ATTACHMENT
                  </Box>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mt: 1 }}
                  >
                    Upload Photo/Video
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      hidden
                      onChange={async (event) => {
                        const files = Array.from(event.currentTarget.files);

                        if (formId) {
                          // If form exists, upload immediately to API
                          await handleAttachmentUpload(files);
                        } else {                          
                          const prev = values.attachments || [];
                          setFieldValue("attachments", [...files, ...prev]);
                        }
                        event.target.value = '';
                      }}
                    />
                  </Button>
                  {Array.isArray(values.attachments) && values.attachments.length > 0 && (
                    <Box sx={{ width: '100%', mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {values.attachments.map((file, idx) => {
                        const isFileObject = file instanceof File;
                        const isImage = isFileObject
                          ? file.type.startsWith('image/')
                          : file.type === 'image';
                        const isVideo = isFileObject
                          ? file.type.startsWith('video/')
                          : file.type === 'video';

                        const mediaUrl = isFileObject
                          ? URL.createObjectURL(file)
                          : file.path;

                        const fileName = isFileObject ? file.name : file.name;

                        return (
                          <Box key={idx} sx={{ position: 'relative', display: 'inline-block' }}>
                            {isImage ? (
                              <img
                                src={mediaUrl}
                                alt={fileName}
                                style={{
                                  width: 80,
                                  height: 80,
                                  objectFit: 'cover',
                                  borderRadius: 4,
                                  border: '1px solid #ccc'
                                }}
                              />
                            ) : isVideo ? (
                              <video
                                src={mediaUrl}
                                style={{
                                  width: 80,
                                  height: 80,
                                  objectFit: 'cover',
                                  borderRadius: 4,
                                  border: '1px solid #ccc'
                                }}
                                controls
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid #ccc',
                                  borderRadius: 1,
                                  bgcolor: '#f5f5f5'
                                }}
                              >
                                <Typography variant="caption" sx={{ textAlign: 'center', p: 1 }}>
                                  {file.file_extension || 'File'}
                                </Typography>
                              </Box>
                            )}
                            <Button
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                minWidth: 0,
                                p: 0,
                                bgcolor: 'rgba(255,255,255,0.7)'
                              }}
                              onClick={async () => {
                                if (formId && file.id) {
                                  // If form exists and file has ID, call delete API
                                  try {
                                    const response = await StaticFormServices.deleteFormAttachment({
                                      form_id: formId,
                                      attachment_id: file.id
                                    });
                                    if (response?.ResponseCode === "1") {
                                      toast.success("Attachment deleted successfully.");

                                      const newArr = values.attachments.filter((_, i) => i !== idx);
                                      setFieldValue('attachments', newArr);

                                      setIncidentFormDetails(prev => ({
                                        ...prev,
                                        attachments: newArr
                                      }));
                                    } else {
                                      toast.error(response?.ResponseText || "Failed to delete attachment.");
                                    }
                                  } catch (error) {
                                    console.error("Error deleting attachment:", error);
                                    toast.error("Failed to delete attachment.");
                                  } finally {
                                    setLoading(false);
                                  }
                                } else {
                                  // Just remove from state (for new uploads not yet saved)
                                  const newArr = values.attachments.filter((_, i) => i !== idx);
                                  setFieldValue('attachments', newArr);
                                }
                              }}
                            >
                              <span style={{ color: 'red', fontWeight: 'bold', fontSize: 18, lineHeight: 1 }}>×</span>
                            </Button>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </FormGroup>
              </Box>

              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%", backgroundColor: 'darkgray' }}>
                  NOTIFICATION
                </Box>
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: "100%", mb: 1 }}>
                    <Box component="label" sx={{ fontWeight: 600 }}>
                      Informed Of Incident
                    </Box>
                    <Box component="label" sx={{ fontWeight: 600, mr: 2 }}>
                      INITIAL
                    </Box>
                  </Box>
                  {InformedOfIncident.map((item) => (
                    <Box
                      key={item.key}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        mb: 1,
                        justifyContent: "space-between",
                        flexDirection: "row",
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Checkbox
                          checked={values.informed_of_incident?.includes(item.label) || false}
                          onChange={() => {
                            const current = values.informed_of_incident || [];
                            if (current.includes(item.label)) {
                              setFieldValue(
                                "informed_of_incident",
                                current.filter((v) => v !== item.label)
                              );
                              if (item.label === "Other") {
                                setFieldValue("informed_of_inc_other_text", "");
                              }
                            } else {
                              setFieldValue("informed_of_incident", [...current, item.label]);
                            }
                          }}
                          name="informed_of_incident"
                        />
                        <Box sx={{ minWidth: 170, mr: 2 }}>{item.label}</Box>
                        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                          <TextField
                            size="small"
                            variant="filled"
                            placeholder={`Enter ${item.label} Name/Details`}
                            name={
                              item.key === "informed_of_inc_AGM"
                                ? "initial_assistant_gm"
                                : item.key === "informed_of_inc_GM"
                                  ? "initial_gm"
                                  : item.key === "informed_of_inc_RMC"
                                    ? "initial_risk_mng_committee"
                                    : item.key === "informed_of_inc_other"
                                      ? "initial_other"
                                      : ""
                            }
                            value={
                              item.key === "informed_of_inc_AGM"
                                ? values.initial_assistant_gm || ""
                                : item.key === "informed_of_inc_GM"
                                  ? values.initial_gm || ""
                                  : item.key === "informed_of_inc_RMC"
                                    ? values.initial_risk_mng_committee || ""
                                    : item.key === "informed_of_inc_other"
                                      ? values.initial_other || ""
                                      : ""
                            }
                            onChange={(e) =>
                              setFieldValue(
                                item.key === "informed_of_inc_AGM"
                                  ? "initial_assistant_gm"
                                  : item.key === "informed_of_inc_GM"
                                    ? "initial_gm"
                                    : item.key === "informed_of_inc_RMC"
                                      ? "initial_risk_mng_committee"
                                      : item.key === "informed_of_inc_other"
                                        ? "initial_other"
                                        : "",
                                e.target.value
                              )
                            }
                            sx={{ width: 180 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))}
                  {values.informed_of_incident?.includes("Other") && (
                    <Box sx={{ width: '100%', mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        variant="filled"
                        placeholder="Enter Additional Details for Other"
                        name="informed_of_inc_other_text"
                        value={values.informed_of_inc_other_text || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.informed_of_inc_other_text) && (touched.informed_of_inc_other_text || submitCount > 0)}
                        helperText={
                          Boolean(errors.informed_of_inc_other_text) && (touched.informed_of_inc_other_text || submitCount > 0)
                            ? errors.informed_of_inc_other_text
                            : ""
                        }
                      />
                    </Box>
                  )}
                </FormGroup>

              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <Box component="label" sx={{ mb: 1, fontWeight: 700, width: "100%" }}>
                  Person Notified
                </Box>
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  FAMILY DOCTOR
                </Box>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Family Doctor"
                  name="notified_family_doctor"
                  value={values.notified_family_doctor || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ mb: 2 }}
                />
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Date/Time
                </Box>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={values.notified_family_doctor_date ? dayjs(values.notified_family_doctor_date) : null}
                      onChange={(newValue) => {
                        setFieldValue("notified_family_doctor_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                        if (newValue && !values.notified_family_doctor_tm) {
                          setFieldValue("notified_family_doctor_tm", "12:00 PM");
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.notified_family_doctor_date && Boolean(errors.notified_family_doctor_date),
                          helperText: touched.notified_family_doctor_date && errors.notified_family_doctor_date,
                        },
                      }}
                    />
                    <TimePicker
                      label="Time"
                      ampm={true}
                      value={
                        values.notified_family_doctor_tm
                          ? dayjs(values.notified_family_doctor_tm, values.notified_family_doctor_tm.includes("AM") || values.notified_family_doctor_tm.includes("PM") ? "hh:mm A" : "HH:mm")
                          : null
                      }
                      onChange={(newValue) =>
                        setFieldValue("notified_family_doctor_tm", newValue ? newValue.format("hh:mm A") : "")
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.notified_family_doctor_tm && Boolean(errors.notified_family_doctor_tm),
                          helperText: touched.notified_family_doctor_tm && errors.notified_family_doctor_tm,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Other
                </Box>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Other"
                  name="notified_other"
                  value={values.notified_other || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={values.notified_other_date ? dayjs(values.notified_other_date) : null}
                      onChange={(newValue) => {
                        setFieldValue("notified_other_date", newValue ? newValue.format("YYYY-MM-DD") : "");
                        if (newValue && !values.notified_other_tm) {
                          setFieldValue("notified_other_tm", "12:00 PM");
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: Boolean(errors.notified_other_date) && (touched.notified_other_date || submitCount > 0),
                          helperText: Boolean(errors.notified_other_date) && (touched.notified_other_date || submitCount > 0) ? errors.notified_other_date : "",
                        },
                      }}
                    />
                    <TimePicker
                      label="Time"
                      ampm={true}
                      value={
                        values.notified_other_tm
                          ? dayjs(values.notified_other_tm, values.notified_other_tm.includes("AM") || values.notified_other_tm.includes("PM") ? "hh:mm A" : "HH:mm")
                          : null
                      }
                      onChange={(newValue) =>
                        setFieldValue("notified_other_tm", newValue ? newValue.format("hh:mm A") : "")
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: Boolean(errors.notified_other_tm) && (touched.notified_other_tm || submitCount > 0),
                          helperText: Boolean(errors.notified_other_tm) && (touched.notified_other_tm || submitCount > 0) ? errors.notified_other_tm : "",
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>

                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Notified Resident's Responsible Party
                </Box>
                <FormGroup row>
                  {notifiedResponsiblePartyOptions.map((option) => (
                    <FormControlLabel
                      key={option.key}
                      control={
                        <Radio
                          checked={String(values.notified_resident_responsible_party).toLowerCase() === option.key.toLowerCase()}
                          onChange={() => setFieldValue("notified_resident_responsible_party", option.key)}
                          value={option.key}
                          name="notified_resident_responsible_party"
                        />
                      }
                      label={option.label}
                    />
                  ))}
                </FormGroup>
                {/* // --- Notified Resident Date --- */}
                {values.notified_resident_responsible_party === "Yes" && (
                  <Box sx={{ width: "100%", mt: 2, display: "flex", gap: 2 }}>
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Notified Resident Name"
                      name="notified_resident_name"
                      value={values.notified_resident_name || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(errors.notified_resident_name) && (touched.notified_resident_name || submitCount > 0)}
                      helperText={Boolean(errors.notified_resident_name) && (touched.notified_resident_name || submitCount > 0) ? errors.notified_resident_name : ""}
                      sx={{ mb: 2 }}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date"
                        value={values.notified_resident_date ? dayjs(values.notified_resident_date) : null}
                        onChange={(newValue) => {
                          setFieldValue("notified_resident_date", newValue ? newValue.format("YYYY-MM-DD") : "");
                          if (newValue && !values.notified_resident_tm) {
                            setFieldValue("notified_resident_tm", "12:00 PM");
                          }
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: "filled",
                            error: Boolean(errors.notified_resident_date) && (touched.notified_resident_date || submitCount > 0),
                            helperText:
                              Boolean(errors.notified_resident_date) && (touched.notified_resident_date || submitCount > 0)
                                ? errors.notified_resident_date
                                : "",
                          },
                        }}
                      />
                      <TimePicker
                        label="Time"
                        ampm={true}
                        value={
                          values.notified_resident_tm
                            ? dayjs(values.notified_resident_tm, values.notified_resident_tm.includes("AM") || values.notified_resident_tm.includes("PM") ? "hh:mm A" : "HH:mm")
                            : null
                        }
                        onChange={(newValue) =>
                          setFieldValue("notified_resident_tm", newValue ? newValue.format("hh:mm A") : "")  // Changed
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: "filled",
                            error: Boolean(errors.notified_resident_tm) && (touched.notified_resident_tm || submitCount > 0),
                            helperText:
                              Boolean(errors.notified_resident_tm) && (touched.notified_resident_tm || submitCount > 0)
                                ? errors.notified_resident_tm
                                : "",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                )}
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Completed By
                </Box>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Completed By"
                  name="completed_by"
                  value={values.completed_by || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ mb: 2 }}
                  error={Boolean(errors.completed_by) && (touched.completed_by || submitCount > 0)}
                  helperText={Boolean(errors.completed_by) && (touched.completed_by || submitCount > 0) ? errors.completed_by : ""}
                />
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Position
                </Box>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Position"
                  name="completed_position"
                  value={values.completed_position || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.completed_position) && (touched.completed_position || submitCount > 0)}
                  helperText={Boolean(errors.completed_position) && (touched.completed_position || submitCount > 0) ? errors.completed_position : ""}
                  sx={{ mb: 2 }}
                />
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Date/Time Completed
                </Box>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={values.completed_date ? dayjs(values.completed_date) : null}
                      onChange={(newValue) => {
                        setFieldValue("completed_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                        if (newValue && !values.completed_tm) {
                          setFieldValue("completed_tm", "12:00 PM");  // Changed
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.completed_date && Boolean(errors.completed_date),
                          helperText: touched.completed_date && errors.completed_date,
                        },
                      }}
                    />
                    <TimePicker
                      label="Time"
                      ampm={true}
                      value={
                        values.completed_tm
                          ? dayjs(values.completed_tm, values.completed_tm.includes("AM") || values.completed_tm.includes("PM") ? "hh:mm A" : "HH:mm")
                          : null
                      }
                      onChange={(newValue) =>
                        setFieldValue("completed_tm", newValue ? newValue.format("hh:mm A") : "")
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.completed_tm && Boolean(errors.completed_tm),
                          helperText: touched.completed_tm && errors.completed_tm,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Assign Follow Up to
                </Box>
                <TextField
                  select
                  fullWidth
                  variant="filled"
                  label="Assign Follow Up to"
                  name="follow_up_assigned_to"
                  value={values.follow_up_assigned_to || ''}
                  onChange={(e) => {
                    handleChange(e);
                    const selectedId = e.target.value;
                    const userRole = userData?.role;
                    const currentUserId = userData?.user_id;
                    if (
                      userRole === "admin" ||
                      userRole === "superadmin" ||
                      String(currentUserId) === String(selectedId)
                    ) {
                      setCanEditFollowUpFields(true);
                    } else {
                      setCanEditFollowUpFields(false);
                      setFieldValue("followUp_issue", "");
                      setFieldValue("followUp_findings", "");
                      setFieldValue("followUp_possible_solutions", "");
                      setFieldValue("followUp_action_plan", "");
                      setFieldValue("followUp_examine_result", "");
                    }
                  }}
                  onBlur={handleBlur}
                  sx={{ mb: 2 }}
                  error={touched.follow_up_assigned_to && Boolean(errors.follow_up_assigned_to)}
                  helperText={touched.follow_up_assigned_to && errors.follow_up_assigned_to}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 200
                        }
                      }
                    },
                    renderValue: (selected) => {
                      if (!selected) return "Select";
                      const user = userData?.user_list?.find(u => u.id === selected);
                      return user ? user.name : selected;
                    }
                  }}
                >
                  <MenuItem value="">Select</MenuItem>
                  {Array.isArray(userData?.user_list) &&
                    userData.user_list.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                </TextField>

              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }} ref={followUpRef}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.show_follow_up_details || false}
                      onChange={(e) => setFieldValue('show_follow_up_details', e.target.checked)}
                      name="show_follow_up_details"
                    />
                  }
                  label="Show Follow Up Details"
                />
                {values.show_follow_up_details && (
                  <>
                    <Box sx={{ mb: 2, backgroundColor: '#e0e0e0', borderRadius: 1, py: 1 }}>
                      <Typography variant="h6" align="center" sx={{ fontWeight: 700, color: '#333' }}>
                        FOLLOW UP
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      variant="filled"
                      label="ISSUE (Problem)"
                      name="followUp_issue"
                      value={values.followUp_issue || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ mb: 2 }}
                      disabled={!canEditFollowUpFields && (formId ? !canUpdateFollowUp : !canEditFollowUp)}
                    // disabled={formId ? !canUpdateFollowUp : !canEditFollowUp} //when canEditFollowUpFields true that time enable
                    />
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      variant="filled"
                      label="FINDINGS (Gather Information)"
                      name="followUp_findings"
                      value={values.followUp_findings || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ mb: 2 }}
                      disabled={!canEditFollowUpFields && (formId ? !canUpdateFollowUp : !canEditFollowUp)}
                    />
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      variant="filled"
                      label="POSSIBLE SOLUTIONS (Identify Solution)"
                      name="followUp_possible_solutions"
                      value={values.followUp_possible_solutions || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ mb: 2 }}
                      disabled={!canEditFollowUpFields && (formId ? !canUpdateFollowUp : !canEditFollowUp)}
                    />
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      variant="filled"
                      label="ACTION PLAN"
                      name="followUp_action_plan"
                      value={values.followUp_action_plan || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ mb: 2 }}
                      disabled={!canEditFollowUpFields && (formId ? !canUpdateFollowUp : !canEditFollowUp)}
                    />
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      variant="filled"
                      label="FOLLOW UP (Examine Result - Did the Plan work?)"
                      name="followUp_examine_result"
                      value={values.followUp_examine_result || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ mb: 2 }}
                      disabled={!canEditFollowUpFields && (formId ? !canUpdateFollowUp : !canEditFollowUp)}
                    />
                  </>
                )}
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
              <Dialog open={showFollowUpConfirm} onClose={() => setShowFollowUpConfirm(false)}>
                <DialogTitle>Incomplete Follow Up</DialogTitle>
                <DialogContent>
                  Follow Up form is not completely filled. Do you still want to submit it?
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowFollowUpConfirm(false)} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
                    Yes, Submit
                  </Button>
                </DialogActions>
              </Dialog>
            </form>
          )}
        </Formik>
      )}
    </Box>
  );
};

export default IncidentForm;
