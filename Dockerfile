FROM node:15.2.1-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["app/package.json", "app/package-lock.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
RUN npm install pm2 -g
EXPOSE 8989
ENTRYPOINT [ "pm2-docker", "index.js" ]
