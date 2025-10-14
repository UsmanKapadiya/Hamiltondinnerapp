/**
 * Incident Form Utilities
 * Helper functions for processing incident form data
 */

import _ from 'lodash';
import dayjs from 'dayjs';
import { sanitizeInput } from './validation';

/**
 * Process incident involved data
 * @param {Object} values - Form values
 * @returns {Array} Processed array of incident involved parties
 */
export const processIncidentInvolved = (values) => {
  return _.compact([
    ..._.filter(values.incident_involved, val => val !== "Other"),
    ...(values.incident_involved?.includes("Other") && values.inc_invl_other_text 
      ? [values.inc_invl_other_text] 
      : [])
  ]);
};

/**
 * Process type of incident data
 * @param {Object} values - Form values
 * @returns {Array} Processed array of incident types
 */
export const processTypeOfIncident = (values) => {
  return _.compact([
    ..._.filter(values.type_of_incident, type => type !== "Other"),
    ...(values.type_of_incident?.includes("Other") && values.type_of_inc_other_text 
      ? [values.type_of_inc_other_text] 
      : [])
  ]);
};

/**
 * Process condition at incident data
 * @param {Object} values - Form values
 * @returns {Object} Object with array and string representation
 */
export const processConditionAtIncident = (values) => {
  const arr = _.compact([
    ..._.filter(values.condition_at_incident, item => item !== "Other (Specify)"),
    ...(values.condition_at_incident?.includes("Other (Specify)") && values.condition_at_inc_other_text 
      ? [values.condition_at_inc_other_text] 
      : [])
  ]);
  
  return {
    array: arr,
    string: arr.join(",")
  };
};

/**
 * Process ambulation data
 * @param {Object} values - Form values
 * @returns {Object} Object with array and string representation
 */
export const processAmbulation = (values) => {
  const arr = _.compact([
    ..._.filter(values.ambulation, item => item !== "Other (Specify)"),
    ...(values.ambulation?.includes("Other (Specify)") && values.ambulation_other_text 
      ? [values.ambulation_other_text] 
      : [])
  ]);
  
  return {
    array: arr,
    string: _.isEmpty(arr) ? "" : arr.join(",")
  };
};

/**
 * Process informed of incident data
 * @param {Object} values - Form values
 * @returns {Object} Object with array and string representation
 */
export const processInformedOfIncident = (values) => {
  const arr = _.compact([
    ..._.filter(values.informed_of_incident, label => label !== "Other"),
    ...(values.informed_of_incident?.includes("Other") && values.informed_of_inc_other_text 
      ? [values.informed_of_inc_other_text] 
      : [])
  ]);
  
  return {
    array: arr,
    string: arr.join(",")
  };
};

/**
 * Process date and time fields
 * @param {string} date - Date string
 * @param {string} time - Time string
 * @returns {Object|null} Dayjs object or null
 */
export const processDateTime = (date, time) => {
  if (date && time) {
    return dayjs(`${date} ${time}`, "YYYY-MM-DD hh:mm A");
  }
  return null;
};

/**
 * Format datetime for API
 * @param {Object} dateTime - Dayjs object
 * @param {string} format - Output format
 * @returns {string} Formatted date string or empty string
 */
export const formatDateTimeForAPI = (dateTime, format = "DD MMM YYYY hh:mm A") => {
  return dateTime ? dayjs(dateTime).format(format) : "";
};

/**
 * Convert options array to boolean flags object
 * @param {Array} options - Array of option objects with key and label
 * @param {Array} selectedValues - Array of selected values
 * @returns {Object} Object with boolean flags for each option
 */
export const optionsToBooleanFlags = (options, selectedValues = []) => {
  return _.reduce(options, (acc, option) => {
    acc[option.key] = selectedValues?.includes(option.label) ? 1 : 0;
    return acc;
  }, {});
};

/**
 * Build incident form payload
 * @param {Object} values - Form values from Formik
 * @param {Object} processedData - Processed data objects
 * @returns {Object} Complete payload object for API
 */
export const buildIncidentPayload = (values, processedData) => {
  const {
    incidentInvolved,
    typeOfIncident,
    conditionAtIncident,
    ambulation,
    informedOfIncident,
    incidentDateTime,
    discoveryDateTime,
    notifiedFamilyDoctorDateTime,
    notifiedResidentDateTime,
    notifiedOtherDateTime,
    completedDateTime
  } = processedData;

  return {
    // Incident Involved
    incident_involved: incidentInvolved.join(","),
    inc_invl_staff: values.incident_involved?.includes("Staff") ? 1 : 0,
    inc_invl_resident: values.incident_involved?.includes("Resident") ? 1 : 0,
    inc_invl_visitor: values.incident_involved?.includes("Visitor") ? 1 : 0,
    inc_invl_other: values.incident_involved?.includes("Other") ? 1 : 0,

    // Incident Date/Time
    incident_date: formatDateTimeForAPI(incidentDateTime),
    incident_dt: formatDateTimeForAPI(incidentDateTime, "DD MMM YYYY"),
    incident_tm: values.incident_tm || "",
    incident_location: sanitizeInput(values.incident_location || ""),
    witnessed_by: sanitizeInput(values.witnessed_by || ""),

    // Discovery Date/Time
    discovery_date: formatDateTimeForAPI(discoveryDateTime),
    discovery_dt: formatDateTimeForAPI(discoveryDateTime, "DD MMM YYYY"),
    discovery_tm: values.discovery_tm || "",
    discovery_location: sanitizeInput(values.discovery_location || ""),
    discovered_by: sanitizeInput(values.discovered_by || ""),

    // Type of Incident
    type_of_incident: typeOfIncident.join(","),
    ...(values.type_of_inc_other_text && {
      type_of_inc_other_text: sanitizeInput(values.type_of_inc_other_text)
    }),

    // Safety Devices
    ...(values.safety_fob && { safety_fob: values.safety_fob }),
    ...(values.safety_callbell && { safety_callbell: values.safety_callbell }),
    ...(values.safety_caution && { safety_caution: values.safety_caution }),
    ...(values.safety_other && { safety_other: sanitizeInput(values.safety_other) }),

    // Witnesses
    other_witnesses: values.other_witnesses || "",
    ...(values.other_witnesses === "Yes" && {
      ...(values.witness_name1 && { witness_name1: sanitizeInput(values.witness_name1) }),
      ...(values.witness_position1 && { witness_position1: sanitizeInput(values.witness_position1) }),
      ...(values.witness_name2 && { witness_name2: sanitizeInput(values.witness_name2) }),
      ...(values.witness_position2 && { witness_position2: sanitizeInput(values.witness_position2) }),
    }),

    // Condition at Incident
    condition_at_incident: conditionAtIncident.string,
    ...(values.condition_at_inc_other_text && {
      condition_at_inc_other_text: sanitizeInput(values.condition_at_inc_other_text)
    }),

    // Fall Assessment
    fall_assessment: (values.fall_assessment || []).join(","),

    // Ambulation
    ...(ambulation.string && { ambulation: ambulation.string }),
    ...(values.ambulation_other_text && {
      ambulation_other_text: sanitizeInput(values.ambulation_other_text)
    }),

    // Fire Options
    fire_alarm_pulled: values.fire_alarm_pulled || "No",
    fire_false_alarm: values.fire_false_alarm || "No",
    fire_extinguisher_used: values.fire_extinguisher_used || "No",
    fire_personal_injury: values.fire_personal_injury || "No",
    fire_property_damage: values.fire_property_damage || "No",

    // Description
    factual_description: sanitizeInput(values.factual_description || ""),

    // Informed of Incident
    informed_of_incident: informedOfIncident.string,
    ...(values.initial_assistant_gm && { initial_assistant_gm: sanitizeInput(values.initial_assistant_gm) }),
    ...(values.initial_gm && { initial_gm: sanitizeInput(values.initial_gm) }),
    ...(values.initial_risk_mng_committee && { initial_risk_mng_committee: sanitizeInput(values.initial_risk_mng_committee) }),
    ...(values.initial_other && { initial_other: sanitizeInput(values.initial_other) }),
    ...(values.informed_of_inc_other_text && {
      informed_of_inc_other_text: sanitizeInput(values.informed_of_inc_other_text)
    }),

    // Notifications
    ...(values.notified_family_doctor && {
      notified_family_doctor: sanitizeInput(values.notified_family_doctor),
      notified_family_doctor_date: formatDateTimeForAPI(notifiedFamilyDoctorDateTime),
      notified_family_doctor_dt: formatDateTimeForAPI(notifiedFamilyDoctorDateTime, "DD MMM YYYY"),
      notified_family_doctor_tm: values.notified_family_doctor_tm || "",
    }),

    ...(values.notified_other && {
      notified_other: sanitizeInput(values.notified_other),
      notified_other_date: formatDateTimeForAPI(notifiedOtherDateTime),
      notified_other_dt: formatDateTimeForAPI(notifiedOtherDateTime, "DD MMM YYYY"),
      notified_other_tm: values.notified_other_tm || "",
    }),

    notified_resident_responsible_party: values.notified_resident_responsible_party || "no",
    ...(values.notified_resident_responsible_party === "Yes" && {
      notified_resident_name: sanitizeInput(values.notified_resident_name || ""),
      notified_resident_date: formatDateTimeForAPI(notifiedResidentDateTime),
      notified_resident_dt: formatDateTimeForAPI(notifiedResidentDateTime, "DD MMM YYYY"),
      notified_resident_tm: values.notified_resident_tm || "",
    }),

    // Completed By
    completed_by: sanitizeInput(values.completed_by || ""),
    completed_position: sanitizeInput(values.completed_position || ""),
    completed_date: formatDateTimeForAPI(completedDateTime),
    completed_dt: formatDateTimeForAPI(completedDateTime, "DD MMM YYYY"),
    completed_tm: values.completed_tm || "",

    // Follow Up
    follow_up_assigned_to: values.follow_up_assigned_to || "",
    ...(values.show_follow_up_details && {
      followUp_issue: sanitizeInput(values.followUp_issue || ""),
      followUp_findings: sanitizeInput(values.followUp_findings || ""),
      followUp_possible_solutions: sanitizeInput(values.followUp_possible_solutions || ""),
      followUp_action_plan: sanitizeInput(values.followUp_action_plan || ""),
      followUp_examine_result: sanitizeInput(values.followUp_examine_result || ""),
    }),
  };
};

/**
 * Process all form data for submission
 * @param {Object} values - Form values from Formik
 * @returns {Object} Processed data ready for API submission
 */
export const processFormData = (values) => {
  return {
    incidentInvolved: processIncidentInvolved(values),
    typeOfIncident: processTypeOfIncident(values),
    conditionAtIncident: processConditionAtIncident(values),
    ambulation: processAmbulation(values),
    informedOfIncident: processInformedOfIncident(values),
    incidentDateTime: processDateTime(values.incident_date, values.incident_tm),
    discoveryDateTime: processDateTime(values.discovery_date, values.discovery_tm),
    notifiedFamilyDoctorDateTime: processDateTime(values.notified_family_doctor_date, values.notified_family_doctor_tm),
    notifiedResidentDateTime: processDateTime(values.notified_resident_date, values.notified_resident_tm),
    notifiedOtherDateTime: processDateTime(values.notified_other_date, values.notified_other_tm),
    completedDateTime: processDateTime(values.completed_date, values.completed_tm),
  };
};
