var fullData;

function pcpplot2() {
  d3.json(`http://127.0.0.1:5000/fullData`)
    .then(function (data) {
      fullData = data;
      console.log("fullData ", fullData);
    })
    .catch((error) => console.error("Error fetching or parsing data:", error));

  d3.json(`http://127.0.0.1:5000/pcp_data`)
    .then(function (data) {
      var dimensions = Object.keys(data[0]).filter((d) => d !== "cluster"),
        threshold = 8;
      // var filteredDimensions = dimensions.filter(d => !clickedOrder.includes(d));
      // dimensions = clickedOrder.concat(filteredDimensions);
      console.log("Inside pcpplot2", data);

      const svg = d3.select("#pcp_img"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        margin = { top: 30, right: 10, bottom: 10, left: 50 },
        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;

      svg.selectAll("*").transition().duration(500).remove();

      const g = svg
        .append("g")
        .attr("class", "pcp")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const groupedData = data.map((d) => {
        const reduced = { ...d };
        dimensions.forEach((dim) => {
          if (!isNumeric(d[dim])) {
            const categories = data.map((d) => d[dim]);
            const categoryCounts = categories.reduce((acc, val) => {
              acc[val] = (acc[val] || 0) + 1;
              return acc;
            }, {});
            const sortedCategories = Object.keys(categoryCounts).sort(
              (a, b) => categoryCounts[b] - categoryCounts[a]
            );
            const topCategories = sortedCategories.slice(0, threshold);
            const otherCategories = "Others";

            if (!topCategories.includes(d[dim])) {
              reduced[dim] = otherCategories;
            }
          }
        });
        return reduced;
      });

      function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }

      const x = d3
        .scalePoint()
        .range([0, innerWidth])
        .padding(1)
        .domain(dimensions)
        .padding(0.5);
      const scales = {};
      const color = d3
        .scaleThreshold()
        .domain([1, 1]) // Change these thresholds based on your data needs
        .range(["#ff6666", "#66ff66", "#6666ff"]);

      dimensions.forEach((dimension) => {
        if (dimension !== "cluster") {
          const allValues = groupedData.map((d) => d[dimension]);
          const isNumeric = allValues.every((d) => !isNaN(d));

          if (isNumeric) {
            scales[dimension] = d3
              .scaleLinear()
              .domain(d3.extent(allValues))
              .range([innerHeight, 0]);
          } else {
            scales[dimension] = d3
              .scalePoint()
              .domain(allValues.filter((v, i, a) => a.indexOf(v) === i)) // Unique values
              .range([innerHeight, 0]);
          }
        }
      });

      const line = d3.line();

      function path(d) {
        return line(
          dimensions
            .filter((p) => p !== "cluster")
            .map((p) => [x(p), scales[p](d[p])])
        );
      }

      function toSafeId(id) {
        return id.replace(/[()]/g, "_"); // Replace parentheses with underscores
      }

      g.selectAll("path")
        .data(groupedData)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .style("stroke", (d) => {
          //   console.log(color(d.cluster));
          return color(d.cluster);
        })
        .style("stroke-opacity", 0.5);

      let dragging = {};

      function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
      }

      const drag = d3
        .drag()
        .on("start", (event, d) => {
          dragging[d] = x(d);
        })
        .on("drag", (event, d) => {
          dragging[d] = Math.min(width, Math.max(0, event.x));
        })
        .on("end", (event, d) => {
          dimensions.sort((a, b) => position(a) - position(b));
          delete dragging[d];
          x.domain(dimensions);
          const t = svg.transition().duration(500);
          t.selectAll(".axis").attr("transform", (d) => `translate(${x(d)})`);
          g.selectAll("path").data(groupedData).transition(t).attr("d", path);
        });
      const axis = d3.axisLeft();

      // function brushed(dimension) {
      //     return (event) => {
      //         const selection = event.selection;
      //         if (!selection) {
      //             g.selectAll("path").style("opacity", 0.5); // Reset opacity if brush is cleared
      //             return;
      //         }

      //         const [y0, y1] = selection;

      //         console.log(dimension);

      //         g.selectAll("path")
      //             .style("opacity", 0.1); // Initially dim all paths

      //         g.selectAll("path").filter(function (d) {
      //             if (d === null || d === undefined) {
      //                 return false;
      //             }
      //             // console.log(d);
      //             // console.log(dimension);

      //             // Safely access the data properties within the bound data 'd'
      //             const val = d[dimension];
      //             // console.log(val);
      //             if (val !== null && val !== undefined) {
      //                 const scaledVal = scales[dimension](val); // Scale the data value to compare with brush coords
      //                 return scaledVal >= y0 && scaledVal <= y1;
      //             }
      //             return false;
      //         })
      //             .style("opacity", 1)
      //     };
      // }

      // function brushEnded(event) {
      //   if (!event.selection) {
      //     g.selectAll("path").style("opacity", 0.5);
      //   }
      // }

      function brushed(dimension) {
        return (event) => {
          const selection = event.selection;
          if (!selection) {
            g.selectAll("path").style("opacity", 0.5); // Reset opacity if brush is cleared
            updateOtherChart(fullData); // Update other chart with all data
            return;
          }

          const [y0, y1] = selection;
          const filteredIndices = groupedData
            .map((d, index) => {
              const val = d[dimension];
              if (val !== null && val !== undefined) {
                const scaledVal = scales[dimension](val);
                if (scaledVal >= y0 && scaledVal <= y1) {
                  return index; // Return index of matching data
                }
              }
              return null;
            })
            .filter((index) => index !== null); // Filter out nulls to get a list of indices

          const filteredData = filteredIndices.map((i) => fullData[i]); // Map indices to full data

          g.selectAll("path")
            .style("opacity", 0.1) // Initially dim all paths
            .filter((_, i) => filteredIndices.includes(i))
            .style("opacity", 1); // Highlight selected paths

          updateOtherChart(filteredData); // Update other chart with filtered full data
        };
      }

      function brushEnded(event) {
        if (!event.selection) {
          g.selectAll("path").style("opacity", 0.5); // Reset opacity
          updateOtherChart(fullData); // Update other chart with all data
        }
      }

      function updateOtherChart(data) {
        // Logic to update your other chart based on the full data
        console.log("Updating other chart with full data:", data);
        currentWordCloudData = data;
        updateWordCloud();
      }

      g.selectAll(".axis")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("class", "axis")
        .attr("id", (d) => `axis-${toSafeId(d)}`)
        .attr("transform", function (d) {
          return `translate(${x(d)})`;
        })
        .each(function (d) {
          d3.select(this).call(axis.scale(scales[d]));
        })
        .call(drag)
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text((d) => d);

      dimensions.forEach((dimension) => {
        const brush = d3
          .brushY()
          .extent([
            [-8, 0],
            [8, height],
          ])
          .on("brush", brushed(dimension))
          .on("end", brushEnded);

        g.append("g")
          .attr("class", "brush")
          .attr("transform", `translate(${x(dimension)})`)
          .each(function (d) {
            d3.select(this).call(
              brush.extent([
                [-8, 0],
                [8, height],
              ])
            );
          })
          .selectAll("rect")
          .attr("x", -8)
          .attr("width", 16);
      });
    })
    .catch((error) => console.error("Error fetching or parsing data:", error));
}

document.addEventListener("DOMContentLoaded", (event) => {
  pcpplot2();
});
