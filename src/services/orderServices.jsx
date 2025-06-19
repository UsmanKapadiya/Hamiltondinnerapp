import requests from "./api.js";

const OrderServices = {
  submitOrder: async (payload) => {
    return requests.post(`/multi-order-update`, payload);
  },
  updateGusetOrder: async(payload) => {
        return requests.post(`/update-order`, payload);
  },
  getMenuData: async (room_id, date) => {
    return requests.post(`order-list?room_id=${room_id}&date=${date}&type=1`)
  },
  guestOrderListData: async (payload) => {
    return requests.post(`guest-order-list`, payload)
  },      
  getReportList: async (date) => {
    return requests.post(`get-report-data?date=${date}`)
  },

  // Rooms Api's
  getRoomDetails: async (id) => {
    return requests.get(`${id}/get-room-details`)
  },
  updateRoomDetails: async (id,specialInstrucations,foodTexture) => {
       return requests.post(
        `${id}/update-room-details`,
        {
            special_instrucations: specialInstrucations,
            food_texture: foodTexture
        }
    );
  },

}
export default OrderServices;
