FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install --only=prod
COPY . .

CMD ["npm", "info","@ticket-microservice2021/common" ]
CMD ["npm", "start"]