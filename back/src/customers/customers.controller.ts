import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customersService.create(createCustomerDto);

    return {
      status: 200,
      message: 'Client créé avec succès',
      response: customer,
    }
  }

  @Get()
  async findAll() {
    const customers = await this.customersService.findAll();

    return {
      status: 200,
      message: 'Clients récupérés avec succès',
      response: customers,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const customer = await this.customersService.findOne(+id);

    return {
      status: 200,
      message: 'Client récupéré avec succès',
      response: customer,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customersService.update(+id, updateCustomerDto);

    return {
      status: 200,
      message: 'Client mis à jour avec succès',
      response: customer,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.customersService.remove(+id);
    
    return {
      status: 200,
      message: 'Client supprimé avec succès',
      response: result,
    };
  }
}
