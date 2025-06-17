import requests from "./api.js";

const OrderServices = {
  submitOrder: async (payload) => {
    return requests.post(`/multi-order-update`, payload);
  },
  getMenuData: async (room_id, date) => {
    return requests.post(`order-list?room_id=${room_id}&date=${date}&type=1`)
  },
  getReportList: async (date) => {
    return requests.post(`get-report-data?date=${date}`)
  }
}
export default OrderServices;
