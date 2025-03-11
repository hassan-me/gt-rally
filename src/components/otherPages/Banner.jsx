import React from "react";

export default function Banner(props) {
  const { heading, description} = props;
  return (
    <section className="tf-banner style-1">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="content relative z-2">
              <div className="heading">
                <h1 className="text-color-1">
                  {heading}
                </h1>
                <p className="text-color-1 fs-18 fw-4 lh-22 font">
                  {description}
                </p>
                {/* <a href="#" className="sc-button btn-svg">
                  <span>Search for your favorite car</span>
                  <i className="icon-autodeal-next" />
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
