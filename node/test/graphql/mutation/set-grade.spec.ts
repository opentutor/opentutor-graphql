import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('setGrade', () => {
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

  it(`returns an error if no sessionId`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
            username
          } 
        }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param sessionId'
    );
  });

  it(`returns an error if no userAnswerIndex`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "session 1", userExpectationIndex: 0, grade: "Bad") { 
            username
          } 
        }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param userAnswerIndex'
    );
  });

  it(`returns an error if no userExpectationIndex`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "session 1", userAnswerIndex: 0, grade: "Bad") { 
            username
          } 
        }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param userExpectationIndex'
    );
  });

  it(`returns an error if no grade`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "session 1", userAnswerIndex: 0, userExpectationIndex: 0) { 
            username
          } 
        }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param grade'
    );
  });

  it(`returns an error if invalid sessionId`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
        setGrade(sessionId: "111111111111111111111111", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
          username
          } 
        }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'failed to find userSession with sessionId 111111111111111111111111'
    );
  });

  it('returns updated user session', async () => {
    const setGrade = await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "session 1", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
            username
            graderGrade
            classifierGrade
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

    expect(setGrade.status).to.equal(200);
    expect(setGrade.body.data.setGrade).to.eql({
      username: 'username1',
      graderGrade: null,
      classifierGrade: null,
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
              graderGrade: 'Bad',
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

  it('updates user session in database', async () => {
    await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "session 1", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
            username
          } 
        }`,
    });

    const userSession = await request(app).post('/grading-api').send({
      query: `query { 
          userSession(sessionId: "session 1") { 
            username
            graderGrade
            classifierGrade
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
    expect(userSession.status).to.equal(200);
    expect(userSession.body.data.userSession).to.eql({
      username: 'username1',
      graderGrade: null,
      classifierGrade: null,
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
              graderGrade: 'Bad',
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

  it('calculates and updates GOOD graderGrade', async () => {
    await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "session 2", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Good") { 
            username
          } 
        }`,
    });

    const userSession = await request(app).post('/grading-api').send({
      query: `query { 
          userSession(sessionId: "session 2") { 
            graderGrade
          } 
        }`,
    });
    expect(userSession.status).to.equal(200);
    expect(userSession.body.data.userSession).to.eql({
      graderGrade: 1,
    });
  });

  it('calculates and updates BAD graderGrade', async () => {
    await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "session 2", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
            username
          } 
        }`,
    });

    const userSession = await request(app).post('/grading-api').send({
      query: `query { 
          userSession(sessionId: "session 2") { 
            graderGrade
          } 
        }`,
    });
    expect(userSession.status).to.equal(200);
    expect(userSession.body.data.userSession).to.eql({
      graderGrade: 0,
    });
  });

  it('calculates and updates NEUTRAL graderGrade', async () => {
    await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "session 2", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Neutral") { 
            username
          } 
        }`,
    });

    const userSession = await request(app).post('/grading-api').send({
      query: `query { 
          userSession(sessionId: "session 2") { 
            graderGrade
          } 
        }`,
    });
    expect(userSession.status).to.equal(200);
    expect(userSession.body.data.userSession).to.eql({
      graderGrade: 0.5,
    });
  });

  it('calculates and updates NO graderGrade', async () => {
    await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "session 2", userAnswerIndex: 0, userExpectationIndex: 0, grade: "") { 
            username
          } 
        }`,
    });

    const userSession = await request(app).post('/grading-api').send({
      query: `query { 
          userSession(sessionId: "session 2") { 
            graderGrade
          } 
        }`,
    });
    expect(userSession.status).to.equal(200);
    expect(userSession.body.data.userSession).to.eql({
      graderGrade: null,
    });
  });
});
