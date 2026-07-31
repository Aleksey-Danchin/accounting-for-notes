import type { PublicUser } from '__prisma/types/public-user';
import { apiClient } from '__frontend/services/api';

export async function fetchUsers(): Promise<PublicUser[]> {
  const { data } = await apiClient.get<PublicUser[]>('/users');
  return data;
}
