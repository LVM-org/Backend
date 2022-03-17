import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import TokensController from '@/controllers/tokens.controller';

class TokenRoute implements Routes {
  public path = '/tokens';
  public router = Router();
  public tokenController = new TokensController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/spdf`, this.tokenController.createSpdfToken);
  }
}

export default TokenRoute;
