import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IconButton, Box } from "@mui/material";
import { ReceiptOutlined } from "@mui/icons-material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import StaticFormServices from "../../../services/staticFormServices";

/**
 * Main controller hook for Static Forms list
 * Manages all business logic, state, and handlers
 */
export const useStaticFormsController = (colors) => {
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [formist, setFormList] = useState([]);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedFormType, setSelectedFormType] = useState("all");
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [markReason, setMarkReason] = useState("");
  const [markRowId, setMarkRowId] = useState(null);
  const [selectedMailFormId, setSelectedMailFormId] = useState("");

  // Load persisted data from localStorage
  const [completedNames, setCompletedNames] = useState(() => {
    const stored = localStorage.getItem("completedNames");
    return stored ? JSON.parse(stored) : [];
  });

  const [userData] = useState(() => {
    const userDatas = localStorage.getItem("userData");
    return userDatas ? JSON.parse(userDatas) : null;
  });

  // Fetch form list
  const fetchFormList = useCallback(async (formType = "all") => {
    setLoading(true);
    try {
      let payload = { form_type: formType === "all" ? 0 : formType };
      const response = await StaticFormServices.getFormList(payload);
      setFormList(response?.list);
    } catch (error) {
      console.error("Error fetching room list:", error);
      toast.error("Failed to fetch room list. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchFormList(selectedFormType);
  }, [fetchFormList, selectedFormType]);

  // Handle add new form click
  const handleAddNewClick = useCallback(
    (formType) => {
      let route = "incidentForm-create";
      if (formType === "incidentForm") route = "incidentForm-create";
      else if (formType === "Log Form") route = "logForm-create";
      else if (formType === "MoveIn Summary Form")
        route = "moveInSummaryForm-create";
      navigate(route);
    },
    [navigate],
  );

  // Handle delete form
  const handleDelete = useCallback(
    async (id) => {
      if (!id) return;
      setLoading(true);
      const payload = { form_id: id };
      try {
        await StaticFormServices.deleteForm(payload);
        toast.success("Form deleted successfully.");
        fetchFormList(selectedFormType);
      } catch (error) {
        toast.error("Failed to delete form. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [fetchFormList, selectedFormType],
  );

  // Handle mark as complete dialog open
  const handleOpenMarkDialog = useCallback((rowId) => {
    setMarkRowId(rowId);
    setMarkReason("");
    setMarkDialogOpen(true);
  }, []);

  // Handle mark as complete dialog close
  const handleCloseMarkDialog = useCallback(() => {
    setMarkDialogOpen(false);
    setMarkReason("");
    setMarkRowId(null);
  }, []);

  // Handle mark form as complete
  const handleMarkComplete = useCallback(async () => {
    const name = markReason.trim();
    const formId = markRowId;
    if (!name) {
      toast.error("Name is required to mark as complete.");
      return;
    }

    setLoading(true);
    let updatedNames = completedNames;
    if (!completedNames.includes(name)) {
      updatedNames = [...completedNames, name];
      setCompletedNames(updatedNames);
      localStorage.setItem("completedNames", JSON.stringify(updatedNames));
    }
    const payload = {
      form_id: formId,
      completed_by: name,
    };
    try {
      await StaticFormServices.completeLog(payload);
      toast.success(`Marked as complete! Name: ${name}`);
      fetchFormList(selectedFormType);
      handleCloseMarkDialog();
    } catch (error) {
      toast.error("Failed to mark as complete. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [markReason, markRowId, completedNames, fetchFormList, selectedFormType, handleCloseMarkDialog]);

  // Handle send email
  const handleSendMail = useCallback(
    async (emailTo) => {
      if (!emailTo) {
        toast.error("Email is required.");
        return;
      }

      try {
        let payload = { to_id: emailTo, form_id: selectedMailFormId };
        const response = await StaticFormServices.sendMail(payload);
        if (response?.ResponseCode === "1") {
          toast.success(`Email sent to ${emailTo}`);
        } else if (response?.Message) {
          toast.error(response.Message);
        }
      } catch (error) {
        toast.error("Failed to send email. Please try again.");
      }
    },
    [selectedMailFormId],
  );

  // Handle follow-up navigation
  const handleFollowUp = useCallback(async () => {
    const selectedForm = formist.find((f) => f.id === selectedMailFormId);
    const formTypeId = selectedForm?.form_type_id;

    try {
      const payload = { form_id: selectedMailFormId };
      const response = await StaticFormServices.getFormById(payload);

      if (response?.ResponseCode === "1") {
        setPdfModalOpen(false);

        if (formTypeId === 1) {
          navigate(`incidentForm-edit/${selectedMailFormId}`, {
            state: {
              formData: response,
              id: selectedMailFormId,
              scrollToFollowUp: true,
            },
          });
        }
      } else {
        toast.error("Failed to fetch form data. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to fetch form data. Please try again.");
    }
  }, [formist, selectedMailFormId, navigate]);

  // Handle PDF view
  const handleViewForm = useCallback((row) => {
    setSelectedMailFormId(row.id);
    const url = row.formLink;
    const isPdf = url && url.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      setPdfUrl(url);
      setPdfModalOpen(true);
    } else {
      window.open(url, "_blank");
    }
  }, []);

  // Handle edit form
  const handleEditForm = useCallback(
    async (row) => {
      const form_type_id = row.form_type_id;
      try {
        const payload = { form_id: row.id };
        const response = await StaticFormServices.getFormById(payload);
        if (response?.ResponseCode === "1") {
          if (form_type_id === 1) {
            navigate(`incidentForm-edit/${row.id}`, {
              state: {
                formData: response,
                id: row.id,
                scrollToFollowUp: row?.is_follow_up_incomplete === 1,
              },
            });
          } else if (form_type_id === 3) {
            navigate(`moveInSummaryForm-edit/${row.id}`, {
              state: { formData: response, id: row.id },
            });
          }
        }
      } catch (error) {
        toast.error("Failed to fetch form data. Please try again.");
      }
    },
    [navigate],
  );

  // Handle form type filter change
  const handleFormTypeChange = useCallback((event) => {
    setSelectedFormType(event.target.value);
  }, []);

  // Handle PDF modal close
  const handlePdfModalClose = useCallback(() => {
    setPdfModalOpen(false);
  }, []);

  // Get display name for form
  const getDisplayName = useCallback((params) => {
    const form_response = params.row.form_response || {};
    const form_type_id = params.row.form_type_id;
    if (form_type_id === 1) {
      // Incident Form
      return form_response.incident_involved || "";
    } else if (form_type_id === 2) {
      // Log Form
      return form_response.room_number && form_response.resident_name
        ? `${form_response.room_number} - ${form_response.resident_name}`
        : "";
    } else if (form_type_id === 3) {
      // MoveIn Summary Form
      return form_response.suite_number &&
        form_response.first_resident_name_first_name &&
        form_response.first_resident_name_last_name
        ? `${form_response.suite_number} - ${form_response.first_resident_name_first_name} - ${form_response.first_resident_name_last_name}`
        : "";
    }
    return "";
  }, []);

  // Get row class name for styling
  const getRowClassName = useCallback(
    (params) => {
      const role = userData?.role;
      if (role === "concierge" || role === "nurse") {
        return "row-white-bg";
      }
      if (params.row.is_follow_up_incomplete === 1) {
        return "row-yellow-bg";
      }
      return "row-white-bg";
    },
    [userData],
  );

  // Build DataGrid columns
  const columns = useMemo(
    () => [
      {
        field: "displayName",
        headerName: "Name",
        flex: 1,
        valueGetter: getDisplayName,
      },
      {
        field: "created_at",
        headerName: "Date",
        flex: 1,
        renderCell: (params) => {
          const date = params.value ? new Date(params.value) : null;
          const formatted =
            date && !isNaN(date) ? date.toISOString().slice(0, 10) : "";
          return <span>{formatted}</span>;
        },
      },
      {
        field: "view",
        headerName: "View",
        sortable: false,
        filterable: false,
        width: 80,
        renderCell: (params) => {
          return (
            params?.row?.formLink && (
              <IconButton
                size="small"
                title="View"
                sx={{ color: colors.greenAccent[600] }}
                onClick={() => handleViewForm(params.row)}
              >
                <ReceiptOutlined fontSize="small" />
              </IconButton>
            )
          );
        },
      },
      {
        field: "actions",
        headerName: "Action",
        sortable: false,
        filterable: false,
        align: "right",
        headerAlign: "center",
        width: 120,
        renderCell: (params) => {
          const form_type_id = params.row.form_type_id;
          if (form_type_id === 1 || form_type_id === 3) {
            return (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                gap={1}
              >
                <IconButton
                  key={`edit-btn-${params.row.id}`}
                  size="small"
                  title="Edit"
                  sx={{ color: colors.blueAccent[600] }}
                  onClick={() => handleEditForm(params.row)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  key={`delete-btn-${params.row.id}`}
                  size="small"
                  title="Delete"
                  sx={{ color: colors.redAccent[600] }}
                  onClick={() => handleDelete(params.row.id)}
                >
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          } else if (form_type_id === 2) {
            const role = userData?.role;
            const form_response = params.row.form_response || {};
            if (role === "concierge" || role === "nurse") {
              return null;
            } else if (role === "admin" && form_response.is_completed === 0) {
              return (
                <IconButton
                  size="small"
                  title="Mark as Complete"
                  sx={{ color: colors.greenAccent[600] }}
                  onClick={() => handleOpenMarkDialog(params.row.id)}
                >
                  <CheckCircleOutlineIcon fontSize="small" />
                </IconButton>
              );
            }
          }
          return null;
        },
      },
    ],
    [colors, getDisplayName, handleViewForm, handleEditForm, handleDelete, handleOpenMarkDialog, userData],
  );

  // Get PDF modal button visibility
  const showPrintButton = useMemo(
    () =>
      formist.find((f) => f.id === selectedMailFormId)?.form_type
        ?.allow_print === 1,
    [formist, selectedMailFormId],
  );

  const showMailButton = useMemo(
    () =>
      formist.find((f) => f.id === selectedMailFormId)?.form_type
        ?.allow_mail === 1,
    [formist, selectedMailFormId],
  );

  const showFollowUpButton = useMemo(
    () =>
      formist.find((f) => f.id === selectedMailFormId)
        ?.is_follow_up_incomplete === 1 &&
      formist.find((f) => f.id === selectedMailFormId)?.form_type_id === 1,
    [formist, selectedMailFormId],
  );

  return {
    // State
    loading,
    formist,
    selectedFormType,
    userData,
    
    // PDF Modal
    pdfModalOpen,
    pdfUrl,
    showPrintButton,
    showMailButton,
    showFollowUpButton,
    
    // Mark Complete Dialog
    markDialogOpen,
    markReason,
    setMarkReason,
    completedNames,
    
    // DataGrid
    columns,
    getRowClassName,
    
    // Handlers
    handleAddNewClick,
    handleFormTypeChange,
    handlePdfModalClose,
    handleSendMail,
    handleFollowUp,
    handleCloseMarkDialog,
    handleMarkComplete,
  };
};
