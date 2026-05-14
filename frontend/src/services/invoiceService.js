import apiClient from "./apiClient";

const invoiceSurvice = {
  getTemporaryInvoice: async (listCartItemIds, couponId = 0) => {
    try {
      const response = await apiClient.post("/invoice/temporary-invoice", {
        cart_item_ids: listCartItemIds,
        coupon_id: couponId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
export default invoiceSurvice;
