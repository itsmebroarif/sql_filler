// ==========================================
// D3.JS ERD VISUALIZER
// ==========================================

const ERD_NODE_WIDTH = 240;
const ERD_HEADER_HEIGHT = 34;
const ERD_ROW_HEIGHT = 24;
const ERD_FOOTER_HEIGHT = 24;
const ERD_GAP_X = 100;
const ERD_GAP_Y = 80;

function erdNodeHeight(table) {
    const body = Math.max(table.columns.length, 1) * ERD_ROW_HEIGHT;
    return ERD_HEADER_HEIGHT + body + ERD_FOOTER_HEIGHT;
}

function buildErdNodes(tables) {
    const perRow = Math.max(1, Math.ceil(Math.sqrt(tables.length)));
    let maxHeight = 0;
    const nodes = tables.map((t, i) => {
        const height = erdNodeHeight(t);
        maxHeight = Math.max(maxHeight, height);
        return {
            id: i,
            name: t.name,
            columns: t.columns || [],
            rowsCount: (t.rows || []).length,
            width: ERD_NODE_WIDTH,
            height
        };
    });
    nodes.forEach((n, i) => {
        n.x = 60 + (i % perRow) * (ERD_NODE_WIDTH + ERD_GAP_X);
        n.y = 60 + Math.floor(i / perRow) * (maxHeight + ERD_GAP_Y);
    });
    return nodes;
}

function buildErdLinks(tables) {
    const links = [];
    const seen = new Set();
    tables.forEach((t, i) => {
        (t.columns || []).forEach(c => {
            const colName = (c.name || "").toLowerCase();
            if (!colName.endsWith("_id")) return;
            const refName = colName.slice(0, -3);
            const targetIdx = tables.findIndex(tbl => {
                const n = tbl.name.toLowerCase();
                return n === refName || n === refName + "s" || n === refName + "es";
            });
            const key = `${i}->${targetIdx}`;
            if (targetIdx !== -1 && targetIdx !== i && !seen.has(key)) {
                seen.add(key);
                links.push({ source: i, target: targetIdx });
            }
        });
    });
    return links;
}

function erdNodeCenter(node) {
    return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

function renderD3ERD() {
    const container = d3.select("#erd-canvas");
    container.selectAll("*").remove();

    const db = getCurrentDatabase();
    if (!db || !db.tables || db.tables.length === 0) {
        container.html('<div class="d-flex align-items-center justify-content-center h-100 text-muted fs-8">Tidak ada tabel untuk visualisasi ERD.</div>');
        return;
    }

    const canvasEl = document.getElementById("erd-canvas");
    // Fallback berlapis: canvas -> parent -> default (saat display:none semuanya 0)
    const width = canvasEl.clientWidth
        || (canvasEl.parentElement ? canvasEl.parentElement.clientWidth : 0)
        || 800;
    const height = canvasEl.clientHeight
        || (canvasEl.parentElement ? canvasEl.parentElement.clientHeight : 0)
        || 500;

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", Math.max(height, 500))
        .style("background-color", "#0f172a")
        .style("border-radius", "8px");

    const g = svg.append("g");

    // Zoom & pan: handler menempel ke elemen <svg> yang menerima event pointer
    svg.call(
        d3.zoom()
            .scaleExtent([0.2, 3])
            .on("zoom", (event) => g.attr("transform", event.transform))
    );

    const nodes = buildErdNodes(db.tables);
    const links = buildErdLinks(db.tables);

    // Links digambar lebih dulu agar berada di belakang node
    const linkSel = g.selectAll("line.erd-link")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "erd-link")
        .attr("stroke", "#bb86fc")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,4");

    const nodeSel = g.selectAll("g.node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        .style("cursor", "grab");

    // Drag node: update posisi node & endpoints link
    nodeSel.call(
        d3.drag()
            .on("start", function () { d3.select(this).style("cursor", "grabbing"); })
            .on("drag", function (event, d) {
                d.x = event.x;
                d.y = event.y;
                d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);
                updateErdLinks(linkSel, nodes);
            })
            .on("end", function () { d3.select(this).style("cursor", "grab"); })
    );

    // Bingkai node
    nodeSel.append("rect")
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "#1e293b")
        .attr("stroke", "#6200ee")
        .attr("stroke-width", 2);

    // Header node
    nodeSel.append("rect")
        .attr("width", d => d.width)
        .attr("height", ERD_HEADER_HEIGHT)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "#6200ee");

    nodeSel.append("text")
        .attr("x", 10)
        .attr("y", 22)
        .attr("font-size", "13px")
        .attr("font-weight", "700")
        .attr("fill", "#ffffff")
        .text(d => d.name);

    // Daftar kolom
    nodeSel.each(function (d) {
        const group = d3.select(this);
        const rows = group.selectAll("text.col")
            .data(d.columns.length ? d.columns : [{ name: "(no columns)", type: "" }])
            .enter();
        rows.append("text")
            .attr("class", "col")
            .attr("x", 10)
            .attr("y", (c, i) => ERD_HEADER_HEIGHT + 16 + i * ERD_ROW_HEIGHT)
            .attr("font-size", "11px")
            .attr("fill", "#c9d1d9")
            .text(c => (c.pk ? "PK  " : "     ") + c.name);
        rows.append("text")
            .attr("class", "col")
            .attr("x", d.width - 10)
            .attr("text-anchor", "end")
            .attr("y", (c, i) => ERD_HEADER_HEIGHT + 16 + i * ERD_ROW_HEIGHT)
            .attr("font-size", "10px")
            .attr("fill", "#94a3b8")
            .text(c => c.type || "");
    });

    // Footer jumlah record
    nodeSel.append("text")
        .attr("x", 10)
        .attr("y", d => d.height - 8)
        .attr("font-size", "11px")
        .attr("fill", "#94a3b8")
        .text(d => `${d.rowsCount} record(s)`);

    updateErdLinks(linkSel, nodes);
}

function updateErdLinks(linkSel, nodes) {
    linkSel
        .attr("x1", d => erdNodeCenter(nodes[d.source]).x)
        .attr("y1", d => erdNodeCenter(nodes[d.source]).y)
        .attr("x2", d => erdNodeCenter(nodes[d.target]).x)
        .attr("y2", d => erdNodeCenter(nodes[d.target]).y);
}
