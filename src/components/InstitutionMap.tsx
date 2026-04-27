import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import * as topojson from 'topojson-client';
import { Institution } from '../data/institutions';

interface InstitutionMapProps {
  data: Institution[];
  selectedYear: number;
  highlightedId: string | null;
  onSelectInstitution: (id: string | null) => void;
}

export default function InstitutionMap({ 
  data, 
  selectedYear, 
  highlightedId,
  onSelectInstitution 
}: InstitutionMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [topoData, setTopoData] = useState<any>(null);

  // Load US Map Data
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(response => response.json())
      .then(json => setTopoData(json))
      .catch(err => console.error("Error loading map:", err));
  }, []);

  useEffect(() => {
    if (!topoData || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    // Projection
    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(width * 1.2);

    const path = d3.geoPath().projection(projection);

    // Draw points with small jitter for identical coordinates
    const activeData = data.filter(d => d.founded <= selectedYear).map((d, i, arr) => {
      // Find how many others have exact same coords
      const duplicates = arr.slice(0, i).filter(other => other.lat === d.lat && other.lng === d.lng).length;
      if (duplicates > 0) {
        // Apply a small spiral or random jitter
        const angle = duplicates * 0.5;
        const radius = duplicates * 0.001; // Scale factor for jitter
        return {
          ...d,
          lat: d.lat + Math.sin(angle) * (radius / 10),
          lng: d.lng + Math.cos(angle) * radius
        };
      }
      return d;
    });

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 15])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Draw states
    const states = topojson.feature(topoData, topoData.objects.states) as any;
    g.selectAll('path.state')
      .data(states.features)
      .join('path')
      .attr('class', 'state')
      .attr('d', path as any)
      .attr('fill', '#f8fafc') // slate-50
      .attr('stroke', '#cbd5e1') // slate-300
      .attr('stroke-width', 0.8);

    // Draw points
    const points = g.selectAll('circle.marker')
      .data(activeData, (d: any) => d.id)
      .join(
        enter => enter.append('circle')
          .attr('class', 'marker')
          .attr('cx', d => projection([d.lng, d.lat])?.[0] || 0)
          .attr('cy', d => projection([d.lng, d.lat])?.[1] || 0)
          .attr('r', 0)
          .attr('fill', d => getTypeColor(d.type))
          .attr('fill-opacity', 0.7)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .call(enter => enter.transition().duration(500).attr('r', d => d.id === highlightedId ? 10 : 5)),
        update => update
          .transition()
          .duration(300)
          .attr('cx', d => projection([d.lng, d.lat])?.[0] || 0)
          .attr('cy', d => projection([d.lng, d.lat])?.[1] || 0)
          .attr('r', d => d.id === highlightedId ? 10 : 5)
          .attr('fill-opacity', d => d.id === highlightedId ? 1 : 0.7)
          .attr('stroke-width', d => d.id === highlightedId ? 2 : 1),
        exit => exit.transition().duration(300).attr('r', 0).remove()
      );

    // Click behavior
    points.on('click', function(event, d) {
      event.stopPropagation();
      onSelectInstitution(d.id);
    });

    // Auto-zoom to selection (handles external selection like sidebar)
    if (highlightedId) {
      const selected = activeData.find(d => d.id === highlightedId);
      if (selected) {
        const coords = projection([selected.lng, selected.lat]);
        if (coords) {
          const [x, y] = coords;
          const scale = 8;
          const transform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(scale)
            .translate(-x, -y);

          svg.transition()
            .duration(750)
            .ease(d3.easeCubicInOut)
            .call(zoom.transform, transform);
        }
      }
    } else {
      // Zoom back if selection cleared
      svg.transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, d3.zoomIdentity);
    }

    // Interaction handlers
    svg.on('click', () => onSelectInstitution(null));

    points.on('mouseover', function(event, d) {
      if (d.id === highlightedId) return;
      d3.select(this)
        .transition()
        .duration(150)
        .attr('r', 8)
        .attr('fill-opacity', 1);
    });

    points.on('mouseout', function(event, d) {
      if (d.id !== highlightedId) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 5)
          .attr('fill-opacity', 0.7);
      }
    });

  }, [topoData, data, selectedYear, highlightedId, onSelectInstitution]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm pointer-events-none">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Legend</h3>
        <div className="space-y-1.5">
          {['Newspaper', 'Theater', 'School', 'Organization'].map(type => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTypeColor(type as any) }} />
              <span className="text-xs text-slate-700">{type}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-[10px] text-slate-400 border border-slate-100">
        Click to select • Scroll to zoom
      </div>
    </div>
  );
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'Newspaper': return '#ef4444'; // red-500
    case 'Theater': return '#8b5cf6'; // violet-500
    case 'School': return '#059669'; // emerald-600
    case 'Organization': return '#3b82f6'; // blue-500
    default: return '#64748b'; // slate-500
  }
}
