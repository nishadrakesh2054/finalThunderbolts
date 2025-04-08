# Stage 1: Build the React frontend
FROM node:21.7.3-slim AS REACT

WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Stage 2: Set up the production environment for the backend
FROM node:21.7.3-slim AS PRODUCTION

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN rm -rf node_modules package-lock.json

RUN npm install

COPY server/ ./

# Set environment variables
ARG NODE_ENV=production
ARG PORT=3000

# Set the environment variables for the application
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT
ENV DBNAME=$DBNAME
ENV DBUSER=$DBUSER
ENV DBPASSWORD=$DBPASSWORD
ENV DBHOST=$DBHOST
ENV MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
ENV MYSQL_DATABASE=$MYSQL_DATABASE
ENV MYSQL_USER=$MYSQL_USER
ENV MYSQL_PASSWORD=$MYSQL_PASSWORD
ENV COOKIE_PASSWORD=$COOKIE_PASSWORD
ENV ADMIN_EMAIL=$ADMIN_EMAIL
ENV ADMIN_PASSWORD=$ADMIN_PASSWORD
ENV ESEWA_SECRET_KEY=$ESEWA_SECRET_KEY
ENV ESEWA_GATEWAY_URL=$ESEWA_GATEWAY_URL
ENV ESEWA_PRODUCT_CODE=$ESEWA_PRODUCT_CODE
ENV BACKEND_URI=$BACKEND_URI
ENV EMAIL_USER=$EMAIL_USER
ENV EMAIL_PASS=$EMAIL_PASS
ENV MERCHANT_CODE=$MERCHANT_CODE
ENV SECRET_KEY=$SECRET_KEY

COPY --from=REACT /app/dist ./public

RUN mkdir -p /app/upload

EXPOSE $PORT

CMD ["sh", "-c", "node index.js"]
