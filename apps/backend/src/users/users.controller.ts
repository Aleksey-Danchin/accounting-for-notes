import { Controller, Get, Inject } from '@nestjs/common';
import { UsersProvider } from './users.provider';

@Controller('users')
export class UsersController {
  constructor(@Inject(UsersProvider) private readonly users: UsersProvider) {}

  @Get()
  getUsers(): ReturnType<UsersProvider['getUsers']> {
    return this.users.getUsers();
  }
}
