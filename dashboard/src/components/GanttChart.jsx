import { useState } from "react";

const GanttChart = ({ project, bars, onGroupToggle, groupExpanded }) => {
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="gantt-chart">
      <div className="gantt-header">
        <h2>{project.name}</h2>
        <p>{project.description}</p>
      </div>

      <div className="gantt-timeline">
        <div className="gantt-axis">
          {/* Timeline axis labels */}
        </div>

        <div className="gantt-bars">
          {bars.length === 0 && <div className="no-data-message">No data to display</div>}
          {bars.map((bar) => (
            <div
              key={bar.id}
              className="gantt-bar"
              tabIndex={0}
              aria-label={`Timeline for ${bar.label}`}
              onMouseEnter={e => setTooltip({ x: e.clientX, y: e.clientY, bar })}
              onMouseLeave={() => setTooltip(null)}
              onFocus={e => setTooltip({ x: e.target.getBoundingClientRect().left, y: e.target.getBoundingClientRect().bottom, bar })}
              onBlur={() => setTooltip(null)}
              style={{ left: bar.left, width: bar.width, background: bar.color }}
            >
              {/* Bar content, e.g. status color */}
              {tooltip && tooltip.bar.id === bar.id && (
                <div className="gantt-bar-tooltip" style={{ left: 0, top: 32 }}>
                  <div><strong>{bar.label}</strong></div>
                  <div>Status: {bar.status}</div>
                  <div>Start: {bar.start}</div>
                  <div>End: {bar.end}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add group collapse/expand support via props */}
      {typeof onGroupToggle === 'function' && (
        <button onClick={onGroupToggle} className="collapse-expand-btn">
          {groupExpanded ? 'Collapse Group' : 'Expand Group'}
        </button>
      )}
      {/* Add legend improvements here if needed */}
    </div>
  );
};

export default GanttChart; 