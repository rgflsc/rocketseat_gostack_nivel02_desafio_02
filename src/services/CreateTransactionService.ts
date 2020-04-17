import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    const testOutcomeAllowed =
      type === 'income' || (type === 'outcome' && total > value);

    if (!testOutcomeAllowed) {
      throw new AppError('Insufficient funds', 400);
    }

    const categoryRepository = getRepository(Category);
    let existsCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!existsCategory) {
      existsCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(existsCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: existsCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
