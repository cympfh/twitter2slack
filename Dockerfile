FROM node:erbium-alpine
COPY . .
RUN npm i
CMD ["npm", "start"]
