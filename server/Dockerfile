FROM node:latest
WORKDIR /app/server
COPY . /app/server
RUN npm install
RUN npm install typescript
RUN npm install ts-node
RUN npm install tsx
EXPOSE 8080
CMD npm run dev