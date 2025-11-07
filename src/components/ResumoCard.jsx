// src/components/ResumoCard.jsx

import React from 'react';

function ResumoCard({ 
  title, 
  valor, 
  color, 
  isExpanded, 
  onToggle, 
  breakdownMap,
  breakdownKey
}) {

  // Mantemos a cor como uma variável CSS para o valor
  const valorStyle = {
    color: color
  };

  return (
    // Aplicamos a classe CSS principal
    <div className="resumo-card" onClick={onToggle}>
      
      <h3>{title}</h3>
      <p className="resumo-card-valor" style={valorStyle}>
        R$ {valor.toFixed(2)}
      </p>

      {/* O "Breakdown" que expande */}
      {isExpanded && (
        <div className="resumo-card-breakdown">
          <h4>Detalhes por Conta:</h4>
          
          {/* Converte o Map para um Array e renderiza */}
          {Array.from(breakdownMap.entries()).map(([contaNome, data]) => (
            <div className="breakdown-item" key={contaNome}>
              <span>{contaNome}:</span>
              <strong>R$ {data[breakdownKey].toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumoCard;