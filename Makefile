LICENSE_CONFIG?="license-config.json"

.PHONY: clean
clean:
	cd node \
	&& $(MAKE) clean

.PHONY: docker-build
docker-build:
	cd node \
	&& $(MAKE) docker-build

.PHONY: pretty
pretty:
	cd node \
	&& $(MAKE) pretty

.PHONY: test
test:
	cd node \
	&& $(MAKE) test

.PHONY: test-all
test-all:
	cd node \
	&& $(MAKE) test-all

.PHONY: test-format
test-format:
	cd node \
	&& $(MAKE) test-format

.PHONY: test-lint
test-lint:
	cd node \
	&& $(MAKE) test-lint

.PHONY: test-types
test-types:
	cd node \
	&& $(MAKE) test-types

LICENSE:
	@echo "you must have a LICENSE file" 1>&2
	exit 1

LICENSE_HEADER:
	@echo "you must have a LICENSE_HEADER file" 1>&2
	exit 1

.PHONY: license
license: LICENSE LICENSE_HEADER
	cd node \
	&& npm run license:fix
	
.PHONY: license-deploy
license-deploy: node_modules/license-check-and-add LICENSE LICENSE_HEADER
	cd node \
	&& LICENSE_CONFIG=${LICENSE_CONFIG} npm run license:deploy

.PHONY: format
format: LICENSE LICENSE_HEADER
	cd node \
	&& npm run license:fix && $(MAKE) pretty

.PHONY: test-license
test-license: LICENSE LICENSE_HEADER
	cd node \
	&& npm run test:license

node_modules/license-check-and-add:
	cd node \
	&& npm ci