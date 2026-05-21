import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import _ from "lodash";
import {
  incidentInvolvedData,
  typeOfIncidentOptions,
  conditionAtTimeOptions,
  ambulationOptions,
  InformedOfIncident,
} from "../../../config/incidentFormConfig";
import { mapOptions, getDefaultFollowUpUser } from "../utils/incidentFormHelpers";
import dayjs from "dayjs";

/**
 * Hook for mapping API response strings to form field arrays
 */
export const useIncidentFormMappers = () => {
  const mapIncidentInvolved = useCallback((rawString) =>
    mapOptions(rawString, incidentInvolvedData, "Other", "inc_invl_other_text", "incident_involved"),
    []
  );

  const mapTypeOfIncident = useCallback((rawString) =>
    mapOptions(rawString, typeOfIncidentOptions, "Other", "type_of_inc_other_text", "type_of_incident"),
    []
  );

  const mapConditionAtIncident = useCallback((rawString) =>
    mapOptions(rawString, conditionAtTimeOptions, "Other (Specify)", "condition_at_inc_other_text", "condition_at_incident"),
    []
  );

  const mapAmbulation = useCallback((rawString) =>
    mapOptions(rawString, ambulationOptions, "Other (Specify)", "ambulation_other_text", "ambulation"),
    []
  );

  const mapInformedOfIncident = useCallback((rawString) =>
    mapOptions(rawString, InformedOfIncident, "Other", "informed_of_inc_other_text", "informed_of_incident"),
    []
  );

  return {
    mapIncidentInvolved,
    mapTypeOfIncident,
    mapConditionAtIncident,
    mapAmbulation,
    mapInformedOfIncident,
  };
};

/**
 * Hook for managing follow-up edit permissions
 */
export const useFollowUpPermissions = (userData, formData) => {
  const canEditFollowUp = useMemo(() => 
    _.includes(["admin", "superadmin"], userData?.role),
    [userData?.role]
  );
  
  const canUpdateFollowUp = useMemo(() => 
    canEditFollowUp || userData?.user_id === formData?.follow_up_user?.id,
    [canEditFollowUp, userData?.user_id, formData?.follow_up_user?.id]
  );

  return {
    canEditFollowUp,
    canUpdateFollowUp,
  };
};

/**
 * Hook for scroll to follow-up section
 */
export const useScrollToFollowUp = (shouldScroll, followUpRef) => {
  useEffect(() => {
    if (shouldScroll && followUpRef.current) {
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
  }, [shouldScroll]);
};

/**
 * Hook for managing dialog confirmations for follow-up submission
 */
export const useFollowUpConfirmation = () => {
  const [showFollowUpConfirm, setShowFollowUpConfirm] = useState(false);
  const [pendingSubmitValues, setPendingSubmitValues] = useState(null);
  const [pendingSubmitActions, setPendingSubmitActions] = useState(null);

  const handleOpenConfirm = (values, actions) => {
    setPendingSubmitValues(values);
    setPendingSubmitActions(actions);
    setShowFollowUpConfirm(true);
  };

  const handleCloseConfirm = () => {
    setShowFollowUpConfirm(false);
    setPendingSubmitValues(null);
    setPendingSubmitActions(null);
  };

  return {
    showFollowUpConfirm,
    pendingSubmitValues,
    pendingSubmitActions,
    setShowFollowUpConfirm,
    handleOpenConfirm,
    handleCloseConfirm,
  };
};

/**
 * Hook for managing PDF modal state
 */
export const usePdfModal = () => {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [isFollowUpIncomplete, setIsFollowUpIncomplete] = useState(false);

  return {
    pdfModalOpen,
    setPdfModalOpen,
    pdfUrl,
    setPdfUrl,
    selectedFormId,
    setSelectedFormId,
    isFollowUpIncomplete,
    setIsFollowUpIncomplete,
  };
};
