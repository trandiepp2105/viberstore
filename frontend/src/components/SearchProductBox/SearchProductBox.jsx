import React from "react";
import "./SearchProductBox.scss";
import { Link } from "react-router-dom";
import formatCurrencyVN from "../../utils/formatCurrencyVN";
import { useNavigate } from "react-router-dom";
const SearchProductBox = ({ searchResult, searchValue }) => {
  const navigate = useNavigate();
  if (!searchResult || searchResult.length <= 0) return null;
  return (
    <div className="search-product-result">
      <div className="result-container">
        {searchResult?.length > 0 &&
          searchResult.slice(0, 4).map((item, index) => (
            <Link
              to={`/productdetail/${item.slug}`}
              className="search-result-item"
            >
              <div className="title">
                <p className="product-name">{item.name}</p>
                <div className="product-price">
                  {item.sale_price !== 0 && item.sale_price !== item.price ? (
                    <>
                      <span className="original-price">
                        {formatCurrencyVN(item.price)}
                      </span>
                      <del>{formatCurrencyVN(item.sale_price)}</del>
                    </>
                  ) : (
                    <span className="original-price">
                      {formatCurrencyVN(item.price)}
                    </span>
                  )}
                </div>
              </div>
              <img src={item.image_url} alt="" />
            </Link>
          ))}

        {searchResult?.length > 4 && (
          <button
            type="button"
            className="results-more"
            onClick={() => {
              navigate(`/catalogsearch?q=${searchValue}`);
            }}
          >
            Xem thêm 10 sản phẩm
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchProductBox;
