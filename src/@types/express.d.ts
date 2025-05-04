declare namespace Express {
  export interface Request {
    user: {
      id: string;
      name: string;
      email: string;
      user_type: 'SUPERADMIN' | 'ADMIN' | 'USER';
    };
  }
}
