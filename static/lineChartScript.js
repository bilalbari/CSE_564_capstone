function clearLineChartPlot() {
    console.log("Clearing plot...");
    var container = document.getElementById("lineChartContainer");
    container.innerHTML = "";
}

function renderLineChartPlot(data) {
    clearLineChartPlot();

    // data = [{
    //         type: "Movie",
    //         month_of_release: 12,
    //     },
    //     {
    //         type: "Movie",
    //         month_of_release: 12,
    //     },
    //     {
    //         type: "Movie",
    //         month_of_release: 3,
    //     },
    //     {
    //         type: "Movie",
    //         month_of_release: 12,
    //     },
    //     {
    //         type: "Movie",
    //         month_of_release: 9,
    //     },
    //     {
    //         type: "Movie",
    //         month_of_release: 8,
    //     },
    //     {
    //         type: "Movie",
    //         month_of_release: 5,
    //     },
    //     {
    //         type: "Movie",
    //         month_of_release: 6,
    //     },
    //     {
    //         type: "Movie",
    //         month_of_release: 1,
    //     },
    //     {
    //         type: "Movie",
    //         month_of_release: 3,
    //     },
    // ];

    console.log(data);

    // Grouping the data by type and month
    var groupedData = d3
        .nest()
        .key(function(d) {
            return d.type;
        })
        .key(function(d) {
            return d.month_of_release;
        })
        .rollup(function(v) {
            return v.length;
        })
        .entries(data);

    console.log("groupedData ", groupedData);

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
        .attr("stroke", function(d) {
            return d.key === "Movie" ? "blue" : "red";
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