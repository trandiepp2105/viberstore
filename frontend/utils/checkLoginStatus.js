import Cookies from "js-cookie";
const isLogin = () => {
  // check if user is logged in
  const token = Cookies.get("access_token");
  if (token && token !== "undefined") {
    return true;
  }
  return false;
};

export default isLogin;
