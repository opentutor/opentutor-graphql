import createApp, { appStart, appStop } from '../../app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('sessions', () => {
  let app: Express;

  beforeEach(async () => {
    await mongoUnit.load(require('../fixtures/mongodb/data-default.js'));
    app = await createApp();
    await appStart();
  });

  afterEach(async () => {
    await appStop();
    await mongoUnit.drop();
  });

  it('gets a page of all sessions', async () => {
    const response = await request(app)
      .post('/grading')
      .send({
        query:
          '{ sessions { edges { cursor node { sessionId classifierGrade grade } } pageInfo { hasNextPage } } }',
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        sessions: {
          edges: [
            {
              node: {
                sessionId: 'session 1',
                classifierGrade: 1.0,
                grade: 1.0,
              },
              cursor: 'NWVmYjg5YzRmZTMzMTRmOWEwYzExZWVk',
            },
            {
              node: {
                sessionId: 'session 2',
                classifierGrade: 0.5,
                grade: 0.5,
              },
              cursor: 'NWVmYjg5YzRmZTMzMTRmOWEwYzExZWVl',
            },
          ],
          pageInfo: {
            hasNextPage: false,
          },
        },
      },
    });
  });

  it('gets a page of 1 sessions', async () => {
    const response = await request(app)
      .post('/grading')
      .send({
        query:
          '{ sessions(limit: 1) { edges { cursor node { sessionId classifierGrade grade } } pageInfo { hasNextPage } } }',
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        sessions: {
          edges: [
            {
              node: {
                sessionId: 'session 1',
                classifierGrade: 1.0,
                grade: 1.0,
              },
              cursor: 'NWVmYjg5YzRmZTMzMTRmOWEwYzExZWVk',
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
    const response = await request(app)
      .post('/grading')
      .send({
        query:
          '{ sessions(limit: 1, cursor: "NWVmYjg5YzRmZTMzMTRmOWEwYzExZWVk") { edges { node { sessionId classifierGrade grade } } pageInfo { hasNextPage } } }',
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        sessions: {
          edges: [
            {
              node: {
                sessionId: 'session 2',
                classifierGrade: 0.5,
                grade: 0.5,
              },
            },
          ],
          pageInfo: {
            hasNextPage: false,
          },
        },
      },
    });
  });
});
