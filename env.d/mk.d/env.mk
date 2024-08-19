#!/usr/bin/env make

##
# Targets to operate with an environment.
##

.PHONY: up stop restart down

up:
	@docker compose up -d --remove-orphans

stop:
	@docker compose stop

restart:
	make stop
	sleep 1
	make up

down:
	@docker compose down

login:
	@echo ${DOCKER_REGISTRY__PASSWORD} | docker login -u ${DOCKER_REGISTRY__LOGIN} --password-stdin ${DOCKER_REGISTRY__URL}
