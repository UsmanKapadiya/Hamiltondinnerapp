import {
  Box,
  Button,
  TextField,
  useMediaQuery,
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
import { useEffect, useState, useMemo, useCallback } from "react";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import { toast } from "react-toastify";
import StaticFormServices from "../../services/staticFormServices";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CustomButton from "../../components/CustomButton";

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
  { key: "fall_assess_cardMedi", label: "Caediac Medications" },
  { key: "fall_assess_visDef", label: "Visual Deficit" },
  { key: "fall_assess_moodAltMedi", label: "Mood Altering Medicatior" },
  { key: "fall_assess_relocation", label: "Relocation" },
  { key: "fall_assess_tempIllness", label: "Temporary Ilness" }
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
  { key: "fire_extinguisher_used", label: "Exitinguisher used" },
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
  { key: "yes", label: "Yes" },
  { key: "no", label: "No" }
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
  discovered_by: yup.string().required("Discovery By is required"),

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

  //completed 
  completed_by: yup.string().required("Completed By is required"),
  completed_position: yup.string().required("Completed Position is required"),
  completed_date: yup.string().required("Completed Date is required"),
  completed_tm: yup.string().required("Completed Time is required"),

});

const IncidentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [incidentFormDetails, setIncidentFormDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [formId, setFormId] = useState();
  const [userData] = useState(() => {
    const userDatas = localStorage.getItem("userData");
    return userDatas ? JSON.parse(userDatas) : null;
  });
  // Add this utility function above your IncidentForm component

  function mapIncidentInvolved(rawString) {
    if (!rawString) return { incident_involved: [], inc_invl_other_text: "" };
    const values = rawString.split(",").map(v => v.trim());
    const labels = incidentInvolvedData.map(opt => opt.label);
    const incident_involved = [];
    let inc_invl_other_text = "";

    values.forEach(val => {
      if (labels.includes(val)) {
        incident_involved.push(val);
      } else if (val) {
        incident_involved.push("Other");
        inc_invl_other_text = val;
      }
    });

    return { incident_involved, inc_invl_other_text };
  }

  function mapTypeOfIncident(rawString) {
    if (!rawString) return { type_of_incident: [], type_of_inc_other_text: "" };
    const values = rawString.split(",").map(v => v.trim());
    const labels = typeOfIncidentOptions.map(opt => opt.label);
    const type_of_incident = [];
    let type_of_inc_other_text = "";

    values.forEach(val => {
      if (labels.includes(val)) {
        type_of_incident.push(val);
      } else if (val) {
        type_of_incident.push("Other");
        type_of_inc_other_text = val;
      }
    });

    return { type_of_incident, type_of_inc_other_text };
  }

  function mapConditionAtIncident(rawString) {
    if (!rawString) return { condition_at_incident: [], condition_at_inc_other_text: "" };
    const values = rawString.split(",").map(v => v.trim());
    const labels = conditionAtTimeOptions.map(opt => opt.label);
    const condition_at_incident = [];
    let condition_at_inc_other_text = "";

    values.forEach(val => {
      if (labels.includes(val)) {
        condition_at_incident.push(val);
      } else if (val) {
        condition_at_incident.push("Other (Specify)");
        condition_at_inc_other_text = val;
      }
    });

    return { condition_at_incident, condition_at_inc_other_text };
  }
  function mapAmbulation(rawString) {
    if (!rawString) return { ambulation: [], ambulation_other_text: "" };
    const values = rawString.split(",").map(v => v.trim());
    const labels = ambulationOptions.map(opt => opt.label);
    const ambulation = [];
    let ambulation_other_text = "";

    values.forEach(val => {
      if (labels.includes(val)) {
        ambulation.push(val);
      } else if (val) {
        ambulation.push("Other (Specify)");
        ambulation_other_text = val;
      }
    });

    return { ambulation, ambulation_other_text };
  }
  function mapInformedOfIncident(rawString) {
    if (!rawString) return { informed_of_incident: [], informed_of_inc_other_text: "" };
    const values = rawString.split(",").map(v => v.trim());
    const labels = InformedOfIncident.map(opt => opt.label);
    const informed_of_incident = [];
    let informed_of_inc_other_text = "";

    values.forEach(val => {
      if (labels.includes(val)) {
        informed_of_incident.push(val);
      } else if (val) {
        informed_of_incident.push("Other");
        informed_of_inc_other_text = val;
      }
    });

    return { informed_of_incident, informed_of_inc_other_text };
  }
  useEffect(() => {
    setLoading(true);

    if (location.state?.formData?.ResponseCode === "1") {
      const data = location.state.formData.form_data || {};
      setFormId(location.state?.id)
      const followUpFilled =
        !!data.followUp_issue ||
        !!data.followUp_findings ||
        !!data.followUp_possible_solutions ||
        !!data.followUp_action_plan ||
        !!data.followUp_examine_result;

      setIncidentFormDetails({
        ...data,
        // Parse comma-separated strings to arrays for multi-select fields
        ...mapIncidentInvolved(data.incident_involved),
        ...mapTypeOfIncident(data.type_of_incident),
        ...mapConditionAtIncident(data.condition_at_incident),
        ...mapAmbulation(data.ambulation),
        ...mapInformedOfIncident(data.informed_of_incident),
        fall_assessment: data.fall_assessment ? data.fall_assessment.split(",") : [],
        follow_up_assigned_to: incidentFormDetails?.follow_up_assigned_to || 1,
        show_follow_up_details: followUpFilled || incidentFormDetails?.show_follow_up_details || false,
        // Attachments
        attachments: location.state.formData.attachments || [],
        // Fill other fields as needed
      });
      setLoading(false);
    } else {
      // Default: use location.state or empty object
      const timer = setTimeout(() => {
        setIncidentFormDetails(location.state || {});
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [location.state]);


  const initialValues = useMemo(
    () => ({
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

      // Safety Devices
      safety_fob: incidentFormDetails?.safety_fob ?? "No",
      safety_callbell: incidentFormDetails?.safety_callbell ?? "No",
      safety_caution: incidentFormDetails?.safety_caution ?? "No",
      safety_other: incidentFormDetails?.safety_other ?? "",

      // Other Witnesses
      other_witnesses: incidentFormDetails?.other_witnesses ?? "No",
      witness_name1: incidentFormDetails?.witness_name1 || "",
      witness_position1: incidentFormDetails?.witness_position1 || "",
      witness_name2: incidentFormDetails?.witness_name2 || "",
      witness_position2: incidentFormDetails?.witness_position2 || "",

      // Condition At Time of Incident
      condition_at_incident: incidentFormDetails?.condition_at_incident || [],
      condition_at_inc_other_text: incidentFormDetails?.condition_at_inc_other_text || "",

      // Fall Assessment 
      fall_assessment: incidentFormDetails?.fall_assessment || [],

      // Ambulation
      ambulation: incidentFormDetails?.ambulation || [],
      ambulation_other_text: incidentFormDetails?.ambulation_other_text || "",

      // Fire Section
      fire_alarm_pulled: incidentFormDetails?.fire_alarm_pulled ?? "No",
      fire_false_alarm: incidentFormDetails?.fire_false_alarm ?? "No",
      fire_extinguisher_used: incidentFormDetails?.fire_extinguisher_used ?? "No",
      fire_personal_injury: incidentFormDetails?.fire_personal_injury ?? "No",
      fire_property_damage: incidentFormDetails?.fire_property_damage ?? "No",

      // FACTUAL CONCISE DESCRIPTION OF INCIDENT, INJURY AND ACTION TAKEN
      factual_description: incidentFormDetails?.factual_description || "",

      // NOTIFICATION
      // Informed Of Incident
      informed_of_incident: incidentFormDetails?.informed_of_incident || [],
      initial_assistant_gm: incidentFormDetails?.initial_assistant_gm || "",
      initial_gm: incidentFormDetails?.initial_gm || "",
      initial_risk_mng_committee: incidentFormDetails?.initial_risk_mng_committee || "",
      initial_other: incidentFormDetails?.initial_other || "",
      informed_of_inc_other_text: incidentFormDetails?.informed_of_inc_other_text,

      // NOTIFICATION
      // family doctor
      notified_family_doctor: incidentFormDetails?.notified_family_doctor || "",
      notified_family_doctor_date: incidentFormDetails?.notified_family_doctor_date || "",
      notified_family_doctor_dt: incidentFormDetails?.notified_family_doctor_dt || "",
      notified_family_doctor_tm: incidentFormDetails?.notified_family_doctor_tm || "",
      notified_other: incidentFormDetails?.notified_other || "",

      notified_resident_responsible_party: incidentFormDetails?.notified_resident_responsible_party ?? "no",
      notified_resident_name: incidentFormDetails?.notified_resident_name || "",
      notified_resident_date: incidentFormDetails?.notified_resident_date || "",
      notified_resident_tm: incidentFormDetails?.notified_resident_tm || "",

      // completed_by
      completed_by: incidentFormDetails?.completed_by || "",
      completed_position: incidentFormDetails?.completed_position || "",
      completed_date: incidentFormDetails?.completed_date || "",
      completed_tm: incidentFormDetails?.completed_tm || "",

      //Follow Up Assign to 
      follow_up_assigned_to: incidentFormDetails?.follow_up_assigned_to || "",

      // Show Follow Up Details
      followUp_issue: incidentFormDetails?.followUp_issue || '',
      followUp_findings: incidentFormDetails?.followUp_findings || '',
      followUp_possible_solutions: incidentFormDetails?.followUp_possible_solutions || '',
      followUp_action_plan: incidentFormDetails?.followUp_action_plan || '',
      followUp_examine_result: incidentFormDetails?.followUp_examine_result || '',


      attachments: incidentFormDetails?.attachments || [],
      show_follow_up_details: incidentFormDetails?.show_follow_up_details || false,

    }),
    [incidentFormDetails]
  );


  const handleFormSubmit = useCallback(
    async (values, actions) => {
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
        ? dayjs(`${values.incident_date} ${values.incident_tm}`, "YYYY-MM-DD HH:mm")
        : null;
      const discoveryDateTime = values.discovery_date && values.discovery_tm
        ? dayjs(`${values.discovery_date} ${values.discovery_tm}`, "YYYY-MM-DD HH:mm")
        : null;

      const notifiedFamilyDoctorDateTime = values.notified_family_doctor_date && values.notified_family_doctor_tm
        ? dayjs(`${values.notified_family_doctor_date} ${values.notified_family_doctor_tm}`, "YYYY-MM-DD HH:mm")
        : null;

      const notifiedResidentDateTime = values.notified_resident_date && values.notified_resident_tm
        ? dayjs(`${values.notified_resident_date} ${values.notified_resident_tm}`, "YYYY-MM-DD HH:mm")
        : null;

      const completedDateTime = values.completed_date && values.completed_tm
        ? dayjs(`${values.completed_date} ${values.completed_tm}`, "YYYY-MM-DD HH:mm")
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
        incident_tm: values.incident_tm
          ? dayjs(values.incident_tm, "HH:mm").format("hh:mm A")
          : "",
        incident_location: values.incident_location || "",
        witnessed_by: values.witnessed_by || "",
        discovery_date: discoveryDateTime
          ? dayjs(discoveryDateTime).format("DD MMM YYYY hh:mm A")
          : "",
        discovery_dt: discoveryDateTime
          ? dayjs(discoveryDateTime).format("DD MMM YYYY")
          : "",
        discovery_tm: values.discovery_tm
          ? dayjs(values.discovery_tm, "HH:mm").format("hh:mm A")
          : "",
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
        notified_family_doctor_tm: values.notified_family_doctor_tm
          ? dayjs(values.notified_family_doctor_tm, "HH:mm").format("hh:mm A")
          : "",
        notified_other: values.notified_other || "",

        notified_resident_responsible_party: values.notified_resident_responsible_party || "",
        notified_resident_name: values.notified_resident_name || "",
        notified_resident_date: notifiedResidentDateTime
          ? dayjs(notifiedResidentDateTime).format("DD MMM YYYY hh:mm A")
          : "",
        notified_resident_dt: notifiedResidentDateTime
          ? dayjs(notifiedResidentDateTime).format("DD MMM YYYY")
          : "",
        notified_resident_tm: values.notified_resident_tm
          ? dayjs(values.notified_resident_tm, "HH:mm").format("hh:mm A")
          : "",

        // Completed
        completed_by: values.completed_by || "",
        completed_position: values.completed_position || "",
        completed_date: completedDateTime
          ? dayjs(completedDateTime).format("DD MMM YYYY hh:mm A")
          : "",
        completed_dt: completedDateTime
          ? dayjs(completedDateTime).format("DD MMM YYYY")
          : "",
        completed_tm: values.completed_tm
          ? dayjs(values.completed_tm, "HH:mm").format("hh:mm A")
          : "",

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
      try {
        if (formId) {
          const response = await StaticFormServices.logFormUpdate(finalPayload);
          if (response?.ResponseCode === "1") {
            toast.success("Form Updated successfully.");
          }
        } else {
          const response = await StaticFormServices.logFormSubmit(finalPayload);
          if (response?.ResponseCode === "1") {
            toast.success(response?.ResponseText || "Form submitted successfully.");
          }
        }
      } catch (error) {
        toast.error("Form is not submitted. Please try again.");
      } finally {
        setLoading(false);
      }
      // Submit payload to API here
    },
    [initialValues, navigate]
  );


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
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    Incident Involved
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
                        // If incident_tm is empty, set default to "12:00"
                        if (newValue && !values.incident_tm) {
                          setFieldValue("incident_tm", "12:00");
                        }
                      }}
                      minDate={dayjs()}
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
                      value={values.incident_tm ? dayjs(values.incident_tm, "HH:mm") : null}
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
              {/* <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Date/Time Of Discovery
                </Box>
                <Box sx={{ width: "100%" }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={values.discovery_date ? dayjs(values.discovery_date) : null}
                      onChange={(newValue) =>
                        setFieldValue("discovery_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                      }
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.discovery_date && Boolean(errors.discovery_date),
                          helperText: touched.discovery_date && errors.discovery_date,
                          sx: { gridColumn: "span 1", mt: 1 }, // Add margin-top to separate from label
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Box> */}
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Date/Time Of Discovery
                </Box>
                <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={values.discovery_date ? dayjs(values.discovery_date) : null}
                      onChange={(newValue) =>
                        setFieldValue("discovery_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                      }
                      minDate={dayjs()}
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
                      value={values.discovery_tm ? dayjs(values.discovery_tm, "HH:mm") : null}
                      onChange={(newValue) =>
                        setFieldValue(
                          "discovery_tm",
                          newValue ? newValue.format("HH:mm") : ""
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
                  label="Discovery By"
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
                    Safety Devices In Use Before Occurrence
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
                      onChange={(event) => {
                        const files = Array.from(event.currentTarget.files);
                        const prev = values.attachments || [];
                        setFieldValue("attachments", [...prev, ...files]);
                      }}
                    />
                  </Button>
                  {Array.isArray(values.attachments) && values.attachments.length > 0 && (
                    <Box sx={{ width: '100%', mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {values.attachments.map((file, idx) => {
                        const isImage = file.type.startsWith('image/');
                        const isVideo = file.type.startsWith('video/');
                        return (
                          <Box key={idx} sx={{ position: 'relative', display: 'inline-block' }}>
                            {isImage ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }}
                              />
                            ) : isVideo ? (
                              <video
                                src={URL.createObjectURL(file)}
                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }}
                                controls
                              />
                            ) : null}
                            <Button
                              size="small"
                              sx={{ position: 'absolute', top: 0, right: 0, minWidth: 0, p: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
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
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%", backgroundColor: 'darkgray' }}>
                  NOTIFICATION
                </Box>
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    Informed Of Incident
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
                      onChange={(newValue) =>
                        setFieldValue("notified_family_doctor_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                      }
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
                      value={values.notified_family_doctor_tm ? dayjs(values.notified_family_doctor_tm, "HH:mm") : null}
                      onChange={(newValue) =>
                        setFieldValue("notified_family_doctor_tm", newValue ? newValue.format("HH:mm") : "")
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
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Notified Resident's Responsible Party
                </Box>
                <FormGroup row>
                  {notifiedResponsiblePartyOptions.map((option) => (
                    <FormControlLabel
                      key={option.key}
                      control={
                        <Radio
                          checked={values.notified_resident_responsible_party === option.key}
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
                {values.notified_resident_responsible_party === "yes" && (
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
                        onChange={(newValue) =>
                          setFieldValue("notified_resident_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                        }
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
                        value={values.notified_resident_tm ? dayjs(values.notified_resident_tm, "HH:mm") : null}
                        onChange={(newValue) =>
                          setFieldValue("notified_resident_tm", newValue ? newValue.format("HH:mm") : "")
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
                      onChange={(newValue) =>
                        setFieldValue("completed_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                      }
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
                      value={values.completed_tm ? dayjs(values.completed_tm, "HH:mm") : null}
                      onChange={(newValue) =>
                        setFieldValue("completed_tm", newValue ? newValue.format("HH:mm") : "")
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
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ mb: 2 }}
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
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
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
                        FOLLOW UP DETAILS
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      variant="filled"
                      label="Issue (Problem)"
                      name="followUp_issue"
                      value={values.followUp_issue || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ mb: 2 }}
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
            </form>
          )}
        </Formik>
      )}
    </Box>
  );
};

export default IncidentForm;