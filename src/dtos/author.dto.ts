import { IsString } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  public name: string;
  public user_id: string;
}
