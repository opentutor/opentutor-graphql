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

  it('gets a default page of lessons', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ lessons { items { id } pageInfo { hasPrevPage hasNextPage page limit } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          items: [
            {
              id: '5f0cfea3395d762ca65405c3',
            },
            {
              id: '5f0cfea3395d762ca65405c4',
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

  it('gets a page of lessons with limit', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ lessons(limit: 1) { items { id } pageInfo { hasPrevPage hasNextPage page limit } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          items: [
            {
              id: '5f0cfea3395d762ca65405c3',
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

  it('gets next page of lessons with limit', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ lessons(limit: 1, page: 2) { items { id } pageInfo { hasPrevPage hasNextPage page limit } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          items: [
            {
              id: '5f0cfea3395d762ca65405c4',
            },
          ],
          pageInfo: {
            hasPrevPage: true,
            hasNextPage: false,
            page: 2,
            limit: 1,
          },
        },
      },
    });
  });

  it('gets a page of lessons sorted by descending name', async () => {
    const response = await request(app).post('/grading-api').send({
      query:
        '{ lessons(sort: "-name") { items { id } pageInfo { hasPrevPage hasNextPage page limit } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          items: [
            {
              id: '5f0cfea3395d762ca65405c4',
            },
            {
              id: '5f0cfea3395d762ca65405c3',
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
});
