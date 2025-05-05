import React, { useState, useEffect, useContext } from "react";
import style from "./NavBar.module.scss";
import { Link, useNavigate } from "react-router-dom";
import ModalLogin from "../ModalLogin/ModalLogin";
import userService from "../../services/userService";
import LogoutPopup from "../LogoutPopup/LogoutPopup";
import WaitingOverlay from "../WaitingOverlay/WaitingOverlay";
import AlertPopup from "../AlertPopup/AlertPopup";
import addTemporaryComponent from "../../utils/renderAlertPopup";
import { AppContext } from "../../App";
import SearchProductBox from "../SearchProductBox/SearchProductBox";
import categoryService from "../../services/categoryService";
import productService from "../../services/productService";
// toast
const NavBar = () => {
  const navigate = useNavigate();
  const { isUserLogin, setIsUserLogin, shoppingCart } = useContext(AppContext);

  const [categories, setCategories] = useState([]);
  const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
  const [isOpenLogoutPopup, setIsOpenLogoutPopup] = useState(false);
  const [onLogout, setOnLogout] = useState(false);

  const handleCloseModalLogin = () => {
    setIsOpenLoginModal(false);
  };

  const handleCloseLogoutPopup = () => {
    setIsOpenLogoutPopup(false);
  };
  const handleLogout = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpenLogoutPopup(false);
    setOnLogout(true);
    try {
      await userService.logout();
      addTemporaryComponent(<AlertPopup />, 1000);

      setIsUserLogin(false);
      navigate("/");
    } catch (error) {
      console.error("Error while logging out", error);
    } finally {
      setOnLogout(false);
    }
  };

  const handleSearchProducts = async (searchValue) => {
    try {
      const response = await productService.getProducts({
        search: searchValue,
      });
      console.log("searchResult", response);
      setSearchResult(response);
    } catch (error) {
      console.error("Error while searching products", error);
      // Handle error (e.g., show a toast notification)
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await categoryService.getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);
  const headerItemData = [
    {
      iconPath: "/assets/images/shopping-bag.svg",
      text: ["Giỏ hàng"],
      to: "/cart",
    },
  ];

  const [onSearching, setOnSearching] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const handleSearching = async (e) => {
    e.preventDefault();
    setOnSearching(true);
    setSearchValue(e.target.value);
    if (e.target.value.length > 0) {
      await handleSearchProducts(e.target.value);
    } else {
      setSearchResult([]);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigate(`/catalogsearch?q=${searchValue}`);
    }
  };

  const handleCloseSearching = () => {
    setOnSearching(false);
    setSearchValue("");
    setSearchResult([]);
  };

  const handleClickCart = () => {
    if (!isUserLogin) {
      setIsOpenLoginModal(true);
      return;
    }
    navigate("/cart");
  };
  return (
    <div className={style.wrapperNavBar}>
      <div className={style.navBar}>
        {onLogout && <WaitingOverlay />}
        {isOpenLoginModal && <ModalLogin handleClose={handleCloseModalLogin} />}
        {isOpenLogoutPopup && (
          <LogoutPopup
            handleClose={handleCloseLogoutPopup}
            handleLogout={handleLogout}
          />
        )}
        <Link to={"/"} className={style.homeButton}>
          <div className={style.logoDesktop}></div>
          <div className={style.brandName}>viberstrore</div>
        </Link>
        <div className={style.wrapperMenu}>
          <div className={style.mainMenu}>
            <div className={style.wrapperMenuItem}>
              <Link
                className={style.menuItem}
                to={"/collections?collection=ALL"}
              >
                <div className={style.menuItemContent}>
                  <p>ALL</p>
                </div>
              </Link>
            </div>
            <div className={style.wrapperMenuItem}>
              <Link
                className={style.menuItem}
                to={"/collections?collection=NEW ARRIVAL"}
              >
                <div className={style.menuItemContent}>
                  <p>NEW ARRIVAL</p>
                </div>
              </Link>
            </div>
            {categories?.map((category, index) => (
              <div key={index} className={style.wrapperMenuItem}>
                <div
                  // to={`/catalogsearch?cate=${category.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/catalogsearch?cate=${category.id}`);
                  }}
                  className={style.menuItem}
                >
                  <div className={style.menuItemContent}>
                    <p>{category.name.toUpperCase()}</p>
                    <span className={style.wrapperIcon}>
                      <svg
                        width="20px"
                        height="20px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <g id="SVGRepo_iconCarrier">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z"
                            fill="#000000"
                          />
                        </g>
                      </svg>
                    </span>
                  </div>
                  <div className={style.wrapperSubcategories}>
                    {category?.subcategories?.map((subcate, index) => (
                      <div className={style.subcateItem} key={index}>
                        <div
                          // to={`/catalogsearch?cate=${subcate.id}`}
                          className={style.subcateItemLink}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/catalogsearch?cate=${subcate.id}`);
                          }}
                        >
                          {subcate.name}
                        </div>
                        {/* <div className={style.subCategoriesLevel2}>
                          {subcate?.subcategories?.map((subcateLevel2) => (
                            <div className={style.subcateItem}>
                              <Link
                                to={`/catalogsearch?cate=${subcateLevel2.id}`}
                                className={style.subcateItemLink}
                              >
                                {subcateLevel2.name}
                              </Link>
                            </div>
                          ))}
                        </div> */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form action="" className={style.headerSearchForm}>
          <div className={style.boxSearch}>
            <button type="submit" className={style.searchBtn}>
              <svg
                height="15"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="search"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="svg-inline--fa fa-search"
              >
                <path
                  fill="currentColor"
                  d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
                ></path>
              </svg>
            </button>
            <input
              type="text"
              placeholder="Bạn cần tìm gì?"
              autoComplete="off"
              className={style.inputSearch}
              onChange={handleSearching}
              value={searchValue}
              onKeyDown={handleSearchSubmit}
              onFocus={() => {
                setOnSearching(true);
              }}
              onBlur={() => {
                setTimeout(() => {
                  handleCloseSearching();
                }, 200);
              }}
            />
          </div>
          {onSearching && (
            <SearchProductBox
              searchValue={searchValue}
              searchResult={searchResult}
            />
          )}
        </form>
        {headerItemData.map((data, index) => (
          <Link
            key={index}
            onClick={handleClickCart}
            className={style.headerItem}
            to={data.to}
          >
            <div
              className={`${style.wrapperBoxIcon} ${
                index === 1 ? style.wrapperTruckIcon : null
              } ${index === 2 ? style.wrapperCartIcon : null}`}
            >
              {data.text[0] === "Giỏ hàng" && (
                <span>{shoppingCart?.length}</span>
              )}
              <img
                src={process.env.PUBLIC_URL + data.iconPath}
                alt="phone"
                className={style.boxIcon}
              />
            </div>
            <div className={style.headerItemContent}>
              {/* {data.text.length < 2 ? data.text[0] : <>{"Cart"}</>} */}
            </div>
          </Link>
        ))}
        <div
          className={style.loginButton}
          onClick={() => {
            if (!isUserLogin) {
              setIsOpenLoginModal(true);
            }
          }}
        >
          {isUserLogin && (
            <div className={style.accountService}>
              <li className={style.accountServiceItem}>
                <Link
                  to={"/account/profile"}
                  className={style.accountServiceLink}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={style.accountServiceIcon}
                  >
                    <g>
                      <path
                        d="M15.7542 11.9999C16.9962 11.9999 18.003 13.0068 18.003 14.2488V14.8242C18.003 15.7185 17.6835 16.5833 17.1019 17.2627C15.5326 19.0962 13.1454 20.0011 10 20.0011C6.85414 20.0011 4.46812 19.0959 2.90182 17.2617C2.32206 16.5827 2.00354 15.7193 2.00354 14.8265V14.2488C2.00354 13.0068 3.0104 11.9999 4.25242 11.9999H15.7542ZM15.7542 13.4999H4.25242C3.83882 13.4999 3.50354 13.8352 3.50354 14.2488V14.8265C3.50354 15.3621 3.69465 15.8802 4.04251 16.2876C5.29582 17.7553 7.26169 18.5011 10 18.5011C12.7383 18.5011 14.7059 17.7552 15.9624 16.2873C16.3113 15.8797 16.503 15.3608 16.503 14.8242V14.2488C16.503 13.8352 16.1678 13.4999 15.7542 13.4999ZM10 0.00462341C12.7614 0.00462341 15 2.2432 15 5.00462C15 7.76605 12.7614 10.0046 10 10.0046C7.23857 10.0046 5 7.76605 5 5.00462C5 2.2432 7.23857 0.00462341 10 0.00462341ZM10 1.50462C8.067 1.50462 6.5 3.07163 6.5 5.00462C6.5 6.93762 8.067 8.50462 10 8.50462C11.933 8.50462 13.5 6.93762 13.5 5.00462C13.5 3.07163 11.933 1.50462 10 1.50462Z"
                        fill="#090D14"
                      ></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_757_20663">
                        <rect width="20" height="20" fill="white"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                  Thông tin cá nhân
                </Link>
              </li>
              <li className={style.accountServiceItem}>
                <Link
                  to={"/account/order?type=All"}
                  className={style.accountServiceLink}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={style.accountServiceIcon}
                  >
                    <path
                      d="M10.5911 2.51203C11.4947 2.14573 12.5053 2.14573 13.4089 2.51203L20.9075 5.552C21.5679 5.81973 22 6.46118 22 7.1738V16.8265C22 17.5391 21.5679 18.1806 20.9075 18.4483L13.4089 21.4883C12.5053 21.8546 11.4947 21.8546 10.5911 21.4883L3.09252 18.4483C2.43211 18.1806 2 17.5391 2 16.8265V7.1738C2 6.46118 2.43211 5.81973 3.09252 5.552L10.5911 2.51203ZM12.8453 3.90214C12.3032 3.68236 11.6968 3.68236 11.1547 3.90214L9.24097 4.67796L16.7678 7.60506L19.437 6.57444L12.8453 3.90214ZM14.6911 8.40689L7.21472 5.49941L4.59029 6.56338L12.0013 9.44545L14.6911 8.40689ZM3.5 16.8265C3.5 16.9283 3.56173 17.0199 3.65607 17.0582L11.1547 20.0982C11.1863 20.111 11.2183 20.1231 11.2503 20.1344V10.7628L3.5 7.74881V16.8265ZM12.8453 20.0982L20.3439 17.0582C20.4383 17.0199 20.5 16.9283 20.5 16.8265V7.77194L12.7503 10.7642V20.1342C12.7822 20.1229 12.8139 20.1109 12.8453 20.0982Z"
                      fill="#090D14"
                    ></path>
                  </svg>
                  Đơn hàng của tôi
                </Link>
              </li>
              <li className={style.accountServiceItem}>
                <Link
                  to={"/account/delivery-address"}
                  className={style.accountServiceLink}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={style.accountServiceIcon}
                  >
                    <path
                      d="M5.84303 4.56837C9.24344 1.16796 14.7566 1.16796 18.157 4.56837C21.5574 7.96878 21.5574 13.4819 18.157 16.8823L16.97 18.0562C16.0952 18.9149 14.96 20.0188 13.5642 21.3684C12.6919 22.2118 11.3081 22.2117 10.436 21.3682L6.9449 17.9723C6.50614 17.5415 6.13887 17.1782 5.84303 16.8823C2.44262 13.4819 2.44262 7.96878 5.84303 4.56837ZM17.0963 5.62903C14.2817 2.81441 9.71832 2.81441 6.90369 5.62903C4.08907 8.44366 4.08907 13.0071 6.90369 15.8217L8.39077 17.2891C9.20967 18.0906 10.2391 19.091 11.4788 20.29C11.7695 20.5711 12.2308 20.5712 12.5215 20.2901L15.9164 16.9886C16.3854 16.5283 16.7787 16.1393 17.0963 15.8217C19.911 13.0071 19.911 8.44366 17.0963 5.62903ZM12 7.99903C13.6577 7.99903 15.0016 9.34287 15.0016 11.0006C15.0016 12.6583 13.6577 14.0021 12 14.0021C10.3423 14.0021 8.99847 12.6583 8.99847 11.0006C8.99847 9.34287 10.3423 7.99903 12 7.99903ZM12 9.49903C11.1707 9.49903 10.4985 10.1713 10.4985 11.0006C10.4985 11.8299 11.1707 12.5021 12 12.5021C12.8293 12.5021 13.5016 11.8299 13.5016 11.0006C13.5016 10.1713 12.8293 9.49903 12 9.49903Z"
                      fill="#090D14"
                    ></path>
                  </svg>
                  Địa chỉ nhận hàng
                </Link>
              </li>
              <li className={style.accountServiceItem}>
                <button
                  className={style.accountServiceLink}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOpenLogoutPopup(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={style.accountServiceIcon}
                  >
                    <path
                      d="M8.50215 11.5C9.05562 11.5 9.5043 11.9487 9.5043 12.5022C9.5043 13.0556 9.05562 13.5043 8.50215 13.5043C7.94868 13.5043 7.5 13.0556 7.5 12.5022C7.5 11.9487 7.94868 11.5 8.50215 11.5ZM12 4.35418V10.5L12.0005 11.005L19.442 11.004L17.7196 9.28026C17.4534 9.01395 17.4292 8.59728 17.6471 8.3037L17.7198 8.2196C17.9861 7.95338 18.4027 7.92924 18.6963 8.14715L18.7804 8.21978L21.777 11.2174C22.043 11.4835 22.0674 11.8997 21.85 12.1933L21.7775 12.2774L18.7809 15.2808C18.4884 15.5741 18.0135 15.5746 17.7203 15.282C17.4537 15.0161 17.429 14.5994 17.6465 14.3056L17.7191 14.2214L19.432 12.504L12.0005 12.505L12 19.25C12 19.7164 11.5788 20.0697 11.1196 19.9886L2.61955 18.4873C2.26121 18.424 2 18.1126 2 17.7487V5.75002C2 5.38271 2.26601 5.06945 2.62847 5.00993L11.1285 3.6141C11.5851 3.53911 12 3.89145 12 4.35418ZM10.5 5.23739L3.5 6.3869V17.1196L10.5 18.3559V5.23739ZM13 18.5013L13.7652 18.5015L13.867 18.4946C14.2335 18.4448 14.5158 18.1304 14.5152 17.7502L14.508 13.5H13V18.5013ZM13.002 10L13 8.72536V5.00001L13.7453 5.00002C14.1245 5.00002 14.4381 5.28154 14.4883 5.64713L14.4953 5.74878L14.502 10H13.002Z"
                      fill="#090D14"
                    ></path>
                  </svg>
                  Đăng xuất
                </button>
              </li>
            </div>
          )}
          {isUserLogin ? (
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={style.userLoginLogo}
            >
              <rect width="44" height="44" rx="22" fill="#FECAB5"></rect>
              <path
                d="M22.0086 10C23.3144 10 24.5909 10.3871 25.6767 11.1123C26.7624 11.8375 27.6087 12.8683 28.1084 14.0743C28.6081 15.2803 28.7389 16.6073 28.4841 17.8876C28.2294 19.1679 27.6006 20.3439 26.6772 21.2669C25.7538 22.1899 24.5774 22.8185 23.2967 23.0732C22.0159 23.3278 20.6884 23.1971 19.482 22.6976C18.2756 22.1981 17.2444 21.3521 16.519 20.2668C15.7935 19.1814 15.4063 17.9054 15.4062 16.6C15.4115 14.8512 16.1088 13.1755 17.3458 11.9389C18.5829 10.7023 20.2592 10.0052 22.0086 10Z"
                fill="#F37021"
              ></path>
              <path
                opacity="0.95"
                d="M22.0049 39.6009C17.4561 39.5967 13.0859 37.8304 9.8125 34.6729C10.7861 32.2356 12.4672 30.1453 14.6394 28.6713C16.8117 27.1973 19.3756 26.4071 22.001 26.4024C24.6264 26.3976 27.1931 27.1786 29.3707 28.6448C31.5482 30.1109 33.2369 32.1951 34.2192 34.6289C30.9533 37.8169 26.5696 39.6013 22.0049 39.6009Z"
                fill="#13001E"
              ></path>
              <path
                opacity="0.3"
                d="M33 22.9318C33.9545 22.8636 35.7273 21.7727 36 20C36 21.4318 37.7727 22.7955 39 22.9318C38 23.1364 36 24.6909 36 26C36 24.3636 33.8182 23.1364 33 22.9318Z"
                fill="#F37021"
              ></path>
              <path
                opacity="0.3"
                d="M6 21.4432C6.79545 21.3864 8.27273 20.4773 8.5 19C8.5 20.1932 9.97727 21.3295 11 21.4432C10.1667 21.6136 8.5 22.9091 8.5 24C8.5 22.6364 6.68182 21.6136 6 21.4432Z"
                fill="#F37021"
              ></path>
              <path
                opacity="0.3"
                d="M29 6.95455C29.6364 6.90909 30.8182 6.18182 31 5C31 5.95455 32.1818 6.86364 33 6.95455C32.3333 7.09091 31 8.12727 31 9C31 7.90909 29.5455 7.09091 29 6.95455Z"
                fill="#F37021"
              ></path>
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
              className={style.userWithoutLoginLogo}
            >
              <path
                d="M17.7545 13.9999C18.9966 13.9999 20.0034 15.0068 20.0034 16.2488V17.1673C20.0034 17.7406 19.8242 18.2997 19.4908 18.7662C17.9449 20.9294 15.4206 22.0011 12.0004 22.0011C8.5794 22.0011 6.05643 20.9289 4.51427 18.7646C4.18231 18.2987 4.00391 17.7409 4.00391 17.1688V16.2488C4.00391 15.0068 5.01076 13.9999 6.25278 13.9999H17.7545ZM12.0004 2.00464C14.7618 2.00464 17.0004 4.24321 17.0004 7.00464C17.0004 9.76606 14.7618 12.0046 12.0004 12.0046C9.23894 12.0046 7.00036 9.76606 7.00036 7.00464C7.00036 4.24321 9.23894 2.00464 12.0004 2.00464Z"
                fill="inherit"
              ></path>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
