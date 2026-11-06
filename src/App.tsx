import { BrowserRouter, Routes, Route } from "react-router-dom";

import SiteLayout from "./layouts/SiteLayout";
import Home from "./pages/Home";

function PaginaEmConstrucao({
  titulo,
}: {
  titulo: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-24 text-center">
      <h1 className="text-3xl font-semibold text-[#071B2E]">
        {titulo}
      </h1>

      <p className="mt-4 text-slate-500">
        Esta página será desenvolvida em breve.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />

          <Route
            path="/imoveis"
            element={<PaginaEmConstrucao titulo="Explorar imóveis" />}
          />

          <Route
            path="/login"
            element={<PaginaEmConstrucao titulo="Área do corretor" />}
          />

          <Route
            path="/cadastro-corretor"
            element={<PaginaEmConstrucao titulo="Seja um corretor" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}