export default function PortfolioFilter({ portfolios, selected, onSelect }) {
  return (
    <div className="portfolio-filter">
      <label htmlFor="portfolio-select">Portfolio: </label>
      <select
        className="portfolio-select"
        id="portfolio-select"
        onChange={e => onSelect(e.target.value)}
        value={selected || 'All'}
      >
        <option value="All">All</option>
        {portfolios.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
}
