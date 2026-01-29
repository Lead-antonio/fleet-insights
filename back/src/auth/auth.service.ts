import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm/repository/Repository';
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entity/users.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(PasswordResetToken)
        private passwordResetRepo: Repository<PasswordResetToken>,
        @InjectRepository(User)
        private usersRepo: Repository<User>,
        private usersService: UsersService,
        private configService: ConfigService,
        private mailService: MailService,
        private jwtService: JwtService,
    ){}

    async validatUser(email: string, password: string): Promise<any>{
        const user = await this.usersService.findByEmail(email);
        if(!user) throw new UnauthorizedException();

        const passwordValid = await bcrypt.compare(password, user.password);
        if(!passwordValid) throw new UnauthorizedException();

        const {password: _, ...result} = user;
        return result;
    }

    login(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            iat: Math.floor(Date.now() / 1000),
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) return;

        const rawToken = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(rawToken).digest('hex');

        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await this.passwordResetRepo.save({
            token_hash: tokenHash,
            user,
            expires_at: expires,
        });

        const resetLink = `${this.configService.get(
            'FRONTEND_URL',
        )}/reset-password?token=${rawToken}`;

        await this.mailService.sendMail({
            to: user.email,
            subject: 'Reset your password',
            html: 'reset-password',
        });
    }

    async resetPassword(token: string, newPassword: string) {
        const tokenHash = createHash('sha256').update(token).digest('hex');

        const resetToken = await this.passwordResetRepo.findOne({
            where: { token_hash: tokenHash },
            relations: ['user'],
        });

        if (!resetToken) {
            throw new BadRequestException('Invalid token');
        }

        if (resetToken.expires_at < new Date()) {
            await this.passwordResetRepo.delete(resetToken.id);
            throw new BadRequestException('Token expired');
        }

        const user = resetToken.user;

        const samePassword = await bcrypt.compare(newPassword, user.password);
        if (samePassword) {
            throw new BadRequestException('Password must be different');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.password_changed_at = new Date();

        await this.usersRepo.save(user);
        await this.passwordResetRepo.delete(resetToken.id);
    }


}
