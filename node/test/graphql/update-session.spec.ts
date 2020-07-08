import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('updateSession', () => {
  let app: Express;

  beforeEach(async () => {
    await mongoUnit.load(require('../fixtures/mongodb/data-default.js'));
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
          updateSession(userSession: "") { 
            username
          } 
        }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it(`returns an error if no userSession`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          updateSession(sessionId: "new session") { 
            username
          } 
        }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it(`returns updated user session`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
          updateSession(sessionId: "new session", userSession: "${userSession}") { 
            sessionId
            username
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
    expect(response.status).to.equal(200);
    expect(response.body.data.updateSession).to.eql({
      sessionId: 'new session',
      username: 'new username',
      question: {
        text: 'new question?',
        expectations: [{ text: 'new expected text' }],
      },
      userResponses: [
        {
          text: 'new answer',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: null,
            },
          ],
        },
      ],
    });
  });

  it(`adds new userSession to database`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
            updateSession(sessionId: "new session", userSession: "${userSession}") { 
              username
            } 
          }`,
      });

    const response = await request(app).post('/grading-api').send({
      query: `query { 
            userSession(sessionId: "new session") { 
              sessionId
              username
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
    expect(response.status).to.equal(200);
    expect(response.body.data.userSession).to.eql({
      sessionId: 'new session',
      username: 'new username',
      question: {
        text: 'new question?',
        expectations: [{ text: 'new expected text' }],
      },
      userResponses: [
        {
          text: 'new answer',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: null,
            },
          ],
        },
      ],
    });
  });

  it(`adds new session to database`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
            updateSession(sessionId: "new session", userSession: "${userSession}") { 
              username
            } 
          }`,
      });

    const response = await request(app).post('/grading-api').send({
      query: `query { 
            session(sessionId: "new session") { 
              sessionId
              username
              classifierGrade
              grade
            } 
          }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.session).to.eql({
      sessionId: 'new session',
      username: 'new username',
      classifierGrade: null,
      grade: null,
    });
  });

  it(`updates userSession in database`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        sessionId: 'session 1',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
            updateSession(sessionId: "session 1", userSession: "${userSession}") { 
              username
            } 
          }`,
      });

    const response = await request(app).post('/grading-api').send({
      query: `query { 
            userSession(sessionId: "session 1") { 
              sessionId
              username
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
    expect(response.status).to.equal(200);
    expect(response.body.data.userSession).to.eql({
      sessionId: 'session 1',
      username: 'new username',
      question: {
        text: 'new question?',
        expectations: [{ text: 'new expected text' }],
      },
      userResponses: [
        {
          text: 'new answer',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: null,
            },
          ],
        },
      ],
    });
  });

  it(`updates session in database`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        sessionId: 'session 1',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
            updateSession(sessionId: "session 1", userSession: "${userSession}") { 
              username
            } 
          }`,
      });

    const response = await request(app).post('/grading-api').send({
      query: `query { 
            session(sessionId: "session 1") { 
              sessionId
              username
              classifierGrade
              grade
            } 
          }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.session).to.eql({
      sessionId: 'session 1',
      username: 'new username',
      classifierGrade: 1,
      grade: 1,
    });
  });
});
