import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entity/customer.entity';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  
  async create(createCustomerDto: CreateCustomerDto) {
    try{
      const customer = this.customerRepo.create(createCustomerDto);
      return await this.customerRepo.save(customer);
    }catch(error){
      if (
        error.code === '23505' ||
        error.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Customer already exists');
      }

      throw new InternalServerErrorException(
        'Error while creating customer',
      );
    }
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepo.find();
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    Object.assign(customer, updateCustomerDto);
    return await this.customerRepo.save(customer);
  }

  async remove(id: number) {
    const customer = await this.customerRepo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    return await this.customerRepo.remove(customer);
  }
}
