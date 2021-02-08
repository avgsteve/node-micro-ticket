import { useState, useEffect } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';
// 引入自訂的 useRequest Hook

export const SignUpComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [errors, setErrors] = useState([]);

  // 透過自訂的 useRequest Hook 送出 http request
  // 如果傳回 error response就透過 errors
  const { doRequest, errors: httpErrorAsJSX } = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: {
      email,
      password,
    },
    // optional callback after the http req is successful
    onSuccess: () => Router.push('/'),
  });

  const onSubmit = async (event) => {
    /*
      try {
        const response = await axios.post('/api/users/signup', {
          email,
          password,
        });
        console.log(response.data);
      } catch (error) {
        setErrors(error.response.data.errors);
      }
    */
    event.preventDefault();
    await doRequest();
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className='form-group'>
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='form-control'
        />
      </div>
      <div className='form-group'>
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type='password'
          className='form-control'
        />
      </div>
      {httpErrorAsJSX}
      <button className='btn btn-primary'>Sign Up</button>
    </form>
  );
};

export default SignUpComponent;
