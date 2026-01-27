import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService){}

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
}
