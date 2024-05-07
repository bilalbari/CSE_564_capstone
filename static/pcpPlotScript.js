var fullData;

function getFullData() {
  d3.json(`http://127.0.0.1:5000/fullData`)
    .then(function (data) {
      fullData = data;
      console.log("fullData ", fullData);
    })
    .catch((error) => console.error("Error fetching or parsing data:", error));
}

function plotPcpFinal() {
  d3.json(`http://127.0.0.1:5000/pcp_data`)
    .then(function (data) {
      console.log("final pcp data ", data);
      setDefaultValue(data);

      dataDim.forEach((f) => {
        f.range_value.domain(
          f.data_type === "number"
            ? d3.extent(data, (d) => +d[f.value])
            : data.map((d) => d[f.value]).sort()
        );
      });
      setPcpData(data);
      plotPcp();
    })
    .catch((error) => console.error("Error fetching or parsing data:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  getFullData();
  plotPcpFinal(); // Initial plot
});
