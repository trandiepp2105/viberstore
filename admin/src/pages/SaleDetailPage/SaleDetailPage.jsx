import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";

import "./SaleDetailPage.scss";
import PopupAddSaleProduct from "../../components/PopupAddSaleProduct/PopupAddSaleProduct";
const SaleDetailPage = () => {
  const TypeOptions = {
    PERCENTAGE: "Percentage",
    FIXED_VALUE: "Fixed Value",
  };
  const [isOpenSelectType, setIsOpenSelectType] = useState(false);
  const [valueType, setValueType] = useState(null);
  const handleToggleSelectType = () => {
    setIsOpenSelectType(!isOpenSelectType);
  };
  const handleSelectType = (option) => {
    setValueType(option);
    setIsOpenSelectType(false);
  };

  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());

  const productColumns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "product_name",
      headerName: "Product Name",
      // width: 180,
      flex: 1.5,
      justifyContent: "center",
      sortable: false, // Không cần sắp xếp
      filterable: false, // Không cần lọc
      renderCell: (params) => (
        <Box
          width={"100%"}
          height={"100%"}
          display="flex"
          alignItems={"center"}
          gap={1}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              // justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img
              src={params.row.image_url}
              alt=""
              style={{
                height: "50%",
                borderRadius: "5px",
              }}
            />
            <p>{params.row.product_name}</p>
          </div>
        </Box>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 70,
      //   flex: 0.75,
      justifyContent: "center",
      sortable: false, // Không cần sắp xếp
      filterable: false, // Không cần lọc
      renderCell: (params) => (
        <Box
          width={"100%"}
          height={"100%"}
          display="flex"
          alignItems={"center"}
          justifyContent={"center"}
          gap={2}
        >
          <button
            className="action-detail-link delete-btn"
            onClick={(e) => {
              e.stopPropagation();
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

  const productRows = [
    {
      id: 1,
      product_name: "Iphone 13",
      image_url:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT8LUT8SIu5vVnSCBMbDVMyZiPaWMg0MRVHEwmbGB3wPBsGny_wq65uHenAsV13GpfmElqJsetk5NI6nzbBbJRRZ9Y9DcGQvM_XhKIt31Q&usqp=CAE",
      supplier: "Electronics",
      selling_price: 1000000,
      stock: 10,
    },
    {
      id: 2,
      product_name: "Samsung Galaxy S21",
      image_url:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT8LUT8SIu5vVnSCBMbDVMyZiPaWMg0MRVHEwmbGB3wPBsGny_wq65uHenAsV13GpfmElqJsetk5NI6nzbBbJRRZ9Y9DcGQvM_XhKIt31Q&usqp=CAE",

      supplier: "Electronics",
      selling_price: 800,
      stock: 20,
    },
    {
      id: 3,
      product_name: "Macbook Pro 2021",
      image_url:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT8LUT8SIu5vVnSCBMbDVMyZiPaWMg0MRVHEwmbGB3wPBsGny_wq65uHenAsV13GpfmElqJsetk5NI6nzbBbJRRZ9Y9DcGQvM_XhKIt31Q&usqp=CAE",

      supplier: "Electronics",
      selling_price: 2000,
      stock: 5,
    },
    {
      id: 4,
      product_name: "Nike Air Force 1",
      image_url:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT8LUT8SIu5vVnSCBMbDVMyZiPaWMg0MRVHEwmbGB3wPBsGny_wq65uHenAsV13GpfmElqJsetk5NI6nzbBbJRRZ9Y9DcGQvM_XhKIt31Q&usqp=CAE",

      supplier: "Shoes",
      selling_price: 100,
      stock: 50,
    },
    {
      id: 5,
      product_name: "Adidas Yeezy",
      image_url:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT8LUT8SIu5vVnSCBMbDVMyZiPaWMg0MRVHEwmbGB3wPBsGny_wq65uHenAsV13GpfmElqJsetk5NI6nzbBbJRRZ9Y9DcGQvM_XhKIt31Q&usqp=CAE",

      supplier: "Shoes",
      selling_price: 200,
      stock: 30,
    },
    {
      id: 6,
      product_name: "H&M T-shirt",
      image_url:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT8LUT8SIu5vVnSCBMbDVMyZiPaWMg0MRVHEwmbGB3wPBsGny_wq65uHenAsV13GpfmElqJsetk5NI6nzbBbJRRZ9Y9DcGQvM_XhKIt31Q&usqp=CAE",

      supplier: "Clothing",
      selling_price: 20,
      stock: 100,
    },
    {
      id: 7,
      product_name: "Zara Jeans",
      image_url:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT8LUT8SIu5vVnSCBMbDVMyZiPaWMg0MRVHEwmbGB3wPBsGny_wq65uHenAsV13GpfmElqJsetk5NI6nzbBbJRRZ9Y9DcGQvM_XhKIt31Q&usqp=CAE",

      supplier: "Clothing",
      selling_price: 50,
      stock: 80,
    },
    {
      id: 8,
      product_name: "Rayban Sunglasses",
      image_url:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT8LUT8SIu5vVnSCBMbDVMyZiPaWMg0MRVHEwmbGB3wPBsGny_wq65uHenAsV13GpfmElqJsetk5NI6nzbBbJRRZ9Y9DcGQvM_XhKIt31Q&usqp=CAE",

      supplier: "Accessories",
      selling_price: 150,
      stock: 40,
    },
  ];

  const paginationModel = { page: 0, pageSize: 4 };

  const categoryColumns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "category",
      headerName: "Category Name",
      // width: 180,
      flex: 1.5,
      justifyContent: "center",
      sortable: false, // Không cần sắp xếp
      filterable: false, // Không cần lọc
      renderCell: (params) => (
        <Box
          width={"100%"}
          height={"100%"}
          display="flex"
          alignItems={"center"}
          gap={1}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              // justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <p>{`${params.row.category.parent.name} - ${params.row.category.name}`}</p>
          </div>
        </Box>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 70,
      //   flex: 0.75,
      justifyContent: "center",
      sortable: false, // Không cần sắp xếp
      filterable: false, // Không cần lọc
      renderCell: (params) => (
        <Box
          width={"100%"}
          height={"100%"}
          display="flex"
          alignItems={"center"}
          justifyContent={"center"}
          gap={2}
        >
          <button
            className="action-detail-link delete-btn"
            onClick={(e) => {
              e.stopPropagation();
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

  const categoryRows = [
    {
      id: 10,
      category: {
        name: "Swear",
        parent: { id: 1, name: "Men's Fashion" },
      },
    },
  ];
  return (
    <div className="page sale-detail-page">
      <PopupAddSaleProduct />
      <div className="page-content">
        <div className="header">
          <div className="left-side">
            <button className="back-btn">
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
                fill="#000000"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0" />

                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <g id="SVGRepo_iconCarrier">
                  <path
                    fill="#000000"
                    d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                  />

                  <path
                    fill="#000000"
                    d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                  />
                </g>
              </svg>
            </button>
            <div className="title">
              <h5 className="back-description">Back to list</h5>
              <h2 className="product-name">{"Sale Promotion"}</h2>
            </div>
          </div>
          <div className="right-side">
            <div className="list-quick-btn">
              <button className="btn quick-btn delete-product-btn">
                Deltete Sale Promotion
              </button>
              <button className="btn quick-btn save-product-btn">Save</button>
            </div>
          </div>
        </div>
        <div className="wrapper-sale-info">
          <div className="sale-info">
            <div className="left-side">
              <div className="info-container">
                <p className="title">General Information</p>
                <div className="wrapper-info-item">
                  <div className="info-item">
                    <p className="info-title">Sale Promotion Name</p>
                    <div className="wrapper-info-input">
                      <input
                        type="text"
                        placeholder="Enter name for sale promotion"
                      />
                    </div>
                  </div>
                </div>
                <div className="wrapper-info-item two-column">
                  <div className="info-item">
                    <p className="info-title">Discount Type</p>
                    <div
                      className="wrapper-info-input custom-select"
                      onClick={handleToggleSelectType}
                    >
                      <svg
                        width="25px"
                        height="25px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="dropdown-icon"
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z"
                            fill="#878282"
                          ></path>{" "}
                        </g>
                      </svg>
                      <div className="selected-option">
                        {valueType ? valueType : "Choose Value Type"}
                      </div>
                      {isOpenSelectType && (
                        <div
                          className="options"
                          onClick={handleToggleSelectType}
                        >
                          {Object.values(TypeOptions).map((option) => (
                            <div
                              className={`selection ${
                                valueType === option ? "selected" : ""
                              }`}
                              key={option}
                              onClick={() => handleSelectType(option)}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="info-item">
                    <p className="info-title">Value</p>
                    <div className="wrapper-info-input">
                      <span class="unit">VND</span>
                      <input type="text" placeholder="Enter discount value" />
                    </div>
                  </div>
                </div>
                <div className="wrapper-info-item">
                  <div className="info-item">
                    <p className="info-title">Description</p>
                    <div className="wrapper-info-input">
                      <input
                        type="text"
                        placeholder="Enter description for sale promotion"
                      />
                    </div>
                  </div>
                </div>
                <div className="wrapper-info-item two-column">
                  <div className="info-item">
                    <p className="info-title">Start Date</p>
                    <div className="wrapper-info-input date-picked">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Chọn ngày"
                          value={startDate}
                          onChange={(newValue) => setStartDate(newValue)}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth />
                          )}
                          sx={{
                            width: "100%",
                            height: "100%",
                            "& .MuiFormControl-root": {
                              height: "100%",
                              width: "100%",
                            },
                            "& .MuiFormLabel-root": {
                              display: "none",
                            },
                            "& .MuiInputBase-root": {
                              // padding: "0",
                              paddingLeft: "10px",
                              height: "100%",
                              width: "100%",
                            },
                            "& .MuiInputBase-input": {
                              padding: "0",
                              height: "100%",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </div>
                  <div className="info-item">
                    <p className="info-title">End Date</p>
                    <div className="wrapper-info-input date-picked">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Chọn ngày"
                          value={endDate}
                          onChange={(newValue) => setEndDate(newValue)}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth />
                          )}
                          sx={{
                            width: "100%",
                            height: "100%",
                            "& .MuiFormControl-root": {
                              height: "100%",
                              width: "100%",
                            },
                            "& .MuiFormLabel-root": {
                              display: "none",
                            },
                            "& .MuiInputBase-root": {
                              // padding: "0",
                              paddingLeft: "10px",
                              height: "100%",
                              width: "100%",
                            },
                            "& .MuiInputBase-input": {
                              padding: "0",
                              height: "100%",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="right-side">
              <div className="info-container">
                <div className="title">
                  <p>Sale products</p>
                  <button className="add-sale-category">
                    <svg
                      width="25px"
                      height="25px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <g id="Edit / Add_Plus">
                          {" "}
                          <path
                            id="Vector"
                            d="M6 12H12M12 12H18M12 12V18M12 12V6"
                            stroke="#5a5858"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                        </g>{" "}
                      </g>
                    </svg>
                    <span>Add Product</span>
                  </button>
                </div>
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
                    rows={productRows}
                    columns={productColumns}
                    initialState={{
                      pagination: { paginationModel },
                      // columns: { columnVisibilityModel: { id: true } }, // Ẩn cột ID
                    }} //   pageSizeOptions={[6, 10]}
                    checkboxSelection
                    sx={{
                      border: 0,
                      "--height": "50px",
                      "& .MuiDataGrid-row": {
                        cursor: "pointer",
                        height: "50px !important",
                        minHeight: "50px !important",
                        maxHeight: "50px !important",
                      },
                      "& .MuiDataGrid-cell": {
                        height: "50px !important",
                      },
                    }}
                    // sx={{
                    //   "& .css-1rgwvnj-MuiDataGrid-root": {
                    //     border: "none !important", // Bỏ viền bảng
                    //   },
                    //   "& .MuiDataGrid-root": {
                    //     border: "none !important", // Bỏ viền bảng
                    //   },
                    //   "& .MuiDataGrid-columnHeaders": {
                    //     backgroundColor: "transparent", // Bỏ màu nền tiêu đề
                    //     color: "#000",
                    //   },
                    //   "& .MuiDataGrid-cell": {
                    //     backgroundColor: "transparent", // Bỏ màu nền cell
                    //   },
                    //   "& .MuiDataGrid-row": {
                    //     backgroundColor: "transparent", // Bỏ màu nền hàng
                    //   },
                    //   "& .MuiDataGrid-row:hover": {
                    //     backgroundColor: "transparent", // Bỏ màu nền khi hover
                    //   },
                    //   "& .MuiPaper-root": {
                    //     boxShadow: "none !important",
                    //     backgroundColor: "transparent !important",
                    //     "& .css-yseucu-MuiDataGrid-columnHeaderRow": {
                    //       background: "none !important",
                    //     },
                    //     "& .MuiDataGrid-root": {
                    //       border: "none !important", // Bỏ viền bảng
                    //     },
                    //     "& .css-1rgwvnj-MuiDataGrid-root": {
                    //       border: "none !important", // Bỏ viền bảng
                    //     },
                    //     "& .Mui-checked": {
                    //       color: "#ff5722 !important", // Màu checkbox khi được chọn
                    //     },
                    //   },
                    //   "& .Mui-checked": {
                    //     color: "#ff5722 !important", // Màu checkbox khi được chọn
                    //   },
                    // }}
                    //   autoPageSize={false}
                    //   pageSize={10}
                  />
                </Paper>
              </div>
              <div className="info-container">
                <div className="title">
                  <p>Sale categories</p>
                  <button className="add-sale-category">
                    <svg
                      width="25px"
                      height="25px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <g id="Edit / Add_Plus">
                          {" "}
                          <path
                            id="Vector"
                            d="M6 12H12M12 12H18M12 12V18M12 12V6"
                            stroke="#5a5858"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                        </g>{" "}
                      </g>
                    </svg>
                    <span>Add Category</span>
                  </button>
                </div>
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
                    rows={categoryRows}
                    columns={categoryColumns}
                    initialState={{
                      pagination: { paginationModel },
                      // columns: { columnVisibilityModel: { id: true } }, // Ẩn cột ID
                    }} //   pageSizeOptions={[6, 10]}
                    checkboxSelection
                    sx={{
                      border: 0,
                      "--height": "50px",
                      "& .MuiDataGrid-row": {
                        cursor: "pointer",
                        height: "50px !important",
                        minHeight: "50px !important",
                        maxHeight: "50px !important",
                      },
                      "& .MuiDataGrid-cell": {
                        height: "50px !important",
                      },
                    }}
                  />
                </Paper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailPage;
