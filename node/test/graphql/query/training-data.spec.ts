import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('lesson training data', () => {
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

  it(`return all training data for lesson`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `query {
        lessonTrainingData(lessonId: "lesson 1")
      }`,
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.lessonTrainingData).to.eql(
      'exp_num,text,label\n0,a good answer,Good\n0,a bad answer,Bad\n0,a neutral answer,Neutral'
    );
  });
});
