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
import { getToken } from 'test/helpers';

describe('updateAppConfig', () => {
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
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation UpdateConfig($appConfig: AppConfigUpdateInputType!) {
          me {
            updateAppConfig(appConfig: $appConfig) {
              logoIcon
              featuredLessons
            }
          }
        }`,
        variables: { appConfig: {} },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if no appConfig`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation UpdateConfig($appConfig: AppConfigUpdateInputType) {
          me {
            updateAppConfig(appConfig: $appConfig) {
              logoIcon
              featuredLessons
            }
          }
        }`,
        variables: {},
      });
    expect(response.status).to.equal(400);
  });

  it('does not accept USER', async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateConfig($appConfig: AppConfigUpdateInputType!) {
          me {
            updateAppConfig(appConfig: $appConfig) {
              logoIcon
              featuredLessons
            }
          }
        }`,
        variables: { appConfig: {} },
      });
    expect(response.status).to.equal(200);
    expect(response.body.errors[0].message).to.equal(
      'you do not have permission to edit appConfig'
    );
  });

  it('does not accept CONTENT_MANAGER', async () => {
    const token = getToken('5f0cfea3395d762ca65405d2');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateConfig($appConfig: AppConfigUpdateInputType!) {
          me {
            updateAppConfig(appConfig: $appConfig) {
              logoIcon
              featuredLessons
            }
          }
        }`,
        variables: { appConfig: {} },
      });
    expect(response.status).to.equal(200);
    expect(response.body.errors[0].message).to.equal(
      'you do not have permission to edit appConfig'
    );
  });

  it('ADMIN can update appConfig', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateConfig($appConfig: AppConfigUpdateInputType!) {
          me {
            updateAppConfig(appConfig: $appConfig) {
              logoIcon
              featuredLessons
            }
          }
        }`,
        variables: {
          appConfig: {
            logoIcon: 'newlogo.png',
            featuredLessons: ['5f0cfea3395d762ca65405c1'],
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateAppConfig).to.eql({
      logoIcon: 'newlogo.png',
      featuredLessons: ['5f0cfea3395d762ca65405c1'],
    });
  });
});
