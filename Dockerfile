FROM node:22-alpine3.19 as builder

WORKDIR /app

# Install Python, make, and g++ (build tools needed for bcrypt)
RUN apk add --no-cache python3 make g++

COPY package.json ./
COPY tsconfig.json ./
COPY .npmrc ./
COPY src ./src
COPY tools ./tools
RUN npm install -g npm@latest
RUN ci && npm run build

FROM node:22-alpine3.19

WORKDIR /app
RUN apk add --no-cache curl
COPY package.json ./
COPY tsconfig.json ./
COPY .npmrc ./
RUN npm install -g pm2 npm@latest
RUN ci --production
COPY --from=builder /app/build ./build

EXPOSE 4002

CMD [ "npm", "run", "start" ]
