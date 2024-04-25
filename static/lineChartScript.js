function clearLineChartPlot() {
    console.log("Clearing plot...");
    var container = document.getElementById("lineChartContainer");
    container.innerHTML = "";
}

function renderLineChartPlot() {
    updateChart();
}

// Function to handle dropdown change
function updateChart() {
    console.log("update chart called");

    clearLineChartPlot();

    // var lineChartData = [{
    //         type: "Movie",
    //         listed_in: "['Dramas', 'Independent Movies', 'International Movies']",
    //         month_of_release: 9,
    //     },
    //     {
    //         type: "TV Show",
    //         listed_in: "['British TV Shows', 'Reality TV']",
    //         month_of_release: 9,
    //     },
    //     {
    //         type: "Movie",
    //         listed_in: "['Comedies', 'Dramas']",
    //         month_of_release: 9,
    //     },
    //     {
    //         type: "Movie",
    //         listed_in: "['Dramas', 'International Movies']",
    //         month_of_release: 9,
    //     },
    //     {
    //         type: "Movie",
    //         listed_in: "['Comedies', 'International Movies', 'Romantic Movies']",
    //         month_of_release: 9,
    //     },
    // ];

    var selectedOption = document.getElementById("lineDropdown").value;

    console.log("selectedOption ", selectedOption);

    // Grouping the data by type and selected key
    var groupedData = d3
        .nest()
        .key(function(d) {
            if (selectedOption === "listed_in") {
                var listedInArray = d[selectedOption].slice(2, -2).split("', '");
                console.log("listedInArray ", listedInArray);
                return listedInArray[0];
            } else {
                return d[selectedOption] || d.type;
            }
        })
        .key(function(d) {
            return d.month_of_release;
        })
        .rollup(function(v) {
            return v.length;
        })
        .entries(lineChartData);

    console.log("groupedData", groupedData);

    // Width and height of the chart
    var width = 675;
    var height = 255;
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };

    // Create SVG element
    var svg = d3
        .select("#lineChartContainer")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define scales
    var x = d3
        .scaleLinear()
        .domain([1, 12])
        .range([margin.left, width - margin.right]);
    var y = d3
        .scaleLinear()
        .domain([
            0,
            d3.max(groupedData, function(d) {
                return d3.max(d.values, function(e) {
                    return e.value;
                });
            }),
        ])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Define axes
    var xAxis = d3.axisBottom().scale(x);
    var yAxis = d3.axisLeft().scale(y);

    // Draw x axis
    svg
        .append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis);

    // Draw y axis
    svg
        .append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis);

    // Define line
    var line = d3
        .line()
        .x(function(d) {
            return x(d.key);
        })
        .y(function(d) {
            return y(d.value);
        });

    // Draw lines
    svg
        .selectAll(".line")
        .data(groupedData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", function(d, i) {
            return d3.schemeCategory10[i];
        })
        .attr("stroke-width", 2)
        .attr("d", function(d) {
            var lineData = [];
            for (var i = 1; i <= 12; i++) {
                var found = d.values.find(function(e) {
                    return +e.key === i;
                });
                lineData.push({ key: i, value: found ? found.value : 0 });
            }
            return line(lineData);
        });
}

d3.select("#lineDropdown").on("change", updateChart);