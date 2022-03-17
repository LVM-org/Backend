import WalletService from '@/services/wallet.service';
import { hash } from 'bcrypt';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from '@dtos/users.dto';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';

@EntityRepository()
class UserService extends Repository<UserEntity> {
  public async findAllUser(): Promise<User[]> {
    const users: User[] = await UserEntity.find();
    return users;
  }

  public async findUserById(userId: number): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not a user");

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not a user");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'Please enter the right data');

    const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `Your email ${userData.email} already exist`);

    const hashedPassword = await hash(userData.password, 10);

    const user = new UserEntity();

    user.email = userData.email;
    user.password = hashedPassword;

    // create user wallet

    const walletService = new WalletService();

    const createNewWallet = await walletService.createNewWallet();

    user.wallet = createNewWallet;

    const createUserData: UserEntity = await UserEntity.create(user).save();

    return createUserData;
  }

  public async updateUser(userId: number, userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not a user");

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not a user");

    const hashedPassword = await hash(userData.password, 10);
    await UserEntity.update(userId, { ...userData, password: hashedPassword });

    const updateUser: User = await UserEntity.findOne({ where: { id: userId } });
    return updateUser;
  }

  public async deleteUser(userId: number): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not a user");

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not a user");

    await UserEntity.delete({ id: userId });
    return findUser;
  }
}

export default UserService;
