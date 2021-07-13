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
import { gqlMutationInvalidateResponses } from 'test/graphql/mutation/me/invalidate-responses.spec';

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
    const response = await request(app)
      .post('/graphql')
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

  it(`returns all training data for lessons`, async () => {
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
      'exp_num,text,label,exp_data\n' +
        '0,a good answer,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,a bad answer,Bad,"{""question"":""question?"",""ideal"":""expected text 1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,"""good, not bad""",Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,"good, not bad",Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,"""bad"", not ""good""",Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n'
    );
    expect(YAML.parse(response.body.data.me.allTrainingData.config)).to.eql({
      question: '',
    });
    expect(response.body.data.me.allTrainingData.isTrainable).to.eql(true);
  });

  it(`does not return invalidated training data for lessons`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    let response = await request(app)
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
      'exp_num,text,label,exp_data\n' +
        '0,a good answer,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,a bad answer,Bad,"{""question"":""question?"",""ideal"":""expected text 1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,"""good, not bad""",Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,"good, not bad",Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,"""bad"", not ""good""",Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n'
    );
    expect(YAML.parse(response.body.data.me.allTrainingData.config)).to.eql({
      question: '',
    });
    expect(response.body.data.me.allTrainingData.isTrainable).to.eql(true);
    response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send(
        gqlMutationInvalidateResponses([
          {
            sessionId: 'session 3',
            responseIds: ['5f20c63646f6110a5a5b2135'],
          },
        ])
      );
    expect(response.status).to.equal(200);
    expect(response.body.data.me.invalidateResponses).to.eql([
      {
        sessionId: 'session 3',
        userResponses: [
          {
            _id: '5f20c63646f6110a5a5b2135',
            expectationScores: [
              {
                invalidated: true,
              },
            ],
          },
        ],
      },
    ]);
    response = await request(app)
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
      'exp_num,text,label,exp_data\n' +
        '0,a bad answer,Bad,"{""question"":""question?"",""ideal"":""expected text 1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,good,Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,"""good, not bad""",Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,"good, not bad",Good,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,"""bad"", not ""good""",Bad,"{""question"":""question"",""ideal"":""answer1""}"\n' +
        '0,bad,Bad,"{""question"":""question"",""ideal"":""answer1""}"\n'
    );
    expect(YAML.parse(response.body.data.me.allTrainingData.config)).to.eql({
      question: '',
    });
    expect(response.body.data.me.allTrainingData.isTrainable).to.eql(true);
  });
});
