import React from "react";
import styles from "./ProductContainer.module.scss";
import formatCurrencyVN from "../../utils/formatCurrencyVN";
import { Link } from "react-router-dom";

const ProductContainer = ({ className, productGeneralInfo }) => {
  return (
    <Link
      className={`${styles.productContainer} ${className}`}
      to={`/productdetail/${productGeneralInfo.slug}`}
    >
      <div className={styles.productInfor}>
        <div className={styles.productLink}>
          <div className={styles.productImage}>
            <img
              src={`${productGeneralInfo.image_url}`}
              alt={productGeneralInfo.name}
              className={styles.productImg}
            />
          </div>
          <div className={styles.productName}>
            <h3>{productGeneralInfo.name}</h3>
          </div>
          <div className={styles.boxPrice}>
            <div className={styles.priceShow}>
              {productGeneralInfo.sale_price !== 0 &&
              productGeneralInfo.sale_price !== productGeneralInfo.price
                ? formatCurrencyVN(productGeneralInfo.sale_price)
                : formatCurrencyVN(productGeneralInfo.price)}
            </div>
            <div className={styles.priceThrough}>
              {productGeneralInfo.sale_price !== 0 &&
                productGeneralInfo.sale_price !== productGeneralInfo.price &&
                formatCurrencyVN(productGeneralInfo.price)}
            </div>
            <div className={styles.pricePercent}>
              <p className={styles.pricePercentDetail}>Giảm&nbsp;66%</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.productRating}>
        <div className={styles.boxRating}>
          {Array(5)
            .fill()
            .map((_, index) => (
              <div className={styles.wapperIconStar} key={index}>
                <img
                  src="/assets/images/rating-star.svg"
                  alt=""
                  className={styles.iconStar}
                />
              </div>
            ))}
        </div>
      </div>
    </Link>
  );
};

export default ProductContainer;
