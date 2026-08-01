import type { ActionsController } from '__backend/src/actions/actions.controller';
import type { ListActionsQueryDTO } from '__backend/src/actions/dto';
import { apiClient } from '__frontend/services/api';

export async function fetchActions(
  params?: ListActionsQueryDTO,
): Promise<Awaited<ReturnType<ActionsController['listActions']>>> {
  const { data } = await apiClient.get<
    Awaited<ReturnType<ActionsController['listActions']>>
  >('/actions', { params });
  return data;
}

export async function fetchAction(
  id: string,
): Promise<Awaited<ReturnType<ActionsController['getAction']>>> {
  const { data } = await apiClient.get<
    Awaited<ReturnType<ActionsController['getAction']>>
  >(`/actions/${id}`);
  return data;
}
