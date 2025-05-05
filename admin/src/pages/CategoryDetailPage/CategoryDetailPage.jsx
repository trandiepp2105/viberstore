import React, { useRef, useEffect, useState } from "react";
import "./CategoryDetailPage.scss";
import FilterPopup from "../../components/FilterPopup/FilterPopup";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";

import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

import PopupCreateCategory from "../../components/PopupCreateCategory/PopupCreateCategory";
import AcceptancePopup from "../../components/AcceptancePopup/AcceptancePopup";
import categoryService from "../../services/categoryService";
import { useNavigate } from "react-router-dom";
// toast
import { toast } from "react-toastify";
const CategoryDetailPage = () => {
  const { id } = useParams(); // Lấy id từ URL
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [temporaryCategory, setTemporaryCategory] = useState({});
  const fetchCategory = async () => {
    try {
      const response = await categoryService.getCategory(id);

      setTemporaryCategory({
        name: response.name,
        description: response.description,
      });
      setCategory(response);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const handleUpdateCategory = async () => {
    // if (!temporaryCategory.name) {
    //   alert("Please enter a category name");
    //   return;
    // }
    // if (!temporaryCategory.description) {
    //   alert("Please enter a category description");
    //   return;
    // }

    // if (
    //   temporaryCategory.name === category.name &&
    //   temporaryCategory.description === category.description
    // ) {
    //   alert("Category has not changed");
    //   return;
    // }

    if (
      temporaryCategory.name === category.name &&
      temporaryCategory.description === category.description
    ) {
      toast.error("Category has not changed");
      return;
    }
    if (!temporaryCategory.name) {
      toast.error("Please enter a category name");
      return;
    }
    if (!temporaryCategory.description) {
      toast.error("Please enter a category description");
      return;
    }
    try {
      const response = await categoryService.updateCategory(id, {
        name: temporaryCategory.name,
        description: temporaryCategory.description,
      });
      if (response) {
        setTemporaryCategory({
          name: response.name,
          description: response.description,
        });
        fetchCategory();
        toast.success("Category updated successfully");
      }
      console.log("Category updated successfully:", response);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error updating category");
    }
  };

  const handleDeleteMainCategory = async () => {
    try {
      await categoryService.deleteCategory(id);
      toast.success("Category deleted successfully");
      navigate("/categories");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category");
    }
  };

  const handleDeleteSubCategory = async (subCategoryId) => {
    try {
      await categoryService.deleteCategory(subCategoryId);
      toast.success("Subcategory deleted successfully");
      fetchCategory();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error("Error deleting subcategory");
    } finally {
      handleToggleDeleteSubCategoryPopup();
    }
  };
  useEffect(() => {
    fetchCategory();
  }, [id]);

  const listCategoryRef = useRef(null);
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
          //   justifyContent="space-between"
        >
          <Link
            to={`/categories/${params.row.id}`}
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
            onClick={() => {
              setSelectedSubCategory(params.row);
              handleToggleDeleteSubCategoryPopup();
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

  const [isOpenCreateCategoryModal, setIsOpenCreateCategoryModal] =
    useState(false);

  const handleToggleCreateCategoryModal = () => {
    setIsOpenCreateCategoryModal(!isOpenCreateCategoryModal);
  };

  const [isOpenDeleteCategoryPopup, setIsOpenDeleteCategoryPopup] =
    useState(false);
  const handleToggleDeleteCategoryPopup = () => {
    setIsOpenDeleteCategoryPopup(!isOpenDeleteCategoryPopup);
  };

  const [isOpenDeleteSubCategoryPopup, setIsOpenDeleteSubCategoryPopup] =
    useState(false);

  const handleToggleDeleteSubCategoryPopup = () => {
    setIsOpenDeleteSubCategoryPopup(!isOpenDeleteSubCategoryPopup);
  };

  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  return (
    <div className="category-detail-page">
      {isOpenCreateCategoryModal && (
        <PopupCreateCategory
          parentCaregoryId={id}
          handleToggle={handleToggleCreateCategoryModal}
          fetchCategory={fetchCategory}
        />
      )}

      {isOpenDeleteCategoryPopup && (
        <AcceptancePopup
          description="Are you sure you want to delete this product category? All products in this category will be deleted."
          handleClose={handleToggleDeleteCategoryPopup}
          handleAccept={() => {
            handleDeleteMainCategory();
            handleToggleDeleteCategoryPopup();
            navigate("/categories");
          }}
        />
      )}

      {isOpenDeleteSubCategoryPopup && (
        <AcceptancePopup
          description="Are you sure you want to delete this product subcategory? All products in this subcategory will be deleted."
          handleClose={handleToggleDeleteSubCategoryPopup}
          handleAccept={() => handleDeleteSubCategory(selectedSubCategory.id)}
        />
      )}
      <div className="page-content">
        <div className="header">
          <div className="left-side">
            <div className="title">
              <Link to="/categories" className="back-link">
                Categories
              </Link>
              <span>
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
                    <path
                      d="M10 7L15 12L10 17"
                      stroke="#5a5858"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />{" "}
                  </g>
                </svg>
              </span>
              <p className="main-cate-name">Men's Fashsion</p>
            </div>
            <p className="page-description">
              Organize your product by creating categories
            </p>
          </div>
          <div className="right-side">
            <button className="save-btn" onClick={handleUpdateCategory}>
              SAVE
            </button>
            <button
              className="delete-btn"
              onClick={handleToggleDeleteCategoryPopup}
            >
              DELETE
            </button>
          </div>
        </div>

        <div className="category-info">
          <div className="wrapper-info-item three-column">
            <div className="info-item">
              <p className="info-title">Category Name</p>
              <div className="wrapper-info-input">
                <input
                  type="text"
                  name=""
                  id=""
                  className="info-input"
                  value={temporaryCategory ? temporaryCategory.name : ""}
                  onChange={(e) =>
                    setTemporaryCategory({
                      ...temporaryCategory,
                      name: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            {/* <div className="info-item">
              <p className="info-title">Icon Category</p>
              <div className="wrapper-cate-icon">
                <div className="cate-icon">
                  <img src="/assets/kid-svgrepo-com.svg" alt="" />
                </div>
                <input
                  type="file"
                  name="cate-icon-file"
                  id="custom-select-icon"
                  className="custom-select-icon"
                />
                <label
                  className="label-custom-select-icon"
                  htmlFor="custom-select-icon"
                >
                  <svg
                    width="25px"
                    height="25px"
                    viewBox="0 0 1024 1024"
                    class="icon"
                    version="1.1"
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
                        d="M736.68 435.86a173.773 173.773 0 0 1 172.042 172.038c0.578 44.907-18.093 87.822-48.461 119.698-32.761 34.387-76.991 51.744-123.581 52.343-68.202 0.876-68.284 106.718 0 105.841 152.654-1.964 275.918-125.229 277.883-277.883 1.964-152.664-128.188-275.956-277.883-277.879-68.284-0.878-68.202 104.965 0 105.842zM285.262 779.307A173.773 173.773 0 0 1 113.22 607.266c-0.577-44.909 18.09-87.823 48.461-119.705 32.759-34.386 76.988-51.737 123.58-52.337 68.2-0.877 68.284-106.721 0-105.842C132.605 331.344 9.341 454.607 7.379 607.266 5.417 759.929 135.565 883.225 285.262 885.148c68.284 0.876 68.2-104.965 0-105.841z"
                        fill="#4A5699"
                      />

                      <path
                        d="M339.68 384.204a173.762 173.762 0 0 1 172.037-172.038c44.908-0.577 87.822 18.092 119.698 48.462 34.388 32.759 51.743 76.985 52.343 123.576 0.877 68.199 106.72 68.284 105.843 0-1.964-152.653-125.231-275.917-277.884-277.879-152.664-1.962-275.954 128.182-277.878 277.879-0.88 68.284 104.964 68.199 105.841 0z"
                        fill="#C45FA0"
                      />

                      <path
                        d="M545.039 473.078c16.542 16.542 16.542 43.356 0 59.896l-122.89 122.895c-16.542 16.538-43.357 16.538-59.896 0-16.542-16.546-16.542-43.362 0-59.899l122.892-122.892c16.537-16.542 43.355-16.542 59.894 0z"
                        fill="#F39A2B"
                      />

                      <path
                        d="M485.17 473.078c16.537-16.539 43.354-16.539 59.892 0l122.896 122.896c16.538 16.533 16.538 43.354 0 59.896-16.541 16.538-43.361 16.538-59.898 0L485.17 532.979c-16.547-16.543-16.547-43.359 0-59.901z"
                        fill="#F39A2B"
                      />

                      <path
                        d="M514.045 634.097c23.972 0 43.402 19.433 43.402 43.399v178.086c0 23.968-19.432 43.398-43.402 43.398-23.964 0-43.396-19.432-43.396-43.398V677.496c0.001-23.968 19.433-43.399 43.396-43.399z"
                        fill="#E5594F"
                      />
                    </g>
                  </svg>
                  Change Icon
                </label>
              </div>
            </div> */}
          </div>
          <div className="wrapper-info-item">
            <div className="info-item">
              <p className="info-title">Description</p>
              <div className="wrapper-info-input">
                <input
                  type="text"
                  name=""
                  id=""
                  className="info-input"
                  value={temporaryCategory ? temporaryCategory.description : ""}
                  onChange={(e) =>
                    setTemporaryCategory({
                      ...temporaryCategory,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="quick-access-bar">
          <div className="left-side">
            <p>Subcategories</p>
          </div>
          <div className="right-side">
            <div className="wrapper-filter-box wrapper-select-date-box">
              <button
                className="toggle-filter-popup-btn togle-select-date-box"
                onClick={handleToggleCreateCategoryModal}
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
                Add Subcategory
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
              rows={category ? category.subcategories : []}
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

export default CategoryDetailPage;
