import nats, { Stan } from 'node-nats-streaming';

/*
https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19485324#questions/13166058  
312. Singleton Implementation
*/
class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }

  getClient() {
    return this.client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    // PS: Promise<void> 才不讓TS報錯: Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?ts(2794)
    return new Promise<void>((resolve, reject) => {
      // 透過 getter 取得 .client 屬性的 client instance
      this.client.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });
      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export const natsWrapperInstance = new NatsWrapper();
