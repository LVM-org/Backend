import TokenService from '@/services/tokens.service';
import { NextFunction, Request, Response } from 'express';

class TokensController {
  public tokenService = new TokenService();

  public createSpdfToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createToken = await this.tokenService.createSpdfToken();

      res.status(200).json({ data: createToken });
    } catch (error) {
      next(error);
    }
  };
}

export default TokensController;
