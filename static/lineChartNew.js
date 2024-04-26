const svg = d3.select("#lineChart");
const margin = { top: 30, right: 30, bottom: 55, left: 60 };
const width = svg.attr("width") - margin.left - margin.right;
const height = svg.attr("height") - margin.top - margin.bottom;
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().domain([1, 12]).range([0, width]); // Assuming months 1-12
const y = d3.scaleLinear().range([height, 0]);

const line = d3.line()
    .x(d => x(d.month_of_release))
    .y(d => y(d.count));

g.append("g")
    .attr("transform", `translate(0,${height})`)
    .attr("class", "axis axis--x")
    .call(d3.axisBottom(x).tickFormat(d3.format('d')));

g.append("g")
    .attr("class", "axis axis--y");

g.append("text")
    .attr("transform", `translate(${width / 2}, ${height + 40})`)
    .attr("text-anchor", "middle")
    .text("Month of Release");

g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .text("Count");

const select = svg.append("foreignObject")
    .attr("width", 100)
    .attr("height", 30)
    .attr("x", width - margin.left + 10)
    .attr("y", 0)
    .append("xhtml:select")
    .attr("id", "dataChoice");

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("border", "1px solid #000")
    .style("padding", "5px");

const color = d3.scaleOrdinal(d3.schemeCategory10);

d3.json('http://127.0.0.1:5000/line_chart').then(function (rawData) {
    const attributes = ['listed_in', 'type']; // Example attributes
    select.selectAll("option")
        .data(attributes)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);
    // Initial setup: process data and render the default line chart
    const processedData = processData(rawData, 'listed_in');
    console.log(processedData)
    updateLineChart(processedData);

    // Setup the dropdown change event listener
    d3.select('#dataChoice').on('change', function () {
        const selectedCategory = d3.select(this).property('value');
        const processedData = processData(rawData, selectedCategory);
        updateLineChart(processedData);
    });
}).catch(error => {
    console.error('Error fetching the data:', error);
});

function processData(rawData, attribute) {
    // Convert 'listed_in' to use the first genre and process dates
    const data = rawData.map(d => ({
        ...d,
        listed_in: d.listed_in.replace(/[\[\]']+/g, "").split(", ")[0],
        month_of_release: +d.month_of_release
    }));

    // Group data by the selected attribute and month, and count occurrences
    const groupedData = d3.groups(data, d => d[attribute], d => d.month_of_release)
        .map(([key, monthsMap]) => {
            const monthsCounts = Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const found = monthsMap.find(([m,]) => m === month);
                return { month_of_release: month, count: found ? found[1].length : 0 };
            });
            return { key, values: monthsCounts };
        });

    return groupedData;
}

function updateLineChart(data) {
    y.domain([0, d3.max(data.flatMap(d => d.values), d => d.count)]).nice();
    g.select('.axis--y').transition().call(d3.axisLeft(y));

    const lines = g.selectAll(".line")
        .data(data, d => d.key);

    lines.enter()
        .append("path")
        .merge(lines)
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .style("stroke", (d, i) => color(i))
        .on("mouseover", (event, d) => {
            tooltip.html(d.key)
                .style("visibility", "visible")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    lines.exit().remove();
}








