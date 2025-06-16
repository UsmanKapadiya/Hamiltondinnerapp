import requests from "./api.js";

const AuthServices = {
 login: async ({roomNo,password}) => {
    // console.log(formData)
    return requests.post(`/login?room_no=${roomNo}&password=${password}`);
  },
}
export default AuthServices;
