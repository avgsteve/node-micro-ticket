import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser, stripePublishableKey }) => {

  // console.log('order: ', order);
  // console.log('currentUser: ', currentUser);
  // console.log('stripePublishableKey:', stripePublishableKey)

  const { doRequest, divElementsForErrorMessage } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: (successfulResponse) => {
      console.log('successfulResponse: ', successfulResponse);
      Router.push('/orders');
    },
  });

  const [pageTimer, setPageTimer] = useState(0);

  //
  useEffect(() => {

    function refreshPageTimer() {
      const timeToOrderExpire_mSeconds = new Date(order.expiresAt) - new Date();
      setPageTimer(Math.round(timeToOrderExpire_mSeconds / 1000));
    };

    refreshPageTimer(); // 先手動執行一次執行 refreshPageTimer

    const countDownTimer = setInterval(refreshPageTimer, 1000); // 然後使用 interval

    // 在離開這個頁面的時候要 return "執行 clearInterval 的function"
    // https://upmostly.com/tutorials/setinterval-in-react-components-using-hooks
    return () => {
      clearInterval(countDownTimer);
    };

  },
    // 讓 useEffect hood 在讀取頁面的時候，只會執行 arrow function 一次 
    // (依賴order變數的內容)
    [order]
  );

  if (pageTimer < 0) {
    return <div>Order Expired</div>;
  }

  //
  return (
    // Timer shown on page
    <div>
      Time left to pay: {pageTimer} seconds
      <p>stripePublishableKey: {stripePublishableKey}</p>
      <StripeCheckout
        // https://www.npmjs.com/package/react-stripe-checkout#send-all-the-props
        token={
          (tokenDataForCallback) => {
            console.log(tokenDataForCallback);
            doRequest({ token: tokenDataForCallback.id });
          }
        }
        stripeKey={stripePublishableKey}
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {divElementsForErrorMessage}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {

  // 1) 筆記: 先透過 tickets/[ticketId].js 送出 (POST request) 建立 order 資料後，才會進入 [orderId].js 這個網址  

  const { orderId } = context.query;
  // 2) context.query 裡面的 orderId 來自網址 https://ticketing.com/tickets/xxxx  最後面的那一段 xxxx，也就是這個 [orderId].js 檔案的 [orderId] (wildcard router path)

  // 3) 透過 2) 取得 orderId 後從API取得order資料
  const { data } = await client.get(`/api/orders/${orderId}`);

  let stripePublishableKey = process.env.NEXT_PUBLIC_STRIP_PUBLISHABLE_TEST_KEY;


  return {
    order: data,
    stripePublishableKey
  };
};

export default OrderShow;
