import { Model, Document } from 'mongoose';
import { FindOptions, IRepository } from '../database.interface';

export class MongoRepository<T> implements IRepository<T> {
  constructor(private readonly model: Model<T & Document>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean() as Promise<T | null>;
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return this.model.findOne(filter).lean() as Promise<T | null>;
  }

  async find(filter?: Partial<T>, options?: FindOptions): Promise<T[]> {
    let query = this.model.find(filter ?? {});
    if (options?.sort) query = query.sort(options.sort);
    if (options?.skip) query = query.skip(options.skip);
    if (options?.limit) query = query.limit(options.limit);
    return query.lean() as Promise<T[]>;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return (await doc.save()).toObject() as T;
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, { $set: data } as any, { new: true })
      .lean() as Promise<T | null>;
  }

  async updateOne(filter: Partial<T>, data: Partial<T>): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, { $set: data } as any, { new: true })
      .lean() as Promise<T | null>;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }

  async deleteOne(filter: Partial<T>): Promise<boolean> {
    const result = await this.model.deleteOne(filter);
    return result.deletedCount > 0;
  }

  async count(filter?: Partial<T>): Promise<number> {
    return this.model.countDocuments(filter ?? {});
  }

  async exists(filter: Partial<T>): Promise<boolean> {
    const result = await this.model.exists(filter);
    return result !== null;
  }
}
