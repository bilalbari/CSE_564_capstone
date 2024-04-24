let currXVal;
let currYVal;
const color_map = [
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

const mdsDataContainer = document.getElementById("mdsData");
const plotContainer = document.getElementById("plotContainer");

function clearMdsDataPlot() {
  plotContainer.innerHTML = "";
}

function plotMdsData(data) {
  clearMdsDataPlot();
  console.log("mds data ", data);

  currXVal = data.xVal;
  currYVal = data.yVal;

  const svg = d3
    .select(plotContainer)
    .append("svg")
    .attr("width", width1)
    .attr("height", height1)
    .append("g")
    .attr("transform", "translate(" + margin_left + "," + margin_top + ")");

  const y_axis = d3
    .scaleLinear()
    .domain(getDomain(currYVal, 1.25))
    .range([margin_height, 0]);

  const x_axis = d3
    .scaleLinear()
    .domain(getDomain(currXVal, 1.25))
    .range([0, margin_width]);

  const xAxisGroup = svg
    .append("g")
    .attr("transform", "translate(0," + margin_height + ")");

  xAxisGroup
    .call(d3.axisBottom(x_axis))
    .call((g) =>
      g
        .append("text")
        .style("font-size", "19px")
        .attr("x", 470)
        .attr("y", 60)
        .attr("fill", "black")
        .text("Dimension 1")
    );

  svg
    .append("g")
    .selectAll("dot")
    .data(Object.keys(currXVal))
    .enter()
    .append("circle")
    .attr("cx", (d) => x_axis(currXVal[d]))
    .attr("cy", (d) => y_axis(currYVal[d]))
    .attr("r", 6)
    .style("fill", (d) => color_map[data.color[d]]);

  const yAxisGroup = svg.append("g");

  yAxisGroup
    .call(d3.axisLeft(y_axis))
    .call((g) =>
      g
        .append("text")
        .style("font-size", "19px")
        .attr("x", -200)
        .attr("y", -50)
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .text("Dimension 2")
    );
}

function getDomain(data, factor) {
  return [
    d3.min(Object.keys(data), (d) => factor * data[d]),
    d3.max(Object.keys(data), (d) => factor * data[d]),
  ];
}
