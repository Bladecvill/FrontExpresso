// src/components/FormSacarDaMeta.jsx

import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Este componente recebe:
// clienteId: O ID do utilizador
// contasCorrente: A lista de contas (ex: Carteira, Nubank) para onde o dinheiro VAI
// metaOrigem: A meta (cofrinho) de onde o dinheiro VAI SAIR
// onTransferenciaFeita: A função de "refresh"
function FormSacarDaMeta({ clienteId, contasCorrente, metaOrigem, onTransferenciaFeita }) {

  const [valor, setValor] = useState('');
  const [contaDestinoId, setContaDestinoId] = useState(''); // O ID da conta-corrente de destino
  const [dataOperacao, setDataOperacao] = useState('');

  // Validação de Saldo da Meta (para o frontend)
  const saldoDisponivelNaMeta = metaOrigem.valorAtual;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const valorSaque = parseFloat(valor);

    if (!valorSaque || !contaDestinoId || !dataOperacao) {
      alert('Por favor, preencha todos os campos para sacar.');
      return;
    }

    // Validação de Saldo (Frontend)
    if (valorSaque > saldoDisponivelNaMeta) {
      alert(`Saldo insuficiente na meta! Você só pode sacar até R$ ${saldoDisponivelNaMeta.toFixed(2)}.`);
      return;
    }

    // A LÓGICA INVERSA
    const payload = {
      clienteId: clienteId,
      // Origem: O Cofrinho da Meta
      contaOrigemId: metaOrigem.contaAssociadaId, 
      // Destino: A Conta-Corrente selecionada
      contaDestinoId: contaDestinoId, 
      valor: valorSaque,
      dataOperacao: dataOperacao + ":00",
    };

    console.log('A sacar da meta:', payload);

    try {
      await axios.post(`${API_BASE_URL}/transferencias`, payload);
      alert('Valor sacado com sucesso!');

      // Chama a função "master refresh" do DataContext
      onTransferenciaFeita(); 

      setValor('');
      setContaDestinoId('');
      setDataOperacao('');
    } catch (error) {
      // O backend também vai validar o saldo (dupla segurança)
      console.error('Erro ao sacar da meta:', error.response.data);
      alert('Erro: ' + error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '10px', border: '1px dashed red', marginTop: '5px' }}>
      <strong>Sacar Dinheiro de "{metaOrigem.nome}"</strong>
      <p>(Disponível para saque: R$ {saldoDisponivelNaMeta.toFixed(2)})</p>

      <div>
        <label>Valor (R$): </label>
        <input 
          type="number" step="0.01" value={valor}
          max={saldoDisponivelNaMeta} // Define o máximo no input
          onChange={(e) => setValor(e.target.value)} required
        />
      </div>

      <div>
        <label>Data: </label>
        <input 
          type="datetime-local" value={dataOperacao}
          onChange={(e) => setDataOperacao(e.target.value)} required
        />
      </div>

      <div>
        <label>Para (Destino): </label>
        <select value={contaDestinoId} onChange={(e) => setContaDestinoId(e.target.value)} required>
          <option value="" disabled>Selecione uma conta...</option>
          {/* O dinheiro VAI PARA estas contas */}
          {contasCorrente.map(conta => (
            <option key={conta.id} value={conta.id}>
              {conta.nome} (Saldo: {conta.saldoAtual.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Sacar</button>
    </form>
  );
}

export default FormSacarDaMeta;