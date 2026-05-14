import React from "react";
import { Link } from "react-router-dom";
import style from "./BannerTop.module.css";
const BannerTop = () => {
  const imagePaths = [
    `${process.env.PUBLIC_URL}/assets/images/member.svg`,
    `${process.env.PUBLIC_URL}/assets/images/delivery.svg`,
    `${process.env.PUBLIC_URL}/assets/images/phone.svg`,
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
