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

describe('updateLessonFeatures', () => {
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
            updateLessonFeatures(lesson: {}) { 
              lessonId
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

  it(`throws an error if no edit permission`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const lesson = JSON.stringify({
      features: { test: 'test' },
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
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
            updateLessonFeatures(lesson: {}) { 
              lessonId
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

  it(`throws an error if no lesson`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "lesson1") { 
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(400);
  });

  it('updates for api key', async () => {
    const lesson = JSON.stringify({
      features: { test: 'test' },
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson1',
    });
  });

  it('updates for admin', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      features: { test: 'test' },
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson1',
    });
  });

  it('updates for content manager', async () => {
    const token = getToken('5f0cfea3395d762ca65405d2');
    const lesson = JSON.stringify({
      features: { test: 'test' },
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson1',
    });
  });

  it('updates for lesson creator', async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const lesson = JSON.stringify({
      features: { test: 'test' },
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "lesson2", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson2',
    });
  });

  it(`fails if lesson does not exist`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      features: { test: 'test' },
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "newlesson", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'invalid lesson id'
    );
  });

  it(`fails if invalid params are passed`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      features: { test: 'test' },
      lessonId: 'this should fail',
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "newlesson", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(400);
  });

  it(`returns updated lesson`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const lesson = JSON.stringify({
      features: { test: 'test' },
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "lesson2", lesson: ${lesson}) {
              features
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      features: {
        test: 'test',
      },
    });
  });

  it(`updates lesson in database`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      features: { test: 'test' },
    }).replace(/"([^"]+)":/g, '$1:');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    const newLesson = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          lesson(lessonId: "lesson1") {
            features
          }  
        }
      }`,
      });
    expect(newLesson.status).to.equal(200);
    expect(newLesson.body.data.me.lesson).to.eql({
      features: { test: 'test' },
    });
  });
});
