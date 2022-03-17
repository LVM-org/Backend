import { User } from './users.interface';
import { Author } from './authors.interface';
export interface Media {
  id: number;
  public_key: string;
  program_key: string;
  metadata: string;
  author: Author;
  title: string;
}

export interface MediaActivity {
  book_id: string;
  type: string;
  data: string;
}

export interface MediaData {
  author: string;
  creationDate: Date;
  creator: string;
  keywords: string;
  modificationDate: Date;
  pageCount: number;
  indices: number[];
  producer: string;
  subject: string;
  title: string;
}

export interface MediaPage {
  node: string;
  ref: string;
}

export interface AccessTime {
  program_key: string;
  total_time: number;
  time_spent: number;
  user: User;
  media: Media;
}
