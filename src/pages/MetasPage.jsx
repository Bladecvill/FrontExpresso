// src/pages/MetasPage.jsx

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import FormCriarMeta from '../components/FormCriarMeta';
import FormGuardarNaMeta from '../components/FormGuardarNaMeta';
import FormSacarDaMeta from '../components/FormSacarDaMeta'; // 1. IMPORTAR O NOVO FORMULÁRIO
import ProgressBar from '../components/ProgressBar';

// Componente "Item da Meta" - ATUALIZADO
function MetaItem({ meta, contasCorrente, clienteId, onTransferenciaFeita }) {

  // 2. LÓGICA DE ESTADO ATUALIZADA
  // 'nenhum', 'guardar', 'sacar'
  const [formAberto, setFormAberto] = useState('nenhum');

  // Calcula o percentual
  const percentual = (meta.valorAtual / meta.valorAlvo) * 100;

  // Funções para alternar os formulários
  const toggleGuardar = () => {
    setFormAberto(formAberto === 'guardar' ? 'nenhum' : 'guardar');
  };

  const toggleSacar = () => {
    setFormAberto(formAberto === 'sacar' ? 'nenhum' : 'sacar');
  };

  return (
    <li style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '15px' }}>
      {/* 1. Detalhes da Meta (sem mudança) */}
      <h3>{meta.nome}</h3>
      <p>
        Guardado: R$ {meta.valorAtual.toFixed(2)} / 
        Alvo: R$ {meta.valorAlvo.toFixed(2)}
      </p>
      <p>Data Alvo: {meta.dataAlvo}</p>

      {/* 2. Barra de Progresso (sem mudança) */}
      <ProgressBar percentual={percentual} />

      {/* 3. BOTÕES DE AÇÃO ATUALIZADOS */}
      <button onClick={toggleGuardar} disabled={formAberto === 'sacar'}>
        {formAberto === 'guardar' ? 'Cancelar' : 'Adicionar Dinheiro'}
      </button>

      <button onClick={toggleSacar} disabled={formAberto === 'guardar'}>
        {formAberto === 'sacar' ? 'Cancelar Saque' : 'Sacar Valor'}
      </button>
      {/* TODO: Adicionar botões de Editar/Deletar */}

      {/* 4. FORMULÁRIOS CONDICIONAIS */}

      {/* Formulário de "Guardar Dinheiro" */}
      {formAberto === 'guardar' && (
        <FormGuardarNaMeta 
          clienteId={clienteId}
          contasCorrente={contasCorrente}
          metaDestino={meta}
          onTransferenciaFeita={() => {
            onTransferenciaFeita();
            setFormAberto('nenhum'); // Fecha o form após sucesso
          }}
        />
      )}

      {/* NOVO: Formulário de "Sacar Dinheiro" */}
      {formAberto === 'sacar' && (
        <FormSacarDaMeta
          clienteId={clienteId}
          contasCorrente={contasCorrente}
          metaOrigem={meta} // A meta é a ORIGEM
          onTransferenciaFeita={() => {
            onTransferenciaFeita();
            setFormAberto('nenhum'); // Fecha o form após sucesso
          }}
        />
      )}
    </li>
  );
}


// --- A Página Principal de Metas (sem mudanças, exceto pelo import) ---
function MetasPage() {
  const { 
    contas, 
    metas, 
    loading, 
    refreshMetas, 
    refreshAposTransferencia 
  } = useData();
  const { utilizador } = useAuth();
  const [mostrarFormCriar, setMostrarFormCriar] = useState(false);

  const metasOrdenadas = useMemo(() => {
    return [...metas].sort((a, b) => {
      const percentualA = (a.valorAtual / a.valorAlvo) * 100;
      const percentualB = (b.valorAtual / b.valorAlvo) * 100;
      return percentualB - percentualA; 
    });
  }, [metas]);

  if (loading) {
    return <div>A carregar dados...</div>;
  }

  return (
    <div>
      <h2>Gestão de Metas (Cofrinhos)</h2>

      {/* Botão "Incluir nova meta" (sem mudança) */}
      <button onClick={() => setMostrarFormCriar(!mostrarFormCriar)}>
        {mostrarFormCriar ? 'Fechar Formulário' : 'Incluir Nova Meta'}
      </button>

      {/* Formulário "Criar Meta" (sem mudança) */}
      {mostrarFormCriar && (
        <FormCriarMeta 
          clienteId={utilizador.id}
          onMetaCriada={() => {
            refreshMetas();
            setMostrarFormCriar(false);
          }}
        />
      )}

      <hr />

      {/* Lista de Metas (sem mudança) */}
      <h3>As Minhas Metas</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {metasOrdenadas.length > 0 ? (
          metasOrdenadas.map(meta => (
            <MetaItem 
              key={meta.id}
              meta={meta}
              contasCorrente={contas}
              clienteId={utilizador.id}
              onTransferenciaFeita={refreshAposTransferencia} // O "master refresh"
            />
          ))
        ) : (
          <p>Nenhuma meta encontrada.</p>
        )}
      </ul>

    </div>
  );
}

export default MetasPage;