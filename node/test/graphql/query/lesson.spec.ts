/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import { describe } from 'mocha';
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
    const response = await request(app).post('/graphql').send({
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

  it(`cannot find a deleted lesson`, async () => {
    const response = await request(app).post('/graphql').send({
      query: `query {
        lesson(lessonId: "_deleted_lesson") {
          lessonId
        }
      }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson not found for args "{"lessonId":"_deleted_lesson"}"'
    );
  });

  it('succeeds with valid id', async () => {
    const response = await request(app).post('/graphql').send({
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

  it('get training additional features', async () => {
    const response = await request(app).post('/graphql').send({
      query: `query {
        lesson(lessonId: "lesson8") {
          features
          expectations {
            features
          }
        }
      }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.lesson).to.eql({
      features: {
        test: 'test',
        question: 'fake question',
      },
      expectations: [
        {
          features: {
            ideal: 'new ideal answer',
            good: ['good regex 1'],
            bad: ['bad regex 1'],
          },
        },
        {
          features: {
            good: ['good regex 2'],
            bad: ['bad regex 2'],
          },
        },
      ],
    });
  });

  it('is not trainable if fewer than 10 grades per expectation', async () => {
    const response = await request(app).post('/graphql').send({
      query: `query {
        lesson(lessonId: "lesson3") {
          lessonId
          isTrainable
        }
      }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.lesson).to.eql({
      lessonId: 'lesson3',
      isTrainable: false,
    });
  });

  it('is not trainable if fewer than 2 Good grades per expectation', async () => {
    const response = await request(app).post('/graphql').send({
      query: `query {
        lesson(lessonId: "lesson4") {
          lessonId
          isTrainable
        }
      }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.lesson).to.eql({
      lessonId: 'lesson4',
      isTrainable: false,
    });
  });

  it('is not trainable if fewer than 2 Bad grades per expectation', async () => {
    const response = await request(app).post('/graphql').send({
      query: `query {
        lesson(lessonId: "lesson5") {
          lessonId
          isTrainable
        }
      }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.lesson).to.eql({
      lessonId: 'lesson5',
      isTrainable: false,
    });
  });

  it('is trainable if at least 2 good, 2 bad, and 10 total grades per expectation', async () => {
    const response = await request(app).post('/graphql').send({
      query: `query {
        lesson(lessonId: "lesson6") {
          lessonId
          isTrainable
        }
      }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.lesson).to.eql({
      lessonId: 'lesson6',
      isTrainable: true,
    });
  });
});
