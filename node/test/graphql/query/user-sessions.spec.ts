import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('userSessions', () => {
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

  it('gets a page of all userSessions', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ userSessions { edges { cursor node { sessionId } } pageInfo { hasNextPage } } }',
    });
    expect(response.status).to.equal(200);
    console.log(response.body);
    expect(response.body).to.eql({
      data: {
        userSessions: {
          edges: [
            {
              node: {
                sessionId: 'session 1',
              },
              cursor: '5f20c63646f6110a6a5b2134',
            },
            {
              node: {
                sessionId: 'session 2',
              },
              cursor: '5f20c63646f6110a6a5b2135',
            },
            {
              node: {
                sessionId: 'session 3',
              },
              cursor: '5f20c63646f6110a6a5b2136',
            },
            {
              node: {
                sessionId: 'session 4',
              },
              cursor: '5f20c63646f6110a6a5b2137',
            },
            {
              node: {
                sessionId: 'session 5',
              },
              cursor: '5f20c63646f6110a6a5b2138',
            },
          ],
          pageInfo: {
            hasNextPage: false,
          },
        },
      },
    });
  });

  it('gets a page of 1 userSessions', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ userSessions(limit: 1) { edges { cursor node { sessionId } } pageInfo { hasNextPage } } }',
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        userSessions: {
          edges: [
            {
              node: {
                sessionId: 'session 1',
              },
              cursor: '5f20c63646f6110a6a5b2134',
            },
          ],
          pageInfo: {
            hasNextPage: true,
          },
        },
      },
    });
  });

  it('gets next page after cursor', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ userSessions(limit: 1, cursor: "5f20c63646f6110a6a5b2134") { edges { node { sessionId } } pageInfo { hasNextPage } } }',
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        userSessions: {
          edges: [
            {
              node: {
                sessionId: 'session 2',
              },
            },
          ],
          pageInfo: {
            hasNextPage: true,
          },
        },
      },
    });
  });
});
