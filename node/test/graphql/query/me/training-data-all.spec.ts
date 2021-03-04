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
import * as YAML from 'yaml';
import { getToken } from '../../../helpers';

describe('training data all', () => {
  let app: Express;

  beforeEach(async () => {
    await mongoUnit.load(require('test/fixtures/mongodb/data-default.js'));
    app = await createApp();
    await appStart();
  });

  afterEach(async () => {
    await appStop();
    await mongoUnit.drop();
  });

  it(`throws an error if not logged in`, async () => {
    const response = await request(app).post('/graphql').send({
      query: `query {
        me {
          allTrainingData {
            isTrainable
            training
            config
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
          allTrainingData {
            isTrainable
            training
            config
          }  
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'user does not have permission to get training data for this lesson'
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
            allTrainingData {
              isTrainable
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.allTrainingData.isTrainable).to.eql(true);
  });

  it('succeeds for admin', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
          me {
            allTrainingData {
              isTrainable
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.allTrainingData.isTrainable).to.eql(true);
  });

  it(`returns all training data for lesson`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
          me {
            allTrainingData {
              isTrainable
              training
              config
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.allTrainingData.training).to.eql(
      'exp_num,text,label\n0,a good answer,Good\n0,a bad answer,Bad' +
        '\n0,good,Good' +
        '\n0,good,Good' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,bad,Bad' +
        '\n0,good,Good' +
        '\n0,good,Good' +
        '\n0,good,Good' +
        '\n0,good,Good' +
        '\n0,good,Good' +
        '\n0,good,Good' +
        '\n0,good,Good' +
        '\n0,good,Good' +
        '\n0,good,Good' +
        '\n0,good,Good' +
        '\n0,"""good, not bad""",Good' +
        '\n0,"good, not bad",Good' +
        '\n0,"""bad"", not ""good""",Bad' +
        '\n0,bad,Bad\n'
    );
    expect(YAML.parse(response.body.data.me.allTrainingData.config)).to.eql({
      question: '',
    });
    expect(response.body.data.me.allTrainingData.isTrainable).to.eql(true);
  });
});
