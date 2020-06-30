import createApp, { appStart, appStop } from '../../app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('setGrade', () => {
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

  it(`returns an error if invalid sessionId`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
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
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          setGrade(userAnswerIndex: 0, grade: "Bad") { 
            username
          } 
        }`,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it(`returns an error if no userAnswerIndex`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          setGrade(sessionId: "session1", grade: "Bad") { 
            username
          } 
        }`,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it(`returns an error if no grade`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          setGrade(sessionId: "session1", userAnswerIndex: 0) { 
            username
          } 
        }`,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it('returns updated user session', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          setGrade(sessionId: "session1", userAnswerIndex: 0, grade: "Bad") { 
            username
            question {
              text
              expectations {
                text
              }
            }
            userResponses {
              text
              expectationScore {
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
          expectationScore: {
            classifierGrade: 'Good',
            graderGrade: 'Bad',
          },
        },
        {
          text: 'answer2',
          expectationScore: {
            classifierGrade: 'Bad',
            graderGrade: '',
          },
        },
      ],
    });
  });

  it('updates user session in database', async () => {
    await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          setGrade(sessionId: "session1", userAnswerIndex: 0, grade: "Bad") { 
            username
            question {
              text
              expectations {
                text
              }
            }
            userResponses {
              text
              expectationScore {
                classifierGrade
                graderGrade
              }
            }
          } 
        }`,
      });

    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query { 
          userSession(sessionId: "session1") { 
            username
            question {
              text
              expectations {
                text
              }
            }
            userResponses {
              text
              expectationScore {
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
          expectationScore: {
            classifierGrade: 'Good',
            graderGrade: 'Bad',
          },
        },
        {
          text: 'answer2',
          expectationScore: {
            classifierGrade: 'Bad',
            graderGrade: '',
          },
        },
      ],
    });
  });
});
