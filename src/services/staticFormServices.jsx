import requests from "./api.js";

const StaticFormServices = {
  getFormList: async (data) => {
    return requests.post(`/list-forms`, data);
  },
  deleteForm: async (data) => {
    return requests.post(`/delete-form`, data);
  },
  completeLog: async (data) => {
    return requests.post(`/complete-log`, data);
  },
  logFormSubmit: async (data) => {
    return requests.post(`/general-form-submit-phase1`, data);
  },

  getRoomList: async () => {
    return requests.get(`/rooms`);
  },
  getRoomDetails: async (id) => {
    return requests.get(`/rooms/${id}`);
  },
  createRoomDetails: async (formData) => {
    return requests.post(`/rooms`, formData);
  },
  updateRoomDetails: async (id, formData) => {
    // console.log("FormData", formData)
    return requests.put(`/rooms/${id}`, formData);
  },
  deleteRooms: async (id) => {
    return requests.delete(`/rooms/${id}`);
  },
  bulkdeleteRooms: async (data) => {
    return requests.delete(`/rooms/bulk-delete`, data);
  }
}
export default StaticFormServices;
