import { create } from "@mui/material/styles/createTransitions";
import apiAdmin from "./apiAdmin";
const supplierService = {
  getSuppliers: async () => {
    try {
      const response = await apiAdmin.get("/suppliers/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createSupplier: async (supplier) => {
    try {
      const response = await apiAdmin.post("/suppliers/", supplier);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default supplierService;
