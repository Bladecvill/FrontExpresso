// src/components/GerenciadorCategorias.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// --- Sub-componente para CADA item da lista ---
function CategoriaItem({ categoria }) {
  const { utilizador } = useAuth();
  const { refreshCategorias } = useData(); // Pega o refresh global

  const [isEditing, setIsEditing] = useState(false);
  const [nomeEditado, setNomeEditado] = useState(categoria.nome);

  // Função para SALVAR (PUT)
  const handleEdit = async () => {
    try {
      await axios.put(`${API_BASE_URL}/categorias/${categoria.id}`, {
        nome: nomeEditado,
        clienteId: utilizador.id // A API espera o clienteId no body
      });
      alert('Categoria atualizada!');
      setIsEditing(false);
      refreshCategorias(); // Atualiza a lista global
    } catch (error) {
      // O backend vai responder "Não é permitido atualizar uma categoria padrão."
      alert('Erro ao atualizar: ' + error.response.data);
    }
  };

  // Função para DELETAR (DELETE)
  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja deletar a categoria "${categoria.nome}"?`)) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/categorias/${categoria.id}`);
      alert('Categoria deletada!');
      refreshCategorias(); // Atualiza a lista global
    } catch (error) {
      // O backend vai responder "Não é permitido deletar uma categoria padrão."
      alert('Erro ao deletar: ' + error.response.data);
    }
  };

  return (
    <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '5px', borderBottom: '1px solid #eee' }}>
      {isEditing ? (
        <>
          {/* Modo de Edição */}
          <input 
            type="text" 
            value={nomeEditado} 
            onChange={(e) => setNomeEditado(e.target.value)}
          />
          <div>
            <button onClick={handleEdit} style={{ color: 'green' }}>Salvar</button>
            <button onClick={() => setIsEditing(false)} style={{ marginLeft: '5px' }}>Cancelar</button>
          </div>
        </>
      ) : (
        <>
          {/* Modo de Visualização */}
          <span>{categoria.nome}</span>
          <div>
            <button onClick={() => setIsEditing(true)}>Editar</button>
            <button onClick={handleDelete} style={{ color: 'red', marginLeft: '5px' }}>Deletar</button>
          </div>
        </>
      )}
    </li>
  );
}
// --- Fim do sub-componente ---


// --- Componente Principal (O Gerenciador) ---
function GerenciadorCategorias() {
  const { utilizador } = useAuth();
  const { categorias, refreshCategorias, loading } = useData(); // Pega dados do context

  // Estado para o formulário de "Adicionar"
  const [novoNome, setNovoNome] = useState('');

  // Função para ADICIONAR (POST)
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!novoNome) return;
    try {
      await axios.post(`${API_BASE_URL}/categorias`, {
        nome: novoNome,
        clienteId: utilizador.id
      });
      alert('Nova categoria adicionada!');
      setNovoNome('');
      refreshCategorias(); // Atualiza a lista global
    } catch (error) {
      // O backend vai responder "Categoria '...' já existe."
      alert('Erro ao adicionar: ' + error.response.data);
    }
  };

  if (loading) return <p>A carregar categorias...</p>;

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px' }}>
      <h4>Gerenciar Minhas Categorias</h4>

      {/* 1. Formulário de Adicionar (POST) */}
      <form onSubmit={handleAdd} style={{ display: 'flex', marginBottom: '15px' }}>
        <input 
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome da nova categoria"
          style={{ flex: 1, marginRight: '10px' }}
        />
        <button type="submit">Adicionar</button>
      </form>

      {/* 2. Lista de Categorias (com Edit/Delete) */}
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {categorias.length > 0 ? (
          categorias.map(cat => <CategoriaItem key={cat.id} categoria={cat} />)
        ) : (
          <p>Nenhuma categoria encontrada.</p>
        )}
      </ul>
    </div>
  );
}

export default GerenciadorCategorias;