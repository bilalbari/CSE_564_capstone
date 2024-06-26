const svg2 = d3.select("#lineChart");
const margin2 = { top: 10, right: 10, bottom: 55, left: 60 };
const height2 = svg2.node().getBoundingClientRect().height - margin2.top - margin2.bottom;
const width2 = svg2.node().getBoundingClientRect().width - margin2.left - margin2.right;;

const g2 = svg2
    .append("g")
    .attr("transform", `translate(${margin2.left},${margin2.top})`);
svg2.on("click", function (event) {
    // Check if the click is on the background
    if (event.target.tagName === "svg") {
        d3.selectAll(".bar, .line").style("opacity", 0.8).style("stroke-width", 2);
        setFilterYear(3000);
    }
});
const x2 = d3.scaleLinear().domain([1, 12]).range([0, width2]); // Assuming months 1-12
const y = d3.scaleLinear().range([height2, 0]);

const lineGenerator = d3
    .line()
    .x((d) => x2(d.month_of_release))
    .y((d) => y(d.count));

g2.append("g")
    .attr("transform", `translate(0,${height2})`)
    .attr("class", "axis axis--x")
    .call(d3.axisBottom(x2).tickFormat(d3.format("d")));

g2.append("g").attr("class", "axis axis--y");

g2.append("text")
    .attr("transform", `translate(${width2 / 2}, ${height2 + 40})`)
    .attr("text-anchor", "middle")
    .text("Month of Release");

g2.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -height2 / 2)
    .attr("text-anchor", "middle")
    .text("Count");

const select = svg2
    .append("foreignObject")
    .attr("width", 100)
    .attr("height", 30)
    .attr("x", width2 - margin2.left)
    .attr("y", 0)
    .append("xhtml:select")
    .attr("id", "dataChoice");

const color = d3.scaleOrdinal().domain(genres)
    .range(d3.schemeCategory10);

const colorTypes = d3.scaleOrdinal().domain(["Movie", "TV Show"])
    .range(d3.schemeCategory10);

function updateLineChartGlobal() {
    d3.json("http://127.0.0.1:5000/line_chart")
        .then(function (rawData) {
            const attributes = ["listed_in", "type"]; // Example attributes
            select
                .selectAll("option")
                .data(attributes)
                .enter()
                .append("option")
                .text((d) => d)
                .attr("value", (d) => d);
            // Initial setup: process data and render the default line chart
            const processedData = processData(rawData, "listed_in");
            // console.log(processedData);
            updateLineChart(processedData);

            // Setup the dropdown change event listener
            d3.select("#dataChoice").on("change", function () {
                const selectedCategory = d3.select(this).property("value");
                const processedData = processData(rawData, selectedCategory);
                console.log("Selected category: " + selectedCategory);
                updateLineChart(processedData);
                updateChart(selectedCategory);
            });
        })
        .catch((error) => {
            console.error("Error fetching the data:", error);
        });
}

function processData(rawData, attribute) {
    // Convert 'listed_in' to use the first genre and process dates
    // console.log(rawData)
    const data = rawData.map((d) => ({
        ...d,
        listed_in: d.listed_in,
        month_of_release: +d.month_of_release,
    }));

    // Group data by the selected attribute and month, and count occurrences
    const groupedData = d3
        .groups(
            data,
            (d) => d[attribute],
            (d) => d.month_of_release
        )
        .map(([key, monthsMap]) => {
            const monthsCounts = Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const found = monthsMap.find(([m]) => m === month);
                return { month_of_release: month, count: found ? found[1].length : 0 };
            });
            return { key, values: monthsCounts };
        });

    return groupedData;
}

function updateLineChart(data) {
    console.log("Inside update linechart:");
    // console.log(data);
    y.domain([
        0,
        d3.max(
            data.flatMap((d) => d.values),
            (d) => d.count
        ),
    ]).nice();
    g2.select(".axis--y").transition().call(d3.axisLeft(y));
    // console.log("Inside update linechart:" + data);
    const lines = g2.selectAll(".line-group").data(data, (d) => d.key);

    const linesEnter = lines.enter().append("g").attr("class", "line-group");

    linesEnter.append("path")
        .attr("class", "line")
        .style("fill", "none")
        .style("stroke", (d, i) => {
            if (d.key === "Movie" || d.key === "TV Show") {
                return colorTypes(d.key);
            }
            return color(d.key);
        })
        .style("stroke-width", 3)
        .attr("d", d => lineGenerator(d.values)); // initial line position

    // Update existing lines with transition
    lines.select(".line")
        .transition()  // Start a transition to animate changes
        .duration(1000)  // Duration of transition in milliseconds
        .attr("d", d => lineGenerator(d.values))  // New data for line
        .style("stroke", (d, i) => {
            console.log("The line chart key" + d.key);
            if (d.key === "Movie" || d.key === "TV Show") {
                return colorTypes(d.key);
            }
            return color(d.key);
        });

    // Handle exiting lines
    lines.exit()
        .transition()
        .duration(300)
        .style("opacity", 0)
        .remove();

    // Mouseover, mouseout, and click events to highlight lines
    lines.merge(linesEnter).select(".line")
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
                .transition()
                .duration(150)
                .style("stroke-width", 6)
                .style("stroke-opacity", 1);
        })
        .on("mouseout", (event) => {
            d3.select(event.currentTarget)
                .transition()
                .duration(150)
                .style("stroke-width", 3)
                .style("stroke-opacity", 0.8);
        })
        .on("click", function (event, d) {
            highlightElement(d.key);
        });

    // linesEnter
    //     .append("path")
    //     .attr("class", "line")
    //     .merge(lines.select(".line")) // enter + update
    //     .attr("d", (d) => lineGenerator(d.values))
    //     .style("fill", "none")
    //     .style("stroke", (d, i) => color(i))
    //     .style("stroke-width", 3)
    //     .on("mouseover", (event, d) => {
    //         d3.select(event.currentTarget)
    //             .transition()
    //             .duration(150) // Select the path element that triggered the event
    //             .style("stroke-width", 6) // Increase stroke width
    //             .style("stroke-opacity", 1);
    //     })
    //     .on("mouseout", (event) => {
    //         d3.select(event.currentTarget)
    //             .transition()
    //             .duration(150) // Select the path element that triggered the event
    //             .style("stroke-width", 3) // Reset stroke width
    //             .style("stroke-opacity", 0.8);
    //     })
    //     .on("click", function (event, d) {
    //         // console.log("Clicked for key value " + d.key);
    //         highlightElement(d.key);
    //     });

    // lines.exit().remove();
}

function highlightElement(selectedKey) {
    // Reset styles
    d3.selectAll(".bar, .line").style("opacity", 0.5).style("stroke-width", 2);

    // Highlight selected bar
    d3.selectAll(".bar[data-key='" + selectedKey + "']")
        .style("opacity", 1)
        .style("stroke-width", 6);

    // Highlight corresponding line
    d3.selectAll(".line").filter(d => d.key === selectedKey)
        .style("opacity", 1)
        .style("stroke-width", 6);

    setFilterGenre(selectedKey);

}

function setFilterGenre(genre) {
    let encodedGenre = encodeURIComponent(genre);
    let url = 'http://127.0.0.1:5000/set_filter_listed';
    url += `?listed_in=${encodedGenre}`;

    // console.log(`URL: ${url}`)
    // Use the Fetch API to send the request
    fetch(url, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            // console.log('Success:', data);
            updateChoro();
            plotPcpFinalAlt();
            // alert(`Filter updated: ${JSON.stringify(data)}`);
        })
        .catch((error) => {
            console.error('Error:', error);
            // alert(`Error setting filter: ${error}`);
        });
}
