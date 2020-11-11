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
    const response = await request(app).post('/graphql').send({
      query:
        '{ lessons { edges { node { lessonId } } pageInfo { hasNextPage endCursor } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          edges: [
            {
              node: {
                lessonId: 'lesson8',
              },
            },
            {
              node: {
                lessonId: 'lesson6',
              },
            },
            {
              node: {
                lessonId: 'lesson5',
              },
            },
            {
              node: {
                lessonId: 'lesson4',
              },
            },
            {
              node: {
                lessonId: 'lesson3',
              },
            },
            {
              node: {
                lessonId: 'lesson2',
              },
            },
            {
              node: {
                lessonId: 'lesson1',
              },
            },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        },
      },
    });
  });

  it('gets a page of lessons sorted in ascending order by lessonId with limit = 1', async () => {
    const response = await request(app).post('/graphql').send({
      query:
        '{ lessons(sortBy: "lessonId", sortAscending: true, limit: 1) { edges { node { lessonId } } pageInfo { hasNextPage hasPreviousPage startCursor endCursor } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          edges: [
            {
              node: {
                lessonId: 'lesson1',
              },
            },
          ],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: true,
            startCursor: null,
            endCursor:
              'WyJsZXNzb24xIix7IiRvaWQiOiI1ZjBjZmVhMzM5NWQ3NjJjYTY1NDA1YzEifV0',
          },
        },
      },
    });
  });

  it('gets next page of lessons sorted in ascending order by lessonId with limit = 1', async () => {
    const response = await request(app).post('/graphql').send({
      query:
        '{ lessons(sortBy: "lessonId", sortAscending: true, limit: 1, cursor: "next__WyJsZXNzb24xIix7IiRvaWQiOiI1ZjBjZmVhMzM5NWQ3NjJjYTY1NDA1YzEifV0") { edges { node { lessonId } } pageInfo { hasNextPage hasPreviousPage startCursor endCursor } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          edges: [
            {
              node: {
                lessonId: 'lesson2',
              },
            },
          ],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: true,
            startCursor:
              'WyJsZXNzb24yIix7IiRvaWQiOiI1ZjBjZmVhMzM5NWQ3NjJjYTY1NDA1YzIifV0',
            endCursor:
              'WyJsZXNzb24yIix7IiRvaWQiOiI1ZjBjZmVhMzM5NWQ3NjJjYTY1NDA1YzIifV0',
          },
        },
      },
    });
  });

  it('gets previous page of lessons sorted in ascending order by lessonId with limit = 1', async () => {
    const response = await request(app).post('/graphql').send({
      query:
        '{ lessons(sortBy: "lessonId", sortAscending: true, limit: 1, cursor: "prev__WyJsZXNzb24yIix7IiRvaWQiOiI1ZjBjZmVhMzM5NWQ3NjJjYTY1NDA1YzIifV0") { edges { node { lessonId } } pageInfo { hasNextPage hasPreviousPage startCursor endCursor } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          edges: [
            {
              node: {
                lessonId: 'lesson1',
              },
            },
          ],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: true,
            startCursor: null,
            endCursor:
              'WyJsZXNzb24xIix7IiRvaWQiOiI1ZjBjZmVhMzM5NWQ3NjJjYTY1NDA1YzEifV0',
          },
        },
      },
    });
  });
});
