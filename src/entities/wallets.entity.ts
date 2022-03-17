import { Transaction } from './../interfaces/wallets.interface';
import { UserEntity } from './users.entity';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, OneToMany } from 'typeorm';
import { User } from '@interfaces/users.interface';
import { Wallet } from '@/interfaces/wallets.interface';

// Wallet entity
@Entity()
export class WalletEntity extends BaseEntity implements Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserEntity, user => user.wallet)
  user: User;

  @Column({ type: 'longtext', nullable: false })
  @IsNotEmpty()
  public_key: string;

  @Column({ type: 'longtext', nullable: false })
  @IsNotEmpty()
  secret_key: string;

  @OneToMany(() => TransactionEntity, transaction => transaction.wallet)
  transaction: Transaction;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}

// Transaction entity
@Entity()
export class TransactionEntity extends BaseEntity implements Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  status: string;

  @ManyToOne(() => WalletEntity, wallet => wallet.transaction)
  wallet: Wallet;

  @Column()
  data: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
