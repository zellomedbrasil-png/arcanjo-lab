import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Prontuario from './pages/Prontuario';
import ExamesLaboratoriais from './pages/ExamesLaboratoriais';
import ProcedimentosEletivos from './pages/ProcedimentosEletivos';
import Imprimir from './pages/Imprimir';
import NovaReceita from './pages/NovaReceita';
import ImprimirReceita from './pages/ImprimirReceita';
import Documentos from './pages/Documentos';
import ImprimirDocumento from './pages/ImprimirDocumento';

// Um PrivateRoute simples seria adicionado aqui
// Para o MVP, permitiremos acesso livre ou mockaremos o login

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/prontuario" element={<Prontuario />} />
        <Route path="/exames" element={<ExamesLaboratoriais />} />
        <Route path="/procedimentos" element={<ProcedimentosEletivos />} />
        <Route path="/novo" element={<Navigate to="/prontuario" replace />} />
        <Route path="/imprimir" element={<Imprimir />} />
        <Route path="/receita" element={<NovaReceita />} />
        <Route path="/receita/imprimir" element={<ImprimirReceita />} />
        <Route path="/documentos" element={<Documentos />} />
        <Route path="/documentos/imprimir" element={<ImprimirDocumento />} />
        <Route path="/" element={<Navigate to="/prontuario" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
