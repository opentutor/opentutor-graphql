SHELL:=/bin/bash
PROJECT_ROOT?=$(shell git rev-parse --show-toplevel 2> /dev/null)
PROJECT_NAME?=$(shell v='$(PROJECT_ROOT)'; echo "$${v\#\#*/}")
SERVICE_NAME?=$(shell v='$(DIR)'; echo "$${v\#\#*/}")
DIR=$(shell pwd)
ENV?=dev
ENV_PASSWORD_VAR=$(shell \
	echo $(ENV) | \
	tr [:lower:] [:upper:] | \
	tr - _ )_ENV_PASSWORD
ENV_PASSWORD?=$(shell \
	if [ "$${$(ENV_PASSWORD_VAR)}" != "" ]; then \
		echo "$${$(ENV_PASSWORD_VAR)}"; \
	elif [ -f $(PROJECT_ROOT)/env/$(ENV)/.password ]; then \
		cat $(PROJECT_ROOT)/env/$(ENV)/.password; \
	else echo ""; \
	fi \
)
DOCKER_IMAGE?=opentutor-grading-api

define read_env_password
	$(shell cat $(PROJECT_ROOT)/env/$(1)/.password)
endef

.PHONY: .env.enc
.env.enc:
	cd $(PROJECT_ROOT)/env/$(ENV) \
	&& dotenvenc $(ENV_PASSWORD) \
	&& cd $(DIR) \
	&& cp $(PROJECT_ROOT)/env/$(ENV)/.env.enc ./.env.enc

.PHONY: clean-dist
clean-dist: 
	rm -rf dist

.PHONY: clean-env
clean-env: 
	rm -f .env .env.enc

.PHONY: clean-install
clean-install:
	rm -rf node_modules

.PHONY: clean
clean: clean-env clean-install clean-dist

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
			-e ENV_PASSWORD=$(ENV_PASSWORD) \
			-p 3001:3001 \
		$(DOCKER_IMAGE)

.PHONY: docker-run
docker-run-shell:
	docker run \
			--name opentutor-grading-api \
			--rm \
			-it \
			--init \
			-e ENV_PASSWORD=$(ENV_PASSWORD) \
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

run-env-%:
	export ENV=$* \
	&& export NODE_PATH=$(DIR) \
	&& ENV=$* $(MAKE) .env.enc \
	&& export ENV_PASSWORD="$(shell cat $(PROJECT_ROOT)/env/$*/.password)" \
	&& echo "ENV_PASSWORD=$$ENV_PASSWORD" \
	&& npm run start

.PHONY: test
test: node_modules/mocha
	export APP_DISABLE_AUTO_START=true \
	&& export ENV=test \
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