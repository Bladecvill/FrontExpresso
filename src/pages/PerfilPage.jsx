// src/pages/PerfilPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // 1. IMPORTAR O 'logout'
import axios from 'axios';
import GerenciadorCategorias from '../components/GerenciadorCategorias';

const API_BASE_URL = 'http://localhost:8080/api';

function PerfilPage() {
  // 2. PEGAR O 'logout' DO HOOK
  const { utilizador, login, logout } = useAuth();
  
  // --- Estados do formulário de perfil ---
  const [nome, setNome] = useState(utilizador.nome);
  const [email, setEmail] = useState(utilizador.email);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  // --- Estados do fluxo de exclusão ---
  const [deleteStep, setDeleteStep] = useState('idle');
  const [deletePassword, setDeletePassword] = useState('');

  // 3. A FUNÇÃO DE ATUALIZAR PERFIL (CORRIGIDA)
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!senhaAtual) {
      alert('Por favor, insira a sua senha atual para confirmar as alterações.');
      return;
    }
    
    const payload = {
      nome: nome,
      email: email,
      senhaAtual: senhaAtual,
      novaSenha: novaSenha.length > 0 ? novaSenha : null 
    };

    try {
      // Chama a API PUT
      const response = await axios.put(
        `${API_BASE_URL}/clientes/${utilizador.id}`, 
        payload
      );

      // SUCESSO!
      alert('Perfil atualizado com sucesso!');
      setSenhaAtual(''); 
      setNovaSenha(''); 
      
      // *** A CORREÇÃO ESTÁ AQUI ***
      // Nós chamamos 'login()' para ATUALIZAR os dados do utilizador
      // (como o novo nome) no AuthContext.
      login(response.data); 
      // *NÃO* chamamos logout() aqui!
      
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.response.data);
      alert('Erro ao atualizar perfil: ' + error.response.data);
    }
  };
  
  // 4. A FUNÇÃO DE EXCLUIR CONTA (Esta sim, chama o logout)
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Por favor, digite sua senha atual para confirmar a exclusão.');
      return;
    }

    try {
      const payload = { senhaAtual: deletePassword };
      await axios.delete(
        `${API_BASE_URL}/clientes/${utilizador.id}`,
        { data: payload } 
      );

      alert('Sua conta e todos os seus dados foram excluídos permanentemente.');
      logout(); // <-- O logout só é chamado AQUI.
      
    } catch (error) {
      const msg = error.response?.data || "Erro desconhecido";
      alert('Erro ao excluir conta: ' + msg);
    }
  };

  // 5. O JSX (HTML) DA PÁGINA
  return (
    <div>
      <h2>Meu Perfil</h2>
      
      {/* Formulário de Perfil (chama handleSubmit) */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <hr />
        <div>
          <label>Senha Atual (Obrigatória):</label>
          <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
        </div>
        <div>
          <label>Nova Senha (deixe em branco para não a alterar):</label>
          <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
        </div>
        <button type="submit">Atualizar Perfil</button>
      </form>

      {/* Gerenciador de Categorias (sem mudança) */}
      <GerenciadorCategorias />

      {/* Seção de Excluir Conta (chama handleDeleteAccount) */}
      <hr style={{ borderColor: 'red', borderWidth: '2px', marginTop: '30px', marginBottom: '20px' }} />
      <div style={{ border: '2px solid red', padding: '15px', borderRadius: '8px' }}>
        
        <h3>Excluir Conta Permanentemente</h3>
        
        {deleteStep === 'idle' && (
          <>
            <p>Esta ação é irreversível. Todos os seus dados serão apagados.</p>
            <button 
              onClick={() => setDeleteStep('confirm')} 
              style={{ backgroundColor: '#dc3545', color: 'white', fontWeight: 'bold', padding: '10px' }}
              type="button" // Garante que este botão não submete o formulário
            >
              Excluir Minha Conta
            </button>
          </>
        )}

        {deleteStep === 'confirm' && (
          <>
            <p><strong>Tem certeza que deseja excluir sua conta?</strong></p>
            <button 
              onClick={() => setDeleteStep('password')}
              style={{ backgroundColor: '#dc3545', color: 'white', marginRight: '10px' }}
              type="button" // Garante que este botão não submete o formulário
            >
              Sim, tenho certeza e quero excluir
            </button>
            <button onClick={() => setDeleteStep('idle')} type="button">
              Não, cancelar
            </button>
          </>
        )}

        {deleteStep === 'password' && (
          <>
            <p>Para confirmar esta ação, digite sua senha atual:</p>
            <div>
              <input 
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Sua senha atual"
                style={{ marginRight: '10px' }}
              />
              <button 
                onClick={handleDeleteAccount} 
                style={{ backgroundColor: '#dc3545', color: 'white', fontWeight: 'bold' }}
                type="button" // Garante que este botão não submete o formulário
              >
                CONFIRMAR EXCLUSÃO PERMANENTE
              </button>
              <button onClick={() => setDeleteStep('idle')} style={{ marginLeft: '10px' }} type="button">
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PerfilPage;