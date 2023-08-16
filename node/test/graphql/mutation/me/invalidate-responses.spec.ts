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
import { getToken } from 'test/helpers';

export const GQL_INVALIDATE_RESPONSE_DEFAULT = `mutation InvalidateResponse($expectation: String!, $invalid: Boolean!, $invalidateResponses: [InvalidateResponseInputType!]) {
  me {
    invalidateResponses(expectation: $expectation, invalid: $invalid, invalidateResponses: $invalidateResponses) { 
      sessionId
      userResponses {
        _id
        expectationScores {
          invalidated
        }
      }
    }
  }
}
`;

export function gqlMutationInvalidateResponses(
  invalidateResponses: { sessionId?: string; responseIds?: string[] }[] = [],
  expectation = '0',
  invalid = true
) {
  return {
    query: GQL_INVALIDATE_RESPONSE_DEFAULT,
    variables: {
      expectation,
      invalid,
      invalidateResponses,
    },
  };
}

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
      .send(gqlMutationInvalidateResponses());
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if no sessionId`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send(
        gqlMutationInvalidateResponses([
          {
            responseIds: [''],
          },
        ])
      );
    expect(response.body.errors[0].message).to.have.string(
      'Field "sessionId" of required type "String!" was not provided.'
    );
  });

  it(`throws an error if no responseIds`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send(
        gqlMutationInvalidateResponses([
          {
            sessionId: '',
          },
        ])
      );
    expect(response.body.errors[0].message).to.have.string(
      'Field "responseIds" of required type "[ID]!" was not provided.'
    );
  });

  it(`throws an error if no expectation`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation InvalidateResponse($expectation: String!, $invalid: Boolean!, $invalidateResponses: [InvalidateResponseInputType!]) {
          me {
            invalidateResponses(invalid: $invalid, invalidateResponses: $invalidateResponses) { 
              username
            }
          }
        }`,
        variables: {
          invalid: true,
          invalidateResponses: [
            {
              sessionId: '',
              responseIds: [''],
            },
          ],
        },
      });
    expect(response.body.errors[0].message).to.have.string(
      'Field "invalidateResponses" argument "expectation" of type "String!" is required, but it was not provided.'
    );
  });

  it(`throws an error if no invalid`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation InvalidateResponse($expectation: String!, $invalid: Boolean!, $invalidateResponses: [InvalidateResponseInputType!]) {
          me {
            invalidateResponses(expectation: $expectation, invalidateResponses: $invalidateResponses) { 
              username
            }
          }
        }`,
        variables: {
          expectation: '0',
          invalidateResponses: [
            {
              sessionId: '',
              responseIds: [''],
            },
          ],
        },
      });
    expect(response.body.errors[0].message).to.have.string(
      'Field "invalidateResponses" argument "invalid" of type "Boolean!" is required, but it was not provided.'
    );
  });

  it(`sets 1 response to invalid for 1 session`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send(
        gqlMutationInvalidateResponses([
          {
            sessionId: 'session 2',
            responseIds: ['5f20c63646f6110a6a5b2135'],
          },
        ])
      );
    expect(response.status).to.equal(200);
    expect(response.body.data.me.invalidateResponses).to.eql([
      {
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
      },
    ]);
  });

  it(`sets multiple responses to invalid for 1 session`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send(
        gqlMutationInvalidateResponses([
          {
            sessionId: 'session 6',
            responseIds: [
              '5f20c63646f6110a6a5b2131',
              '5f20c63646f6110a6a5b2134',
            ],
          },
        ])
      );
    expect(response.status).to.equal(200);
    expect(response.body.data.me.invalidateResponses).to.eql([
      {
        sessionId: 'session 6',
        userResponses: [
          {
            _id: '5f20c63646f6110a6a5b2131',
            expectationScores: [
              {
                invalidated: true,
              },
            ],
          },
          {
            _id: '5f20c63646f6110a6a5b2132',
            expectationScores: [
              {
                invalidated: false,
              },
            ],
          },
          {
            _id: '5f20c63646f6110a6a5b2133',
            expectationScores: [
              {
                invalidated: false,
              },
            ],
          },
          {
            _id: '5f20c63646f6110a6a5b2134',
            expectationScores: [
              {
                invalidated: true,
              },
            ],
          },
        ],
      },
    ]);
  });

  it(`sets responses to invalid for multiple sessions`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send(
        gqlMutationInvalidateResponses([
          {
            sessionId: 'session 2',
            responseIds: ['5f20c63646f6110a6a5b2135'],
          },
          {
            sessionId: 'session 6',
            responseIds: [
              '5f20c63646f6110a6a5b2131',
              '5f20c63646f6110a6a5b2134',
            ],
          },
        ])
      );
    expect(response.status).to.equal(200);
    expect(response.body.data.me.invalidateResponses).to.eql([
      {
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
      },
      {
        sessionId: 'session 6',
        userResponses: [
          {
            _id: '5f20c63646f6110a6a5b2131',
            expectationScores: [
              {
                invalidated: true,
              },
            ],
          },
          {
            _id: '5f20c63646f6110a6a5b2132',
            expectationScores: [
              {
                invalidated: false,
              },
            ],
          },
          {
            _id: '5f20c63646f6110a6a5b2133',
            expectationScores: [
              {
                invalidated: false,
              },
            ],
          },
          {
            _id: '5f20c63646f6110a6a5b2134',
            expectationScores: [
              {
                invalidated: true,
              },
            ],
          },
        ],
      },
    ]);
  });
});
