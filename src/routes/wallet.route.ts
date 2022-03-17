import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import WalletController from '@/controllers/wallet.controller';

class WalletRoute implements Routes {
  public path = '/wallets';
  public router = Router();
  public walletController = new WalletController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/airdrop/:user_id`, this.walletController.airdropWallet);
  }
}

export default WalletRoute;
