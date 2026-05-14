import React from "react";
import "./CartItem.scss";
import formatCurrencyVN from "../../utils/formatCurrencyVN";

const CartItem = ({ orderItem }) => {
  return (
    <div className="cart-item">
      <div className="block-product-info">
        <div className="left-side">
          <div className="product-image">
            <img
              src={`${orderItem.variant_image}`}
              alt="variant"
              className="product-img"
            />
          </div>
        </div>

        <div className="right-side">
          <div className="product-variant-choose">
            <div className="product-name">{orderItem.product_name}</div>

            {
              <div className="variant-choose">
                <button className="variant-choose-btn">
                  Color: <p>{orderItem?.color}</p>
                  {" - "} Size: <p>{orderItem?.size}</p>
                  <svg
                    width="64px"
                    height="64px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0" />

                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />

                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z"
                        fill="#000000"
                      />{" "}
                    </g>
                  </svg>
                </button>
              </div>
            }
          </div>
          <div className="product-price">
            {orderItem.sale_price_at_purchase !== null &&
            orderItem.price_at_purchase !== orderItem.sale_price_at_purchase ? (
              <>
                <p className="price-sale">
                  {formatCurrencyVN(orderItem.sale_price_at_purchase)}
                </p>
                <p className="price-through">
                  {formatCurrencyVN(orderItem.price_at_purchase)}
                </p>
              </>
            ) : (
              <p className="price-sale">
                {formatCurrencyVN(orderItem.price_at_purchase)}
              </p>
            )}
          </div>
          <div className="wrapper-quantity-selector">
            <div className="quantity-selector">
              <button
                className={`quantity-btn descrease ${"disabled"}`}
                // onClick={() => {
                //   if (cartItem.quantity === 1) return;
                //   adjustCartItemQuantity(cartItem.quantity - 1);
                // }}
              >
                <svg
                  width="15px"
                  height="15px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M6 12L18 12"
                      stroke="#d1d5db"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />{" "}
                  </g>
                </svg>
              </button>
              <p className="quantity">{orderItem.quantity}</p>
              <button
                className={`quantity-btn increase `}
                // className={`quantity-btn increase ${
                //   cartItem.variant &&
                //   cartItem.variant.stock <= cartItem.quantity
                //     ? "disabled"
                //     : ""
                // }`}
                // onClick={() => {
                //   adjustCartItemQuantity(cartItem.quantity + 1);
                // }}
              >
                <svg
                  width="15px"
                  height="15px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M4 12H20M12 4V20"
                      stroke="#d1d5db"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />{" "}
                  </g>
                </svg>
              </button>
            </div>
          </div>
          <button
            className="delete-selected-product"
            // onClick={() => {
            //   setOnAskingRemoveItem(true);
            // }}
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
        </div>
      </div>
    </div>
  );
};

export default CartItem;
