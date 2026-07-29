import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Rotas carregadas sob demanda (code-splitting): cada página vira um chunk
// próprio. Assim o celular que abre só /gravador não baixa o Prontuário, os
// templates de impressão nem as libs de PDF — o carregamento fica muito mais leve.
const Login = lazy(() => import('./pages/Login'));
const Prontuario = lazy(() => import('./pages/Prontuario'));
const ExamesLaboratoriais = lazy(() => import('./pages/ExamesLaboratoriais'));
const ProcedimentosEletivos = lazy(() => import('./pages/ProcedimentosEletivos'));
const Servicos = lazy(() => import('./pages/Servicos'));
const ImprimirServico = lazy(() => import('./pages/ImprimirServico'));
const Imprimir = lazy(() => import('./pages/Imprimir'));
const NovaReceita = lazy(() => import('./pages/NovaReceita'));
const ImprimirReceita = lazy(() => import('./pages/ImprimirReceita'));
const Documentos = lazy(() => import('./pages/Documentos'));
const ImprimirDocumento = lazy(() => import('./pages/ImprimirDocumento'));
const GravadorMobile = lazy(() => import('./pages/GravadorMobile'));

// Tela de transição enquanto o chunk da rota carrega. Discreta e no tema escuro.
function RouteFallback() {
  return (
    <div className="min-h-dvh bg-slate-950 flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin" />
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
