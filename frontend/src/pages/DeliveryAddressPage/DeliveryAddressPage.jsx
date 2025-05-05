import React, { useState, useEffect } from "react";
import "./DeliveryAddressPage.scss";
import shippingInfoService from "../../services/shippingInfoService";
import DeliveryInfoModal from "../../components/DeliveryInfoModal/DeliveryInfoModal";
// toast
import { toast } from "react-toastify";
const DeliveryAddressPage = () => {
  const [shippingInfos, setShippingInfos] = useState([]);
  const [selectedShippingInfo, setSelectedShippingInfo] = useState(null);
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);
  const [isAddInfoModalOpen, setIsAddInfoModalOpen] = useState(false);
  const handleToggleAddInfoModalOpen = () => {
    setIsAddInfoModalOpen(!isAddInfoModalOpen);
  };
  const handleToggleUpdateInfoModalOpen = (shippingInfo) => {
    setIsUpdateInfoModalOpen(!isUpdateInfoModalOpen);
  };
  const getShippingInfos = async () => {
    try {
      const response = await shippingInfoService.getShippingInfo();
      console.log("Shipping Infos:", response);
      setShippingInfos(response);
    } catch (error) {
      console.error("Failed to fetch shipping infos:", error);
    }
  };

  const handleUpdateShippingInfo = async (updatedShippingInfo) => {
    try {
      const response = await shippingInfoService.updateShippingInfo(
        selectedShippingInfo.id,
        updatedShippingInfo
      );
      toast.success("Update shipping info successfully!");
      setShippingInfos((prevShippingInfos) =>
        prevShippingInfos.map((info) =>
          info.id === selectedShippingInfo.id ? response : info
        )
      );
    } catch (error) {
      toast.error("Failed to update shipping info!");
    }
  };

  const handleCreateNewShippingInfo = async (newShippingInfo) => {
    try {
      const response = await shippingInfoService.addNewShippingInfo(
        newShippingInfo
      );
      toast.success("Create new shipping info successfully!");
      setShippingInfos((prevShippingInfos) => [...prevShippingInfos, response]);
    } catch (error) {
      toast.error("Failed to create new shipping info!");
    }
  };
  const handleDeleteShippingInfo = async (shippingInfoId) => {
    try {
      await shippingInfoService.deleteShippingInfo(shippingInfoId);
      toast.success("Delete shipping info successfully!");
      setShippingInfos((prevShippingInfos) =>
        prevShippingInfos.filter((info) => info.id !== shippingInfoId)
      );
    } catch (error) {
      toast.error("Failed to delete shipping info!");
    }
  };

  const handleSetDefaultShippingInfo = async (shippingInfoId) => {
    try {
      await shippingInfoService.setDefaultShippingInfo(shippingInfoId);
      toast.success("Set default shipping info successfully!");
      getShippingInfos(); // Refresh the list of shipping infos after setting default
    } catch (error) {
      toast.error("Failed to set default shipping info!");
    }
  };
  useEffect(() => {
    getShippingInfos();
  }, []);
  return (
    <div className="deliver-address-page">
      {isUpdateInfoModalOpen && (
        <DeliveryInfoModal
          popupName="Edit delivery address"
          mainButtonText="Update"
          deliveryInfo={selectedShippingInfo}
          handleToggle={handleToggleUpdateInfoModalOpen}
          handleSubmit={handleUpdateShippingInfo}
        />
      )}

      {isAddInfoModalOpen && (
        <DeliveryInfoModal
          popupName="Add new delivery address"
          mainButtonText="Create"
          // deliveryInfo={}
          handleToggle={handleToggleAddInfoModalOpen}
          handleSubmit={handleCreateNewShippingInfo}
        />
      )}
      <div className="deliver-address-page-inner">
        <div className="title">
          <p className="title-name">Delivery address</p>
          <button
            className="add-address-btn"
            onClick={handleToggleAddInfoModalOpen}
          >
            New address
          </button>
        </div>
        <div className="list-address">
          <>
            {shippingInfos.length === 0 ? (
              <div className="empty-order">
                <div className="empty-order-inner">
                  <img
                    className="empty-order-image"
                    src="/assets/images/empty-order.png"
                    alt=""
                  />
                  <p>There are no delivery address at the moment</p>
                </div>
              </div>
            ) : (
              shippingInfos?.map((shippingInfo) => (
                <div className="address-item" key={shippingInfo.id}>
                  <div className="address-item-inner">
                    <div className="wrapper-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="#000"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M8.68701 1.26164C8.30151 0.897163 7.69849 0.897163 7.31299 1.26164L2.46948 5.84098C2.1698 6.12431 2 6.51853 2 6.93094V12.5002C2 13.3286 2.67157 14.0002 3.5 14.0002H5C5.82843 14.0002 6.5 13.3286 6.5 12.5002V10.0002C6.5 9.72407 6.72386 9.50021 7 9.50021H9C9.27614 9.50021 9.5 9.72407 9.5 10.0002V12.5002C9.5 13.3286 10.1716 14.0002 11 14.0002H12.5C13.3284 14.0002 14 13.3286 14 12.5002V6.93094C14 6.51853 13.8302 6.12431 13.5305 5.84098L8.68701 1.26164Z"
                          fill="#000"
                        ></path>
                      </svg>
                    </div>
                    <div className="address-content">
                      <div className="first-line">
                        <p className="recipient-name">
                          {shippingInfo.recipient_name}
                        </p>
                        <span className="devider"></span>
                        <p className="recipient-phone">
                          {shippingInfo.phone_number}
                        </p>
                      </div>
                      <div className="specific-address">
                        {shippingInfo.specific_address}
                      </div>
                    </div>
                    <div className="address-services">
                      <button
                        className="address-service-btn edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleUpdateInfoModalOpen();
                          setSelectedShippingInfo(shippingInfo);
                        }}
                      >
                        Edit
                      </button>
                      <span className="devider"></span>
                      <button
                        className="address-service-btn delete-btn"
                        onClick={() =>
                          handleDeleteShippingInfo(shippingInfo.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="set-default-address">
                    {shippingInfo.is_default ? (
                      <div className="address-status">Default</div>
                    ) : (
                      <button
                        className="set-default-address-btn"
                        onClick={() =>
                          handleSetDefaultShippingInfo(shippingInfo.id)
                        }
                      >
                        Set default
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddressPage;
