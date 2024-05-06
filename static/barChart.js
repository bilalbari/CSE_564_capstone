async function fetchData(attribute = "listed_in") {

    const response = await fetch(`http://127.0.0.1:5000/ratings?group_by_column=${attribute}`);
    const data = await response.json();
    // Sort data by rating and slice to get top 8
    const sortedData = data.sort((a, b) => b.rating - a.rating);
    const topData = sortedData.slice(0, 8);
    const otherData = sortedData.slice(8);

    // Calculate the average for the "Other" category if it exists
    if (otherData.length > 0) {
        const otherAvg = otherData.reduce((acc, curr) => acc + curr.rating, 0) / otherData.length;
        topData.push({ [attribute]: "Other", rating: otherAvg });
    }
    console.log(topData);

    return topData;
}

function drawBarChart(data, attribute = "listed_in") {
    const svg = d3.select("#barChart");
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    svg.selectAll("*").remove(); // Clear previous renders
    const margin = { top: 40, right: 20, bottom: 30, left: 40 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Define x and y scales
    const x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .domain(data.map(d => d[attribute]));

    const y = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, d3.max(data, d => d.rating)]);

    // Append the x-axis
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    // Y-axis
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Rating");

    // Draw bars
    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[attribute]))
        .attr("y", d => y(d.rating))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.rating))
        .style("fill", (d, i) => { return color(i); })
        .style("stroke", "white") // Add white border for contrast
        .style("opacity", 0.8) // Default opacity
        .on("mouseover", function (event, d) {
            d3.select(this)
                .style("opacity", 1); // Increase opacity to highlight bar
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .style("opacity", 0.8); // Reset opacity
        })
        .attr("data-key", d => d[attribute])
        .on("click", function (event, d) {
            highlightElement(d[attribute]);
        });

}

async function updateChart(selectedAttribute) {
    // const attribute = document.getElementById('#dataChoice').value;
    const data = await fetchData(selectedAttribute);
    drawBarChart(data, selectedAttribute);
}

updateChart(); // Initial call to draw the chart
