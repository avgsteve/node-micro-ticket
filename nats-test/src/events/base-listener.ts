import { Message as StanMessageClass, Stan } from 'node-nats-streaming';
import { EventSubjectsEnum } from './event-subjects-enumerable';

// If something is going to be an event...
interface IEvent {
  /* 
  在 abstract class Listener 使用 interface IEvent 的目的為:    
  1) 將 subject property 的型別訂為 EventSubjectsEnum
  2) 強制 繼承 abstract class Listener 的 subclass 
  也要引入 EventSubjectsEnum，否則會報錯
  */
  subject: EventSubjectsEnum;
  data: any;
}

/*
透過 IEvent 將 class Listener 的 subject property 的內容規範為: 
須取用 EventSubjectsEnum的 property 建立 subject的內容，避免打錯字  
*/
export abstract class Listener<T extends IEvent> {
  // 雖然是 abstract property但是要遵循 IEvent 的 subject property規範內容
  abstract subject: T['subject'];

  // 使用於訂閱選項的 queueGroupName、型別為任意string
  abstract queueGroupName: string;

  // 處理訊息的 function
  abstract onMessage(
    data: T['data'], // 透過 IEvent 的規定，傳入資料型別為 any
    msg: StanMessageClass // 透過 StanMessageClass 取用 Class 的方法處理 message
  ): void;

  //
  private stanClient: Stan;

  // 可讓 sub Class 自行決定回送給 publisher 的確認訊息最長等待時間
  protected ackWait = 5 * 1000; // 5 秒

  constructor(stanClient: Stan) {
    this.stanClient = stanClient;
  }

  subscriptionOptions() {
    return (
      this.stanClient
        .subscriptionOptions()

        /* 使用 setManualAckMode 之後就要在 subscription.on
        使用 setDeliverAllAvailable 之後就要在 subscription.on
        裡面使用 .ack() 發送給 publisher 確認接收訊息成功
        */
        .setManualAckMode(true)

        /* 
        說明: Configures the subscription to replay from first available message.
        在listen中，從第一筆開始把所有的訊息都列出來，目的是為了在listener服務出問題的時候，可以從頭接收所有訊息
        */
        .setDeliverAllAvailable()

        /* 
        .setDurableName 說明: Sets a durable subscription name that the stanClient can specify for the subscription. This enables the subscriber to close the connection without canceling the subscription and resume the subscription with same durable name. Note the server will resume the subscription with messages that have not been acknowledged.
        使用 setDurableName 作為將 publisher 的訊息作為群組的群組名稱，如此當服務重新啟動的時候，只會透過 setDeliverAllAvailable
        接收已經處理完的訊息，不用從頭全部重新接收一次
        https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19124592#questions
        */
        .setDurableName('accounting-service')
    );
  }

  listen(): void {
    // 透過 stanClient 建立訂閱功能(subscribe)的參數: 訊息標題、群組名稱和訂閱設定
    const subscription = this.stanClient.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    /*
    當已經建立好的訂閱程式 subscription 收到來自 
    publisher 的訊息的 event，透過傳入的 callback 進行處理訊息內容
    */
    subscription.on('message', (msg: StanMessageClass) => {
      console.log(
        `
    [${msg.getTimestamp()}] 
    Received event #${msg.getSequence()}:
      `
      );

      // console.log(`Received message in raw format: `, msg);
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  // 處理來自 publisher 的訊息
  parseMessage(msg: StanMessageClass) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data) // 表示收到的是 string (stringified JSON)，需要轉成JSON
      : JSON.parse(data.toString('utf8')); // 表示收到的是 Buffer，把他轉為 string
  }
}
