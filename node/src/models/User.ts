/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose, { Schema, Document, Model } from 'mongoose';
import { HasPaginate, pluginPagination } from './Paginatation';

export const UserRole = {
  AUTHOR: 'author',
  CONTENT_MANAGER: 'contentManager',
  ADMIN: 'admin',
};

export interface User extends Document {
  googleId: string;
  email: string;
  name: string;
  password: string;
  userRole: string;
  lastLoginAt: Date;
}

export interface UserModel extends Model<User>, HasPaginate<User> {}

export const UserSchema = new Schema<User, UserModel>(
  {
    googleId: { type: String },
    email: { type: String },
    name: { type: String },
    password: { type: String },
    userRole: {
      type: String,
      enum: [UserRole.AUTHOR, UserRole.CONTENT_MANAGER, UserRole.ADMIN],
      default: UserRole.AUTHOR,
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true, collation: { locale: 'en', strength: 2 } }
);

UserSchema.index({ name: -1, _id: -1 });
UserSchema.index({ email: -1, _id: -1 });
UserSchema.index({ userRole: -1, _id: -1 });
pluginPagination(UserSchema);

export default mongoose.model<User, UserModel>('User', UserSchema);
