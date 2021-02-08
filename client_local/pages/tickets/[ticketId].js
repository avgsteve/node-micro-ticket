import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const ShowTicketById = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
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
        '/orders/[orderId]', // path as file name
        `/orders/${order.id}` // actual url
      ),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

ShowTicketById.getInitialProps = async (context, client) => {
  // 透過 context.query 把 [ticketId].js的ticketId變數取出
  const { ticketId } = context.query;

  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default ShowTicketById;
