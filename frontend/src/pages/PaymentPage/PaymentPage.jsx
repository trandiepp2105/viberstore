import React, { useEffect, useState, useContext } from "react";
import "./PaymentPage.scss";
import formatCurrencyVN from "../../utils/formatCurrencyVN";
import paymentService from "../../services/paymentService";
import { AppContext } from "../../App";

const PaymentPage = () => {
  const [response, setResponse] = useState(null);
  const { setOnLoading } = useContext(AppContext);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Chuyển URLSearchParams thành object
    const data = {};
    for (const [key, value] of params.entries()) {
      data[key] = value;
    }

    // Gọi API để xử lý thanh toán
    const processPayment = async () => {
      if (!data) return;
      setOnLoading(true);
      try {
        const result = await paymentService.processPayment(data);
        setResponse(result);
      } catch (error) {
        console.error("Error processing payment:", error);
      } finally {
        setOnLoading(false);
      }
    };
    processPayment();
  }, []);
  return (
    <div className="page payment-page">
      <div className="payment-page-inner">
        <div className="payment-response-box">
          <div className="response-box__header">
            <div className="box-header-inner">
              <img src="/assets/images/logo-vnpay.svg" alt="" />
            </div>
          </div>
          <div className="response-box__content">
            <div className="content-inner">
              <div className="wrapper-notify-icon">
                <img src="/assets/images/success-res.svg" alt="" />
              </div>
              <p className="notify-title success">Notification</p>
              <p className="gateway-response">{response?.description}</p>

              <div className="order-description-box">
                <div className="description-item">
                  <p className="title">Order code</p>
                  <p className="value">{response?.vnp_OrderInfo}</p>
                </div>
                <div className="description-item">
                  <p className="title">Total amount</p>
                  <p className="value">
                    {formatCurrencyVN(response?.total_amount || 0)}
                  </p>
                </div>
                <div className="description-item">
                  <p className="title">Order date</p>
                  <p className="value">{response?.paid_at} </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
