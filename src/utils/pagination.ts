import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

export async function paginateAndSearch<T extends ObjectLiteral>(
  repo: Repository<T>,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    searchableFields?: string[];
  },
): Promise<[T[], number]> {
  const { page = 1, limit = 10, search, searchableFields = [] } = options;
  const qb: SelectQueryBuilder<T> = repo.createQueryBuilder('entity');

  if (search && searchableFields.length > 0) {
    const searchConditions = searchableFields
      .map((field) => `LOWER(entity.${field}) LIKE LOWER(:search)`)
      .join(' OR ');
    qb.andWhere(`(${searchConditions})`, { search: `%${search}%` });
  }

  qb.skip((page - 1) * limit).take(limit);

  return qb.getManyAndCount();
}
