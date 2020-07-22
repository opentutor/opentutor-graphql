import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('lessons', () => {
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

  it('gets a page of all lessons', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ lessons { edges { cursor node { lessonId } } pageInfo { hasNextPage } } }',
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          edges: [
            {
              node: {
                lessonId: 'lesson 1',
              },
              cursor: 'NWYwY2ZlYTMzOTVkNzYyY2E2NTQwNWMz',
            },
            {
              node: {
                lessonId: 'lesson 2',
              },
              cursor: 'NWYwY2ZlYTMzOTVkNzYyY2E2NTQwNWM0',
            },
          ],
          pageInfo: {
            hasNextPage: false,
          },
        },
      },
    });
  });

  it('gets a page of 1 lessons', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ lessons(limit: 1) { edges { cursor node { lessonId } } pageInfo { hasNextPage } } }',
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          edges: [
            {
              node: {
                lessonId: 'lesson 1',
              },
              cursor: 'NWYwY2ZlYTMzOTVkNzYyY2E2NTQwNWMz',
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
        '{ lessons(limit: 1, cursor: "NWYwY2ZlYTMzOTVkNzYyY2E2NTQwNWMz") { edges { node { lessonId } } pageInfo { hasNextPage } } }',
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          edges: [
            {
              node: {
                lessonId: 'lesson 2',
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

  it('sorts lessons by name in descending order', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ lessons(sortBy: "name", sortDescending: true) { edges { node { lessonId } } pageInfo { hasNextPage } } }',
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          edges: [
            {
              node: {
                lessonId: 'lesson 2',
              },
            },
            {
              node: {
                lessonId: 'lesson 1',
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
