import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import path from 'path';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();

  const balance = await transactionsRepository.getBalance();

  const rel = {
    transactions,
    balance,
  };

  return response.json(rel);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  delete transaction.created_at;
  delete transaction.updated_at;
  delete transaction.category.created_at;
  delete transaction.category.updated_at;

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();

  const transaction = await deleteTransactionService.execute({ id });

  return response.send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importFile = path.join(uploadConfig.directory, request.file.filename);

    const importTransactionsService = new ImportTransactionsService();

    const transactions = await importTransactionsService.execute({
      importFile,
    });

    return response.json(transactions);
  },
);

export default transactionsRouter;
