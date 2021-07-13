/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';
import { getToken } from 'test/helpers';

describe('users', () => {
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

  it(`returns an error if not logged in`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
        me {
          users {
            edges {
              node {
                name
              }
            }
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

  it('succeeds with api key', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `query {
        me {
          users {
            edges {
              node {
                id
                name
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.users).to.eql({
      edges: [
        {
          node: {
            id: '5f0cfea3395d762ca65405d3',
            name: 'Editor',
          },
        },
        {
          node: {
            id: '5f0cfea3395d762ca65405d2',
            name: 'Content Manager',
          },
        },
        {
          node: {
            id: '5f0cfea3395d762ca65405d1',
            name: 'Admin',
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
    });
  });

  it('gets a default page of users', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          users {
            edges {
              node {
                name
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.users).to.eql({
      edges: [
        {
          node: {
            name: 'Editor',
          },
        },
        {
          node: {
            name: 'Content Manager',
          },
        },
        {
          node: {
            name: 'Admin',
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
    });
  });

  it('gets a page of users sorted in ascending order by name with limit = 1', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          users(sortBy: "name", sortAscending: true, limit: 1) {
            edges {
              node {
                name
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.users).to.eql({
      edges: [
        {
          node: {
            name: 'Admin',
          },
        },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });
});
