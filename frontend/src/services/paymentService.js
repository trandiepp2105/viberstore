import apiClient from "./apiClient";

const paymentService = {
  getPaymentMethods: async () => {
    try {
      const response = await apiClient.get("/payment-methods/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  processPayment: async (paymentData) => {
    console.log("paymentData", paymentData);
    try {
      const response = await apiClient.post("/process-payment/", paymentData);
      return response.data;
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error;
    }
  },
  async createPayment(data) {
    try {
      const response = await apiClient.post("order/payment", {
        order_type: "pay_ticket",
        order_id: 13,
        amount: 200000,
        order_desc: "Payment for ticket",
        bank_code: "VNBANK",
        language: "vn",
      });
      window.location.href = response.data.url;
      console.log("payment response", response);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default paymentService;
