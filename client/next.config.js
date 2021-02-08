/*

https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19122122#questions
File Change Detection
 */

module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};

/*

$ k get pods
NAME                               READY   STATUS    RESTARTS   AGE
auth-depl-549ff48b78-f4qbl         1/1     Running   0          58s
auth-mongo-depl-5bb7fc475f-6nwhm   1/1     Running   0          58s
client-depl-56b4955f6b-zjrjz       1/1     Running   0          58s

$ k delete pod client-depl-56b4955f6b-zjrjz

k get pods



 */
