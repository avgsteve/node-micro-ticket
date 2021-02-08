
// 模擬 new.ts 裡面的 new TicketCreatedPublisher 物件

export const natsWrapperInstance = {
  client: {
    // 模擬 Class NatsWrapper 實例 的 client  屬性 (get client())
    //
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};

//www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19485374#questions/12864061

