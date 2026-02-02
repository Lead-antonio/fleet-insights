import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { Public } from 'src/common/decarators/public.decorator';
import { GetUser } from './decorators/get-user-decorator';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: number;
  };
}

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return {
      status: 200,
      message: 'Utilisateur créé avec succès',
      response: user,
    };
  }

  @Get('me/permissions')
  async getMyPermissions(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const permissions = await this.usersService.getUserPermissions(userId);
    
    return {
      status: 200,
      message: 'Permissions récupérées avec succès',
      response: permissions,
    };
  }

  @Get('me')
  async getProfile(@GetUser() user: any) {
    const profile = await this.usersService.findOneWithRoleAndPermissions(user.userId);

    return {
      status: 200,
      message: 'Profil récupéré avec succès',
      response: profile,
    };
  }

  @Put('update-profile')
  async updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
    const updatedUser = await this.usersService.updateProfile(req.user.sub, dto);

    return {
      status: 200,
      message: 'Profil mis à jour avec succès',
      response: updatedUser,
    };
  }

  @Put('change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    const result = await this.usersService.changePassword(req.user.sub, dto.currentPassword, dto.newPassword);

    return {
      status: 200,
      message: 'Mot de passe modifié avec succès',
      response: result,
    };
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      status: 200,
      message: 'Utilisateurs récupérés avec succès',
      response: users,
    };
  }

  // 🔸 Récupérer un utilisateur par ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Utilisateur non trouvé',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      status: 200,
      message: 'Utilisateur trouvé',
      response: user,
    };
  }

  // 🔸 Supprimer un utilisateur
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Utilisateur non trouvé',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.usersService.remove(+id);

    return {
      status: 200,
      message: 'Utilisateur supprimé avec succès',
    };
  }
}
