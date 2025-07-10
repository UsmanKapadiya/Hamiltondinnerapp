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

const validationSchema = yup.object({
  formTypes: yup.string().required("Form Type is required"),
  incidentGroups: yup.array().of(yup.string()),
  date: yup.string().required("Date is required"),
  location_of_incident: yup.string().required("Location Of Incident is required"),
  witnessed_by: yup.string().required("Witnessed By is required"),
  date_of_discovery: yup.string().required("Date Of Discovery is required"),
  location_of_discovery: yup.string().required("Location Of Discovery is required"),
  discovery_by: yup.string().required("Discovery By is required"),
  fob_within_reach: yup.string().required("Required"),
  call_bell_within_reach: yup.string().required("Required"),
  caution_signs_in_place: yup.string().required("Required"),
  Safety_devices_other: yup.string(),
  other_witnesses: yup.string().required("Required"),
  alarm_pulled: yup.string().required("Required"),
  false_alarm: yup.string().required("Required"),
  extinguisher_used: yup.string().required("Required"),
  personal_injury: yup.string().required("Required"),
  property_damage: yup.string().required("Required"),
  incident_description: yup.string().required("Description is required"),
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
      incidentInvolved: incidentFormDetails?.incidentInvolved || [],
      incidentType: incidentFormDetails?.incidentType || [],
      conditionAtTime: incidentFormDetails?.conditionAtTime || [],
      ambulation: incidentFormDetails?.ambulation || [],
      fallAssessment: incidentFormDetails?.fallAssessment || [],
      // Unique Other fields
      incidentInvolvedOtherDetail: incidentFormDetails?.incidentInvolvedOtherDetail || "",
      incidentTypeOtherDetail: incidentFormDetails?.incidentTypeOtherDetail || "",
      conditionOtherDetail: incidentFormDetails?.conditionOtherDetail || "",
      ambulationOtherDetail: incidentFormDetails?.ambulationOtherDetail || "",
      // ...existing code...
      date: incidentFormDetails?.date || "",
      location_of_incident: incidentFormDetails?.location_of_incident || "",
      witnessed_by: incidentFormDetails?.witnessed_by || "",
      date_of_discovery: incidentFormDetails?.date_of_discovery || "",
      location_of_discovery: incidentFormDetails?.location_of_discovery || "",
      discovery_by: incidentFormDetails?.discovery_by || "",
      // Safety Devices
      fob_within_reach: incidentFormDetails?.fob_within_reach || "",
      call_bell_within_reach: incidentFormDetails?.call_bell_within_reach || "",
      caution_signs_in_place: incidentFormDetails?.caution_signs_in_place || "",
      Safety_devices_other: incidentFormDetails?.Safety_devices_other || "",
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
      console.log("Values", values);
      console.log("actions", actions);
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
        // validationSchema={validationSchema}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            setFieldValue,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    Incident Involved
                  </Box>
                  {["Resident", "Staff", "Visitor", "Other"].map((option) => (
                    <Box key={option} sx={{ width: "50%" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.incidentInvolved?.includes(option) || false}
                            onChange={() => {
                              const current = values.incidentInvolved || [];
                              if (current.includes(option)) {
                                setFieldValue(
                                  "incidentInvolved",
                                  current.filter((item) => item !== option)
                                );
                              } else {
                                setFieldValue("incidentInvolved", [...current, option]);
                              }
                            }}
                            name="incidentInvolved"
                          />
                        }
                        label={option}
                      />
                    </Box>
                  ))}
                  {values.incidentInvolved?.includes("Other") && (
                    <Box sx={{ width: "100%", mt: 1 }}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Please specify Other"
                        name="incidentInvolvedOtherDetail"
                        value={values.incidentInvolvedOtherDetail || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
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
                      value={values.date ? dayjs(values.date) : null}
                      onChange={(newValue) =>
                        setFieldValue("date", newValue ? newValue.format("YYYY-MM-DD") : "")
                      }
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.date && Boolean(errors.date),
                          helperText: touched.date && errors.date,
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
                  label="Location Of Incident"
                  name="location_of_incident"
                  value={values.location_of_incident || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.location_of_incident && Boolean(errors.location_of_incident)}
                  helperText={touched.location_of_incident && errors.location_of_incident}
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
                      value={values.date_of_discovery ? dayjs(values.date_of_discovery) : null}
                      onChange={(newValue) =>
                        setFieldValue("date_of_discovery", newValue ? newValue.format("YYYY-MM-DD") : "")
                      }
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          error: touched.date_of_discovery && Boolean(errors.date_of_discovery),
                          helperText: touched.date_of_discovery && errors.date_of_discovery,
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
                  name="location_of_discovery"
                  value={values.location_of_discovery || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.location_of_discovery && Boolean(errors.location_of_discovery)}
                  helperText={touched.location_of_discovery && errors.location_of_discovery}
                  sx={{ flex: 1 }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  label="Discovery By"
                  name="discovery_by"
                  value={values.discovery_by || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.discovery_by && Boolean(errors.discovery_by)}
                  helperText={touched.discovery_by && errors.discovery_by}
                  sx={{ flex: 1 }}
                />
              </Box>
              <Box sx={{ gridColumn: "span 4", mt: 2 }}>
                <FormGroup row>
                  <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                    Type Of Incident
                  </Box>
                  {["Fall", "Fire", "Security", "Elopement", "Death", "Resident Abase", "Treatment", "Loss of Property", "Choking", "Aggressive Behavior", "Other"].map((option) => (
                    <Box key={option} sx={{ width: "50%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.incidentType?.includes(option) || false}
                            onChange={() => {
                              const current = values.incidentType || [];
                              if (current.includes(option)) {
                                setFieldValue(
                                  "incidentType",
                                  current.filter((item) => item !== option)
                                );
                              } else {
                                setFieldValue("incidentType", [...current, option]);
                              }
                            }}
                            name="incidentType"
                          />
                        }
                        label={option}
                      />
                      {option === 'Other' && values.incidentType?.includes('Other') && (
                        <Box sx={{ ml: 2, }}>
                          <TextField
                            size="small"
                            variant="filled"
                            label="Please specify Other"
                            name="incidentTypeOtherDetail"
                            value={values.incidentTypeOtherDetail || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
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
                    { key: "fob_within_reach", label: "Fob was within reach" },
                    { key: "call_bell_within_reach", label: "Call bell within reach" },
                    { key: "caution_signs_in_place", label: "Caution signs in place" },
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
                  name="Safety_devices_other"
                  value={values.Safety_devices_other || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.Safety_devices_other && Boolean(errors.Safety_devices_other)}
                  helperText={touched.Safety_devices_other && errors.Safety_devices_other}
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
                              name="other_witness_name_1"
                              value={values.other_witness_name_1 || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              fullWidth
                              variant="filled"
                              label="Witness Position 1"
                              name="other_witness_position_1"
                              value={values.other_witness_position_1 || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              sx={{ flex: 1 }}
                            />
                          </Box>
                          <Box sx={{ width: "100%", mt: 2, display: 'flex', gap: 2 }}>
                            <TextField
                              fullWidth
                              variant="filled"
                              label="Witness Name 2"
                              name="other_witness_name_2"
                              value={values.other_witness_name_2 || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              fullWidth
                              variant="filled"
                              label="Witness Position 2"
                              name="other_witness_position_2"
                              value={values.other_witness_position_2 || ''}
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
                  {['Oriented', 'Disoriented', 'Sedated', 'Other (Specify)'].map((option) => (
                    <Box key={option} sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.conditionAtTime?.includes(option) || false}
                            onChange={() => {
                              const current = values.conditionAtTime || [];
                              if (current.includes(option)) {
                                setFieldValue(
                                  'conditionAtTime',
                                  current.filter((item) => item !== option)
                                );
                              } else {
                                setFieldValue('conditionAtTime', [...current, option]);
                              }
                            }}
                            name="conditionAtTime"
                          />
                        }
                        label={option}
                      />
                    </Box>
                  ))}
                  {values.conditionAtTime?.includes('Other (Specify)') && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Please specify Other Condition"
                        name="conditionOtherDetail"
                        value={values.conditionOtherDetail || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
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
                  {["Medication Change", "Caediac Medications", "Visual Deficit", "Mood Altering Medicatior", "Relocation", "Temporary Ilness"].map((option) => (
                    <Box key={option} sx={{ width: "50%" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.incidentGroups?.includes(option) || false}
                            onChange={() => {
                              const current = values.incidentGroups || [];
                              if (current.includes(option)) {
                                setFieldValue(
                                  "incidentGroups",
                                  current.filter((item) => item !== option)
                                );
                              } else {
                                setFieldValue("incidentGroups", [...current, option]);
                              }
                            }}
                            name="incidentGroups"
                          />
                        }
                        label={option}
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
                  {["Unlimited", "Limited", "Required assistance", "Wheelchair", "Walker", "Other (Specify)"].map((option) => (
                    <Box key={option} sx={{ width: "50%", display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.ambulation?.includes(option) || false}
                            onChange={() => {
                              const current = values.ambulation || [];
                              if (current.includes(option)) {
                                setFieldValue(
                                  "ambulation",
                                  current.filter((item) => item !== option)
                                );
                              } else {
                                setFieldValue("ambulation", [...current, option]);
                              }
                            }}
                            name="ambulation"
                          />
                        }
                        label={option}
                      />
                    </Box>
                  ))}
                  {values.ambulation?.includes('Other (Specify)') && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Please specify Other Ambulation"
                        name="ambulationOtherDetail"
                        value={values.ambulationOtherDetail || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
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