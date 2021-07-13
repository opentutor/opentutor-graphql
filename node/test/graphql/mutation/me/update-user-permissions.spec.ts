/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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

describe('updateUserPermissions', () => {
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

  it(`returns an error if no userId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateUserPermissions(permissionLevel: "") {
              name
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param userId'
    );
  });

  it(`returns an error if no permissionLevel`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateUserPermissions(userId: "5f0cfea3395d762ca65405d3") {
              name
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param permissionLevel'
    );
  });

  it(`returns an error if invalid permissionLevel`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateUserPermissions(userId: "5f0cfea3395d762ca65405d3", permissionLevel: "bad") {
              name
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'permissionLevel must be "author", "contentManager", or "admin"'
    );
  });

  it(`returns an error if not logged in`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation {
          me {
            updateUserPermissions(userId: "5f0cfea3395d762ca65405d3", permissionLevel: "author") {
              name
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`returns an error if not admin or content manager`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateUserPermissions(userId: "5f0cfea3395d762ca65405d3", permissionLevel: "author") {
              name
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'must be an admin or content manager to edit user permissions'
    );
  });

  it(`returns an error if permissionLevel = admin and not an admin`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d2');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateUserPermissions(userId: "5f0cfea3395d762ca65405d3", permissionLevel: "admin") {
              name
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'only admins can give admin permissions'
    );
  });

  it(`returns an error if editing an admin and not an admin`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d2');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateUserPermissions(userId: "5f0cfea3395d762ca65405d1", permissionLevel: "author") {
              name
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'only admins can edit an admins permissions'
    );
  });

  it(`returns an error if invalid user`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateUserPermissions(userId: "5f0cfea3395d762ca65405d4", permissionLevel: "author") {
              name
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'could not find user for id 5f0cfea3395d762ca65405d4'
    );
  });

  [
    {
      user: '5f0cfea3395d762ca65405d2',
      userToEdit: '5f0cfea3395d762ca65405d1',
      userRole: 'contentManager',
      userToEditRole: 'admin',
      permissionLevel: 'contentManager',
    },
    {
      user: '5f0cfea3395d762ca65405d2',
      userToEdit: '5f0cfea3395d762ca65405d1',
      userRole: 'contentManager',
      userToEditRole: 'admin',
      permissionLevel: 'author',
    },
    {
      user: '5f0cfea3395d762ca65405d2',
      userToEdit: '5f0cfea3395d762ca65405d2',
      userRole: 'contentManager',
      userToEditRole: 'contentManager',
      permissionLevel: 'admin',
    },
    {
      user: '5f0cfea3395d762ca65405d2',
      userToEdit: '5f0cfea3395d762ca65405d3',
      userRole: 'contentManager',
      userToEditRole: 'author',
      permissionLevel: 'admin',
    },
    {
      user: '5f0cfea3395d762ca65405d3',
      userToEdit: '5f0cfea3395d762ca65405d3',
      userRole: 'author',
      userToEditRole: 'author',
      permissionLevel: 'admin',
    },
    {
      user: '5f0cfea3395d762ca65405d3',
      userToEdit: '5f0cfea3395d762ca65405d3',
      userRole: 'author',
      userToEditRole: 'author',
      permissionLevel: 'contentManager',
    },
    {
      user: '5f0cfea3395d762ca65405d3',
      userToEdit: '5f0cfea3395d762ca65405d2',
      userRole: 'author',
      userToEditRole: 'contentManager',
      permissionLevel: 'admin',
    },
    {
      user: '5f0cfea3395d762ca65405d3',
      userToEdit: '5f0cfea3395d762ca65405d2',
      userRole: 'author',
      userToEditRole: 'contentManager',
      permissionLevel: 'author',
    },
    {
      user: '5f0cfea3395d762ca65405d3',
      userToEdit: '5f0cfea3395d762ca65405d1',
      userRole: 'author',
      userToEditRole: 'admin',
      permissionLevel: 'author',
    },
    {
      user: '5f0cfea3395d762ca65405d3',
      userToEdit: '5f0cfea3395d762ca65405d1',
      userRole: 'author',
      userToEditRole: 'admin',
      permissionLevel: 'contentManager',
    },
  ].forEach((item: any) => {
    it(`${item.userRole} user cannot change ${item.userToEditRole} user's role to ${item.permissionLevel}`, async () => {
      const token = getToken(item.user);
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `bearer ${token}`)
        .send({
          query: `mutation {
          me {
            updateUserPermissions(userId: "${item.userToEdit}", permissionLevel: "${item.permissionLevel}") {
              userRole
            }
          }
        }`,
        });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.deep.nested.property('errors[0].message');
    });
  });

  [
    {
      user: '5f0cfea3395d762ca65405d1',
      userToEdit: '5f0cfea3395d762ca65405d1',
      userRole: 'admin',
      userToEditRole: 'admin',
      permissionLevel: 'contentManager',
    },
    {
      user: '5f0cfea3395d762ca65405d1',
      userToEdit: '5f0cfea3395d762ca65405d1',
      userRole: 'admin',
      userToEditRole: 'admin',
      permissionLevel: 'author',
    },
    {
      user: '5f0cfea3395d762ca65405d1',
      userToEdit: '5f0cfea3395d762ca65405d2',
      userRole: 'admin',
      userToEditRole: 'contentManager',
      permissionLevel: 'admin',
    },
    {
      user: '5f0cfea3395d762ca65405d1',
      userToEdit: '5f0cfea3395d762ca65405d2',
      userRole: 'admin',
      userToEditRole: 'contentManager',
      permissionLevel: 'author',
    },
    {
      user: '5f0cfea3395d762ca65405d1',
      userToEdit: '5f0cfea3395d762ca65405d3',
      userRole: 'admin',
      userToEditRole: 'author',
      permissionLevel: 'admin',
    },
    {
      user: '5f0cfea3395d762ca65405d1',
      userToEdit: '5f0cfea3395d762ca65405d3',
      userRole: 'admin',
      userToEditRole: 'author',
      permissionLevel: 'contentManager',
    },
    {
      user: '5f0cfea3395d762ca65405d2',
      userToEdit: '5f0cfea3395d762ca65405d2',
      userRole: 'contentManager',
      userToEditRole: 'contentManager',
      permissionLevel: 'author',
    },
    {
      user: '5f0cfea3395d762ca65405d2',
      userToEdit: '5f0cfea3395d762ca65405d3',
      userRole: 'contentManager',
      userToEditRole: 'author',
      permissionLevel: 'contentManager',
    },
  ].forEach((item: any) => {
    it(`${item.userRole} user can change ${item.userToEditRole} user's role to ${item.permissionLevel}`, async () => {
      const token = getToken(item.user);
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `bearer ${token}`)
        .send({
          query: `mutation {
          me {
            updateUserPermissions(userId: "${item.userToEdit}", permissionLevel: "${item.permissionLevel}") {
              userRole
            }
          }
        }`,
        });
      expect(response.status).to.equal(200);
      expect(response.body.data.me.updateUserPermissions).to.eql({
        userRole: item.permissionLevel,
      });
    });
  });
});
