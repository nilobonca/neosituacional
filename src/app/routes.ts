import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { Services } from "./pages/Services";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Feedback } from "./pages/Feedback";
import { ClientArea } from "./pages/ClientArea";
import { NotFound } from "./pages/NotFound";

import { AdminBlogList } from "./pages/AdminBlogList";
import { AdminBlogEdit } from "./pages/AdminBlogEdit";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminClients } from "./pages/AdminClients";
import { AdminTestimonials } from "./pages/AdminTestimonials";
import { AdminSettings } from "./pages/AdminSettings";
import { AdminServices } from "./pages/AdminServices";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "blog", Component: Blog },
      { path: "blog/:id", Component: BlogPost },
      { path: "servicos", Component: Services },
      { path: "quem-somos", Component: About },
      { path: "contatos", Component: Contact },
      { path: "feedback", Component: Feedback },
      { path: "area-cliente", Component: ClientArea },
      
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "blog", Component: AdminBlogList },
      { path: "blog/new", Component: AdminBlogEdit },
      { path: "blog/edit/:id", Component: AdminBlogEdit },
      { path: "clients", Component: AdminClients },
      { path: "services", Component: AdminServices },
      { path: "testimonials", Component: AdminTestimonials },
      { path: "settings", Component: AdminSettings },
      { path: "carousel", Component: AdminSettings },
      { path: "*", Component: NotFound }
    ]
  }
]);
