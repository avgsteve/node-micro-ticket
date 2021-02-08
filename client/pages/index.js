// import buildClient from '../api/build-client'; // 改由傳進  LandingPage.getInitialProps 的 axiosClient 參數發出 request

import Link from 'next/link';
const LandingPage = ({ currentUser, ticketsData }) => {
  console.log('currentUser in index.js: \n', currentUser);
  console.log('ticketsData in index.js: \n', ticketsData);

  const ticketList = ticketsData.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td> {ticket.title}  </td>
        <td> {ticket.price}  </td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>


    );
  });

  return (

    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  )
};


// 使用 Next.Js 透過 index.js 輸出 / 路徑的頁面(LandingPage)
// 並且作為首頁



// Method for Server side rendering
// context, axiosClient, currentUser 參數來自於 _app.js 的 getInitialProps
LandingPage.getInitialProps = async (context, axiosClient, currentUser) => {
  console.log("== LANDING PAGE rendered on server side ==");

  const { data } = await axiosClient.get('/api/tickets');
  // res.data

  return { ticketsData: data };


  // return {};
};;

// Next.js 9.3 之後就可以 使用 .getServerSideProps 讓 Component 直接在 server 端執行
// https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19122268#questions/10734472
// https://www.datocms.com/blog/how-the-new-next-js-9-3-preview-mode-works

// export async function getServerSideProps(context) {
//     // console.log('context.req.headers: ', context.req.headers);

//     const client = buildClient(context);
//     const  response  = await client.get('/api/users/currentuser');

//   return {
//     props: response.data,
//   };
// }




export default LandingPage;
