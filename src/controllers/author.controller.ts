import { CreateAuthorDto } from './../dtos/author.dto';
import { Author } from './../interfaces/authors.interface';
import AuthorService from '@/services/author.service';
import { NextFunction, Request, Response } from 'express';

class AuthorController {
  public authorService = new AuthorService();

  public createAuthor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorData: CreateAuthorDto = req.body;
      const createAuthor: Author = await this.authorService.createAuthor(authorData);

      res.status(200).json({ data: createAuthor });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthorController;
