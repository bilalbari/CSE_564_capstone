const colorMap = [
    "#ffcc00",
    "#ff6666",
    "#00ccff",
    "#66ff66",
    "#9966ff",
    "#ff9966",
    "#33cccc",
    "#ff99cc",
    "#99cc00",
    "#cc66ff",
];
const margin = {
    top: 55,
    right: 15,
    bottom: 15,
    left: 45,
};
const width = 675 - margin.left - margin.right;
const height = 255 - margin.top - margin.bottom;
let pcpData, pcpDataDim, dataDim;
let ordering = {};
var line = d3.line();
var line_1, line_2;
let x, svg, g;

function clearPcpPlot() {
    console.log("Clearing plot...");
    var container = document.getElementById("pcpContainer");
    container.innerHTML = "";
}

function setCustomValue(A) {
    let obj1 = createValueObjects(A);
    setPcpDataDim(obj1);
    console.log("Setting value: ", obj1);
    dataDim = obj1;
}

function createValueObjects(A) {
    return A.map((value) => ({
        value: value,
        range_value: createScale(value),
        data_type: "number",
    }));
}

function createScale(value) {
    return d3.scaleLinear().range([height, 0]);
}

function plotPcp() {
    clearPcpPlot();
    console.log("Plotting pcp start, pcpData", pcpData);
    x = createXScale();
    svg = createSvg();
    appendLines(svg);
    appendAxes(svg, x);
    appendBrushes(svg);
}

function createXScale() {
    return d3
        .scalePoint()
        .domain(pcpDataDim.map((data) => data.value))
        .range([0, width]);
}

function createSvg() {
    return d3
        .select("#pcpContainer")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("margin_left", 100)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function appendLines(svg) {
    svg
        .append("g")
        .attr("class", "line1")
        .selectAll("path")
        .data(pcpData)
        .enter()
        .append("path")
        .attr("d", linePath);

    svg
        .append("g")
        .attr("class", "line2")
        .selectAll("path")
        .data(pcpData)
        .enter()
        .append("path")
        .attr("d", linePath)
        .style("stroke", function(data) {
            return colorMap[data["color"]];
        });
}

function appendAxes(svg, xScale) {
    g = svg
        .selectAll(".f")
        .data(pcpDataDim)
        .enter()
        .append("g")
        .attr("class", "f")
        .attr("transform", function(data) {
            return "translate(" + xScale(data.value) + ")";
        })
        .call(dragBehavior);

    g.append("g")
        .attr("class", "axis")
        .each(function(data) {
            d3.select(this).call(d3.axisLeft().scale(data.range_value));
        })
        .append("text")
        .attr("class", "axis-label")
        .attr("y", -25)
        .style("fill", "black")
        .style("font-size", 10)
        .text(function(data) {
            return data.value;
        });
}

function appendLines(svg, xScale) {
    line_1 = svg
        .append("g")
        .attr("class", "line1")
        .selectAll("path")
        .data(pcpData)
        .enter()
        .append("path")
        .attr("d", linePath);

    line_2 = svg
        .append("g")
        .attr("class", "line2")
        .selectAll("path")
        .data(pcpData)
        .enter()
        .append("path")
        .attr("d", linePath)
        .style("stroke", function(data) {
            return colorMap[data["color"]];
        });
}

function appendBrushes(svg) {
    svg
        .selectAll(".f")
        .append("g")
        .attr("class", "brush")
        .each(function(data) {
            d3.select(this).call(createBrush(data.range_value));
        })
        .selectAll("rect")
        .attr("x", -10)
        .attr("width", 15);
}

function createBrush(range_value) {
    return d3
        .brushY()
        .extent([
            [-10, 0],
            [10, height],
        ])
        .on("brush", function() {
            slider(svg);
        })
        .on("end", function() {
            slider(svg);
        });
}

const dragBehavior = d3
    .drag()
    .on("start", dragStart)
    .on("drag", dragMove)
    .on("end", dragEnd);

function slider(svg) {
    var dat = getData(svg);
    updateDisplay(dat);
}

function getData(svg) {
    var data = [];
    svg
        .selectAll(".brush")
        .filter(function(d) {
            return d3.brushSelection(this);
        })
        .each(function(k) {
            data.push({
                f: k,
                extent: d3.brushSelection(this),
            });
        });
    return data;
}

function updateDisplay(data) {
    if (data.length === 0) {
        line_2.style("display", null);
    } else {
        line_2.style("display", function(d) {
            return data.every(function(obj) {
                    return (
                        obj.extent[0] <= obj.f.range_value(d[obj.f.value]) &&
                        obj.f.range_value(d[obj.f.value]) <= obj.extent[1]
                    );
                }) ?
                null :
                "none";
        });
    }
}

function dragStart(data) {
    ordering[data.value] = x(data.value);
    line_1.attr("visibility", "hidden");
}

function dragMove(data) {
    ordering[data.value] = Math.min(width, Math.max(0, d3.event.x));
    line_2.attr("d", linePath);
    pcpDataDim.sort(function(a, b) {
        return plot(a) - plot(b);
    });
    x.domain(
        pcpDataDim.map(function(data) {
            return data.value;
        })
    );
    g.attr("transform", function(data) {
        return "translate(" + plot(data) + ")";
    });
}

function dragEnd(data) {
    delete ordering[data.value];
    axisAdjustment(d3.select(this)).attr(
        "transform",
        "translate(" + x(data.value) + ")"
    );
    axisAdjustment(line_2).attr("d", linePath);
    line_1
        .attr("d", linePath)
        .attr("visibility", null)
        .transition()
        .delay(400)
        .duration(0);
}

// Method to calculate line path
function linePath(data) {
    const pathData = pcpDataDim.map((f) => {
        const x_axis = calculateXAxis(f);
        const y_axis = calculateYAxis(f, data[f.value]);
        return [x_axis, y_axis];
    });

    return line(pathData);
}

// Method to calculate x-axis value
function calculateXAxis(f) {
    const ord = ordering[f.value];
    return ord === undefined ? x(f.value) : ord;
}

// Method to calculate y-axis value
function calculateYAxis(f, value) {
    if (f.data_type === "string") {
        return f.range_value(value) + f.range_value.bandwidth() / 2;
    } else {
        return f.range_value(value);
    }
}

function plot(data) {
    var xy = ordering[data.value];
    return xy == null ? x(data.value) : xy;
}

function setDefaultValue(d) {
    let obj1 = createValueObjectsFromData(d);
    setPcpDataDim(obj1);
    dataDim = obj1;
}

// Method to create value objects from data
function createValueObjectsFromData(d) {
    const valueObjects = [];
    const firstDataItem = d[0];
    const keys = Object.keys(firstDataItem);

    keys.forEach((key) => {
        if (key !== "color") {
            const valueType = typeof firstDataItem[key];
            const obj = createObject(key, valueType);
            valueObjects.push(obj);
        }
    });

    return valueObjects;
}

// Method to create object based on data type
function createObject(key, valueType) {
    const rangeValue = createRangeValue(valueType);
    return {
        value: key,
        range_value: rangeValue,
        data_type: valueType === "number" ? "number" : "string",
    };
}

// Method to create range value based on data type
function createRangeValue(valueType) {
    return valueType === "number" ?
        d3.scaleLinear().range([height, 0]) :
        d3.scaleBand().range([0, height]);
}

function axisAdjustment(data) {
    return data.transition().duration(400);
}

function setPcpData(data) {
    pcpData = data;
}

function setPcpDataDim(data) {
    pcpDataDim = data;
}