import { Box, Typography, useTheme, FormControl, InputLabel, Select, MenuItem, IconButton } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { mockDataInvoices } from "../../data/mockData";
import { tokens } from "../../theme";
import { ReceiptOutlined } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { Route, useNavigate } from "react-router-dom";
import StaticFormServices from "../../services/staticFormServices";
import { toast } from "react-toastify";

const StaticForms = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formist, setFormList] = useState([]);
  const [userData] = useState(() => {
    const userDatas = localStorage.getItem("userData");
    return userDatas ? JSON.parse(userDatas) : null;
  });
  const [selectedFormType, setSelectedFormType] = useState('all');

  // Accepts a formType argument for dynamic navigation
  const handleAddNewClick = useCallback((formType) => {
    console.log("form",formType)
    let route = "incidentForm-create";
    if (formType === "incidentForm") route = "incidentForm-create";
    else if (formType === "Log Form") route = "logForm-create";
    else if (formType === "MoveIn Summary Form") route = "moveInSummaryForm-create";
    console.log("Route", route)
    navigate(route);
  }, [navigate]);

  // Fetch room list
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

  const columns = [
    { field: "id", headerName: "ID" },
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
          // Log Form (existing logic)
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
              <IconButton size="small" title="Edit" sx={{ color: colors.blueAccent[600] }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" title="Delete" sx={{ color: colors.redAccent[600] }}>
                <DeleteForeverIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }
        else if(form_type_id === 2){
          // if check userData?.role === "concierge"  or  "nurse"  that time action empty,
          // else if userData?.role === "admin" that time check form_response?.is_completed === 0 that time display mui icon CheckCircleOutlineIcon 
          const role = userData?.role;
          const form_response = params.row.form_response || {};
          if (role === "concierge" || role === "nurse") {
            return null;
          } else if (role === "admin" && form_response.is_completed === 0) {
            return (
              <IconButton size="small" title="Mark as Complete" sx={{ color: colors.greenAccent[600] }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            );
          }
        }
        return null;
      },
    },
  
  ];
  console.log("user", userData)
  console.log("formist", formist)

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
    </Box>
  );
};

export default StaticForms;
