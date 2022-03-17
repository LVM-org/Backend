import { CreateMediaDto } from './../dtos/media.dto';
import MediaService from '@/services/media.service';
import { NextFunction, Request, Response } from 'express';

class MediaController {
  public bookService = new MediaService();

  public createMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mediaData: CreateMediaDto = {
        author_id: '1',
        price_per_minute: '2',
        media: req.files.media,
        distributor_fee: '20',
      };
      const newMedia = await this.bookService.createMedia(mediaData);

      res.status(200).json({ data: newMedia });
    } catch (error) {
      next(error);
    }
  };
}

export default MediaController;
