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

export class PurchaseTimeDto {
  public media_id: number;
  public user_id: number;
  public time: number;
  public distributor_user_id: number;
}
