import { User } from './users.interface';
export interface Author {
  id: number;
  name: string;
  user: User;
  metadata: string;
}
