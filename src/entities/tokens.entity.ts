import { Token, TokenActivity } from './../interfaces/tokens.interface';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

// Token entity
@Entity()
export class TokenEntity extends BaseEntity implements Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext', nullable: false })
  @IsNotEmpty()
  public_key: string;

  @Column()
  @IsNotEmpty()
  type: 'fungible' | 'non_fungible';

  @OneToMany(() => TokenActivityEntity, token_activity => token_activity.token)
  @JoinColumn()
  activities: TokenActivity;

  @Column('text')
  purpose: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}

// Token Activity entity
@Entity()
export class TokenActivityEntity extends BaseEntity implements TokenActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @ManyToOne(() => TokenEntity, token => token.activities)
  token: Token;

  @Column()
  data: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
