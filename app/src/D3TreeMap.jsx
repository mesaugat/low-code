import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Function to generate a unique ID
function uniqueId(prefix = 'lowcode') {
  return `${prefix}${Math.random()}`;
}

const D3TreeMap = ({ data, tile }) => {
  // Create a reference to the SVG element
  const ref = useRef();

  useEffect(() => {
    // Define the dimensions of the treemap
    const width = 1100;
    const height = 720;

    // Create a color scale
    const color = d3.scaleOrdinal(
      data.children.map((d) => d.name),
      d3.schemeTableau10,
    );

    // Create the treemap layout
    const treemap = (data) =>
      d3.treemap().tile(tile).size([width, height]).paddingOuter(3).paddingTop(19).paddingInner(1).round(true)(
        d3
          .hierarchy(data)
          .sum((d) => d.value)
          .sort((a, b) => b.value - a.value),
      );
    const root = treemap(data);

    // Create the SVG container
    const svg = d3
      .select(ref.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;');

    // Create a shadow filter
    const shadow = uniqueId('shadow');
    svg
      .append('filter')
      .attr('id', shadow)
      .append('feDropShadow')
      .attr('flood-opacity', 0.3)
      .attr('dx', 0)
      .attr('stdDeviation', 3);

    // Create the nodes of the treemap
    const node = svg
      .selectAll('g')
      .data(d3.group(root, (d) => 10))
      .join('g')
      .attr('filter', shadow)
      .selectAll('g')
      .data((d) => d[1])
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    // Format the numbers
    const format = d3.format(',d');

    // Add a title to each node
    node.append('title').text(
      (d) =>
        `${d
          .ancestors()
          .reverse()
          .map((d) => d.data.name.split('.git')[0])
          .join('/')}\n${format(d.value)} ${d.value == 1 ? d.data.unit : d.data.unit + 's'}`,
    );

    // Add a rectangle to each node
    node
      .append('rect')
      .attr('id', (d) => (d.nodeUid = uniqueId('node')))
      .attr('fill', (d) => color(d.height))
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).transition().duration(150).style('opacity', '0.7');
      })
      .on('mouseout', function (event, d) {
        d3.select(this).transition().duration(150).style('opacity', '1');
      })
      .on('click', function (event, d) {
        if (d.data.url === undefined && 'URLSearchParams' in window) {
          const searchParams = new URLSearchParams(window.location.search);
          searchParams.set('base_path', d.data.name);
          window.location.search = searchParams.toString();
        }
        window.open(`https://${d.data.url}`, '_blank');
      });

    // Add a clipping path to each node
    node
      .append('clipPath')
      .attr('id', (d) => (d.clipUid = uniqueId('clip')))
      .append('use')
      .attr('xlink:href', (d) => `#${d.nodeUid}`);

    // Add text to each node
    node
      .append('text')
      .attr('clip-path', (d) => `url(#${d.clipUid})`)
      .attr('cursor', 'pointer')
      .selectAll('tspan')
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
      .join('tspan')
      .attr('fill-opacity', (d, i, nodes) => (i === nodes.length - 1 ? 7 : null))
      .text((d) => d);

    // Adjust the position of the text in the nodes
    node
      .filter((d) => d.children)
      .selectAll('tspan')
      .attr('dx', 3)
      .attr('y', 13);
    node
      .filter((d) => !d.children)
      .selectAll('tspan')
      .attr('x', 3)
      .attr('y', (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`);
  }, [data, tile]);

  // Render the SVG element
  return <svg ref={ref}></svg>;
};

export default D3TreeMap;
