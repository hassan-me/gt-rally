import React from "react";

export default function DownloadApp({ parentClass = "tf-section-banner" }) {
  return (
    <section className={parentClass}>
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="tf-image-box style2 bg-black flex-three">
              <div className="image">
                <img
                  className="lazyload"
                  data-src="/assets/images/img-box/find-car-4.png"
                  alt="images"
                  src="/assets/images/img-box/find-car-4.png"
                  width={247}
                  height={275}
                />
              </div>
              <div className="content">
                <h2 className="text-color-1">
                  <a href="#">Download Our App</a>
                </h2>
                <p className="text-color-1">
                  Whether you're racing, spectating, or planning your next rally adventure, AutoRally is the app for you.
                </p>
                <div className="flex gap-8">
                  <a href="#">
                    <img
                      className="lazyload"
                      data-src="/assets/images/section/app-store.png"
                      alt="images"
                      src="/assets/images/section/app-store.png"
                      width={140}
                      height={48}
                    />
                  </a>
                  <a href="#">
                    <img
                      className="lazyload"
                      data-src="/assets/images/section/google-play.png"
                      alt="images"
                      src="/assets/images/section/google-play.png"
                      width={160}
                      height={48}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="tf-image-box style2 bg-orange flex-three">
              <div className="image">
                <img
                  className="lazyload"
                  data-src="/assets/images/img-box/find-car-4.png"
                  alt="images"
                  src="/assets/images/img-box/find-car-4.png"
                  width={247}
                  height={275}
                />
              </div>
              <div className="content">
                <h2 className="text-color-1">
                  <a href="#">Looking for Your Next Rally Beast?</a>
                </h2>
                <p className="text-color-1">
                Find high-performance rally cars, event details, and racing opportunities—all in one place. Get ready to hit the track!
                </p>
                <a href="#" className="find-cars">
                  <span>Find cars</span>
                  <i className="icon-autodeal-search" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
