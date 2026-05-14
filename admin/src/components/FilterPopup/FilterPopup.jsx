import React from "react";
import "./FilterPopup.scss";
import CheckBox from "../CheckBox/CheckBox";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
const FilterPopup = ({
  priceField = false,
  stockField = false,
  quantitySoldField = false,
  mainCategoryField = false,
  subCategoryField = false,
  orderStatusField = false,
  orderDateField = false,
  orderTotalField = false,
}) => {
  const listFilterOption = [
    {
      title: "Product Stock",
      options: [
        {
          id: 1,
          name: "Low Stock",
          value: "lowStock",
        },
        {
          id: 2,
          name: "Out of Stock",
          value: "outOfStock",
        },
      ],
    },
    {
      title: "Categories",
      options: [
        {
          id: 1,
          name: "Category 1",
          value: "category1",
        },
        {
          id: 2,
          name: "Category 2",
          value: "category2",
        },
        {
          id: 3,
          name: "Category 3",
          value: "category3",
        },
        {
          id: 4,
          name: "Category 3",
          value: "category3",
        },
        {
          id: 5,
          name: "Category 3",
          value: "category3",
        },
      ],
    },
  ];
  const [stockRange, setStockRange] = React.useState([0, 5000]);
  const [priceRange, setPriceRange] = React.useState([0, 10000000]);
  const [quantitySoldRange, setQuantitySoldRange] = React.useState([0, 5000]);
  const [orderTotalRange, setOrderTotalRange] = React.useState([0, 100000000]);
  const handleStockChange = (event, newValue) => {
    setStockRange(newValue);
  };

  const handleChangePrice = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleQuantitySoldChange = (event, newValue) => {
    setQuantitySoldRange(newValue);
  };

  const handleOrderTotalChange = (event, newValue) => {
    setOrderTotalRange(newValue);
  };
  const mainCategories = [
    {
      id: 1,
      name: "Men",
    },
    {
      id: 2,
      name: "Women",
    },
    {
      id: 3,
      name: "Kid",
    },
  ];

  const subCategories = [
    {
      id: 1,
      name: "T-Shirt",
    },
    {
      id: 2,
      name: "Pants",
    },
    {
      id: 3,
      name: "Shoes",
    },
  ];

  const orderStatus = [
    {
      id: 0,
      name: "ALL",
    },
    {
      id: 1,
      name: "PENDING",
    },
    {
      id: 2,
      name: "PACKED",
    },
    {
      id: 3,
      name: "DELIVERING",
    },
    {
      id: 4,
      name: "DELIVERED",
    },
    {
      id: 5,
      name: "CANCELLED",
    },
    {
      id: 6,
      name: "RETURNED",
    },
  ];
  return (
    <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
      <div className="filter-header">
        <div className="title">Filters</div>
        <button className="clear-filter-btn" type="button">
          Clear
        </button>
      </div>
      <div className="list-filter-option">
        {stockField && (
          <div className="filter-box">
            <div className="filter-box__header">
              <p className="title">{"Product stock"}</p>
              <button className="hidden-filter-box-btn">
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 20 20"
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
                      fill="#5C5F62"
                      d="M13.098 8H6.902c-.751 0-1.172.754-.708 1.268L9.292 12.7c.36.399 1.055.399 1.416 0l3.098-3.433C14.27 8.754 13.849 8 13.098 8Z"
                    />
                  </g>
                </svg>
              </button>
            </div>
            <div className="filter-box__content">
              <div className="wrapper-range">
                <div className="container">
                  <div className="range-box">
                    <input
                      type="number"
                      name=""
                      id=""
                      className="range-input first-child"
                      value={stockRange[0]}
                      onChange={(e) => {
                        const value = Math.min(
                          Number(e.target.value),
                          stockRange[1]
                        );
                        setStockRange([value, stockRange[1]]);
                      }}
                      min={0} // Giá trị nhỏ nhất
                      max={5000} // Giá trị lớn nhất
                    />
                  </div>
                  <span>~</span>
                  <div className="range-box">
                    <input
                      type="number"
                      name=""
                      id=""
                      className="range-input last-child"
                      value={stockRange[1]}
                      onChange={(e) => {
                        const value = Math.max(
                          Number(e.target.value),
                          stockRange[0]
                        );
                        setStockRange([stockRange[0], value]);
                      }}
                      min={0} // Giá trị nhỏ nhất
                      max={5000} // Giá trị lớn nhất
                    />
                  </div>
                </div>
                <Box sx={{ width: "100%", padding: "0 20px" }}>
                  <Slider
                    getAriaLabel={() => "Stock range"}
                    value={stockRange}
                    onChange={handleStockChange}
                    valueLabelDisplay="auto"
                    min={0} // Giá trị nhỏ nhất
                    max={5000} // Giá trị lớn nhất
                    step={1} // Bước nhảy
                  />
                </Box>
              </div>
            </div>
          </div>
        )}
        {priceField && (
          <div className="filter-box">
            <div className="filter-box__header">
              <p className="title">Product price</p>
              <button className="hidden-filter-box-btn">
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 20 20"
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
                      fill="#5C5F62"
                      d="M13.098 8H6.902c-.751 0-1.172.754-.708 1.268L9.292 12.7c.36.399 1.055.399 1.416 0l3.098-3.433C14.27 8.754 13.849 8 13.098 8Z"
                    />
                  </g>
                </svg>
              </button>
            </div>
            <div className="filter-box__content">
              <div className="wrapper-range">
                <div className="container">
                  <div className="range-box price-right">
                    <input
                      type="number"
                      name=""
                      id=""
                      className="range-input first-child"
                      value={priceRange[0] / 1000} // Hiển thị giá trị đã chia 1000
                      onChange={(e) => {
                        const value = Math.min(
                          Number(e.target.value) * 1000, // Nhân giá trị nhập vào với 1000
                          priceRange[1]
                        );
                        setPriceRange([value, priceRange[1]]);
                      }}
                      min={0} // Giá trị nhỏ nhất
                      max={10000} // Giá trị lớn nhất (10000000 / 1000)
                    />
                  </div>
                  <span>~</span>
                  <div className="range-box price-left">
                    <input
                      type="number"
                      name=""
                      id=""
                      className="range-input last-child"
                      value={priceRange[1] / 1000} // Hiển thị giá trị đã chia 1000
                      onChange={(e) => {
                        const value = Math.max(
                          Number(e.target.value) * 1000, // Nhân giá trị nhập vào với 1000
                          priceRange[0]
                        );
                        setPriceRange([priceRange[0], value]);
                      }}
                      min={0} // Giá trị nhỏ nhất
                      max={10000} // Giá trị lớn nhất (10000000 / 1000)
                    />
                  </div>
                </div>
                <Box sx={{ width: "100%", padding: "0 20px" }}>
                  <Slider
                    getAriaLabel={() => "Stock range"}
                    value={priceRange}
                    onChange={handleChangePrice}
                    valueLabelDisplay="auto"
                    min={0} // Giá trị nhỏ nhất
                    max={10000000} // Giá trị lớn nhất
                    step={1000} // Bước nhảy
                  />
                </Box>
              </div>
            </div>
          </div>
        )}
        {quantitySoldField && (
          <div className="filter-box">
            <div className="filter-box__header">
              <p className="title">Quantity sold</p>
              <button className="hidden-filter-box-btn">
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 20 20"
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
                      fill="#5C5F62"
                      d="M13.098 8H6.902c-.751 0-1.172.754-.708 1.268L9.292 12.7c.36.399 1.055.399 1.416 0l3.098-3.433C14.27 8.754 13.849 8 13.098 8Z"
                    />
                  </g>
                </svg>
              </button>
            </div>
            <div className="filter-box__content">
              <div className="wrapper-range">
                <div className="container">
                  <div className="range-box">
                    <input
                      type="number"
                      name=""
                      id=""
                      className="range-input first-child"
                      value={quantitySoldRange[0]}
                      onChange={(e) => {
                        const value = Math.min(
                          Number(e.target.value),
                          quantitySoldRange[1]
                        );
                        setQuantitySoldRange([value, quantitySoldRange[1]]);
                      }}
                      min={0} // Giá trị nhỏ nhất
                      max={5000} // Giá trị lớn nhất
                    />
                  </div>
                  <span>~</span>
                  <div className="range-box">
                    <input
                      type="number"
                      name=""
                      id=""
                      className="range-input last-child"
                      value={quantitySoldRange[1]}
                      onChange={(e) => {
                        const value = Math.max(
                          Number(e.target.value),
                          quantitySoldRange[0]
                        );
                        setQuantitySoldRange([quantitySoldRange[0], value]);
                      }}
                      min={0} // Giá trị nhỏ nhất
                      max={5000} // Giá trị lớn nhất
                    />
                  </div>
                </div>
                <Box sx={{ width: "100%", padding: "0 20px" }}>
                  <Slider
                    getAriaLabel={() => "Stock range"}
                    value={quantitySoldRange}
                    onChange={handleQuantitySoldChange}
                    valueLabelDisplay="auto"
                    min={0} // Giá trị nhỏ nhất
                    max={5000} // Giá trị lớn nhất
                    step={1} // Bước nhảy
                  />
                </Box>
              </div>
            </div>
          </div>
        )}
        {mainCategoryField && (
          <div className="filter-box">
            <div className="filter-box__header">
              <p className="title">Main category</p>
              <button className="hidden-filter-box-btn">
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 20 20"
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
                      fill="#5C5F62"
                      d="M13.098 8H6.902c-.751 0-1.172.754-.708 1.268L9.292 12.7c.36.399 1.055.399 1.416 0l3.098-3.433C14.27 8.754 13.849 8 13.098 8Z"
                    />
                  </g>
                </svg>
              </button>
            </div>
            <div className="filter-box__content">
              {mainCategories.map((option) => (
                <label key={option.id} className="filer-option">
                  <CheckBox name={"main-cate"} />
                  <p className="label" htmlFor={"main-cate"}>
                    {option.name}
                  </p>
                </label>
              ))}
            </div>
          </div>
        )}
        {subCategoryField && (
          <div className="filter-box">
            <div className="filter-box__header">
              <p className="title">Order status</p>
              <button className="hidden-filter-box-btn">
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 20 20"
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
                      fill="#5C5F62"
                      d="M13.098 8H6.902c-.751 0-1.172.754-.708 1.268L9.292 12.7c.36.399 1.055.399 1.416 0l3.098-3.433C14.27 8.754 13.849 8 13.098 8Z"
                    />
                  </g>
                </svg>
              </button>
            </div>
            <div className="filter-box__content">
              {subCategories.map((option) => (
                <label key={option.id} className="filer-option">
                  <CheckBox name={"sub-cate"} />
                  <p className="label" htmlFor={"sub-cate"}>
                    {option.name}
                  </p>
                </label>
              ))}
            </div>
          </div>
        )}

        {orderStatusField && (
          <div className="filter-box">
            <div className="filter-box__header">
              <p className="title">Order status</p>
              <button className="hidden-filter-box-btn">
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 20 20"
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
                      fill="#5C5F62"
                      d="M13.098 8H6.902c-.751 0-1.172.754-.708 1.268L9.292 12.7c.36.399 1.055.399 1.416 0l3.098-3.433C14.27 8.754 13.849 8 13.098 8Z"
                    />
                  </g>
                </svg>
              </button>
            </div>
            <div className="filter-box__content">
              {orderStatus.map((option) => (
                <label key={option.id} className="filer-option">
                  <CheckBox name={"order-status"} />
                  <p className="label" htmlFor={"order-status"}>
                    {option.name}
                  </p>
                </label>
              ))}
            </div>
          </div>
        )}
        {orderTotalField && (
          <div className="filter-box">
            <div className="filter-box__header">
              <p className="title">Total amount</p>
              <button className="hidden-filter-box-btn">
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 20 20"
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
                      fill="#5C5F62"
                      d="M13.098 8H6.902c-.751 0-1.172.754-.708 1.268L9.292 12.7c.36.399 1.055.399 1.416 0l3.098-3.433C14.27 8.754 13.849 8 13.098 8Z"
                    />
                  </g>
                </svg>
              </button>
            </div>
            <div className="filter-box__content">
              <div className="wrapper-range">
                <div className="container">
                  <div className="range-box price-right">
                    <input
                      type="number"
                      name=""
                      id=""
                      className="range-input first-child"
                      value={orderTotalRange[0] / 1000} // Hiển thị giá trị đã chia 1000
                      onChange={(e) => {
                        const value = Math.min(
                          Number(e.target.value) * 1000, // Nhân giá trị nhập vào với 1000
                          orderTotalRange[1]
                        );
                        setOrderTotalRange([value, orderTotalRange[1]]);
                      }}
                      min={0} // Giá trị nhỏ nhất
                      max={100000} // Giá trị lớn nhất (10000000 / 1000)
                    />
                  </div>
                  <span>~</span>
                  <div className="range-box order-left">
                    <input
                      type="number"
                      name=""
                      id=""
                      className="range-input last-child"
                      value={orderTotalRange[1] / 1000} // Hiển thị giá trị đã chia 1000
                      onChange={(e) => {
                        const value = Math.max(
                          Number(e.target.value) * 1000, // Nhân giá trị nhập vào với 1000
                          orderTotalRange[0]
                        );
                        setPriceRange([orderTotalRange[0], value]);
                      }}
                      min={0} // Giá trị nhỏ nhất
                      max={100000} // Giá trị lớn nhất (10000000 / 1000)
                    />
                  </div>
                </div>
                <Box sx={{ width: "100%", padding: "0 20px" }}>
                  <Slider
                    getAriaLabel={() => "Stock range"}
                    value={orderTotalRange}
                    onChange={handleOrderTotalChange}
                    valueLabelDisplay="auto"
                    min={0} // Giá trị nhỏ nhất
                    max={100000000} // Giá trị lớn nhất
                    step={1000} // Bước nhảy
                  />
                </Box>
              </div>
            </div>
          </div>
        )}
        {orderDateField && (
          <div className="filter-box">
            <div className="filter-box__header">
              <p className="title">Order date</p>
              <button className="hidden-filter-box-btn">
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 20 20"
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
                      fill="#5C5F62"
                      d="M13.098 8H6.902c-.751 0-1.172.754-.708 1.268L9.292 12.7c.36.399 1.055.399 1.416 0l3.098-3.433C14.27 8.754 13.849 8 13.098 8Z"
                    />
                  </g>
                </svg>
              </button>
            </div>
            <div className="filter-box__content">
              <div className="wrapper-range">
                <div className="container">
                  <div className="range-box">
                    <input
                      type="date"
                      name=""
                      id=""
                      className="range-input first-child"
                      value={"2023-10-01"} // Giá trị đã chia 1000
                      style={{ width: "100%", margin: "0", padding: "0" }}
                    />
                  </div>
                  <span>~</span>
                  <div className="range-box">
                    <input
                      type="date"
                      name=""
                      id=""
                      className="range-input last-child"
                      value={"2023-10-31"} // Giá trị đã chia 1000
                      style={{
                        width: "100%",
                        margin: "0 !important",
                        padding: "0",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="filter__footer">
        <button type="button">Cancel</button>
        <button type="button" className="apply-filter-btn">
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPopup;
