// Find resident name based on room number
export const findResidentByRoomNumber = (roomNumber, userData) => {
    if (!userData?.rooms || !Array.isArray(userData.rooms)) {
        return null;
    }
    
    return userData.rooms.find(room =>
        String(room.name).toLowerCase() === String(roomNumber).toLowerCase()
    );
};

// Get room ID by room number
export const getRoomIdByNumber = (roomNumber, userData) => {
    const found = findResidentByRoomNumber(roomNumber, userData);
    return found?.id || null;
};

// Get resident name by room number
export const getResidentNameByRoom = (roomNumber, userData) => {
    const found = findResidentByRoomNumber(roomNumber, userData);
    return found?.resident_name || "";
};

// Get all available room numbers from userData
export const getAvailableRoomNumbers = (userData) => {
    if (!userData?.rooms || !Array.isArray(userData.rooms)) {
        return [];
    }
    return userData.rooms.map(room => room.name);
};

// Format current date and time for logged_at field
export const getFormattedDateTime = () => {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

// Update completed names in localStorage
export const updateCompletedNames = (name, currentList) => {
    const trimmedName = name?.trim();
    if (trimmedName && !currentList.includes(trimmedName)) {
        const updated = [...currentList, trimmedName];
        localStorage.setItem("completedNames", JSON.stringify(updated));
        return updated;
    }
    return currentList;
};

// Prepare payload for API submission
export const prepareLogFormPayload = (values, roomId) => {
    const logged_at = getFormattedDateTime();
    
    const rawStringData = { 
        ...values,
        is_completed: 0,
        logged_at: logged_at
    };

    return {
        form_type: 2,
        room_id: roomId,
        data: JSON.stringify(rawStringData)
    };
};

// Fetch userData from localStorage
export const getUserDataFromStorage = () => {
    const userDatas = localStorage.getItem("userData");
    return userDatas ? JSON.parse(userDatas) : null;
};

// Fetch completed names from localStorage
export const getCompletedNamesFromStorage = () => {
    const stored = localStorage.getItem("completedNames");
    return stored ? JSON.parse(stored) : [];
};
