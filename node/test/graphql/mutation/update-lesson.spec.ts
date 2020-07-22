import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('updateLesson', () => {
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

  it(`returns an error if no lessonId`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          updateLesson(lesson: "") { 
            lessonId
          } 
        }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param lessonId'
    );
  });

  it(`returns an error if no lesson`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          updateLesson(lessonId: "lesson 1") { 
            lessonId
          } 
        }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param lesson'
    );
  });

  it(`creates a new lesson`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: 'newlesson',
        name: 'new name',
        intro: 'new intro',
        question: 'new question',
        conclusion: ['new conclusion'],
        expectations: [
          {
            expectation: 'new expectation',
            hints: [
              {
                text: 'new hint',
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
          updateLesson(lessonId: "newlesson", lesson: "${lesson}") {
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
    expect(response.body.data.updateLesson).to.eql({
      lessonId: 'newlesson',
      name: 'new name',
      intro: 'new intro',
      question: 'new question',
      expectations: [
        {
          expectation: 'new expectation',
          hints: [
            {
              text: 'new hint',
            },
          ],
        },
      ],
      conclusion: ['new conclusion'],
    });
  });

  it(`adds new lesson to database`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: 'newlesson',
        name: 'new name',
        intro: 'new intro',
        question: 'new question',
        conclusion: ['new conclusion'],
        expectations: [
          {
            expectation: 'new expectation',
            hints: [
              {
                text: 'new hint',
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
          updateLesson(lessonId: "newlesson", lesson: "${lesson}") {
            lessonId
          } 
        }`,
      });

    const newLesson = await request(app).post('/grading-api').send({
      query: `query {
        lesson(lessonId: "newlesson") { 
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
    expect(newLesson.status).to.equal(200);
    expect(newLesson.body.data.lesson).to.eql({
      lessonId: 'newlesson',
      name: 'new name',
      intro: 'new intro',
      question: 'new question',
      expectations: [
        {
          expectation: 'new expectation',
          hints: [
            {
              text: 'new hint',
            },
          ],
        },
      ],
      conclusion: ['new conclusion'],
    });
  });

  it(`returns updated lesson`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: 'lesson 1',
        name: 'updated name',
        intro: 'updated intro',
        question: 'updated question',
        conclusion: ['updated conclusion'],
        expectations: [
          {
            expectation: 'updated expectation',
            hints: [
              {
                text: 'updated hint',
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
          updateLesson(lessonId: "lesson 1", lesson: "${lesson}") {
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
    expect(response.body.data.updateLesson).to.eql({
      lessonId: 'lesson 1',
      name: 'updated name',
      intro: 'updated intro',
      question: 'updated question',
      expectations: [
        {
          expectation: 'updated expectation',
          hints: [
            {
              text: 'updated hint',
            },
          ],
        },
      ],
      conclusion: ['updated conclusion'],
    });
  });

  it(`updates lesson in database`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: 'lesson 1',
        name: 'updated name',
        intro: 'updated intro',
        question: 'updated question',
        conclusion: ['updated conclusion'],
        expectations: [
          {
            expectation: 'updated expectation',
            hints: [
              {
                text: 'updated hint',
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
          updateLesson(lessonId: "lesson 1", lesson: "${lesson}") {
            lessonId
          } 
        }`,
      });

    const newLesson = await request(app).post('/grading-api').send({
      query: `query {
        lesson(lessonId: "lesson 1") { 
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
    expect(newLesson.status).to.equal(200);
    expect(newLesson.body.data.lesson).to.eql({
      lessonId: 'lesson 1',
      name: 'updated name',
      intro: 'updated intro',
      question: 'updated question',
      expectations: [
        {
          expectation: 'updated expectation',
          hints: [
            {
              text: 'updated hint',
            },
          ],
        },
      ],
      conclusion: ['updated conclusion'],
    });
  });

  it(`updates lessonId`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: 'newlessonid',
        name: 'lesson name',
      })
    );
    await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "lesson 1", lesson: "${lesson}") {
            lessonId
            name
          } 
        }`,
      });

    const newLesson = await request(app).post('/grading-api').send({
      query: `query {
        lesson(lessonId: "newlessonid") {
          lessonId
        }
      }`,
    });
    expect(newLesson.status).to.equal(200);
    expect(newLesson.body.data.lesson).to.eql({
      lessonId: 'newlessonid',
    });

    const oldLesson = await request(app).post('/grading-api').send({
      query: `query {
        lesson(lessonId: "lesson 1") {
          lessonId
        }
      }`,
    });
    expect(oldLesson.status).to.equal(200);
    expect(oldLesson.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson not found for args "{"lessonId":"lesson 1"}"'
    );
  });
});
