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
import { getToken } from '../../../helpers';

describe('invalidateResponses', () => {
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
        query: `mutation InvalidateResponse($invalidateResponses: InvalidateResponseInputType!) {
          me {
            invalidateResponses(invalidateResponses: $invalidateResponses) { 
              username
            }
          }
        }`,
        variables: {
          invalidateResponses: {
            sessionId: '',
            responseIds: [''],
            expectation: 0,
            invalid: true,
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if no sessionId`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation InvalidateResponse($invalidateResponses: InvalidateResponseInputType!) {
          me {
            invalidateResponses(invalidateResponses: $invalidateResponses) { 
              username
            }
          }
        }`,
        variables: {
          invalidateResponses: {
            responseIds: [''],
            expectation: 0,
            invalid: true,
          },
        },
      });
    expect(response.body.errors[0].message).to.have.string(
      'Field "sessionId" of required type "String!" was not provided.'
    );
  });

  it(`throws an error if no responseIds`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation InvalidateResponse($invalidateResponses: InvalidateResponseInputType!) {
          me {
            invalidateResponses(invalidateResponses: $invalidateResponses) { 
              username
            }
          }
        }`,
        variables: {
          invalidateResponses: {
            sessionId: '',
            expectation: 0,
            invalid: true,
          },
        },
      });
    expect(response.body.errors[0].message).to.have.string(
      'Field "responseIds" of required type "[ID]!" was not provided.'
    );
  });

  it(`throws an error if no expectation`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation InvalidateResponse($invalidateResponses: InvalidateResponseInputType!) {
          me {
            invalidateResponses(invalidateResponses: $invalidateResponses) { 
              username
            }
          }
        }`,
        variables: {
          invalidateResponses: {
            sessionId: '',
            responseIds: [''],
            invalid: true,
          },
        },
      });
    expect(response.body.errors[0].message).to.have.string(
      'Field "expectation" of required type "Int!" was not provided.'
    );
  });

  it(`throws an error if no invalid`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation InvalidateResponse($invalidateResponses: InvalidateResponseInputType!) {
          me {
            invalidateResponses(invalidateResponses: $invalidateResponses) { 
              username
            }
          }
        }`,
        variables: {
          invalidateResponses: {
            sessionId: '',
            responseIds: [''],
            expectation: 0,
          },
        },
      });
    expect(response.body.errors[0].message).to.have.string(
      'Field "invalid" of required type "Boolean!" was not provided.'
    );
  });

  it(`fails if sessionId is invalid`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation InvalidateResponse($invalidateResponses: InvalidateResponseInputType!) {
          me {
            invalidateResponses(invalidateResponses: $invalidateResponses) { 
              username
            }
          }
        }`,
        variables: {
          invalidateResponses: {
            sessionId: 'asdf',
            responseIds: ['5f20c63646f6110a6a5b2135'],
            expectation: 0,
            invalid: true,
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it(`sets responses for expectation to invalid`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation InvalidateResponse($invalidateResponses: InvalidateResponseInputType!) {
          me {
            invalidateResponses(invalidateResponses: $invalidateResponses) { 
              sessionId
              userResponses {
                _id
                expectationScores {
                  invalidated
                }
              }
            }
          }
        }`,
        variables: {
          invalidateResponses: {
            sessionId: 'session 2',
            responseIds: ['5f20c63646f6110a6a5b2135'],
            expectation: 0,
            invalid: true,
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.invalidateResponses).to.eql({
      sessionId: 'session 2',
      userResponses: [
        {
          _id: '5f20c63646f6110a6a5b2135',
          expectationScores: [
            {
              invalidated: true,
            },
            {
              invalidated: false,
            },
          ],
        },
      ],
    });
  });
});
