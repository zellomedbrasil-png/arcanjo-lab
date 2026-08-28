import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { routeImports } from './routes/lazyRoutes';

// Rotas carregadas sob demanda (code-splitting): cada página vira um chunk
// próprio. Assim o celular que abre só /gravador não baixa o Prontuário, os
// templates de impressão nem as libs de PDF — o carregamento fica muito mais leve.
// As rotas de menu usam routeImports para que o React.lazy() e o prefetch do
// menu (Layout) partam do MESMO import — não há como divergirem.
const Login = lazy(() => import('./pages/Login'));
const Prontuario = lazy(routeImports['/prontuario']);
const ExamesLaboratoriais = lazy(routeImports['/exames']);
const ProcedimentosEletivos = lazy(routeImports['/procedimentos']);
const Servicos = lazy(routeImports['/servicos']);
const ImprimirServico = lazy(() => import('./pages/ImprimirServico'));
const Imprimir = lazy(() => import('./pages/Imprimir'));
const NovaReceita = lazy(routeImports['/receita']);
const ImprimirReceita = lazy(() => import('./pages/ImprimirReceita'));
const Documentos = lazy(routeImports['/documentos']);
const ImprimirDocumento = lazy(() => import('./pages/ImprimirDocumento'));
const GravadorMobile = lazy(() => import('./pages/GravadorMobile'));

// Tela de transição enquanto o chunk da rota carrega.
//
// Antes era bg-slate-950 (quase preto) enquanto o app inteiro é claro
// (--color-neutral-bg: #f8fafc), então cada troca de rota piscava uma tela
// escura e voltava — parecia travamento. Agora usa o mesmo fundo do app, e o
// spinner só aparece depois de 250ms: em navegação rápida (o caso normal, com
// o chunk já em cache) não pisca nada, que é a transição mais fluida possível.
function RouteFallback() {
  const [mostrarSpinner, setMostrarSpinner] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMostrarSpinner(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-dvh bg-neutral-bg flex items-center justify-center">
      <div
        className={`h-8 w-8 rounded-full border-2 border-neutral-border border-t-indigo-500 animate-spin transition-opacity duration-200 ${
          mostrarSpinner ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/prontuario"
            element={
              <ProtectedRoute>
                <Prontuario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gravador"
            element={
              <ProtectedRoute>
                <GravadorMobile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exames"
            element={
              <ProtectedRoute>
                <ExamesLaboratoriais />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procedimentos"
            element={
              <ProtectedRoute>
                <ProcedimentosEletivos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicos"
            element={
              <ProtectedRoute>
                <Servicos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicos/imprimir"
            element={
              <ProtectedRoute>
                <ImprimirServico />
              </ProtectedRoute>
            }
          />
          <Route path="/novo" element={<Navigate to="/prontuario" replace />} />
          <Route
            path="/imprimir"
            element={
              <ProtectedRoute>
                <Imprimir />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receita"
            element={
              <ProtectedRoute>
                <NovaReceita />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receita/imprimir"
            element={
              <ProtectedRoute>
                <ImprimirReceita />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documentos"
            element={
              <ProtectedRoute>
                <Documentos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documentos/imprimir"
            element={
              <ProtectedRoute>
                <ImprimirDocumento />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/prontuario" replace />} />
          <Route path="*" element={<Navigate to="/prontuario" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
