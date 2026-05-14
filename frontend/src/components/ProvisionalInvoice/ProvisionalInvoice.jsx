import React, { useEffect, useState } from "react";
import "./ProvisionalInvoice.scss";
import formatCurrencyVN from "../../utils/formatCurrencyVN";
// Toast
import { toast } from "react-toastify";
const ProvisionalInvoice = ({
  handleVerifyInvoice,
  receipt,
  activeButton = true,
  mainButtonName = "Confirm",
  deliveryFeeVisible = false,
  coupons,
  selectedCoupons,
  handleSelectCoupon,
  selectedCartItems,
}) => {
  const [showDiscountDetail, setShowDiscountDetail] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const handleToggleDiscountModal = () => {
    if (selectedCartItems.length === 0) {
      toast.error("Please select at least one item to apply the discount.");
      return;
    }

    if (showDiscountModal) {
      setTimeout(() => setShowDiscountModal(false), 100); // Thời gian trùng với animation
    } else {
      setShowDiscountModal(true);
    }
  };

  useEffect(() => {
    if (showDiscountModal) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      // Khôi phục lại sau khi đóng overlay
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    console.log("receipt: ", receipt);
  }, [receipt]);
  return (
    <>
      <div className="provisional-invoice">
        <div className="provisional-invoice-container">
          <div
            className="box-discount"
            onClick={(event) => {
              event.stopPropagation();
              handleToggleDiscountModal();
            }}
          >
            <div className="box-discount__title">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="var(--red-red-7)"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_21_9220)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.11702 17.6577C3.28369 17.6577 1.78369 16.1577 1.78369 14.3244V13.491C1.78369 12.991 2.20036 12.6577 2.61702 12.491C3.61702 12.1577 4.28369 11.241 4.28369 10.1577C4.28369 9.07438 3.61702 8.15771 2.61702 7.82438C2.20036 7.65771 1.78369 7.32438 1.78369 6.82438V5.99105C1.78369 4.15771 3.28369 2.65771 5.11702 2.65771H15.117C16.9504 2.65771 18.4504 4.15771 18.4504 5.99105V6.82438C18.4504 7.32438 18.0337 7.65771 17.617 7.82438C16.617 8.15771 15.9504 9.07438 15.9504 10.1577C15.9504 11.241 16.617 12.1577 17.617 12.491C18.0337 12.6577 18.4504 12.991 18.4504 13.491V14.3244C18.4504 16.1577 16.9504 17.6577 15.117 17.6577H5.11702ZM7.61702 8.49105C8.11702 8.49105 8.45036 8.15771 8.45036 7.65771C8.45036 7.15771 8.11702 6.82438 7.61702 6.82438C7.11702 6.82438 6.78369 7.15771 6.78369 7.65771C6.78369 8.15771 7.11702 8.49105 7.61702 8.49105ZM13.4504 12.6577C13.4504 13.1577 13.117 13.491 12.617 13.491C12.117 13.491 11.7837 13.1577 11.7837 12.6577C11.7837 12.1577 12.117 11.8244 12.617 11.8244C13.117 11.8244 13.4504 12.1577 13.4504 12.6577ZM13.0337 8.07438C13.2837 7.82438 13.2837 7.40771 13.0337 7.15771C12.7837 6.90771 12.367 6.90771 12.117 7.15771L7.11702 12.1577C6.86702 12.4077 6.86702 12.8244 7.11702 13.0744C7.36702 13.3244 7.78369 13.3244 8.03369 13.0744L13.0337 8.07438Z"
                    fill=""
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_21_9220">
                    <rect width="20" height="20" fill="white"></rect>
                  </clipPath>
                </defs>
              </svg>
              <p>Select or enter an offer</p>
            </div>
            <div className="box-discount__content">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="20"
                viewBox="0 0 21 20"
                fill="var(--neutral-gray-5)"
              >
                <path
                  d="M7.8499 4.20694C8.14982 3.92125 8.62456 3.93279 8.91025 4.23271L13.9116 9.48318C14.1875 9.77285 14.1875 10.2281 13.9116 10.5178L8.91025 15.7682C8.62456 16.0681 8.14982 16.0797 7.8499 15.794C7.54998 15.5083 7.53844 15.0336 7.82413 14.7336L12.3327 10.0005L7.82413 5.26729C7.53844 4.96737 7.54998 4.49264 7.8499 4.20694Z"
                  fill=""
                ></path>
              </svg>
            </div>
          </div>
          <div className="box-member-score">
            <label class="switch" htmlFor="switch">
              <input
                type="checkbox"
                id="switch"
                onChange={(event) => {
                  console.log("Checked status: ", event.target.checked); // In ra trạng thái checked
                }}
              />
              <span class="slider round"></span>
            </label>
            <svg
              width={20}
              height={20}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_5284_260519)">
                <path
                  d="M8 15.5545C12.4183 15.5545 16 12.0725 16 7.77723C16 3.48199 12.4183 0 8 0C3.58172 0 0 3.48199 0 7.77723C0 12.0725 3.58172 15.5545 8 15.5545Z"
                  fill="url(#paint0_linear_5284_260519)"
                />
                <path
                  d="M7.99958 14.2578C11.6814 14.2578 14.6662 11.3562 14.6662 7.77684C14.6662 4.19751 11.6814 1.2959 7.99958 1.2959C4.31774 1.2959 1.33301 4.19751 1.33301 7.77684C1.33301 11.3562 4.31774 14.2578 7.99958 14.2578Z"
                  fill="url(#paint1_linear_5284_260519)"
                />
                <path
                  opacity={0.5}
                  d="M7.99958 14.2578C11.6814 14.2578 14.6662 11.3562 14.6662 7.77684C14.6662 4.19751 11.6814 1.2959 7.99958 1.2959C4.31774 1.2959 1.33301 4.19751 1.33301 7.77684C1.33301 11.3562 4.31774 14.2578 7.99958 14.2578Z"
                  fill="url(#paint2_linear_5284_260519)"
                  style={{
                    mixBlendMode: "multiply",
                  }}
                />
                <g
                  opacity={0.7}
                  style={{
                    mixBlendMode: "overlay",
                  }}
                >
                  <path
                    d="M12.7755 3.2571C13.9452 4.42473 14.6671 6.01894 14.6671 7.77758C14.6671 11.3571 11.6823 14.2585 8.00055 14.2585C6.19125 14.2585 4.55166 13.557 3.35059 12.4195C4.56154 13.6283 6.25276 14.38 8.12576 14.38C11.8078 14.38 14.7923 11.4783 14.7923 7.89904C14.7923 6.07847 14.0191 4.43434 12.7757 3.25684L12.7755 3.2571Z"
                    fill="white"
                  />
                </g>
                <path
                  d="M1.7081 8.02074C1.7081 4.44124 4.69293 1.5398 8.37468 1.5398C9.65428 1.5398 10.849 1.89083 11.8639 2.4984C10.7735 1.74268 9.44065 1.29688 7.99958 1.29688C4.31756 1.29688 1.33301 4.19859 1.33301 7.77781C1.33301 10.1133 2.60437 12.1597 4.51033 13.3004C2.81471 12.1253 1.7081 10.1993 1.7081 8.021V8.02074Z"
                  fill="url(#paint3_linear_5284_260519)"
                  style={{
                    mixBlendMode: "multiply",
                  }}
                />
                <path
                  opacity={0.9}
                  d="M8.00005 8.38468C10.5516 8.38468 12.8766 7.89429 14.629 7.08972C14.2759 3.8335 11.4429 1.2959 8.00005 1.2959C4.5572 1.2959 1.72422 3.83376 1.37109 7.08998C3.12355 7.89456 5.4488 8.38468 8.00005 8.38468Z"
                  fill="url(#paint4_radial_5284_260519)"
                  style={{
                    mixBlendMode: "overlay",
                  }}
                />
                <path
                  opacity={0.9}
                  d="M14.2239 12.2945C14.6001 13.1332 13.2771 14.5034 11.269 15.3547C9.26066 16.206 7.3278 16.2162 6.95161 15.3774C6.57542 14.5387 7.89841 13.1684 9.90651 12.3171C11.9149 11.4659 13.8477 11.4554 14.2239 12.2945Z"
                  fill="url(#paint5_radial_5284_260519)"
                  style={{
                    mixBlendMode: "overlay",
                  }}
                />
                <path
                  opacity={0.9}
                  d="M3.21573 2.44536C3.86926 1.81056 4.40828 1.18457 4.75647 0.681641C3.0842 1.40266 1.7148 2.66399 0.880859 4.23844C1.43828 3.9803 2.31835 3.31747 3.21573 2.44536Z"
                  fill="url(#paint6_radial_5284_260519)"
                  style={{
                    mixBlendMode: "overlay",
                  }}
                />
                <path
                  d="M4.21514 11.4491C4.05917 11.3081 4.03665 11.2801 3.91309 11.1287C4.07372 10.5927 4.61247 10.1157 4.77448 9.58019C4.8684 9.27 4.95544 8.9574 5.06391 8.65201C5.25722 8.10744 5.64989 7.76762 6.22599 7.62961C6.38278 7.59223 6.54287 7.59384 6.70295 7.59384C7.7681 7.59437 8.87416 7.28498 9.94041 7.27697C9.95469 7.27697 9.97336 7.26683 9.98297 7.27697C10.1222 7.42299 10.1826 7.47558 10.2971 7.5965C10.2971 7.5965 10.2985 7.59437 10.2966 7.64989C10.2834 8.03109 10.1741 8.38427 9.95633 8.70193C9.63561 9.17042 9.1894 9.46273 8.62209 9.57458C8.50374 9.59781 8.38099 9.60822 8.2599 9.60929C7.82879 9.61329 7.3974 9.61142 6.96629 9.60982C6.92839 9.60982 6.91466 9.62157 6.90451 9.65573C6.81856 9.94697 6.73014 10.2374 6.64282 10.5281C6.54616 10.8493 6.34131 11.0895 6.05464 11.267C5.80394 11.4224 5.52715 11.5059 5.23306 11.5396C4.90602 11.5772 4.58419 11.5487 4.26676 11.4659C4.25056 11.4616 4.23491 11.4555 4.21486 11.4491H4.21514Z"
                  fill="url(#paint7_linear_5284_260519)"
                />
                <path
                  d="M12.3891 4.93166C12.3397 5.03871 12.2947 5.13695 12.2491 5.23492C12.12 5.51227 12.0014 5.7947 11.8597 6.06566C11.5739 6.61343 11.1189 6.95566 10.4953 7.07498C10.3909 7.095 10.2827 7.10355 10.1762 7.10381C8.66702 7.10568 7.15758 7.10515 5.64842 7.10515H5.60091C5.60091 7.05469 5.29529 6.83153 5.29886 6.78481C5.33593 6.28989 5.81702 6.02668 6.15312 5.65135C6.47165 5.29551 6.86926 5.06834 7.34458 4.97171C7.49396 4.94127 7.64553 4.93193 7.79793 4.93193C9.30984 4.93166 10.5754 4.61133 12.0874 4.61133C12.103 4.61133 12.3647 4.93166 12.3894 4.93166H12.3891Z"
                  fill="url(#paint8_linear_5284_260519)"
                />
                <path
                  d="M3.91266 11.1287C3.93902 11.0398 3.96401 10.9536 3.98982 10.8676C4.15046 10.3316 4.30999 9.7953 4.47201 9.2598C4.56592 8.94961 4.65296 8.63701 4.76143 8.33162C4.95474 7.78705 5.34741 7.44723 5.92351 7.30922C6.0803 7.27185 6.24039 7.27345 6.40047 7.27345C7.47963 7.27398 8.55905 7.27398 9.6382 7.27425C9.7387 7.27425 9.8392 7.27371 9.93971 7.27371C9.99517 7.27371 9.99572 7.27371 9.9938 7.32924C9.98062 7.71044 9.87133 8.06361 9.65358 8.38128C9.33286 8.84977 8.88664 9.14208 8.31933 9.25393C8.20098 9.27715 8.07824 9.28756 7.95714 9.28863C7.52603 9.29263 7.09465 9.29077 6.66353 9.28916C6.62564 9.28916 6.61191 9.30091 6.60175 9.33508C6.5158 9.62632 6.42738 9.91676 6.34006 10.2075C6.24341 10.5286 6.03856 10.7689 5.75188 10.9464C5.50118 11.1017 5.22439 11.1853 4.9303 11.2189C4.60326 11.2566 4.28144 11.228 3.96401 11.1452C3.94781 11.141 3.93215 11.1348 3.91211 11.1284L3.91266 11.1287Z"
                  fill="#FFF8AB"
                />
                <path
                  d="M12.0863 4.61133C12.0369 4.71837 11.9918 4.81661 11.9462 4.91458C11.8172 5.19194 11.6986 5.47437 11.5569 5.74532C11.271 6.29309 10.816 6.63532 10.1924 6.75465C10.0881 6.77467 9.97988 6.78321 9.87334 6.78348C8.36418 6.78534 6.85501 6.78481 5.34557 6.78481H5.29807C5.29807 6.73436 5.29505 6.68737 5.29862 6.64066C5.33569 6.14574 5.51417 5.70634 5.85028 5.33102C6.1688 4.97518 6.56641 4.748 7.04174 4.65137C7.19111 4.62094 7.34269 4.6116 7.49509 4.6116C9.007 4.61133 10.5189 4.6116 12.0308 4.6116C12.0465 4.6116 12.0618 4.6116 12.0866 4.6116L12.0863 4.61133Z"
                  fill="#FFF8AB"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_5284_260519"
                  x1={-2.22915}
                  y1={14.9071}
                  x2={19.4269}
                  y2={-1.06462}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#CDA837" />
                  <stop offset={0.2} stopColor="#F4BB19" />
                  <stop offset={0.35} stopColor="#FBE370" />
                  <stop offset={0.52} stopColor="#FED71A" />
                  <stop offset={0.82} stopColor="#DE9827" />
                  <stop offset={1} stopColor="#FCCF1A" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_5284_260519"
                  x1={-1.27233}
                  y1={14.2396}
                  x2={16.7743}
                  y2={0.929797}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FCCF1A" />
                  <stop offset={0.18} stopColor="#DE9827" />
                  <stop offset={0.48} stopColor="#FED71A" />
                  <stop offset={0.65} stopColor="#FBE370" />
                  <stop offset={0.8} stopColor="#F4BB19" />
                  <stop offset={1} stopColor="#CDA837" />
                </linearGradient>
                <linearGradient
                  id="paint2_linear_5284_260519"
                  x1={-1.42061}
                  y1={0.58929}
                  x2={13.927}
                  y2={12.98}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FBE370" stopOpacity={0} />
                  <stop offset={0.39} stopColor="#FAE26F" stopOpacity={0} />
                  <stop offset={0.53} stopColor="#F9E06D" stopOpacity={0.04} />
                  <stop offset={0.63} stopColor="#F6DD6A" stopOpacity={0.1} />
                  <stop offset={0.71} stopColor="#F2D865" stopOpacity={0.18} />
                  <stop offset={0.78} stopColor="#EDD15F" stopOpacity={0.29} />
                  <stop offset={0.84} stopColor="#E7CA57" stopOpacity={0.42} />
                  <stop offset={0.9} stopColor="#E0C04E" stopOpacity={0.58} />
                  <stop offset={0.95} stopColor="#D7B544" stopOpacity={0.76} />
                  <stop offset={0.99} stopColor="#CEAA38" stopOpacity={0.97} />
                  <stop offset={1} stopColor="#CDA837" />
                </linearGradient>
                <linearGradient
                  id="paint3_linear_5284_260519"
                  x1={-2.3567}
                  y1={12.5538}
                  x2={15.1993}
                  y2={-0.394039}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FCCF1A" />
                  <stop offset={0.18} stopColor="#DE9827" />
                  <stop offset={0.48} stopColor="#FED71A" />
                  <stop offset={0.65} stopColor="#FBE370" />
                  <stop offset={0.8} stopColor="#F4BB19" />
                  <stop offset={1} stopColor="#CDA837" />
                </linearGradient>
                <radialGradient
                  id="paint4_radial_5284_260519"
                  cx={0}
                  cy={0}
                  r={1}
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(8.00005 17.5188) scale(14.8753 14.4611)"
                >
                  <stop stopColor="white" />
                  <stop offset={1} stopColor="white" stopOpacity={0} />
                </radialGradient>
                <radialGradient
                  id="paint5_radial_5284_260519"
                  cx={0}
                  cy={0}
                  r={1}
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(10.5154 14.1033) rotate(-22.9728) scale(3.91664 1.63254)"
                >
                  <stop stopColor="white" />
                  <stop offset={0.88} stopColor="white" stopOpacity={0} />
                </radialGradient>
                <radialGradient
                  id="paint6_radial_5284_260519"
                  cx={0}
                  cy={0}
                  r={1}
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(2.48031 2.13168) rotate(-41.6154) scale(2.77513 0.857768)"
                >
                  <stop stopColor="white" />
                  <stop offset={1} stopColor="white" stopOpacity={0} />
                </radialGradient>
                <linearGradient
                  id="paint7_linear_5284_260519"
                  x1={9.01805}
                  y1={11.231}
                  x2={3.64708}
                  y2={5.70618}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FCCF1A" />
                  <stop offset={0.18} stopColor="#DE9827" />
                  <stop offset={0.48} stopColor="#FED71A" />
                  <stop offset={0.65} stopColor="#FBE370" />
                  <stop offset={0.8} stopColor="#F4BB19" />
                  <stop offset={1} stopColor="#CDA837" />
                </linearGradient>
                <linearGradient
                  id="paint8_linear_5284_260519"
                  x1={11.6164}
                  y1={8.55227}
                  x2={6.24546}
                  y2={3.02746}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FCCF1A" />
                  <stop offset={0.18} stopColor="#DE9827" />
                  <stop offset={0.48} stopColor="#FED71A" />
                  <stop offset={0.8} stopColor="#F4BB19" />
                  <stop offset={1} stopColor="#CDA837" />
                </linearGradient>
                <clipPath id="clip0_5284_260519">
                  <rect width={16} height={16} fill="white" />
                </clipPath>
              </defs>
            </svg>
            <div className="member-score">0 points exchanged (~0đ)</div>
            <button
              className="member-score-discription"
              title="Member score description"
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
          <div className="cart-info">
            <p className="cart-info__title">Order Information</p>
            <div className="block-price block-total-cart-price">
              <p>Total amount</p>
              <p className="total-price total-cart-price">
                {formatCurrencyVN(
                  receipt && receipt?.total_amount ? receipt.total_amount : 0
                )}
              </p>
            </div>
            <div className="block-price block-total-discount">
              <p>Discounted total</p>
              <p className="total-price total-discount">
                {formatCurrencyVN(
                  receipt && (receipt?.discount || receipt?.promotion)
                    ? receipt?.discount + receipt.promotion
                    : 0
                )}
              </p>
            </div>
            {showDiscountDetail && (
              <ul className="discount-detail">
                <li className="discount-item">
                  <p>Product discounts</p>
                  <p className="discount-value">
                    {formatCurrencyVN(
                      receipt && receipt?.promotion ? receipt.promotion : 0
                    )}
                  </p>
                </li>
                <li className="discount-item">
                  <p>Voucher</p>
                  <p className="discount-value">
                    {formatCurrencyVN(
                      receipt && receipt?.discount ? receipt.discount : 0
                    )}
                  </p>
                </li>
              </ul>
            )}

            {deliveryFeeVisible && (
              <div className="block-delivery-fee">
                <p>Delivery fee</p>
                <p>free</p>
              </div>
            )}

            <div className="block-final-price">
              <div className="first-line block-price">
                <p>Amount payable</p>
                <p className="total-price final-price">
                  {formatCurrencyVN(
                    receipt && receipt?.final_amount ? receipt.final_amount : 0
                  )}
                </p>
              </div>
              <div className="second-line block-price">
                <p>Number of points accumulated</p>
                <p className="member-score">
                  <svg
                    width={20}
                    height={20}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_5284_260519)">
                      <path
                        d="M8 15.5545C12.4183 15.5545 16 12.0725 16 7.77723C16 3.48199 12.4183 0 8 0C3.58172 0 0 3.48199 0 7.77723C0 12.0725 3.58172 15.5545 8 15.5545Z"
                        fill="url(#paint0_linear_5284_260519)"
                      />
                      <path
                        d="M7.99958 14.2578C11.6814 14.2578 14.6662 11.3562 14.6662 7.77684C14.6662 4.19751 11.6814 1.2959 7.99958 1.2959C4.31774 1.2959 1.33301 4.19751 1.33301 7.77684C1.33301 11.3562 4.31774 14.2578 7.99958 14.2578Z"
                        fill="url(#paint1_linear_5284_260519)"
                      />
                      <path
                        opacity={0.5}
                        d="M7.99958 14.2578C11.6814 14.2578 14.6662 11.3562 14.6662 7.77684C14.6662 4.19751 11.6814 1.2959 7.99958 1.2959C4.31774 1.2959 1.33301 4.19751 1.33301 7.77684C1.33301 11.3562 4.31774 14.2578 7.99958 14.2578Z"
                        fill="url(#paint2_linear_5284_260519)"
                        style={{
                          mixBlendMode: "multiply",
                        }}
                      />
                      <g
                        opacity={0.7}
                        style={{
                          mixBlendMode: "overlay",
                        }}
                      >
                        <path
                          d="M12.7755 3.2571C13.9452 4.42473 14.6671 6.01894 14.6671 7.77758C14.6671 11.3571 11.6823 14.2585 8.00055 14.2585C6.19125 14.2585 4.55166 13.557 3.35059 12.4195C4.56154 13.6283 6.25276 14.38 8.12576 14.38C11.8078 14.38 14.7923 11.4783 14.7923 7.89904C14.7923 6.07847 14.0191 4.43434 12.7757 3.25684L12.7755 3.2571Z"
                          fill="white"
                        />
                      </g>
                      <path
                        d="M1.7081 8.02074C1.7081 4.44124 4.69293 1.5398 8.37468 1.5398C9.65428 1.5398 10.849 1.89083 11.8639 2.4984C10.7735 1.74268 9.44065 1.29688 7.99958 1.29688C4.31756 1.29688 1.33301 4.19859 1.33301 7.77781C1.33301 10.1133 2.60437 12.1597 4.51033 13.3004C2.81471 12.1253 1.7081 10.1993 1.7081 8.021V8.02074Z"
                        fill="url(#paint3_linear_5284_260519)"
                        style={{
                          mixBlendMode: "multiply",
                        }}
                      />
                      <path
                        opacity={0.9}
                        d="M8.00005 8.38468C10.5516 8.38468 12.8766 7.89429 14.629 7.08972C14.2759 3.8335 11.4429 1.2959 8.00005 1.2959C4.5572 1.2959 1.72422 3.83376 1.37109 7.08998C3.12355 7.89456 5.4488 8.38468 8.00005 8.38468Z"
                        fill="url(#paint4_radial_5284_260519)"
                        style={{
                          mixBlendMode: "overlay",
                        }}
                      />
                      <path
                        opacity={0.9}
                        d="M14.2239 12.2945C14.6001 13.1332 13.2771 14.5034 11.269 15.3547C9.26066 16.206 7.3278 16.2162 6.95161 15.3774C6.57542 14.5387 7.89841 13.1684 9.90651 12.3171C11.9149 11.4659 13.8477 11.4554 14.2239 12.2945Z"
                        fill="url(#paint5_radial_5284_260519)"
                        style={{
                          mixBlendMode: "overlay",
                        }}
                      />
                      <path
                        opacity={0.9}
                        d="M3.21573 2.44536C3.86926 1.81056 4.40828 1.18457 4.75647 0.681641C3.0842 1.40266 1.7148 2.66399 0.880859 4.23844C1.43828 3.9803 2.31835 3.31747 3.21573 2.44536Z"
                        fill="url(#paint6_radial_5284_260519)"
                        style={{
                          mixBlendMode: "overlay",
                        }}
                      />
                      <path
                        d="M4.21514 11.4491C4.05917 11.3081 4.03665 11.2801 3.91309 11.1287C4.07372 10.5927 4.61247 10.1157 4.77448 9.58019C4.8684 9.27 4.95544 8.9574 5.06391 8.65201C5.25722 8.10744 5.64989 7.76762 6.22599 7.62961C6.38278 7.59223 6.54287 7.59384 6.70295 7.59384C7.7681 7.59437 8.87416 7.28498 9.94041 7.27697C9.95469 7.27697 9.97336 7.26683 9.98297 7.27697C10.1222 7.42299 10.1826 7.47558 10.2971 7.5965C10.2971 7.5965 10.2985 7.59437 10.2966 7.64989C10.2834 8.03109 10.1741 8.38427 9.95633 8.70193C9.63561 9.17042 9.1894 9.46273 8.62209 9.57458C8.50374 9.59781 8.38099 9.60822 8.2599 9.60929C7.82879 9.61329 7.3974 9.61142 6.96629 9.60982C6.92839 9.60982 6.91466 9.62157 6.90451 9.65573C6.81856 9.94697 6.73014 10.2374 6.64282 10.5281C6.54616 10.8493 6.34131 11.0895 6.05464 11.267C5.80394 11.4224 5.52715 11.5059 5.23306 11.5396C4.90602 11.5772 4.58419 11.5487 4.26676 11.4659C4.25056 11.4616 4.23491 11.4555 4.21486 11.4491H4.21514Z"
                        fill="url(#paint7_linear_5284_260519)"
                      />
                      <path
                        d="M12.3891 4.93166C12.3397 5.03871 12.2947 5.13695 12.2491 5.23492C12.12 5.51227 12.0014 5.7947 11.8597 6.06566C11.5739 6.61343 11.1189 6.95566 10.4953 7.07498C10.3909 7.095 10.2827 7.10355 10.1762 7.10381C8.66702 7.10568 7.15758 7.10515 5.64842 7.10515H5.60091C5.60091 7.05469 5.29529 6.83153 5.29886 6.78481C5.33593 6.28989 5.81702 6.02668 6.15312 5.65135C6.47165 5.29551 6.86926 5.06834 7.34458 4.97171C7.49396 4.94127 7.64553 4.93193 7.79793 4.93193C9.30984 4.93166 10.5754 4.61133 12.0874 4.61133C12.103 4.61133 12.3647 4.93166 12.3894 4.93166H12.3891Z"
                        fill="url(#paint8_linear_5284_260519)"
                      />
                      <path
                        d="M3.91266 11.1287C3.93902 11.0398 3.96401 10.9536 3.98982 10.8676C4.15046 10.3316 4.30999 9.7953 4.47201 9.2598C4.56592 8.94961 4.65296 8.63701 4.76143 8.33162C4.95474 7.78705 5.34741 7.44723 5.92351 7.30922C6.0803 7.27185 6.24039 7.27345 6.40047 7.27345C7.47963 7.27398 8.55905 7.27398 9.6382 7.27425C9.7387 7.27425 9.8392 7.27371 9.93971 7.27371C9.99517 7.27371 9.99572 7.27371 9.9938 7.32924C9.98062 7.71044 9.87133 8.06361 9.65358 8.38128C9.33286 8.84977 8.88664 9.14208 8.31933 9.25393C8.20098 9.27715 8.07824 9.28756 7.95714 9.28863C7.52603 9.29263 7.09465 9.29077 6.66353 9.28916C6.62564 9.28916 6.61191 9.30091 6.60175 9.33508C6.5158 9.62632 6.42738 9.91676 6.34006 10.2075C6.24341 10.5286 6.03856 10.7689 5.75188 10.9464C5.50118 11.1017 5.22439 11.1853 4.9303 11.2189C4.60326 11.2566 4.28144 11.228 3.96401 11.1452C3.94781 11.141 3.93215 11.1348 3.91211 11.1284L3.91266 11.1287Z"
                        fill="#FFF8AB"
                      />
                      <path
                        d="M12.0863 4.61133C12.0369 4.71837 11.9918 4.81661 11.9462 4.91458C11.8172 5.19194 11.6986 5.47437 11.5569 5.74532C11.271 6.29309 10.816 6.63532 10.1924 6.75465C10.0881 6.77467 9.97988 6.78321 9.87334 6.78348C8.36418 6.78534 6.85501 6.78481 5.34557 6.78481H5.29807C5.29807 6.73436 5.29505 6.68737 5.29862 6.64066C5.33569 6.14574 5.51417 5.70634 5.85028 5.33102C6.1688 4.97518 6.56641 4.748 7.04174 4.65137C7.19111 4.62094 7.34269 4.6116 7.49509 4.6116C9.007 4.61133 10.5189 4.6116 12.0308 4.6116C12.0465 4.6116 12.0618 4.6116 12.0866 4.6116L12.0863 4.61133Z"
                        fill="#FFF8AB"
                      />
                    </g>
                    <defs>
                      <linearGradient
                        id="paint0_linear_5284_260519"
                        x1={-2.22915}
                        y1={14.9071}
                        x2={19.4269}
                        y2={-1.06462}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#CDA837" />
                        <stop offset={0.2} stopColor="#F4BB19" />
                        <stop offset={0.35} stopColor="#FBE370" />
                        <stop offset={0.52} stopColor="#FED71A" />
                        <stop offset={0.82} stopColor="#DE9827" />
                        <stop offset={1} stopColor="#FCCF1A" />
                      </linearGradient>
                      <linearGradient
                        id="paint1_linear_5284_260519"
                        x1={-1.27233}
                        y1={14.2396}
                        x2={16.7743}
                        y2={0.929797}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FCCF1A" />
                        <stop offset={0.18} stopColor="#DE9827" />
                        <stop offset={0.48} stopColor="#FED71A" />
                        <stop offset={0.65} stopColor="#FBE370" />
                        <stop offset={0.8} stopColor="#F4BB19" />
                        <stop offset={1} stopColor="#CDA837" />
                      </linearGradient>
                      <linearGradient
                        id="paint2_linear_5284_260519"
                        x1={-1.42061}
                        y1={0.58929}
                        x2={13.927}
                        y2={12.98}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FBE370" stopOpacity={0} />
                        <stop
                          offset={0.39}
                          stopColor="#FAE26F"
                          stopOpacity={0}
                        />
                        <stop
                          offset={0.53}
                          stopColor="#F9E06D"
                          stopOpacity={0.04}
                        />
                        <stop
                          offset={0.63}
                          stopColor="#F6DD6A"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset={0.71}
                          stopColor="#F2D865"
                          stopOpacity={0.18}
                        />
                        <stop
                          offset={0.78}
                          stopColor="#EDD15F"
                          stopOpacity={0.29}
                        />
                        <stop
                          offset={0.84}
                          stopColor="#E7CA57"
                          stopOpacity={0.42}
                        />
                        <stop
                          offset={0.9}
                          stopColor="#E0C04E"
                          stopOpacity={0.58}
                        />
                        <stop
                          offset={0.95}
                          stopColor="#D7B544"
                          stopOpacity={0.76}
                        />
                        <stop
                          offset={0.99}
                          stopColor="#CEAA38"
                          stopOpacity={0.97}
                        />
                        <stop offset={1} stopColor="#CDA837" />
                      </linearGradient>
                      <linearGradient
                        id="paint3_linear_5284_260519"
                        x1={-2.3567}
                        y1={12.5538}
                        x2={15.1993}
                        y2={-0.394039}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FCCF1A" />
                        <stop offset={0.18} stopColor="#DE9827" />
                        <stop offset={0.48} stopColor="#FED71A" />
                        <stop offset={0.65} stopColor="#FBE370" />
                        <stop offset={0.8} stopColor="#F4BB19" />
                        <stop offset={1} stopColor="#CDA837" />
                      </linearGradient>
                      <radialGradient
                        id="paint4_radial_5284_260519"
                        cx={0}
                        cy={0}
                        r={1}
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(8.00005 17.5188) scale(14.8753 14.4611)"
                      >
                        <stop stopColor="white" />
                        <stop offset={1} stopColor="white" stopOpacity={0} />
                      </radialGradient>
                      <radialGradient
                        id="paint5_radial_5284_260519"
                        cx={0}
                        cy={0}
                        r={1}
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(10.5154 14.1033) rotate(-22.9728) scale(3.91664 1.63254)"
                      >
                        <stop stopColor="white" />
                        <stop offset={0.88} stopColor="white" stopOpacity={0} />
                      </radialGradient>
                      <radialGradient
                        id="paint6_radial_5284_260519"
                        cx={0}
                        cy={0}
                        r={1}
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(2.48031 2.13168) rotate(-41.6154) scale(2.77513 0.857768)"
                      >
                        <stop stopColor="white" />
                        <stop offset={1} stopColor="white" stopOpacity={0} />
                      </radialGradient>
                      <linearGradient
                        id="paint7_linear_5284_260519"
                        x1={9.01805}
                        y1={11.231}
                        x2={3.64708}
                        y2={5.70618}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FCCF1A" />
                        <stop offset={0.18} stopColor="#DE9827" />
                        <stop offset={0.48} stopColor="#FED71A" />
                        <stop offset={0.65} stopColor="#FBE370" />
                        <stop offset={0.8} stopColor="#F4BB19" />
                        <stop offset={1} stopColor="#CDA837" />
                      </linearGradient>
                      <linearGradient
                        id="paint8_linear_5284_260519"
                        x1={11.6164}
                        y1={8.55227}
                        x2={6.24546}
                        y2={3.02746}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FCCF1A" />
                        <stop offset={0.18} stopColor="#DE9827" />
                        <stop offset={0.48} stopColor="#FED71A" />
                        <stop offset={0.8} stopColor="#F4BB19" />
                        <stop offset={1} stopColor="#CDA837" />
                      </linearGradient>
                      <clipPath id="clip0_5284_260519">
                        <rect width={16} height={16} fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <p>+ 0</p>
                </p>
              </div>
            </div>
            <button
              className="invoice-detail-button"
              onClick={() => setShowDiscountDetail(!showDiscountDetail)}
            >
              Detail
              <svg
                width="16"
                height="17"
                viewBox="0 0 16 17"
                xmlns="http://www.w3.org/2000/svg"
                fill="var(--textOnWhiteHyperLink)"
              >
                <path
                  d="M3.20041 6.40641C3.48226 6.10288 3.95681 6.0853 4.26034 6.36716L8 9.89327L11.7397 6.36716C12.0432 6.0853 12.5177 6.10288 12.7996 6.40641C13.0815 6.70995 13.0639 7.18449 12.7603 7.46635L8.51034 11.4663C8.22258 11.7336 7.77743 11.7336 7.48967 11.4663L3.23966 7.46635C2.93613 7.18449 2.91856 6.70995 3.20041 6.40641Z"
                  fill="inherit"
                ></path>
              </svg>
            </button>
            <button
              className={`verify-invoice-button ${
                !activeButton ? "verify-btn-inactive" : ""
              }`}
              onClick={activeButton ? handleVerifyInvoice : null}
            >
              {mainButtonName}
            </button>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="403"
          height="28"
          viewBox="0 0 403 28"
          fill="none"
          className="footer-invoice"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 0H403V18.8171C403 21.7846 403 23.2683 402.487 24.4282C401.883 25.7925 400.792 26.8829 399.428 27.4867C398.268 28 396.785 28 393.817 28C391.534 28 390.392 28 389.652 27.808C388.208 27.4337 388.419 27.5431 387.28 26.579C386.696 26.0846 385.116 23.845 381.954 19.3656C379.649 16.0988 376.065 14 372.04 14C367.06 14 362.756 17.2133 360.712 21.8764C359.949 23.6168 359.568 24.487 359.531 24.5647C358.192 27.3971 357.411 27.9078 354.279 27.9975C354.193 28 353.845 28 353.15 28C352.454 28 352.107 28 352.021 27.9975C348.889 27.9078 348.107 27.3971 346.768 24.5647C346.731 24.487 346.35 23.6168 345.587 21.8765C343.544 17.2133 339.239 14 334.259 14C329.279 14 324.974 17.2133 322.931 21.8764C322.168 23.6168 321.787 24.487 321.75 24.5647C320.411 27.3971 319.629 27.9078 316.498 27.9975C316.412 28 316.064 28 315.368 28C314.673 28 314.325 28 314.239 27.9975C311.108 27.9078 310.326 27.3971 308.987 24.5647C308.95 24.487 308.569 23.6168 307.806 21.8765C305.763 17.2133 301.458 14 296.478 14C291.498 14 287.193 17.2133 285.15 21.8764C284.387 23.6168 284.005 24.487 283.969 24.5647C282.63 27.3971 281.848 27.9078 278.716 27.9975C278.63 28 278.283 28 277.587 28C276.892 28 276.544 28 276.458 27.9975C273.326 27.9078 272.545 27.3971 271.206 24.5647C271.169 24.487 270.788 23.6168 270.025 21.8765C267.981 17.2133 263.677 14 258.697 14C253.717 14 249.412 17.2133 247.368 21.8764C246.606 23.6168 246.224 24.487 246.188 24.5647C244.848 27.3971 244.067 27.9078 240.935 27.9975C240.849 28 240.501 28 239.806 28C239.111 28 238.763 28 238.677 27.9975C235.545 27.9078 234.764 27.3971 233.424 24.5647C233.388 24.487 233.006 23.6168 232.244 21.8765C230.2 17.2133 225.895 14 220.915 14C215.935 14 211.631 17.2133 209.587 21.8764C208.824 23.6168 208.443 24.487 208.406 24.5647C207.067 27.3971 206.286 27.9078 203.154 27.9975C203.068 28 202.72 28 202.025 28C201.329 28 200.982 28 200.896 27.9975C197.764 27.9078 196.982 27.3971 195.643 24.5647C195.606 24.487 195.225 23.6168 194.462 21.8765C192.419 17.2133 188.114 14 183.134 14C178.154 14 173.849 17.2133 171.806 21.8764C171.043 23.6168 170.662 24.487 170.625 24.5647C169.286 27.3971 168.504 27.9078 165.373 27.9975C165.287 28 164.939 28 164.243 28C163.548 28 163.2 28 163.114 27.9975C159.983 27.9078 159.201 27.3971 157.862 24.5647C157.825 24.487 157.444 23.6168 156.681 21.8765C154.638 17.2133 150.333 14 145.353 14C140.373 14 136.068 17.2133 134.025 21.8764C133.262 23.6168 132.881 24.487 132.844 24.5647C131.505 27.3971 130.723 27.9078 127.591 27.9975C127.505 28 127.158 28 126.462 28C125.767 28 125.419 28 125.333 27.9975C122.201 27.9078 121.42 27.3971 120.081 24.5647C120.044 24.487 119.663 23.6168 118.9 21.8764C116.856 17.2133 112.552 14 107.572 14C102.592 14 98.2868 17.2133 96.2433 21.8764C95.4806 23.6168 95.0993 24.487 95.0625 24.5647C93.7233 27.3971 92.9418 27.9078 89.8101 27.9975C89.7242 28 89.3765 28 88.681 28C87.9855 28 87.6378 28 87.5519 27.9975C84.4201 27.9078 83.6386 27.3971 82.2994 24.5647C82.2627 24.487 81.8814 23.6168 81.1187 21.8764C79.0752 17.2133 74.7703 14 69.7904 14C64.8104 14 60.5056 17.2133 58.462 21.8764C57.6993 23.6168 57.318 24.487 57.2813 24.5647C55.9421 27.3971 55.1606 27.9078 52.0289 27.9975C51.943 28 51.5952 28 50.8997 28C50.2043 28 49.8565 28 49.7706 27.9975C46.6389 27.9078 45.8574 27.3971 44.5182 24.5647C44.4815 24.487 44.1001 23.6168 43.3375 21.8764C41.2939 17.2133 36.9891 14 32.0091 14C28.1447 14 24.6868 15.9349 22.3767 18.9808C18.6745 23.8618 16.8235 26.3024 16.1428 26.81C15.1528 27.5482 15.4074 27.4217 14.2211 27.7644C13.4053 28 12.1727 28 9.70768 28C6.25895 28 4.53458 28 3.23415 27.3245C2.13829 26.7552 1.24477 25.8617 0.675519 24.7658C0 23.4654 0 21.7569 0 18.34V0Z"
            fill="white"
          ></path>
        </svg>
      </div>
      {showDiscountModal && (
        <div className="block-choose-discount">
          <div className="block-choose-discount-inner">
            <div className="block-choose-discount__title">
              <p>Promotions and offers</p>
              <button
                className="close-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  // setShowDiscountModal(false);
                  handleToggleDiscountModal();
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 28 28"
                  fill="#090d14"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6.2097 6.3871L6.29289 6.29289C6.65338 5.93241 7.22061 5.90468 7.6129 6.2097L7.70711 6.29289L14 12.585L20.2929 6.29289C20.6834 5.90237 21.3166 5.90237 21.7071 6.29289C22.0976 6.68342 22.0976 7.31658 21.7071 7.70711L15.415 14L21.7071 20.2929C22.0676 20.6534 22.0953 21.2206 21.7903 21.6129L21.7071 21.7071C21.3466 22.0676 20.7794 22.0953 20.3871 21.7903L20.2929 21.7071L14 15.415L7.70711 21.7071C7.31658 22.0976 6.68342 22.0976 6.29289 21.7071C5.90237 21.3166 5.90237 20.6834 6.29289 20.2929L12.585 14L6.29289 7.70711C5.93241 7.34662 5.90468 6.77939 6.2097 6.3871L6.29289 6.29289L6.2097 6.3871Z"></path>
                </svg>
              </button>
            </div>
            <div className="block-enter-discount-code">
              <div className="title">Coupons</div>
              <button className="toggle-block-verify-discount-code-btn">
                <div className="left-side">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <g clip-path="url(#clip0_630_81456)">
                      <path
                        d="M10.0304 1.23725C9.73749 0.944355 9.26262 0.944355 8.96972 1.23725L1.23749 8.96948C0.944599 9.26237 0.944599 9.73725 1.23749 10.0301L2.01208 10.8047C2.01227 10.8048 2.01252 10.8049 2.01283 10.805C2.01548 10.8061 2.02385 10.8089 2.03946 10.8096C2.07351 10.8111 2.12291 10.8014 2.17144 10.7749C2.49223 10.5993 2.86035 10.4998 3.25024 10.4998C4.49288 10.4998 5.50024 11.5071 5.50024 12.7498C5.50024 13.1396 5.40065 13.5078 5.22513 13.8286C5.19857 13.8771 5.18892 13.9265 5.19041 13.9605C5.19109 13.9761 5.19387 13.9845 5.19495 13.9872C5.19508 13.9875 5.19518 13.9877 5.19527 13.9879L5.96973 14.7624C6.26262 15.0553 6.73749 15.0553 7.03039 14.7624L14.7626 7.03014C15.0555 6.73725 15.0555 6.26237 14.7626 5.96948L13.9881 5.19496C13.9879 5.19487 13.9877 5.19476 13.9873 5.19464C13.9847 5.19356 13.9763 5.19078 13.9607 5.19009C13.9267 5.18861 13.8773 5.19825 13.8288 5.22479C13.508 5.40022 13.14 5.49976 12.7502 5.49976C11.5076 5.49976 10.5002 4.4924 10.5002 3.24976C10.5002 2.85998 10.5998 2.49196 10.7752 2.17123C10.8017 2.12271 10.8114 2.07331 10.8099 2.03927C10.8092 2.02368 10.8064 2.01531 10.8054 2.01265C10.8052 2.01234 10.8051 2.0121 10.805 2.0119L10.0304 1.23725ZM8.26262 0.530141C8.94604 -0.153276 10.0541 -0.153276 10.7375 0.530141L11.5127 1.30537C11.9192 1.71184 11.8496 2.29086 11.6525 2.65111C11.5556 2.8284 11.5002 3.03187 11.5002 3.24976C11.5002 3.94011 12.0599 4.49976 12.7502 4.49976C12.9681 4.49976 13.1716 4.44443 13.3489 4.34746C13.7091 4.15041 14.2882 4.08081 14.6946 4.48728L15.4697 5.26237C16.1531 5.94579 16.1531 7.05383 15.4697 7.73725L7.73749 15.4695C7.05407 16.1529 5.94604 16.1529 5.26262 15.4695L4.48759 14.6945C4.08107 14.2879 4.15074 13.7088 4.34786 13.3486C4.44489 13.1712 4.50024 12.9677 4.50024 12.7498C4.50024 12.0594 3.9406 11.4998 3.25024 11.4998C3.0323 11.4998 2.82877 11.5551 2.65145 11.6521C2.29118 11.8493 1.71207 11.9189 1.30554 11.5124L0.530386 10.7372C-0.153031 10.0538 -0.153033 8.94579 0.530385 8.26237L8.26262 0.530141Z"
                        fill="#212121"
                      ></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_630_81456">
                        <rect width="16" height="16" fill="white"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                  <p>Enter your coupon here</p>
                </div>
                <div className="right-side">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                  >
                    <path
                      d="M7.64582 4.81309C7.84073 4.61748 8.15731 4.61692 8.35292 4.81183L13.8374 10.2768C14.0531 10.4918 14.0531 10.8411 13.8374 11.056L8.35292 16.521C8.15731 16.7159 7.84073 16.7153 7.64582 16.5197C7.4509 16.3241 7.45147 16.0075 7.64708 15.8126L12.8117 10.6664L7.64708 5.5202C7.45147 5.32528 7.4509 5.0087 7.64582 4.81309Z"
                      fill="#212121"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
            <div className="list-discount-item">
              {coupons.map((coupon, index) => (
                <div className="coupon-item">
                  <div className="coupon-item-inner">
                    <div className="coupon-image">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                      >
                        <path
                          d="M26.7233 5.71704L30.1623 19.6235C30.2881 20.1317 29.9874 20.6484 29.4902 20.7771L9.27562 26.0109C8.63108 26.1775 7.94958 25.968 7.5026 25.4644L2.82365 20.1972C2.41971 19.7426 2.2641 19.113 2.40813 18.5162L4.07575 11.6065C4.23523 10.9458 4.73739 10.4291 5.38137 10.2626L25.5959 5.02928C26.0926 4.90054 26.5975 5.20828 26.7233 5.71704Z"
                          fill="#EF4444"
                        ></path>
                        <path
                          d="M28.8525 11.6417V26.1156C28.8525 26.6046 28.4651 27.0004 27.9878 27.0004H7.0735C6.4091 27.0004 5.79823 26.6255 5.48534 26.0253L2.2119 19.7457C1.92937 19.2036 1.92937 18.5537 2.2119 18.0122L5.48534 11.732C5.79823 11.1318 6.40855 10.7568 7.0735 10.7568H27.9878C28.4656 10.7568 28.8525 11.1532 28.8525 11.6417Z"
                          fill="white"
                        ></path>
                        <path
                          d="M7.83626 18.8781C7.83626 19.5766 7.28278 20.143 6.59962 20.143C5.91646 20.143 5.36353 19.5766 5.36353 18.8781C5.36353 18.1796 5.91701 17.6133 6.59962 17.6133C7.28223 17.6133 7.83626 18.1796 7.83626 18.8781Z"
                          fill="#FEE2E2"
                        ></path>
                        <path
                          d="M16.4658 13.9346C15.3241 13.9346 14.3954 14.8843 14.3954 16.0526C14.3954 17.2209 15.3236 18.1712 16.4658 18.1712C17.6081 18.1712 18.5363 17.2215 18.5363 16.0526C18.5363 14.8838 17.6076 13.9346 16.4658 13.9346ZM16.4658 16.759C16.0845 16.759 15.7755 16.4434 15.7755 16.0526C15.7755 15.6619 16.084 15.3462 16.4658 15.3462C16.8477 15.3462 17.1562 15.6624 17.1562 16.0526C17.1562 16.4428 16.8472 16.759 16.4658 16.759Z"
                          fill="#EF4444"
                        ></path>
                        <path
                          d="M22.5611 15.033L17.0401 23.5069C16.832 23.8265 16.4055 23.9213 16.0832 23.7022C15.7659 23.486 15.6804 23.0478 15.8917 22.7237L21.4128 14.2498C21.6219 13.9251 22.0501 13.8365 22.3696 14.0533C22.6869 14.2701 22.7725 14.7083 22.5611 15.033Z"
                          fill="#EF4444"
                        ></path>
                        <path
                          d="M21.9868 19.585C20.8451 19.585 19.9164 20.5347 19.9164 21.703C19.9164 22.8713 20.8446 23.8216 21.9868 23.8216C23.1291 23.8216 24.0573 22.8718 24.0573 21.7036C24.0573 20.5353 23.1286 19.585 21.9868 19.585ZM21.9868 22.4094C21.6055 22.4094 21.2965 22.0937 21.2965 21.703C21.2965 21.3123 21.605 20.9966 21.9868 20.9966C22.3687 20.9966 22.6766 21.3128 22.6772 21.703C22.6772 22.0932 22.3681 22.4094 21.9868 22.4094Z"
                          fill="#EF4444"
                        ></path>
                      </svg>
                    </div>
                    <div className="coupon-detail">
                      <p className="coupon-name">
                        {coupon.type === "free shipping"
                          ? "Free shipping"
                          : coupon.type === "fixed"
                          ? `${coupon.value} off total order`
                          : `${coupon.value}% off total order`}
                      </p>
                      <p className="coupon-description">{coupon.description}</p>
                    </div>
                    <button
                      className="select-coupon-btn"
                      onClick={(event) => {
                        handleSelectCoupon(event, coupon);
                      }}
                    >
                      {selectedCoupons.includes(coupon) ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="11"
                            fill="#dc2626"
                          ></circle>
                          <path
                            d="M11.3701 15.3163L17.7202 8.85485C18.0922 8.47634 18.0922 7.86263 17.7202 7.4841C17.3483 7.10557 16.7452 7.10556 16.3732 7.48407L10.6966 13.2602L8.82526 11.356C8.45328 10.9774 7.85018 10.9774 7.4782 11.356C7.10622 11.7345 7.10622 12.3482 7.47821 12.7267L10.0231 15.3163C10.395 15.6948 10.9981 15.6948 11.3701 15.3163Z"
                            fill="white"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.67742 0.677419C7.67742 0.303291 7.37413 0 7 0C6.62587 0 6.32258 0.303291 6.32258 0.677419V6.32258H0.677419C0.303291 6.32258 0 6.62587 0 7C0 7.37413 0.303291 7.67742 0.677419 7.67742H6.32258V13.3226C6.32258 13.6967 6.62587 14 7 14C7.37413 14 7.67742 13.6967 7.67742 13.3226V7.67742H13.3226C13.6967 7.67742 14 7.37413 14 7C14 6.62587 13.6967 6.32258 13.3226 6.32258H7.67742V0.677419Z"
                            fill="#DC2626"
                          ></path>
                          <path
                            d="M7.67742 0.677419C7.67742 0.303291 7.37413 0 7 0C6.62587 0 6.32258 0.303291 6.32258 0.677419V6.32258H0.677419C0.303291 6.32258 0 6.62587 0 7C0 7.37413 0.303291 7.67742 0.677419 7.67742H6.32258V13.3226C6.32258 13.6967 6.62587 14 7 14C7.37413 14 7.67742 13.6967 7.67742 13.3226V7.67742H13.3226C13.6967 7.67742 14 7.37413 14 7C14 6.62587 13.6967 6.32258 13.3226 6.32258H7.67742V0.677419Z"
                            fill="#DC2626"
                            fill-opacity="0.2"
                          ></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="quantity-discount">
              0 promotions and offers selected
            </p>
            <div className="total-discount">
              <div className="total-discount__calculation">
                <p className="total-cart-price">
                  <span>
                    {formatCurrencyVN(
                      receipt && receipt?.final_amount
                        ? receipt.final_amount
                        : 0
                    )}
                  </span>
                </p>
                <p className="discount-percent">
                  Saved{" "}
                  <span>
                    {formatCurrencyVN(
                      receipt && receipt?.discount ? receipt.discount : 0
                    )}
                  </span>
                </p>
              </div>
              <button
                className="verify-btn"
                onClick={handleToggleDiscountModal}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProvisionalInvoice;
