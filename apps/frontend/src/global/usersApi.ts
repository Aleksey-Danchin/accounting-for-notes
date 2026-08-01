import type { UsersController } from '__backend/src/users/users.controller';
import { apiClient } from '__frontend/services/api';

export async function fetchUsers(): Promise<
  Awaited<ReturnType<UsersController['getUsers']>>
> {
  const { data } =
    await apiClient.get<Awaited<ReturnType<UsersController['getUsers']>>>(
      '/users',
    );
  return data;
}
