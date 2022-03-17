import { IsString } from 'class-validator';

export class CreateMediaDto {
  public media: any;

  @IsString()
  public price_per_minute: string;

  @IsString()
  public distributor_fee: string;

  @IsString()
  public author_id: string;
}
