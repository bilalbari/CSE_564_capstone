const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");
const div1 = document.getElementById("div1");
const div2 = document.getElementById("div2");

option1.addEventListener("change", function () {
  if (this.checked) {
    div1.classList.remove("hidden");
    div2.classList.add("hidden");

    // Now make the pcp classic
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
  }
});

option2.addEventListener("change", function () {
  if (this.checked) {
    div1.classList.add("hidden");
    div2.classList.remove("hidden");
  }
});
