// import { ConvexProviderWithAuth } from "convex/react";
// import { ThemeProvider } from "next-themes";
// import { convex } from "@/lib/convex.ts";
// import { useAuth } from "@/hooks/use-auth.ts";
// import { Toaster } from "@/components/ui/sonner.tsx";
// import { TooltipProvider } from "@/components/ui/tooltip.tsx";
// import { QueryClientProvider } from "@/components/providers/query-client.tsx";

// export function DefaultProviders({ children }: { children: React.ReactNode }) {
//   return (
//       <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
//         <QueryClientProvider>
//             <TooltipProvider>
//               <ThemeProvider
//                 attribute="class"
//                 defaultTheme="dark"
//                 enableSystem
//               >
//                 <Toaster />
//                 {children}
//               </ThemeProvider>
//             </TooltipProvider>
//         </QueryClientProvider>
//       </ConvexProviderWithAuth>
//   );
// }
