import apiClient from "./apiClient";

const storeService = {
  async getStores() {
    try {
      const response = await apiClient.get("/store/stores");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default storeService;
