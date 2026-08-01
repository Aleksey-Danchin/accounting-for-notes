import type { AuthController } from '__backend/src/auth/auth.controller';
import type { LoginDataDTO } from '__backend/src/auth/dto';
import { authClient } from './authClient';

export async function loginRequest(
  data: LoginDataDTO,
): Promise<Awaited<ReturnType<AuthController['login']>>> {
  const { data: body } =
    await authClient.post<Awaited<ReturnType<AuthController['login']>>>(
      '/auth/login',
      data,
    );
  return body;
}

export async function logoutRequest(): Promise<
  Awaited<ReturnType<AuthController['logout']>>
> {
  const { data } =
    await authClient.post<Awaited<ReturnType<AuthController['logout']>>>(
      '/auth/logout',
    );
  return data;
}

export async function meRequest(): Promise<
  Awaited<ReturnType<AuthController['me']>> | null
> {
  try {
    const { data } =
      await authClient.get<Awaited<ReturnType<AuthController['me']>>>(
        '/auth/me',
      );
    return data;
  } catch {
    return null;
  }
}
