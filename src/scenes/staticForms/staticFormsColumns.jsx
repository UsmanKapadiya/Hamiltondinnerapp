// ============================================
// File: staticFormsColumns.js
// ============================================

import {
  Box,
  IconButton,
} from "@mui/material";

import {
  ReceiptOutlined,
} from "@mui/icons-material";

import EditIcon from "@mui/icons-material/Edit";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { toast } from "react-toastify";

import StaticFormServices from "../../services/staticFormServices";

export const getColumns = ({
  colors,
  userData,
  handleDelete,
  handleOpenMarkDialog,
  setPdfUrl,
  setPdfModalOpen,
  setSelectedMailFormId,
  navigate,
}) => {
  const columns = [
    // ============================================
    // NAME
    // ============================================

    {
      field: "displayName",
      headerName: "Name",
      flex: 1,

      valueGetter: (params) => {
        const form_response =
          params.row.form_response ||
          {};

        const form_type_id =
          params.row.form_type_id;

        // INCIDENT

        if (form_type_id === 1) {
          return (
            form_response.incident_involved ||
            ""
          );
        }

        // LOG FORM

        if (form_type_id === 2) {
          return form_response.room_number &&
            form_response.resident_name
            ? `${form_response.room_number} - ${form_response.resident_name}`
            : "";
        }

        // MOVE IN

        if (form_type_id === 3) {
          return form_response.suite_number &&
            form_response.first_resident_name_first_name &&
            form_response.first_resident_name_last_name
            ? `${form_response.suite_number} - ${form_response.first_resident_name_first_name} - ${form_response.first_resident_name_last_name}`
            : "";
        }

        return "";
      },
    },

    // ============================================
    // DATE
    // ============================================

    {
      field: "created_at",
      headerName: "Date",
      flex: 1,

      renderCell: (params) => {
        const date =
          params.value
            ? new Date(
                params.value
              )
            : null;

        const formatted =
          date &&
          !isNaN(date)
            ? date
                .toISOString()
                .slice(0, 10)
            : "";

        return (
          <span>
            {formatted}
          </span>
        );
      },
    },

    // ============================================
    // VIEW
    // ============================================

    {
      field: "view",
      headerName: "View",
      sortable: false,
      filterable: false,
      width: 90,
      align: "center",
      headerAlign: "center",

      renderCell: (params) => {
        return (
          params?.row
            ?.formLink && (
            <Box
              sx={{
                width: "100%",
                textAlign:
                  "center",
                mt: "6px",
              }}
            >
              <IconButton
                size="small"
                title="View"
                sx={{
                  color:
                    colors
                      .greenAccent[600],
                }}
                onClick={() => {
                  setSelectedMailFormId(
                    params.row.id
                  );

                  const url =
                    params.row
                      .formLink;

                  const isPdf =
                    url &&
                    url
                      .toLowerCase()
                      .endsWith(
                        ".pdf"
                      );

                  if (isPdf) {
                    setPdfUrl(
                      url
                    );

                    setPdfModalOpen(
                      true
                    );
                  } else {
                    window.open(
                      url,
                      "_blank"
                    );
                  }
                }}
              >
                <ReceiptOutlined fontSize="small" />
              </IconButton>
            </Box>
          )
        );
      },
    },
  ];

  // ============================================
  // ACTION COLUMN
  // ============================================

  if (userData?.role === "admin") {
    columns.push({
      field: "actions",
      headerName: "Action",
      sortable: false,
      filterable: false,
      width: 140,
      align: "center",
      headerAlign: "center",

      renderCell: (params) => {
        const form_type_id =
          params.row.form_type_id;

        const form_response =
          params.row.form_response || {};

        // CHECK ACTIONS

        const hasActions =
          form_type_id === 1 ||
          form_type_id === 3 ||
          (form_type_id === 2 &&
            form_response.is_completed ===
              0);

        // EMPTY ACTION

        if (!hasActions) {
          return (
            <Box
              sx={{
                width: "100%",
                textAlign:
                  "center",
                mt: "6px",
              }}
            >
              -
            </Box>
          );
        }

        return (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              gap: "10px",
              mt: "6px",
            }}
          >
            {/* EDIT + DELETE */}

            {(form_type_id === 1 ||
              form_type_id ===
                3) && (
              <>
                {/* EDIT */}

                <IconButton
                  size="small"
                  title="Edit"
                  sx={{
                    color:
                      colors
                        .blueAccent[600],
                  }}
                  onClick={async () => {
                    try {
                      const response =
                        await StaticFormServices.getFormById(
                          {
                            form_id:
                              params
                                .row
                                .id,
                          }
                        );

                      if (
                        response?.ResponseCode ===
                        "1"
                      ) {
                        // INCIDENT FORM

                        if (
                          form_type_id ===
                          1
                        ) {
                          navigate(
                            `incidentForm-edit/${params.row.id}`,
                            {
                              state:
                                {
                                  formData:
                                    response,

                                  id: params
                                    .row
                                    .id,

                                  scrollToFollowUp:
                                    params
                                      ?.row
                                      ?.is_follow_up_incomplete ===
                                    1,
                                },
                            }
                          );
                        }

                        // MOVE-IN FORM

                        if (
                          form_type_id ===
                          3
                        ) {
                          navigate(
                            `moveInSummaryForm-edit/${params.row.id}`,
                            {
                              state:
                                {
                                  formData:
                                    response,

                                  id: params
                                    .row
                                    .id,
                                },
                            }
                          );
                        }
                      }
                    } catch (error) {
                      toast.error(
                        "Failed to fetch form data."
                      );
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>

                {/* DELETE */}

                <IconButton
                  size="small"
                  title="Delete"
                  sx={{
                    color:
                      colors
                        .redAccent[600],
                  }}
                  onClick={() =>
                    handleDelete(
                      params.row.id
                    )
                  }
                >
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </>
            )}

            {/* COMPLETE */}

            {form_type_id === 2 &&
              form_response.is_completed ===
                0 && (
                <IconButton
                  size="small"
                  title="Complete"
                  sx={{
                    color:
                      colors
                        .greenAccent[600],
                  }}
                  onClick={() =>
                    handleOpenMarkDialog(
                      params.row.id
                    )
                  }
                >
                  <CheckCircleOutlineIcon fontSize="small" />
                </IconButton>
              )}
          </Box>
        );
      },
    });
  }

  return columns;
};