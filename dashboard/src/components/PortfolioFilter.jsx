import React from 'react';

export default function PortfolioFilter({ portfolios, selected, onSelect }) {
  return (
    <div className="portfolio-filter">
      <label htmlFor="portfolio-select">Portfolio: </label>
      <select
        id="portfolio-select"
        className="portfolio-select"
        value={selected || ''}
        onChange={e => onSelect(e.target.value)}
      >
        <option value="">All</option>
        {portfolios.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
} 