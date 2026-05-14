import React, { useState, useEffect } from "react";
import "./HomePages.scss";
import { Link } from "react-router-dom";
import ProductContainer from "../../components/ProductContainer/ProductContainer";
import productService from "../../services/productService";

const HomePage = () => {
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);

  const fetchNewArrivalProducts = async () => {
    try {
      const response = await productService.getNewArrivalProducts(20);
      setNewArrivalProducts(response);
    } catch (error) {
      console.error("Error while fetching new arrival products", error);
      // toast.error("Error while fetching new arrival products");
    }
  };

  useEffect(() => {
    fetchNewArrivalProducts();
  }, []);

  return (
    <div className="page home-page">
      <div className="main-banner">
        <img src="/assets/banner/home-banner.png" alt="" />
      </div>
      <div className="home-page-inner">
        <div className="block-featured-product">
          <div className="product-list-title">
            <Link
              to="/collections?collection=NEW ARRIVAL"
              className="title-link"
            >
              NEW ARRIVAL
            </Link>
            <p>Some description for this category</p>
          </div>
          <div className="wrapper-list-product">
            <div className="list-product">
              {newArrivalProducts?.map((product, index) => {
                return (
                  <div className="product-contaner" key={product.id}>
                    <ProductContainer
                      key={index}
                      productGeneralInfo={product}
                      className="product-item"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
