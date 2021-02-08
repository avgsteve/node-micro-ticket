import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

// https://ticketing.com/ticket/new_ticket

const NewTicket = () => {
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const { doRequest, divElementsForErrorMessage } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title: ticketTitle,
      price: ticketPrice,
    },
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = (event) => {
    event.preventDefault();
    console.log({ title: ticketTitle, price: ticketPrice });
    doRequest();
  };

  const onBlur = () => {
    const value = parseFloat(ticketPrice); // 把price轉成float，同時也可以檢查是否為合法float

    if (isNaN(value)) {
      return;
    }

    setTicketPrice(value.toFixed(2));
  };

  return (
    <div>
      <h1>Create a Ticket</h1>

      {/*  */}
      <form onSubmit={onSubmit}>
        {/* Title  */}
        <div className="form-group">
          <label>Title</label>
          <input
            value={ticketTitle}
            onChange={(e) => setTicketTitle(e.target.value)}
            className="form-control"
          />
        </div>

        {/* Price */}
        <div className="form-group">
          <label>Price</label>
          <input
            value={ticketPrice}
            onBlur={onBlur}
            onChange={(e) => setTicketPrice(e.target.value)}
            className="form-control"
          />
        </div>

        {divElementsForErrorMessage}

        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default NewTicket;
