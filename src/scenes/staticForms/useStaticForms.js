import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StaticFormServices from "../../services/staticFormServices";

const useStaticForms = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formist, setFormList] = useState([]);

  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const [pdfUrl, setPdfUrl] = useState("");

  const [selectedFormType, setSelectedFormType] = useState("all");

  const [markDialogOpen, setMarkDialogOpen] = useState(false);

  const [markReason, setMarkReason] = useState("");

  const [markRowId, setMarkRowId] = useState(null);

  const [selectedMailFormId, setSelectedMailFormId] = useState("");

  const [completedNames, setCompletedNames] = useState(() => {
    const stored = localStorage.getItem("completedNames");

    return stored ? JSON.parse(stored) : [];
  });

  const [userData] = useState(() => {
    const userDatas = localStorage.getItem("userData");

    return userDatas ? JSON.parse(userDatas) : null;
  });

  // ============================================
  // ADD NEW
  // ============================================

  const handleAddNewClick = useCallback(
    (formType) => {
      let route = "incidentForm-create";

      if (formType === "incidentForm") {
        route = "incidentForm-create";
      } else if (formType === "Log Form") {
        route = "logForm-create";
      } else if (formType === "MoveIn Summary Form") {
        route = "moveInSummaryForm-create";
      }

      navigate(route);
    },
    [navigate],
  );

  // ============================================
  // FETCH LIST
  // ============================================

  const fetchFormList = useCallback(async (formType = "all") => {
    setLoading(true);

    try {
      const payload = {
        form_type: formType === "all" ? 0 : formType,
      };

      const response = await StaticFormServices.getFormList(payload);

      setFormList(response?.list || []);
    } catch (error) {
      toast.error("Failed to fetch forms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormList(selectedFormType);
  }, [fetchFormList, selectedFormType]);

  // ============================================
  // DELETE
  // ============================================

  const handleDelete = async (id) => {
    if (!id) return;

    setLoading(true);

    try {
      await StaticFormServices.deleteForm({
        form_id: id,
      });

      toast.success("Form deleted successfully.");

      fetchFormList(selectedFormType);
    } catch (error) {
      toast.error("Failed to delete form.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // COMPLETE DIALOG
  // ============================================

  const handleOpenMarkDialog = (rowId) => {
    setMarkRowId(rowId);
    setMarkReason("");
    setMarkDialogOpen(true);
  };

  const handleCloseMarkDialog = () => {
    setMarkDialogOpen(false);
    setMarkReason("");
    setMarkRowId(null);
  };

  // ============================================
  // MARK COMPLETE
  // ============================================

  const handleMarkComplete = async () => {
    const name = markReason.trim();

    if (!name) {
      toast.error("Name is required.");

      return;
    }

    setLoading(true);

    try {
      let updatedNames = completedNames;

      if (!completedNames.includes(name)) {
        updatedNames = [...completedNames, name];

        setCompletedNames(updatedNames);

        localStorage.setItem("completedNames", JSON.stringify(updatedNames));
      }

      await StaticFormServices.completeLog({
        form_id: markRowId,
        completed_by: name,
      });

      toast.success("Marked as complete!");

      fetchFormList(selectedFormType);

      handleCloseMarkDialog();
    } catch (error) {
      toast.error("Failed to mark complete.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    formist,

    pdfModalOpen,
    setPdfModalOpen,

    pdfUrl,
    setPdfUrl,

    selectedFormType,
    setSelectedFormType,

    markDialogOpen,
    markReason,
    setMarkReason,

    selectedMailFormId,
    setSelectedMailFormId,

    completedNames,

    userData,

    navigate,

    handleDelete,
    handleAddNewClick,

    handleOpenMarkDialog,
    handleCloseMarkDialog,

    handleMarkComplete,
  };
};

export default useStaticForms;
