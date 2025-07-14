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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
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
  incident_location: yup.string().required("Location Of Incident is required"),
  witnessed_by: yup.string().required("Witnessed By is required"),

  // Discovery
  discovery_date: yup.string().required("Date Of Discovery is required"),
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



  // formTypes: yup.string().required("Form Type is required"),
  // incidentGroups: yup.array().of(yup.string()),

  // 
  // 

  // safety_fob: yup.string().required("Required"),
  // safety_callbell: yup.string().required("Required"),
  // safety_caution: yup.string().required("Required"),
  // safety_other: yup.string(),
  // alarm_pulled: yup.string().required("Required"),
  // false_alarm: yup.string().required("Required"),
  // extinguisher_used: yup.string().required("Required"),
  // personal_injury: yup.string().required("Required"),
  // property_damage: yup.string().required("Required"),
  // incident_description: yup.string().required("Description is required"),


  // Add a custom test at the object level:
});

const IncidentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [incidentFormDetails, setIncidentFormDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setIncidentFormDetails(location.state || {});
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [location.state]);


  const initialValues = useMemo(
    () => ({
      id: incidentFormDetails?.id || "",
      formTypes: incidentFormDetails?.formTypes || "",
      // Unique state for each group
      incident_involved: incidentFormDetails?.incident_involved || [],
      inc_invl_other_text: incidentFormDetails?.inc_invl_other_text || "",

      incident_date: incidentFormDetails?.incident_date || "",
      incident_location: incidentFormDetails?.incident_location || "",
      witnessed_by: incidentFormDetails?.witnessed_by || "",
      discovery_date: incidentFormDetails?.discovery_date || "",
      discovery_location: incidentFormDetails?.discovery_location || "",
      discovered_by: incidentFormDetails?.discovered_by || "",

      type_of_incident: incidentFormDetails?.type_of_incident || [],
      type_of_inc_other_text: incidentFormDetails?.type_of_inc_other_text || "",

      // Safety Devices
      safety_fob: incidentFormDetails?.safety_fob || "",
      safety_callbell: incidentFormDetails?.safety_callbell || "",
      safety_caution: incidentFormDetails?.safety_caution || "",
      safety_other: incidentFormDetails?.safety_other || "",

      // Other Witnesses
      other_witnesses: incidentFormDetails?.other_witnesses || "",
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

      // Unique Other fields
      // ...existing code...

      // Safety Devices
      safety_fob: incidentFormDetails?.safety_fob || "",
      safety_callbell: incidentFormDetails?.safety_callbell || "",
      safety_caution: incidentFormDetails?.safety_caution || "",
      safety_other: incidentFormDetails?.safety_other || "",
      // Other Witnesses
      other_witnesses: incidentFormDetails?.other_witnesses || "",
      // Fire Section
      alarm_pulled: incidentFormDetails?.alarm_pulled || "",
      false_alarm: incidentFormDetails?.false_alarm || "",
      extinguisher_used: incidentFormDetails?.extinguisher_used || "",
      personal_injury: incidentFormDetails?.personal_injury || "",
      property_damage: incidentFormDetails?.property_damage || "",
      // Incident Description
      incident_description: incidentFormDetails?.incident_description || "",
      informed_assistant_manager: false,
      informed_assistant_manager_details: "",
      informed_general_manager: false,
      informed_general_manager_details: "",
      informed_risk_committee: false,
      informed_risk_committee_details: "",
      informed_other: false,
      informed_other_details: "",
      // New fields
      family_doctor: incidentFormDetails?.family_doctor || "",
      family_doctor_datetime: incidentFormDetails?.family_doctor_datetime || "",
      family_doctor_other: incidentFormDetails?.family_doctor_other || "",
      notified_responsible_party: incidentFormDetails?.notified_responsible_party || "",
      completed_by: incidentFormDetails?.completed_by || "",
      completed_by_position: incidentFormDetails?.completed_by_position || "",
      completed_by_datetime: incidentFormDetails?.completed_by_datetime || "",
      assign_follow_up: incidentFormDetails?.assign_follow_up || "",
      attachments: incidentFormDetails?.attachments || [],
      show_follow_up_details: incidentFormDetails?.show_follow_up_details || false,
      follow_up_issue: incidentFormDetails?.follow_up_issue || '',
      follow_up_findings: incidentFormDetails?.follow_up_findings || '',
      follow_up_possible_solutions: incidentFormDetails?.follow_up_possible_solutions || '',
      follow_up_action_plan: incidentFormDetails?.follow_up_action_plan || '',
      follow_up_result: incidentFormDetails?.follow_up_result || '',
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

      const payload = {
        incident_involved: incidentInvolvedArr.join(","),
        inc_invl_staff: values.incident_involved?.includes("Staff") ? 1 : 0,
        inc_invl_resident: values.incident_involved?.includes("Resident") ? 1 : 0,
        inc_invl_visitor: values.incident_involved?.includes("Visitor") ? 1 : 0,
        inc_invl_other: values.incident_involved?.includes("Other") ? 1 : 0,
        incident_date: values.incident_date
          ? dayjs(values.incident_date).format("DD MMM YYYY hh:mm A")
          : "",
        incident_dt: values.incident_date
          ? dayjs(values.incident_date).format("DD MMM YYYY")
          : "",
        incident_tm: values.incident_date
          ? dayjs(values.incident_date).format("hh:mm A")
          : "",
        incident_location: values.incident_location || "",
        witnessed_by: values.witnessed_by || "",
        discovery_date: values.discovery_date
          ? dayjs(values.discovery_date).format("DD MMM YYYY hh:mm A")
          : "",
        discovery_dt: values.discovery_date
          ? dayjs(values.discovery_date).format("DD MMM YYYY")
          : "",
        discovery_tm: values.discovery_date
          ? dayjs(values.discovery_date).format("hh:mm A")
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

        // 
        // ambulation: incidentFormDetails?.ambulation || [],
        ...(ambulationStr ? { ambulation: ambulationStr } : {}),
        ...(values.ambulation?.includes("Other (Specify)") && values.ambulation_other_text
          ? { ambulation_other_text: values.ambulation_other_text }
          : {}),
        ...ambulationOptions.reduce((acc, option) => {
          acc[option.key] = values.ambulation?.includes(option.label) ? 1 : 0;
          return acc;
        }, {}),

      };
      console.log("Payload", payload);
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
                <Box sx={{ width: "100%", display: 'flex', gap: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={values.incident_date ? dayjs(values.incident_date) : null}
                      onChange={(newValue) =>
                        setFieldValue("incident_date", newValue ? newValue.format("YYYY-MM-DD") : "")
                      }
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.incident_date && Boolean(errors.incident_date),
                          helperText: touched.incident_date && errors.incident_date,
                          sx: { gridColumn: "span 1", mt: 1 },
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
                  {[
                    { key: "alarm_pulled", label: "Alarm pulled" },
                    { key: "false_alarm", label: "False alarm" },
                    { key: "extinguisher_used", label: "Exitinguisher used" },
                    { key: "personal_injury", label: "Personal injury" },
                    { key: "property_damage", label: "Resident or facility property damage" },
                  ].map((item) => (
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
                    name="incident_description"
                    value={values.incident_description || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.incident_description && Boolean(errors.incident_description)}
                    helperText={touched.incident_description && errors.incident_description}
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
                  {[
                    { key: "informed_assistant_manager", label: "Assistant General Manager" },
                    { key: "informed_general_manager", label: "General Manager" },
                    { key: "informed_risk_committee", label: "Risk Management Committee" },
                    { key: "informed_other", label: "Other" },
                  ].map((item) => {
                    const isOther = item.key === "informed_other";
                    return (
                      <Box
                        key={item.key}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          mb: 1,
                          justifyContent: "space-between",
                          flexDirection: isOther ? 'column' : 'row',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Checkbox
                            checked={!!values[item.key]}
                            onChange={(e) => setFieldValue(item.key, e.target.checked ? true : false)}
                            name={item.key}
                          />
                          <Box sx={{ minWidth: 170, mr: 2 }}>{item.label}
                            {isOther && values.informed_other && (
                              <Box sx={{ width: '100%', mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                <TextField
                                  size="small"
                                  variant="filled"
                                  placeholder="Enter Additional Details for Other"
                                  value={values.informed_other_extra_details || ""}
                                  onChange={(e) => setFieldValue('informed_other_extra_details', e.target.value)}
                                  sx={{ width: 220 }}
                                />
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                            <TextField
                              size="small"
                              variant="filled"
                              placeholder={`Enter ${item.label} Name/Details`}
                              value={values[`${item.key}_details`] || ""}
                              onChange={(e) => setFieldValue(`${item.key}_details`, e.target.value)}
                              sx={{ width: 180 }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </FormGroup>
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  FAMILY DOCTOR
                </Box>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Family Doctor"
                  name="family_doctor"
                  value={values.family_doctor || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ mb: 2 }}
                />
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Date/Time
                </Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date/Time"
                    value={values.family_doctor_datetime ? dayjs(values.family_doctor_datetime) : null}
                    onChange={(newValue) =>
                      setFieldValue("family_doctor_datetime", newValue ? newValue.format("YYYY-MM-DD") : "")
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "filled",
                        sx: { mb: 2 },
                      },
                    }}
                  />
                </LocalizationProvider>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Other
                </Box>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Other"
                  name="family_doctor_other"
                  value={values.family_doctor_other || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ mb: 2 }}
                />
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Notified Resident's Responsible Party
                </Box>
                <FormGroup row>
                  {["Yes", "No"].map((option) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Radio
                          checked={values.notified_responsible_party === option}
                          onChange={() => setFieldValue("notified_responsible_party", option)}
                          value={option}
                          name="notified_responsible_party"
                        />
                      }
                      label={option}
                    />
                  ))}
                </FormGroup>
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
                />
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Position
                </Box>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Position"
                  name="completed_by_position"
                  value={values.completed_by_position || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ mb: 2 }}
                />
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Date/Time Completed
                </Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date/Time Completed"
                    value={values.completed_by_datetime ? dayjs(values.completed_by_datetime) : null}
                    onChange={(newValue) =>
                      setFieldValue("completed_by_datetime", newValue ? newValue.format("YYYY-MM-DD") : "")
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "filled",
                        sx: { mb: 2 },
                      },
                    }}
                  />
                </LocalizationProvider>
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Assign Follow Up to
                </Box>
                <TextField
                  select
                  fullWidth
                  variant="filled"
                  label="Assign Follow Up to"
                  name="assign_follow_up"
                  value={values.assign_follow_up || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Nurse">Nurse</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Doctor">Doctor</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
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
                      name="follow_up_issue"
                      value={values.follow_up_issue || ''}
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
                      name="follow_up_findings"
                      value={values.follow_up_findings || ''}
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
                      name="follow_up_possible_solutions"
                      value={values.follow_up_possible_solutions || ''}
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
                      name="follow_up_action_plan"
                      value={values.follow_up_action_plan || ''}
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
                      name="follow_up_result"
                      value={values.follow_up_result || ''}
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