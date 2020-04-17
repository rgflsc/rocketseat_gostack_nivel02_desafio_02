import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

interface Category {
  id: string;
}

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> { }

export default CategoriesRepository;
