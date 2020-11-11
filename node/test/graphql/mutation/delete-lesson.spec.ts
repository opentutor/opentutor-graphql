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

describe('deleteLesson', () => {
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

  it(`returns an error if no lessonId`, async () => {
    const response = await request(app).post('/graphql').send({
      query: `mutation { 
          deleteLesson(lessonId: "") { 
            deleted
          } 
        }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param lessonId'
    );
  });

  it(`returns an error if lesson was already deleted`, async () => {
    const response = await request(app).post('/graphql').send({
      query: `mutation { 
          deleteLesson(lessonId: "_deleted_lesson") { 
            deleted
          } 
        }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson was already deleted'
    );
  });

  it(`deletes lesson`, async () => {
    const response = await request(app).post('/graphql').send({
      query: `mutation { 
          deleteLesson(lessonId: "lesson1") {
            lessonId
            deleted
          } 
        }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.deleteLesson.lessonId).to.contain(
      '_deleted_lesson1'
    );
    expect(response.body.data.deleteLesson.deleted).to.eql(true);

    const lessons = await request(app).post('/graphql').send({
      query: '{ lessons { edges { node { lessonId } } } }',
    });
    expect(lessons.status).to.equal(200);
    expect(lessons.body).to.eql({
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
          ],
        },
      },
    });
  });

  it(`deletes related sessions`, async () => {
    await request(app).post('/graphql').send({
      query: `mutation { 
          deleteLesson(lessonId: "lesson1") {
            deleted
          } 
        }`,
    });
    const response = await request(app).post('/graphql').send({
      query: '{ sessions { edges { node { sessionId } } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        sessions: {
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
                sessionId: 'session 2',
              },
            },
          ],
        },
      },
    });
  });
});
