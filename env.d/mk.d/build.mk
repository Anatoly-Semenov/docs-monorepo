#!/usr/bin/env make

##
# Targets to build images.
##

.PHONY: build build_clean

build__http_service:
	@docker compose build http_service

build__grpc_service:
	@docker compose build grpc_service

build_clean__http_service:
	@docker compose build --no-cache http_service

build_clean__grpc_service:
	@docker compose build --no-cache grpc_service

build_clean__kafka_service:
	@docker compose build --no-cache kafka_service

build_clean__worker_service:
	@docker compose build --no-cache worker_service

build:
	@make -j 3 build__http_service build__grpc_service build_clean__kafka_service build_clean__worker_service

build_clean:
	@make -j 3 build_clean__http_service build_clean__grpc_service build_clean__kafka_service build_clean__worker_service
