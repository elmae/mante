# Decorators

This directory contains common decorators used throughout the application for
authentication, authorization, and request/response handling.

## Authentication Decorators

### @Public()

Marks a route as public, bypassing authentication checks.

```typescript
@Public()
@Get('health')
healthCheck() {
  return 'OK';
}
```

### @CurrentUser()

Extracts the authenticated user from the request.

```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### @UserProperty(property: string)

Extracts a specific property from the authenticated user.

```typescript
@Get('role')
getUserRole(@UserProperty('role') role: string) {
  return role;
}
```

## Authorization Decorators

### @Roles(...roles: Role[])

Restricts route access to users with specified roles.

```typescript
@Roles(Role.ADMIN)
@Get('users')
findAll() {
  return this.usersService.findAll();
}
```

### @ResourcePermission(resource: string, action: Action)

Defines required permissions for a resource.

```typescript
@ResourcePermission('tickets', 'create')
@Post()
create(@Body() createTicketDto: CreateTicketDto) {
  return this.ticketsService.create(createTicketDto);
}
```

## Composition Helpers

### @PublicEndpoint()

Marks an endpoint as public.

```typescript
@PublicEndpoint()
@Get('public-data')
getPublicData() {
  return this.dataService.getPublicData();
}
```

### @AdminOnly()

Restricts access to administrators only.

```typescript
@AdminOnly()
@Delete('users/:id')
remove(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

### @TechnicianOnly()

Restricts access to technicians only.

```typescript
@TechnicianOnly()
@Get('assignments')
getAssignments() {
  return this.assignmentsService.findMyAssignments();
}
```

### @Protected(resource: string, action: Action)

Combines resource and action permission checks.

```typescript
@Protected('reports', 'read')
@Get('reports')
getReports() {
  return this.reportsService.findAll();
}
```

### Resource Access Helpers

- `@ReadOnly(resource: string)` - Grants read-only access
- `@WriteOnly(resource: string)` - Grants create-only access
- `@FullAccess(resource: string)` - Grants full manage access

```typescript
@ReadOnly('analytics')
@Get('stats')
getStats() {
  return this.analyticsService.getStats();
}
```

## Metadata Constants

Access decorator metadata keys through `DECORATOR_METADATA`:

- `ROLES` - Role-based access control key
- `PUBLIC` - Public route marker key
- `USER` - Current user key
- `RESOURCE` - Resource permission key

## Best Practices

1. Always place authentication decorators before route decorators
2. Combine decorators when needed using composition helpers
3. Use the most specific decorator for your use case
4. Consider using resource-based authorization for fine-grained control
5. Document custom decorator compositions for reusability
