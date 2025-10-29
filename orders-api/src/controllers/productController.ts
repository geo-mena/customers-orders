import { Request, Response, NextFunction } from 'express';
import { ProductModel } from '../models/product.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateProductData, UpdateProductData } from '../types/index.js';

export class ProductController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateProductData = req.body;

      const existingProduct = await ProductModel.findBySku(data.sku);
      if (existingProduct) {
        throw new AppError(409, 'SKU already exists');
      }

      const product = await ProductModel.create(data);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      const product = await ProductModel.findById(id);
      if (!product) {
        throw new AppError(404, 'Product not found');
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, cursor, limit } = req.query;

      const products = await ProductModel.list({
        search: search as string,
        cursor: cursor ? parseInt(cursor as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: products,
        meta: {
          nextCursor: products.length > 0 ? products[products.length - 1].id : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data: UpdateProductData = req.body;

      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        throw new AppError(404, 'Product not found');
      }

      const product = await ProductModel.update(id, data);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
}
