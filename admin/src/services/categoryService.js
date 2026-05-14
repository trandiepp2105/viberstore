import apiAdmin from "./apiAdmin";
const categoryService = {
  getCategories: async (params = {}) => {
    try {
      const response = await apiAdmin.get("/categories/", {
        params: {
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategory: async (categoryId) => {
    try {
      const response = await apiAdmin.get(`/categories/${categoryId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createCategory: async (category) => {
    try {
      const response = await apiAdmin.post("/categories/", category);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateCategory: async (categoryId, category) => {
    try {
      const response = await apiAdmin.put(
        `/categories/${categoryId}/`,
        category
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteCategory: async (categoryId) => {
    try {
      const response = await apiAdmin.delete(`/categories/${categoryId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default categoryService;
