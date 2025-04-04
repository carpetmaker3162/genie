FROM node:18-alpine
WORKDIR /app
COPY package.json .
COPY next.config.ts .
COPY tsconfig.json .
COPY app ./app
COPY styles ./styles
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]