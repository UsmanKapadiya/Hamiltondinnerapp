// ChargesOptionPopup.jsx

import React from "react";

import {
    Popover,
    Typography,
    Box,
    Button,
} from "@mui/material";

const ChargesOptionPopup = ({
    popup,
    setPopup,
}) => {
    return (
        <Popover
            open={popup.open}
            anchorEl={popup.anchorEl}
            onClose={() =>
                setPopup({
                    ...popup,
                    open: false,
                })
            }
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "center",
            }}
            disableScrollLock
            PaperProps={{
                sx: {
                    width: 230,
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow:
                        "0px 2px 10px rgba(0,0,0,0.2)",
                    backgroundColor: "#dfefff",
                    p: 2,
                },
            }}
        >
            <Box>
                {/* TEXT */}
                <Typography
                    sx={{
                        fontSize: "16px",
                        color: "#1976d2",
                        mb: 2,
                    }}
                >
                    {popup.text || "No data"}
                </Typography>

                {/* BUTTON */}
                <Box
                    display="flex"
                    justifyContent="flex-end"
                >
                    <Button
                        variant="contained"
                        onClick={() =>
                            setPopup({
                                ...popup,
                                open: false,
                            })
                        }
                        sx={{
                            minWidth: "70px",
                            borderRadius: "8px",
                            textTransform:
                                "none",
                            fontWeight: 600,
                            boxShadow: "none",
                        }}
                    >
                        OK
                    </Button>
                </Box>
            </Box>
        </Popover>
    );
};

export default ChargesOptionPopup;
