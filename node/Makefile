SHELL:=/bin/bash
PROJECT_ROOT?=$(shell git rev-parse --show-toplevel 2> /dev/null)
PROJECT_NAME?=$(shell v='$(PROJECT_ROOT)'; echo "$${v\#\#*/}")
SERVICE_NAME?=$(shell v='$(DIR)'; echo "$${v\#\#*/}")
DIR=$(shell pwd)
DOCKER_IMAGE?=opentutor-grading-api

.PHONY: clean-dist
clean-dist: 
	rm -rf dist

.PHONY: clean-install
clean-install:
	rm -rf node_modules

.PHONY: clean
clean: clean-install clean-dist

.PHONY: docker-build
docker-build: clean
	DOCKER_BUILDKIT=1 \
	docker build \
		--ssh default \
		-t $(DOCKER_IMAGE) \
	.

.PHONY: docker-run
docker-run:
	docker run \
			--name opentutor-grading-api \
			--rm \
			--init \
			-p 3001:3001 \
		$(DOCKER_IMAGE)

.PHONY: docker-run
docker-run-shell:
	docker run \
			--name opentutor-grading-api \
			--rm \
			-it \
			--init \
			--entrypoint /bin/bash \
			-p 3001:3001 \
		$(DOCKER_IMAGE)

.PHONY: format
format: node_modules/prettier
	npm run format

.PHONY: lint-fix
lint-fix: node_modules/eslint
	npm run lint:fix

node_modules/eslint:
	npm ci

node_modules/mocha:
	npm ci

node_modules/prettier:
	npm ci

node_modules/typescript:
	npm ci

.PHONY: test
test: node_modules/mocha
	export APP_DISABLE_AUTO_START=true \
	&& export NODE_PATH=$(shell pwd)/src \
	&& npm test

.PHONY: test-all
test-all: test-format test-lint test-types test

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-lint
test-lint: node_modules/eslint
	npm run test:lint

.PHONY: test-lint
test-types: node_modules/typescript
	npm run test:types