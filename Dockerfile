FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN yarn build

EXPOSE 3338

CMD ["yarn", "start"]