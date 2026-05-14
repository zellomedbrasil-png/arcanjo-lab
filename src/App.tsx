import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import NovoPedido from './pages/NovoPedido';
import Imprimir from './pages/Imprimir';

// Um PrivateRoute simples seria adicionado aqui
// Para o MVP, permitiremos acesso livre ou mockaremos o login

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/novo" element={<NovoPedido />} />
        <Route path="/imprimir" element={<Imprimir />} />
        <Route path="/" element={<Navigate to="/novo" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
