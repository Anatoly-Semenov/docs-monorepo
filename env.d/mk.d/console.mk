#!/usr/bin/env make

##
# Targets to run a TTY into containers.
##

.PHONY: console__http_service console__grpc_service

console__http_service:
	@docker compose exec http_service sh

console__grpc_service:
	@docker compose exec grpc_service sh

console__worker_service:
	@docker compose exec worker_service sh
