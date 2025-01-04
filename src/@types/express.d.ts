declare namespace Express {
  export interface Request {
    user: {
      id: string;
      name: string;
      user_type: 'SUPERADMIN' | 'USERENTERPRISE' | 'USER';
    };
  }
}
