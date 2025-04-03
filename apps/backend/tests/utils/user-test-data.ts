import { Role, RoleType } from "../../src/domain/entities/role.entity";
import { User } from "../../src/domain/entities/user.entity";
import { Permission } from "../../src/domain/entities/permission.entity";
import { CreateUserDto } from "../../src/services/user/dtos/create-user.dto";
import { UpdateUserDto } from "../../src/services/user/dtos/update-user.dto";

const baseDate = new Date();

// Define permissions
const permissions: Permission[] = [
  {
    id: "1",
    name: "*",
    description: "All permissions",
    roles: [],
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "2",
    name: "read:tickets",
    description: "Read tickets",
    roles: [],
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "3",
    name: "update:tickets",
    description: "Update tickets",
    roles: [],
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "4",
    name: "create:maintenance",
    description: "Create maintenance records",
    roles: [],
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "5",
    name: "update:maintenance",
    description: "Update maintenance records",
    roles: [],
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "6",
    name: "create:tickets",
    description: "Create tickets",
    roles: [],
    created_at: baseDate,
    updated_at: baseDate,
  },
];

// Define roles
export const testRoles: Record<string, Role> = {
  admin: {
    id: "1",
    name: RoleType.ADMIN,
    description: "System Administrator",
    permissions: [permissions[0]],
    created_at: baseDate,
    updated_at: baseDate,
  },
  technician: {
    id: "2",
    name: RoleType.TECHNICIAN,
    description: "Field Technician",
    permissions: [
      permissions[1],
      permissions[2],
      permissions[3],
      permissions[4],
    ],
    created_at: baseDate,
    updated_at: baseDate,
  },
  operator: {
    id: "3",
    name: RoleType.OPERATOR,
    description: "System Operator",
    permissions: [permissions[1], permissions[5], permissions[2]],
    created_at: baseDate,
    updated_at: baseDate,
  },
};

// Update permission roles
permissions.forEach((permission) => {
  permission.roles = Object.values(testRoles).filter((role) =>
    role.permissions.some((p) => p.id === permission.id)
  );
});

export const testUsers: Record<string, User> = {
  admin: {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    full_name: "System Admin",
    role_id: testRoles.admin.id,
    role: testRoles.admin,
    is_active: true,
    created_at: baseDate,
    updated_at: baseDate,
  },
  technician: {
    id: "2",
    username: "technician",
    email: "tech@example.com",
    password: "tech123",
    full_name: "Tech User",
    role_id: testRoles.technician.id,
    role: testRoles.technician,
    is_active: true,
    created_at: baseDate,
    updated_at: baseDate,
  },
  operator: {
    id: "3",
    username: "operator",
    email: "operator@example.com",
    password: "operator123",
    full_name: "Operator User",
    role_id: testRoles.operator.id,
    role: testRoles.operator,
    is_active: true,
    created_at: baseDate,
    updated_at: baseDate,
  },
};

export const createUserDtoSamples: Record<string, CreateUserDto> = {
  valid: {
    username: "newuser",
    email: "new@example.com",
    password: "password123",
    role_id: testRoles.technician.id,
    full_name: "New User",
    is_active: true,
  },
  minimal: {
    username: "minimal",
    email: "minimal@example.com",
    password: "minimal123",
    role_id: testRoles.technician.id,
  },
  invalidEmail: {
    username: "invalid",
    email: "not-an-email",
    password: "invalid123",
    role_id: testRoles.technician.id,
  },
  shortPassword: {
    username: "shortpass",
    email: "short@example.com",
    password: "short",
    role_id: testRoles.technician.id,
  },
};

export const updateUserDtoSamples: Record<string, UpdateUserDto> = {
  fullUpdate: {
    email: "updated@example.com",
    full_name: "Updated Name",
    is_active: true,
  },
  emailOnly: {
    email: "newemail@example.com",
  },
  deactivate: {
    is_active: false,
  },
  invalidEmail: {
    email: "not-an-email",
  },
};

export const mockUserResponses = {
  listResponse: {
    users: [testUsers.admin, testUsers.technician, testUsers.operator],
    total: 3,
  },
  emptyListResponse: {
    users: [],
    total: 0,
  },
  paginatedResponse: {
    users: [testUsers.technician],
    total: 1,
  },
};

export const mockUserFilters = {
  default: {
    page: 1,
    limit: 10,
  },
  withRole: {
    page: 1,
    limit: 10,
    role: RoleType.TECHNICIAN,
  },
  withSearch: {
    page: 1,
    limit: 10,
    search: "tech",
  },
  withStatus: {
    page: 1,
    limit: 10,
    isActive: true,
  },
  complete: {
    page: 1,
    limit: 10,
    role: RoleType.TECHNICIAN,
    isActive: true,
    search: "tech",
  },
};

// Helper function to create a fresh copy of test data with new timestamps
export const createTestData = () => {
  const now = new Date();
  const newData = JSON.parse(
    JSON.stringify({ permissions, roles: testRoles, users: testUsers })
  );

  const updateDates = (obj: any) => {
    if (obj.created_at) obj.created_at = now;
    if (obj.updated_at) obj.updated_at = now;
    return obj;
  };

  return {
    permissions: newData.permissions.map(updateDates),
    roles: Object.fromEntries(
      Object.entries(newData.roles).map(([key, role]) => [
        key,
        updateDates(role),
      ])
    ),
    users: Object.fromEntries(
      Object.entries(newData.users).map(([key, user]) => [
        key,
        updateDates(user),
      ])
    ),
  };
};

export { permissions as testPermissions };
