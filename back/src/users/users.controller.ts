import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Public } from 'src/common/decarators/public.decorator';
import { GetUser } from './decorators/get-user-decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }


  @Get('me')
  async getProfile(@GetUser() user: any) {
    return this.usersService.findOneWithRoleAndPermissions(user.userId);
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
