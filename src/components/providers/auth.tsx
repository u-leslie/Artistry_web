// import { useCallback } from "react";
// import {
//   AuthProvider as ReactAuthProvider,
//   type AuthProviderProps,
// } from "react-oidc-context";

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const onSigninCallback = useCallback(() => {
//     window.history.replaceState({}, document.title, window.location.pathname);
//   }, []);
//   const onSignoutCallback = useCallback(() => {
//     window.location.pathname = "";
//   }, []);

//   return (
//     <ReactAuthProvider>
//       {children}
//     </ReactAuthProvider>
//   );
// }
