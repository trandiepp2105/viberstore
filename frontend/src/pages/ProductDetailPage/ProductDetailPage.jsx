import React, { useEffect, useState, useContext } from "react";
import "./ProductDetailPage.scss";

import { useParams, useNavigate } from "react-router-dom";

import productService from "../../services/productService";
import formatCurrencyVN from "../../utils/formatCurrencyVN";
import ModalLogin from "../../components/ModalLogin/ModalLogin";
import { AppContext } from "../../App";
import cartSurvice from "../../services/cartSurvice";
import { Link } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast for notifications
import ProductContainer from "../../components/ProductContainer/ProductContainer";
const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setOnLoading, isUserLogin } = useContext(AppContext);
  const [product, setProduct] = useState({});
  const [isOpenModalLogin, setIsOpenModalLogin] = useState(false);
  const [productVariantGroup, setProductVariantGroup] = useState({
    colors: [],
    sizes: [],
    images: {},
  });
  const [selectedColor, setSelectedColor] = useState(null); // State for selected color
  const [selectedSize, setSelectedSize] = useState(null); // State for selected size
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [variants, setVariants] = useState([]); // State to store variants
  const [category, setCategory] = useState(null);
  const fetchNewArrivalProducts = async () => {
    try {
      const response = await productService.getNewArrivalProducts();
      setNewArrivalProducts(response);
    } catch (error) {
      console.error("Error while fetching new arrival products", error);
      // toast.error("Error while fetching new arrival products");
    }
  };
  const getCategory = async (slug) => {
    try {
      const response = await productService.getProductCategories(slug);
      setCategory(response);
    } catch (error) {
      console.error("Error while fetching product categories", error);
      // toast.error("Error while fetching product categories");
    }
  };
  const handleToggleModalLogin = () => {
    setIsOpenModalLogin(!isOpenModalLogin);
  };
  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      toast.error("Please select both color and size before adding to cart."); // Show error if not selected
      return;
    }

    const selectedVariant = variants.find(
      (variant) =>
        variant.color === selectedColor.id && variant.size === selectedSize.id
    );

    if (!selectedVariant) {
      toast.error("Selected variant is not available."); // Handle case where variant is not found
      return;
    }

    const variantId = selectedVariant.id; // Get variant_id

    if (!isUserLogin) {
      handleToggleModalLogin();
      return;
    }

    setOnLoading(true);
    try {
      const response = await cartSurvice.addProductToCart(quantity, variantId);
      console.log("Add to cart response:", response);
      if (response) {
        // Toastify notification
        toast.success("Product added to cart successfully!");
        navigate("/cart");
      }
    } catch (error) {
      console.error("Error while adding product to cart:", error);
      toast.error("Failed to add product to cart.");
    } finally {
      setOnLoading(false);
    }
    // Add logic to add the variant to the cart using variantId
  };

  const [quantity, setQuantity] = useState(1);

  const handleIncreaseQuantity = () => {
    if (selectedColor && selectedSize) {
      const selectedVariant = variants.find(
        (variant) =>
          variant.color_details.name === selectedColor.name &&
          variant.size_details.name === selectedSize.name
      );
      if (selectedVariant && quantity < selectedVariant.stock) {
        setQuantity((prevQuantity) => prevQuantity + 1);
      }
    }
  };

  const handleDecreaseQuantity = () => {
    if (selectedColor && selectedSize) {
      setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color); // Set selected color
    setSelectedSize(null); // Reset size
    setQuantity(1); // Reset quantity
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size); // Set selected size
    setQuantity(1); // Reset quantity
  };

  const fetchProductDetails = async (slug) => {
    try {
      const productData = await productService.getProductBySlug(slug);
      setProduct(productData);

      const updatedVariantGroup = { colors: [], sizes: {}, images: {} };
      productData.variants.forEach((variant) => {
        const { color, size, image_url } = variant;

        if (!updatedVariantGroup.colors.includes(color)) {
          updatedVariantGroup.colors.push(color);
          updatedVariantGroup.sizes[color] = [];
          updatedVariantGroup.images[color] = image_url;
        }

        if (!updatedVariantGroup.sizes[color].includes(size)) {
          updatedVariantGroup.sizes[color].push(size);
        }
      });

      setProductVariantGroup(updatedVariantGroup); // Update state
      console.log("product", productData);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
    }
  };

  const fetchProductVariantsBySlug = async (slug) => {
    try {
      const fetchedVariants = await productService.getProductVariantsBySlug(
        slug
      ); // Fetch variants by slug
      setVariants(fetchedVariants); // Store fetched variants in state

      const updatedVariantGroup = { colors: [], sizes: {}, images: {} };

      fetchedVariants.forEach((variant) => {
        const { color_details, size_details, image_url } = variant;

        if (
          !updatedVariantGroup.colors.some(
            (color) => color.id === color_details.id
          )
        ) {
          updatedVariantGroup.colors.push(color_details); // Add color details
          updatedVariantGroup.images[color_details.name] = image_url;
          updatedVariantGroup.sizes[color_details.name] = []; // Initialize sizes for this color
        }

        if (
          !updatedVariantGroup.sizes[color_details.name].some(
            (size) => size.id === size_details.id
          )
        ) {
          updatedVariantGroup.sizes[color_details.name].push(size_details); // Add size details for the color
        }
      });

      setProductVariantGroup(updatedVariantGroup); // Update state
    } catch (error) {
      console.error("Failed to fetch product variants by slug:", error);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    fetchNewArrivalProducts();
    if (slug) {
      fetchProductDetails(slug);
      fetchProductVariantsBySlug(slug);
      getCategory(slug);
    }
  }, [slug]);
  useEffect(() => {
    console.log("product data", product);
  }, [product]);
  useEffect(() => {
    console.log("category", category);
  }, [category]);
  return (
    <div className="page product-detail-page">
      {isOpenModalLogin && <ModalLogin handleClose={handleToggleModalLogin} />}
      <div className="navigator">
        <Link className="navigator-item" to="/">
          Trang chủ
        </Link>
        {category && (
          <Link
            className="navigator-item"
            to={`/catalogsearch/?cate=${category?.id}`}
          >
            {category?.name}
          </Link>
        )}
        {category && category?.subcategories.length > 0 && (
          <Link
            className="navigator-item"
            to={`/catalogsearch/?cate=${category?.subcategories[0]?.id}`}
          >
            {category?.subcategories[0]?.name}
          </Link>
        )}
        <Link className="navigator-item" to={`/productdetail/${product?.id}`}>
          {product?.name}
        </Link>
      </div>
      <div className="product-detail">
        <div className="images-side">
          {
            <div className="image-container">
              <img src={`${product.image_url}`} alt="" />
            </div>
          }
          {productVariantGroup.colors.map((color, index) => (
            <div className="image-container" key={index}>
              <img
                src={`${productVariantGroup.images[color.name]}`}
                alt={color.name}
              />
            </div>
          ))}
        </div>
        <div className="add-to-cart-side">
          <div className="product-title">
            <h1>{product?.name}</h1>
            <span className="sku">SKU: shyteddywhite1</span>
          </div>
          <div className="product-price">
            <span className="pro-price">
              {formatCurrencyVN(
                product.discount_price || product.selling_price
              )}
            </span>
            {product.selling_price !== product.discount_price && (
              <del>{formatCurrencyVN(product.selling_price)}</del>
            )}
          </div>
          <div className="wrapper-color-variants">
            <p className="title">COLOR:</p>
            <div className="variants">
              {productVariantGroup.colors.map((color, index) => (
                <div
                  className={`variant-color-item ${
                    selectedColor?.name === color.name ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => handleColorChange(color)} // Call handleColorChange
                >
                  <img
                    src={`${productVariantGroup.images[color.name]}`}
                    className="color-image"
                    alt={color.name}
                  />
                  <span>{color.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="wrapper-variants">
            <p className="title">SIZE:</p>
            <div className="variants">
              {selectedColor &&
                productVariantGroup.sizes[selectedColor?.name]?.map(
                  (size, index) => (
                    <div
                      className={`variant-item ${
                        selectedSize?.name === size.name ? "selected" : ""
                      }`}
                      key={index}
                      onClick={() => handleSizeChange(size)} // Call handleSizeChange
                    >
                      <input
                        type="radio"
                        name="size"
                        id={size.name}
                        checked={selectedSize?.name === size.name}
                        readOnly
                      />
                      <label htmlFor={size.name}>{size.name}</label>
                    </div>
                  )
                )}
            </div>
          </div>
          <div className="selector-actions">
            <div className="quantity-area">
              <input
                type="button"
                value="-"
                onClick={handleDecreaseQuantity}
                className="qty-btn btn-left-quantity"
                disabled={!selectedColor || !selectedSize || quantity <= 1} // Disable if no color/size or quantity <= 1
              />
              <input
                type="text"
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                className="quantity-selector"
                readOnly
              />
              <input
                type="button"
                value="+"
                onClick={handleIncreaseQuantity}
                className="qty-btn btn-right-quantity"
                disabled={
                  !selectedColor ||
                  !selectedSize ||
                  variants.find(
                    (variant) =>
                      variant.color_details.name === selectedColor.name &&
                      variant.size_details.name === selectedSize.name
                  )?.stock <= quantity // Disable if no color/size or quantity exceeds stock
                }
              />
            </div>
            <div className="wrap-addcart">
              <button
                type="button"
                id="add-to-cart"
                className="btn-addtocart"
                name="add"
                onClick={handleAddToCart} // Call handleAddToCart
              >
                Thêm vào giỏ
              </button>

              <button
                type="button"
                id="buy-now"
                className="btn-addtocart"
                name="add"
              >
                Mua ngay
              </button>
            </div>
          </div>
          <div className="product-description">
            <div className="product-detail-info">
              <div className="nav-bar">
                <div className="nav-item">
                  <p>Mô Tả</p>
                </div>
                <div className="nav-item">
                  <p>Chính sách đổi trả</p>
                </div>
                <div className="nav-item active">
                  <p>Hướng dẫn mua hàng</p>
                </div>
              </div>
              <div className="tab-content">
                <div className="tab-pane">
                  <strong>Hướng dẫn sử dụng website của cửa hàng:</strong>
                  <p>- Các bước mua hàng tại&nbsp;Web TSUN:</p>
                  <p>
                    + Chọn sản phẩm -&gt; chọn Size sản phẩm -&gt; thêm vào giỏ
                    hàng -&gt; thanh toán
                  </p>
                  <p>
                    (Trong trường hợp các bạn mua nhiều sản phẩm, các bạn thêm
                    từng sản phẩm vào giỏ hàng, sau khi&nbsp;đã&nbsp;đủ sản phẩm
                    và số lượng , các bạn vui lòng kiểm tra thật kỹ giỏ hàng
                    và&nbsp;ấn THANH TOÁN)
                  </p>
                  <p>
                    + Thanh toán -&gt;&nbsp;Điền&nbsp;đầy&nbsp;đủ thông tin
                    -&gt; Tên -&gt; Số&nbsp;Điện Thoại -&gt;&nbsp;Địa chỉ nhận
                    hàng - &gt; Mail.
                  </p>
                  <p>
                    (&nbsp;Đơn hàng thành công là khi các
                    bạn&nbsp;điền&nbsp;đầy&nbsp;đủ thông tin và chính xác, các
                    bạn cần&nbsp;điền&nbsp;đầy&nbsp;đủ thông tin và Mail&nbsp;để
                    TSUN có thể xác nhận&nbsp;đơn hàng qua Mail cho các bạn.)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="block-featured-product">
        <div className="product-list-title">
          <Link
            to={"/collections?collection=NEW ARRIVAL"}
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
                <div className="wrapper-product-item" key={product.id}>
                  <ProductContainer
                    key={index}
                    productGeneralInfo={product}
                    // className="product-item"
                  />
                </div>
              );
            })}
          </div>
        </div>
        {/* <HorizontalScrollBar similarProducts={newArrivalProducts} /> */}
      </div>
    </div>
  );
};

export default ProductDetailPage;
