import apiClient from "./apiClient";
const categoryService = {
  getCategories: async () => {
    try {
      const response = await apiClient.get("/categories/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategory: async (categoryId) => {
    try {
      const response = await apiClient.get(`/categories/${categoryId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default categoryService;
