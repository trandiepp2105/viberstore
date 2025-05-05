import Cookies from "js-cookie";
import userService from "../services/userService";

const isLogin = () => {
  // check if user is logged in
  const token = Cookies.get("access");
  if (token && token !== "undefined") {
    return true;
  }
  const refreshToken = Cookies.get("refresh");
  if (refreshToken && refreshToken !== "undefined") {
    // refresh token
    try {
      userService.refreshToken();
      return true;
    } catch (error) {
      console.error("Error while refreshing token", error);
      return false;
    }
  }
  return false;
};

export default isLogin;
