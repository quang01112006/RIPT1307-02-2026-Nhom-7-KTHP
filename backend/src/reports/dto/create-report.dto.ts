import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  @IsEnum(['Post', 'Comment'])
  targetType: string;

  @IsNotEmpty()
  @IsMongoId()
  targetId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
