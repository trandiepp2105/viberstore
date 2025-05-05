import React, { useRef, useEffect, useState } from "react";
import "./CouponManagePage.scss";
import FilterPopup from "../../components/FilterPopup/FilterPopup";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

import { Box } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AcceptancePopup from "../../components/AcceptancePopup/AcceptancePopup";
import CouponPopup from "../../components/CouponPopup/CouponPopup";
import marketingService from "../../services/marketingService";
import formatCurrencyVN from "../../utils/formatCurrencyVN";
// toastify
import { toast } from "react-toastify";
const CouponManagePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const couponCode = queryParams.get("code");
  const couponType = queryParams.get("type") || "all"; // Default to "all"
  const listCouponRef = useRef(null);
  const [distanceListProductToBottom, setDistanceListProductToBottom] =
    useState(0);
  const [selectedType, setSelectedType] = useState(couponType);
  const [isOpenCouponPopup, setIsOpenCouponPopup] = useState(false);
  const [couponPopupButtonText, setCouponPopupButtonText] = useState("Create");
  const handleToggleCouponPopup = () => {
    setIsOpenCouponPopup(!isOpenCouponPopup);
  };
  useEffect(() => {
    const updatePosition = () => {
      if (listCouponRef.current) {
        const rect = listCouponRef.current.getBoundingClientRect();
        setDistanceListProductToBottom(window.innerHeight - rect.top);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  const [openFilter, setOpenFilter] = useState(false);

  const toggleFilter = () => {
    setOpenFilter(!openFilter);
  };

  const couponColumns = [
    { field: "id", headerName: "ID", width: 0 },
    {
      field: "code",
      headerName: "Code",
      flex: 1.5,
      justifyContent: "center",
      sortable: true,
      filterable: true,
    },
    {
      field: "type",
      sortable: false,
      filterable: false,
      headerName: "Type",
      flex: 1,
    },
    {
      field: "value",
      sortable: false,
      filterable: false,
      headerName: "Value",
      flex: 1.5,
      renderCell: (params) =>
        params.row.type === "fixed"
          ? formatCurrencyVN(params.row.value)
          : params.row.type === "percentage"
          ? `${params.row.value}%`
          : ``,
    },
    {
      field: "min_order_amount",
      sortable: false,
      filterable: false,
      headerName: "Min order amount",
      flex: 1,
      renderCell: (params) => formatCurrencyVN(params.row.min_order_amount),
    },
    {
      field: "start_date",
      headerName: "Started At",
      flex: 1,
      justifyContent: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        new Date(params.row.start_date).toLocaleDateString("en-GB"),
    },
    {
      field: "end_date",
      headerName: "Ended At",
      flex: 1,
      justifyContent: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        new Date(params.row.end_date).toLocaleDateString("en-GB"),
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      justifyContent: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          width={"100%"}
          height={"100%"}
          display="flex"
          alignItems={"center"}
          gap={2}
        >
          <button
            type="button"
            // to={`/coupons/${params.row.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCoupon(params.row);
              handleToggleCouponPopup();
            }}
            className="action-detail-link"
            style={{
              color: "#733ab0",
              cursor: "pointer",
              height: "fit-content",
              display: "flex",
              alignItems: "center",
              border: "none",
              outline: "none",
              background: "transparent",
            }}
          >
            <svg
              width="20px"
              height="20px"
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
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M19.186 2.09c.521.25 1.136.612 1.625 1.101.49.49.852 1.104 1.1 1.625.313.654.11 1.408-.401 1.92l-7.214 7.213c-.31.31-.688.541-1.105.675l-4.222 1.353a.75.75 0 0 1-.943-.944l1.353-4.221a2.75 2.75 0 0 1 .674-1.105l7.214-7.214c.512-.512 1.266-.714 1.92-.402zm.211 2.516a3.608 3.608 0 0 0-.828-.586l-6.994 6.994a1.002 1.002 0 0 0-.178.241L9.9 14.102l2.846-1.496c.09-.047.171-.107.242-.178l6.994-6.994a3.61 3.61 0 0 0-.586-.828zM4.999 5.5A.5.5 0 0 1 5.47 5l5.53.005a1 1 0 0 0 0-2L5.5 3A2.5 2.5 0 0 0 3 5.5v12.577c0 .76.082 1.185.319 1.627.224.419.558.754.977.978.442.236.866.318 1.627.318h12.154c.76 0 1.185-.082 1.627-.318.42-.224.754-.559.978-.978.236-.442.318-.866.318-1.627V13a1 1 0 1 0-2 0v5.077c0 .459-.021.571-.082.684a.364.364 0 0 1-.157.157c-.113.06-.225.082-.684.082H5.923c-.459 0-.57-.022-.684-.082a.363.363 0 0 1-.157-.157c-.06-.113-.082-.225-.082-.684V5.5z"
                  fill="#585a59"
                />
              </g>
            </svg>
          </button>
          <button
            className="action-detail-link delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCoupon(params.row);
              handleToggleDeleteCouponPopup();
            }}
            style={{
              color: "#733ab0",
              border: "none",
              background: "none",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <svg
              width="20px"
              height="20px"
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
                  d="M10 12V17"
                  stroke="#fc1d1d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
                <path
                  d="M14 12V17"
                  stroke="#fc1d1d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
                <path
                  d="M4 7H20"
                  stroke="#fc1d1d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
                <path
                  d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10"
                  stroke="#fc1d1d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
                <path
                  d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                  stroke="#fc1d1d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
              </g>
            </svg>
          </button>
        </Box>
      ),
    },
  ];

  const [coupons, setCoupons] = useState([]);

  const getCoupons = async () => {
    try {
      const filters = {};
      if (couponCode) filters.code = couponCode;
      if (selectedType !== "all") filters.type = selectedType;

      const response = await marketingService.getCoupons(filters);
      if (response) {
        setCoupons(response);
        console.log("Coupons:", response);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const handleCreateCoupon = async (coupon) => {
    try {
      const response = await marketingService.createCoupon(coupon);
      setCoupons((prevCoupons) => [...prevCoupons, response]);
      setSelectedCoupon(null);
      toast.success("Coupon created successfully");
      handleToggleCouponPopup();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("Error creating coupon");
    }
  };
  const handleDeleteCoupon = async (couponId) => {
    try {
      await marketingService.deleteCoupon(couponId);
      setCoupons((prevCoupons) =>
        prevCoupons.filter((coupon) => coupon.id !== couponId)
      );
      setSelectedCoupon(null);
      toast.success("Coupon deleted successfully");
      handleToggleDeleteCouponPopup();
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  const handleUpdateCoupon = async (coupon) => {
    try {
      const response = await marketingService.updateCoupon(coupon);
      setCoupons((prevCoupons) =>
        prevCoupons.map((c) => (c.id === coupon.id ? response : c))
      );
      setSelectedCoupon(null);
      toast.success("Coupon updated successfully");
      handleToggleCouponPopup();
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Error updating coupon");
    }
  };
  const paginationModel = { page: 0, pageSize: 6 };

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isOpenDeleteCouponPopup, setIsOpenDeleteCouponPopup] = useState(false);
  const handleToggleDeleteCouponPopup = () => {
    setIsOpenDeleteCouponPopup(!isOpenDeleteCouponPopup);
  };

  useEffect(() => {
    getCoupons();
  }, [couponCode, selectedType]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    const params = new URLSearchParams(location.search);
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    navigate({ search: params.toString() });
  };

  const couponTypes = ["all", "fixed", "percentage", "free shipping"];

  return (
    <div className="user-page">
      {isOpenDeleteCouponPopup && (
        <AcceptancePopup
          description="Are you sure you want to delete this coupon?"
          handleClose={handleToggleDeleteCouponPopup}
          handleAccept={() => {
            handleDeleteCoupon(selectedCoupon.id);
          }}
        />
      )}

      {isOpenCouponPopup && (
        <CouponPopup
          popupName="Coupon"
          coupon={selectedCoupon}
          handleToggle={handleToggleCouponPopup}
          mainButtonText={couponPopupButtonText}
          handleSubmit={(couponData) => {
            if (couponPopupButtonText === "Create") {
              handleCreateCoupon(couponData);
            }
            if (couponPopupButtonText === "Update") {
              handleUpdateCoupon(couponData);
            }
          }}
        />
      )}
      <div className="page-content">
        <div className="header">
          <h3 className="title">Coupons</h3>
          <div className="actions">
            <button
              className="btn btn-add"
              type="button"
              onClick={() => {
                setSelectedCoupon(null);
                handleToggleCouponPopup();
              }}
            >
              <svg
                width="10px"
                height="10px"
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
                    d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z"
                    fill="#ffffff"
                  />{" "}
                </g>
              </svg>
              Add Coupon
            </button>
            <button className="btn btn-export">
              <svg
                width="10px"
                height="10px"
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
                    d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z"
                    fill="#000000"
                  />{" "}
                </g>
              </svg>
              Export
            </button>
          </div>
        </div>
        <div className="quick-access-bar">
          <div className="left-side">
            <div className="filter-order-by-status-bar">
              {couponTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`status-item ${
                    selectedType === type ? "active" : ""
                  }`}
                  onClick={() => handleTypeChange(type)}
                >
                  {type === "all"
                    ? "All Coupons"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="right-side">
            <div className="search-bar">
              <span className="wrapper-search-icon">
                <svg
                  width="20px"
                  height="20px"
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
                    <g clip-path="url(#clip0_15_152)">
                      {" "}
                      <rect width="24" height="24" fill="#f0f2f5" />{" "}
                      <circle
                        cx="10.5"
                        cy="10.5"
                        r="6.5"
                        stroke="#000000"
                        stroke-linejoin="round"
                      />{" "}
                      <path
                        d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z"
                        fill="#000000"
                      />{" "}
                    </g>{" "}
                    <defs>
                      {" "}
                      <clipPath id="clip0_15_152">
                        {" "}
                        <rect width="24" height="24" fill="white" />{" "}
                      </clipPath>{" "}
                    </defs>{" "}
                  </g>
                </svg>
              </span>

              <input
                type="text"
                placeholder="Search coupon by code ..."
                className="search-input"
              />
            </div>
            <div className="wrapper-filter-box">
              <button
                className="toggle-filter-popup-btn"
                type="button"
                onClick={toggleFilter}
              >
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  transform="matrix(1, 0, 0, -1, 0, 0)rotate(90)"
                  stroke="#f0f2f5"
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
                      d="M5 12L5 4"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M19 20L19 17"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M5 20L5 16"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M19 13L19 4"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M12 7L12 4"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M12 20L12 11"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <circle
                      cx="5"
                      cy="14"
                      r="2"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <circle
                      cx="12"
                      cy="9"
                      r="2"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <circle
                      cx="19"
                      cy="15"
                      r="2"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                  </g>
                </svg>
                Filter
              </button>

              {openFilter && <FilterPopup />}
            </div>
          </div>
        </div>

        <div
          className="list-user"
          ref={listCouponRef}
          style={{
            height: `${distanceListProductToBottom}px`,
          }}
        >
          <Paper
            sx={{
              height: "100%",
              width: "100%",
              border: "none",
              boxShadow: "none !important",
              backgroundColor: "transparent !important",
              "& .css-yseucu-MuiDataGrid-columnHeaderRow": {
                background: "none !important",
              },

              "& .MuiDataGrid-root": {
                border: "none !important", // Bỏ viền bảng
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "transparent", // Bỏ màu nền tiêu đề
                color: "#000",
              },
              "& .MuiDataGrid-row.Mui-selected": {
                backgroundColor: "transparent !important", // Bỏ màu nền khi chọn
              },

              "& .MuiDataGrid-cell": {
                backgroundColor: "transparent", // Bỏ màu nền cell
              },
              "& .MuiDataGrid-row": {
                backgroundColor: "transparent", // Bỏ màu nền hàng
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "transparent", // Bỏ màu nền khi hover
              },
              "& .Mui-checked": {
                color: "#ff5722 !important", // Màu checkbox khi được chọn
              },
            }}
          >
            <DataGrid
              rows={coupons}
              columns={couponColumns}
              initialState={{
                pagination: { paginationModel },
                columns: { columnVisibilityModel: { id: false } }, // Ẩn cột ID
              }} //   pageSizeOptions={[6, 10]}
              checkboxSelection
              // sx={{
              //   border: 0,
              //   "--height": "50px",
              //   "& .MuiDataGrid-row": {
              //     cursor: "pointer",
              //     height: "50px !important",
              //     minHeight: "50px !important",
              //     maxHeight: "50px !important",
              //   },
              //   "& .MuiDataGrid-cell": {
              //     height: "50px !important",
              //   },
              // }}
              sx={{
                border: 0,
                "--height": "45px",
                "& .MuiDataGrid-row": {
                  cursor: "pointer",
                  height: "45px !important",
                  minHeight: "45px !important",
                  maxHeight: "45px !important",
                },
                "& .MuiDataGrid-cell": {
                  height: "45px !important",
                },
              }}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default CouponManagePage;
