import WalletService from '@/services/wallet.service';
import { NextFunction, Request, Response } from 'express';

class WalletController {
  public walletService = new WalletService();

  public airdropWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.user_id;

      const airdropWallet: String = await this.walletService.airdropWallet(userId);

      res.status(200).json({ data: airdropWallet });
    } catch (error) {
      next(error);
    }
  };
}

export default WalletController;
