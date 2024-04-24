const margin_left = 90;
const margin_right = 20;
const margin_top = 20;
const margin_bottom = 100;
let currX;
let currY;
const width1 = 1050;
const height1 = 620;
const margin_width = width1 - margin_left - margin_right;
const margin_height = height1 - margin_top - margin_bottom;
const mdsVariableContainer = document.getElementById("mdsVariable");
const mdsVariableSVG = document.getElementById("mdsVariableSVG");
let pcp = [];

function plotMdsVariable(data) {
  console.log("in variable script start ", data);

  currX = data.xVal;
  currY = data.yVal;

  const svg = d3
    .select(mdsVariableSVG)
    .attr("height", height1)
    .attr("width", width1)
    .append("g")
    .attr("transform", "translate(" + margin_left + "," + margin_top + ")");

  const y_axis = d3
    .scaleLinear()
    .domain(getDomain(currY, 1.3))
    .range([margin_height, 0]);

  svg
    .append("g")
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

  const x_axis = d3
    .scaleLinear()
    .domain(getDomain(currX, 1.3))
    .range([0, margin_width]);

  svg
    .append("g")
    .attr("transform", "translate(0," + margin_height + ")")
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

  let mdsPlotSvg = svg.append("g");
  mdsPlotSvg
    .selectAll("text")
    .data(Object.keys(data.name))
    .enter()
    .append("text")
    .style("font-size", "11px")
    .attr("x", (d) => x_axis(currX[d]) + 10)
    .attr("y", (d) => y_axis(currY[d]) + 5)
    .attr("fill", "black")
    .text((d) => data.name[d]);

  let previousCircle = null;
  mdsPlotSvg
    .selectAll("dot")
    .data(Object.keys(currX))
    .enter()
    .append("circle")
    .attr("cx", (d) => x_axis(currX[d]))
    .attr("cy", (d) => y_axis(currY[d]))
    .attr("r", 8)
    .style("fill", "blue")
    .on("mouseover", function (d) {
      d3.select(this).style("cursor", "pointer");
    })
    .on("click", function (data, index) {
      var currentCircle = d3.select(this);
      if (previousCircle) {
        mdsPlotSvg
          .append("defs")
          .append("marker")
          .attr("id", "arrowhead")
          .attr("refX", 6)
          .attr("refY", 3)
          .attr("markerWidth", 10)
          .attr("markerHeight", 10)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,0 L0,6 L9,3 z")
          .style("fill", "brown");
        mdsPlotSvg
          .append("line")
          .attr("x1", previousCircle.attr("cx"))
          .attr("y1", previousCircle.attr("cy"))
          .attr("x2", currentCircle.attr("cx"))
          .attr("y2", currentCircle.attr("cy"))
          .attr("stroke", "brown")
          .attr("marker-end", "url(#arrowhead)");
      }
      currentCircle.transition().duration(30).style("fill", "orange");
      previousCircle = currentCircle;

      console.log("from click", data, "index ", index);
      console.log("mdsVariable before pcp enterance", mdsVariable);
      pcp.push(mdsVariable.name[index]);
      console.log(pcp);
    });
}

function getDomain(data, factor) {
  return [
    d3.min(Object.keys(data), (d) => factor * data[d]),
    d3.max(Object.keys(data), (d) => factor * data[d]),
  ];
}
