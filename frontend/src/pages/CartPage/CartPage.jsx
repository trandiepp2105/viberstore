import React, { useState, useContext, useEffect } from "react";
import "./CartPage.scss";
import CartItem from "../../components/CartItem/CartItem";
import ProvisionalInvoice from "../../components/ProvisionalInvoice/ProvisionalInvoice";
import { AppContext } from "../../App";
import cartSurvice from "../../services/cartSurvice";
import AcceptancePopup from "../../components/AcceptancePopup/AcceptancePopup";
import { useNavigate } from "react-router-dom";
import formatCurrencyVN from "../../utils/formatCurrencyVN";
import { Link } from "react-router-dom";
import shippingInfoService from "../../services/shippingInfoService";

import { toast } from "react-toastify";
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService";
import promotionServices from "../../services/promotionServices";
import PaymentMethodItem from "../../components/PaymentMethodItem/PaymentMethodItem";
import DeliveryInfoModal from "../../components/DeliveryInfoModal/DeliveryInfoModal";

const CartPage = () => {
  const navigate = useNavigate();

  const { isUserLogin, shoppingCart, getShoppingCart, setOnLoading } =
    useContext(AppContext);
  const [orderStep, setOrderStep] = useState(1);
  const [temporaryInvoice, setTemporalInvoice] = useState(null);
  const [shippingInfos, setShippingInfos] = useState([]);
  const [selectedCartItems, setSelectedCartItems] = useState([]); // Store selected cart items
  const [onAskingDeleteCartItems, setOnAskingDeleteCartItems] = useState(false);
  const [selectedShippingInfo, setSelectedShippingInfo] = useState(null); // State to store selected shipping info
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [customerNote, setCustomerNote] = useState("");
  const handleFetchCoupons = async () => {
    try {
      const response = await promotionServices.getCoupons();
      console.log("Coupons", response);
      const filteredCoupons = response.filter(
        (coupon) =>
          coupon.type === "free shipping" ||
          coupon.type === "fixed" ||
          coupon.type === "percentage"
      );
      setCoupons(filteredCoupons);

      const selected = [];
      const firstFixed = filteredCoupons.find(
        (coupon) => coupon.type === "fixed"
      );
      const firstPercentage = filteredCoupons.find(
        (coupon) => coupon.type === "percentage"
      );

      if (filteredCoupons.some((coupon) => coupon.type === "free shipping")) {
        selected.push(
          filteredCoupons.find((coupon) => coupon.type === "free shipping")
        );
      }
      if (firstFixed) {
        selected.push(firstFixed);
      } else if (firstPercentage) {
        selected.push(firstPercentage);
      }

      setSelectedCoupons(selected);
    } catch (error) {
      console.error("Error while fetching coupons", error);
      toast.error("Failed to fetch coupons.");
    }
  };

  const handleSelectCoupon = (event, coupon) => {
    event.stopPropagation(); // Prevent the click event from bubbling up
    event.preventDefault(); // Prevent the default action of the event

    // Check if the coupon is already selected
    if (selectedCoupons.some((c) => c.id === coupon.id)) {
      // Deselect the coupon if it's already selected
      setSelectedCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      return;
    }

    // Handle selection logic based on coupon type
    if (coupon.type === "free shipping") {
      setSelectedCoupons((prev) => [
        ...prev.filter((c) => c.type !== "free shipping"),
        coupon,
      ]);
    } else if (coupon.type === "fixed") {
      setSelectedCoupons((prev) => [
        ...prev.filter((c) => c.type !== "fixed" && c.type !== "percentage"),
        coupon,
      ]);
    } else if (coupon.type === "percentage") {
      setSelectedCoupons((prev) => [
        ...prev.filter((c) => c.type !== "fixed" && c.type !== "percentage"),
        coupon,
      ]);
    }
  };

  const [isOpenAddShippingInfo, setIsOpenAddShippingInfo] = useState(false);
  const handleToggleAddShippingInfo = () => {
    setIsOpenAddShippingInfo((prev) => !prev);
  };
  const handleAddNewShippingInfo = async (shippingInfo) => {
    setOnLoading(true);
    try {
      const response = await shippingInfoService.addNewShippingInfo(
        shippingInfo
      );
      if (response) {
        // Show success toast
        toast.success("Add new shipping info success");
        fetchShippingInfos();
      }
      setOnLoading(false);
    } catch (error) {
      console.error("Error while adding new shipping info", error);
      // Show error toast
      toast.error("Add new shipping info failed");
      setOnLoading(false);
    }
  };

  const handleToggleAskingDeleteCartItems = () => {
    setOnAskingDeleteCartItems((prev) => !prev);
  };
  const handleDeleteCartItems = async () => {
    setOnLoading(true);
    try {
      const response = await cartSurvice.removeCartItems(
        selectedCartItems.map((item) => item.id)
      );
      if (response) {
        getShoppingCart();
        // Show success toast
        toast.success("Delete cart item success");
      }
      setSelectedCartItems([]); // Clear selected cart items after deletion
    } catch (error) {
      console.error("Error while deleting cart items", error);
      // Show error toast
      toast.error("Delete cart item failed");
    } finally {
      setOnLoading(false);
      handleToggleAskingDeleteCartItems();
    }
  };

  const fetchShippingInfos = async () => {
    console.log("fetchShippingInfos");
    try {
      const response = await shippingInfoService.getShippingInfo();
      console.log("Shipping Infos", response);
      setShippingInfos(response);
    } catch (error) {
      console.error("Error while fetching shipping infos", error);
    }
  };
  // const [shippingMethods, setShippingMethods] = useState([]);
  // const getShippingMethods = async () => {
  //   try {
  //     const response = await orderService.getShippingMethods();
  //     console.log("Shipping Methods", response);
  //     setShippingMethods(response);
  //   } catch (error) {
  //     console.error("Error while fetching shipping methods", error);
  //   }
  // };

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const handleSelectPaymentMethod = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
  };
  const getPaymentMethods = async () => {
    try {
      const response = await paymentService.getPaymentMethods();
      console.log("Payment Methods", response);
      setPaymentMethods(response);
      setSelectedPaymentMethod(response[0]); // Set the first payment method as default
    } catch (error) {
      console.error("Error while fetching payment methods", error);
    }
  };

  useEffect(() => {
    // Automatically set the default shipping info when shippingInfos changes
    const defaultShippingInfo = shippingInfos.find((info) => info.is_default);
    if (defaultShippingInfo) {
      setSelectedShippingInfo(defaultShippingInfo.id);
    }
  }, [shippingInfos]);

  const getTemporaryInvoice = async (selectedCartItems, selectedCoupons) => {
    const selectedItems = selectedCartItems.map((item) => item.id);
    const selectedCouponsIds = selectedCoupons.map((coupon) => coupon.id);
    if (selectedItems.length === 0) {
      return;
    }
    setOnLoading(true);
    try {
      const response = await orderService.createTemporaryOrder(
        selectedItems,
        selectedCouponsIds
      );
      setTemporalInvoice(response);
    } catch (error) {
      console.error("Error while fetching temporary invoice", error);
      setTemporalInvoice({});
    } finally {
      setOnLoading(false);
    }
  };

  const handleSelectItem = (cartItem) => {
    const newSelectedCartItems = selectedCartItems.some(
      (item) => item.id === cartItem.id
    )
      ? selectedCartItems.filter((item) => item.id !== cartItem.id) // Deselect item if already selected
      : [...selectedCartItems, cartItem]; // Select item if not already selected
    setSelectedCartItems(newSelectedCartItems);
  };

  const handleSelectAll = () => {
    const newSelectedCartItems =
      selectedCartItems.length === shoppingCart.length
        ? [] // Deselect all
        : [...shoppingCart]; // Select all
    setSelectedCartItems(newSelectedCartItems);
  };

  useEffect(() => {
    // Sync selectedCartItems with updated shoppingCart
    setSelectedCartItems((prevSelected) =>
      shoppingCart.filter((item) =>
        prevSelected.some((selected) => selected.id === item.id)
      )
    );
  }, [shoppingCart]);

  const handleSelectShippingInfo = (infoId) => {
    setSelectedShippingInfo(infoId); // Update selected shipping info
  };

  const backToCart = () => {
    setOrderStep(1);
  };

  const handleVerifyInvoice = async () => {
    if (selectedCartItems.length === 0) {
      toast.error("Please select at least one item to proceed.");
      return;
    }
    setOnLoading(true);
    try {
      const response = await orderService.createTemporaryOrder(
        selectedCartItems.map((item) => item.id),
        selectedCoupons.map((coupon) => coupon.id)
      );
      console.log("setTemporalInvoice", response);
      setTemporalInvoice(response);
      setOrderStep(2);
    } catch (error) {
      console.error("Error while fetching temporary invoice", error);
      setTemporalInvoice({});
    } finally {
      setOnLoading(false);
    }
  };

  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(null);
  const handleSelectDeliveryMethod = (method) => {
    setSelectedDeliveryMethod(method);
  };
  const getDeliveryMethods = async () => {
    try {
      const response = await orderService.getDeliveryMethods();
      console.log("Delivery Methods", response);
      setDeliveryMethods(response);
      setSelectedDeliveryMethod(response[0]); // Set the first delivery method as default
    } catch (error) {
      console.error("Error while fetching delivery methods", error);
    }
  };

  const handleCreateOrder = async () => {
    if (selectedCartItems.length === 0) {
      toast.error("Please select at least one item to create an order.");
      return;
    }

    if (!selectedShippingInfo) {
      toast.error("Please select or create a shipping info to proceed.");
      return;
    }
    var orderData = {};
    if (selectedDeliveryMethod?.code === "IN_STORE_PICKUP") {
      orderData = {
        cart_item_ids: selectedCartItems.map((item) => item.id),
        coupons: selectedCoupons.map((coupon) => coupon.id),
        payment_method: selectedPaymentMethod.id,
        customer_note: customerNote,
      };
    } else {
      orderData = {
        cart_item_ids: selectedCartItems.map((item) => item.id),
        coupons: selectedCoupons.map((coupon) => coupon.id),
        payment_method: selectedPaymentMethod.id,
        customer_note: customerNote,
        delivery_info: selectedShippingInfo,
      };
    }
    console.log("orderData", orderData);
    setOnLoading(true);
    try {
      const orderResponse = await orderService.createOrder(orderData);

      toast.success("Order created successfully!");
      getShoppingCart();
      setSelectedCartItems([]); // Clear selected cart items after order creation
      navigate("/account/order?type=Pending");
      if (orderResponse && orderResponse.vnpay_payment_url) {
        // Redirect to the payment page
        console.log(
          "Redirecting to payment URL:",
          orderResponse.vnpay_payment_url
        );
        window.location.href = orderResponse.vnpay_payment_url;
        // Redirect to the order details page or any other page
        // navigate(orderResponse.vnpay_payment_url);
      }
    } catch (error) {
      console.error("Error while creating order:", error);
      toast.error("Failed to create order.");
    } finally {
      setOnLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCartItems.length > 0) {
      getTemporaryInvoice(selectedCartItems, selectedCoupons);
    } else {
      setTemporalInvoice({});
    }
  }, [selectedCartItems, selectedCoupons]);

  useEffect(() => {
    if (orderStep === 2) {
      // getShippingMethods();
      getPaymentMethods();
      fetchShippingInfos();
      getDeliveryMethods();
    } else {
      setTimeout(1000); // Delay of 1 second
      if (!isUserLogin) {
        navigate("/");
      }
      getShoppingCart();
      handleFetchCoupons();
    }
  }, [orderStep]);

  return (
    <div className="page cart-page">
      {isOpenAddShippingInfo && (
        // <PopupCreate
        //   popupName="shipping info"
        //   initData={initCreateShippingInfo}
        //   handleSubmit={handleAddNewShippingInfo}
        //   handleToggle={handleToggleAddShippingInfo}
        // />
        <DeliveryInfoModal
          handleToggle={handleToggleAddShippingInfo}
          handleSubmit={handleAddNewShippingInfo}
        />
      )}
      {onAskingDeleteCartItems && (
        <AcceptancePopup
          handleClose={handleToggleAskingDeleteCartItems}
          handleAccept={handleDeleteCartItems}
          description="Are you sure you want to delete these items?"
        />
      )}
      <div className="cart-page__container">
        <div className="navigator">
          <Link className="navigator-item" to="/">
            Home
          </Link>
          <Link className="navigator-item" to="/cart">
            Cart
          </Link>
        </div>
        {orderStep === 1 && (
          <div className="search-description">
            <h1>Your cart</h1>
            <p className="subtxt">
              You have <strong>{shoppingCart?.length || 0} items</strong> in
              your cart
            </p>
          </div>
        )}

        {shoppingCart?.length > 0 && orderStep === 1 ? (
          <div className="cart-container">
            <div className="block-product">
              <div className="select-all">
                <div className="custom-checkbox">
                  <input
                    type="checkbox"
                    id="select-all-product"
                    checked={selectedCartItems.length === shoppingCart.length}
                    onChange={handleSelectAll} // Call handleSelectAll
                  />
                  <div className="checkbox-indicator">
                    <svg
                      width="15px"
                      height="15px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="check-icon"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0" />
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <g id="SVGRepo_iconCarrier">
                        <g id="Interface / Check">
                          <path
                            id="Vector"
                            d="M6 12L10.2426 16.2426L18.727 7.75732"
                            stroke="#ffffff"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </g>
                      </g>
                    </svg>
                  </div>
                </div>
                <button
                  className="delete-selected-product"
                  onClick={handleToggleAskingDeleteCartItems}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="var(--neutral-gray-5)"
                  >
                    <path
                      d="M8.5 4H11.5C11.5 3.17157 10.8284 2.5 10 2.5C9.17157 2.5 8.5 3.17157 8.5 4ZM7.5 4C7.5 2.61929 8.61929 1.5 10 1.5C11.3807 1.5 12.5 2.61929 12.5 4H17.5C17.7761 4 18 4.22386 18 4.5C18 4.77614 17.7761 5 17.5 5H16.4456L15.2521 15.3439C15.0774 16.8576 13.7957 18 12.2719 18H7.72813C6.20431 18 4.92256 16.8576 4.7479 15.3439L3.55437 5H2.5C2.22386 5 2 4.77614 2 4.5C2 4.22386 2.22386 4 2.5 4H7.5ZM5.74131 15.2292C5.85775 16.2384 6.71225 17 7.72813 17H12.2719C13.2878 17 14.1422 16.2384 14.2587 15.2292L15.439 5H4.56101L5.74131 15.2292ZM8.5 7.5C8.77614 7.5 9 7.72386 9 8V14C9 14.2761 8.77614 14.5 8.5 14.5C8.22386 14.5 8 14.2761 8 14V8C8 7.72386 8.22386 7.5 8.5 7.5ZM12 8C12 7.72386 11.7761 7.5 11.5 7.5C11.2239 7.5 11 7.72386 11 8V14C11 14.2761 11.2239 14.5 11.5 14.5C11.7761 14.5 12 14.2761 12 14V8Z"
                      fill="inherit"
                    ></path>
                  </svg>
                </button>
                {/* <label htmlFor="select-all-product">Select all</label> */}
              </div>
              <div className="list-cart-item">
                {shoppingCart.map((cartItem) => (
                  <CartItem
                    key={cartItem.id}
                    cartItem={cartItem}
                    fetchCart={getShoppingCart}
                    isSelected={selectedCartItems.some(
                      (item) => item.id === cartItem.id
                    )} // Check by ID
                    onItemSelectedChange={() => handleSelectItem(cartItem)} // Pass cartItem
                  />
                ))}
              </div>
            </div>
            <div className="block-price-calculation">
              <div className="block-gift">
                <div className="block-gift__title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="var(--neutral-gray-900)"
                  >
                    <path
                      d="M12 2C13.3807 2 14.5 3.11929 14.5 4.5C14.5 5.06324 14.3137 5.58297 13.9995 6.00097L16 6C16.5523 6 17 6.44772 17 7V10C17 10.5523 16.5523 11 16 11V15.5C16 16.8807 14.8807 18 13.5 18H6.5C5.11929 18 4 16.8807 4 15.5V11C3.44772 11 3 10.5523 3 10V7C3 6.44772 3.44772 6 4 6L6.00055 6.00097C5.68626 5.58297 5.5 5.06324 5.5 4.5C5.5 3.11929 6.61929 2 8 2C8.81839 2 9.54493 2.39323 10.001 3.00106C10.4551 2.39323 11.1816 2 12 2ZM9.5 11H5V15.5C5 16.3284 5.67157 17 6.5 17H9.5V11ZM15 11H10.5V17H13.5C14.3284 17 15 16.3284 15 15.5V11ZM9.5 7H4V10H9.5V7ZM16 7H10.5V10H16V7ZM12 3C11.1716 3 10.5 3.67157 10.5 4.5V6H12C12.8284 6 13.5 5.32843 13.5 4.5C13.5 3.67157 12.8284 3 12 3ZM8 3C7.17157 3 6.5 3.67157 6.5 4.5C6.5 5.2797 7.09489 5.92045 7.85554 5.99313L8 6H9.5V4.5L9.49313 4.35554C9.42045 3.59489 8.7797 3 8 3Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                  <p>Gift</p>
                </div>
                <p className="empty-gift">Xem quà (0)</p>
              </div>
              <ProvisionalInvoice
                // handleVerifyInvoice={handleVerifyInvoice}
                receipt={temporaryInvoice}
                handleVerifyInvoice={handleVerifyInvoice}
                coupons={coupons}
                selectedCoupons={selectedCoupons}
                handleSelectCoupon={handleSelectCoupon}
                selectedCartItems={selectedCartItems}
              />
            </div>
          </div>
        ) : (
          orderStep === 1 && (
            <div className="empty-cart-page">
              <div className="empty-cart-container">
                <div className="left-side">
                  <p className="title">There are no products in the cart.</p>
                  <p className="title-small">
                    Shop thousands of products at viberstore!
                  </p>
                  <Link to="/" className="back-to-home">
                    Shopping
                  </Link>
                </div>
                <div className="right-side">
                  <img src="/assets/images/empty_cart.png" alt="" />
                </div>
              </div>
            </div>
          )
        )}
        {orderStep === 2 && (
          <div className="verify-order">
            <div className="navigate-step">
              <button className="navigate-step-btn" onClick={backToCart}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="Chevron">
                    <path
                      id="Shape"
                      d="M12.2676 15.793C11.9677 16.0787 11.493 16.0672 11.2073 15.7672L6.20597 10.5168C5.93004 10.2271 5.93004 9.77187 6.20597 9.4822L11.2073 4.23173C11.493 3.93181 11.9677 3.92028 12.2676 4.20597C12.5676 4.49166 12.5791 4.96639 12.2934 5.26631L7.78483 9.99949L12.2934 14.7327C12.5791 15.0326 12.5676 15.5073 12.2676 15.793Z"
                      fill="#1250DC"
                    ></path>
                  </g>
                </svg>
                <p>Quay lại giỏ hàng</p>
              </button>
            </div>
            <div className="verify-order-inner">
              <div className="order-item-side">
                <div className="order-general-info">
                  <p className="product-quantity">Sản phẩm trong đơn (1)</p>
                  <div className="list-order-item">
                    {selectedCartItems.map((cartItem) => (
                      <div className="order-item">
                        <div className="order-item-inner">
                          <div className="order-item__image">
                            <img
                              src={`${cartItem.variant_details.image_url}`}
                              alt=""
                            />
                          </div>
                          <div className="order-item__info">
                            <div className="order-item__name">
                              <p className="product-name">
                                {cartItem.variant_details.product_details.name}
                              </p>
                              <p className="product-variant">
                                Color:{" "}
                                <p>
                                  {cartItem.variant_details.color_details.name}
                                </p>
                                <span style={{}}></span>
                                Size:{" "}
                                <p>
                                  {cartItem.variant_details.size_details.name}
                                </p>{" "}
                              </p>
                            </div>
                            <div className="order-item__price">
                              {cartItem.variant_details.product_details
                                .sale_price !== 0 &&
                              cartItem.variant_details.product_details
                                .sale_price !==
                                cartItem.variant_details.product_details
                                  .price ? (
                                <>
                                  <p className="product-price-sale">
                                    {formatCurrencyVN(
                                      cartItem.variant_details.product_details
                                        .sale_price
                                    )}
                                  </p>
                                  <p className="product-price-through">
                                    {formatCurrencyVN(
                                      cartItem.variant_details.product_details
                                        .price
                                    )}
                                  </p>
                                </>
                              ) : (
                                <p className="product-price-sale">
                                  {formatCurrencyVN(
                                    cartItem.variant_details.product_details
                                      .price
                                  )}
                                </p>
                              )}
                            </div>
                            <p className="order-item__quantity">
                              Quantity: <span>{cartItem.quantity}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="toggle-list-gift-modal">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      color="var(--iconOnSemanticYellowDefault)"
                    >
                      <path
                        d="M9.5 11V18H6.5C5.17452 18 4.08996 16.9685 4.00532 15.6644L4 15.5V11H9.5ZM16 11V15.5C16 16.8255 14.9685 17.91 13.6644 17.9947L13.5 18H10.5V11H16ZM12 2C13.3807 2 14.5 3.11929 14.5 4.5C14.5 5.06324 14.3137 5.58297 13.9995 6.00097L16 6C16.5523 6 17 6.44772 17 7V9C17 9.55228 16.5523 10 16 10H10.5V6H9.5V10H4C3.44772 10 3 9.55228 3 9V7C3 6.44772 3.44772 6 4 6L6.00055 6.00097C5.68626 5.58297 5.5 5.06324 5.5 4.5C5.5 3.11929 6.61929 2 8 2C8.81839 2 9.54493 2.39323 10.001 3.00106C10.4551 2.39323 11.1816 2 12 2ZM12 3C11.1716 3 10.5 3.67157 10.5 4.5V6H12C12.8284 6 13.5 5.32843 13.5 4.5C13.5 3.67157 12.8284 3 12 3ZM8 3C7.17157 3 6.5 3.67157 6.5 4.5C6.5 5.2797 7.09489 5.92045 7.85554 5.99313L8 6H9.5V4.5L9.49313 4.35554C9.42045 3.59489 8.7797 3 8 3Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    <p>8 quà tặng đơn hàng</p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M4.14645 1.14645C3.95118 1.34171 3.95118 1.65829 4.14645 1.85355L8.29289 6L4.14645 10.1464C3.95118 10.3417 3.95118 10.6583 4.14645 10.8536C4.34171 11.0488 4.65829 11.0488 4.85355 10.8536L9.35355 6.35355C9.54882 6.15829 9.54882 5.84171 9.35355 5.64645L4.85355 1.14645C4.65829 0.951184 4.34171 0.951184 4.14645 1.14645Z"
                        fill="#D97706"
                      ></path>
                    </svg>
                  </button>
                </div>

                <div className="address-form">
                  <p className="address-form__title">Order information</p>
                  <div className="delivery-methods">
                    <div className="select-delivery-method">
                      {deliveryMethods?.map((method) => (
                        <div
                          className={`delivery-method ${
                            selectedDeliveryMethod?.id === method.id
                              ? "selected"
                              : ""
                          }`}
                          key={method.id}
                          onClick={() => handleSelectDeliveryMethod(method)}
                        >
                          <div className="delivery-custom-ratio">
                            <span className="check-icon"></span>
                          </div>
                          <label htmlFor="delivery-method-label">
                            {method.name}
                          </label>
                        </div>
                      ))}
                      {/* <div className="delivery-method">
                        <input
                          type="radio"
                          name="delivery-method"
                          id="delivery-method-1"
                          value={1}
                          // checked={true}
                        />

                        <label htmlFor="delivery-method-1">Home delivery</label>
                      </div>
                      <div className="delivery-method select-delivery-method-2">
                        <input
                          type="radio"
                          name="delivery-method"
                          id="delivery-method-2"
                          value={2}
                          // disabled={true}
                        />
                        <label htmlFor="delivery-method-2">
                          In-Store Pickup
                        </label>
                      </div> */}
                    </div>

                    <div className="delivery-method-content">
                      {selectedDeliveryMethod?.code === "HOME_DELIVERY" && (
                        <div className="delivery-method-1">
                          <button
                            className="toggle-select-address-btn"
                            onClick={handleToggleAddShippingInfo}
                          >
                            <p>Add new shipping address</p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="21"
                              height="20"
                              viewBox="0 0 21 20"
                            >
                              <path
                                d="M7.8499 4.20694C8.14982 3.92125 8.62456 3.93279 8.91025 4.23271L13.9116 9.48318C14.1875 9.77285 14.1875 10.2281 13.9116 10.5178L8.91025 15.7682C8.62456 16.0681 8.14982 16.0797 7.8499 15.794C7.54998 15.5083 7.53844 15.0336 7.82413 14.7336L12.3327 10.0005L7.82413 5.26729C7.53844 4.96737 7.54998 4.49264 7.8499 4.20694Z"
                                fill=""
                              ></path>
                            </svg>
                          </button>
                        </div>
                      )}

                      <div className="block-write-note">
                        <p>Ghi chú yêu cầu</p>
                        <textarea
                          name="order-note"
                          id="order-note"
                          placeholder="Ghi chú (Ví dụ: Hãy gọi tôi khi chuẩn bị hàng xong)"
                          rows={3}
                          className="order-note"
                          value={customerNote}
                          onChange={(e) => setCustomerNote(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="technical-support-request">
                        {" "}
                        <div className="custom-checkbox">
                          <input
                            type="checkbox"
                            id="technical-support-request"
                          />
                          <div className="checkbox-indicator">
                            <svg
                              width="15px"
                              height="15px"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="check-icon"
                            >
                              <g id="SVGRepo_bgCarrier" stroke-width="0" />

                              <g
                                id="SVGRepo_tracerCarrier"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />

                              <g id="SVGRepo_iconCarrier">
                                {" "}
                                <g id="Interface / Check">
                                  {" "}
                                  <path
                                    id="Vector"
                                    d="M6 12L10.2426 16.2426L18.727 7.75732"
                                    stroke="#ffffff"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />{" "}
                                </g>{" "}
                              </g>
                            </svg>
                          </div>
                        </div>
                        <label htmlFor="technical-support-request">
                          Yêu cầ hỗ trợ kỹ thuật
                        </label>
                        <button
                          className="technical-support-request-discription"
                          title="Nếu bạn cần hỗ trợ kỹ thuật"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="var(--neutral-gray-5)"
                            class="cursor-pointer"
                          >
                            <path
                              d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3ZM10 13.5C10.4142 13.5 10.75 13.8358 10.75 14.25C10.75 14.6642 10.4142 15 10 15C9.58579 15 9.25 14.6642 9.25 14.25C9.25 13.8358 9.58579 13.5 10 13.5ZM10 5.5C11.3807 5.5 12.5 6.61929 12.5 8C12.5 8.72959 12.1848 9.40774 11.6513 9.8771L11.4967 10.0024L11.2782 10.1655L11.1906 10.2372C11.1348 10.2851 11.0835 10.3337 11.0346 10.3859C10.6963 10.7464 10.5 11.2422 10.5 12C10.5 12.2761 10.2761 12.5 10 12.5C9.72386 12.5 9.5 12.2761 9.5 12C9.5 10.988 9.79312 10.2475 10.3054 9.70162C10.4165 9.5832 10.532 9.47988 10.6609 9.37874L10.9076 9.19439L11.0256 9.09468C11.325 8.81435 11.5 8.42206 11.5 8C11.5 7.17157 10.8284 6.5 10 6.5C9.17157 6.5 8.5 7.17157 8.5 8C8.5 8.27614 8.27614 8.5 8 8.5C7.72386 8.5 7.5 8.27614 7.5 8C7.5 6.61929 8.61929 5.5 10 5.5Z"
                              fill="inherit"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedDeliveryMethod?.code === "HOME_DELIVERY" && (
                  <div className="user-info-item">
                    <div className="user-info-item-title">
                      <p>Delivery Infomation</p>
                    </div>
                    <div className="list-shipping-info">
                      {shippingInfos.map((info) => (
                        <div className="shipping-info-item" key={info.id}>
                          <div className="shipping-checkbox">
                            <input
                              type="radio"
                              name="shipping-info"
                              id={`shipping-info-${info.id}`}
                              checked={selectedShippingInfo === info.id}
                              onChange={() => handleSelectShippingInfo(info.id)} // Handle selection
                            />
                            <div className="checkbox-indicator">
                              <svg
                                width="15px"
                                height="15px"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="check-icon"
                              >
                                <g id="SVGRepo_bgCarrier" stroke-width="0" />
                                <g
                                  id="SVGRepo_tracerCarrier"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <g id="SVGRepo_iconCarrier">
                                  <g id="Interface / Check">
                                    <path
                                      id="Vector"
                                      d="M6 12L10.2426 16.2426L18.727 7.75732"
                                      stroke="#ffffff"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    />
                                  </g>
                                </g>
                              </svg>
                            </div>
                          </div>
                          <label
                            htmlFor={`shipping-info-${info.id}`}
                            className="info-inner"
                          >
                            <div className="subinfo-item">
                              <p className="title">Consignee</p>
                              <p className="value">{info?.recipient_name}</p>
                            </div>
                            <div className="subinfo-item">
                              <p className="title">Phone Number</p>
                              <p className="value">{info?.phone_number}</p>
                            </div>
                            <div className="subinfo-item">
                              <p className="title">Default</p>
                              <p className="value">
                                {info?.is_default ? "True" : "False"}
                              </p>
                            </div>
                            <div className="subinfo-item">
                              <p className="title">Province / City</p>
                              <p className="value">
                                {info?.province_city_details?.name}
                              </p>
                            </div>
                            <div className="subinfo-item">
                              <p className="title">District</p>
                              <p className="value">
                                {info?.district_details?.name}
                              </p>
                            </div>
                            <div className="subinfo-item">
                              <p className="title">Ward / Commune</p>
                              <p className="value">
                                {info?.ward_commune_details?.name}
                              </p>
                            </div>
                            <div className="subinfo-item">
                              <p className="title">Specific Address</p>
                              <p className="value">{info?.specific_address}</p>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="payment-methods">
                  <p className="payment-methods__title">Payment method</p>
                  <div className="list-payment-method">
                    {paymentMethods.map((method, index) => (
                      <PaymentMethodItem
                        paymentMethod={method}
                        key={index}
                        handleSelectPaymentMethod={handleSelectPaymentMethod}
                        isSelected={selectedPaymentMethod?.id === method.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="block-price-calculation">
                <ProvisionalInvoice
                  receipt={temporaryInvoice}
                  coupons={coupons}
                  selectedCoupons={selectedCoupons}
                  handleSelectCoupon={handleSelectCoupon}
                  selectedCartItems={selectedCartItems}
                  handleVerifyInvoice={handleCreateOrder}
                  mainButtonName="Order"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
