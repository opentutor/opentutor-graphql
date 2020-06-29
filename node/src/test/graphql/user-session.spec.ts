import createApp, { appStart, appStop } from '../../app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('user-session', () => {
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

  it('returns error when no username is given', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query { 
          userSession(username: "") { 
            username
            question {
              text
            }
          } 
        }`,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'user name cannot be null or empty'
    );
  });

  it('succeeds with valid username', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query { 
          userSession(username: "username1") { 
            username
            question {
              text
            }
          } 
        }`,
      });

    const userSession = response.body.data.login;
    expect(response.status).to.equal(200);
    expect(userSession).to.eql({
      username: 'username1',
      question: {
        text: 'question text',
      },
    });
  });
});
