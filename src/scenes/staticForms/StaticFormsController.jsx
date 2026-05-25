import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ReceiptOutlined } from "@mui/icons-material";
import { Header, PdfModal } from "../../components";
import CustomButton from "../../components/CustomButton";
import { tokens } from "../../theme";
import useStaticForms from "./useStaticForms";
import { getColumns } from "./staticFormsColumns";
import StaticFormServices from "../../services/staticFormServices";
import { toast } from "react-toastify";

const StaticForms = () => {
  const theme = useTheme();

  const colors = tokens(theme.palette.mode);

  const {
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
  } = useStaticForms();

  // ============================================
  // COLUMNS
  // ============================================

  const columns = getColumns({
    colors,
    userData,

    handleDelete,

    handleOpenMarkDialog,

    setPdfUrl,
    setPdfModalOpen,

    setSelectedMailFormId,

    navigate,
  });

  return (
    <Box m="20px">
      {/* HEADER */}

      <Header
        title="Static Forms"
        icon={<ReceiptOutlined />}
        addNewClick={handleAddNewClick}
        buttons={true}
        addButton={true}
        deleteButton={false}
        isFormDropdown={true}
      />

      {/* FILTER */}

      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        mt={2}
        mb={2}
      >
        <FormControl
          size="small"
          sx={{
            minWidth: 220,
            zIndex: 1301,
          }}
        >
          <InputLabel>All Forms</InputLabel>

          <Select
            value={selectedFormType}
            label="All Forms"
            onChange={(e) => setSelectedFormType(e.target.value)}
          >
            <MenuItem value="all">All Forms</MenuItem>

            {(userData?.form_types || []).map((form) => (
              <MenuItem key={form.id} value={form.id}>
                {form.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* TABLE */}

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

          "& .row-white-bg": {
            backgroundColor: "#fff !important",
          },

          "& .row-yellow-bg": {
            backgroundColor: "#ffd912 !important",
          },
        }}
      >
        <DataGrid
          rows={formist || []}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
                page: 0,
              },
            },
          }}
          getRowClassName={(params) => {
            const role = userData?.role;

            if (role === "concierge" || role === "nurse") {
              return "row-white-bg";
            }

            if (params.row.is_follow_up_incomplete === 1) {
              return "row-yellow-bg";
            }

            return "row-white-bg";
          }}
        />
      </Box>

      {/* COMPLETE DIALOG */}

      <Dialog
        open={markDialogOpen}
        onClose={handleCloseMarkDialog}
        maxWidth="xs"
        fullWidth
      >
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
                overflowY: "auto",
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                margin="dense"
                label="Enter name"
                fullWidth
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <CustomButton
            sx={{
              padding: "10px 32px",

              bgcolor: colors.blueAccent[700],

              color: "#fcfcfc",

              border: "none",

              borderRadius: 4,

              fontWeight: 600,

              fontSize: 16,

              cursor: "pointer",

              width: "auto",
            }}
            onClick={handleCloseMarkDialog}
          >
            Cancel
          </CustomButton>

          <CustomButton
            sx={{
              padding: "10px 32px",

              bgcolor: colors.blueAccent[50],

              color: colors.blueAccent[700],

              border: "none",

              borderRadius: 4,

              fontWeight: 600,

              fontSize: 16,

              cursor: "pointer",

              width: "auto",
            }}
            onClick={handleMarkComplete}
          >
            Submit
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* PDF MODAL */}
      {/* PDF MODAL */}

      <PdfModal
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        pdfUrl={pdfUrl}
        showPrintButton={
          formist.find((f) => f.id === selectedMailFormId)?.form_type
            ?.allow_print === 1
        }
        showMailButton={
          formist.find((f) => f.id === selectedMailFormId)?.form_type
            ?.allow_mail === 1
        }
        showFollowUpButton={
          formist.find(
            (f) =>
              f.id === selectedMailFormId &&
              f.is_follow_up_incomplete === 1 &&
              f.form_type_id === 1,
          )
            ? true
            : false
        }
        // ============================================
        // MAIL
        // ============================================

        onMail={async (emailTo) => {
          if (!emailTo) {
            toast.error("Email is required.");

            return;
          }

          try {
            const response = await StaticFormServices.sendMail({
              to_id: emailTo,
              form_id: selectedMailFormId,
            });

            if (response?.ResponseCode === "1") {
              toast.success(`Email sent to ${emailTo}`);
            } else {
              toast.error(response?.Message || "Failed to send email.");
            }
          } catch (error) {
            toast.error("Failed to send email.");
          }
        }}
        // ============================================
        // FOLLOW UP
        // ============================================

        onFollowUp={async () => {
          try {
            const response = await StaticFormServices.getFormById({
              form_id: selectedMailFormId,
            });

            if (response?.ResponseCode === "1") {
              setPdfModalOpen(false);

              navigate(`incidentForm-edit/${selectedMailFormId}`, {
                state: {
                  formData: response,

                  id: selectedMailFormId,

                  scrollToFollowUp: true,
                },
              });
            } else {
              toast.error("Failed to fetch form data.");
            }
          } catch (error) {
            toast.error("Failed to fetch form data.");
          }
        }}
      />

      {/* <PdfModal
  open={pdfModalOpen}
  onClose={() =>
    setPdfModalOpen(false)
  }
  pdfUrl={pdfUrl}

  showPrintButton={
    formist.find(
      (f) =>
        f.id ===
        selectedMailFormId
    )?.form_type?.allow_print === 1
  }

  showMailButton={
    formist.find(
      (f) =>
        f.id ===
        selectedMailFormId
    )?.form_type?.allow_mail === 1
  }

  showFollowUpButton={
    formist.find(
      (f) =>
        f.id ===
          selectedMailFormId &&
        f.is_follow_up_incomplete ===
          1 &&
        f.form_type_id === 1
    )
      ? true
      : false
  }

  onFollowUp={async () => {
    try {
      const response =
        await StaticFormServices.getFormById(
          {
            form_id:
              selectedMailFormId,
          }
        );

      if (
        response?.ResponseCode ===
        "1"
      ) {
        setPdfModalOpen(false);

        navigate(
          `incidentForm-edit/${selectedMailFormId}`,
          {
            state: {
              formData:
                response,

              id: selectedMailFormId,

              scrollToFollowUp: true,
            },
          }
        );
      }
    } catch (error) {
      toast.error(
        "Failed to fetch form data."
      );
    }
  }}
/> */}
    </Box>
  );
};

export default StaticForms;
