import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'B24DCC111', description: 'Mã SV/GV hoặc email' })
  @IsNotEmpty({ message: 'Vui lòng nhập Mã số hoặc Email' })
  identifier: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}
