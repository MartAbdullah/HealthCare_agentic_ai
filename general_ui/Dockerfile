FROM node:20-alpine

ARG REACT_APP_API_URL=http://api:8001

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .
ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
