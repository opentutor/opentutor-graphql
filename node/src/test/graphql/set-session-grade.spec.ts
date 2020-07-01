import createApp, { appStart, appStop } from '../../app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('setSessionGrade', () => {
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
      .post('/grading')
      .send({
        query: `mutation { 
          setSessionGrade(sessionId: "invalidsession") { 
            grade
          } 
        }`,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it(`returns an error if no sessionId`, async () => {
    const response = await request(app)
      .post('/grading')
      .send({
        query: `mutation { 
          setSessionGrade(grade: 0) { 
            grade
          } 
        }`,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it(`returns an error if no grade`, async () => {
    const response = await request(app)
      .post('/grading')
      .send({
        query: `mutation { 
          setSessionGrade(sessionId: "session 1") { 
            grade
          } 
        }`,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it('returns updated session', async () => {
    const response = await request(app)
      .post('/grading')
      .send({
        query: `mutation { 
          setSessionGrade(sessionId: "session 1", grade: 0) { 
            sessionId
            username
            classifierGrade
            grade
          } 
        }`,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        setSessionGrade: {
          sessionId: 'session 1',
          username: 'username1',
          classifierGrade: 1.0,
          grade: 0.0,
        },
      },
    });
  });
});
