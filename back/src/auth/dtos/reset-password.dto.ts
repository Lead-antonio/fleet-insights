import { MinLength } from 'class-validator';

export class ResetPasswordDto {
  token: string;

  @MinLength(8)
  newPassword: string;
}
