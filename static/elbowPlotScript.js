// function renderPlot() {
//   // Fetch data from server
//   d3.json("/jsonify", function (result) {

// Wait for 5 seconds (5000 milliseconds)
setTimeout(myFunction, 2000);

function myFunction() {
  console.log("waited 2 seconds");
  var data = elbowPlotData.data;

  console.log("elbowPlotData ", elbowPlotData);

  // Define margins and dimensions for the plot
  var margins = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 40,
  };
  var componentFill = "#64b5f6";
  var chosenColor = "#f44336";
  var parentWidth = $("#screePlot").parent().width();
  var width0 = parentWidth - margins.left - margins.right;
  var height0 = 600 - margins.top - margins.bottom;
  var lineStrokeWidth = 2;
  var kValue = 3;
  var svg = null;

  // Create SVG element for the plot
  svg = d3
    .select("#screePlot")
    .append("svg")
    .attr("width", width0 + margins.left + margins.right)
    .attr("height", height0 + margins.top + margins.bottom)
    .attr("class", "screeplotSvg")
    .attr(
      "viewBox",
      "0 0 " +
        (width0 + margins.left + margins.right) +
        " " +
        (height0 + margins.top + margins.bottom)
    );

  var g = svg
    .append("g")
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

  var xScale = d3.scaleBand().range([0, width0]).padding(0.4);
  var yScale = d3.scaleLinear().range([height0, 0]);

  var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  var xAxis = g.append("g").attr("transform", "translate(0," + height0 + ")");

  var yAxis = g.append("g").attr("transform", "translate(-0.5,0)");
  var yAxisLabel = g
    .append("text")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end")
    .attr("font-family", "Verdana")
    .attr("font-size", "14px")
    .attr("y", "-45")
    .attr("x", "-200")
    .attr("dy", "1.25em")
    .attr("dx", "-0.5em")
    .text("MSE");

  var xAxisLabel = g
    .append("text")
    .attr("transform", "translate(" + width0 + " ," + height0 + ")")
    .style("text-anchor", "end")
    .attr("font-family", "Verdana")
    .attr("font-size", "14px")
    .attr("dy", "-0.5em")
    .attr("dx", "-0.5em")
    .attr("y", "35")
    .attr("x", "-400")
    .text("K Values");

  var linesGroup = g.selectAll(".cumulative");
  var plusLabelY = g
    .append("text")
    .attr("font-family", "Verdana")
    .attr("font-size", "1em")
    .attr("fill", "#f44336")
    .style("text-anchor", "middle");

  var plusGroup = g.append("g").attr("class", "line");

  plusGroup.append("line").attr("id", "plusY").attr("class", "plus");

  g.append("rect")
    .attr("class", "overlay")
    .attr("width", width0)
    .attr("height", height0)
    .on("mouseout", function () {
      plusLabelY.text("");

      d3.selectAll(".bar").attr("fill", function (d) {
        return d.factor == kValue ? chosenColor : componentFill;
      });
    })
    .on("mousemove", function () {
      var mouse = d3.mouse(this);
      var mx = mouse[0];
      var my = mouse[1];

      plusGroup
        .select("#plusY")
        .attr("x1", 0)
        .attr("y1", my)
        .attr("x2", width0)
        .attr("y2", my);

      var factor =
        xScale.invert(
          mx + xScale.bandwidth() / 2 + (xScale.bandwidth() * 0.1) / 2
        ) - 1;

      d3.selectAll(".bar").attr("fill", function (d) {
        return d.factor == factor ? chosenColor : componentFill;
      });
    })
    .on("click", function () {
      mouse = d3.mouse(this);
      var mx = mouse[0];
      var my = mouse[1];

      kValue =
        xScale.invert(
          mx + xScale.bandwidth() / 2 + (xScale.bandwidth() * 0.1) / 2
        ) - 1;
      document.getElementById("kValue").innerHTML = kValue;
      $.post("/kValue", {
        kValue: kValue,
      });

      //plot code
      var mdsData1 = JSON.parse(resultMdsData1);
      var currMdsData = { ...mdsData1 };
      delete currMdsData.zVal;
      plotMdsData(currMdsData);

      // Now make the pcp classic
      json_data = JSON.parse(resultPcp1);
      var d = json_data;
      setDefaultValue(json_data);
      dataDim.forEach((f) => {
        f.range_value.domain(
          f.data_type === "number"
            ? d3.extent(json_data, (d) => +d[f.value])
            : json_data.map((d) => d[f.value]).sort()
        );
      });
      setPcpData(d);
      plotPcp();
    });

  data.forEach(function (d) {
    d.eigen_value = +d.eigen_value;
  });

  var domain = data.map(function (d) {
    return d.factor;
  });
  domain.push(domain[domain.length - 1]);
  xScale.domain(domain);
  yScale.domain([0, 105]);

  xScale.invert = (function () {
    var domain = xScale.domain();
    var range = xScale.range();
    var scale = d3.scaleQuantize().domain(range).range(domain);

    return function (x) {
      return scale(x);
    };
  })();

  xAxis.call(d3.axisBottom(xScale));
  yAxis.call(d3.axisLeft(yScale));

  var bars = g.selectAll(".bar").data(data, function (d) {
    return d.factor;
  });

  bars
    .attr("fill", componentFill)
    .attr("x", function (d) {
      return xScale(d.factor);
    })
    .attr("width", xScale.bandwidth())
    .attr("y", function (d) {
      if (d.eigen_value < 1) {
        return height0 - 2;
      } else {
        return yScale(d.eigen_value);
      }
    })
    .attr("height", function (d) {
      if (d.eigen_value < 1) {
        return 2;
      } else {
        return height0 - yScale(d.eigen_value);
      }
    });

  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", function (d) {
      kValue = 3;
      return d.factor == 3 ? chosenColor : componentFill;
    })
    .attr("x", function (d) {
      return xScale(d.factor);
    })
    .attr("width", xScale.bandwidth())
    .attr("y", function (d) {
      if (d.eigen_value < 1) {
        return height0 - 2;
      } else {
        return yScale(d.eigen_value);
      }
    })
    .attr("height", function (d) {
      if (d.eigen_value < 1) {
        return 2;
      } else {
        return height0 - yScale(d.eigen_value);
      }
    })
    .merge(bars);

  bars.exit().remove();

  // Adding lines between bars
  for (var i = 0; i < data.length - 1; i++) {
    var startX = xScale(i + 1) + xScale.bandwidth() / 2; // x-coordinate of the starting point
    var startY = yScale(data[i].eigen_value); // y-coordinate of the starting point
    var endX = xScale(i + 2) + xScale.bandwidth() / 2; // x-coordinate of the ending point
    var endY = yScale(data[i + 1].eigen_value); // y-coordinate of the ending point

    g.append("line")
      .attr("x1", startX)
      .attr("y1", startY)
      .attr("x2", endX)
      .attr("y2", endY)
      .attr("stroke", "navy")
      .attr("stroke-width", 2);
  }

  initialDim = 3;
  document.getElementById("kValue").innerHTML = initialDim;
  $.post("/kValue", {
    kValue: initialDim,
  });
  //   });
  // }
}
