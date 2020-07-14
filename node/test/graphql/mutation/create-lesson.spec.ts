import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('createLesson', () => {
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

  it(`returns a new, empty lesson`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          createLesson {
            name
            intro
            question
            expectations {
              expectation
              hints {
                text
              }
            }
            conclusion
          } 
        }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.createLesson).to.eql({
      name: null,
      intro: null,
      question: null,
      expectations: [],
      conclusion: null,
    });
  });

  it(`adds a new, empty lesson to database`, async () => {
    const lesson = await request(app).post('/grading-api').send({
      query: `mutation { 
          createLesson {
            lessonId
          } 
        }`,
    });

    const response = await request(app)
      .post('/grading-api')
      .send({
        query: `query {
        lesson(lessonId: "${lesson.body.data.createLesson.lessonId}") { 
          lessonId
          name
          intro
          question
          expectations {
            expectation
            hints {
              text
            }
          }
          conclusion
        } 
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.lesson).to.eql({
      lessonId: `${lesson.body.data.createLesson.lessonId}`,
      name: null,
      intro: null,
      question: null,
      expectations: [],
      conclusion: null,
    });
  });
});
