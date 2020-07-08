import { PaginatedResolveResult } from './connection';

export interface Executable<T> {
  exec(): Promise<T>;
}

export interface HasFindOne<T> {
  findOne(args: any): Executable<T>;
}

export interface HasFindById<T> {
  findById(id: string): Executable<T>;
}

export interface HasPaginate<T> {
  paginate(
    query?: any,
    options?: any,
    callback?: any
  ): Promise<PaginatedResolveResult>;
}

export type MongooseModel<T> = HasFindOne<T> & HasFindById<T>;
export type PaginatableMongooseModel<T> = HasFindOne<T> &
  HasFindById<T> &
  HasPaginate<T>;
