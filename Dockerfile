FROM node:lts-alpine
WORKDIR /usr/src/app/
RUN corepack enable

COPY . .
RUN pnpm install

WORKDIR /usr/src/app/packages/website
RUN pnpm build
RUN pnpm generate
RUN pnpm migrate
CMD pnpm start