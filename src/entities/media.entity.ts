import { UserEntity } from './users.entity';
import { User } from './../interfaces/users.interface';
import { AuthorEntity } from './author.entity';
import { AccessTime, Media } from './../interfaces/media.interface';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Author } from '@/interfaces/authors.interface';

@Entity()
export class MediaEntity extends BaseEntity implements Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext', nullable: false })
  @IsNotEmpty()
  public_key: string;

  @Column({ type: 'longtext', nullable: false })
  @IsNotEmpty()
  program_key: string;

  @Column({ type: 'longtext', nullable: false })
  @IsNotEmpty()
  metadata: string;

  @Column()
  @IsNotEmpty()
  title: string;

  @ManyToOne(() => AuthorEntity, author => author.media)
  @JoinColumn()
  author: Author;

  @ManyToOne(() => AccessTimeEntity, access_time => access_time.media)
  access_time: AccessTime;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class AccessTimeEntity extends BaseEntity implements AccessTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext', nullable: false })
  @IsNotEmpty()
  program_key: string;

  @Column()
  @IsNotEmpty()
  time_spent: number;

  @Column()
  @IsNotEmpty()
  total_time: number;

  @ManyToOne(() => UserEntity, user => user.access_time)
  @JoinColumn()
  user: User;

  @ManyToOne(() => MediaEntity, media => media.access_time)
  @JoinColumn()
  media: Media;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
