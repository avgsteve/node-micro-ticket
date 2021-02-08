import 'bootstrap/dist/css/bootstrap.css';
// 每個頁面都要 import 一次屬於頁面自己的 css
// 才能作為 global
// https://github.com/vercel/next.js/blob/master/errors/css-global.md

import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({
  Component, // pages 資料夾裡面的 Component Page
  pageProps,
  currentUser,
}) => {
  console.log("Component in _app.js: ", Component);
  // LandingPage(_ref)

  console.log("pageProps in _app.js: ", pageProps);
  //  {
  //   id: "601d7b08960972002f86e92a",
  //   email: "qwe@sdas.com",
  //   iat: 1612544776,
  // };

  console.log("currentUser in _app.js: ", currentUser);
  //  {
  //   id: "601d7b08960972002f86e92a",
  //   email: "qwe@sdas.com",
  //   iat: 1612544776,
  // };

  //
  // 在瀏覽器顯示的 Components
  return (
    <div>
      {/* 導覽列  */}
      <Header currentUser={currentUser} />

      {/* Component: 包在 .container 裡面增加邊界的距離(不然會滿版) */}
      <div className="container">
        <Component
          currentUser={currentUser} // 傳進屬性名稱為 currentUser 的資料到Components
          {...pageProps} //
        />
      </div>
    </div>
  );
};;

AppComponent.getInitialProps = async (appContext) => {
  // console.log('Object.keys(appContext)', Object.keys(appContext));
  // [ 'AppTree', 'Component', 'router', 'ctx' ]

  // console.log('appContext.Component: ', appContext.Component);
  //    {
  //  displayName: 'ErrorPage',
  //   getInitialProps: [Function: _getInitialProps],
  //  origGetInitialProps: [Function: _getInitialProps]
  // }
  // console.log('appContext in AppComponent.getInitialProps: \n', appContext);
  const axiosClient = buildClient(appContext.ctx);
  // 要透過 .ctx 才能取得 req 跟 res 
  // (因為這時候req跟res是傳進來的物件的sub - object)

  // console.log("appContext.ctx: \n", appContext.ctx);
  
  // ref: 228. Issues with Custom App GetInitialProps
  // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19122330#questions

  const { data: dataFromCurrentUserAPI } = await axiosClient.get(
    "/api/users/currentuser"
  );

  let pageProps = {};

  // let stripePublishableKey = process.env.STRIP_PUBLISHABLE_TEST_KEY;
  // console.log('stripePublishableKey: ', stripePublishableKey);

  if (appContext.Component.getInitialProps) {    

    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      axiosClient,
      dataFromCurrentUserAPI.currentUser,
      // stripePublishableKey
      // 以上的參數可以讓 Landing Page 或其他Comnponent 使用
    );

    console.log("pageProps in AppComponent.getInitialProps:", pageProps);
    // pageProps: 
    //  {
    //   id: "601d7b08960972002f86e92a",
    //   email: "qwe@sdas.com",
    //   iat: 1612544776,
    // };
  }

  return {
    pageProps, //
    ...dataFromCurrentUserAPI,
  };
};

export default AppComponent;
