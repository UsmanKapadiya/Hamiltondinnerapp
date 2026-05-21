import * as yup from "yup";

// ==================== VALIDATION SCHEMA ====================
export const incidentFormValidationSchema = yup.object({
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
    is: (val) => !!val,
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
    is: 'Yes',
    then: (schema) => schema.required('Notified Resident Name is required'),
    otherwise: (schema) => schema,
  }),

  notified_resident_date: yup.string().when('notified_resident_responsible_party', {
    is: 'Yes',
    then: (schema) => schema.required('Notified Resident Date is required'),
    otherwise: (schema) => schema,
  }),
  notified_resident_tm: yup.string().when('notified_resident_responsible_party', {
    is: 'Yes',
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
