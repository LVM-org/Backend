import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import MediaController from '@/controllers/media.controller';

class BookRoute implements Routes {
  public path = '/media';
  public router = Router();
  public mediaController = new MediaController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, this.mediaController.createMedia);
    this.router.post(`${this.path}/purchase_time`, this.mediaController.purchaseMediaTime);
  }
}

export default BookRoute;
