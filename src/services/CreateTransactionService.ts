import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRespository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(
        `You don't have a sufficient funds to make this transaction`,
      );
    }
    let findCategory = await categoryRespository.findOne({
      where: { title: category },
    });

    if (!findCategory) {
      findCategory = categoryRespository.create({
        title: category,
      });

      await categoryRespository.save(findCategory);
    }

    const transaciton = transactionRepository.create({
      title,
      value,
      type,
      category: findCategory,
    });

    await transactionRepository.save(transaciton);

    delete transaciton.created_at;
    delete transaciton.updated_at;
    delete transaciton.category_id;
    delete transaciton.category.id;

    return transaciton;
  }
}

export default CreateTransactionService;
