import React, { useEffect, useState } from "react";
import "./AddProductPage.scss";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import Options from "../../components/Options/Options";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import PopupVariant from "../../components/PopupVariant/PopupVariant";
import { useNavigate } from "react-router-dom";
import categoryService from "../../services/categoryService";
import supplierService from "../../services/supplierService";
import SupplierOptions from "../../components/SupplierOptions/SupplierOptions";
import PopupCreate from "../../components/PopupCreate/PopupCreate";
import AcceptancePopup from "../../components/AcceptancePopup/AcceptancePopup";
import productService from "../../services/productService";
import { toast } from "react-toastify";

const AddProductPage = () => {
  const navigate = useNavigate();

  const [tempProductData, setTempProductData] = useState({
    name: "",
    cost_price: "",
    price: "",
    description: "",
    supplier_id: null,
    publish_at: null,
    supplier: null,
  });

  const [selectedDate, setSelectedDate] = useState(dayjs());

  // State to manage the open/close state of the supplier options
  const [isOpenSupplierOption, setIsOpenSupplierOption] = useState(false);
  const handleToggleSupplierOption = () => {
    setIsOpenSupplierOption(!isOpenSupplierOption);
  };

  const [variants, setVariants] = useState([]); // State to store the list of variants
  const [variantIdCounter, setVariantIdCounter] = useState(1); // Counter for generating unique IDs

  // Function to add a new variant
  const handleAddVariant = (newVariant) => {
    setVariants((prevVariants) => [
      ...prevVariants,
      { ...newVariant, id: variantIdCounter }, // Assign the current counter value as the ID
    ]);
    setVariantIdCounter((prevCounter) => prevCounter + 1); // Increment the counter
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      sortable: false,
      filterable: false,
      hidable: false,
    },
    {
      field: "size",
      headerName: "Size",
      flex: 1,
      sortable: false,
      filterable: false,
      hidable: false,
    },
    {
      field: "color",
      headerName: "Color",
      flex: 1,
      sortable: false,
      filterable: false,
      hidable: false,
    },
    {
      field: "image_url",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <Box
          width={"100%"}
          height={"100%"}
          display="flex"
          justifyContent="center"
        >
          <img
            src={URL.createObjectURL(params.row.image_url)} // Preview the image file
            alt="Variant"
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        </Box>
      ),
      sortable: false,
      filterable: false,
      hidable: false,
    },
  ];

  const paginationModel = { page: 0, pageSize: 10 };

  // State to manage the open/close state of the add variant popup
  const [isOpenAddVariantPopup, setIsOpenAddVariantPopup] = useState(false);
  const toggleAddVariantPopup = () => {
    setIsOpenAddVariantPopup(!isOpenAddVariantPopup);
  };

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [suppliers, setSupliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const handleSelectSupplier = (option) => {
    setSelectedSupplier(option);
  };
  const handleSelectMainCategory = (option) => {
    setSelectedMainCategory(option);
    setSelectedSubCategory(null);
    setSubCategories(option.subcategories);
  };

  const handleSelectSubcategory = (option) => {
    setSelectedSubCategory(option);
  };

  const fetchMainCategories = async () => {
    try {
      const response = await categoryService.getCategories();

      setMainCategories(response);
    } catch (error) {
      console.error("Error fetching main categories:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getSuppliers();

      setSupliers(response);
    } catch (error) {
      console.error("Error fetching main categories:", error);
    }
  };

  const createSupplier = async (supplier) => {
    try {
      const response = await supplierService.createSupplier(supplier);
      setSupliers((prev) => [...prev, response]);
      setSelectedSupplier(response);
      toast.success("Create supplier successfully");
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast.error("Error creating supplier");
    }
  };
  useEffect(() => {
    fetchMainCategories();
    fetchSuppliers();
  }, []);

  const [imageFile, setImageFile] = useState(null);
  const initialSupplierInfo = {
    company_name: "Company name",
    contact_person: "Contact person",
    email: "Email",
    phone_number: "Phone Number",
    address: "Address",
    tax_id: "Tax ID",
    website: "Websie",
  };
  const [isOpenCreateSupplierPopup, setIsOpenCreateSupplierPopup] =
    useState(false);
  const toggleCreateSupplierPopup = () => {
    setIsOpenCreateSupplierPopup(!isOpenCreateSupplierPopup);
  };

  const handleCreateProduct = async () => {
    // Validate the form data
    if (
      !tempProductData.name ||
      !tempProductData.cost_price ||
      !tempProductData.price ||
      !tempProductData.description ||
      !selectedMainCategory ||
      !selectedSubCategory ||
      !selectedSupplier ||
      !imageFile
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    // post form data to server
    const formData = new FormData();
    console.log("product data:", tempProductData);
    formData.append("name", tempProductData.name);
    formData.append("cost_price", tempProductData.cost_price);
    formData.append("price", tempProductData.price);
    formData.append("description", tempProductData.description);
    formData.append("supplier", selectedSupplier.id);
    // formData.append("release_date", selectedDate);
    formData.append("image_url", imageFile);
    formData.append("publish_at", selectedDate.format("YYYY-MM-DD"));
    formData.append("category_id", selectedSubCategory.id);

    try {
      const response = await productService.createProduct(formData);
      console.log("Product created successfully:", response);
      toast.success("Product created successfully");
      navigate(`/products/${response.id}`, {
        state: { openVariant: true },
      });
    } catch (error) {
      toast.error("Error creating product");
      console.error("Error creating product:", error);
    }
  };

  const [isOpenAcceptancePopup, setIsOpenAcceptancePopup] = useState(false);
  const handleToggleAcceptancePopup = () => {
    setIsOpenAcceptancePopup(!isOpenAcceptancePopup);
  };
  return (
    <div className="page product-detail-page">
      {isOpenAddVariantPopup && (
        <PopupVariant
          handleToggle={toggleAddVariantPopup}
          handleAddVariant={handleAddVariant} // Pass the function to add a variant
        />
      )}
      {isOpenCreateSupplierPopup && (
        <PopupCreate
          handleToggle={toggleCreateSupplierPopup}
          initData={initialSupplierInfo}
          popupName="supplier"
          handleSubmit={createSupplier}
        />
      )}
      {isOpenAcceptancePopup && (
        <AcceptancePopup
          handleAccept={() => {
            handleCreateProduct();
            handleToggleAcceptancePopup();
          }}
          handleClose={handleToggleAcceptancePopup}
          description="Are you sure you want to save this product?"
          acceptBtnText="Save"
        />
      )}
      <div className="page-content">
        <div className="header">
          <div className="left-side">
            <button className="back-btn" onClick={() => navigate(-1)}>
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
              <h2 className="product-name">Add new product</h2>
            </div>
          </div>
          <div className="right-side">
            <div className="list-quick-btn">
              {/* <button className="btn quick-btn delete-product-btn">
                Deltete Product
              </button> */}
              <button
                className="btn quick-btn add-supplier-btn"
                onClick={toggleCreateSupplierPopup}
              >
                Add Supplier
              </button>

              <button
                className="btn quick-btn save-product-btn"
                onClick={handleToggleAcceptancePopup}
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div className="wrapper-product-info">
          <div className="product-info">
            <div className="left-side">
              <div className="info-container category-container">
                <p className="title">Category</p>

                <div className="info-item">
                  <p className="info-title">Main Category</p>

                  <CustomSelect
                    selectedOption={selectedMainCategory}
                    handleSelectOption={handleSelectMainCategory}
                    options={mainCategories}
                    optionName="main category"
                  />
                </div>

                <div className="info-item">
                  <p className="info-title">Subcategory</p>
                  <CustomSelect
                    selectedOption={selectedSubCategory}
                    handleSelectOption={handleSelectSubcategory}
                    options={subCategories}
                    optionName="subcategory"
                  />
                </div>
              </div>
              <div className="info-container">
                <p className="title">Product image</p>

                <div className="preview-image-section">
                  <div className="preview-image-list">
                    <div className="preview-image-item">
                      {imageFile && (
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Preview"
                        />
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    name="image_file"
                    id="image_file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="image_file" className="add-new-image-btn">
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
                          d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />{" "}
                        <path
                          d="M12 16V3M12 3L16 7.375M12 3L8 7.375"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />{" "}
                      </g>
                    </svg>
                    Add Image
                  </label>
                </div>
              </div>
            </div>
            <div className="right-side">
              <div className="info-container">
                <p className="title">General Information</p>
                <div className="wrapper-info-item">
                  <div className="info-item">
                    <p className="info-title">Product Name</p>
                    <div className="wrapper-info-input">
                      <input
                        type="text"
                        name=""
                        id=""
                        className="info-input"
                        placeholder="product name"
                        // disabled={true}
                        value={tempProductData.name}
                        onChange={(e) => {
                          setTempProductData((prev) => {
                            return {
                              ...prev,
                              name: e.target.value,
                            };
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="wrapper-info-item three-column">
                  <div className="info-item">
                    <p className="info-title">Cost Price</p>
                    <div className="wrapper-info-input">
                      <span className="unit">VND</span>
                      <input
                        type="text"
                        name=""
                        id=""
                        className="info-input"
                        // disabled={true}
                        // value="2000000"
                        placeholder="200.000"
                        value={tempProductData.cost_price}
                        onChange={(e) => {
                          setTempProductData((prev) => {
                            return {
                              ...prev,
                              cost_price: e.target.value,
                            };
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="info-item">
                    <p className="info-title">Selling Price</p>
                    <div className="wrapper-info-input">
                      <span className="unit">VND</span>
                      <input
                        type="text"
                        name=""
                        id=""
                        className="info-input"
                        placeholder="200.000"
                        // disabled={true}
                        // value="2000000"
                        value={tempProductData.price}
                        onChange={(e) => {
                          setTempProductData((prev) => {
                            return {
                              ...prev,
                              price: e.target.value,
                            };
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="wrapper-info-item">
                  <div className="info-item">
                    <p className="info-title">Product description</p>
                    <div className="wrapper-info-input">
                      <input
                        type="text"
                        name=""
                        id=""
                        className="info-input"
                        placeholder="Something about the product"
                        value={tempProductData.description}
                        onChange={(e) => {
                          setTempProductData((prev) => {
                            return {
                              ...prev,
                              description: e.target.value,
                            };
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="wrapper-info-item two-column">
                  <div className="info-item">
                    <p className="info-title">Release day</p>
                    <div className="wrapper-info-input date-picker">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Chọn ngày"
                          value={selectedDate}
                          onChange={(newValue) => setSelectedDate(newValue)}
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
                    <p className="info-title">Supplier</p>
                    <div
                      className="wrapper-info-input"
                      onClick={handleToggleSupplierOption}
                    >
                      <div className="wrapper-options">
                        <div className="selected-value">
                          {selectedSupplier?.company_name || "Select supplier"}
                        </div>
                        <svg
                          width="25px"
                          height="25px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="dropdown-icon"
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
                              d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z"
                              fill="#878282"
                            />{" "}
                          </g>
                        </svg>
                      </div>
                      {isOpenSupplierOption && (
                        <SupplierOptions
                          options={suppliers}
                          selectedOption={selectedSupplier}
                          handleSelect={handleSelectSupplier}
                          optionName={"supplier"}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="info-container variant-container">
                <div className="title ">
                  <p>Manage Variant</p>
                  <button
                    className="add-new-variant-btn"
                    onClick={toggleAddVariantPopup}
                  >
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
                    Add Variant
                  </button>
                </div>

                <div className="list-variant">
                  <Paper sx={{ height: "100%", width: "100%" }}>
                    <DataGrid
                      rows={variants} // Use the variants state
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
                      //   autoPageSize={false}
                      //   pageSize={10}
                    />
                  </Paper>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
