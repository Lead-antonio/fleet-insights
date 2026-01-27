import { ConflictException, Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { User } from './entity/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const exists = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (exists) {
            throw new ConflictException('Email already exists');
        }

        const user = new User();
        user.email = createUserDto.email;
        user.full_name = createUserDto.full_name;
        user.is_active = false; 
        
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(createUserDto.password, salt);

        return this.usersRepository.save(user);
    }


    async findOneWithRoleAndPermissions(userId: number) {
        return this.usersRepository.findOne({
            where: { id: userId },
            // relations: ['role'], 
        });
    }

    async findAll(): Promise<Omit<User, 'password'>[]> {
        const users = await this.usersRepository.find();
        // {
        //     relations: ['role', 'role.permissions'],
        // }

        return users.map(({ password, ...rest }) => rest);
    }

     async findById(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
        }

        return user;
    }

    async findOne(id: number): Promise<User | null> {
        return this.usersRepository.findOne({ 
            where: { id },
            relations: ['role'],
        });
    }

    async remove(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async updateProfile(userId: number, data: Partial<User>) {
        await this.usersRepository.update(userId, data);
        return this.usersRepository.findOne({ where: { id: userId } });
    }

    
    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException();
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new BadRequestException('New password must be different from the current password');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException('Current password is incorrect');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.password_changed_at = new Date();
        await this.usersRepository.save(user);

        return { message: 'Password updated successfully' };
    }
}
