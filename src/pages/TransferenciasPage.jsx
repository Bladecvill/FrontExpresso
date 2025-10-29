// src/pages/TransferenciasPage.jsx

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import FormFazerTransferencia from '../components/FormFazerTransferencia';

// 1. NOVA FUNÇÃO DE AJUDA para formatar a data
function formatarData(dataISO) {
  if (!dataISO) return '';
  // Converte para o formato local (ex: 19/10/2025, 18:30)
  return new Date(dataISO).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function TransferenciasPage() {
  // ... (hooks e estados - sem mudança) ...
  const { 
    contas, 
    metas, 
    transacoes, 
    loading, 
    refreshAposTransferencia 
  } = useData();
  const { utilizador } = useAuth();
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // ... (lógica de useMemo - sem mudança) ...
  const transferenciasOrdenadas = useMemo(() => {
    return transacoes
      .filter(t => t.nomeCategoria === 'Transferências')
      .sort((a, b) => new Date(b.dataOperacao) - new Date(a.dataOperacao)); 
  }, [transacoes]);

  const visibleTransferencias = useMemo(() => {
    if (mostrarTodas) {
      return transferenciasOrdenadas;
    }
    return transferenciasOrdenadas.slice(0, 5);
  }, [mostrarTodas, transferenciasOrdenadas]);


  if (loading) {
    return <div>A carregar dados...</div>;
  }

  return (
    <div>
      <h2>Realizar Transferências</h2>
      {/* ... (formulário - sem mudança) ... */}
      <FormFazerTransferencia
        clienteId={utilizador.id}
        contasCorrente={contas}
        metas={metas}
        onTransferenciaFeita={refreshAposTransferencia}
      />

      <hr />

      <h3>Últimas Transferências Realizadas</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {visibleTransferencias.length > 0 ? (
          visibleTransferencias.map(transacao => (
            // 2. O <li> AGORA USA FLEXBOX
            <li 
              key={transacao.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', // Joga o conteúdo para as pontas
                alignItems: 'center', // Alinha verticalmente
                marginBottom: '10px',
                borderBottom: '1px solid #eee',
                paddingBottom: '10px'
              }}
            >
              {/* Div da Esquerda (Informações) */}
              <div>
                <strong>{transacao.descricao}</strong>
                <br />
                {transacao.valor > 0 ? (
                  <span style={{ color: 'green' }}> {/* Cor para clareza */}
                    Tipo: Entrada | Valor: R$ {transacao.valor.toFixed(2)}
                  </span>
                ) : (
                  <span style={{ color: 'red' }}> {/* Cor para clareza */}
                    Tipo: Saída | Valor: R$ {transacao.valor.toFixed(2)}
                  </span>
                )}
                <br />
                <span>(Conta: {transacao.nomeConta})</span>
              </div>

              {/* 3. Div da Direita (Data e Hora) */}
              <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <span style={{ fontSize: '0.9em', color: '#555' }}>
                  {formatarData(transacao.dataOperacao)}
                </span>
              </div>
            </li>
          ))
        ) : (
          <p>Nenhuma transferência encontrada.</p>
        )}
      </ul>

      {/* ... (botão "Mostrar todas" - sem mudança) ... */}
      {transferenciasOrdenadas.length > 5 && (
        <button onClick={() => setMostrarTodas(!mostrarTodas)}>
          {mostrarTodas ? 'Mostrar menos' : `Mostrar todas (${transferenciasOrdenadas.length})`}
        </button>
      )}

    </div>
  );
}

export default TransferenciasPage;