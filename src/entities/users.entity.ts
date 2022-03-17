import { AccessTime } from './../interfaces/media.interface';
import { Author } from './../interfaces/authors.interface';
import { Wallet } from '@/interfaces/wallets.interface';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '@interfaces/users.interface';
import { WalletEntity } from './wallets.entity';
import { AuthorEntity } from './author.entity';
import { AccessTimeEntity } from './media.entity';

@Entity()
export class UserEntity extends BaseEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @Unique(['email'])
  email: string;

  @Column()
  @IsNotEmpty()
  password: string;

  @OneToOne(() => WalletEntity, wallet => wallet.user)
  @JoinColumn()
  wallet: Wallet;

  @OneToOne(() => AuthorEntity, author => author.user)
  author: Author;

  @OneToOne(() => AccessTimeEntity, access_time => access_time.user)
  access_time: AccessTime;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
