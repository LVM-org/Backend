import { CreateMediaDto, PurchaseTimeDto } from './../dtos/media.dto';
import MediaService from '@/services/media.service';
import { NextFunction, Request, Response } from 'express';

class MediaController {
  public mediaService = new MediaService();

  public createMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mediaData: CreateMediaDto = {
        author_id: '1',
        price_per_minute: '2',
        media: req.files.media,
        distributor_fee: '20',
      };
      const newMedia = await this.mediaService.createMedia(mediaData);

      res.status(200).json({ data: newMedia });
    } catch (error) {
      next(error);
    }
  };

  public purchaseMediaTime = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const purchaseData: PurchaseTimeDto = {
        media_id: 1,
        time: 20,
        user_id: 7,
        distributor_user_id: 8,
      };
      const purchaseTimeToken = await this.mediaService.makeAccessTime(purchaseData);

      res.status(200).json({ data: purchaseTimeToken });
    } catch (error) {
      next(error);
    }
  };
}

export default MediaController;
