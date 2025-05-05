import React, { useRef, useEffect, useState } from "react";
import "./ProductPage.scss";
import FilterPopup from "../../components/FilterPopup/FilterPopup";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";

import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import productService from "../../services/productService";
import { toast } from "react-toastify";
import categoryService from "../../services/categoryService";
const ProductPage = () => {
  const listProductRef = useRef(null);
  const [distanceListProductToBottom, setDistanceListProductToBottom] =
    useState(0);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);

  // Hàm lấy danh sách danh mục chính
  const fetchMainCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setMainCategories(response);
    } catch (error) {
      console.error("Error fetching main categories:", error);
    }
  };

  const handleSelectMainCategory = (category) => {
    setSelectedMainCategory(category);
  };
  useEffect(() => {
    const updatePosition = () => {
      if (listProductRef.current) {
        const rect = listProductRef.current.getBoundingClientRect();
        setDistanceListProductToBottom(window.innerHeight - rect.top);
      }
    };

    updatePosition(); // Gọi lần đầu khi component mount
    window.addEventListener("resize", updatePosition); // Cập nhật khi resize

    return () => window.removeEventListener("resize", updatePosition);
  }, []);
  // State lưu trữ filter đang mở
  const [openFilter, setOpenFilter] = useState(false);

  // Hàm toggle filter
  const toggleFilter = () => {
    setOpenFilter(!openFilter);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    // { field: "product_name", headerName: "Product Name", width: 170 },
    {
      field: "name",
      headerName: "Product Name",
      // width: 180,
      flex: 2,
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
              src={`${params.row.image_url}`}
              alt=""
              style={{
                height: "50%",
                borderRadius: "5px",
              }}
            />
            <p>{params.row.name}</p>
          </div>
        </Box>
      ),
    },
    {
      field: "supplier",
      headerName: "Supplier",
      flex: 1,
      renderCell: (params) => (
        <Box
          width={"100%"}
          height={"100%"}
          display="flex"
          alignItems={"center"}
          gap={1}
        >
          <p>{params.row.supplier_details.company_name}</p>
        </Box>
      ),
    },
    { field: "price", headerName: "Price", type: "number", flex: 0.75 },
    {
      field: "cost_price",
      headerName: "Cost price",
      type: "number",
      flex: 0.75,
    },

    { field: "stock", headerName: "Stock", type: "number", flex: 0.5 },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      // flex: 1,
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
          <Link
            to={`/products/${params.row.id}`}
            className="action-detail-link"
            style={{
              color: "#733ab0",
              cursor: "pointer",
              width: "100%",
              // display: "flex",
              // justifyContent: "center",
              // alignItems: "center",
            }}
          >
            Details
          </Link>
        </Box>
      ),
    },
  ];
  const paginationModel = { page: 0, pageSize: 6 };

  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts();
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const [selectedProduct, setSelectedProduct] = useState(null);
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };
  // handle delete product
  const handleDeleteProduct = async () => {
    try {
      await productService.deleteProduct(selectedProduct.id);
      toast.success("Product deleted successfully");
      // Cập nhật lại danh sách sản phẩm sau khi xóa
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  return (
    <div className="product-page">
      <div className="page-content">
        <div className="header">
          <h3 className="title">Products</h3>
          <div className="actions">
            <Link className="btn btn-add" to={`/products/add`}>
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
              Add Product
            </Link>
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
              <button type="button" className="status-item active">
                All Stock
              </button>

              <button type="button" className="status-item">
                Low Stock
              </button>

              <button type="button" className="status-item">
                Out Of Stock
              </button>
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
                placeholder="Search product by name ..."
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

              {openFilter && (
                <FilterPopup
                  priceField={true}
                  stockField={true}
                  quantitySoldField={true}
                  mainCategoryField={true}
                  subCategoryField={true}
                />
              )}
            </div>
          </div>
        </div>

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
              rows={products}
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
      {/* <div className="statistics-side"></div> */}
    </div>
  );
};

export default ProductPage;
