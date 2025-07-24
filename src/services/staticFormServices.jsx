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
  logFormUpdate: async (data) => {
    return requests.post(`/edit-form-phase1`, data);
  },
  getFormById: async (payload) => {
    return requests.post(`/form-details`, payload);
  },
  moveInSummerySubmit: async (payload) => {
    return requests.uploadPosts(`/general-form-submit-phase1`, payload);
  },
  moveInSummeryUpdate: async (data) => {
    return requests.uploadPosts(`/edit-form-phase1`, data);
  },


  getDefaultValue: async () => {
    return requests.get(`/get-move-in-summary-values`);
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
