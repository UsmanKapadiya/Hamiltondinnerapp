import requests from "./api.js";

/**
 * Order Services - API calls for order management
 */
const OrderServices = {
  /**
   * Submit multiple orders
   */
  submitOrder: async (payload) => {
    return requests.post(`/multi-order-update`, payload);
  },

  /**
   * Update guest order
   */
  updateGuestOrder: async (payload) => {
    return requests.post(`/update-order`, payload);
  },

  /**
   * Get menu data for a specific room and date
   * Note: roomId can be 0 for kitchen users
   */
  getMenuData: async (roomId, date) => {
    if (roomId === null || roomId === undefined || !date) {
      throw new Error('Room ID and date are required');
    }
    return requests.post(`order-list?room_id=${roomId}&date=${date}&type=1`);
  },

  /**
   * Get guest order list
   */
  getGuestOrderList: async (payload) => {
    return requests.post(`guest-order-list`, payload);
  },

  /**
   * Get report list for a specific date
   */
  getReportList: async (date) => {
    if (!date) {
      throw new Error('Date is required');
    }
    return requests.post(`get-report-data?date=${date}`);
  },

  // Room APIs
  /**
   * Get room details by ID
   */
  getRoomDetails: async (id) => {
    if (!id) {
      throw new Error('Room ID is required');
    }
    return requests.get(`${id}/get-room-details`);
  },

  /**
   * Update room details
   */
  updateRoomDetails: async (id, specialInstructions, foodTexture) => {
    if (!id) {
      throw new Error('Room ID is required');
    }
    return requests.post(
      `${id}/update-room-details`,
      {
        special_instrucations: specialInstructions,
        food_texture: foodTexture
      }
    );
  },

  // Reports APIs
  /**
   * Get charges report for a specific date
   */
  getCharges: async (date) => {
    if (!date) {
      throw new Error('Date is required');
    }
    return requests.post(`temp-get-charges-report?date=${date}`);
  },
};

export default OrderServices;
