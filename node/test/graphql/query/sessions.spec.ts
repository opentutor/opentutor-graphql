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

describe('sessions', () => {
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

  it('gets a page of all sessions', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ sessions { edges { cursor node { sessionId } } pageInfo { hasNextPage } } }',
    });
    expect(response.status).to.equal(200);
    console.log(response.body);
    expect(response.body).to.eql({
      data: {
        sessions: {
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

  it('gets a page of 1 sessions', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ sessions(limit: 1) { edges { cursor node { sessionId } } pageInfo { hasNextPage } } }',
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        sessions: {
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
        '{ sessions(limit: 1, cursor: "5f20c63646f6110a6a5b2134") { edges { node { sessionId } } pageInfo { hasNextPage } } }',
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        sessions: {
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
