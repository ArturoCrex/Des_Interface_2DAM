FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# VITE_HOST=true is needed to expose the server to the host
CMD ["npm", "run", "dev", "--", "--host"]
