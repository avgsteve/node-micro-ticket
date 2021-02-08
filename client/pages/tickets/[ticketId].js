import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const ShowTicketById = ({ ticket, currentUser }) => {

  console.log('current user in [ticketId].js: ', currentUser);

  const { doRequest, divElementsForErrorMessage } = useRequest({
    url: '/api/orders',
    // 送出 POST req 進行預定 (ordering)
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      Router.push(
        // 458. Programmatic Navigation to Wildcard Routes
        // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19989032#questions        
        '/orders/[orderId]', // path as file name，也就是要讓next.js 讀取 [orderId].js 這個檔案
        `/orders/${order.id}` // actual url 實際的網址
      ),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {divElementsForErrorMessage}
      <button onClick={
        // 直接使用 doRequest 的話會發生錯誤，要改成以下使用arrow function的方式
        () => doRequest()
        // 因為 doRequest() 的第一個預設參數是空的物件 {}，所以要 用arrow function 傳進空的參數去 doRequest, 不然這邊會因為 onClick 是 event handler 的關係，會把 button element 傳進去
        // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19989066#questions
      } className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

ShowTicketById.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  // context.query 裡面的 ticketId 來自網址 https://ticketing.com/tickets/xxxx  最後面的那一段 xxxx，也就是這個 [orderId].js 檔案的 [orderId] (wildcard router path)

  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default ShowTicketById;
