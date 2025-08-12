import { Box, Typography, useTheme, Button, useMediaQuery, IconButton, Menu, MenuItem, Modal, TextField } from "@mui/material";
import { tokens } from "../theme";
import { Icon } from "@mui/material";
import {
  AccountCircle,
  AddOutlined,
  DeleteOutline,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import OrderServices from "../services/orderServices";
import CustomButton from "./CustomButton";

const Header = ({ title, icon, addNewClick, addBulkDelete, buttons, addButton, deleteButton, profileScreen, editRoomsDetails, editIcon, handleRoomUpdate, isGuest, isGuestIcon, handleGuestClick, isFormDropdown }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [foodTexture, setFoodTexture] = useState("");
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [selectedUser, setSelectedUser] = useState("")
  const [userData] = useState(() => {
    const userDatas = localStorage.getItem("userData");
    return userDatas ? JSON.parse(userDatas) : null;
  });

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleUserMenuClose();
    // navigate("/profile"); // Change to your profile route
  };

  const handleLogout = () => {
    handleUserMenuClose();
    toast.success("Logged out!");
    setTimeout(() => {
      localStorage.clear();
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      navigate("/");
      window.location.reload();
    }, 1000);
  };
  const fetchRoomDetails = async () => {
    const selectedUserData = userData?.rooms?.find((x) => x?.name === title);
    setFoodTexture("");
    setSpecialInstruction("");
    setSelectedUser(selectedUserData);
    if (selectedUserData?.id) {
      try {
        const response = await OrderServices.getRoomDetails(selectedUserData.id);
        if (response.ResponseCode === "1") {
          setFoodTexture(response?.Data?.food_texture || "");
          setSpecialInstruction(response?.Data?.special_instrucations || "");
        } else {
          toast.error(response.ResponseText || "Login failed. Please try again.");
        }
      } catch (error) {
        console.error("Error processing login:", error);
        const errorMessage =
          error.response?.data?.error || "An unexpected error occurred. Please try again.";
        toast.error(errorMessage);
      }
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    fetchRoomDetails();
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleModalSubmit = () => {
    setOpenModal(false);
    if (handleRoomUpdate) {
      handleRoomUpdate({
        foodTexture,
        specialInstruction,
        selectedUser
      });
    }
  };
  const handleGuestOnClick = () => {
    console.log("Working handleGuestOnClick")
    handleGuestClick()
  }

  return (
    <>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            minWidth: 350,
            outline: 'none'
          }}
        >
          <Typography variant="h6" mb={2}>
            Edit Room Details
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Food Texture"
              multiline
              minRows={2}
              value={foodTexture}
              onChange={e => setFoodTexture(e.target.value)}
              fullWidth
            />
            <TextField
              label="Special Instruction"
              multiline
              minRows={2}
              value={specialInstruction}
              onChange={e => setSpecialInstruction(e.target.value)}
              fullWidth
            />
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <CustomButton
                onClick={handleCloseModal}
                color="secondary"
                variant="outlined"
                sx={{
                  bgcolor: colors.blueAccent[50],
                  color: colors.blueAccent[700],
                  "&:hover": {
                    bgcolor: colors.blueAccent[100],
                    color: colors.blueAccent[800],
                  },
                  padding: "10px 32px",
                  boxShadow: "none",
                  border: "none",
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  // width: "auto",
                  maxWidth: "100%",
                }}
              >
                Cancel
              </CustomButton>
              <CustomButton
                onClick={handleModalSubmit}
                variant="contained"
                sx={{
                  padding: "10px 32px",
                  bgcolor: colors.blueAccent[700],
                  color: "#fcfcfc",
                  border: "none",
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  maxWidth: "100%",

                }}
              >
                Submit
              </CustomButton>
            </Box>
          </Box>
        </Box>
      </Modal>
      <Box mb="30px">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            {icon && (
              <Icon
                sx={{
                  color: colors.gray[100],
                  fontSize: "32px",
                  marginRight: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {icon}
              </Icon>
            )}
            <Typography
              variant="h6"
              fontWeight="bold"
              color={colors.gray[100]}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              # {title}
            </Typography>
          </Box>
          {editRoomsDetails && (
            <Box display="flex" gap="5px" ml="10px">
              <IconButton onClick={handleOpenModal} sx={{ color: colors.gray[100] }}>
                <Icon
                  sx={{
                    color: colors.gray[100],
                  }}
                >
                  {editIcon}
                </Icon>
              </IconButton>
            </Box>
          )}
          {isGuest && (
            <Box display="flex" gap="5px" ml="7px">
              <IconButton onClick={handleGuestOnClick} sx={{ color: colors.gray[100] }}>
                <Icon
                  sx={{
                    color: colors.gray[100],
                  }}
                >
                  {isGuestIcon}
                </Icon>
              </IconButton>
            </Box>
          )}
          {buttons && (
            <Box display="flex" gap="8px" ml="30px" position="relative" alignItems="center">
              <Button
                variant="contained"
                onClick={e => setAnchorEl(e.currentTarget)}
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
                startIcon={<AddOutlined />}
                disabled={!addButton}
                id="add-new-btn"
                aria-controls={isFormDropdown && Boolean(anchorEl) ? "add-new-dropdown-menu" : undefined}
                aria-haspopup={isFormDropdown ? "true" : undefined}
                aria-expanded={isFormDropdown && Boolean(anchorEl) ? "true" : undefined}
              >
                Add New
              </Button>
              {isFormDropdown && Boolean(anchorEl) && (
                <Box
                  id="add-new-dropdown-menu"
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    bgcolor: "background.paper",
                    boxShadow: 3,
                    borderRadius: 1,
                    mt: 1,
                    minWidth: 180,
                    zIndex: 10,
                  }}
                  onMouseLeave={() => setAnchorEl(null)}
                >
                  {(userData?.form_types || []).map((form) => (
                    <MenuItem
                      key={form.id}
                      onClick={() => {
                        addNewClick && addNewClick(form.name);
                        setAnchorEl(null);
                      }}
                    >
                      {form.name}
                    </MenuItem>
                  ))}
                </Box>
              )}
              <Button
                variant="contained"
                onClick={addBulkDelete}
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
                startIcon={<DeleteOutline />}
                disabled={!deleteButton}
              >
                Bulk Delete
              </Button>
            </Box>
          )}
          {/* Right Align User Icon */}
          {profileScreen && (
            <Box ml="auto">
              <IconButton onClick={handleUserMenuOpen} sx={{ color: colors.gray[100] }}>
                <AccountCircle fontSize="large" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                disableScrollLock
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
        <ToastContainer />
      </Box>
    </>
  );
};

export default Header;
