#!/usr/bin/env make

# Optionally include .env (it couldn't exist in case of fresh installation)
-include .env
export $(shell sed 's/=.*//' .env)

###> IMPORTANT: define the COMPOSE_PROJECT_NAME here so
###> Makefile's targets will be able to perform shell magic.
###> Also, the value here and value in the .env should be the same, that's important
export COMPOSE_PROJECT_NAME=docs-backend

-include ./env.d/mk.d/build.mk
-include ./env.d/mk.d/console.mk
-include ./env.d/mk.d/env.mk
-include ./env.d/mk.d/logs.mk
-include ./env.d/mk.d/utils.mk

default: up

%:
	@:
