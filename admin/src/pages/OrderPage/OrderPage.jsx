import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderPage.scss";

import FilterPopup from "../../components/FilterPopup/FilterPopup";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import formatCurrencyVN from "../../utils/formatCurrencyVN";
import orderService from "../../services/orderService";

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get("status");

  const listOrderRef = useRef(null);
  const [distanceListOrderToBottom, setDistanceListOrderToBottom] = useState(0);

  // State lưu trữ filter đang mở
  const [openFilter, setOpenFilter] = useState(false);

  // State lưu trữ trạng thái đơn hàng được chọn
  const [selectedOrderStatus, setSelectedOrderStatus] = useState(
    status ? status.toUpperCase() : null
  );

  // Hàm toggle filter
  const toggleFilter = () => {
    setOpenFilter(!openFilter);
  };

  const handleStatusChange = (statusCode) => {
    setSelectedOrderStatus(statusCode);
    const newStatus = statusCode ? statusCode.toLowerCase() : null;
    const newQueryParams = new URLSearchParams(location.search);
    if (newStatus) {
      newQueryParams.set("status", newStatus);
    } else {
      newQueryParams.delete("status");
    }
    navigate(`${location.pathname}?${newQueryParams.toString()}`);
  };

  const columns = [
    {
      field: "id",
      headerName: "Order",
      width: 70,
      sortable: false,
      hidable: false,
      filterable: false,
    },
    {
      field: "user",
      headerName: "Customer",
      flex: 1.5,
      sortable: false,
      hidable: false,
      filterable: false,
      renderCell: (params) => (
        <Box width={"100%"} height={"100%"} display="flex" alignItems="center">
          {params.row.user_details.email}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      justifyContent: "center",
      sortable: true,
      filterable: false,
      hidable: false,
      renderCell: (params) => (
        <Box width={"100%"} height={"100%"} display="flex" gap={1}>
          <div className="box-order-status-item">
            <span
              className={`order-status-item ${
                params.row.current_status_details.status_code === "PENDING"
                  ? "pending"
                  : ""
              } ${
                params.row.current_status_details.status_code === "PACKED"
                  ? "packaged"
                  : ""
              } ${
                params.row.current_status_details.status_code === "DELIVERING"
                  ? "delivering"
                  : ""
              } ${
                params.row.current_status_details.status_code === "DELIVERED"
                  ? "delivered"
                  : ""
              } ${
                params.row.current_status_details.status_code === "CANCELLED"
                  ? "canceled"
                  : ""
              } ${
                params.row.current_status_details.status_code === "RETURNED"
                  ? "returned"
                  : ""
              }
                  ${
                    params.row.current_status_details.status_code === "REFUNDED"
                      ? "refunded"
                      : ""
                  }
                      ${
                        params.row.current_status_details.status_code ===
                        "CANCELLED"
                          ? "canceled"
                          : ""
                      }
                 `}
            >
              {params.row.current_status_details.status_code}
            </span>
          </div>
        </Box>
      ),
    },
    {
      field: "total_amount",
      headerName: "Total mount",
      flex: 1.5,
      justifyContent: "center",
      sortable: true,
      filterable: false,
      typeof: "number",
      hidable: false,
      renderCell: (params) => (
        <Box width={"100%"} height={"100%"} display="flex" gap={1}>
          <span
            style={{
              color: "rgb(6, 178, 244)",
            }}
          >
            {formatCurrencyVN(params.row.final_amount)}
          </span>
        </Box>
      ),
    },
    {
      field: "order_date",
      headerName: "Date",
      flex: 1,
      hidable: false,
      filterable: false,
      valueFormatter: (params) => dayjs(params.value).format("MM/DD/YYYY"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      justifyContent: "center",
      sortable: false,
      filterable: false,
      hidable: false,
      renderCell: (params) => (
        <Box width={"100%"} height={"100%"} display="flex" gap={1}>
          <Link
            to={`/orders/${params.row.id}`}
            className="action-detail-link"
            style={{
              color: "#733ab0",
              cursor: "pointer",
            }}
          >
            Details
          </Link>
        </Box>
      ),
    },
  ];
  const paginationModel = { page: 0, pageSize: 10 };

  const [orders, setOrders] = useState([]);

  const fetchOrders = async (status) => {
    console.log("fetchOrders", status);
    let statusId = null;
    if (status) {
      const upperCaseStatus = status.toUpperCase();
      const matchedStatus = orderStatuses.find(
        (item) => item.status_code === upperCaseStatus
      );
      statusId = matchedStatus ? matchedStatus.id : null;
      console.log("statusId", statusId);
    }
    try {
      const res = await orderService.getOrders(
        statusId ? { status: statusId } : {}
      );
      console.log("orders", res);
      if (res) {
        setOrders(res);
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const [orderStatuses, setOrderStatuses] = useState([]);
  const fetchOrderStatuses = async () => {
    try {
      const res = await orderService.getOrderStatuses();
      console.log("orderStatuses", res);
      if (res) {
        setOrderStatuses(res);
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  useEffect(() => {
    fetchOrders(status);
    fetchOrderStatuses();
  }, [status]);

  useEffect(() => {
    fetchOrders(status);
  }, [orderStatuses]);

  useEffect(() => {
    const updatePosition = () => {
      if (listOrderRef.current) {
        console.log("updatePosition");
        const rect = listOrderRef.current.getBoundingClientRect();
        setDistanceListOrderToBottom(window.innerHeight - rect.top);
        console.log(window.innerHeight - rect.top);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <div className="order-page">
      <div className="page-content">
        <div className="header">
          <h3 className="title">Orders</h3>
          <div className="actions">
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
              <button
                type="button"
                className={`status-item ${
                  !selectedOrderStatus ? "active" : ""
                }`}
                onClick={() => handleStatusChange(null)}
              >
                All Status
              </button>
              {orderStatuses.map((status) => (
                <button
                  key={status.status_code}
                  type="button"
                  className={`status-item ${
                    selectedOrderStatus === status.status_code ? "active" : ""
                  }`}
                  onClick={() => handleStatusChange(status.status_code)}
                >
                  {status.status_name}
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
                placeholder="Search by customer name ..."
                className="search-input"
              />
            </div>
            <div className="wrapper-filter-box wrapper-select-date-box">
              <button className="toggle-filter-popup-btn togle-select-date-box">
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
                      d="M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C20.1752 21.4816 19.3001 21.7706 18 21.8985"
                      stroke="#828282"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M7 4V2.5"
                      stroke="#828282"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M17 4V2.5"
                      stroke="#828282"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M21.5 9H16.625H10.75M2 9H5.875"
                      stroke="#828282"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M18 17C18 17.5523 17.5523 18 17 18C16.4477 18 16 17.5523 16 17C16 16.4477 16.4477 16 17 16C17.5523 16 18 16.4477 18 17Z"
                      fill="#828282"
                    />{" "}
                    <path
                      d="M18 13C18 13.5523 17.5523 14 17 14C16.4477 14 16 13.5523 16 13C16 12.4477 16.4477 12 17 12C17.5523 12 18 12.4477 18 13Z"
                      fill="#828282"
                    />{" "}
                    <path
                      d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z"
                      fill="#828282"
                    />{" "}
                    <path
                      d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z"
                      fill="#828282"
                    />{" "}
                    <path
                      d="M8 17C8 17.5523 7.55228 18 7 18C6.44772 18 6 17.5523 6 17C6 16.4477 6.44772 16 7 16C7.55228 16 8 16.4477 8 17Z"
                      fill="#828282"
                    />{" "}
                    <path
                      d="M8 13C8 13.5523 7.55228 14 7 14C6.44772 14 6 13.5523 6 13C6 12.4477 6.44772 12 7 12C7.55228 12 8 12.4477 8 13Z"
                      fill="#828282"
                    />{" "}
                  </g>
                </svg>
                Date
              </button>
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

              {openFilter && (
                <FilterPopup
                  orderStatusField={true}
                  orderDateField={true}
                  orderTotalField={true}
                />
              )}
            </div>
          </div>
        </div>

        <div
          className="list-order"
          ref={listOrderRef}
          style={{ height: `${distanceListOrderToBottom}px` }}
        >
          <Paper sx={{ height: "100%", width: "100%" }}>
            <DataGrid
              rows={orders}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              checkboxSelection
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

export default OrderPage;
