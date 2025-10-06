/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import request from 'supertest';
import { getToken } from 'test/helpers';
import { loadMongo, wipeMongo } from 'test/fixtures/mongodb/data-default';

describe('sessions', () => {
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

  it(`returns an error if not logged in`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query { 
        me {
          sessions { 
            edges {
              node {
                sessionId
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
            sessions { 
              edges {
                node {
                  sessionId
                }
              }
              pageInfo {
                hasNextPage
              }
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.sessions).to.eql({
      edges: [
        {
          node: {
            sessionId: 'session2.5',
          },
        },
        {
          node: {
            sessionId: 'session 9',
          },
        },
        {
          node: {
            sessionId: 'session 8',
          },
        },
        {
          node: {
            sessionId: 'session 7',
          },
        },
        {
          node: {
            sessionId: 'session 6',
          },
        },
        {
          node: {
            sessionId: 'session 5',
          },
        },
        {
          node: {
            sessionId: 'session 4',
          },
        },
        {
          node: {
            sessionId: 'session 3',
          },
        },
        {
          node: {
            sessionId: 'session 2',
          },
        },
        {
          node: {
            sessionId: 'session 1',
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    });
  });

  it('gets a default page of sessions', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query { 
          me {
            sessions { 
              edges {
                node {
                  sessionId
                }
              }
              pageInfo {
                hasNextPage
              }
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.sessions).to.eql({
      edges: [
        {
          node: {
            sessionId: 'session2.5',
          },
        },
        {
          node: {
            sessionId: 'session 9',
          },
        },
        {
          node: {
            sessionId: 'session 8',
          },
        },
        {
          node: {
            sessionId: 'session 7',
          },
        },
        {
          node: {
            sessionId: 'session 6',
          },
        },
        {
          node: {
            sessionId: 'session 5',
          },
        },
        {
          node: {
            sessionId: 'session 4',
          },
        },
        {
          node: {
            sessionId: 'session 3',
          },
        },
        {
          node: {
            sessionId: 'session 2',
          },
        },
        {
          node: {
            sessionId: 'session 1',
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    });
  });

  it('gets a page of sessions sorted in ascending order by sessionId with limit = 1', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query { 
          me {
            sessions(sortBy: "sessionId", limit: 1) { 
              edges {
                node {
                  sessionId
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                endCursor
                startCursor
              }
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.sessions).to.eql({
      edges: [
        {
          node: {
            sessionId: 'session2.5',
          },
        },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
        startCursor: null,
        endCursor:
          'WyJzZXNzaW9uMi41Iix7IiRvaWQiOiI1ZjIwYzYzNjQ2ZjYxMTBhNmE1YjIxNDkifV0',
      },
    });
  });

  it('gets next page of sessions sorted in ascending order by sessionId with limit = 1', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query { 
          me {
            sessions(sortBy: "sessionId", limit: 1, cursor: "WyJzZXNzaW9uMi41Iix7IiRvaWQiOiI1ZjIwYzYzNjQ2ZjYxMTBhNmE1YjIxNDkifV0") { 
              edges {
                node {
                  sessionId
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                endCursor
                startCursor
              }
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.sessions).to.eql({
      edges: [
        {
          node: {
            sessionId: 'session 9',
          },
        },
      ],
      pageInfo: {
        hasPreviousPage: true,
        hasNextPage: true,
        startCursor:
          'WyJzZXNzaW9uIDkiLHsiJG9pZCI6IjVmMjBjNjM2NDZmNjExMGE2YTViMjEzOSJ9XQ',
        endCursor:
          'WyJzZXNzaW9uIDkiLHsiJG9pZCI6IjVmMjBjNjM2NDZmNjExMGE2YTViMjEzOSJ9XQ',
      },
    });
  });

  it('gets previous page of sessions sorted in ascending order by sessionId with limit = 1', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query { 
          me {
            sessions(sortBy: "sessionId", limit: 1, cursor: "prev__WyJzZXNzaW9uIDkiLHsiJG9pZCI6IjVmMjBjNjM2NDZmNjExMGE2YTViMjEzOSJ9XQ") { 
              edges {
                node {
                  sessionId
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                endCursor
                startCursor
              }
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.sessions).to.eql({
      edges: [
        {
          node: {
            sessionId: 'session2.5',
          },
        },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
        startCursor: null,
        endCursor:
          'WyJzZXNzaW9uMi41Iix7IiRvaWQiOiI1ZjIwYzYzNjQ2ZjYxMTBhNmE1YjIxNDkifV0',
      },
    });
  });

  it('gets sessions with lessonId = lesson1', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const filter = encodeURI(JSON.stringify({ lessonId: 'lesson1' }));
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query { 
          me {
            sessions(filter: "${filter}") { 
              edges {
                node {
                  sessionId
                }
              }
              pageInfo {
                hasNextPage
              }
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.sessions).to.eql({
      edges: [
        {
          node: {
            sessionId: 'session 5',
          },
        },
        {
          node: {
            sessionId: 'session 4',
          },
        },
        {
          node: {
            sessionId: 'session 2',
          },
        },
        {
          node: {
            sessionId: 'session 1',
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    });
  });

  it('gets sessions that were not abandoned', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const filter = encodeURI(
      JSON.stringify({ sessionStatus: { $ne: 'LAUNCHED' } })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query { 
          me {
            sessions(filter: "${filter}") { 
              edges {
                node {
                  sessionId
                }
              }
              pageInfo {
                hasNextPage
              }
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.sessions).to.eql({
      edges: [
        {
          node: {
            sessionId: 'session 9',
          },
        },
        {
          node: {
            sessionId: 'session 8',
          },
        },
        {
          node: {
            sessionId: 'session 7',
          },
        },
        {
          node: {
            sessionId: 'session 6',
          },
        },
        {
          node: {
            sessionId: 'session 5',
          },
        },
        {
          node: {
            sessionId: 'session 4',
          },
        },
        {
          node: {
            sessionId: 'session 3',
          },
        },
        {
          node: {
            sessionId: 'session 2',
          },
        },
        {
          node: {
            sessionId: 'session 1',
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    });
  });
});
