import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';

let idCounter = 0;

function uniqueId(prefix = '') {
  idCounter++;
  return `${prefix}${idCounter}`;
}

const D3TreeMap = ({ data, tile }) => {
  const ref = useRef();

  useEffect(() => {
    const width = 1154;
    const height = 1154;
    const color = d3.scaleOrdinal(
      data.children.map((d) => d.name),
      d3.schemeTableau10
    );
    const root = d3.treemap().tile(tile).size([width, height]).padding(1).round(true)(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value)
    );

    const svg = select(ref.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

    const leaf = svg
      .selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    const format = d3.format(',d');
    leaf.append('title').text(
      (d) =>
        `${d
          .ancestors()
          .reverse()
          .map((d) => d.data.name)
          .join('.')}\n${format(d.value)}`
    );

    leaf
      .append('rect')
      .attr('fill', (d) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr('fill-opacity', 0.6)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0);

    leaf
      .append('clipPath')
      .attr('id', (d) => (d.clipUid = uniqueId('clip')))
      .append('use')
      .attr('xlink:href', (d) => 'asd');

    leaf
      .append('text')
      .attr('clip-path', (d) => d.clipUid)
      .selectAll('tspan')
      .data((d) => d.data.name.split(/(?=[A-Z][a-z])|\s+/g).concat(format(d.value)))
      .join('tspan')
      .attr('x', 3)
      .attr('y', (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
      .attr('fill-opacity', (d, i, nodes) => (i === nodes.length - 1 ? 0.7 : null))
      .text((d) => d);
  }, [data, tile]);

  return <svg ref={ref}></svg>;
};

export default D3TreeMap;
