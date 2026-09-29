import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout.tsx";
import { NotFoundPage } from "./components/NotFoundPage.tsx";
import { FirstProjectRedirect } from "./features/projects/FirstProjectRedirect.tsx";
import { TicketListPage } from "./features/tickets/TicketListPage.tsx";

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
]);
