# Mongodb Tools

This submodule contains tools for dumping and loading mongo as well as running migrations

## Quick Start: dump from one db and load to another

A common need is to dump the db from one instance (say a production instance), and then load that dump to a different instance (usually a dev or test instance).

So for the purpose of our example, we'll be dumping from a db called `opentutor-prod` and then loading that dump to an db called `opentutor-test`

First make sure you have a file with `MONGO_URI` for each of `.env.opentutor-prod` and `.env.opentutor-test` (see details below)

Then to dump from `opentutor-prod` do:

```bash
make mongo-dump-opentutor-prod
```

...this should create a folder with the dump at `dump-opentutor-prod-${TIMESTAMP}/opentutor-prod`

Then to overwrite `opentutor-test` with the dump we just made do:

```bash
# use the correct path/timestamp for your dump
MONGO_RESTORE_DUMP=./dump/dump-opentutor-prod-${TIMESTAMP}/opentutor-prod make mongo-restore-opentutor-test
```




## .env files for mongodb instances

For any mongo db we will either dump from or load to, you need a file in this directory with a valid `MONGO_URI` property for that db. For example if you are dumping from a db called `opentutor-prod` then you will need an env file `.env.opentutor-prod` with contents like

```bash
MONGO_URI="mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0-cu6as.mongodb.net/${DB_NAME}?retryWrites=true&w=majority"
```