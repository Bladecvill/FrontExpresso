// src/components/FormFazerTransferencia.jsx

import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Este componente recebe:
// - clienteId: O ID do utilizador
// - contasCorrente: A lista de contas (ex: Carteira, Nubank)
// - metas: A lista de metas (ex: Viagem)
// - onTransferenciaFeita: A função de "refresh"
function FormFazerTransferencia({ clienteId, contasCorrente, metas, onTransferenciaFeita }) {

  // Estado interno do formulário
  const [valor, setValor] = useState('');
  const [dataOperacao, setDataOperacao] = useState('');
  const [contaOrigemId, setContaOrigemId] = useState('');
  const [contaDestinoId, setContaDestinoId] = useState(''); // O ID da conta/meta de destino

  // Função chamada ao submeter o formulário
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!valor || !dataOperacao || !contaOrigemId || !contaDestinoId) {
      alert('Por favor, preencha todos os campos da transferência.');
      return;
    }

    // Monta o payload para enviar para a API de Transferências
    const payload = {
      clienteId: clienteId,
      contaOrigemId: contaOrigemId,
      contaDestinoId: contaDestinoId,
      valor: parseFloat(valor), // Valor é sempre positivo
      dataOperacao: dataOperacao + ":00", // Adiciona segundos
    };

    console.log('A enviar transferência:', payload);

    try {
      // Chama o endpoint POST /api/transferencias
      await axios.post(`${API_BASE_URL}/transferencias`, payload);

      alert('Transferência realizada com sucesso!');

      // Chama a função de "refresh" do Pai (Dashboard)
      // para atualizar saldos, metas e transações!
      onTransferenciaFeita(); 

      // Limpa o formulário
      setValor('');
      setDataOperacao('');
      setContaOrigemId('');
      setContaDestinoId('');

    } catch (error) {
      console.error('Erro ao realizar transferência:', error.response.data);
      // O backend vai dar "Saldo insuficiente" se for o caso
      alert('Erro ao realizar transferência: ' + error.response.data);
    }
  };

  // O HTML (JSX) do formulário
  return (
    <form onSubmit={handleSubmit}>
      <h4>Fazer Transferência (ou Guardar na Meta)</h4>

      <div>
        <label>Valor (R$): </label>
        <input 
          type="number"
          step="0.01"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Data e Hora: </label>
        <input 
          type="datetime-local"
          value={dataOperacao}
          onChange={(e) => setDataOperacao(e.target.value)}
          required
        />
      </div>

      <div>
        <label>De (Origem): </label>
        <select value={contaOrigemId} onChange={(e) => setContaOrigemId(e.target.value)} required>
          <option value="" disabled>Selecione uma conta de origem...</option>
          {/* Loop nas contasCorrente (ex: Carteira) */}
          {contasCorrente.map(conta => (
            <option key={conta.id} value={conta.id}>
              {conta.nome} (Saldo: {conta.saldoAtual.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Para (Destino): </label>
        <select value={contaDestinoId} onChange={(e) => setContaDestinoId(e.target.value)} required>
          <option value="" disabled>Selecione um destino...</option>

          {/* Opções de Contas Corrente (exclui a origem) */}
          {contasCorrente
            .filter(conta => conta.id !== contaOrigemId) // Não transferir para si mesmo
            .map(conta => (
            <option key={conta.id} value={conta.id}>
              Conta: {conta.nome}
            </option>
          ))}

          {/* Opções de Metas (Cofrinhos) */}
          {metas.map(meta => (
            // O VALOR é o ID da CONTA-COFRINHO associada!
            <option key={meta.id} value={meta.contaAssociadaId}>
              Meta: {meta.nome} (Guardado: {meta.valorAtual.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Transferir</button>
    </form>
  );
}

export default FormFazerTransferencia;