import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../../src/controllers/auth.controller';
import { AuthService } from '../../../src/services/auth/adapters/input/auth.service';
import { LoginDto, LoginResponseDto, UserResponseDto } from '../../../src/services/auth/dtos/login.dto';
import { UnauthorizedException } from '../../../src/common/exceptions/unauthorized.exception';
import { User } from '../../../src/domain/entities/user.entity';
import { Role, RoleType } from '../../../src/domain/entities/role.entity';
import { Permission, PermissionEnum } from '../../../src/domain/entities/permission.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  const mockPermissions: Permission[] = [
    {
      id: 'perm1',
      name: PermissionEnum.READ_TICKET,
      description: 'Can read tickets',
      created_at: new Date(),
      updated_at: new Date(),
      roles: []
    },
    {
      id: 'perm2',
      name: PermissionEnum.UPDATE_TICKET,
      description: 'Can update tickets',
      created_at: new Date(),
      updated_at: new Date(),
      roles: []
    }
  ];

  const mockRole: Role = {
    id: 'role1',
    name: RoleType.TECHNICIAN,
    description: 'Technician Role',
    permissions: mockPermissions,
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockUser: User = {
    id: 'user1',
    username: 'tech1',
    email: 'tech@example.com',
    password: 'hashed_password',
    full_name: 'Tech User',
    is_active: true,
    role_id: 'role1',
    role: mockRole,
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockUserResponse: UserResponseDto = {
    id: mockUser.id,
    username: mockUser.username,
    email: mockUser.email,
    full_name: mockUser.full_name,
    role: mockUser.role.name,
    is_active: mockUser.is_active,
    permissions: mockPermissions.map(p => p.name)
  };

  const mockLoginResponse: LoginResponseDto = {
    access_token: 'mock.access.token',
    refresh_token: 'mock.refresh.token',
    user: mockUserResponse
  };

  beforeEach(() => {
    authService = {
      login: jest.fn(),
      validateToken: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    controller = new AuthController(authService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    next = jest.fn();
    req = {};
  });

  describe('login', () => {
    const mockLoginDto: LoginDto = {
      username: 'tech1',
      password: 'password123'
    };

    it('should login successfully', async () => {
      req.body = mockLoginDto;

      authService.login.mockResolvedValue(mockLoginResponse);

      await controller.login(req as Request, res as Response, next);

      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(res.json).toHaveBeenCalledWith(mockLoginResponse);
    });

    it('should handle invalid credentials', async () => {
      req.body = mockLoginDto;

      const error = new UnauthorizedException('Invalid credentials');
      authService.login.mockRejectedValue(error);

      await controller.login(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      req.headers = {
        authorization: 'Bearer valid.token.here'
      };

      authService.validateToken.mockResolvedValue(mockUserResponse);

      await controller.validateToken(req as Request, res as Response, next);

      expect(authService.validateToken).toHaveBeenCalledWith('valid.token.here');
      expect(res.json).toHaveBeenCalledWith(mockUserResponse);
    });

    it('should handle missing token', async () => {
      req.headers = {};

      await controller.validateToken(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
      expect(authService.validateToken).not.toHaveBeenCalled();
    });

    it('should handle invalid token format', async () => {
      req.headers = {
        authorization: 'InvalidFormat token.here'
      };

      await controller.validateToken(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
      expect(authService.validateToken).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      req.body = {
        refresh_token: 'valid.refresh.token'
      };

      authService.refreshToken.mockResolvedValue(mockLoginResponse);

      await controller.refreshToken(req as Request, res as Response, next);

      expect(authService.refreshToken).toHaveBeenCalledWith('valid.refresh.token');
      expect(res.json).toHaveBeenCalledWith(mockLoginResponse);
    });

    it('should handle missing refresh token', async () => {
      req.body = {};

      await controller.refreshToken(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should handle invalid refresh token', async () => {
      req.body = {
        refresh_token: 'invalid.token'
      };

      const error = new UnauthorizedException('Invalid refresh token');
      authService.refreshToken.mockRejectedValue(error);

      await controller.refreshToken(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      req.headers = {
        authorization: 'Bearer valid.token.here'
      };

      await controller.logout(req as Request, res as Response, next);

      expect(authService.logout).toHaveBeenCalledWith('valid.token.here');
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });

    it('should handle missing token', async () => {
      req.headers = {};

      await controller.logout(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should handle logout errors', async () => {
      req.headers = {
        authorization: 'Bearer valid.token.here'
      };

      const error = new Error('Logout failed');
      authService.logout.mockRejectedValue(error);

      await controller.logout(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('token extraction', () => {
    it('should extract token from valid authorization header', async () => {
      req.headers = {
        authorization: 'Bearer valid.token.here'
      };

      authService.validateToken.mockResolvedValue(mockUserResponse);

      await controller.validateToken(req as Request, res as Response, next);

      expect(authService.validateToken).toHaveBeenCalledWith('valid.token.here');
    });

    it('should handle various invalid authorization header formats', async () => {
      const invalidHeaders = [
        'token.here',
        'Bearer',
        'InvalidSchema token.here',
        ''
      ];

      for (const header of invalidHeaders) {
        req.headers = { authorization: header };
        await controller.validateToken(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
        expect(authService.validateToken).not.toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });
  });
});