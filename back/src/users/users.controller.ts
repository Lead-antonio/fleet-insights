import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Req } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { Public } from 'src/common/decarators/public.decorator';
import { GetUser } from './decorators/get-user-decorator';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }


  @Get('me')
  async getProfile(@GetUser() user: any) {
    return this.usersService.findOneWithRoleAndPermissions(user.userId);
  }

  @Put('update-profile')
  updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @Put('change-password')
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(
      req.user.sub, // depuis le JWT
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      status: 'success',
      message: 'Liste des utilisateurs',
      data: users,
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
      status: 'success',
      message: 'Utilisateur trouvé',
      data: user,
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
      status: 'success',
      message: 'Utilisateur supprimé avec succès',
    };
  }
}
