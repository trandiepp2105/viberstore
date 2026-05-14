import "./App.css";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import ProductPage from "./pages/ProductPage/ProductPage";
import OrderPage from "./pages/OrderPage/OrderPage";
import ProductDetailPage from "./pages/ProductDetailPage/ProductDetailPage";
import OrderDetailPage from "./pages/OrderDetailPage/OrderDetailPage";
import AddProductPage from "./pages/AddProductPage/AddProductPage";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import CategoryDetailPage from "./pages/CategoryDetailPage/CategoryDetailPage";
import UserPage from "./pages/UserPage/UserPage";
import UserInformationPage from "./pages/UserInformationPage/UserInformationPage";
import SaleManagePage from "./pages/SaleManagePage/SaleManagePage";
import CouponManagePage from "./pages/CouponManagePage/CouponManagePage";
import SaleDetailPage from "./pages/SaleDetailPage/SaleDetailPage";
import LoginPage from "./pages/LoginPage/LoginPage";

import { useRef, useEffect, useState, createContext } from "react";
import WaitingOverlay from "./components/WaitingOverlay/WaitingOverlay";
import isLogin from "./utils/checkLoginStatus";
import { ToastContainer } from "react-toastify";

export const AppContext = createContext();

function App() {
  const [onLoading, setOnLoading] = useState(false);
  const [isUserLogin, setIsUserLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loginStatus = await isLogin();
      setIsUserLogin(loginStatus);
      if (!loginStatus) {
        navigate("/login");
      }
    };
    checkLoginStatus();
  }, [location.pathname, navigate]);

  return (
    <AppContext.Provider
      value={{
        setOnLoading,
        isUserLogin,
        setIsUserLogin,
      }}
    >
      <div className="App">
        <ToastContainer />
        {onLoading && <WaitingOverlay />}
        <div className="full-screen-layout">
          <div className="wrapper-nav-bar">
            <NavBar />
          </div>
          <div className="main-content">
            <Routes>
              <Route path="/categories" element={<CategoryPage />} />
              <Route path="/categories/:id" element={<CategoryDetailPage />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/products/add" element={<AddProductPage />} />
              <Route path="/orders" element={<OrderPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/users" element={<UserPage />} />
              <Route path="/users/:id" element={<UserInformationPage />} />
              <Route path="/sales" element={<SaleManagePage />} />
              <Route path="/sales/:id" element={<SaleDetailPage />} />
              <Route path="/sales/:id/products" element={<SaleManagePage />} />
              <Route path="/coupons" element={<CouponManagePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<div></div>} />
            </Routes>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
