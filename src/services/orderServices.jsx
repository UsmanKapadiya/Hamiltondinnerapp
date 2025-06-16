import requests from "./api.js";

const OrderServices = {
 submitOrder: async (payload) => {
    console.log(payload)
    return requests.post(`/multi-order-update`,payload);
  },
  getMenuData: async(room_id, date) =>{
    console.log(date)
    return requests.post(`order-list?room_id=${room_id}&date=${date}&type=1`)
  }
}
export default OrderServices;
