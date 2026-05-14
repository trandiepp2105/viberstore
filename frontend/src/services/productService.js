import apiClient from "./apiClient";

const productService = {
  getNewArrivalProducts: async (limit) => {
    try {
      const params = { latest: true };
      if (limit) {
        params.limit = limit;
      }

      const response = await apiClient.get(`/products/`, { params });
      return response.data;
    } catch (error) {
      console.error("Error while fetching new arrival products", error);
      return;
    }
  },

  getBestSellingProducts: async (limit) => {
    try {
      const response = await apiClient.get(
        `/products/best-sellers/${limit ? "?limit=" + limit : ""}`
      );
      return response.data;
    } catch (error) {
      console.error("Error while fetching best selling products", error);
      return;
    }
  },

  getProducts: async (params = {}) => {
    try {
      const response = await apiClient.get("/products/", { params });
      return response.data;
    } catch (error) {
      console.error("Error while fetching products", error);
      return;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching product by ID", error);
      return;
    }
  },

  getProductBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/products/${slug}/`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching product by slug", error);
      return;
    }
  },

  getProductSales: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}/sales`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching product sales", error);
      return;
    }
  },

  getProductVariantsBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/products/${slug}/variants/`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching product variants by slug", error);
      return;
    }
  },

  getProductCategories: async (slug) => {
    try {
      const response = await apiClient.get(`/products/${slug}/categories/`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching product categories", error);
      return;
    }
  },
};

export default productService;
