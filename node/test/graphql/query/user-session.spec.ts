import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('userSession', () => {
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

  it(`returns an error if invalid sessionId`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `query { 
          userSession(sessionId: "111111111111111111111111") { 
            username
          } 
        }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'usersession not found for args "{"sessionId":"111111111111111111111111"}"'
    );
  });

  it('succeeds with valid sessionId', async () => {
    const response = await request(app).post('/grading-api').send({
      query: `query { 
          userSession(sessionId: "session 1") { 
            sessionId
            username
            lesson {
              lessonId
            }
            question {
              text
              expectations {
                text
              }
            }
            userResponses {
              text
              expectationScores {
                classifierGrade
                graderGrade
              }
            }
          } 
        }`,
    });

    const userSession = response.body.data.userSession;
    expect(response.status).to.equal(200);
    expect(userSession).to.eql({
      sessionId: 'session 1',
      lesson: {
        lessonId: 'lesson 1',
      },
      username: 'username1',
      question: {
        text: 'question?',
        expectations: [
          { text: 'expected text 1' },
          { text: 'expected text 2' },
        ],
      },
      userResponses: [
        {
          text: 'answer1',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: '',
            },
          ],
        },
        {
          text: 'answer2',
          expectationScores: [
            {
              classifierGrade: 'Bad',
              graderGrade: '',
            },
          ],
        },
      ],
    });
  });
});
