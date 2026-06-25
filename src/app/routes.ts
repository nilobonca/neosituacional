import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { Services } from "./pages/Services";
import { About } from "./pages/About";
import { Feedback } from "./pages/Feedback";
import { ClientArea } from "./pages/ClientArea";
import { NotFound } from "./pages/NotFound";
import { TempAreaDoCliente } from "./pages/TempPlaceholderPages";
import { Careers } from "./pages/Careers";
import { Proposal } from "./pages/Proposal";
import { Suppliers } from "./pages/Suppliers";

import { AdminBlogList } from "./pages/AdminBlogList";
import { AdminBlogEdit } from "./pages/AdminBlogEdit";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminClients } from "./pages/AdminClients";
import { AdminTestimonials } from "./pages/AdminTestimonials";
import { AdminCondominiums } from "./pages/AdminCondominiums";
import { AdminSettings } from "./pages/AdminSettings";
import { AdminServices } from "./pages/AdminServices";
import { AdminCareers } from "./pages/AdminCareers";
import { AdminProposals } from "./pages/AdminProposals";
import { AdminSuppliers } from "./pages/AdminSuppliers";
import { AdminLogin } from "./pages/AdminLogin";

import { CondoLogin } from "./pages/CondoLogin";
import { CondoRegister } from "./pages/CondoRegister";
import { CondoForgotPassword } from "./pages/CondoForgotPassword";
import { CondoResetPassword } from "./pages/CondoResetPassword";
import { CondoLayout } from "./layouts/CondoLayout";
import { CondoDashboard } from "./pages/CondoDashboard";
import { CondoSuppliers } from "./pages/CondoSuppliers";

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
      { path: "feedback", Component: Feedback },
      { path: "area-cliente", Component: ClientArea },
      { path: "proposta", Component: Proposal },
      { path: "carreiras", Component: Careers },
      { path: "fornecedores", Component: Suppliers },
      
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
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
      {
        path: "condominiums",
        Component: AdminCondominiums,
      },
      {
        path: "settings",
        Component: AdminSettings,
      },
      { path: "carousel", Component: AdminSettings },
      { path: "careers", Component: AdminCareers },
      { path: "proposals", Component: AdminProposals },
      { path: "suppliers", Component: AdminSuppliers },
      { path: "*", Component: NotFound }
    ]
  },
  {
    path: "/area-cliente/login",
    Component: CondoLogin,
  },
  {
    path: "/area-cliente/cadastro",
    Component: CondoRegister,
  },
  {
    path: "/area-cliente/esqueci-senha",
    Component: CondoForgotPassword,
  },
  {
    path: "/area-cliente/redefinir-senha",
    Component: CondoResetPassword,
  },
  {
    path: "/area-cliente",
    Component: CondoLayout,
    children: [
      { index: true, Component: CondoDashboard },
      { path: "fornecedores", Component: CondoSuppliers },
      { path: "*", Component: NotFound }
    ]
  }
]);
