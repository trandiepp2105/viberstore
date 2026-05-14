import React from "react";
import { Link } from "react-router-dom";
import style from "./Footer.module.scss";
const Footer = () => {
  const listPaymentBg = [
    "https://cdn2.cellphones.com.vn/x35,webp/media/wysiwyg/apple-pay-og.png",
    "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/vnpay-logo.png",
    "https://cdn2.cellphones.com.vn/x/media/wysiwyg/momo_1.png",
    "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/onepay-logo.png",
    "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/mpos-logo.png",
    "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/kredivo-logo.png",
    "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/zalopay-logo.png",
    "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/alepay-logo.png",
    "https://cdn2.cellphones.com.vn/x/media/wysiwyg/fundiin.png",
  ];

  const listPolicies = [
    "Mua hàng và thanh toán Online",
    "Mua hàng trả góp Online",
    "Mua hàng trả góp bằng thẻ tín dụng",
    "Chính sách giao hàng",
    "Tra điểm Smember",
    "Xem ưu đãi Smember",
    "Tra cứu thông tin bảo hành",
    "Tra cứu hóa đơn điện tử",
    "Tra cứu thông tin hóa đơn mua hàng",
    "Trung tâm bảo hành chính hãng",
    "Quy định về sao lưu dữ liệu",
    "Chính sách khui hộp sản phẩm Apple",
  ];

  const listServices = [
    "Khách hàng doanh nghiệp (B2B)",
    "Ưu đãi thanh toán",
    "Quy chế hoạt động",
    "Chính sách bảo mật thông tin cá nhân",
    "Chính sách bảo hành",
    "Liên hệ hợp tác kinh doan",
    "Tuyển dụng",
    "Dịch vụ bảo hành mở rộng",
  ];

  const listSocialNetworks = [
    {
      link: "https://www.youtube.com/@CellphoneSOfficial",
      logo: "https://cdn2.cellphones.com.vn/44x,webp/media/logo/social/cellphones-youtube.png",
    },
    {
      link: "https://www.facebook.com/CellphoneSVietnam",
      logo: "https://cdn2.cellphones.com.vn/44x,webp/media/logo/social/cellphones-facebook.png",
    },
    {
      link: "https://www.instagram.com/cellphonesvn/",
      logo: "https://cdn2.cellphones.com.vn/44x,webp/media/logo/social/cellphones-instagram.png",
    },
    {
      link: "https://www.tiktok.com/@cellphones.official",
      logo: "https://cdn2.cellphones.com.vn/44x,webp/media/logo/social/cellphones-tiktok.png",
    },
    {
      link: "https://oa.zalo.me/3894196696036261863",
      logo: "https://cdn2.cellphones.com.vn/44x,webp/media/logo/social/cellphones-zalo.png",
    },
  ];

  const listCorpMembers = [
    {
      name: "Hệ thống bảo hành sửa chữa Điện thoại - Máy tính",
      logoLink:
        "https://cdn2.cellphones.com.vn/x30,webp/media/logo/corp-members/dienthoaivui.png",
    },
    {
      name: "Trung tâm bảo hành ủy quyền của Apple",
      logoLink:
        "https://cdn2.cellphones.com.vn/x/media/wysiwyg/Logo_CareS_1.png",
    },
    {
      name: "Kênh thông tin giải trí công nghệ cho giới trẻ",
      logoLink:
        "https://cdn2.cellphones.com.vn/x30,webp/media/logo/corp-members/schanel.png",
    },
    {
      name: "Trang thông tin công nghệ mới nhất",
      logoLink:
        "https://cdn2.cellphones.com.vn/x30,webp/media/logo/corp-members/sforum.png",
    },
  ];

  const listSummaryCate = [
    [
      ["Back to school là gì", "Điện thoại", "Điện thoại Iphone"],
      ["Điện thoại Iphone 15", "Điện thoại Iphone 15 Pro Max"],
    ],
    [
      ["Điện thoại Vivo", "Điện thoại OPPO", "Điện thoại Xiaomi"],
      ["Điện thoại Samsung Galaxy", "Samsung Galaxy A"],
    ],
    [
      ["Laptop", "Laptop Acer", "Laptop Dell", "Laptop HP"],
      ["Tivi", "Tivi Samsung", "Tivi Sony", "Tivi LG", "Tivi TCL"],
    ],
    [
      ["Nhà thông minh", "Máy hút bụi gia đình", "Cân điện tử"],
      ["Đồ gia dụng", "Nồi chiên không dầu giá rẻ", "Nồi cơm điện"],
    ],
  ];
  return (
    <div className={style.footer}>
      <div className={style.blockFooterTop}>
        <div className={style.container}>
          <div className={style.columns}>
            <div className={style.column}>
              <div className={style.switchboardPhoneNumbers}>
                <p className={style.title}>Tổng đài hỗ trợ miễn phí</p>
                <div className={style.boxContent}>
                  <ul className={style.listSwitchboard}>
                    <li className={style.switchboard}>
                      <div>
                        Gọi mua hàng
                        <Link className={style.tel}>
                          <strong>1800.2097</strong>
                        </Link>
                        (7h30 - 22h00)
                      </div>
                    </li>
                    <li className={style.switchboard}>
                      <div>
                        Gọi khiếu nại
                        <Link className={style.tel}>
                          <strong>1800.2063</strong>
                        </Link>
                        (8h00 - 21h30)
                      </div>
                    </li>
                    <li className={style.switchboard}>
                      <div>
                        Gọi bảo hành
                        <Link className={style.tel}>
                          <strong>1800.2064</strong>
                        </Link>
                        (8h00 - 21h00)
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className={style.payGateWay}>
                <div className={style.payGateWayTitle}>
                  <p className={style.title}>Phương thức thanh toán</p>
                </div>
                <div className={style.boxContent}>
                  <ul className={style.listLink}>
                    {listPaymentBg.map((paymentBg, index) => (
                      <li key={index} className={style.paymentMethod}>
                        <Link>
                          {" "}
                          <img
                            src={paymentBg}
                            alt=""
                            className={style.bgPayment}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={style.subcriberForm}>
                <p className={style.subcriberTitle}>
                  ĐĂNG KÝ NHẬN THÔNG TIN KHUYẾN MÃI
                </p>
                <p className={`${style.subcriberTitle} ${style.redText}`}>
                  (*) Nhận ngay voucher 10%
                </p>
                <p className={style.subcriberTip}>
                  *Voucher sẽ được gửi sau 24h, chỉ áp dụng cho khách hàng mới
                </p>

                <div className={style.inputControl}>
                  <input
                    type="text"
                    name="EMAIL"
                    placeholder="Email *"
                    required="required"
                    className={`${style.input} ${style.subcriberInput}`}
                  />
                </div>
                <div className={style.inputControl}>
                  <input
                    type="tel"
                    name="SMS"
                    placeholder="Số điện thoại"
                    required="required"
                    className={`${style.input} ${style.subcriberInput}`}
                  />
                </div>

                <div className={style.wrapperCheckboxFormRule}>
                  <label htmlFor="" className={style.subcriberLabelFormRule}>
                    <input
                      type="checkbox"
                      className={style.subcriberFormRuleCheckbox}
                      checked="checked"
                      value={1}
                    />
                    <Link className={style.subcriberFormRule}>
                      Tôi đồng ý với điều khoản của CellphoneS
                    </Link>
                  </label>
                </div>

                <div className={style.groupButton}>
                  <button
                    className={`${style.subcriberButton} ${style.button}`}
                  >
                    ĐĂNG KÝ NGAY
                  </button>
                </div>
              </div>
            </div>
            <div className={style.column}>
              <p className={style.title}>Thông tin và chính sách</p>
              <div className={style.boxContent}>
                <ul className={style.listLink}>
                  {listPolicies.map((popicy, index) => (
                    <li key={index} className={style.link}>
                      <Link>{popicy}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={style.column}>
              <p className={style.title}>Dịch vụ và thông tin khác</p>

              <div className={style.boxContent}>
                <ul className={style.listLink}>
                  {listServices.map((service, index) => (
                    <li key={index} className={style.link}>
                      <Link>{service}</Link>
                    </li>
                  ))}

                  <li className={style.link}>
                    <div className={style.appDowloader}>
                      <p className={style.appDowloaderTitle}>
                        <img src="/assets/images/s-red-logo.svg" alt="" />
                        Smember: Tích điểm & sử dụng ưu đãi
                      </p>

                      <div className={style.appDowloaderContent}>
                        <img
                          src="https://cdn2.cellphones.com.vn/200x,webp/media/wysiwyg/QR_appGeneral.jpg"
                          alt="QR tải app"
                          loading="lazy"
                          className={style.QRImg}
                        />

                        <div className={style.listAppStore}>
                          <Link className={style.appStore}>
                            <img
                              src="https://cdn2.cellphones.com.vn/200x,webp/media/wysiwyg/downloadANDROID.png"
                              alt="Tải app từ Google Play"
                              loading="lazy"
                            ></img>
                          </Link>

                          <Link className={style.appStore}>
                            <img
                              src="https://cdn2.cellphones.com.vn/200x,webp/media/wysiwyg/downloadiOS.png"
                              alt="Tải app từ App Store"
                              loading="lazy"
                            ></img>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className={style.column}>
              <p className={style.title}>Kết nối với CellphoneS</p>
              <div className={style.listSocial}>
                {listSocialNetworks.map((socialNetwork, index) => (
                  <div className={style.socialLogo}>
                    <Link to={socialNetwork.link}>
                      <img
                        src={socialNetwork.logo}
                        loading="lazy"
                        alt="logo social"
                      />
                    </Link>
                  </div>
                ))}
              </div>
              <p className={style.title}>Website thành viên</p>

              <div className={style.corpMembers}>
                {listCorpMembers.map((member, index) => (
                  <div className={style.corpMember}>
                    <p className={style.corpMemberName}>{member.name}</p>
                    <Link>
                      <img
                        src={member.logoLink}
                        loading="lazy"
                        alt="logo member"
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={style.blockFooterBottom}>
        <div className={style.container}>
          <div className={`${style.summaryCategory} ${style.columns}`}>
            {listSummaryCate.map((column, index) => (
              <div className={style.column}>
                {column.map((row, index) => (
                  <div className={style.row}>
                    {row.map((value, index) => (
                      <>
                        <Link className={style.rowItem}>
                          <span>{value}</span>
                        </Link>
                        {index < row.length - 1 ? <span> – </span> : null}
                      </>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className={style.companyInformation}>
            <div className={style.companyAddress}>
              <p>
                Công ty TNHH Thương Mại và Dịch Vụ Kỹ Thuật DIỆU PHÚC - GPĐKKD:
                0316172372 cấp tại Sở KH &amp; ĐT TP. HCM. Địa chỉ văn phòng:
                350-352 Võ Văn Kiệt, Phường Cô Giang, Quận 1, Thành phố Hồ Chí
                Minh, Việt Nam. Điện thoại: 028.7108.9666.
              </p>
            </div>
            <div className={style.companyCertification}>
              <Link
                to="http://online.gov.vn/Home/WebDetails/75641"
                className={style.companyCertificationLink}
              >
                <img
                  src="https://cdn2.cellphones.com.vn/80x,webp/media/logo/logoSaleNoti.png"
                  alt="Đã thông báo"
                  loading="lazy"
                  className={style.companyCertificationLogo}
                />
              </Link>
              <Link
                target="_blank"
                rel="noopener nofollow"
                href="https://www.dmca.com/Protection/Status.aspx?ID=158f5667-cce3-4a18-b2d1-826225e6b022&amp;refurl=https://cellphones.com.vn/"
                title="DMCA.com Protection Status"
                className={style.companyCertificationLink}
              >
                <img
                  src="https://images.dmca.com/Badges/dmca_copyright_protected150c.png?ID=158f5667-cce3-4a18-b2d1-826225e6b022"
                  className={style.companyCertificationLogo}
                  alt="DMCA.com Protection Status"
                  loading="lazy"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
