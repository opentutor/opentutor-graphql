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
import { getToken } from '../../helpers';

describe('login', () => {
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

  it(`returns an error if no accessToken`, async () => {
    const response = await request(app).post('/graphql').send({
      query: `mutation {
          login {
            user {
              name
              email  
            }
            accessToken
            expirationDate
          } 
        }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param accessToken'
    );
  });

  it(`returns an error if token expired`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1', -1);
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation {
          login(accessToken: "${token}") {
            user {
              name
              email
            }
            accessToken
            expirationDate
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'TokenExpiredError: jwt expired'
    );
  });

  it(`returns user and updates token`, async () => {
    const date = new Date(Date.now() + 3000);
    const token = getToken('5f0cfea3395d762ca65405d1', 300);
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation {
          login(accessToken: "${token}") {
            user {
              name
              email  
            }
            accessToken
            expirationDate
          } 
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.login.user).to.eql({
      name: 'Admin',
      email: 'admin@opentutor.com',
    });
    expect(response.body.data.login.accessToken).to.not.eql(token);
    expect(new Date(response.body.data.login.expirationDate)).to.be.greaterThan(
      date
    );
  });

  it(`updates lastLoginAt`, async () => {
    const date = new Date(Date.now() - 1000);
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation {
          login(accessToken: "${token}") {
            user {
              lastLoginAt
            }
          } 
        }`,
      });
    expect(response.status).to.equal(200);
    expect(
      new Date(response.body.data.login.user.lastLoginAt)
    ).to.be.greaterThan(date);
  });
});
