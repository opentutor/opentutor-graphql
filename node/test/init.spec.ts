/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import dotenv from 'dotenv';
import { appStop } from 'app';
import { logger } from 'utils/logging';
import mongoUnit from 'mongo-unit';
import { fixturePath } from './helpers';

before(() => {
  dotenv.config({ path: fixturePath('.env') });
  process.env.DOTENV_PATH = fixturePath('.env');
});

after(async () => {
  try {
    await appStop();
  } catch (mongooseDisconnectErr) {
    logger.error(mongooseDisconnectErr);
  }
  try {
    await mongoUnit.stop();
  } catch (mongoUnitErr) {
    logger.error(mongoUnitErr);
  }
});

mongoUnit.start().then((url) => {
  process.env.MONGO_URI = url; // this const process.env.DATABASE_URL = will keep link to fake mongo
  run(); // this line start mocha tests
});
