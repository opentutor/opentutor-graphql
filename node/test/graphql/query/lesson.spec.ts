import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('lesson', () => {
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

  it(`returns an error if invalid id`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `query {
        lesson(lessonId: "111111111111111111111111") {
          lessonId
        }
      }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson not found for args "{"lessonId":"111111111111111111111111"}"'
    );
  });

  it('succeeds with valid id', async () => {
    const response = await request(app).post('/grading-api').send({
      query: `query {
        lesson(lessonId: "lesson1") {
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
      lessonId: 'lesson1',
      name: 'lesson name',
      intro: 'intro text',
      question: 'question?',
      expectations: [
        {
          expectation: 'expected text 1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
            {
              text: 'expectation 1 hint 2',
            },
          ],
        },
        {
          expectation: 'expected text 2',
          hints: [
            {
              text: 'expectation 2 hint 1',
            },
            {
              text: 'expectation 2 hint 2',
            },
          ],
        },
      ],
      conclusion: ['conclusion text'],
    });
  });
});
