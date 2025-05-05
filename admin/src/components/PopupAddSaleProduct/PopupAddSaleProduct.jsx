import React, { useState, useEffect, useRef } from "react";
import "./PopupAddSaleProduct.scss";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";

import { Box } from "@mui/material";
import { Link } from "react-router-dom";
const PopupAddSaleProduct = () => {
  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    // { field: "product_name", headerName: "Product Name", width: 170 },
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
    { field: "supplier", headerName: "Supplier", flex: 1 },
    { field: "selling_price", headerName: "Price", type: "number", flex: 1 },
    { field: "stock", headerName: "Stock", type: "number", flex: 1 },
  ];

  const rows = [
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

  const paginationModel = { page: 0, pageSize: 6 };
  const listProductRef = useRef(null);
  const [distanceListProductToBottom, setDistanceListProductToBottom] =
    useState(0);

  useEffect(() => {
    const updatePosition = () => {
      if (listProductRef.current) {
        const rect = listProductRef.current.getBoundingClientRect();
        setDistanceListProductToBottom(window.innerHeight - rect.top);
      }
    };
  }, []);
  return (
    <div className="popup">
      <div className="container">
        <div
          className="list-product"
          ref={listProductRef}
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
              rows={rows}
              columns={columns}
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
      </div>
    </div>
  );
};

export default PopupAddSaleProduct;
