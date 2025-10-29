// src/pages/TransacoesPage.jsx

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import FormCriarTransacao from '../components/FormCriarTransacao';
import axios from 'axios'; // 1. IMPORTAR AXIOS

const API_BASE_URL = 'http://localhost:8080/api'; // 2. ADICIONAR BASE URL

// Função de AJUDA para formatar a data (sem mudança)
function formatarData(dataISO) {
  if (!dataISO) return '';
  return new Date(dataISO).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function TransacoesPage() {
  const { 
    contas, 
    categorias, 
    transacoes, 
    loading, 
    refreshDadosTransacao
  } = useData();
  const { utilizador } = useAuth();
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // ... (lógica de ordenação e visibilidade - sem mudança) ...
  const transacoesOrdenadas = useMemo(() => {
    return [...transacoes]
      .sort((a, b) => new Date(b.dataOperacao) - new Date(a.dataOperacao)); 
  }, [transacoes]);

  const visibleTransacoes = useMemo(() => {
    if (mostrarTodas) {
      return transacoesOrdenadas;
    }
    return transacoesOrdenadas.slice(0, 5);
  }, [mostrarTodas, transacoesOrdenadas]);


  // 3. ADICIONAR A NOVA FUNÇÃO DE DELETAR
  const handleDeletar = async (transacaoId) => {
    // 3.1. Confirmação
    if (!window.confirm("Tem certeza que deseja deletar esta transação? O saldo da conta será revertido. Esta ação é irreversível.")) {
      return;
    }

    try {
      // 3.2. Chama a API
      await axios.delete(`${API_BASE_URL}/transacoes/${transacaoId}`);
      alert('Transação deletada com sucesso!');
      
      // 3.3. Chama o refresh global (para atualizar saldos e a lista)
      refreshDadosTransacao(); 
      
    } catch (error) {
    // 3.4. Mostra o erro (CORRIGIDO)

    // Tenta ler a mensagem de erro (seja um objeto ou uma string)
    const mensagemErro = error.response?.data?.message || error.response?.data || "Ocorreu um erro desconhecido";

    console.error('Erro ao deletar transação:', mensagemErro);
    alert('Erro ao deletar: ' + mensagemErro);
    }
  }


  if (loading) {
    return <div>A carregar dados...</div>;
  }

  return (
    <div>
      <h2>Gestão de Transações</h2>
      
      {/* ... (Formulário - sem mudança) ... */}
      <FormCriarTransacao 
        clienteId={utilizador.id}
        contas={contas}
        categorias={categorias}
        onTransacaoCriada={refreshDadosTransacao}
      />
      <hr />

      {/* Lista de Transações (AGORA COMPLETA) */}
      <h3>Últimas Transações</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {visibleTransacoes.length > 0 ? (
          visibleTransacoes.map(transacao => (
            <li 
              key={transacao.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                borderBottom: '1px solid #eee',
                paddingBottom: '10px'
              }}
            >
              {/* Div da Esquerda (Informações) - CORRIGIDO */}
              <div>
                <strong style={{ fontSize: '1.1em' }}>
                  {transacao.nomeCategoria}
                </strong>
                {transacao.descricao && (
                  <>
                    <br />
                    <span>Descrição: {transacao.descricao}</span>
                  </>
                )}
                <br />
                {transacao.valor > 0 ? (
                  <span style={{ color: 'green' }}>
                    Tipo: Receita | Valor: R$ {transacao.valor.toFixed(2)}
                  </span>
                ) : (
                  <span style={{ color: 'red' }}>
                    Tipo: Despesa | Valor: R$ {transacao.valor.toFixed(2)}
                  </span>
                )}
                <br />
                <span>(Conta: {transacao.nomeConta})</span>
                
                {/* 4. O NOVO BOTÃO DELETAR */}
                <br />
                <button 
                  onClick={() => handleDeletar(transacao.id)}
                  style={{ color: 'red', fontSize: '0.8em', padding: '2px 5px', marginTop: '5px' }}
                >
                  Deletar
                </button>
              </div>

              {/* Div da Direita (Data e Hora) - CORRIGIDO */}
              <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <span style={{ fontSize: '0.9em', color: '#555' }}>
                  {formatarData(transacao.dataOperacao)}
                </span>
              </div>
            </li>
          ))
        ) : (
          <p>Nenhuma transação encontrada.</p>
        )}
      </ul>

      {/* ... (Botão "Mostrar Todas" - sem mudança) ... */}
      {transacoesOrdenadas.length > 5 && (
        <button onClick={() => setMostrarTodas(!mostrarTodas)}>
          {mostrarTodas ? 'Mostrar menos' : `Mostrar todas (${transacoesOrdenadas.length})`}
        </button>
      )}
    </div>
  );
}

export default TransacoesPage;