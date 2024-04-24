document.getElementById("customKBtn").addEventListener("click", function () {
  // alert("Button clicked!");
  console.log("button clicked");
  clearPcpPlot();

  console.log("pcp array on button ", pcp);
  let jsonData = json_data;

  setCustomValue(pcp);
  dataDim.forEach((f) => {
    let domain =
      f.data_type === "number"
        ? d3.extent(json_data, (d) => +d[f.value])
        : json_data.map((d) => d[f.value]).sort();
    f.range_value.domain(domain);
  });

  setPcpData(jsonData);
  plotPcp();
});
