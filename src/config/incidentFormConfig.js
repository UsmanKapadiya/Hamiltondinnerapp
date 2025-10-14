/**
 * Incident Form Configuration
 * Contains all form option constants and configurations for the Incident Form
 */

/**
 * Incident involved party options
 */
export const incidentInvolvedData = [
  { key: "inc_invl_resident", label: "Resident" },
  { key: "inc_invl_staff", label: "Staff" },
  { key: "inc_invl_visitor", label: "Visitor" },
  { key: "inc_invl_other", label: "Other" }
];

/**
 * Type of incident classification options
 */
export const typeOfIncidentOptions = [
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

/**
 * Condition at time of incident options
 */
export const conditionAtTimeOptions = [
  { key: "condition_at_inc_oriented", label: "Oriented" },
  { key: "condition_at_inc_disOriented", label: "Disoriented" },
  { key: "condition_at_inc_sedated", label: "Sedated" },
  { key: "condition_at_inc_other", label: "Other (Specify)" }
];

/**
 * Fall assessment risk factors
 */
export const fallAssessmentOptions = [
  { key: "fall_assess_mediChange", label: "Medication Change" },
  { key: "fall_assess_cardMedi", label: "Cardiac Medications" },
  { key: "fall_assess_visDef", label: "Visual Deficit" },
  { key: "fall_assess_moodAltMedi", label: "Mood Altering Medication" },
  { key: "fall_assess_relocation", label: "Relocation" },
  { key: "fall_assess_tempIllness", label: "Temporary Illness" }
];

/**
 * Ambulation (mobility) status options
 */
export const ambulationOptions = [
  { key: "ambulation_unlimited", label: "Unlimited" },
  { key: "ambulation_limited", label: "Limited" },
  { key: "ambulation_reqAssist", label: "Required assistance" },
  { key: "ambulation_wheelChair", label: "Wheelchair" },
  { key: "ambulation_walker", label: "Walker" },
  { key: "ambulation_other", label: "Other (Specify)" }
];

/**
 * Fire incident specific options
 */
export const fireOptions = [
  { key: "fire_alarm_pulled", label: "Alarm pulled" },
  { key: "fire_false_alarm", label: "False alarm" },
  { key: "fire_extinguisher_used", label: "Extinguisher used" },
  { key: "fire_personal_injury", label: "Personal injury" },
  { key: "fire_property_damage", label: "Resident or facility property damage" },
];

/**
 * Notification recipient options for incident reporting
 */
export const InformedOfIncident = [
  { key: "informed_of_inc_AGM", label: "Assistant General Manager" },
  { key: "informed_of_inc_GM", label: "General Manager" },
  { key: "informed_of_inc_RMC", label: "Risk Management Committee" },
  { key: "informed_of_inc_other", label: "Other" },
];

/**
 * Yes/No options for responsible party notification
 */
export const notifiedResponsiblePartyOptions = [
  { key: "Yes", label: "Yes" },
  { key: "No", label: "No" }
];

/**
 * Safety device options for incident prevention assessment
 */
export const safetyDeviceOptions = [
  { key: "safety_fob", label: "Fob was within reach" },
  { key: "safety_callbell", label: "Call bell within reach" },
  { key: "safety_caution", label: "Caution signs in place" },
];

/**
 * Radio button options for Yes/No/N/A questions
 */
export const yesNoNAOptions = ["Yes", "No", "N/A"];

/**
 * Radio button options for Yes/No questions
 */
export const yesNoOptions = ["Yes", "No"];
