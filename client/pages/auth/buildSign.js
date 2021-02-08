import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const buildSign = (context) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, divElementsForErrorMessage } = useRequest({
    url: `/api/users/sign${context}`,
    method: "post",
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    await doRequest();
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign {context}</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-control"
        />
      </div>
      {divElementsForErrorMessage}
      <button className="btn btn-primary">Sign {context}</button>
    </form>
  );
};

export default buildSign;
