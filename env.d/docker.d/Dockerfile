###< Окружение сборки - общее
FROM node:18-alpine as buildtime-base

# Аргументы сборки - параметры аутентификации в Nexus
ARG NPM_REGISTRY__URL
ARG NPM_REGISTRY__TOKEN

WORKDIR /opt/app

# Пакет для запуска envsubst
RUN apk add gettext

RUN chown -R node:node /opt/app

USER node

# Пакеты для запуска Nest CLI + SWC
RUN yarn global add @nestjs/cli @swc/core@1.5.0 @swc/cli

# Забираем шаблон .npmrc
COPY env.d/conf.d/template.npmrc ./

# Заполняем данные аутентификации в Nexus
RUN envsubst < template.npmrc > .npmrc

COPY --chown=node:node package.json yarn.lock ./

USER root

RUN apk del gettext


###< Окружение сборки - development
FROM buildtime-base as buildtime-development

ENV NODE_ENV=development

WORKDIR /opt/app

USER node

# Установка с дев-зависимостями
RUN yarn install

COPY --chown=node:node . .

# Чистим за собой после установки всего, что нужно
RUN rm .npmrc template.npmrc


###< Окружение сборки - production
FROM buildtime-base as buildtime-production

ARG SENTRY_VERSION
ARG APP_ENV

ENV NODE_ENV=production
ENV APP_ENV=$APP_ENV
ENV SENTRY_VERSION=$SENTRY_VERSION

WORKDIR /opt/app

USER node

# Установка с прод-зависимостями
RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

RUN yarn build

# Чистим за собой после установки всего, что нужно
RUN rm .npmrc template.npmrc && \
    rm -rf env.d src tests && \
    yarn global remove @nestjs/cli @swc/cli @swc/core


###< Постпроцессинг сборки - публикация в Sentry и прочие доп. шаги
FROM buildtime-production as postbuild-production
# Этот стейдж запускаем отдельным билдом в CI/CD - он необязателен

ARG SENTRY_AUTH_TOKEN
ARG SENTRY_PROJECT
ARG SENTRY_ORG
ARG SENTRY_URL
ARG SENTRY_VERSION

WORKDIR /opt/app

# Пакет Sentry
RUN yarn global add @sentry/cli

# Передаем в Sentry данные о релизе
RUN sentry-cli sourcemaps inject --org $SENTRY_ORG --project $SENTRY_PROJECT ./dist && \
    sentry-cli --url $SENTRY_URL sourcemaps upload --org $SENTRY_ORG --project $SENTRY_PROJECT --release $SENTRY_VERSION ./dist


###< Окружение исполнения - development
FROM buildtime-development as runtime-development

WORKDIR /opt/app

USER node

EXPOSE 3000

CMD ["yarn", "start:dev"]


###< Окружение исполнения - production
FROM buildtime-production as runtime-production

WORKDIR /opt/app

USER node

COPY --chown=node:node . .

EXPOSE 3000

CMD ["yarn", "start:prod"]
