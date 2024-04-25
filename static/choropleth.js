function createLegend(scale, height) {
    const svg = d3.select("#choropleth_img");
    const legend = svg.append("g")
        .attr("id", "legend");

    const legendData = scale.ticks(5).reverse();

    const legendItemSize = 20;
    const legendSpacing = 4;
    const xOffset = 50; // Distance from left side of the SVG
    const yOffset = height - legendData.length * (legendItemSize + legendSpacing) - 20; // Distance from bottom of the SVG

    // Create a group for each legend item
    const legendItem = legend.selectAll(".legend-item")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * (legendItemSize + legendSpacing)})`);

    // Append a rectangle to each group
    legendItem.append("rect")
        .attr("x", xOffset)
        .attr("y", yOffset)
        .attr("width", legendItemSize)
        .attr("height", legendItemSize)
        .attr("fill", scale);

    // Append text to each group
    legendItem.append("text")
        .attr("x", xOffset + legendItemSize + 5)
        .attr("y", yOffset + legendItemSize / 2)
        .attr("dy", "0.35em")
        .text(d => d);

    return legend;
}

Promise.all([
    d3.json("../world.geojson"),
    d3.json("http://127.0.0.1:5000/data")
]).then(([world, data]) => {
    const countries = world.features;
    const svg = d3.select("#choropleth_img");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], world); // Assuming geojsonData contains your features
    const pathGenerator = d3.geoPath().projection(projection);
    const dataMap = new Map(data.map(item => [item.country, item.count]));
    const colorScale = d3.scaleSequential(t => d3.interpolateReds(t * 0.8 + 0.2))
        .domain([1, d3.max(data, d => d.count)]);
    const g = svg.append("g")
        .selectAll("path")
        .data(countries)
        .join("path")
        .attr("d", pathGenerator)
        .attr("fill", d => {
            console.log("Rendering country:", d.properties.name);
            const count = dataMap.get(d.properties.name);
            return count ? colorScale(count) : "#ccc";
        })
        .on('mouseover', function (event, d) {
            d3.select(this)
                .transition()
                .duration(300)
                .style('fill-opacity', 0.5)
                .style('stroke', 'black')
                .style('stroke-width', 2);
        })
        .on('mouseout', function (event, d) {
            d3.select(this)
                .transition()
                .duration(300)
                .style('fill-opacity', 1)
                .style('stroke', 'black')
                .style('stroke-width', 0.5);
        });

    createLegend(colorScale, height);

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    svg.call(zoom);
}).catch(error => {
    console.error("Error loading or processing data:", error);
});