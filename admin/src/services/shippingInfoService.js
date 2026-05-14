import apiAdmin from "./apiAdmin";
const shippingInfoService = {
  getShippingInfo: async (userID) => {
    try {
      const response = await apiAdmin.get(`/shipping_info/${userID}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createShippingInfo: async (shippingInfo) => {
    try {
      const response = await apiAdmin.post("/shipping-info/", shippingInfo);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateShippingInfo: async (shippingInfoID, shippingInfo) => {
    try {
      const response = await apiAdmin.put(
        `/shipping_info/${shippingInfoID}`,
        shippingInfo
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default shippingInfoService;
