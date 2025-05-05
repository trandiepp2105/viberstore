import apiClient from "./apiClient";

const orderService = {
  getOrder: async (orderId) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrders: async (params) => {
    try {
      const response = await apiClient.get("/orders/", {
        params: {
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post("/orders/", orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/cancel/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteOrder: async (orderId) => {
    try {
      const response = await apiClient.delete(`/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  processOrder: async (orderId) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/process/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createTemporaryOrder: async (listCartItemIds, couponIds = []) => {
    try {
      const response = await apiClient.post("/orders/temporary/", {
        cart_item_ids: listCartItemIds,
        coupon_ids: couponIds,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getShippingMethods: async () => {
    try {
      const response = await apiClient.get("/shipping-methods/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDeliveryMethods: async () => {
    try {
      const response = await apiClient.get("/delivery-methods/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrderStatus: async () => {
    try {
      const response = await apiClient.get("/order-statuses/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getProvinces: async () => {
    try {
      const response = await apiClient.get("/provinces/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDistricts: async (provinceId) => {
    try {
      const response = await apiClient.get(
        `/provinces/${provinceId}/districts/`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getWards: async (districtId) => {
    try {
      const response = await apiClient.get(`/districts/${districtId}/wards/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
export default orderService;
