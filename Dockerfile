# We work from `node:14.19.3-buster`, because that image is based on `buildpack-deps:buster`
# which is eventually also used as a base for the `api` Dockerfile.
FROM node:14.19.3-buster
ENV NODE_ENV development
WORKDIR /web
COPY package.json /web/package.json
COPY package-lock.json /web/package-lock.json
RUN npm ci
ENV NODE_TLS_REJECT_UNAUTHORIZED 0
EXPOSE 5001
CMD ["npx", "gulp", "watch:dev:app"]
