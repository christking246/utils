FROM node:24.9.0-alpine

WORKDIR /home/utils

# install curl for the health check and git for version
RUN apk add curl git

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY ./ ./

RUN echo VERSION=$(git log --pretty=%H -1) > .env
ENV NODE_ENV=production
ENV PORT=5000
ENV TZ=UTC

EXPOSE 5000
HEALTHCHECK CMD curl --fail http://localhost:5000/api/ping || exit 1

CMD ["node", "util_server"]