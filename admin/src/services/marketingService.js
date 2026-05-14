import apiAdmin from "./apiAdmin";

const marketingService = {
  getCoupons: async (params = {}) => {
    try {
      const response = await apiAdmin.get("/coupons/", {
        params: {
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createCoupon: async (coupon) => {
    try {
      const response = await apiAdmin.post("/coupons/", coupon);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteCoupon: async (couponId) => {
    try {
      const response = await apiAdmin.delete(`/coupons/${couponId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default marketingService;
