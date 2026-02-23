import { ConflictException, Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { User } from './entity/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/roles/entity/role.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,

        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const exists = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (exists) {
            throw new ConflictException('Email already exists');
        }

        const user = new User();
        user.email = createUserDto?.email;
        user.first_name = createUserDto?.first_name;
        user.last_name = createUserDto.last_name;
        user.number = createUserDto?.number;
        user.country = createUserDto?.country;
        user.state = createUserDto?.state;
        user.is_active = false; 

         if (createUserDto.role_id) {
            const role = await this.rolesRepository.findOne({ where: { id: createUserDto.role_id } });
            if (role) user.role = role;
        }
        
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(createUserDto.password, salt);

        return this.usersRepository.save(user);
    }

    async signup(createUserDto: CreateUserDto): Promise<User> {
        const exists = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (exists) {
            throw new ConflictException({code: 'EMAIL_ALREADY_EXISTS'});
        }

        const user = new User();
        user.email = createUserDto.email;
        user.first_name = createUserDto?.first_name;
        user.last_name = createUserDto?.last_name;
        user.number = createUserDto?.number;
        user.country = createUserDto?.country;
        user.state = createUserDto?.state;
        user.is_active = false; 
        
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(createUserDto.password, salt);

        return this.usersRepository.save(user);
    }

    findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findAll(): Promise<Omit<User, 'password'>[]> {
        const users = await this.usersRepository.find({
            relations: ['role', 'role.permissions'],
        });
        

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

    async updateProfile(userId: number, dto: UpdateProfileDto) {
        await this.usersRepository.update(userId, dto);

        const updatedUser = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['role', 'role.permissions'],
        });

        if (!updatedUser) return null;

        const { password, ...result } = updatedUser;

        return result;
    }

    async updateUser(id: number, dto: UpdateUserDto) {
        console.log('Updating user with ID:', id, 'and data:', dto);
        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        const { role_id, ...updateData } = dto;

        Object.assign(user, {
            email: updateData.email ?? user.email,
            first_name: updateData.first_name ?? user.first_name,
            last_name: updateData.last_name ?? user.last_name,
            number: updateData.number ?? user.number,
            country: updateData.country ?? user.country,
            state: updateData.state ?? user.state,
        });

        if (role_id) {
            const role = await this.rolesRepository.findOne({ where: { id: role_id } });
            if (role) {
                user.role = role;
            }
        }
        
        await this.usersRepository.save(user);
        const updatedUser = await this.usersRepository.findOne({
            where: { id },
            relations: ['role', 'role.permissions'],
        });

        if (!updatedUser) return null;

        const { password, ...result } = updatedUser;

        return result;
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
            throw new BadRequestException('New password must be different from the current password');   return { message: 'Password updated successfully' };
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException('Current password is incorrect'); return { message: 'Current password is incorrect' };
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.password_changed_at = new Date();
        await this.usersRepository.save(user);

        return { message: 'Password updated successfully' };
    }

    async getUserPermissions(userId: number): Promise<string[]> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['role', 'role.permissions'],
        });

        if (!user || !user.role) return [];

        return user.role.permissions.map(p => p.name);
    }

    // src/users/users.service.ts
    async findOneWithRoleAndPermissions(userId: number) {
        return this.usersRepository.findOne({
            where: { id: userId },
            relations: ['role'], 
        });
    }
}
