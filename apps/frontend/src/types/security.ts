export interface SecuritySettings {
  twoFactorEnabled: boolean;
  backupCodesRemaining: number;
  lastPasswordChange: string;
  activeDevices: number;
  activeSessions: number;
  lastSecurityAudit: string;
  securityScore: number;
}

export type TwoFactorMethod = "app" | "sms" | "email";

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  recoveryCodes: string[];
}

export interface TwoFactorVerification {
  method: TwoFactorMethod;
  code: string;
}

export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location?: string;
  lastActive: string;
  current: boolean;
}

export interface SecurityAuditEvent {
  id: string;
  type: SecurityEventType;
  description: string;
  ip: string;
  location?: string;
  device: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, unknown>;
}

export type SecurityEventType =
  | "login"
  | "logout"
  | "password_change"
  | "2fa_enable"
  | "2fa_disable"
  | "2fa_verify"
  | "backup_codes_generate"
  | "session_revoke"
  | "api_key_create"
  | "api_key_revoke"
  | "security_settings_update";

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  expiresAt?: string;
  lastUsed?: string;
  createdAt: string;
  scopes: ApiScope[];
}

export type ApiScope =
  | "read:profile"
  | "write:profile"
  | "read:tickets"
  | "write:tickets"
  | "read:atms"
  | "write:atms"
  | "read:maintenance"
  | "write:maintenance";

export interface CreateApiKeyRequest {
  name: string;
  expiresAt?: string;
  scopes: ApiScope[];
}

export interface ApiKeyResponse {
  key: ApiKey;
  token: string; // El token completo, solo se muestra una vez
}

export interface SecurityError {
  code: SecurityErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type SecurityErrorCode =
  | "INVALID_2FA_CODE"
  | "2FA_ALREADY_ENABLED"
  | "2FA_NOT_ENABLED"
  | "INVALID_BACKUP_CODE"
  | "SESSION_NOT_FOUND"
  | "CANNOT_REVOKE_CURRENT_SESSION"
  | "INVALID_API_KEY"
  | "API_KEY_EXPIRED"
  | "INSUFFICIENT_SCOPE"
  | "RATE_LIMIT_EXCEEDED";
