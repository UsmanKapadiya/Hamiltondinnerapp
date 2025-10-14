import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  TextField
} from "@mui/material";
import { CloseOutlined, ZoomInOutlined, ZoomOutOutlined } from "@mui/icons-material";
import { useState } from "react";
import { tokens } from "../theme";
import CustomButton from "./CustomButton";

/**
 * Reusable PDF Modal Component
 * 
 * @param {boolean} open - Controls modal visibility
 * @param {function} onClose - Callback when modal is closed (clicking X or escape)
 * @param {function} onCloseComplete - Optional callback when Close button is clicked (if not provided, uses onClose)
 * @param {string} pdfUrl - URL of the PDF to display
 * @param {function} onPrint - Optional callback for print button (default: opens PDF in new tab)
 * @param {function} onMail - Optional callback for mail button (receives email address as parameter)
 * @param {function} onFollowUp - Optional callback for follow up button
 * @param {boolean} showPrintButton - Show/hide print button (default: true)
 * @param {boolean} showMailButton - Show/hide mail button (default: false)
 * @param {boolean} showFollowUpButton - Show/hide follow up button (default: false)
 * @param {string} title - Modal title (default: "PDF Preview")
 */
const PdfModal = ({
  open,
  onClose,
  onCloseComplete,
  pdfUrl,
  onPrint,
  onMail,
  onFollowUp,
  showPrintButton = true,
  showMailButton = false,
  showFollowUpButton = false,
  title = "PDF Preview"
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [zoom, setZoom] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [mailDialogOpen, setMailDialogOpen] = useState(false);
  const [mailTo, setMailTo] = useState("");
  const [mailSending, setMailSending] = useState(false);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

  const handleClose = () => {
    // Reset state when closing
    setZoom(1);
    setPdfLoading(true);
    setPdfError(false);
    onClose();
  };

  const handleCloseButton = () => {
    // Reset state when closing
    setZoom(1);
    setPdfLoading(true);
    setPdfError(false);
    // Use onCloseComplete if provided, otherwise use onClose
    if (onCloseComplete) {
      onCloseComplete();
    } else {
      onClose();
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Default behavior: open PDF in new tab for printing
      window.open(pdfUrl, "_blank");
    }
  };

  const handleOpenMailDialog = () => {
    setMailDialogOpen(true);
  };

  const handleCloseMailDialog = () => {
    setMailDialogOpen(false);
    setMailTo("");
  };

  const handleSendMail = async () => {
    if (!mailTo) {
      return;
    }

    setMailSending(true);
    try {
      if (onMail) {
        await onMail(mailTo);
      }
      handleCloseMailDialog();
    } catch (error) {
      console.error("Error sending mail:", error);
    } finally {
      setMailSending(false);
    }
  };

  const iframeStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    transform: `scale(${zoom})`,
    transformOrigin: "top left",
    border: "none",
    width: `${100 / zoom}%`,
    height: `${100 / zoom}%`,
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        sx={{ zIndex: 2000, bgcolor: "#fafafa" }}
        disableScrollLock
      >
      {/* Top Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          pt: 1,
          pb: 0.5,
          bgcolor: colors.primary[500],
          color: "#fff",
          userSelect: "none",
        }}
      >
        <DialogTitle sx={{ color: "#fff", m: 0, p: 0, fontWeight: "bold" }}>
          {title}
        </DialogTitle>
        <Box>
          <Tooltip title="Zoom Out">
            <IconButton
              size="small"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              sx={{ color: "#fff" }}
            >
              <ZoomOutOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton
              size="small"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              sx={{ color: "#fff" }}
            >
              <ZoomInOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: "#fff" }}
            >
              <CloseOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <DialogContent
        dividers
        sx={{
          position: "relative",
          height: "80vh",
          p: 0,
          bgcolor: "#fff",
          overflow: "hidden",
          boxShadow: 3,
          borderRadius: 1,
        }}
      >
        {/* Loading spinner */}
        {pdfLoading && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              bgcolor: "rgba(255,255,255,0.8)",
              borderRadius: 2,
              p: 3,
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <CircularProgress />
            <Box mt={1} color="text.secondary">
              Loading PDF...
            </Box>
          </Box>
        )}

        {/* Error message */}
        {pdfError && (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "error.main",
              fontWeight: "bold",
              fontSize: "1.2rem",
              p: 2,
            }}
          >
            Failed to load PDF. Please try again later.
          </Box>
        )}

        {/* PDF iframe */}
        {!pdfError && pdfUrl && (
          <iframe
            onLoad={() => {
              setPdfLoading(false);
              setPdfError(false);
            }}
            onError={() => {
              setPdfLoading(false);
              setPdfError(true);
            }}
            src={`https://docs.google.com/gview?url=${encodeURIComponent(
              pdfUrl
            )}&embedded=true`}
            title="PDF Preview"
            style={iframeStyle}
            width="100%"
            height="100%"
          />
        )}
      </DialogContent>

      {/* Actions */}
      {!pdfLoading && !pdfError && (
        <DialogActions
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: colors.primary[500],
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          {showFollowUpButton && onFollowUp && (
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
                width: 'auto'
              }}
              onClick={onFollowUp}
            >
              Follow Up
            </CustomButton>
          )}

          {showMailButton && onMail && (
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
                width: 'auto'
              }}
              onClick={handleOpenMailDialog}
            >
              Mail
            </CustomButton>
          )}

          {showPrintButton && (
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
                width: 'auto'
              }}
              onClick={handlePrint}
            >
              Print
            </CustomButton>
          )}

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
              width: 'auto'
            }}
            onClick={handleCloseButton}
          >
            Close
          </CustomButton>
        </DialogActions>
      )}
    </Dialog>

    {/* Mail Dialog */}
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
            width: 'auto'
          }}
          onClick={handleSendMail}
          disabled={mailSending}
        >
          {mailSending ? "Sending..." : "Send"}
        </CustomButton>
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
            width: 'auto'
          }}
          onClick={handleCloseMailDialog}
        >
          Cancel
        </CustomButton>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default PdfModal;
