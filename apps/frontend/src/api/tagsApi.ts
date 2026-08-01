import type { TagsController } from '__backend/src/tags/tags.controller';
import type { CreateTagDTO, UpdateTagDTO } from '__backend/src/tags/dto';
import { apiClient } from '__frontend/services/api';

export async function fetchTags(): Promise<
  Awaited<ReturnType<TagsController['listTags']>>
> {
  const { data } =
    await apiClient.get<Awaited<ReturnType<TagsController['listTags']>>>(
      '/tags',
    );
  return data;
}

export async function createTag(
  body: CreateTagDTO,
): Promise<Awaited<ReturnType<TagsController['createTag']>>> {
  const { data } = await apiClient.post<
    Awaited<ReturnType<TagsController['createTag']>>
  >('/tags', body);
  return data;
}

export async function updateTag(
  id: string,
  body: UpdateTagDTO,
): Promise<Awaited<ReturnType<TagsController['updateTag']>>> {
  const { data } = await apiClient.patch<
    Awaited<ReturnType<TagsController['updateTag']>>
  >(`/tags/${id}`, body);
  return data;
}

export async function deleteTag(
  id: string,
): Promise<Awaited<ReturnType<TagsController['deleteTag']>>> {
  const { data } = await apiClient.delete<
    Awaited<ReturnType<TagsController['deleteTag']>>
  >(`/tags/${id}`);
  return data;
}
