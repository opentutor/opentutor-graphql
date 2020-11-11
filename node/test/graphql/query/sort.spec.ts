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

describe('sort', () => {
  let app: Express;

  beforeEach(async () => {
    await mongoUnit.load(require('test/fixtures/mongodb/data-sort.js'));
    app = await createApp();
    await appStart();
  });

  afterEach(async () => {
    await appStop();
    await mongoUnit.drop();
  });

  it('sorts lessons by ascending name', async () => {
    const response = await request(app).post('/graphql').send({
      query:
        '{ lessons(sortBy: "name", sortAscending: true) { edges { node { name } } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          edges: [
            {
              node: {
                name: '123',
              },
            },
            {
              node: {
                name: 'aaa',
              },
            },
            {
              node: {
                name: 'AAA',
              },
            },
            {
              node: {
                name: 'bbb',
              },
            },
            {
              node: {
                name: 'BBB',
              },
            },
          ],
        },
      },
    });
  });

  it('sorts lessons by descending creator', async () => {
    const response = await request(app).post('/graphql').send({
      query:
        '{ lessons(sortBy: "createdBy", sortAscending: false) { edges { node { name } } } }',
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.eql({
      data: {
        lessons: {
          edges: [
            {
              node: {
                name: 'BBB',
              },
            },
            {
              node: {
                name: 'bbb',
              },
            },
            {
              node: {
                name: 'AAA',
              },
            },
            {
              node: {
                name: 'aaa',
              },
            },
            {
              node: {
                name: '123',
              },
            },
          ],
        },
      },
    });
  });
});
