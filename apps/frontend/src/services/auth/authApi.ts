import type { AuthController } from '__backend/src/auth/auth.controller';
import type { LoginDataDTO } from '__backend/src/auth/dto';
import { apiClient } from '__frontend/services/api';

export async function loginRequest(
  data: LoginDataDTO,
): Promise<Awaited<ReturnType<AuthController['login']>>> {
  const { data: body } =
    await apiClient.post<Awaited<ReturnType<AuthController['login']>>>(
      '/auth/login',
      data,
    );
  return body;
}

export async function logoutRequest(): Promise<
  Awaited<ReturnType<AuthController['logout']>>
> {
  const { data } =
    await apiClient.post<Awaited<ReturnType<AuthController['logout']>>>(
      '/auth/logout',
    );
  return data;
}

export async function refreshRequest(): Promise<
  Awaited<ReturnType<AuthController['refresh']>>
> {
  const { data } =
    await apiClient.post<Awaited<ReturnType<AuthController['refresh']>>>(
      '/auth/refresh',
    );
  return data;
}

export async function checkRequest(): Promise<
  Awaited<ReturnType<AuthController['check']>>
> {
  const { data } =
    await apiClient.get<Awaited<ReturnType<AuthController['check']>>>(
      '/auth/check',
    );
  return data;
}

export async function meRequest(): Promise<
  Awaited<ReturnType<AuthController['me']>> | null
> {
  try {
    const { data } =
      await apiClient.get<Awaited<ReturnType<AuthController['me']>>>(
        '/auth/me',
      );
    return data;
  } catch {
    return null;
  }
}
