import apiClient from "./apiClient";

const cartSurvice = {
  getShoppingCart: async () => {
    try {
      const response = await apiClient.get("/cart/");
      return response.data;
    } catch (error) {
      console.error("Error while fetching categories", error);
      return;
    }
  },

  addProductToCart: async (quantity, variantId = NaN) => {
    try {
      const response = await apiClient.post("/cart/", {
        quantity: quantity,
        variant: variantId,
      });
      return response.data;
    } catch (error) {
      console.error("Error while adding product to cart", error);
      return;
    }
  },

  removeCartItem: async (cartItemId) => {
    try {
      const response = await apiClient.delete(`/cart/${cartItemId}/`);
      return response.data;
    } catch (error) {
      console.error("Error while removing cart item", error);
      return;
    }
  },

  removeCartItems: async (cartItemIds) => {
    try {
      const response = await apiClient.delete("/cart/bulk-delete/", {
        data: {
          cart_item_ids: cartItemIds,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error while removing cart item", error);
      return;
    }
  },

  getTemporaryInvoice: async (tempOrderInfor) => {
    try {
      const response = await apiClient.post("cart/temporary-invoice", {
        temp_order_infor: tempOrderInfor,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changeVariantOfCartItem: async (cartItemId, variantId) => {
    try {
      const response = await apiClient.patch(`/cart/${cartItemId}/`, {
        new_variant_id: variantId,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to change variant. Status: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error("Error while changing variant of cart item", error);
      throw error;
    }
  },

  changeQuantityOfCartItem: async (cartItemId, quantity) => {
    try {
      const response = await apiClient.put(`/cart/${cartItemId}/`, {
        quantity: quantity,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          `Failed to change quantity. Status: ${response.status}`
        );
      }
      return response.data;
    } catch (error) {
      console.error("Error while changing quantity of cart item", error);
      throw error;
    }
  },
};

export default cartSurvice;
