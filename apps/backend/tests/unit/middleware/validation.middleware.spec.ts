import { Request, Response } from 'express';
import {
  validatePermission,
  validateQueryParams,
  createDateRule,
  createUUIDRule,
  createBooleanRule,
  createStringRule,
  createIntRule,
  createEnumRule
} from '../../../src/middleware/validation.middleware';
import { Role } from '../../../src/domain/entities/role.entity';
import { Permission } from '../../../src/domain/entities/permission.entity';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      query: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('validatePermission', () => {
    const createMockPermission = (name: string): Permission => ({
      id: '1',
      name,
      description: `Test permission: ${name}`,
      created_at: new Date(),
      updated_at: new Date()
    });

    it('should allow access when user has required permission', async () => {
      const mockRole: Partial<Role> = {
        permissions: [createMockPermission('test_permission')]
      };

      mockRequest = {
        user: { role: mockRole }
      } as any;

      await validatePermission('test_permission')(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user lacks required permission', async () => {
      const mockRole: Partial<Role> = {
        permissions: [createMockPermission('other_permission')]
      };

      mockRequest = {
        user: { role: mockRole }
      } as any;

      await validatePermission('test_permission')(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Se requiere el permiso: test_permission'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('validateQueryParams', () => {
    describe('Date Validation', () => {
      it('should validate ISO8601 dates', async () => {
        mockRequest.query = {
          date: '2025-04-12T12:00:00Z'
        };

        const schema = {
          date: createDateRule('Fecha inválida')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
      });

      it('should reject invalid dates', async () => {
        mockRequest.query = {
          date: 'invalid-date'
        };

        const schema = {
          date: createDateRule('Fecha inválida')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          errors: [{ param: 'date', msg: 'Fecha inválida' }]
        });
      });
    });

    describe('UUID Validation', () => {
      it('should validate UUIDs', async () => {
        mockRequest.query = {
          id: '123e4567-e89b-12d3-a456-426614174000'
        };

        const schema = {
          id: createUUIDRule('UUID inválido')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
      });

      it('should reject invalid UUIDs', async () => {
        mockRequest.query = {
          id: 'invalid-uuid'
        };

        const schema = {
          id: createUUIDRule('UUID inválido')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          errors: [{ param: 'id', msg: 'UUID inválido' }]
        });
      });
    });

    describe('Boolean Validation', () => {
      it('should validate boolean values', async () => {
        mockRequest.query = {
          flag: 'true'
        };

        const schema = {
          flag: createBooleanRule('Booleano inválido')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
      });

      it('should reject invalid boolean values', async () => {
        mockRequest.query = {
          flag: 'not-a-boolean'
        };

        const schema = {
          flag: createBooleanRule('Booleano inválido')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          errors: [{ param: 'flag', msg: 'Booleano inválido' }]
        });
      });
    });

    describe('Enum Validation', () => {
      it('should validate enum values', async () => {
        enum TestEnum {
          ONE = 'ONE',
          TWO = 'TWO'
        }

        mockRequest.query = {
          enum: 'ONE'
        };

        const schema = {
          enum: createEnumRule(Object.values(TestEnum), 'Enum inválido')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
      });

      it('should reject invalid enum values', async () => {
        enum TestEnum {
          ONE = 'ONE',
          TWO = 'TWO'
        }

        mockRequest.query = {
          enum: 'THREE'
        };

        const schema = {
          enum: createEnumRule(Object.values(TestEnum), 'Enum inválido')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          errors: [{ param: 'enum', msg: 'Enum inválido' }]
        });
      });
    });

    describe('Integer Validation', () => {
      it('should validate integers within range', async () => {
        mockRequest.query = {
          number: '5'
        };

        const schema = {
          number: createIntRule(1, 10, 'Número inválido')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
      });

      it('should reject integers outside range', async () => {
        mockRequest.query = {
          number: '15'
        };

        const schema = {
          number: createIntRule(1, 10, 'Número fuera de rango')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          errors: [{ param: 'number', msg: 'Número fuera de rango' }]
        });
      });
    });

    describe('String Validation', () => {
      it('should validate strings', async () => {
        mockRequest.query = {
          text: 'valid text'
        };

        const schema = {
          text: createStringRule('Texto inválido')
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
      });
    });

    describe('Optional Parameters', () => {
      it('should allow missing optional parameters', async () => {
        mockRequest.query = {};

        const schema = {
          optional: createStringRule('Texto inválido', true)
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
      });

      it('should require non-optional parameters', async () => {
        mockRequest.query = {};

        const schema = {
          required: createStringRule('Campo requerido', false)
        };

        await validateQueryParams(schema)(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          errors: [{ param: 'required', msg: 'Campo requerido' }]
        });
      });
    });
  });
});
