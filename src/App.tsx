import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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

// Um PrivateRoute simples seria adicionado aqui
// Para o MVP, permitiremos acesso livre ou mockaremos o login

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
          <Route path="/prontuario" element={<Prontuario />} />
          <Route path="/gravador" element={<GravadorMobile />} />
          <Route path="/exames" element={<ExamesLaboratoriais />} />
          <Route path="/procedimentos" element={<ProcedimentosEletivos />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/servicos/imprimir" element={<ImprimirServico />} />
          <Route path="/novo" element={<Navigate to="/prontuario" replace />} />
          <Route path="/imprimir" element={<Imprimir />} />
          <Route path="/receita" element={<NovaReceita />} />
          <Route path="/receita/imprimir" element={<ImprimirReceita />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/documentos/imprimir" element={<ImprimirDocumento />} />
          <Route path="/" element={<Navigate to="/prontuario" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
