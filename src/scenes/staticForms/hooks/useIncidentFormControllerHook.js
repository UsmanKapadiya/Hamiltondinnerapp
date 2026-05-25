import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { getUserData } from "../../../utils/userHelpers";
import StaticFormServices from "../../../services/staticFormServices";
import { incidentFormValidationSchema } from "../../../utils/validation";
import {
  useIncidentFormMappers,
  useFollowUpPermissions,
  useFollowUpConfirmation,
  usePdfModal,
  useScrollToFollowUp,
} from "./useIncidentFormHooks";
import { useIncidentForm } from "./useIncidentForm";

/**
 * Main controller hook for Incident Form
 * Manages all business logic, state, and handlers
 */
export const useIncidentFormControllerHook = () => {
  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  const followUpRef = useRef(null);
  
  // User data
  const userData = useMemo(() => getUserData(), []);

  // State management
  const [incidentFormDetails, setIncidentFormDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [formId, setFormId] = useState();
  const [canEditFollowUpFields, setCanEditFollowUpFields] = useState(false);

  // Custom hooks
  const {
    mapIncidentInvolved,
    mapTypeOfIncident,
    mapConditionAtIncident,
    mapAmbulation,
    mapInformedOfIncident,
  } = useIncidentFormMappers();

  const { canEditFollowUp, canUpdateFollowUp } = useFollowUpPermissions(
    userData,
    location?.state?.formData,
  );

  const {
    showFollowUpConfirm,
    pendingSubmitValues,
    pendingSubmitActions,
    setShowFollowUpConfirm,
    handleOpenConfirm,
    handleCloseConfirm,
  } = useFollowUpConfirmation();

  const {
    pdfModalOpen,
    setPdfModalOpen,
    pdfUrl,
    setPdfUrl,
    selectedFormId,
    setSelectedFormId,
    isFollowUpIncomplete,
    setIsFollowUpIncomplete,
  } = usePdfModal();

  const {
    submitIncidentForm: hookSubmitIncidentForm,
    handleAttachmentUpload: hookHandleAttachmentUpload,
    handleSendMail: hookHandleSendMail,
  } = useIncidentForm(
    userData,
    incidentFormDetails,
    formId,
    setLoading,
    setIncidentFormDetails,
    navigate,
    setSelectedFormId,
    setIsFollowUpIncomplete,
    setPdfUrl,
    setPdfModalOpen,
  );

  useScrollToFollowUp(location.state?.scrollToFollowUp, followUpRef);

  // Helper function to get default follow-up user
  const getDefaultFollowUpUser = useCallback(() => {
    if (!userData?.user_list || !Array.isArray(userData.user_list)) {
      return "";
    }

    const adminUser = userData.user_list.find(
      (user) =>
        user.role === "admin" ||
        user.role === "superadmin" ||
        user.name?.toLowerCase() === "admin",
    );

    if (adminUser) {
      return adminUser.id;
    }

    return userData.user_list.length > 0 ? userData.user_list[0].id : "";
  }, [userData]);

  // Initialize form data from location state
  useEffect(() => {
    setLoading(true);
    if (location.state?.formData?.ResponseCode === "1") {
      const data = location.state.formData.form_data || {};
      setFormId(location.state?.id);
      
      const followUpFilled = [
        "followUp_issue",
        "followUp_findings",
        "followUp_possible_solutions",
        "followUp_action_plan",
        "followUp_examine_result",
      ].some((key) => !!data[key]);

      const transformedData = {
        ...data,
        incident_date: data.incident_dt
          ? dayjs(data.incident_dt, "DD MMM YYYY").format("YYYY-MM-DD")
          : data.incident_date || "",
        discovery_date: data.discovery_dt
          ? dayjs(data.discovery_dt, "DD MMM YYYY").format("YYYY-MM-DD")
          : data.discovery_date || "",
        notified_family_doctor_date: data.notified_family_doctor_dt
          ? dayjs(data.notified_family_doctor_dt, "DD MMM YYYY").format("YYYY-MM-DD")
          : data.notified_family_doctor_date || "",
        notified_other_date: data.notified_other_dt
          ? dayjs(data.notified_other_dt, "DD MMM YYYY").format("YYYY-MM-DD")
          : data.notified_other_date || "",
        notified_resident_date: data.notified_resident_dt
          ? dayjs(data.notified_resident_dt, "DD MMM YYYY").format("YYYY-MM-DD")
          : data.notified_resident_date || "",
        completed_date: data.completed_dt
          ? dayjs(data.completed_dt, "DD MMM YYYY").format("YYYY-MM-DD")
          : data.completed_date || "",
      };

      setIncidentFormDetails({
        ...transformedData,
        ...mapIncidentInvolved(data.incident_involved),
        ...mapTypeOfIncident(data.type_of_incident),
        ...mapConditionAtIncident(data.condition_at_incident),
        ...mapAmbulation(data.ambulation),
        ...mapInformedOfIncident(data.informed_of_incident),
        fall_assessment: data.fall_assessment
          ? data.fall_assessment.split(",")
          : [],
        follow_up_assigned_to:
          data.follow_up_assigned_to || getDefaultFollowUpUser(),
        show_follow_up_details: formId
          ? true
          : followUpFilled ||
            incidentFormDetails?.show_follow_up_details ||
            false,
        attachments: location.state.formData.attachments || [],
      });
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        setIncidentFormDetails({
          ...location.state,
          follow_up_assigned_to: getDefaultFollowUpUser(),
        });
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [location.state, getDefaultFollowUpUser, mapIncidentInvolved, mapTypeOfIncident, mapConditionAtIncident, mapAmbulation, mapInformedOfIncident]);

  // Initial values for Formik
  const initialValues = useMemo(
    () => ({
      id: formId || "",
      formTypes: incidentFormDetails?.formTypes || "",
      incident_involved: incidentFormDetails?.incident_involved || [],
      inc_invl_other_text: incidentFormDetails?.inc_invl_other_text || "",
      incident_date: incidentFormDetails?.incident_date || "",
      incident_dt: incidentFormDetails?.incident_dt || "",
      incident_tm: incidentFormDetails?.incident_tm || "",
      incident_location: incidentFormDetails?.incident_location || "",
      witnessed_by: incidentFormDetails?.witnessed_by || "",
      discovery_date: incidentFormDetails?.discovery_date || "",
      discovery_dt: incidentFormDetails?.discovery_dt || "",
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
      condition_at_inc_other_text:
        incidentFormDetails?.condition_at_inc_other_text || "",
      fall_assessment: incidentFormDetails?.fall_assessment || [],
      ambulation: incidentFormDetails?.ambulation || [],
      ambulation_other_text: incidentFormDetails?.ambulation_other_text || "",
      fire_alarm_pulled: incidentFormDetails?.fire_alarm_pulled ?? "No",
      fire_false_alarm: incidentFormDetails?.fire_false_alarm ?? "No",
      fire_extinguisher_used:
        incidentFormDetails?.fire_extinguisher_used ?? "No",
      fire_personal_injury: incidentFormDetails?.fire_personal_injury ?? "No",
      fire_property_damage: incidentFormDetails?.fire_property_damage ?? "No",
      factual_description: incidentFormDetails?.factual_description || "",
      informed_of_incident: incidentFormDetails?.informed_of_incident || [],
      initial_assistant_gm: incidentFormDetails?.initial_assistant_gm || "",
      initial_gm: incidentFormDetails?.initial_gm || "",
      initial_risk_mng_committee:
        incidentFormDetails?.initial_risk_mng_committee || "",
      initial_other: incidentFormDetails?.initial_other || "",
      informed_of_inc_other_text:
        incidentFormDetails?.informed_of_inc_other_text,
      notified_family_doctor: incidentFormDetails?.notified_family_doctor || "",
      notified_family_doctor_date:
        incidentFormDetails?.notified_family_doctor_date || "",
      notified_family_doctor_dt:
        incidentFormDetails?.notified_family_doctor_dt || "",
      notified_family_doctor_tm:
        incidentFormDetails?.notified_family_doctor_tm || "",
      notified_other: incidentFormDetails?.notified_other || "",
      notified_other_date: incidentFormDetails?.notified_other_date || "",
      notified_other_dt: incidentFormDetails?.notified_other_dt || "",
      notified_other_tm: incidentFormDetails?.notified_other_tm || "",
      notified_resident_responsible_party:
        incidentFormDetails?.notified_resident_responsible_party || "no",
      notified_resident_name: incidentFormDetails?.notified_resident_name || "",
      notified_resident_date: incidentFormDetails?.notified_resident_date || "",
      notified_resident_dt: incidentFormDetails?.notified_resident_dt || "",
      notified_resident_tm: incidentFormDetails?.notified_resident_tm || "",
      completed_by: incidentFormDetails?.completed_by || "",
      completed_position: incidentFormDetails?.completed_position || "",
      completed_date: incidentFormDetails?.completed_date || "",
      completed_dt: incidentFormDetails?.completed_dt || "",
      completed_tm: incidentFormDetails?.completed_tm || "",
      follow_up_assigned_to:
        incidentFormDetails?.follow_up_assigned_to || getDefaultFollowUpUser(),
      followUp_issue: incidentFormDetails?.followUp_issue || "",
      followUp_findings: incidentFormDetails?.followUp_findings || "",
      followUp_possible_solutions:
        incidentFormDetails?.followUp_possible_solutions || "",
      followUp_action_plan: incidentFormDetails?.followUp_action_plan || "",
      followUp_examine_result:
        incidentFormDetails?.followUp_examine_result || "",
      attachments: incidentFormDetails?.attachments || [],
      show_follow_up_details: formId
        ? true
        : incidentFormDetails?.show_follow_up_details || false,
    }),
    [incidentFormDetails, formId, getDefaultFollowUpUser],
  );

  // Form submit handler
  const handleFormSubmit = useCallback(
    async (values, actions) => {
      const isFollowUpIncomplete =
        values.show_follow_up_details &&
        (!values.followUp_issue ||
          !values.followUp_findings ||
          !values.followUp_possible_solutions ||
          !values.followUp_action_plan ||
          !values.followUp_examine_result);

      const userRole = userData?.role;
      const isConciergeOrNurse =
        userRole === "concierge" || userRole === "nurse";
      const isFollowUpHidden = !values.show_follow_up_details;

      if (!isConciergeOrNurse && !isFollowUpHidden && isFollowUpIncomplete) {
        handleOpenConfirm(values, actions);
        return;
      }

      await hookSubmitIncidentForm(values, actions);
    },
    [userData, hookSubmitIncidentForm, handleOpenConfirm],
  );

  // Confirm submit handler for incomplete follow-up
  const handleConfirmSubmit = useCallback(async () => {
    handleCloseConfirm();
    setLoading(true);
    if (pendingSubmitValues && pendingSubmitActions) {
      await hookSubmitIncidentForm(pendingSubmitValues, pendingSubmitActions);
    }
  }, [pendingSubmitValues, pendingSubmitActions, hookSubmitIncidentForm, handleCloseConfirm]);

  // Handle follow-up click from PDF modal
  const handleFollowUpClick = useCallback(() => {
    setPdfModalOpen(false);
    if (selectedFormId && followUpRef.current) {
      setTimeout(() => {
        followUpRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [selectedFormId, setPdfModalOpen]);

  // Handle attachment upload
  const handleAttachmentUpload = useCallback(async (files) => {
    if (formId) {
      await hookHandleAttachmentUpload(files, formId, setIncidentFormDetails);
    }
  }, [formId, hookHandleAttachmentUpload]);

  // Handle attachment delete
  const handleAttachmentDelete = useCallback(async (fileId, index, values, setFieldValue) => {
    if (formId && fileId) {
      setLoading(true);
      try {
        const response = await StaticFormServices.deleteFormAttachment({
          form_id: formId,
          attachment_id: fileId,
        });
        if (response?.ResponseCode === "1") {
          toast.success("Attachment deleted successfully.");
          const newArr = values.attachments.filter((_, i) => i !== index);
          setFieldValue("attachments", newArr);
        } else {
          toast.error(
            response?.ResponseText || "Failed to delete attachment."
          );
        }
      } catch (error) {
        console.error("Error deleting attachment:", error);
        toast.error("Failed to delete attachment.");
      } finally {
        setLoading(false);
      }
    } else {
      const newArr = values.attachments.filter((_, i) => i !== index);
      setFieldValue("attachments", newArr);
    }
  }, [formId]);

  // Handle follow-up assigned user change
  const handleFollowUpAssignChange = useCallback((selectedId, setFieldValue) => {
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
  }, [userData]);

  // Handle PDF modal close
  const handlePdfModalClose = useCallback(() => {
    setPdfModalOpen(false);
  }, [setPdfModalOpen]);

  // Handle PDF modal close complete (navigate away)
  const handlePdfModalCloseComplete = useCallback(() => {
    setPdfModalOpen(false);
    navigate("/staticForms");
  }, [setPdfModalOpen, navigate]);

  // Get print/mail button visibility
  const showPrintButton = useMemo(
    () => userData?.form_types?.find((f) => f.id === 1)?.allow_print === 1,
    [userData]
  );

  const showMailButton = useMemo(
    () => userData?.form_types?.find((f) => f.id === 1)?.allow_mail === 1,
    [userData]
  );

  return {
    // Refs
    followUpRef,
    
    // State
    loading,
    formId,
    canEditFollowUpFields,
    incidentFormDetails,
    
    // Formik
    initialValues,
    validationSchema: incidentFormValidationSchema,
    
    // Handlers
    handleFormSubmit,
    handleConfirmSubmit,
    handleFollowUpClick,
    handleAttachmentUpload,
    handleAttachmentDelete,
    handleFollowUpAssignChange,
    handlePdfModalClose,
    handlePdfModalCloseComplete,
    handleSendMail: hookHandleSendMail,
    
    // Permissions
    canEditFollowUp,
    canUpdateFollowUp,
    
    // Modal state
    showFollowUpConfirm,
    setShowFollowUpConfirm,
    pdfModalOpen,
    pdfUrl,
    isFollowUpIncomplete,
    showPrintButton,
    showMailButton,
    
    // User data
    userData,
  };
};
