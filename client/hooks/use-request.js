import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body: requestBody, onSuccess }) => {
  // errors 的內容是null, 如果接收到 res 的內容是錯誤訊息的話
  // 就把預先輸入的 JSX 元素寫入 errors，透過JXS語法輸出到HTML中
  const [divElementsForErrorMessage, setErrors] = useState(null);

  //
  const doRequest = async (addtionalPropsForRequestBody = {}) => {
    try {
      setErrors(null);

      // method === 'post, 'get', 'patch'
      const response = await axios[method](url,
        // request body:
        { ...requestBody, ...addtionalPropsForRequestBody }
      );
      console.log('response from axios: ', response);          
      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data; // 一切順利的話就傳出 api 取回的 response 資料
    } catch (err) {
      //只有透過 axios 取得 API 傳回錯誤的時候才會呼叫 setErrors
      setErrors(
        <div className='alert alert-danger'>
          <h4>Ooops....</h4>
          <ul className='my-0'>
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, divElementsForErrorMessage };
};

export default useRequest;
