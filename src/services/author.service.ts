import { CreateAuthorDto } from './../dtos/author.dto';
import { Author } from './../interfaces/authors.interface';
import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import { AuthorEntity } from '@/entities/author.entity';

@EntityRepository()
class AuthorService extends Repository<AuthorEntity> {
  public async createAuthor(authorData: CreateAuthorDto): Promise<Author> {
    if (isEmpty(authorData)) throw new HttpException(400, 'Please enter author data');

    const findAuthor: Author = await AuthorEntity.findOne({ where: { user: authorData.user_id } });

    if (findAuthor) throw new HttpException(409, `User is already an author`);

    const findUser: User = await UserEntity.findOne(authorData.user_id);

    const author = new AuthorEntity();

    author.metadata = '';
    author.name = authorData.name;
    author.user = findUser;

    const createAuthor: AuthorEntity = await AuthorEntity.create(author).save();

    return createAuthor;
  }
}

export default AuthorService;
