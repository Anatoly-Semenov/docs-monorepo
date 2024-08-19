#!/usr/bin/env make

##
# Targets to make some stuff.
##

.PHONY: util__generate_certs prepare_project

util__generate_certs:
	sh env.d/sh.d/certgen.sh

prepare_project:
	sh env.d/sh.d/start.sh