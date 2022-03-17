import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';

import AuthorController from '@/controllers/author.controller';

class AuthorRoute implements Routes {
  public path = '/authors';
  public router = Router();
  public authorController = new AuthorController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.authorController.createAuthor);
  }
}

export default AuthorRoute;
