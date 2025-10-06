/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import * as Mocha from 'mocha';
import dotenv from 'dotenv';
import { appStop } from '../src/app';
import { logger } from 'utils/logging';
import { fixturePath } from './helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
require('dotenv').config();

// Define a custom context type for global fixtures
declare module 'mocha' {
  interface Context {
    mongoMemoryServer: MongoMemoryServer;
  }
}

const TESTDB_NAME = 'test';

export async function mochaGlobalSetup(this: Mocha.Context) {
  dotenv.config({ path: fixturePath('.env') });
  process.env.DOTENV_PATH = fixturePath('.env');
  const server = await MongoMemoryServer.create({
    instance: {
      dbName: TESTDB_NAME,
    },
  });
  this.mongoMemoryServer = server;
  const url = server.getUri();

  process.env.MONGO_URI = url; // this const process.env.DATABASE_URL = will keep link to fake mongo
}

export const mochaGlobalTeardown = async function (this: Mocha.Context) {
  try {
    await appStop();
  } catch (mongooseDisconnectErr) {
    logger.error(mongooseDisconnectErr);
  }
  try {
    await this.mongoMemoryServer.stop();
  } catch (mongoUnitErr) {
    logger.error(mongoUnitErr);
  }
  process.env.MONGO_URI = '';
};

export default mochaGlobalSetup;
