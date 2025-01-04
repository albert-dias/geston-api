import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import authConfig from '../config/auth';
import { AppError } from '../utils/AppError';

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
  name: string;
  document: string;
  user_type: 'SUPERADMIN' | 'USERENTERPRISE' | 'USER';
}

export default function ensureAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token ausente', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret);

    const { sub, name, user_type } = decoded as ITokenPayload;

    req.user = {
      id: sub,
      name,
      user_type,
    };

    return next();
  } catch (err) {
    throw new AppError('token.invalid', 401);
  }
}
