/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import path from 'path';
import jwt from 'jsonwebtoken';

export function fixturePath(p: string): string {
  return path.join(__dirname, 'fixtures', p);
}

// duration of access token in seconds before it expires
export function accessTokenDuration(): number {
  return process.env.ACCESS_TOKEN_LENGTH
    ? parseInt(process.env.ACCESS_TOKEN_LENGTH)
    : 60 * 60 * 24 * 90;
}

export function getToken(userId: string, expiresIn?: number): string {
  if (!expiresIn) {
    expiresIn = accessTokenDuration();
  }
  const expirationDate = new Date(Date.now() + expiresIn * 1000);
  const accessToken = jwt.sign(
    { id: userId, expirationDate },
    process.env.JWT_SECRET,
    { expiresIn: expirationDate.getTime() - new Date().getTime() }
  );
  return accessToken;
}
