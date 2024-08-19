#!/usr/bin/env make

##
# Targets to get the STDOUT from containers.
##

.PHONY: log__grpc_service log__http_service log_stream__grpc_service log_stream__http_service

log__http_service:
	@docker compose logs -l 50 http_service

log__grpc_service:
	@docker compose logs -l 50 grpc_service

log__redis:
	@docker compose logs -l 50 redis

log_stream__http_service:
	@docker compose logs -f http_service

log_stream__grpc_service:
	@docker compose logs -f grpc_service

log_stream__kafka_service:
	@docker compose logs -f kafka_service

log_stream__worker_service:
	@docker compose logs -f worker_service

log_stream__redis:
	@docker compose logs -f redis
