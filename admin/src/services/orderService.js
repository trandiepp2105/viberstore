import apiAdmin from "./apiAdmin";
const orderService = {
  getOrders: async (params = {}) => {
    try {
      const response = await apiAdmin.get("/orders/", {
        params: {
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrder: async (orderId) => {
    try {
      const response = await apiAdmin.get(`/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createOrder: async (order) => {
    try {
      const response = await apiAdmin.post("/orders/", order);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateOrder: async (orderId, order) => {
    try {
      const response = await apiAdmin.put(`/orders/${orderId}/`, order);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const response = await apiAdmin.post(`/orders/${orderId}/cancel/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteOrder: async (orderId) => {
    try {
      const response = await apiAdmin.delete(`/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  processOrder: async (orderId) => {
    try {
      const response = await apiAdmin.post(`/orders/${orderId}/process/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getOrderStatuses: async () => {
    try {
      const response = await apiAdmin.get("/order-statuses/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  filterOrders: async (query) => {
    try {
      const response = await apiAdmin.get(`/orders/`, {
        params: query,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrderHistory: async (orderId) => {
    try {
      const response = await apiAdmin.get(`/orders/${orderId}/history/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default orderService;
