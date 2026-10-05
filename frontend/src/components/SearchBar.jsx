function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar productos..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button 
            className="clear-button"
            onClick={() => onChange('')}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBar
