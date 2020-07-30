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

  it('gets a default page of userSessions', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ userSessions { items { sessionId } pageInfo { hasPrevPage hasNextPage page limit } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        userSessions: {
          items: [
            {
              sessionId: 'session 1',
            },
            {
              sessionId: 'session 2',
            },
            {
              sessionId: 'session 3',
            },
            {
              sessionId: 'session 4',
            },
            {
              sessionId: 'session 5',
            },
          ],
          pageInfo: {
            hasPrevPage: false,
            hasNextPage: false,
            page: 1,
            limit: 100,
          },
        },
      },
    });
  });

  it('gets a page of 1 userSession', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ userSessions(limit: 1) { items { sessionId } pageInfo { hasPrevPage hasNextPage page limit } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        userSessions: {
          items: [
            {
              sessionId: 'session 1',
            },
          ],
          pageInfo: {
            hasPrevPage: false,
            hasNextPage: true,
            page: 1,
            limit: 1,
          },
        },
      },
    });
  });

  it('gets next page of 1 userSession', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ userSessions(limit: 1, page: 2) { items { sessionId } pageInfo { hasPrevPage hasNextPage page limit } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        userSessions: {
          items: [
            {
              sessionId: 'session 2',
            },
          ],
          pageInfo: {
            hasPrevPage: true,
            hasNextPage: true,
            page: 2,
            limit: 1,
          },
        },
      },
    });
  });
});
