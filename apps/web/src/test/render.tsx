import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { ToastProvider } from "../components/ui/Toast.tsx";

type RenderPageOptions = {
  /** The route pattern the element is mounted on, such as "/projects/:projectId". */
  path: string;
  /** The URL to open, such as "/projects/checkout". */
  url: string;
  /** Nested routes. The page element stays mounted while one of them matches. */
  routes?: { path: string; element: ReactNode }[];
};

/** Renders a page as the app does: in a router, with TanStack Query and toasts. */
export function renderPage(element: ReactNode, { path, url, routes }: RenderPageOptions) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      routes ? { path, element, children: routes } : { path, element },
      { path: "*", element: <p>Somewhere else</p> },
    ],
    { initialEntries: [url] },
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  );
}
