/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import { describe } from 'mocha';
import { loadMongo, wipeMongo } from 'test/fixtures/mongodb/data-default';
import request from 'supertest';
import * as YAML from 'yaml';
import { getToken } from 'test/helpers';
import { gqlMutationInvalidateResponses } from 'test/graphql/mutation/me/invalidate-responses.spec';

describe('expectation data all', () => {
  let app: Express;

  beforeEach(async () => {
    await loadMongo();
    app = await createApp();
    await appStart();
  });

  afterEach(async () => {
    await wipeMongo();
    await appStop();
  });

  it(`throws an error if not logged in`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
        me {
          allExpectationData {
            csv
          }  
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if user does not have permissions`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          allExpectationData {
            csv
          }  
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'only admins can train the default model'
    );
  });

  it('succeeds for api key', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `query {
          me {
            allExpectationData {
              csv
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.allExpectationData.csv).to.eql(
      `lesson_name,expectation_id,answer,grade\nname,0,a good answer,Good\nlesson name,0,a bad answer,Bad\nlesson name,0,a neutral answer,Neutral\nname,0,good,Good\nname,0,good,Good\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,\"\"\"good, not bad\"\"\",Good\nname,0,\"good, not bad\",Good\nname,0,\"\"\"bad\"\", not \"\"good\"\"\",Bad\nname,0,bad,Bad\nname,0,neutral,Neutral\nname,0,neutral,Neutral\nname,0,neutral,Neutral\nname,0,neutral,Neutral\nname,0,neutral,Neutral\nname,0,neutral,Neutral\n`
    );
  });

  it('succeeds for admin', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
          me {
            allExpectationData {
              csv
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.allExpectationData.csv).to.eql(
      `lesson_name,expectation_id,answer,grade\nname,0,a good answer,Good\nlesson name,0,a bad answer,Bad\nlesson name,0,a neutral answer,Neutral\nname,0,good,Good\nname,0,good,Good\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,bad,Bad\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,good,Good\nname,0,\"\"\"good, not bad\"\"\",Good\nname,0,\"good, not bad\",Good\nname,0,\"\"\"bad\"\", not \"\"good\"\"\",Bad\nname,0,bad,Bad\nname,0,neutral,Neutral\nname,0,neutral,Neutral\nname,0,neutral,Neutral\nname,0,neutral,Neutral\nname,0,neutral,Neutral\nname,0,neutral,Neutral\n`
    );
  });
});
