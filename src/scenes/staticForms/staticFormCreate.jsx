import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  MenuItem,
  Switch,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio
} from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { Home } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import { toast } from "react-toastify";
import StaticRoomServices from "../../services/staticFormServices";
import StaticFormServices from "../../services/staticFormServices";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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

const StaticFormCreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [roomDetails, setRoomDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setRoomDetails(location.state || {});
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [location.state]);

  const initialValues = useMemo(
    () => ({
      id: roomDetails?.id || "",
      formTypes: roomDetails?.formTypes || "",
      incidentGroups: roomDetails?.incidentGroups || [],
      date: roomDetails?.date || "",
      location_of_incident: roomDetails?.location_of_incident || "",
      witnessed_by: roomDetails?.witnessed_by || "",
      date_of_discovery: roomDetails?.date_of_discovery || "",
      location_of_discovery: roomDetails?.location_of_discovery || "",
      discovery_by: roomDetails?.discovery_by || "",
      // Safety Devices
      fob_within_reach: roomDetails?.fob_within_reach || "",
      call_bell_within_reach: roomDetails?.call_bell_within_reach || "",
      caution_signs_in_place: roomDetails?.caution_signs_in_place || "",
      Safety_devices_other: roomDetails?.Safety_devices_other || "",
      // Other Witnesses
      other_witnesses: roomDetails?.other_witnesses || "",
      // Fire Section
      alarm_pulled: roomDetails?.alarm_pulled || "",
      false_alarm: roomDetails?.false_alarm || "",
      extinguisher_used: roomDetails?.extinguisher_used || "",
      personal_injury: roomDetails?.personal_injury || "",
      property_damage: roomDetails?.property_damage || "",
      // Incident Description
      incident_description: roomDetails?.incident_description || "",
      informed_assistant_manager: false,
      informed_assistant_manager_details: "",
      informed_general_manager: false,
      informed_general_manager_details: "",
      informed_risk_committee: false,
      informed_risk_committee_details: "",
      informed_other: false,
      informed_other_details: "",
    }),
    [roomDetails]
  );


  const handleFormSubmit = useCallback(
    async (values, actions) => {
      setLoading(true);
      const payload = {
        ...values,
        is_active: values.is_active ? 1 : 0,
      };
      try {
        if (payload.id) {
          await StaticFormServices.updateRoomDetails(payload.id, payload);
          toast.success("Room updated successfully!");
        } else {
          await StaticFormServices.createRoomDetails(payload);
          toast.success("Room created successfully!");
          actions.resetForm({ values: initialValues });
        }
        // After save, navigate to the room list to show latest data
        navigate("/room-details");
      } catch (error) {
        toast.error("Failed to process room. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [initialValues, navigate]
  );
  return (
    <Box m="20px">
      <Header
      title={"INCIDENT FORM"}
        // title={
        //   loading
        //     ? ""
        //     : roomDetails?.id
        //       ? "Update Room Detail"
        //       : "Add Room Detail"
        // }
        // icon={<Home />}
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
                <Box component="label" sx={{ mb: 1, fontWeight: 600, width: "100%" }}>
                  Date/Time of Incident
                </Box>
                <Box sx={{ width: "100%" }}>
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
                    Condition At Time of Incident
                  </Box>
                  {["Oriented", "Disoriented", "Sedated", "Other (Specify)"].map((option) => (
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
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) => {
                        const file = event.currentTarget.files[0];
                        setFieldValue("attachment", file);
                      }}
                    />
                  </Button>
                  {values.attachment && (
                    <Box sx={{ mt: 1 }}>
                      <strong>Selected file:</strong> {values.attachment.name}
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
                  ].map((item) => (
                 <Box
  key={item.key}
  sx={{
    display: "flex",
    alignItems: "center",
    width: "100%",
    mb: 1,
    justifyContent: "space-between", // Add this for right alignment
  }}
>
  <Checkbox
    checked={!!values[item.key]}
    onChange={(e) => setFieldValue(item.key, e.target.checked ? true : false)}
    name={item.key}
  />
  <Box sx={{ minWidth: 170, mr: 2 }}>{item.label}</Box>
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
                  ))}
                </FormGroup>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="end"
                mt="20px"
              >
                <Button type="submit" color="secondary" variant="contained">
                  Save Room Details
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      )}
    </Box>
  );
};

export default StaticFormCreate; 