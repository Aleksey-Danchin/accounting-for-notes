import type { AuthController } from '__backend/src/auth/auth.controller';
import type { LoginDataDTO } from '__backend/src/auth/dto';
import { loginRequest, logoutRequest } from './authApi';
import { useSessionStore } from './sessionStore';
import { loginErrorMessage } from './utils';

export type LoginResult =
  | {
      success: true;
      user: Awaited<ReturnType<AuthController['login']>>['user'];
    }
  | { success: false; error: string };

export function useSession() {
  const user = useSessionStore((s) => s.user);
  const status = useSessionStore((s) => s.status);
  const isIdle = useSessionStore((s) => s.isIdle);
  const isLoading = useSessionStore((s) => s.isLoading);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const isAnonymous = useSessionStore((s) => s.isAnonymous);

  return {
    user,
    status,
    isIdle,
    isLoading,
    isAuthenticated,
    isAnonymous,
    login: async (loginData: LoginDataDTO): Promise<LoginResult> => {
      try {
        const { user: loggedIn } = await loginRequest(loginData);
        window.location.reload();
        return { success: true, user: loggedIn };
      } catch (error) {
        return { success: false, error: loginErrorMessage(error) };
      }
    },
    logout: async (): Promise<boolean> => {
      try {
        await logoutRequest();
        window.location.reload();
        return true;
      } catch {
        window.location.reload();
        return false;
      }
    },
  };
}
