import { AuthService } from '../../../../src/services/auth/adapters/input/auth.service';
import { UserService } from '../../../../src/services/user/adapters/input/user.service';
import { JwtService } from '../../../../src/services/auth/adapters/input/jwt.service';
import { TokenBlacklistService } from '../../../../src/services/auth/adapters/input/token-blacklist.service';
import { UnauthorizedException } from '../../../../src/common/exceptions/unauthorized.exception';
import { User } from '../../../../src/domain/entities/user.entity';
import { Role } from '../../../../src/domain/entities/role.entity';
import { Permission } from '../../../../src/domain/entities/permission.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let tokenBlacklistService: jest.Mocked<TokenBlacklistService>;

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    password_hash: 'hashedpassword',
    first_name: 'Test',
    last_name: 'User',
    is_active: true,
    role: {
      id: '456',
      name: 'admin',
      description: 'Administrator',
      permissions: [
        {
          id: '789',
          name: 'create:user',
          description: 'Can create users',
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      created_at: new Date(),
      updated_at: new Date()
    },
    created_at: new Date(),
    updated_at: new Date()
  };

  beforeEach(() => {
    userService = {
      findByEmail: jest.fn(),
      validateCredentials: jest.fn(),
      findById: jest.fn()
    } as any;

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      createRefreshToken: jest.fn()
    } as any;

    tokenBlacklistService = {
      addToBlacklist: jest.fn(),
      isBlacklisted: jest.fn()
    } as any;

    authService = new AuthService(userService, jwtService, tokenBlacklistService);
  });

  describe('login', () => {
    it('debería autenticar usuario exitosamente y retornar tokens', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validateCredentials.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('access_token');
      jwtService.createRefreshToken.mockReturnValue('refresh_token');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password'
      });

      expect(result).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          role: mockUser.role.name,
          permissions: ['create:user'],
          is_active: mockUser.is_active
        }
      });
    });

    it('debería lanzar UnauthorizedException si las credenciales son inválidas', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validateCredentials.mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('debería validar token exitosamente', async () => {
      tokenBlacklistService.isBlacklisted.mockResolvedValue(false);
      jwtService.verify.mockReturnValue({ sub: mockUser.id, role: mockUser.role.name });
      userService.findById.mockResolvedValue(mockUser);

      const result = await authService.validateToken('valid_token');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        role: mockUser.role.name,
        permissions: ['create:user'],
        is_active: mockUser.is_active
      });
    });

    it('debería lanzar UnauthorizedException si el token está en blacklist', async () => {
      tokenBlacklistService.isBlacklisted.mockResolvedValue(true);

      await expect(authService.validateToken('blacklisted_token')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('logout', () => {
    it('debería invalidar token exitosamente', async () => {
      const mockPayload = {
        sub: '123',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      jwtService.verify.mockReturnValue(mockPayload);
      tokenBlacklistService.addToBlacklist.mockResolvedValue(undefined);

      await authService.logout('valid_token');

      expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalled();
    });
  });
});
