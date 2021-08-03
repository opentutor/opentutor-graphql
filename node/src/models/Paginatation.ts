/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { ExtractMethods, Model, Schema } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongoPaging = require('mongo-cursor-pagination');
mongoPaging.config.COLLATION = { locale: 'en', strength: 2 };

export interface PaginatedResolveResult<T> {
  results: T[];
  previous: string;
  next: string;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginateCallback<T> {
  (err: Error, doc: T): void;
}

export interface PaginateOptions {
  limit?: number;
}

export type PaginateQuery<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k in keyof T]: any;
};

export interface HasPaginate<T> {
  paginate(
    query?: PaginateQuery<T>,
    options?: PaginateOptions
  ): Promise<PaginatedResolveResult<T>>;
}

// DocType = Document, M extends Model<DocType, any, any> = Model<any, any, any>, SchemaDefinitionType = undefined, TInstanceMethods = ExtractMethods<M>
export function pluginPagination<
  DocType = Document,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  M extends Model<DocType, any, any> = Model<any, any, any>,
  SchemaDefinitionType = undefined,
  TInstanceMethods = ExtractMethods<M>
>(s: Schema<DocType, M, SchemaDefinitionType, TInstanceMethods>): void {
  s.plugin(mongoPaging.mongoosePlugin);
}
