import apiClient from "./apiClient";

const promotionServices = {
  getCoupons: async () => {
    try {
      const response = await apiClient.get("/coupons/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default promotionServices;
