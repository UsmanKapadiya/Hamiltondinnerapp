import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";
import dayjs from "dayjs";
import StaticFormServices from "../../../services/staticFormServices";
import { typeOfIncidentOptions, conditionAtTimeOptions, fallAssessmentOptions, ambulationOptions, InformedOfIncident } from "../../../config/incidentFormConfig";
import {
  processIncidentInvolved,
  processDateTime,
  formatDateTimeOutput,
  getFormattedDateTime,
  getDefaultFollowUpUser,
  getRoomIdByNumber,
} from "../utils/incidentFormHelpers";

/**
 * Main hook for incident form logic and submission
 */
export const useIncidentForm = (userData, incidentFormDetails, formId, setLoading, setIncidentFormDetails, navigate, setSelectedFormId, setIsFollowUpIncomplete, setPdfUrl, setPdfModalOpen) => {
  const location = useLocation();

  /**
   * Submit incident form data to API
   */
  const submitIncidentForm = useCallback(async (values, actions) => {
    setLoading(true);
    
    try {
      // Process Incident Involved
      const incidentInvolvedArr = _.compact([
        ..._.filter(values.incident_involved, val => val !== "Other"),
        ...(values.incident_involved?.includes("Other") && values.inc_invl_other_text 
          ? [values.inc_invl_other_text] 
          : [])
      ]);

      // Process Type of Incident
      const typeOfIncidentArr = _.compact([
        ..._.filter(values.type_of_incident, type => type !== "Other"),
        ...(values.type_of_incident?.includes("Other") && values.type_of_inc_other_text 
          ? [values.type_of_inc_other_text] 
          : [])
      ]);

      // Process Condition at Incident
      const conditionAtIncidentArr = _.compact([
        ..._.filter(values.condition_at_incident, item => item !== "Other (Specify)"),
        ...(values.condition_at_incident?.includes("Other (Specify)") && values.condition_at_inc_other_text 
          ? [values.condition_at_inc_other_text] 
          : [])
      ]);
      const conditionAtIncidentStr = conditionAtIncidentArr.join(",");

      // Process Ambulation
      const ambulationArr = _.compact([
        ..._.filter(values.ambulation, item => item !== "Other (Specify)"),
        ...(values.ambulation?.includes("Other (Specify)") && values.ambulation_other_text 
          ? [values.ambulation_other_text] 
          : [])
      ]);
      const ambulationStr = _.isEmpty(ambulationArr) ? "" : ambulationArr.join(",");

      // Process Informed of Incident
      const informedOfIncidentArr = _.compact([
        ..._.filter(values.informed_of_incident, label => label !== "Other"),
        ...(values.informed_of_incident?.includes("Other") && values.informed_of_inc_other_text 
          ? [values.informed_of_inc_other_text] 
          : [])
      ]);

      // Process Date/Time fields
      const incidentDateTime = processDateTime(values.incident_date, values.incident_tm);
      const discoveryDateTime = processDateTime(values.discovery_date, values.discovery_tm);
      const notifiedFamilyDoctorDateTime = processDateTime(values.notified_family_doctor_date, values.notified_family_doctor_tm);
      const notifiedResidentDateTime = processDateTime(values.notified_resident_date, values.notified_resident_tm);
      const completedDateTime = processDateTime(values.completed_date, values.completed_tm);
      const notifiedOtherDateTime = processDateTime(values.notified_other_date, values.notified_other_tm);

      // Build payload
      const payload = {
        incident_involved: incidentInvolvedArr.join(","),
        inc_invl_staff: values.incident_involved?.includes("Staff") ? 1 : 0,
        inc_invl_resident: values.incident_involved?.includes("Resident") ? 1 : 0,
        inc_invl_visitor: values.incident_involved?.includes("Visitor") ? 1 : 0,
        inc_invl_other: values.incident_involved?.includes("Other") ? 1 : 0,
        incident_date: incidentDateTime ? dayjs(incidentDateTime).format("DD MMM YYYY hh:mm A") : "",
        incident_dt: incidentDateTime ? dayjs(incidentDateTime).format("DD MMM YYYY") : "",
        incident_tm: values.incident_tm || "",
        incident_location: values.incident_location || "",
        witnessed_by: values.witnessed_by || "",
        discovery_date: discoveryDateTime ? dayjs(discoveryDateTime).format("DD MMM YYYY hh:mm A") : "",
        discovery_dt: discoveryDateTime ? dayjs(discoveryDateTime).format("DD MMM YYYY") : "",
        discovery_tm: values.discovery_tm || "",
        discovery_location: values.discovery_location || "",
        discovered_by: values.discovered_by || "",

        type_of_incident: typeOfIncidentArr.join(","),
        ...typeOfIncidentOptions.reduce((acc, option) => {
          acc[option.key] = values.type_of_incident?.includes(option.label) ? 1 : 0;
          return acc;
        }, {}),
        ...(values.type_of_inc_other_text ? { type_of_inc_other_text: values.type_of_inc_other_text } : {}),

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

        fall_assessment: (values.fall_assessment || []).join(","),
        ...fallAssessmentOptions.reduce((acc, option) => {
          acc[option.key] = values.fall_assessment?.includes(option.label) ? 1 : 0;
          return acc;
        }, {}),

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
        notified_family_doctor_date: notifiedFamilyDoctorDateTime ? dayjs(notifiedFamilyDoctorDateTime).format("DD MMM YYYY hh:mm A") : "",
        notified_family_doctor_dt: notifiedFamilyDoctorDateTime ? dayjs(notifiedFamilyDoctorDateTime).format("DD MMM YYYY") : "",
        notified_family_doctor_tm: values.notified_family_doctor_tm || "",

        notified_other: values.notified_other || "",
        notified_other_date: notifiedOtherDateTime ? dayjs(notifiedOtherDateTime).format("DD MMM YYYY hh:mm A") : "",
        notified_other_dt: notifiedOtherDateTime ? dayjs(notifiedOtherDateTime).format("DD MMM YYYY") : "",
        notified_other_tm: values.notified_other_tm || "",

        notified_resident_responsible_party: values.notified_resident_responsible_party || "",
        notified_resident_name: values.notified_resident_name || "",
        notified_resident_date: notifiedResidentDateTime ? dayjs(notifiedResidentDateTime).format("DD MMM YYYY hh:mm A") : "",
        notified_resident_dt: notifiedResidentDateTime ? dayjs(notifiedResidentDateTime).format("DD MMM YYYY") : "",
        notified_resident_tm: values.notified_resident_tm || "",

        // Completed
        completed_by: values.completed_by || "",
        completed_position: values.completed_position || "",
        completed_date: completedDateTime ? dayjs(completedDateTime).format("DD MMM YYYY hh:mm A") : "",
        completed_dt: completedDateTime ? dayjs(completedDateTime).format("DD MMM YYYY") : "",
        completed_tm: values.completed_tm || "",

        follow_up_assigned_to: values.follow_up_assigned_to || "",
        followUp_issue: values.followUp_issue || "",
        followUp_findings: values?.followUp_findings || '',
        followUp_possible_solutions: values?.followUp_possible_solutions || '',
        followUp_action_plan: values?.followUp_action_plan || '',
        followUp_examine_result: values?.followUp_examine_result || '',
      };

      // Create FormData
      const now = new Date();
      const pad = n => n.toString().padStart(2, '0');
      const logged_at = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const rawStringData = { ...payload };
      rawStringData['is_completed'] = incidentFormDetails?.is_completed ? incidentFormDetails?.is_completed : 0;
      rawStringData['logged_at'] = incidentFormDetails?.logged_at ? incidentFormDetails?.logged_at : logged_at;

      const found = userData.rooms.find(r =>
        String(r.name).toLowerCase() === String(values?.room_number).toLowerCase()
      );

      const formData = new FormData();
      formData.append('form_type', 1);
      if (values.id) {
        formData.append('form_id', values.id);
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
            formData.append(`file${fileIndex}`, file, file.name);
            fileIndex++;
          } else if (file.id) {
            formData.append(`existing_attachments[]`, file.id);
          } else if (typeof file === 'string' && file.startsWith('data:')) {
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

      // Submit form
      if (values.id) {
        const response = await StaticFormServices.logFormUpdate(formData);
        if (response?.ResponseCode === "1") {
          toast.success("Form Updated successfully.");
          return response;
        }
      } else {
        const response = await StaticFormServices.logFormSubmit(formData);
        if (response?.ResponseCode === "1") {
          toast.success(response?.ResponseText || "Form submitted successfully.");
          return response;
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("Form is not submitted. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userData, incidentFormDetails]);

  /**
   * Handle attachment upload
   */
  const handleAttachmentUpload = useCallback(async (files, formId, setIncidentFormDetails) => {
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
    }
  }, []);

  /**
   * Handle send mail
   */
  const handleSendMail = useCallback(async (emailTo, formId) => {
    if (!emailTo) {
      toast.error("Email is required.");
      return;
    }

    try {
      const payload = { to_id: emailTo, form_id: formId };
      const response = await StaticFormServices.sendMail(payload);
      if (response?.ResponseCode === "1") {
        toast.success(`Email sent to ${emailTo}`);
      } else if (response?.Message) {
        toast.error(response.Message);
      }
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
    }
  }, []);

  return {
    submitIncidentForm,
    handleAttachmentUpload,
    handleSendMail,
  };
};
