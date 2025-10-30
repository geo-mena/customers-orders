import { Response, NextFunction } from 'express';
import { authenticateJWT, authenticateService } from '../middleware/auth';
import { AuthRequest } from '../types';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');
jest.mock('../config/env', () => ({
  config: {
    jwt: {
      secret: 'test-jwt-secret',
    },
    serviceToken: 'test-service-token',
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateJWT', () => {
    it('should authenticate valid JWT token', () => {
      const mockDecoded = { userId: 1 };
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      authenticateJWT(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-jwt-secret');
      expect(mockRequest.userId).toEqual(1);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 401 if no token provided', () => {
      mockRequest.headers = {};

      authenticateJWT(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing or invalid authorization header',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticateJWT(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat',
      };

      authenticateJWT(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('authenticateService', () => {
    it('should authenticate valid service token', () => {
      mockRequest.headers = {
        authorization: 'Bearer test-service-token',
      };

      authenticateService(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.isServiceAuth).toBe(true);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if no service token provided', () => {
      mockRequest.headers = {};

      authenticateService(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing or invalid authorization header',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid service token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      authenticateService(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid service token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
