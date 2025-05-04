import { AuthenticatedUserService } from '@/services/AuthenticateUserService';
import { LogoutAllDevicesUserService } from '@/services/LogoutAllDevicesUserService';
import { ValidRefreshTokenUserService } from '@/services/ValidRefreshTokenUserService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class SessionsController {
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const { user, token, refreshToken, expiresRefreshToken } =
        await AuthenticatedUserService({
          email,
          password,
        });

      res.cookie('refreshToken', `${refreshToken}`, {
        expires: expiresRefreshToken,
        httpOnly: true,
      });

      return res.status(200).json({ user, token, refresh_token: refreshToken });
    } catch (err: any) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message,
        });
      }
      return res.status(400).json({ error: err.message });
    }
  }

  async refresh_token(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken: tokenValue } = req.cookies;

      const { user, token, refreshToken, expiresRefreshToken } =
        await ValidRefreshTokenUserService({
          tokenValue,
        });

      res.cookie('refreshToken', `${refreshToken}`, {
        expires: expiresRefreshToken,
        httpOnly: true,
      });

      return res.status(200).json({ user, token, refreshToken });
    } catch (err: any) {
      console.log('ERROR', err);
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message,
        });
      }
      return res.status(400).json({ error: err.message });
    }
  }

  async logout_all(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken: tokenValue } = req.cookies;

      await LogoutAllDevicesUserService({
        tokenValue,
      });

      res.clearCookie('refreshToken');

      return res.status(200).json({ message: 'logout all devices success' });
    } catch (err: any) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message,
        });
      }
      return res.status(400).json({ error: err.message });
    }
  }
}
