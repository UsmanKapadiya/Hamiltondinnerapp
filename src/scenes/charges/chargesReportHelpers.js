export const getUniqueRoomNos = (data) => {
    const roomNos = [
        ...(data?.report_breakfast_list?.map(r => r.room_no) || []),
        ...(data?.report_lunch_list?.map(r => r.room_no) || []),
        ...(data?.report_dinner_list?.map(r => r.room_no) || []),
    ];

    return [...new Set(roomNos)];
};

export const getMealRow = (list, roomNo) => {
    return (
        list?.find(item => item.room_no === roomNo) || {
            data: {},
            option: {},
        }
    );
};
