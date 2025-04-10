export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ErrorDetails {
  field?: string;
  message?: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: IUser;
  };
  error?: {
    code: string;
    message: string;
    details?: ErrorDetails;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
}
