const odometerSvg = d3.select("#odometer");
const odometerWidth = +odometerSvg.attr("width");
const odometerHeight = +odometerSvg.attr("height") - 50; // leave some space for labels
const gaugeGroup = odometerSvg
  .append("g")
  .attr("transform", `translate(${odometerWidth / 2}, ${odometerHeight})`);

const gaugeArc = d3
  .arc()
  .innerRadius(80)
  .outerRadius(90)
  .startAngle(-Math.PI / 2);

// Gradient for the gauge
const gradient = odometerSvg
  .append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")
  .attr("y2", "0%");
gradient.append("stop").attr("offset", "0%").style("stop-color", "deepskyblue");
gradient.append("stop").attr("offset", "100%").style("stop-color", "orange");

// Average watch time in hours
const averageTime = 5; // Example value
const maxWatchTime = 10; // Maximum value on the gauge

// Create the scale
const timeScale = d3
  .scaleLinear()
  .range([-Math.PI / 2, Math.PI / 2])
  .domain([0, maxWatchTime]);

// Background arc
gaugeGroup
  .append("path")
  .datum({ endAngle: Math.PI / 2 })
  .attr("d", gaugeArc)
  .attr("class", "gauge-background");

// Foreground arc
gaugeGroup
  .append("path")
  .datum({ endAngle: timeScale(averageTime) })
  .attr("d", gaugeArc)
  .attr("class", "gauge-foreground");

// Adding text to display the value
gaugeGroup
  .append("text")
  .attr("text-anchor", "middle")
  .attr("dy", "-1.5em")
  .attr("class", "value-text")
  .text(`${averageTime} hours`);

// Calculate label positions
const radius = 100; // Adjusted for label readability
const labelOffset = 15; // Vertical offset for the labels

// Start label (0 hours)
gaugeGroup
  .append("text")
  .attr("transform", `translate(${-radius - labelOffset}, 0)`)
  .attr("text-anchor", "end")
  .text("0h");

// End label (maxWatchTime hours)
gaugeGroup
  .append("text")
  .attr("transform", `translate(${radius + labelOffset}, 0)`)
  .attr("text-anchor", "start")
  .text(`${maxWatchTime}h`);
