import { Request, Response, NextFunction } from 'express';
import { CustomerModel } from '../models/customer.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateCustomerData, UpdateCustomerData } from '../types/index.js';

export class CustomerController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateCustomerData = req.body;

      const existingCustomer = await CustomerModel.findByEmail(data.email);
      if (existingCustomer) {
        throw new AppError(409, 'Email already exists');
      }

      const customer = await CustomerModel.create(data);

      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      const customer = await CustomerModel.findById(id);
      if (!customer) {
        throw new AppError(404, 'Customer not found');
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, cursor, limit } = req.query;

      const customers = await CustomerModel.list({
        search: search as string,
        cursor: cursor ? parseInt(cursor as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: customers,
        meta: {
          nextCursor: customers.length > 0 ? customers[customers.length - 1].id : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data: UpdateCustomerData = req.body;

      const existingCustomer = await CustomerModel.findById(id);
      if (!existingCustomer) {
        throw new AppError(404, 'Customer not found');
      }

      if (data.email && data.email !== existingCustomer.email) {
        const emailTaken = await CustomerModel.findByEmail(data.email);
        if (emailTaken) {
          throw new AppError(409, 'Email already exists');
        }
      }

      const customer = await CustomerModel.update(id, data);

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      const deleted = await CustomerModel.delete(id);
      if (!deleted) {
        throw new AppError(404, 'Customer not found');
      }

      res.json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
