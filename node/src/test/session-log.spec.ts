import app from 'server';
import { expect } from 'chai';
import request from 'supertest';

describe('session-log', () => {
  it('gets the session log', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: '{ sessionLog { username answers { answer } } }',
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        sessionLog: {
          username: 'username1',
          answers: [
            {
              answer: 'answer1',
            },
            {
              answer: 'answer2',
            },
          ],
        },
      },
    });
  });
});
