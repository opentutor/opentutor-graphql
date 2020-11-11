/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
    const response = await request(app).post('/graphql').send({
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
    const response = await request(app).post('/graphql').send({
      query: `mutation { 
          updateLesson(lessonId: "lesson1") { 
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

  it(`args.lessonId must be lowercase`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: 'a',
      })
    );
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "A", lesson: "${lesson}") {
            lessonId
          } 
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lessonId must match [a-z0-9-]'
    );
  });

  it(`lesson.lessonId must be lowercase`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: 'A',
      })
    );
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "a", lesson: "${lesson}") {
            lessonId
          } 
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lessonId must match [a-z0-9-]'
    );
  });

  it(`args.lessonId cannot contain special chars`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: 'a',
      })
    );
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "!", lesson: "${lesson}") {
            lessonId
          } 
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lessonId must match [a-z0-9-]'
    );
  });

  it(`lesson.lessonId cannot contain special chars`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: '!',
      })
    );
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "a", lesson: "${lesson}") {
            lessonId
          } 
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lessonId must match [a-z0-9-]'
    );
  });

  it(`throws an error if lesson was deleted`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: '_deleted_lesson',
        deleted: true,
      })
    );
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "_deleted_lesson", lesson: "${lesson}") {
            lessonId
          } 
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson was deleted'
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
      .post('/graphql')
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
      .post('/graphql')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "newlesson", lesson: "${lesson}") {
            lessonId
          } 
        }`,
      });

    const newLesson = await request(app).post('/graphql').send({
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
        lessonId: 'lesson1',
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
      .post('/graphql')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "lesson1", lesson: "${lesson}") {
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
      lessonId: 'lesson1',
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
        lessonId: 'lesson1',
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
      .post('/graphql')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "lesson1", lesson: "${lesson}") {
            lessonId
          } 
        }`,
      });

    const newLesson = await request(app).post('/graphql').send({
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
    expect(newLesson.status).to.equal(200);
    expect(newLesson.body.data.lesson).to.eql({
      lessonId: 'lesson1',
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
      .post('/graphql')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "lesson1", lesson: "${lesson}") {
            lessonId
            name
          } 
        }`,
      });

    const newLesson = await request(app).post('/graphql').send({
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

    const oldLesson = await request(app).post('/graphql').send({
      query: `query {
        lesson(lessonId: "lesson1") {
          lessonId
        }
      }`,
    });
    expect(oldLesson.status).to.equal(200);
    expect(oldLesson.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson not found for args "{"lessonId":"lesson1"}"'
    );
  });

  it(`updates session lesson`, async () => {
    const lesson = encodeURI(
      JSON.stringify({
        lessonId: 'newlessonid',
        name: 'new lesson name',
        createdBy: 'new creator',
      })
    );
    await request(app)
      .post('/graphql')
      .send({
        query: `mutation { 
          updateLesson(lessonId: "lesson1", lesson: "${lesson}") {
            lessonId
          } 
        }`,
      });

    const response = await request(app).post('/graphql').send({
      query: `query {
        session(sessionId: "session 1") {
          lessonId
          lessonName
          lessonCreatedBy
        } 
      }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.session).to.eql({
      lessonId: 'newlessonid',
      lessonName: 'new lesson name',
      lessonCreatedBy: 'new creator',
    });
  });
});
