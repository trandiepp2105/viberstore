import React, { useState, useContext, useEffect, useCallback } from "react";
import "./CartItem.scss";
import formatCurrencyVN from "../../utils/formatCurrencyVN";
import cartSurvice from "../../services/cartSurvice";
import AcceptancePopup from "../AcceptancePopup/AcceptancePopup";
import WaitingOverlay from "../WaitingOverlay/WaitingOverlay";
import { AppContext } from "../../App";
import WarningPopup from "../WarningPopup/WarningPopup";
// toastify
import { toast } from "react-toastify";

const CartItem = ({
  cartItem,
  fetchCart,
  isSelected,
  onItemSelectedChange,
}) => {
  const { setOnLoading, setIsShowWarningPopup } = useContext(AppContext);

  const [onAskingRemoveItem, setOnAskingRemoveItem] = useState(false);
  const handleDleteCartItem = async () => {
    setOnLoading(true);
    try {
      await cartSurvice.removeCartItem(cartItem.id);
      fetchCart();
      // Show success toast
      toast.success("Delete cart item success");
    } catch (error) {
      console.error("Error while deleting cart item", error);
      // Show error toast
      toast.error("Delete cart item failed");
    } finally {
      setOnLoading(false);
    }
  };

  const [productVariantGroup, setProductVariantGroup] = useState({
    colors: [],
    sizes: {},
    images: {},
  });
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isOpenVariantSelection, setIsOpenVariantSelection] = useState(false);
  const handleToggleVariantSelection = () => {
    setIsOpenVariantSelection((prev) => !prev);
  };
  const handleColorChange = (event, color) => {
    event.stopPropagation(); // Prevent the click event from bubbling up
    if (selectedColor?.id !== color.id) {
      setSelectedColor(color);

      // Automatically select the first size for the chosen color
      const firstSize = productVariantGroup.sizes[color.name]?.[0] || null;
      setSelectedSize(firstSize);
    }
  };

  const handleSizeChange = (event, size) => {
    event.stopPropagation(); // Prevent the click event from bubbling up
    if (selectedSize?.id !== size.id) {
      setSelectedSize(size);
    }
  };

  const changeSelectedVariant = () => {
    if (selectedColor && selectedSize) {
      const matchingVariant = cartItem.available_variants.find(
        (variant) =>
          variant.color === selectedColor.id && variant.size === selectedSize.id
      );
      if (matchingVariant) {
        console.log("Selected Variant:", matchingVariant);
        setSelectedVariant(matchingVariant);
        // Perform any additional logic with the selected variant
      } else {
        console.error(
          "No matching variant found for the selected color and size."
        );
      }
    }
  };

  useEffect(() => {
    if (cartItem.available_variants) {
      const updatedVariantGroup = { colors: [], sizes: {}, images: {} };

      cartItem.available_variants.forEach((variant) => {
        const { color_details, size_details, image_url } = variant;

        // Add color details if not already added
        if (
          !updatedVariantGroup.colors.some(
            (color) => color.id === color_details.id
          )
        ) {
          updatedVariantGroup.colors.push(color_details);
          updatedVariantGroup.sizes[color_details.name] = [];
          updatedVariantGroup.images[color_details.name] = image_url;
        }

        // Add size details for the color
        if (
          !updatedVariantGroup.sizes[color_details.name].some(
            (size) => size.id === size_details.id
          )
        ) {
          updatedVariantGroup.sizes[color_details.name].push(size_details);
        }
      });

      setProductVariantGroup(updatedVariantGroup);

      // Set selected color and size based on variant_details
      setSelectedColor(cartItem.variant_details.color_details);
      setSelectedSize(cartItem.variant_details.size_details);
      changeSelectedVariant();
    }
  }, [cartItem]);

  useEffect(() => {
    changeSelectedVariant();
  }, [selectedColor, selectedSize]);

  const handleChangeVariantOfCartItem = async () => {
    if (selectedVariant?.id === cartItem.variant_details.id) {
      return;
    }
    setOnLoading(true);
    try {
      await cartSurvice.changeVariantOfCartItem(
        cartItem.id,
        selectedVariant.id
      );
      fetchCart();
      // Show success toast
      toast.success("Change variant of cart item success");
    } catch (error) {
      console.error("Error while changing variant of cart item", error);
      // Show error toast
      toast.error("Change variant of cart item failed");
    } finally {
      setOnLoading(false);
    }
  };

  const handleIncreaseQuantity = async () => {
    if (cartItem.variant_details.stock <= cartItem.quantity) {
      toast.error("Out of stock");
      return;
    }
    setOnLoading(true);
    try {
      await cartSurvice.changeQuantityOfCartItem(
        cartItem.id,
        cartItem.quantity + 1
      );
      fetchCart();
      // Show success toast
      // toast.success("Increase quantity of cart item success");
    } catch (error) {
      console.error("Error while increasing quantity of cart item", error);
      // Show error toast
      toast.error("Increase quantity of cart item failed");
    } finally {
      setOnLoading(false);
    }
  };

  const handleDecreaseQuantity = async () => {
    if (cartItem.quantity === 1) {
      toast.error("Quantity must be at least 1");
      setOnAskingRemoveItem(true);
      return;
    }
    setOnLoading(true);
    try {
      await cartSurvice.changeQuantityOfCartItem(
        cartItem.id,
        cartItem.quantity - 1
      );
      fetchCart();
      // Show success toast
      // toast.success("Decrease quantity of cart item success");
    } catch (error) {
      console.error("Error while decreasing quantity of cart item", error);
      // Show error toast
      toast.error("Decrease quantity of cart item failed");
    } finally {
      setOnLoading(false);
    }
  };
  return (
    <div className="cart-item">
      {onAskingRemoveItem && (
        <AcceptancePopup
          handleClose={() => {
            setOnAskingRemoveItem(false);
          }}
          handleAccept={() => {
            handleDleteCartItem();
            setOnAskingRemoveItem(false);
          }}
        />
      )}
      <div className="block-product-info">
        <div className="left-side">
          <div className="custom-checkbox">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onItemSelectedChange}
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
          <div className="product-image">
            <img
              src={`${cartItem.variant_details.image_url}`}
              alt="variant"
              className="product-img"
            />
          </div>
        </div>

        <div className="right-side">
          <div className="product-variant-choose">
            <div className="product-name">
              {cartItem.variant_details.product_details.name ||
                "Máy tính xách tay Lenovo IdeaPad 3 14IAH8i5-12450H/16GB/512GB/14FHD/Win11_Xám_83EQ0005VN"}
            </div>

            {selectedVariant && (
              <button
                className="variant-choose"
                onClick={handleToggleVariantSelection}
              >
                Color: <p>{selectedVariant.color_details.name}</p>
                <span style={{}}></span>
                Size: <p>{selectedVariant.size_details.name}</p>{" "}
                <svg
                  fill="#504e4e"
                  width="15px"
                  height="15px"
                  viewBox="-6.5 0 32 32"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#504e4e"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <title>dropdown</title>{" "}
                    <path d="M18.813 11.406l-7.906 9.906c-0.75 0.906-1.906 0.906-2.625 0l-7.906-9.906c-0.75-0.938-0.375-1.656 0.781-1.656h16.875c1.188 0 1.531 0.719 0.781 1.656z" />{" "}
                  </g>
                </svg>
                {isOpenVariantSelection && (
                  <div className="variant-selection">
                    <div className="color-selection">
                      <p>Select Color:</p>
                      {productVariantGroup.colors.map((color) => (
                        <button
                          key={color.id}
                          className={`select-btn color-btn ${
                            selectedColor?.id === color.id ? "selected" : ""
                          }`}
                          onClick={(event) => handleColorChange(event, color)}
                        >
                          {color.name}
                          <svg
                            enable-background="new 0 0 12 12"
                            viewBox="0 0 12 12"
                            x="0"
                            y="0"
                            width={"10px"}
                            height={"10px"}
                            class="shopee-svg-icon icon-tick-bold"
                          >
                            <g>
                              <path d="m5.2 10.9c-.2 0-.5-.1-.7-.2l-4.2-3.7c-.4-.4-.5-1-.1-1.4s1-.5 1.4-.1l3.4 3 5.1-7c .3-.4 1-.5 1.4-.2s.5 1 .2 1.4l-5.7 7.9c-.2.2-.4.4-.7.4 0-.1 0-.1-.1-.1z"></path>
                            </g>
                          </svg>
                        </button>
                      ))}
                    </div>
                    <div className="size-selection">
                      <p>Select Size:</p>
                      {selectedColor &&
                        productVariantGroup.sizes[selectedColor.name]?.map(
                          (size) => (
                            <button
                              key={size.id}
                              className={`select-btn size-btn ${
                                selectedSize?.id === size.id ? "selected" : ""
                              }`}
                              onClick={(event) => handleSizeChange(event, size)}
                            >
                              {size.name}
                              <svg
                                enable-background="new 0 0 12 12"
                                viewBox="0 0 12 12"
                                x="0"
                                y="0"
                                width={"10px"}
                                height={"10px"}
                                // fill="#fff"
                                class="shopee-svg-icon icon-tick-bold"
                              >
                                <g>
                                  <path d="m5.2 10.9c-.2 0-.5-.1-.7-.2l-4.2-3.7c-.4-.4-.5-1-.1-1.4s1-.5 1.4-.1l3.4 3 5.1-7c .3-.4 1-.5 1.4-.2s.5 1 .2 1.4l-5.7 7.9c-.2.2-.4.4-.7.4 0-.1 0 -.1-.1-.1z"></path>
                                </g>
                              </svg>
                            </button>
                          )
                        )}
                    </div>
                    <div className="service">
                      <button
                        type="button"
                        className="service-btn back-btn"
                        onClick={handleToggleVariantSelection}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="service-btn confirm-btn"
                        onClick={handleChangeVariantOfCartItem}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </button>
            )}
          </div>
          <div className="product-price">
            {cartItem.variant_details.product_details.sale_price !== 0 &&
            cartItem.variant_details.product_details.sale_price !==
              cartItem.variant_details.product_details.price ? (
              <>
                {" "}
                <p className="price-sale">
                  {formatCurrencyVN(
                    cartItem.variant_details.product_details.sale_price
                  )}
                </p>
                <p className="price-through">
                  {formatCurrencyVN(
                    cartItem.variant_details.product_details.price
                  )}
                </p>{" "}
              </>
            ) : (
              <p className="price-sale">
                {formatCurrencyVN(
                  cartItem.variant_details.product_details.price
                )}
              </p>
            )}
          </div>
          <div className="wrapper-quantity-selector">
            <div className="quantity-selector">
              <button
                className={`quantity-btn descrease ${
                  cartItem.quantity === 1 ? "disabled" : ""
                }`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDecreaseQuantity(cartItem); // Pass cartItem as an argument
                }}
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
                    <path
                      d="M6 12L18 12"
                      stroke="#d1d5db"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                </svg>
              </button>
              <p className="quantity">{cartItem.quantity || 1}</p>
              <button
                className={`quantity-btn increase ${
                  cartItem.variant_details &&
                  cartItem.variant_details.stock <= cartItem.quantity
                    ? "disabled"
                    : ""
                }`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleIncreaseQuantity(cartItem); // Pass cartItem as an argument
                }}
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
                    <path
                      d="M4 12H20M12 4V20"
                      stroke="#d1d5db"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                </svg>
              </button>
            </div>
          </div>

          <button
            className="delete-selected-product"
            onClick={() => {
              setOnAskingRemoveItem(true);
            }}
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
