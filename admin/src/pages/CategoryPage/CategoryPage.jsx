import React, { useRef, useEffect, useState } from "react";
import "./CategoryPage.scss";
import FilterPopup from "../../components/FilterPopup/FilterPopup";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";

import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import PopupCreateCategory from "../../components/PopupCreateCategory/PopupCreateCategory";
import AcceptancePopup from "../../components/AcceptancePopup/AcceptancePopup";
import categoryService from "../../services/categoryService";
const CategoryPage = () => {
  const listCategoryRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const [distanceListProductToBottom, setDistanceListProductToBottom] =
    useState(0);

  useEffect(() => {
    const updatePosition = () => {
      if (listCategoryRef.current) {
        const rect = listCategoryRef.current.getBoundingClientRect();
        setDistanceListProductToBottom(window.innerHeight - rect.top);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  //   const listCategoryRef = useRef(null);

  const columns = [
    {
      field: "id",
      headerName: "Categories ID",
      //   width: 120,
      flex: 1,
      sortable: false,
      hidable: false,
      filterable: false,
      valueFormatter: (params) => `#${params}`,
    },
    { field: "name", headerName: "Category Name", flex: 1.5 },
    // {
    //   field: "icon_url",
    //   headerName: "Icon Category",
    //   //   width: 150,
    //   flex: 1,
    //   justifyContent: "center",
    //   sortable: false,
    //   filterable: false,
    //   renderCell: (params) => (
    //     <Box
    //       width={"100%"}
    //       height={"100%"}
    //       display="flex"
    //       alignItems={"center"}
    //       gap={1}
    //     >
    //       <div
    //         style={{
    //           width: "100%",
    //           height: "100%",
    //           display: "flex",
    //           justifyContent: "center",
    //           alignItems: "center",
    //           gap: "10px",
    //         }}
    //       >
    //         <span className="wrapper-cate-icon">
    //           <img src="/assets/kid-svgrepo-com.svg" alt="" />
    //         </span>
    //       </div>
    //     </Box>
    //   ),
    // },
    { field: "description", headerName: "Description", flex: 3 },
    {
      field: "action",
      headerName: "Action",
      width: 100,
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
          gap={2}
        >
          <Link
            to={`/categories/${params.row.id}`}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Show products");
            }}
            className="action-detail-link"
            style={{
              color: "#733ab0",
              cursor: "pointer",
              height: "fit-content",
              display: "flex",
              alignItems: "center",
              //   width: "50%",
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
          </Link>
          <button
            className="action-detail-link delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleDeleteCategoryPopup();
              setSelectedCategory(params.row);
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

  const paginationModel = { page: 0, pageSize: 6 };

  const [isOpenCreateCategoryPopup, setIsOpenCreateCategoryPopup] =
    useState(false);

  const handleToggleCreateCategoryPopup = () => {
    setIsOpenCreateCategoryPopup(!isOpenCreateCategoryPopup);
  };

  const [isOpenDeleteCategoryPopup, setIsOpenDeleteCategoryPopup] =
    useState(false);

  const handleToggleDeleteCategoryPopup = () => {
    setIsOpenDeleteCategoryPopup(!isOpenDeleteCategoryPopup);
  };

  const [selectedCategory, setSelectedCategory] = useState(null);

  const hanleDeleteCategory = async () => {
    try {
      await categoryService.deleteCategory(selectedCategory.id);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };
  return (
    <div className="category-page">
      {isOpenCreateCategoryPopup && (
        <PopupCreateCategory
          handleToggle={handleToggleCreateCategoryPopup}
          fetchCategory={fetchCategories}
        />
      )}

      {isOpenDeleteCategoryPopup && (
        <AcceptancePopup
          description="Are you sure you want to delete this product category? All products in this category will be deleted."
          handleClose={handleToggleDeleteCategoryPopup}
          handleAccept={() => {
            hanleDeleteCategory();
            handleToggleDeleteCategoryPopup();
          }}
        />
      )}
      <div className="page-content">
        <div className="header">
          <div className="left-side">
            <h3 className="title">Categories</h3>
            <p className="page-description">
              Organize your product by creating categories
            </p>
          </div>
        </div>
        <div className="statistics-side">
          <div className="categories-statistics">
            <div className="category-statistics-item">
              <div className="wrapper-cate-icon">
                <div className="cate-icon">
                  <img src="/assets/men-fashion.svg" alt="" />
                </div>
              </div>
              <p className="cate-name">Total Men's Fashsion</p>
              <div className="category-statistics-item__footer">
                <p className="product-count">70</p>
                <Link
                  to={`/products?category_id=${1}`}
                  className="show-products-link"
                >
                  Show Products
                </Link>
              </div>
            </div>
            <div className="category-statistics-item">
              <div className="wrapper-cate-icon">
                <div className="cate-icon">
                  <img src="/assets/women-fashion.svg" alt="" />
                </div>
              </div>
              <p className="cate-name">Total Women's Fashsion</p>
              <div className="category-statistics-item__footer">
                <p className="product-count">100</p>
                <Link
                  to={`/products?category_id=${1}`}
                  className="show-products-link"
                >
                  Show Products
                </Link>
              </div>
            </div>
            <div className="category-statistics-item">
              <div className="wrapper-cate-icon">
                <div className="cate-icon">
                  <img src="/assets/kid-svgrepo-com.svg" alt="" />
                </div>
              </div>
              <p className="cate-name">Total Kid's Fashsion</p>
              <div className="category-statistics-item__footer">
                <p className="product-count">150</p>
                <Link
                  to={`/products?category_id=${1}`}
                  className="show-products-link"
                >
                  Show Products
                </Link>
              </div>
            </div>
          </div>
          {/* <div className="product-quick-access"></div> */}
        </div>
        <div className="quick-access-bar">
          <div className="left-side">
            <p>Categories</p>
          </div>
          <div className="right-side">
            {/* <div className="search-bar">
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
                placeholder="Search orders ..."
                className="search-input"
              />
            </div> */}
            <div className="wrapper-filter-box wrapper-select-date-box">
              <button
                className="toggle-filter-popup-btn togle-select-date-box"
                onClick={handleToggleCreateCategoryPopup}
              >
                <svg
                  width="25px"
                  height="25px"
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
                    <g id="Edit / Add_Plus">
                      {" "}
                      <path
                        id="Vector"
                        d="M6 12H12M12 12H18M12 12V18M12 12V6"
                        stroke="#5a5858"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />{" "}
                    </g>{" "}
                  </g>
                </svg>
                Add Category
              </button>
            </div>
          </div>
        </div>
        <div
          className="list-category"
          ref={listCategoryRef}
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
              rows={categories}
              columns={columns}
              initialState={{
                pagination: { paginationModel },
                // columns: { columnVisibilityModel: { id: false } }, // Ẩn cột ID
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
      {/* <div className="statistics-side"></div> */}
    </div>
  );
};

export default CategoryPage;
