import { useCallback, useEffect, useMemo } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";

type UseAuthHook = {
  fetchAccessToken: (args: {
    forceRefreshToken: boolean;
  }) => Promise<string | null>;
} & ReturnType<typeof useOidcAuth>;

export function useAuth(): UseAuthHook {
  const oidcAuth = useOidcAuth();

  const idToken = oidcAuth.user?.id_token;
  const fetchAccessToken = useCallback(
    // eslint-disable-next-line no-empty-pattern
    async ({}: { forceRefreshToken: boolean }) => {
      // TODO: refresh token if needed
      return idToken ?? null;
    },
    [idToken],
  );

  return useMemo(
    () => ({
      ...oidcAuth,
      fetchAccessToken,
    }),
    [oidcAuth, fetchAccessToken],
  );
}

type UseUserProps = {
  /**
   * Whether to automatically redirect to the login if the user is not authenticated
   */
  shouldRedirect?: boolean;
};

export function useUser({ shouldRedirect }: UseUserProps = {}) {
  const { user, isLoading, error, isAuthenticated, signinRedirect } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && shouldRedirect) {
      signinRedirect();
    }
  }, [isLoading, isAuthenticated, shouldRedirect, signinRedirect]);

  return useMemo(() => {
    const id = user?.profile.sub;
    const name = user?.profile.name;
    const email = user?.profile.email;
    const avatar = user?.profile.picture;
    return {
      ...(user ?? {}),
      id,
      name,
      email,
      avatar,
      isAuthenticated,
      isLoading,
      error,
    };
  }, [user, isAuthenticated, isLoading, error]);
}
