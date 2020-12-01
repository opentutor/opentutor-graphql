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
import { getToken } from '../../../helpers';

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

  it(`throws an error if not logged in`, async () => {
    const response = await request(app).post('/graphql').send({
      query: `mutation {
          me {
            deleteLesson(lessonId: "") { 
              deleted
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

  it(`throws an error if user does not have permissions`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            deleteLesson(lessonId: "lesson1") {
              deleted
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'user does not have permission to edit this lesson'
    );
  });

  it(`throws an error if no lessonId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            deleteLesson(lessonId: "") {
              deleted
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param lessonId'
    );
  });

  it(`throws an error if lesson was already deleted`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            deleteLesson(lessonId: "_deleted_lesson") { 
              deleted
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson was already deleted'
    );
  });

  it('succeeds for api key', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation {
          me {
            deleteLesson(lessonId: "lesson1") {
              deleted
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.deleteLesson.deleted).to.eql(true);
  });

  it('succeeds for admin', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            deleteLesson(lessonId: "lesson1") {
              deleted
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.deleteLesson.deleted).to.eql(true);
  });

  it('succeeds for content manager', async () => {
    const token = getToken('5f0cfea3395d762ca65405d2');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            deleteLesson(lessonId: "lesson1") {
              deleted
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.deleteLesson.deleted).to.eql(true);
  });

  it('succeeds for lesson creator', async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            deleteLesson(lessonId: "lesson2") {
              deleted
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.deleteLesson.deleted).to.eql(true);
  });

  it(`deletes lesson`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            deleteLesson(lessonId: "lesson1") {
              lessonId
              deleted
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.deleteLesson.lessonId).to.contain(
      '_deleted_lesson1'
    );
    expect(response.body.data.me.deleteLesson.deleted).to.eql(true);
    const lessons = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
          me {
            lessons {
              edges {
                node {
                  lessonId
                }
              }
            }  
          }
        }`,
      });
    expect(lessons.status).to.equal(200);
    expect(lessons.body.data.me).to.eql({
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
    });
  });

  it(`deletes related sessions`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            deleteLesson(lessonId: "lesson1") {
              deleted
            }  
          }
        }`,
      });
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
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me).to.eql({
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
              sessionId: 'session 3',
            },
          },
        ],
      },
    });
  });
});
