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

describe('training data', () => {
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
        trainingData(lessonId: "lesson1") {
          training
          config
        }
      }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.trainingData.training).to.eql(
      'exp_num,text,label\n0,a good answer,Good\n0,a bad answer,Bad\n0,a neutral answer,Neutral'
    );
    expect(response.body.data.trainingData.config).to.eql(
      'question: "question?"'
    );
  });
});
