import React from "react";
import { Box } from "@mui/material";

const ServiceOptions = ({ data, langObj, serviceKeys, onServiceToggle }) => {
  return (
    <Box mt={3} display="flex" gap={2}>
      {serviceKeys.map((opt) => (
        <label key={opt.key} style={{ display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={data[opt.key] === 1}
            onChange={() => onServiceToggle(opt.key)}
          />
          <span style={{ marginLeft: 5 }}>{opt.label}</span>
        </label>
      ))}
    </Box>
  );
};

export default ServiceOptions;
