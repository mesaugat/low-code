import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { select } from 'd3-selection';

function uniqueId(prefix = 'lowcode') {
  return `${prefix}${Math.random()}`;
}

const D3TreeMap = ({ data, tile }) => {
  const ref = useRef();

  useEffect(() => {
    const width = 928;
    const height = 1060;
    const color = d3.scaleSequential([8, 0], d3.interpolateMagma);

    // Create the treemap layout.
    const treemap = data => d3.treemap()
      .size([width, height])
      .paddingOuter(3)
      .paddingTop(19)
      .paddingInner(1)
      .round(true)
    (d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));
    const root = treemap(data);

    // Create the SVG container.
    const svg = select(ref.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;");

    const shadow = uniqueId("shadow");

    svg.append("filter")
        .attr("id", shadow)
      .append("feDropShadow")
        .attr("flood-opacity", 0.3)
        .attr("dx", 0)
        .attr("stdDeviation", 3);

    const node = svg.selectAll("g")
      .data(d3.group(root, d => 10))
      .join("g")
        .attr("filter", shadow)
      .selectAll("g")
      .data(d => d[1])
      .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`)

    const format = d3.format(",d");
    node.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${format(d.value)}`);

    node.append("rect")
        .attr("id", d => (d.nodeUid = uniqueId("node")))
        .attr("fill", d => color(d.height))
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    node.append("clipPath")
        .attr("id", d => (d.clipUid = uniqueId("clip")))
      .append("use")
        .attr("xlink:href", d => { console.log(d.nodeUid); return d.nodeUid.href; });

    node.append("text")
        .attr("clip-path", d => d.clipUid)
      .selectAll("tspan")
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
      .join("tspan")
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .text(d => d);

    node.filter(d => d.children).selectAll("tspan")
        .attr("dx", 3)
        .attr("y", 13);

    node.filter(d => !d.children).selectAll("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`);
  }, [data, tile]);

    return <svg ref={ref}></svg>;
};

export default D3TreeMap;
