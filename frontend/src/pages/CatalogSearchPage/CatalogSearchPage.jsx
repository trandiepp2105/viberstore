import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import "./CatalogSearchPage.scss";
import { Link } from "react-router-dom";
import ProductContainer from "../../components/ProductContainer/ProductContainer";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
const CatalogSearchPage = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const listFilter = [
    "Price: low to high",
    "Price: high to low",
    "Name: A-Z",
    "Name: Z-A",
    "Newest",
    "Oldest",
  ];
  const [filter, setFilter] = useState(listFilter[2]); // Default to the first filter

  const fetchProducts = async (params = {}) => {
    try {
      const response = await productService.getProducts(params);
      setProducts(response);
    } catch (error) {
      console.error("Error while fetching products", error);
      // Handle error (e.g., show a notification)
    }
  };

  const fetchParentCategory = async (categoryID) => {
    try {
      const response = await categoryService.getCategory(categoryID);
      setParentCategory(response);
    } catch (error) {
      console.error("Error while fetching categories", error);
      // Handle error (e.g., show a notification)
    }
  };

  const fetchCategory = async (categoryID) => {
    try {
      const response = await categoryService.getCategory(categoryID);
      setCategory(response);
      console.log("category", response);
      if (response && response.parent && response.parent !== null) {
        await fetchParentCategory(response.parent); // Use the current response's parent
        return;
      }

      setParentCategory(null);
    } catch (error) {
      console.error("Error while fetching categories", error);
      // Handle error (e.g., show a notification)
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    const queryParams = new URLSearchParams(location.search);
    const searchQueryParam = queryParams.get("q");
    const cateParam = queryParams.get("cate");
    if (cateParam) {
      fetchCategory(cateParam);
    }
    setSearchQuery(searchQueryParam);
    // setCategory(categoryParam);
    var sortBy = "";
    switch (filter) {
      case "Price: low to high":
        sortBy = "price";
        break;
      case "Price: high to low":
        sortBy = "price";
        break;
      case "Name: A-Z":
        sortBy = "name";
        break;
      case "Name: Z-A":
        sortBy = "name";
        break;
      case "Newest":
        sortBy = "date";
        break;
      case "Oldest":
        sortBy = "date";
        break;

      default:
        sortBy = "name";
        break;
    }

    // sort value
    var sortValue = "";
    switch (filter) {
      case "Price: low to high":
        sortValue = "asc";
        break;
      case "Price: high to low":
        sortValue = "desc";
        break;
      case "Name: A-Z":
        sortValue = "asc";
        break;
      case "Name: Z-A":
        sortValue = "desc";
        break;
      case "Newest":
        sortValue = "desc";
        break;
      case "Oldest":
        sortValue = "asc";
        break;
      default:
        sortValue = "asc";
        break;
    }
    // Fetch products based on the search query and category
    const params = {
      search: searchQueryParam,
      category: cateParam,
    };
    fetchProducts(params);
  }, [location.search, filter]); // Dependency là location.search và filter

  return (
    <div className="page catalog-search-page">
      <div className="navigator">
        <Link className="navigator-item" to="/">
          Trang chủ
        </Link>
        {searchQuery ? (
          <div className="navigator-item">Search</div>
        ) : (
          <>
            <Link className="navigator-item">Danh mục</Link>
            {parentCategory && (
              <Link
                className="navigator-item"
                to={`/catalogsearch/?cate=${parentCategory?.id}`}
              >
                {`${parentCategory?.name}`}
              </Link>
            )}
            <Link
              className="navigator-item"
              to={`/catalogsearch/?cate=${category?.id}`}
            >
              {category?.name || "All"}
            </Link>
          </>
        )}
      </div>
      {searchQuery && (
        <div className="search-description">
          <h1>Tìm kiếm</h1>
          <p className="subtxt">Có 10 sản phẩm được tìm thấy</p>
          <p className="subtxt-result">
            Kết quả tìm kiếm cho <strong>{`"${searchQuery}"`}</strong>
          </p>
        </div>
      )}
      <div className="filter-bar">
        <div className="wrapper-filter-box">
          <button className="toggle-filter-btn">
            <svg
              fill="#000000"
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              id="filter-alt"
              data-name="Flat Line"
              xmlns="http://www.w3.org/2000/svg"
              class="icon flat-line"
              transform="rotate(90)"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0" />

              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g id="SVGRepo_iconCarrier">
                <path
                  id="secondary"
                  d="M5,17a2,2,0,1,0,2,2A2,2,0,0,0,5,17ZM12,3a2,2,0,1,0,2,2A2,2,0,0,0,12,3Zm7,7a2,2,0,1,0,2,2A2,2,0,0,0,19,10Z"
                  style={{
                    fill: "#2ca9bc",
                    strokeWidth: 2,
                  }}
                />

                <path
                  id="primary"
                  d="M5,3V17M12,7V21m7-7v7m0-11V3"
                  style={{
                    fill: "none",
                    stroke: "#000000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                  }}
                />

                <path
                  id="primary-2"
                  data-name="primary"
                  d="M5,17a2,2,0,1,0,2,2A2,2,0,0,0,5,17ZM12,3a2,2,0,1,0,2,2A2,2,0,0,0,12,3Zm7,7a2,2,0,1,0,2,2A2,2,0,0,0,19,10Z"
                  style={{
                    fill: "none",
                    stroke: "#000000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                  }}
                />
              </g>
            </svg>
            <span>Filter</span>
          </button>
        </div>
        {category && (
          <div className="title">
            <p>{`${parentCategory ? parentCategory.name + " - " : ""}${
              category.name
            }`}</p>
          </div>
        )}
        <div className="wrapper-order-box">
          <div className="select">
            <div className="selected-option">{filter}</div>
            <div className="dropdown-icon">
              <svg
                fill="#bababa"
                width="20px"
                height="20px"
                viewBox="-6.5 0 32 32"
                version="1.1"
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
                  <title>dropdown</title>{" "}
                  <path d="M18.813 11.406l-7.906 9.906c-0.75 0.906-1.906 0.906-2.625 0l-7.906-9.906c-0.75-0.938-0.375-1.656 0.781-1.656h16.875c1.188 0 1.531 0.719 0.781 1.656z" />{" "}
                </g>
              </svg>
            </div>
            <div className="options">
              {listFilter.map((option, index) => (
                <div
                  className={`option ${filter === option ? "selected" : ""}`} // Highlight selected option
                  key={index}
                  onClick={() => setFilter(option)} // Apply filter on click
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="catalog-list">
        <div className="catalog-list-inner">
          {products.map((product, index) => {
            return (
              <div className="catalog-item" key={index}>
                <ProductContainer productGeneralInfo={product} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CatalogSearchPage;
