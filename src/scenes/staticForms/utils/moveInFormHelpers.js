// Generate UUID for file naming
export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Convert value to number with default
export const toNumber = (value) => Number(value) || 0;

// Process signature data for submission
export const processSignatureData = (signatureData) => {
    if (!signatureData) {
        return null;
    }

    try {
        const byteString = atob(signatureData.split(',')[1]);
        const mimeString = signatureData.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        return blob;
    } catch (error) {
        console.error("Error processing signature:", error);
        return null;
    }
};

// Prepare form data for submission
export const prepareFormData = (values, signatureBlob, formId, isUpdate = false) => {
    const formData = new FormData();
    
    if (formId) {
        formData.append("form_id", formId);
    }

    if (signatureBlob) {
        formData.append("file", signatureBlob, `Img_${generateUUID()}.jpg`);
    }

    formData.append("form_type", "3");
    formData.append("data", JSON.stringify(values));

    return formData;
};

// Calculate parking GST
export const calculateParkingGST = (rate, gstPercentage = 5) => {
    return (rate * gstPercentage / 100).toFixed(2);
};

// Calculate half rental deposit for second resident
export const calculateHalfRentalDeposit = (monthlyRate) => {
    return (monthlyRate / 2).toFixed(2);
};
