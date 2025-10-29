// src/components/FormGuardarNaMeta.jsx

import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Este componente recebe muitas props!
function FormGuardarNaMeta({ clienteId, contasCorrente, metaDestino, onTransferenciaFeita }) {

  const [valor, setValor] = useState('');
  const [contaOrigemId, setContaOrigemId] = useState('');
  const [dataOperacao, setDataOperacao] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!valor || !contaOrigemId || !dataOperacao) {
      alert('Por favor, preencha todos os campos para guardar.');
      return;
    }

    // O destino já está definido (é a 'metaDestino' que recebemos)
    const payload = {
      clienteId: clienteId,
      contaOrigemId: contaOrigemId,
      contaDestinoId: metaDestino.contaAssociadaId, // O ID da conta-cofrinho!
      valor: parseFloat(valor),
      dataOperacao: dataOperacao + ":00",
    };

    console.log('A guardar na meta:', payload);

    try {
      await axios.post(`${API_BASE_URL}/transferencias`, payload);
      alert('Dinheiro guardado com sucesso!');

      // Chama a função "master refresh" do DataContext
      onTransferenciaFeita(); 

      setValor('');
      setContaOrigemId('');
      setDataOperacao('');
    } catch (error) {
      console.error('Erro ao guardar na meta:', error.response.data);
      alert('Erro: ' + error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '10px', border: '1px dashed gray', marginTop: '5px' }}>
      <strong>Guardar Dinheiro para "{metaDestino.nome}"</strong>

      <div>
        <label>Valor (R$): </label>
        <input 
          type="number" step="0.01" value={valor}
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
        <label>De (Origem): </label>
        <select value={contaOrigemId} onChange={(e) => setContaOrigemId(e.target.value)} required>
          <option value="" disabled>Selecione uma conta...</option>
          {contasCorrente.map(conta => (
            <option key={conta.id} value={conta.id}>
              {conta.nome} (Saldo: {conta.saldoAtual.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Guardar</button>
    </form>
  );
}

export default FormGuardarNaMeta;