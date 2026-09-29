import { createBrowserRouter, type RouteObject } from "react-router";
import { Layout } from "./components/Layout.tsx";
import { NotFoundPage } from "./components/NotFoundPage.tsx";
import { FirstProjectRedirect } from "./features/projects/FirstProjectRedirect.tsx";
import { TicketListPage } from "./features/tickets/TicketListPage.tsx";

/** The UI kit at /dev/ui: every design-system primitive on one page. Not in production builds. */
const developmentRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: "dev/ui",
        lazy: { Component: async () => (await import("./dev/UiKitPage.tsx")).UiKitPage },
      },
    ]
  : [];

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: FirstProjectRedirect },
      { path: "projects/:projectId", Component: TicketListPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  ...developmentRoutes,
]);
