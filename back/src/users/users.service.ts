import { Injectable, NotFoundException } from '@nestjs/common';
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

    async findOne(id: number): Promise<User | null> {
        return this.usersRepository.findOne({ 
            where: { id },
            relations: ['role'],
        });
    }

    async remove(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async updatePassword(userId: number, newHashedPassword: string): Promise<void> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });

        if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
        }

        user.password = newHashedPassword;

        await this.usersRepository.save(user);
    }
}
