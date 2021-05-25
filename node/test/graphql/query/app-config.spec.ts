/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import { describe } from 'mocha';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('appConfig', () => {
  let app: Express;
  let ENV_GOOGLE_CLIENT_ID_RESTORE: string = '';

  beforeEach(async () => {
    ENV_GOOGLE_CLIENT_ID_RESTORE = process.env.GOOGLE_CLIENT_ID;
    await mongoUnit.load(require('test/fixtures/mongodb/data-default.js'));
    app = await createApp();
    await appStart();
  });

  afterEach(async () => {
    if (typeof ENV_GOOGLE_CLIENT_ID_RESTORE === 'string') {
      process.env.GOOGLE_CLIENT_ID = ENV_GOOGLE_CLIENT_ID_RESTORE || undefined;
    } else {
      delete process.env['GOOGLE_CLIENT_ID'];
    }
    await appStop();
    await mongoUnit.drop();
  });

  it(`serves googleClientId appConfig when no env`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          appConfig {
            googleClientId
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        appConfig: {
          googleClientId: '',
        },
      },
    });
  });

  it(`serves googleClientId appConfig from env`, async () => {
    process.env.GOOGLE_CLIENT_ID = 'clientIdSetByEnv';
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          appConfig {
            googleClientId
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        appConfig: {
          googleClientId: 'clientIdSetByEnv',
        },
      },
    });
  });
});
