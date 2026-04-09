export interface FindOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  find(filter?: Partial<T>, options?: FindOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  updateById(id: string, data: Partial<T>): Promise<T | null>;
  updateOne(filter: Partial<T>, data: Partial<T>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
  deleteOne(filter: Partial<T>): Promise<boolean>;
  count(filter?: Partial<T>): Promise<number>;
  exists(filter: Partial<T>): Promise<boolean>;
}

export const DB_DRIVER = 'DB_DRIVER';