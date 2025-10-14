import requests from "./api.js";

/**
 * Authentication Services - API calls for user authentication
 */
const AuthServices = {
  /**
   * Login user with room number and password
   */
  login: async ({ roomNo, password }) => {
    if (!roomNo || !password) {
      throw new Error('Room number and password are required');
    }
    return requests.post(`/login?room_no=${roomNo}&password=${password}`);
  },
};

export default AuthServices;
