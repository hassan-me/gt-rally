import { allCars } from "@/data/cars";
import React from "react";

export default function CarInfo({ carItem = allCars[0] }) {
  return (
    <>
      <div className="icon-box flex flex-wrap">
        <div className="icons flex-three">
          <i className="icon-autodeal-km1" />
          <span>{carItem.km.toLocaleString()} kms</span>
        </div>
        <div className="icons flex-three">
          <i className="icon-autodeal-diesel" />
          <span>{carItem.fuelType}</span>
        </div>
        <div className="icons flex-three">
          <i className="icon-autodeal-automatic" />
          <span>{carItem.transmission}</span>
        </div>
        <div className="icons flex-three">
          <i className="icon-autodeal-owner" />
          <span>1st owner</span>
        </div>
      </div>
      <div className="money text-color-3 font">
        ${carItem.price.toLocaleString()}
      </div>
      <div className="price-wrap">
        <p className="fs-12 lh-16 text-color-2">
          Monthly installment payment:
          <span className="fs-14 fw-5 font">$4,000</span>
        </p>
        <p className="fs-12 lh-16">New car price: $100.000</p>
      </div>
      <ul className="action-icon flex flex-wrap">
        <li>
          <a href="#" className="icon">
            <svg
              width={16}
              height={14}
              viewBox="0 0 16 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.75 4.1875C14.75 2.32375 13.1758 0.8125 11.234 0.8125C9.78275 0.8125 8.53625 1.657 8 2.86225C7.46375 1.657 6.21725 0.8125 4.76525 0.8125C2.825 0.8125 1.25 2.32375 1.25 4.1875C1.25 9.6025 8 13.1875 8 13.1875C8 13.1875 14.75 9.6025 14.75 4.1875Z"
                stroke="CurrentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </li>
        <li>
          <a href="#" className="icon">
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.625 14.75L1.25 11.375M1.25 11.375L4.625 8M1.25 11.375H11.375M11.375 1.25L14.75 4.625M14.75 4.625L11.375 8M14.75 4.625H4.625"
                stroke="CurrentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </li>
        <li>
          <a href="#" className="icon">
            <svg
              width={16}
              height={18}
              viewBox="0 0 16 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.41276 8.18022C4.23116 7.85345 3.94619 7.59624 3.60259 7.44895C3.25898 7.30167 2.8762 7.27265 2.51432 7.36645C2.15244 7.46025 1.83196 7.67157 1.60317 7.96722C1.37438 8.26287 1.25024 8.62613 1.25024 8.99997C1.25024 9.37381 1.37438 9.73706 1.60317 10.0327C1.83196 10.3284 2.15244 10.5397 2.51432 10.6335C2.8762 10.7273 3.25898 10.6983 3.60259 10.551C3.94619 10.4037 4.23116 10.1465 4.41276 9.81972M4.41276 8.18022C4.54776 8.42322 4.62501 8.70222 4.62501 8.99997C4.62501 9.29772 4.54776 9.57747 4.41276 9.81972M4.41276 8.18022L11.5873 4.19472M4.41276 9.81972L11.5873 13.8052M11.5873 4.19472C11.6924 4.39282 11.8361 4.56797 12.0097 4.70991C12.1834 4.85186 12.3836 4.95776 12.5987 5.02143C12.8138 5.08509 13.0394 5.10523 13.2624 5.08069C13.4853 5.05614 13.7011 4.98739 13.8972 4.87846C14.0933 4.76953 14.2657 4.62261 14.4043 4.44628C14.5429 4.26995 14.645 4.06775 14.7046 3.85151C14.7641 3.63526 14.78 3.40931 14.7512 3.18686C14.7225 2.96442 14.6496 2.74994 14.537 2.55597C14.3151 2.17372 13.952 1.89382 13.5259 1.77643C13.0997 1.65904 12.6445 1.71352 12.2582 1.92818C11.8718 2.14284 11.585 2.50053 11.4596 2.92436C11.3341 3.34819 11.38 3.80433 11.5873 4.19472ZM11.5873 13.8052C11.4796 13.999 11.4112 14.2121 11.3859 14.4323C11.3606 14.6525 11.3789 14.8756 11.4398 15.0887C11.5007 15.3019 11.603 15.5009 11.7408 15.6746C11.8787 15.8482 12.0494 15.9929 12.2431 16.1006C12.4369 16.2082 12.65 16.2767 12.8702 16.302C13.0905 16.3273 13.3135 16.3089 13.5267 16.248C13.7398 16.1871 13.9389 16.0848 14.1125 15.947C14.2861 15.8092 14.4309 15.6385 14.5385 15.4447C14.7559 15.0534 14.809 14.5917 14.686 14.1612C14.563 13.7307 14.274 13.3668 13.8826 13.1493C13.4913 12.9319 13.0296 12.8789 12.5991 13.0019C12.1686 13.1249 11.8047 13.4139 11.5873 13.8052Z"
                stroke="CurrentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </li>
        <li>
          <a href="#" className="icon">
            <svg
              width={16}
              height={18}
              viewBox="0 0 16 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.04 10.3718C3.86 10.3943 3.68 10.4183 3.5 10.4438M4.04 10.3718C6.66969 10.0418 9.33031 10.0418 11.96 10.3718M4.04 10.3718L3.755 13.5M11.96 10.3718C12.14 10.3943 12.32 10.4183 12.5 10.4438M11.96 10.3718L12.245 13.5L12.4167 15.3923C12.4274 15.509 12.4136 15.6267 12.3762 15.7378C12.3388 15.8489 12.2787 15.951 12.1996 16.0376C12.1206 16.1242 12.0244 16.1933 11.9172 16.2407C11.8099 16.288 11.694 16.3125 11.5767 16.3125H4.42325C3.92675 16.3125 3.53825 15.8865 3.58325 15.3923L3.755 13.5M3.755 13.5H2.9375C2.48995 13.5 2.06072 13.3222 1.74426 13.0057C1.42779 12.6893 1.25 12.2601 1.25 11.8125V7.092C1.25 6.28125 1.826 5.58075 2.62775 5.46075C3.10471 5.3894 3.58306 5.32764 4.0625 5.2755M12.2435 13.5H13.0618C13.2834 13.5001 13.5029 13.4565 13.7078 13.3718C13.9126 13.287 14.0987 13.1627 14.2555 13.006C14.4123 12.8493 14.5366 12.6632 14.6215 12.4585C14.7063 12.2537 14.75 12.0342 14.75 11.8125V7.092C14.75 6.28125 14.174 5.58075 13.3723 5.46075C12.8953 5.38941 12.4169 5.32764 11.9375 5.2755M11.9375 5.2755C9.32022 4.99073 6.67978 4.99073 4.0625 5.2755M11.9375 5.2755V2.53125C11.9375 2.0655 11.5595 1.6875 11.0938 1.6875H4.90625C4.4405 1.6875 4.0625 2.0655 4.0625 2.53125V5.2755M12.5 7.875H12.506V7.881H12.5V7.875ZM10.25 7.875H10.256V7.881H10.25V7.875Z"
                stroke="CurrentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </li>
      </ul>
    </>
  );
}
