import { Stan } from 'node-nats-streaming';
import { EventSubjectsEnum } from './event-subjects-enumerable';

/*
302. Custom Publisher
https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19124802#questions/13401114

 */

interface IEvent {
  // 確保送出的subject遵循 enum Object 的格式
  subject: EventSubjectsEnum;
  data: any;
}

export abstract class Publisher<T extends IEvent> {
  abstract subject: T['subject'];
  private stanClient: Stan;

  // 在abstract class Publisher先引入 constructor 需要的物件
  // 並傳入 constructor, 就不用在 subclass 裡面呼叫 super()
  constructor(stanClient: Stan) {
    this.stanClient = stanClient;
  }

  // 透過Promise裡面的物裡面的this.stanClient.publish來發布訊息給 client
  // 1) 傳入的 dataObject 參數是要發布出去的物件資料，作為 .publish 的參數
  // 2) 但是因為 resolve(); 不須回傳資料所以設定Promise 為 <void>  
  publish(dataObject: T['data']): Promise<void> {

    return new Promise((resolve, reject) => {
      // === 在 Promise 中使用 stanClient.publish() ====
      this.stanClient.publish(
        // arg#1: subject
        this.subject,
        // arg#2: data: 因為 publish 只能使用 string 型別的 data參數，所以要把  dataObject 轉為 string
        JSON.stringify(dataObject),
        // arg#3: callback for error
        (err, guid) => {
          if (err) {
            return reject(err);
          }

          console.log('Event published with subject', this.subject);
          console.log('Event guid:', guid);
          resolve();
        }
      );
    });
  }
}
