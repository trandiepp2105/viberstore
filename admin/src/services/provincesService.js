import axios from "axios";

const provincesApiClient = axios.create({
  baseURL: "https://provinces.open-api.vn/api/", // Thay bằng URL backend của bạn
  timeout: 10000, // Thời gian chờ
  headers: {
    "Content-Type": "application/json",
  },
});

const provincesService = {
  getProvinces: async () => {
    try {
      const response = await provincesApiClient.get("p");
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  getDistricts: async (provinceCode) => {
    try {
      const response = await provincesApiClient.get(
        `p/${provinceCode}?depth=2`
      );
      return response.data.districts;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  getWards: async (districtCode) => {
    try {
      const response = await provincesApiClient.get(
        `d/${districtCode}?depth=2`
      );
      return response.data.wards;
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

export default provincesService;
