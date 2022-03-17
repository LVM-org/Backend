import { MediaEntity } from './media.entity';
import { Media } from './../interfaces/media.interface';
import { UserEntity } from './users.entity';
import { User } from './../interfaces/users.interface';
import { Author } from './../interfaces/authors.interface';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity()
export class AuthorEntity extends BaseEntity implements Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @OneToOne(() => UserEntity, user => user.author)
  @JoinColumn()
  user: User;

  @OneToMany(() => MediaEntity, media => media.author)
  @JoinColumn()
  media: Media;

  @Column({ type: 'longtext', nullable: false })
  @IsNotEmpty()
  metadata: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
