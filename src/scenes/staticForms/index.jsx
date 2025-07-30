import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Box, useTheme, FormControl, InputLabel, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete, CircularProgress, useMediaQuery } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { ReceiptOutlined } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaticFormServices from "../../services/staticFormServices";
import { toast } from "react-toastify";

const StaticForms = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formist, setFormList] = useState([]);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedFormType, setSelectedFormType] = useState('all');
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [markReason, setMarkReason] = useState("");
  const [markRowId, setMarkRowId] = useState(null);
  const [mailDialogOpen, setMailDialogOpen] = useState(false);
  const [mailTo, setMailTo] = useState("");
  const [mailSending, setMailSending] = useState(false);
  const [selectedMailFormId, setSelectedMailFormId] = useState("");
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [completedNames, setCompletedNames] = useState(() => {
    const stored = localStorage.getItem("completedNames");
    return stored ? JSON.parse(stored) : [];
  });
  const [userData] = useState(() => {
    const userDatas = localStorage.getItem("userData");
    return userDatas ? JSON.parse(userDatas) : null;
  });

  const handleAddNewClick = useCallback((formType) => {
    let route = "incidentForm-create";
    if (formType === "incidentForm") route = "incidentForm-create";
    else if (formType === "Log Form") route = "logForm-create";
    else if (formType === "MoveIn Summary Form") route = "moveInSummaryForm-create";
    navigate(route);
  }, [navigate]);

  const fetchFormList = useCallback(async (formType = 'all') => {
    setLoading(true);
    try {
      let payload = { "form_type": formType === 'all' ? 0 : formType };
      const response = await StaticFormServices.getFormList(payload);
      setFormList(response?.list);
    } catch (error) {
      console.error("Error fetching room list:", error);
      toast.error("Failed to fetch room list. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormList(selectedFormType);
  }, [fetchFormList, selectedFormType]);

  const handleDelete = async (id) => {
    if (!id) return;
    setLoading(true);
    const payload = {
      form_id: id
    }
    try {
      await StaticFormServices.deleteForm(payload);
      toast.success("Form deleted successfully.");
      fetchFormList(selectedFormType); // Refresh list
    } catch (error) {
      toast.error("Failed to delete form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleMarkComplete = async () => {
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
      completed_by: name
    };
    try {
      await StaticFormServices.completeLog(payload);
      toast.success(`Marked as complete! Name: ${name}`);
      fetchFormList(selectedFormType); // Refresh list
      handleCloseMarkDialog();
    } catch (error) {
      toast.error("Failed to mark as complete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMailDialog = () => {
    setMailDialogOpen(false);
    setMailTo("");
  };

  const handleSendMail = async () => {
    if (!mailTo) {
      toast.error("Email is required.");
      return;
    }

    setMailSending(true);
    try {
      let payload = { to_id: mailTo, form_id: selectedMailFormId };
      const response = await StaticFormServices.sendMail(payload);
      if (response?.ResponseCode === "1") {
        toast.success(`Email sent to ${mailTo}`);
        handleCloseMailDialog();
      } else if (response?.Message) {
        toast.error(response.Message);
      }
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
    } finally {
      setMailSending(false);
    }
  };

  const columns = [
    // { field: "id", headerName: "ID" },
    {
      field: "displayName",
      headerName: "Name",
      flex: 1,
      valueGetter: (params) => {
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
          return form_response.suite_number && form_response.first_resident_name_first_name && form_response.first_resident_name_last_name
            ? `${form_response.suite_number} - ${form_response.first_resident_name_first_name} - ${form_response.first_resident_name_last_name}`
            : "";
        }
        return "";
      },
    },
    {
      field: "created_at",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => {
        const date = params.value ? new Date(params.value) : null;
        const formatted = date && !isNaN(date) ? date.toISOString().slice(0, 10) : "";
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
              key={`view-btn-${params.row.id}`}
              size="small"
              title="View"
              sx={{ color: colors.greenAccent[600] }}
              onClick={() => {
                setSelectedMailFormId(params.row.id);
                const url = params.row.formLink;
                const isPdf = url && url.toLowerCase().endsWith('.pdf');
                if (isPdf) {
                  setPdfLoading(true);
                  setPdfError(false);
                  setPdfUrl(url);
                  setPdfModalOpen(true);
                } else {
                  window.open(url, '_blank');
                }
              }}
            >
              <ReceiptOutlined fontSize="small" />
            </IconButton>
          )
        );
      }
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
            <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
              <IconButton
                key={`edit-btn-${params.row.id}`}
                size="small"
                title="Edit"
                sx={{ color: colors.blueAccent[600] }}
                onClick={async () => {
                  // Fetch the form data by ID
                  try {
                    const payload = {
                      "form_id": params.row.id
                    }
                    const response = await StaticFormServices.getFormById(payload);
                    if (response?.ResponseCode === '1') {
                      console.log("here", response)
                      if (form_type_id === 1) {
                        navigate(`incidentForm-edit/${params.row.id}`, { state: { formData: response, id: params.row.id } })
                      }
                      else if (form_type_id === 3) {
                        navigate(`moveInSummaryForm-edit/${params.row.id}`, { state: { formData: response, id: params.row.id } })
                      }
                    }
                    console.log(response)
                    // Navigate to the incident form edit screen, passing the form data
                    // ;
                  } catch (error) {
                    toast.error("Failed to fetch form data. Please try again.");
                  }
                }}
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
        }
        else if (form_type_id === 2) {
          // if check userData?.role === "concierge"  or  "nurse"  that time action empty,
          // else if userData?.role === "admin" that time check form_response?.is_completed === 0 that time display mui icon CheckCircleOutlineIcon 
          const role = userData?.role;
          const form_response = params.row.form_response || {};
          if (role === "concierge" || role === "nurse") {
            return null;
          } else if (role === "admin" && form_response.is_completed === 0) {
            return (
              <>
                <IconButton
                  size="small"
                  title="Mark as Complete"
                  sx={{ color: colors.greenAccent[600] }}
                  onClick={() => handleOpenMarkDialog(params.row.id)}
                >
                  <CheckCircleOutlineIcon fontSize="small" />
                </IconButton>
                <Dialog open={markDialogOpen} onClose={handleCloseMarkDialog} maxWidth="xs" fullWidth>
                  <DialogTitle>Completed By</DialogTitle>
                  <DialogContent>
                    <Autocomplete
                      freeSolo
                      options={completedNames}
                      value={markReason}
                      onInputChange={(e, newValue) => setMarkReason(newValue)}
                      ListboxProps={{
                        style: {
                          maxHeight: 150,
                          overflowY: 'auto',
                        },
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          autoFocus
                          margin="dense"
                          label="Enter name"
                          type="text"
                          fullWidth
                        />
                      )}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseMarkDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleMarkComplete} color="primary" variant="contained">Submit</Button>
                  </DialogActions>
                </Dialog>

              </>
            );
          }
        }
        return null;
      },
    },

  ];

  return (
    <Box m="20px">
      {/* <Header title="Static Forms" subtitle="List of All Static Forms" /> */}
      <Header
        title="Static Forms"
        icon={<ReceiptOutlined />}
        addNewClick={handleAddNewClick}
        // addBulkDelete={handleBulkDelete}
        buttons={true}
        addButton={true}
        deleteButton={false}
        isFormDropdown={true}
      />
      {/* Dropdown filter for all forms */}
      <Box display="flex" justifyContent="flex-start" alignItems="center" mt={2} mb={2}>
        <FormControl size="small" sx={{ minWidth: 220, zIndex: 1301 }}>
          <InputLabel id="form-type-select-label">All Forms</InputLabel>
          <Select
            labelId="form-type-select-label"
            id="form-type-select"
            value={selectedFormType}
            label="All Forms"
            onChange={e => setSelectedFormType(e.target.value)}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  overflowY: 'auto',
                },
              },
            }}

          >
            <MenuItem value="all">All Forms</MenuItem>
            {(userData?.form_types || []).map((form) => (
              <MenuItem key={form.id} value={form.id}>{form.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        mt="20px"
        height="75vh"
        maxWidth="100%"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            border: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-iconSeparator": {
            color: colors.primary[100],
          },
          '& .row-white-bg': {
            backgroundColor: '#fff !important',
          },
          '& .row-yellow-bg': {
            backgroundColor: '#ffd912 !important',
          },
        }}
      >
        <DataGrid
          rows={formist}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          checkboxSelection
          loading={loading}
          getRowClassName={(params) => {
            const role = userData?.role;
            if (role === "concierge" || role === "nurse") {
              return 'row-white-bg';
            }
            if (params.row.is_follow_up_incomplete === 1) {
              return 'row-yellow-bg';
            }
            return 'row-white-bg';
          }}
        />
      </Box>
      <Dialog
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ zIndex: 2000 }}
        disableScrollLock
      >
        <DialogTitle>PDF Preview</DialogTitle>
        <DialogContent
          dividers
          sx={{
            height: '80vh',
            p: 0,
            backgroundColor: '#fff',
          }}
        >
          {pdfLoading && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          )}
          <iframe
            onLoad={() => {
              setPdfLoading(false);
              setPdfError(false);
            }}
            onError={() => {
              setPdfLoading(false);
              setPdfError(true);
            }}
            src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            title="PDF Preview"
            width="100%"
            height="100%"
            style={{
              display: pdfLoading ? 'none' : 'block',
              border: 'none',
              backgroundColor: '#fff',
            }}
          />
        </DialogContent>
        {!pdfLoading && !pdfError && (
          <DialogActions>
            {formist.find(f => f.id === selectedMailFormId)?.form_type?.allow_mail === 1 && (
              <Button
                variant="contained"
                onClick={() => setMailDialogOpen(true)}
                sx={{
                  bgcolor: colors.greenAccent[700],
                  color: "#fcfcfc",
                  fontSize: isMdDevices ? "12px" : "10px",
                  fontWeight: "bold",
                  p: "6px 12px",
                  transition: ".3s ease",
                  ":hover": {
                    bgcolor: colors.greenAccent[800],
                  },
                }}
              >
                Mail
              </Button>
            )}
            {formist.find(f => f.id === selectedMailFormId)?.form_type?.allow_print === 1 && (
              <Button
                variant="contained"
                onClick={() => {
                  window.open(`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`, '_blank');
                }}
                sx={{
                  bgcolor: colors.greenAccent[700],
                  color: "#fcfcfc",
                  fontSize: isMdDevices ? "12px" : "10px",
                  fontWeight: "bold",
                  p: "6px 12px",
                  transition: ".3s ease",
                  ":hover": {
                    bgcolor: colors.greenAccent[800],
                  },
                }}
              >
                Print
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => setPdfModalOpen(false)}
              sx={{
                bgcolor: colors.redAccent[700],
                color: "#fcfcfc",
                fontSize: isMdDevices ? "12px" : "10px",
                fontWeight: "bold",
                p: "6px 12px",
                transition: ".3s ease",
                ":hover": {
                  bgcolor: colors.redAccent[800],
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        )}
      </Dialog>
      <Dialog
        open={mailDialogOpen}
        onClose={handleCloseMailDialog}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 2100 }}
      >
        <DialogTitle>Send Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter Email Id"
            type="email"
            fullWidth
            value={mailTo}
            onChange={(e) => setMailTo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleSendMail}
            disabled={mailSending}
            sx={{
              bgcolor: colors.greenAccent[700],
              color: "#fcfcfc",
              fontSize: isMdDevices ? "12px" : "10px",
              fontWeight: "bold",
              p: "6px 12px",
              transition: ".3s ease",
              ":hover": {
                bgcolor: colors.greenAccent[800],
              },
            }}
          >
            {mailSending ? "Sending..." : "Send"}
          </Button>

          <Button
            variant="contained"
            onClick={handleCloseMailDialog}
            sx={{
              bgcolor: colors.redAccent[700],
              color: "#fcfcfc",
              fontSize: isMdDevices ? "12px" : "10px",
              fontWeight: "bold",
              p: "6px 12px",
              transition: ".3s ease",
              ":hover": {
                bgcolor: colors.redAccent[800],
              },
            }}
          >
            Cancel
          </Button>

        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaticForms;
