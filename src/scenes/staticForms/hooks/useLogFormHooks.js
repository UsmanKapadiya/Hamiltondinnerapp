import { useState } from "react";
import { getUserDataFromStorage, getCompletedNamesFromStorage } from "../utils/logFormHelpers";

// Hook for managing user data from localStorage
export const useUserData = () => {
    const [userData] = useState(() => getUserDataFromStorage());
    return userData;
};

// Hook for managing completed names from localStorage
export const useCompletedNames = () => {
    const [completedNames, setCompletedNames] = useState(() => getCompletedNamesFromStorage());
    
    const addCompletedName = (name) => {
        const trimmedName = name?.trim();
        if (trimmedName && !completedNames.includes(trimmedName)) {
            const updated = [...completedNames, trimmedName];
            setCompletedNames(updated);
            localStorage.setItem("completedNames", JSON.stringify(updated));
            return updated;
        }
        return completedNames;
    };

    return {
        completedNames,
        setCompletedNames,
        addCompletedName,
    };
};
