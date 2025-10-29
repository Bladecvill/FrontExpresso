// src/components/FormCriarTransacao.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useData } from '../context/DataContext'; // 1. IMPORTAR o useData

const API_BASE_URL = 'http://localhost:8080/api';

// O componente agora precisa de TODAS as categorias e da função de refresh
function FormCriarTransacao({ clienteId, contas, categorias, onTransacaoCriada }) {

  // 2. PEGAR O REFRESH DE CATEGORIAS DO CONTEXTO
  const { refreshCategorias } = useData();

  // --- Estados do Formulário ---
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('DESPESA');
  const [dataOperacao, setDataOperacao] = useState('');
  const [contaId, setContaId] = useState('');

  // --- A NOVA LÓGICA DE CATEGORIA ---
  const [categoriaId, setCategoriaId] = useState(''); // Guarda o ID da categoria selecionada
  const [novaCategoriaNome, setNovaCategoriaNome] = useState(''); // Guarda o NOME da nova categoria
  const [isCreatingCategoria, setIsCreatingCategoria] = useState(false); // Controla a UI

  // Função chamada quando o <select> de categoria muda
  const handleCategoriaChange = (e) => {
    const valorSelecionado = e.target.value;
    if (valorSelecionado === '___NOVA___') {
      // O utilizador quer criar uma nova
      setIsCreatingCategoria(true);
      setCategoriaId(''); // Limpa o ID
    } else {
      // O utilizador selecionou uma existente
      setIsCreatingCategoria(false);
      setCategoriaId(valorSelecionado); // Guarda o ID
    }
  };

  // --- Função de Submissão Atualizada ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validação
    if (!valor || !contaId || !dataOperacao) {
      alert('Por favor, preencha Valor, Conta e Data.');
      return;
    }

    let categoriaIdFinal = categoriaId; // Começa com o ID do <select>

    // --- LÓGICA DE CRIAR CATEGORIA (se necessário) ---
    if (isCreatingCategoria) {
      if (!novaCategoriaNome) {
        alert('Por favor, preencha o nome da nova categoria.');
        return;
      }

      try {
        // 1. CHAMA A API PARA CRIAR A CATEGORIA
        console.log('A criar nova categoria:', novaCategoriaNome);
        const payloadCategoria = {
          nome: novaCategoriaNome,
          clienteId: clienteId
        };
        const response = await axios.post(`${API_BASE_URL}/categorias`, payloadCategoria);

        // 2. Pega o ID da categoria que acabou de ser criada
        categoriaIdFinal = response.data.id; 

        // 3. Manda o DataContext recarregar a lista de categorias
        refreshCategorias(); 

      } catch (error) {
        console.error('Erro ao criar categoria:', error.response.data);
        alert('Erro ao criar categoria: ' + error.response.data);
        return; // Para a execução se a categoria falhar
      }
    } else {
      // Se não está a criar, valida se selecionou uma
      if (!categoriaIdFinal) {
        alert('Por favor, selecione uma categoria.');
        return;
      }
    }

    // --- LÓGICA DE CRIAR TRANSAÇÃO (como antes) ---

    let valorFinal = parseFloat(valor);
    if (tipo === 'DESPESA') {
      valorFinal = valorFinal * -1;
    }

    const payloadTransacao = {
      clienteId: clienteId,
      contaId: contaId,
      categoriaId: categoriaIdFinal, // Usa o ID (antigo ou o recém-criado)
      descricao: descricao,
      valor: valorFinal,
      dataOperacao: dataOperacao + ":00"
    };

    console.log('A enviar transação:', payloadTransacao);

    try {
      // 4. CHAMA A API DE TRANSAÇÕES
      await axios.post(`${API_BASE_URL}/transacoes`, payloadTransacao);

      alert('Transação criada com sucesso!');

      // 5. CHAMA A FUNÇÃO DO "PAI" (DashboardPage)
      onTransacaoCriada(); 

      // 6. Limpa o formulário inteiro
      setDescricao('');
      setValor('');
      setDataOperacao('');
      setContaId('');
      setCategoriaId('');
      setTipo('DESPESA');
      setIsCreatingCategoria(false);
      setNovaCategoriaNome('');

    } catch (error) {
      console.error('Erro ao criar transação:', error.response.data);
      alert('Erro ao criar transação: ' + error.response.data);
    }
  };

  // O HTML (JSX) do formulário
  return (
    <form onSubmit={handleSubmit}>
      <h4>Adicionar Receita ou Despesa</h4>

      {/* ... (campos Descrição, Valor, Tipo, Data - sem mudança) ... */}
      <div>
        <label>Descrição: </label>
        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>
      <div>
        <label>Valor (R$): </label>
        <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
      </div>
      <div>
        <label>Tipo: </label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="DESPESA">Despesa</option>
          <option value="RECEITA">Receita</option>
        </select>
      </div>
      <div>
        <label>Data e Hora: </label>
        <input type="datetime-local" value={dataOperacao} onChange={(e) => setDataOperacao(e.target.value)} required />
      </div>

      {/* ... (campo Conta - sem mudança) ... */}
      <div>
        <label>Conta: </label>
        <select value={contaId} onChange={(e) => setContaId(e.target.value)} required>
          <option value="" disabled>Selecione uma conta...</option>
          {contas.map(conta => (
            <option key={conta.id} value={conta.id}>
              {conta.nome} (Saldo: {conta.saldoAtual.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      {/* --- CAMPO DE CATEGORIA ATUALIZADO --- */}
      <div>
        <label>Categoria: </label>

        {/* Mostra o <input> ou o <select> */}
        {isCreatingCategoria ? (
          <div>
            <input 
              type="text"
              placeholder="Nome da nova categoria..."
              value={novaCategoriaNome}
              onChange={(e) => setNovaCategoriaNome(e.target.value)}
            />
            <button typeonClick={() => setIsCreatingCategoria(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <select value={categoriaId} onChange={handleCategoriaChange} required>
            <option value="" disabled>Selecione uma categoria...</option>
            {/* Loop nas categorias existentes */}
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
            {/* A OPÇÃO MÁGICA (o que você pediu) */}
            <option value="___NOVA___">+ Nova Categoria...</option>
          </select>
        )}
      </div>
      {/* Fim do campo de Categoria */}

      <button type="submit">Adicionar Transação</button>
    </form>
  );
}

export default FormCriarTransacao;