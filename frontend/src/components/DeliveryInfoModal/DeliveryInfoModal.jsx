import React, { useState, useEffect } from "react";
import "./DeliveryInfoModal.scss";
import orderService from "../../services/orderService";

import LocationChoose from "../LocationChoose/LocationChoose";
const DeliveryInfoModal = ({
  popupName = "shipping info",
  deliveryInfo,
  handleToggle,
  width = 500,
  handleSubmit,
  mainButtonText = "Create",
}) => {
  const [deliveryData, setDeliveryData] = useState(
    deliveryInfo || {
      province_city: {},
      district: {},
      ward_commune: {},
      specific_address: "",
      recipient_name: "",
      phone_number: "",
    }
  );

  const handleTextInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData((prevData) => ({
      ...prevData,
      [name]: typeof prevData[name] === "string" ? value : prevData[name],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const createData = {
      ...deliveryData,
      province_city: deliveryData.province_city.id,
      district: deliveryData.district.id,
      ward_commune: deliveryData.ward_commune.id,
    };
    handleSubmit(createData);
  };
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [activeLocationType, setActiveLocationType] = useState(null); // Track which LocationChoose is active
  const handleToggleLocationChoose = (type) => {
    if (activeLocationType === type) {
      setActiveLocationType(null); // Close LocationChoose if it's already open
    } else {
      setActiveLocationType(type); // Open the selected LocationChoose
    }
  };
  const handleLocationSelect = (type, location) => {
    if (type === "province_city") {
      handleProvinceChange(location);
      setActiveLocationType("district"); // Move to district selection
    } else if (type === "district") {
      handleDistrictChange(location);
      setActiveLocationType("ward_commune"); // Move to ward selection
    } else if (type === "ward_commune") {
      handleWardChange(location);
      setActiveLocationType(null); // Close LocationChoose
    }
  };

  const getProvinces = async () => {
    try {
      const response = await orderService.getProvinces();
      setProvinces(response);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const getDistricts = async (provinceId) => {
    try {
      const response = await orderService.getDistricts(provinceId);
      setDistricts(response);
      setSelectedDistrict(null); // Reset selected district when province changes
      setSelectedWard(null); // Reset selected ward when province changes
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const getWards = async (districtId) => {
    try {
      const response = await orderService.getWards(districtId);
      setWards(response);
      setSelectedWard(null); // Reset selected ward when district changes
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  const handleProvinceChange = (province) => {
    setSelectedProvince(province);
    setDeliveryData((prevData) => ({
      ...prevData,
      province_city: province,
      district: {},
      ward_commune: {},
    }));
    getDistricts(province.id);
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setDeliveryData((prevData) => ({
      ...prevData,
      district: district,
      ward_commune: {},
    }));
    getWards(district.id);
  };

  const handleWardChange = (ward) => {
    setSelectedWard(ward);
    setDeliveryData((prevData) => ({
      ...prevData,
      ward_commune: ward,
    }));
  };

  useEffect(() => {
    getProvinces();
    if (deliveryInfo) {
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);

      if (deliveryInfo.province_city_details) {
        setSelectedProvince(deliveryInfo.province_city_details);
      }
      if (deliveryInfo.district) {
        setSelectedDistrict(deliveryInfo.district_details);
      }
      if (deliveryInfo.ward_commune) {
        setSelectedWard(deliveryInfo.ward_commune_details);
      }
      setDeliveryData({
        province_city: deliveryInfo.province_city || {},
        district: deliveryInfo.district || {},
        ward_commune: deliveryInfo.ward_commune || {},
        specific_address: deliveryInfo.specific_address || "",
        recipient_name: deliveryInfo.recipient_name || "",
        phone_number: deliveryInfo.phone_number || "",
      });
    } else {
      setDeliveryData({
        province_city: {},
        district: {},
        ward_commune: {},
        specific_address: "",
        recipient_name: "",
        phone_number: "",
      });
    }
  }, [deliveryInfo]);

  useEffect(() => {
    console.log("provinces", provinces);
    console.log("districts", districts);
    console.log("wards", wards);
  }, [provinces, districts, wards]);
  return (
    <div className="delivery-info-modal">
      <div className="container">
        <form
          className="popup-inner"
          onSubmit={handleSubmit}
          style={{ width: `${width}px` }}
        >
          <h3 className="title">Create {popupName}</h3>
          <div className="popup-content">
            {Object.entries(deliveryData).map(([key, value]) => (
              <div className="input-container" key={key}>
                {typeof value === "string" ? (
                  <>
                    <p className="input-title">{key}</p>
                    <input
                      type="text"
                      className="input-text"
                      name={key}
                      placeholder="Enter here..."
                      value={value || ""}
                      onChange={handleTextInputChange}
                    />
                  </>
                ) : (
                  <>
                    <p className="input-title">{key.split("_").join(" or ")}</p>
                    <div
                      className="location-container"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling to parent elements
                        console.log("Clicked on location container for ", key); // Debugging log
                        handleToggleLocationChoose(key); // Toggle the LocationChoose for the clicked key
                      }}
                    >
                      <svg
                        fill="#7d7d7d"
                        width="15px"
                        height="15px"
                        viewBox="-6.5 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                        pointerEvents="none" // Ignore clicks on the SVG
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0" />

                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />

                        <g id="SVGRepo_iconCarrier">
                          <title>dropdown</title>
                          <path d="M18.813 11.406l-7.906 9.906c-0.75 0.906-1.906 0.906-2.625 0l-7.906-9.906c-0.75-0.938-0.375-1.656 0.781-1.656h16.875c1.188 0 1.531 0.719 0.781 1.656z" />
                        </g>
                      </svg>
                      <input
                        type="text"
                        placeholder={`Enter your ${key
                          .split("_")
                          .join(" or ")}. . .`}
                        className="location-input"
                        disabled={true}
                        value={
                          key === "province_city"
                            ? selectedProvince?.name || ""
                            : key === "district"
                            ? selectedDistrict?.name || ""
                            : selectedWard?.name || ""
                        }
                        style={{ pointerEvents: "none" }} // Ignore clicks on the input
                      />
                      <div className="location-box">
                        {key === "province_city" &&
                          activeLocationType === "province_city" && (
                            <LocationChoose
                              locations={provinces}
                              handleSelectLocation={(location) =>
                                handleLocationSelect("province_city", location)
                              }
                            />
                          )}
                        {key === "district" &&
                          activeLocationType === "district" && (
                            <LocationChoose
                              locations={districts}
                              handleSelectLocation={(location) =>
                                handleLocationSelect("district", location)
                              }
                            />
                          )}
                        {key === "ward_commune" &&
                          activeLocationType === "ward_commune" && (
                            <LocationChoose
                              locations={wards}
                              handleSelectLocation={(location) =>
                                handleLocationSelect("ward_commune", location)
                              }
                            />
                          )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="popup-service">
            <button
              type="button"
              className="popup-btn cancel-btn"
              onClick={handleToggle}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="popup-btn save-btn"
              onClick={(e) => {
                handleCreate(e);
                handleToggle();
              }}
            >
              {mainButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryInfoModal;
