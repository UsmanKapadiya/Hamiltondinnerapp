import { CircularProgress, Box } from "@mui/material";

const CustomLoadingOverlay = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100%"
  >
    <CircularProgress color="primary" />
  </Box>
);

export default CustomLoadingOverlay;
