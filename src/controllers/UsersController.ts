import { CreateEnterpriseService } from '@/services/user/CreateEnterpriseService';
import { CreateUserService } from '@/services/user/CreateUserService';
import { ListUserEnterprisesService } from '@/services/user/ListUserEnterprisesService';
import { CreateBranchService } from '@/services/user/CreateBranchService';
import { UpdateEnterpriseStatusService } from '@/services/user/UpdateEnterpriseStatusService';
import { UpdateUserEnterpriseService } from '@/services/user/UpdateUserEnterpriseService';
import { UpdateUserService } from '@/services/user/UpdateUserService';
import { UpdateUserPasswordService } from '@/services/user/UpdateUserPasswordService';
import { CancelUserAccountService } from '@/services/user/CancelUserAccountService';
import { UpdateEnterpriseService } from '@/services/user/UpdateEnterpriseService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class UsersController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        document,
        phone,
        name,
        email,
        password,
        company_name,
        fantasy_name,
        document_enterprise,
        status,
        address,
        number,
        city,
        state,
        lat,
        long,
        zip_code,
        region,
      } = req.body;

      const result = await CreateEnterpriseService({
        zip_code,
        region,
        document,
        phone,
        name,
        email,
        password,
        company_name,
        fantasy_name,
        document_enterprise,
        status,
        address,
        number,
        city,
        state,
        lat,
        long,
      });
      return res.status(201).json(result);
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message,
        });
      }

      // Tratar erros do Prisma
      if (err.code === 'P2002') {
        // Unique constraint violation
        const target = err.meta?.target || [];
        let field = 'campo';
        if (target.includes('email')) {
          field = 'E-mail já está em uso';
        } else if (target.includes('document')) {
          field = 'CPF já está em uso';
        } else if (target.includes('phone')) {
          field = 'Telefone já está em uso';
        } else {
          field = 'Já existe um registro com estes dados';
        }
        return res.status(409).json({
          status: 'error',
          message: field,
        });
      }

      // Outros erros do Prisma
      if (err.code && err.code.startsWith('P')) {
        console.error('Erro do Prisma:', err.code, err.meta);
        return res.status(400).json({
          status: 'error',
          message: 'Erro ao processar os dados. Verifique as informações e tente novamente.',
        });
      }

      // Erros genéricos
      return res.status(400).json({
        status: 'error',
        message: err.message || 'Erro ao criar conta. Tente novamente.',
      });
    }
  }

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { document, phone, name, email, password } = req.body;
      const result = await CreateUserService({
        document,
        phone,
        name,
        email,
        password,
      });
      return res.status(201).json(result);
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
  // async updatePass(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const { id, old_password, new_password } = req.body;
  //     const result = await UpdatePassUserService({
  //       id,
  //       old_password,
  //       new_password,
  //     });
  //     return res.status(200).json(result);
  //   } catch (err: any) {
  //     if (err instanceof AppError) {
  //       return res.status(err.statusCode).json({
  //         status: 'error',
  //         message: err.message,
  //       });
  //     }
  //     return res.status(400).json({ error: err.message });
  //   }
  // }
  // async list(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const result = await ListUserService();
  //     return res.status(200).json(result);
  //   } catch (err: any) {
  //     if (err instanceof AppError) {
  //       return res.status(err.statusCode).json({
  //         status: 'error',
  //         message: err.message,
  //       });
  //     }
  //     return res.status(400).json({ error: err.message });
  //   }
  // }
  // async show(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const { id } = req.params;
  //     const result = await ShowUserService({
  //       id,
  //     });
  //     return res.status(200).json(result);
  //   } catch (err: any) {
  //     if (err instanceof AppError) {
  //       return res.status(err.statusCode).json({
  //         status: 'error',
  //         message: err.message,
  //       });
  //     }
  //     return res.status(400).json({ error: err.message });
  //   }
  // }

  async listEnterprises(req: Request, res: Response): Promise<Response> {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
      }

      const result = await ListUserEnterprisesService({
        user_id,
      });
      return res.status(200).json(result);
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

  async createBranch(req: Request, res: Response): Promise<Response> {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
      }

      const {
        fantasy_name,
        company_name,
        document_enterprise,
        zip_code,
        region,
        address,
        number,
        complement,
        city,
        state,
        lat,
        long,
      } = req.body;

      const result = await CreateBranchService({
        user_id,
        fantasy_name,
        company_name,
        document_enterprise,
        zip_code,
        region,
        address,
        number,
        complement,
        city,
        state,
        lat: lat || 0,
        long: long || 0,
      });

      return res.status(201).json(result);
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

  async deactivateBranch(req: Request, res: Response): Promise<Response> {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
      }

      const { enterprise_id } = req.params;

      if (!enterprise_id) {
        return res.status(400).json({
          status: 'error',
          message: 'ID da empresa não fornecido',
        });
      }

      const result = await UpdateEnterpriseStatusService({
        user_id,
        enterprise_id,
        status: 'INACTIVE',
      });

      return res.status(200).json(result);
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

  async selectBranch(req: Request, res: Response): Promise<Response> {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
      }

      const { enterprise_id } = req.body;

      if (!enterprise_id) {
        return res.status(400).json({
          status: 'error',
          message: 'ID da empresa não fornecido',
        });
      }

      const result = await UpdateUserEnterpriseService({
        user_id,
        enterprise_id,
      });

      return res.status(200).json(result);
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

  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
      }

      const { name, email, document, phone } = req.body;

      const result = await UpdateUserService({
        user_id,
        name,
        email,
        document,
        phone,
      });

      return res.status(200).json(result);
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

  async updatePassword(req: Request, res: Response): Promise<Response> {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
      }

      const { old_password, new_password } = req.body;

      await UpdateUserPasswordService({
        user_id,
        old_password,
        new_password,
      });

      return res.status(200).json({ message: 'Senha atualizada com sucesso' });
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

  async cancelAccount(req: Request, res: Response): Promise<Response> {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
      }

      const { password } = req.body;

      await CancelUserAccountService({
        user_id,
        password,
      });

      return res.status(200).json({ message: 'Conta cancelada com sucesso' });
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

  async updateEnterprise(req: Request, res: Response): Promise<Response> {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
      }

      const { enterprise_id } = req.params;

      if (!enterprise_id) {
        return res.status(400).json({
          status: 'error',
          message: 'ID da empresa não fornecido',
        });
      }

      const {
        fantasy_name,
        company_name,
        document_enterprise,
        zip_code,
        address,
        number,
        complement,
        region,
        city,
        state,
        lat,
        long,
      } = req.body;

      const result = await UpdateEnterpriseService({
        user_id,
        enterprise_id,
        fantasy_name,
        company_name,
        document_enterprise,
        zip_code,
        address,
        number,
        complement,
        region,
        city,
        state,
        lat,
        long,
      });

      return res.status(200).json(result);
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
