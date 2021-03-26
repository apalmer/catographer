var graph = {
    nodes: [
        { id: "Myriel" },
        { id: "Napoleon" },
        { id: "Mlle.Baptistine" },
        { id: "Mme.Magloire" },
        { id: "CountessdeLo" }
    ],
    links: [
        { source: "Myriel", target: "Napoleon", type: "licensing" },
        { source: "Myriel", target: "Mlle.Baptistine", type: "resolved" },
        { source: "Mme.Magloire", target: "Myriel", type: "suit" },
        { source: "Mme.Magloire", target: "CountessdeLo", type: "licensing" }
    ]
};

types = Array.from(new Set(graph.links.map(d => d.type)))

color = d3.scaleOrdinal(types, d3.schemeCategory10)

linkArc = d => `M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`

drag = simulation => {

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

const simulation = d3.forceSimulation(graph.nodes)
    .force("link", d3.forceLink(graph.links).id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force('collide', d3.forceCollide(d => 65))

var width = 960,
    height = 500;

var svg = d3.select("main .graph").append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])

svg.append("defs").selectAll("marker")
    .data(types)
    .join("marker")
    .attr("id", d => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 38)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", color)
    .attr("d", 'M0,-5L10,0L0,5');

const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("stroke", d => color(d.type))
    .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

const node = svg.append("g")
    .attr("fill", "currentColor")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .selectAll("g")
    .data(graph.nodes)
    .join("g")
    .call(drag(simulation));

node.append("circle")
    .attr("stroke", "white")
    .attr("stroke-width", 1.5)
    .attr("r", 25)
    .attr('fill', d => '#6baed6');

node.append("text")
    .attr("x", 30 + 4)
    .attr("y", "0.31em")
    .text(d => d.id)
    .clone(true).lower()
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 3);

node.on('dblclick', (e, d) => console.log(nodes[d.index]))

simulation.on("tick", () => {
    link.attr("d", linkArc);
    node.attr("transform", d => `translate(${d.x},${d.y})`);
});
