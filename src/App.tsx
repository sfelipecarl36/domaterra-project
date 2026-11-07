
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import SiteLayout from "./layouts/SiteLayout";
import CorretorLayout from "./layouts/CorretorLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Imoveis from "./pages/Imoveis";
import DetalhesImovel from "./pages/DetalhesImovel";
import Login from "./pages/Login";
import CadastroCorretor from "./pages/CadastroCorretor";

import DashboardCorretor from "./pages/corretor/DashboardCorretor";
import MeusImoveis from "./pages/corretor/MeusImoveis";
import MeuPerfil from "./pages/corretor/MeuPerfil";
import MinhaAssinatura from "./pages/corretor/MinhaAssinatura";
import FormularioImovel from "./pages/corretor/FormularioImovel";
import FotosImovel from "./pages/corretor/FotosImovel";
import ContatoProfissional from "./pages/corretor/ContatoProfissional";

import DashboardAdmin from "./pages/admin/DashboardAdmin";
import CorretoresAdmin from "./pages/admin/CorretoresAdmin";
import ImoveisAdmin from "./pages/admin/ImoveisAdmin";
import DetalhesImovelAdmin from "./pages/admin/DetalhesImovelAdmin";
import AssinaturasAdmin from "./pages/admin/AssinaturasAdmin";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/imoveis" element={<Imoveis />} />
            <Route
              path="/imoveis/:id"
              element={<DetalhesImovel />}
            />
            <Route path="/login" element={<Login />} />
            <Route
              path="/cadastro-corretor"
              element={<CadastroCorretor />}
            />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              path="/corretor"
              element={<CorretorLayout />}
            >
              <Route index element={<DashboardCorretor />} />
              <Route path="imoveis" element={<MeusImoveis />} />
              <Route
                path="imoveis/novo"
                element={<FormularioImovel />}
              />
              <Route
                path="imoveis/:id/editar"
                element={<FormularioImovel />}
              />
              <Route
                path="imoveis/:id/fotos"
                element={<FotosImovel />}
              />
              <Route path="perfil" element={<MeuPerfil />} />
              <Route
                path="contato"
                element={<ContatoProfissional />}
              />
              <Route
                path="assinatura"
                element={<MinhaAssinatura />}
              />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardAdmin />} />
              <Route
                path="corretores"
                element={<CorretoresAdmin />}
              />
              <Route
                path="imoveis"
                element={<ImoveisAdmin />}
              />
              <Route
                path="imoveis/:id"
                element={<DetalhesImovelAdmin />}
              />
              <Route
                path="assinaturas"
                element={<AssinaturasAdmin />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
