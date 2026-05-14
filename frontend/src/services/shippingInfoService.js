import apiClient from "./apiClient";

const shippingInfoService = {
  getShippingInfo: async () => {
    try {
      const response = await apiClient.get("/delivery-addresses/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addNewShippingInfo: async (shippingInfo) => {
    try {
      const response = await apiClient.post(
        "/delivery-addresses/",
        shippingInfo
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateShippingInfo: async (shippingInfoId, shippingInfo) => {
    try {
      const response = await apiClient.put(
        `/delivery-addresses/${shippingInfoId}/`,
        shippingInfo
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteShippingInfo: async (shippingInfoId) => {
    try {
      const response = await apiClient.delete(
        `/delivery-addresses/${shippingInfoId}/`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  setDefaultShippingInfo: async (shippingInfoId) => {
    try {
      const response = await apiClient.post(
        `/delivery-addresses/${shippingInfoId}/set-default/`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
export default shippingInfoService;
