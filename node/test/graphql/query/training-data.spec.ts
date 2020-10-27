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
import * as YAML from 'yaml';

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
    const response = await request(app).post('/graphql').send({
      query: `query {
        trainingData(lessonId: "lesson1") {
          isTrainable
          training
          config
        }
      }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.trainingData.training).to.eql(
      'exp_num,text,label\n0,a good answer,Good\n0,a bad answer,Bad\n'
    );
    expect(YAML.parse(response.body.data.trainingData.config)).to.eql({
      question: 'question?',
      expectations: [
        {
          ideal: 'expected text 1',
          features: null,
        },
        {
          ideal: 'expected text 2',
          features: null,
        },
      ],
    });
    expect(response.body.data.trainingData.isTrainable).to.eql(false);
  });

  it(`training config includes additional properties `, async () => {
    const response = await request(app).post('/graphql').send({
      query: `query {
        trainingData(lessonId: "lesson8") {
          config
        }
      }`,
    });
    expect(response.status).to.equal(200);
    expect(YAML.parse(response.body.data.trainingData.config)).to.eql({
      question: 'question',
      expectations: [
        {
          ideal: 'answer1',
          features: {
            ideal: 'new ideal answer',
            good: ['good regex 1'],
            bad: ['bad regex 1'],
          },
        },
        {
          ideal: 'answer2',
          features: {
            good: ['good regex 2'],
            bad: ['bad regex 2'],
          },
        },
      ],
    });
  });

  it(`training csv escapes commas and quotes`, async () => {
    const response = await request(app).post('/graphql').send({
      query: `query {
        trainingData(lessonId: "lesson6") {
          training
        }
      }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.trainingData.training).to.eql(
      `exp_num,text,label\n0,"""good, not bad""",Good\n0,"good, not bad",Good\n0,"""bad"", not ""good""",Bad\n0,bad,Bad\n`
    );
  });
});
