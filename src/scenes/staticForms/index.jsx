import {
  Box,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Header, PdfModal } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { ReceiptOutlined } from "@mui/icons-material";
import CustomButton from "../../components/CustomButton";
import { useStaticFormsController } from "./hooks/useStaticFormsController";

const StaticForms = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Use controller hook for all business logic
  const {
    loading,
    formist,
    selectedFormType,
    userData,
    pdfModalOpen,
    pdfUrl,
    showPrintButton,
    showMailButton,
    showFollowUpButton,
    markDialogOpen,
    markReason,
    setMarkReason,
    completedNames,
    columns,
    getRowClassName,
    handleAddNewClick,
    handleFormTypeChange,
    handlePdfModalClose,
    handleSendMail,
    handleFollowUp,
    handleCloseMarkDialog,
    handleMarkComplete,
  } = useStaticFormsController(colors);

  return (
    <Box m="20px">
      <Header
        title="Static Forms"
        icon={<ReceiptOutlined />}
        addNewClick={handleAddNewClick}
        buttons={true}
        addButton={true}
        deleteButton={false}
        isFormDropdown={true}
      />
      
      {/* Dropdown filter for all forms */}
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        mt={2}
        mb={2}
      >
        <FormControl size="small" sx={{ minWidth: 220, zIndex: 1301 }}>
          <InputLabel id="form-type-select-label">All Forms</InputLabel>
          <Select
            labelId="form-type-select-label"
            id="form-type-select"
            value={selectedFormType}
            label="All Forms"
            onChange={handleFormTypeChange}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  overflowY: "auto",
                },
              },
            }}
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
          "& .row-white-bg": {
            backgroundColor: "#fff !important",
          },
          "& .row-yellow-bg": {
            backgroundColor: "#ffd912 !important",
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
          getRowClassName={getRowClassName}
        />
      </Box>

      {/* Mark Complete Dialog */}
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
                type="text"
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

      {/* PDF Modal Component */}
      <PdfModal
        open={pdfModalOpen}
        onClose={handlePdfModalClose}
        pdfUrl={pdfUrl}
        showPrintButton={showPrintButton}
        showMailButton={showMailButton}
        showFollowUpButton={showFollowUpButton}
        onMail={handleSendMail}
        onFollowUp={handleFollowUp}
      />
    </Box>
  );
};

export default StaticForms;
