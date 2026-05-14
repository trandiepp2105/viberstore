import apiAdmin from "./apiAdmin";
const userService = {
  login: async (loginData) => {
    try {
      await apiAdmin.post("/auth/login/", loginData);
      // setCookies(response.data.access, response.data.refresh);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 404 && data.detail === "User does not exist") {
          throw new Error("Tài khoản không tồn tại");
        } else if (status === 401 && data.detail === "Incorrect password") {
          throw new Error("Mật khẩu không đúng");
        }
      }
      throw new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    }
  },

  register: async (user) => {
    try {
      const response = await apiAdmin.post("/auth/register/", user);
      return response;
    } catch (error) {
      throw error;
    }
  },

  verifyEmail: async (email, otp) => {
    try {
      await apiAdmin.post("/auth/verify-email/", { email, otp });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiAdmin.post("/auth/logout/");
      return true;
    } catch (error) {
      console.error("Error while logging out", error);
      return false;
    }
  },

  refreshToken: async () => {
    try {
      await apiAdmin.post("/auth/refresh-token/");
    } catch (error) {
      throw error;
    }
  },

  sendResetPasswordEmail: async (email) => {
    try {
      await apiAdmin.post("/auth/reset-password/?step=1", { email });
    } catch (error) {
      throw error;
    }
  },

  verifyResetPasswordOTP: async (email, otp) => {
    try {
      await apiAdmin.post("/auth/reset-password/?step=2", { email, otp });
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (email, newPassword) => {
    try {
      await apiAdmin.post("/auth/reset-password/?step=3", {
        email: email,
        new_password: newPassword,
      });
    } catch (error) {
      throw error;
    }
  },

  // loginWithGoogle: async () => {
  //   try {
  //     await apiAdmin.post("/user/login/google", { tokenId });
  //   } catch (error) {
  //     throw error;
  //   }
  // },
};

export default userService;
