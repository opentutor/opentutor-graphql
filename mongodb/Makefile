SHELL := /bin/bash
MONGO_DOCKER_IMAGE=mongo:4.2
MONGO_DUMP_ROOT=$(PWD)/dump
MONGO_RESTORE_DUMP?=
MONGO_DB?=
MONGO_URI?=

check-mongo-db:
ifndef MONGO_DB
	$(error MONGO_URI is undefined. Typically needs to be in a .env.<DB> file. )
endif

check-mongo-restore-dump:
ifndef MONGO_RESTORE_DUMP
	$(error MONGO_RESTORE_DUMP is undefined. )
endif

check-mongo-uri:
ifndef MONGO_URI
	$(error MONGO_URI is undefined. Typically needs to be in a .env.<DB> file. )
endif

# Runs mongodump on env var MONGO_URI
# Often more convient to store MONGO_URI in .env.<DB> 
# and then call `make mongo-dump-<DB>`
mongo-dump-uri: check-mongo-uri
	docker run \
			--rm \
			--volume $(MONGO_DUMP_ROOT):/dump \
		$(MONGO_DOCKER_IMAGE) mongodump \
			--out="dump/dump-$(MONGO_DB)-$(shell date '+%Y%d%mT%H%M%S')" \
			--uri="$(MONGO_URI)"


# `make mongo-dump-<DB>`
#  Runs mongodump with MONGO_URI found in .env.<DB>
mongo-dump-%:
	@test -s "$(PWD)/.env.$*" || { echo "missing .env.$*"; exit 1; }
	@MONGO_URI=$(shell echo $$(grep -e ^MONGO_URI= '.env.$*' | cut -d '=' -f2-)) \
		MONGO_DB=$* \
		$(MAKE) mongo-dump-uri

# Runs mongodump on env var MONGO_URI
# Often more convient to store MONGO_URI in .env.<DB> 
# and then call `MONGO_RESTORE_DUMP=./dump/xyz make mongo-restore-<DB>`
mongo-restore-uri: check-mongo-uri check-mongo-restore-dump check-mongo-db
	docker run \
			--rm \
			--volume $(MONGO_DUMP_ROOT):/dump \
		$(MONGO_DOCKER_IMAGE) mongorestore \
			--uri="$(MONGO_URI)" \
			--db=$(MONGO_DB) \
			$(MONGO_RESTORE_DUMP)

# `MONGO_RESTORE_DUMP=./dump/xyz make mongo-restore-<DB>`
#  Runs mongorestore with MONGO_URI found in .env.<DB>
mongo-restore-%:
	@test -s "$(PWD)/.env.$*" || { echo "missing .env.$*"; exit 1; }
	@MONGO_URI=$(shell echo $$(grep -e ^MONGO_URI= '.env.$*' | cut -d '=' -f2-)) \
	MONGO_DB=$* \
	$(MAKE) mongo-restore-uri
