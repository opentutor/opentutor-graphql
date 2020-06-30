export interface Executable<T> {
  exec(): Promise<T>;
}

export interface HasFindOne<T> {
  findOne(args: any): Executable<T>;
}

export interface HasFindById<T> {
  findById(id: string): Executable<T>;
}

export type MongooseModel<T> = HasFindOne<T> & HasFindById<T>;
