import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // 如果是在server端先把頁面內容建立好再送出到client端的話
    // We are on the server

    return axios.create({
      // baseURL: 'http://ingress-nginx.ingress-nginx.svc.cluster.local',
      baseURL:
        'http://www.ticket-app.work',
      headers: req.headers,
    });
  } else {
    // We must be on the browser
    return axios.create({
      baseUrl: '/',
    });
  }
};

export default buildClient;

/*
https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19122264#questions

取得 baseURL:

http://<namespace of ingress-nginx "service">.<namespace of ingress-nginx(load balancer)>.svc.cluster.local

k get services -n 
NAME                                 TYPE           CLUSTER-IP    EXTERNAL-IP    PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   10.36.1.143   34.80.65.202   80:32490/TCP,443:31994/TCP   47h
ingress-nginx-controller-admission   ClusterIP      10.36.3.128   <none>         443/TCP                      47h


k get namespace

NAME              STATUS   AGE
default           Active   2d1h
ingress-nginx     Active   47h
kube-node-lease   Active   2d1h
kube-public       Active   2d1h
kube-system       Active   2d1h


http://ingress-nginx-controller.ingress-nginx.svc.cluster.local



 */
