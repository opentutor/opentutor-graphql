import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('session', () => {
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
          session(sessionId: "invalidsession") { 
            sessionId
          } 
        }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property('errors[0].message');
  });

  it('succeeds with valid sessionId', async () => {
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
      username: 'username1',
      classifierGrade: 1.0,
      grade: 1.0,
    });
  });
});
