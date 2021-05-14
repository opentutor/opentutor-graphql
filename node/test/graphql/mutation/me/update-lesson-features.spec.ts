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
import { getToken } from '../../../helpers';

interface Request {
  lessonId: string;
  features?: LessonUpdate;
  expectations?: ExpectationsUpdate[];
}

interface LessonUpdate {
  features: any;
}

interface ExpectationsUpdate {
  expectation: number;
  features: any;
}

describe('updateLessonFeatures', () => {
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

  it(`throws an error if not logged in`, async () => {
    const req: Request = {
      lessonId: 'lesson1',
    };
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              lessonId
            }   
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if no edit permission`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const req: Request = {
      lessonId: 'lesson1',
      features: { features: { test: 'test' } },
    };
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              lessonId
            }   
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'user does not have permission to edit this lesson'
    );
  });

  it(`throws an error if no lessonId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(features: {}) { 
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(400);
    expect(response.body.errors[0].message).to.equal(
      `Field "updateLessonFeatures" argument "lessonId" of type "String!" is required, but it was not provided.`
    );
  });

  it(`throws an error if lesson does not exist`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const req: Request = {
      lessonId: 'newlesson',
      features: { features: { test: 'test' } },
    };
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              lessonId
            }   
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'invalid lesson id'
    );
  });

  it(`throws an error if invalid params are passed`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      features: { test: 'test' },
      lessonId: 'this should fail',
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLessonFeatures(lessonId: "lesson1", features: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(400);
  });

  it(`doesn't update anything if no features or expecationUpdate`, async () => {
    const req: Request = {
      lessonId: 'lesson8',
    };
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!) {
          me {
            updateLessonFeatures(lessonId: $lessonId) { 
              lessonId
              features
              expectations {
                expectation
                features
              }
            }
          }
        }`,
        variables: {
          lessonId: req.lessonId,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson8',
      features: {
        test: 'test',
        question: 'fake question',
      },
      expectations: [
        {
          expectation: 'answer1',
          features: {
            ideal: 'new ideal answer',
            good: ['good regex 1'],
            bad: ['bad regex 1'],
          },
        },
        {
          expectation: 'answer2',
          features: {
            good: ['good regex 2'],
            bad: ['bad regex 2'],
          },
        },
      ],
    });
  });

  it('updates lesson features and not expectation features', async () => {
    const req: Request = {
      lessonId: 'lesson8',
      features: { features: { test: 'test' } },
    };
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features) {
              lessonId
              features
              expectations {
                expectation
                features
              }
            }
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson8',
      features: {
        test: 'test',
      },
      expectations: [
        {
          expectation: 'answer1',
          features: {
            ideal: 'new ideal answer',
            good: ['good regex 1'],
            bad: ['bad regex 1'],
          },
        },
        {
          expectation: 'answer2',
          features: {
            good: ['good regex 2'],
            bad: ['bad regex 2'],
          },
        },
      ],
    });
  });

  it('updates expectation features and not lesson features', async () => {
    const req: Request = {
      lessonId: 'lesson8',
      expectations: [{ expectation: 1, features: { test: 'test' } }],
    };
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              lessonId
              features
              expectations {
                expectation
                features
              }
            }
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson8',
      features: {
        test: 'test',
        question: 'fake question',
      },
      expectations: [
        {
          expectation: 'answer1',
          features: {
            ideal: 'new ideal answer',
            good: ['good regex 1'],
            bad: ['bad regex 1'],
          },
        },
        {
          expectation: 'answer2',
          features: {
            test: 'test',
          },
        },
      ],
    });
  });

  it('updates lesson and expectation features', async () => {
    const req: Request = {
      lessonId: 'lesson8',
      features: { features: { test: 'test' } },
      expectations: [
        { expectation: 0, features: { test: 'test1' } },
        { expectation: 1, features: { test: 'test2' } },
      ],
    };
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              lessonId
              features
              expectations {
                expectation
                features
              }
            }
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson8',
      features: {
        test: 'test',
      },
      expectations: [
        {
          expectation: 'answer1',
          features: {
            test: 'test1',
          },
        },
        {
          expectation: 'answer2',
          features: {
            test: 'test2',
          },
        },
      ],
    });
  });

  it('updates for api key', async () => {
    const req: Request = {
      lessonId: 'lesson1',
      features: { features: { test: 'test' } },
    };
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              lessonId
              features
            }
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson1',
      features: {
        test: 'test',
      },
    });
  });

  it('updates for admin', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const req: Request = {
      lessonId: 'lesson1',
      features: { features: { test: 'test' } },
    };
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              lessonId
              features
            }
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson1',
      features: { test: 'test' },
    });
  });

  it('updates for content manager', async () => {
    const token = getToken('5f0cfea3395d762ca65405d2');
    const req: Request = {
      lessonId: 'lesson1',
      features: { features: { test: 'test' } },
    };
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              lessonId
              features
            }
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson1',
      features: { test: 'test' },
    });
  });

  it('updates for lesson creator', async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const req: Request = {
      lessonId: 'lesson2',
      features: { features: { test: 'test' } },
    };
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              lessonId
              features
            }
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      lessonId: 'lesson2',
      features: { test: 'test' },
    });
  });

  it(`returns updated lesson`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const req: Request = {
      lessonId: 'lesson2',
      features: { features: { test: 'test' } },
    };
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              features
            }
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLessonFeatures).to.eql({
      features: {
        test: 'test',
      },
    });
  });

  it(`updates lesson in database`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const req: Request = {
      lessonId: 'lesson1',
      features: { features: { test: 'test' } },
    };
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateLessonFeatures($lessonId: String!, $features: UpdateLessonFeaturesInputType, $expectations: [UpdateExpectationFeaturesInputType]) {
          me {
            updateLessonFeatures(lessonId: $lessonId, features: $features, expectations: $expectations) { 
              features
            }
          }
        }`,
        variables: {
          lessonId: req.lessonId,
          features: req.features,
          expectations: req.expectations,
        },
      });
    const newLesson = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          lesson(lessonId: "lesson1") {
            features
          }  
        }
      }`,
      });
    expect(newLesson.status).to.equal(200);
    expect(newLesson.body.data.me.lesson).to.eql({
      features: { test: 'test' },
    });
  });
});
