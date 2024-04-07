FROM node:lts-alpine
WORKDIR /usr/src/app/
RUN corepack enable

COPY . .
RUN pnpm install

RUN pnpm run generate
RUN pnpm build
CMD pnpm start