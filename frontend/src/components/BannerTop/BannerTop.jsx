import React from "react";
import { Link } from "react-router-dom";
import style from "./BannerTop.module.css";
const BannerTop = () => {
  const imagePaths = [
    "/assets/images/bannerTop1.svg",
    "/assets/images/bannerTop2.svg",
    "/assets/images/bannerTop3.svg",
  ];
  return (
    <div className={style.bannerTop}>
      <div className={style.bannerTopContent}>
        {imagePaths.map((path, index) => (
          <Link key={index} className={style.bannerSlice} to={"/"}>
            <img src={path} alt="banner top" className={style.bannerTopImg} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BannerTop;
