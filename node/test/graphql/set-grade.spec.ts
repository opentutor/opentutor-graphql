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

  it(`returns an error if invalid sessionId`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "invalidsession") { 
            username
          } 
        }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
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
    expect(response.body).to.have.deep.nested.property('errors[0].message');
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
    expect(response.body).to.have.deep.nested.property('errors[0].message');
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
    expect(response.body).to.have.deep.nested.property('errors[0].message');
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
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it('returns updated user session', async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          setGrade(sessionId: "session 1", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
            username
            score
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

    const userSession = response.body.data.setGrade;
    expect(response.status).to.equal(200);
    expect(userSession).to.eql({
      username: 'username1',
      score: null,
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

    const response = await request(app).post('/grading-api').send({
      query: `query { 
          userSession(sessionId: "session 1") { 
            username
            score
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
      username: 'username1',
      score: null,
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

  it('calculates and updates GOOD score', async () => {
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
            score
          } 
        }`,
    });
    expect(userSession.status).to.equal(200);
    expect(userSession.body.data.userSession).to.eql({
      score: 1,
    });

    const session = await request(app).post('/grading-api').send({
      query: `query { 
          session(sessionId: "session 2") { 
            grade
          } 
        }`,
    });
    expect(session.status).to.equal(200);
    expect(session.body.data.session).to.eql({
      grade: 1,
    });
  });

  it('calculates and updates BAD score', async () => {
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
            score
          } 
        }`,
    });
    expect(userSession.status).to.equal(200);
    expect(userSession.body.data.userSession).to.eql({
      score: 0,
    });

    const session = await request(app).post('/grading-api').send({
      query: `query { 
          session(sessionId: "session 2") { 
            grade
          } 
        }`,
    });
    expect(session.status).to.equal(200);
    expect(session.body.data.session).to.eql({
      grade: 0,
    });
  });

  it('calculates and updates NEUTRAL score', async () => {
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
            score
          } 
        }`,
    });
    expect(userSession.status).to.equal(200);
    expect(userSession.body.data.userSession).to.eql({
      score: 0.5,
    });

    const session = await request(app).post('/grading-api').send({
      query: `query { 
          session(sessionId: "session 2") { 
            grade
          } 
        }`,
    });
    expect(session.status).to.equal(200);
    expect(session.body.data.session).to.eql({
      grade: 0.5,
    });
  });

  it('calculates and updates NO score', async () => {
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
            score
          } 
        }`,
    });
    expect(userSession.status).to.equal(200);
    expect(userSession.body.data.userSession).to.eql({
      score: null,
    });

    const session = await request(app).post('/grading-api').send({
      query: `query { 
          session(sessionId: "session 2") { 
            grade
          } 
        }`,
    });
    expect(session.status).to.equal(200);
    expect(session.body.data.session).to.eql({
      grade: null,
    });
  });
});
