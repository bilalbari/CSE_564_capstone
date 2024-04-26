let elbowPlotData, json_data, resultMdsData1, mdsVariable, resultPcp1;

var lineChartData;

function renderPlot() {
    // Fetch data from server
    console.log("fetching data");
    d3.json("http://127.0.0.1:5000/combined_data").then((result) => {
        console.log("result here: ", result);

        /*elbowPlotData = result.elbowData;

                                                                            var mdsData = JSON.parse(result.mdsData0);
                                                                            resultMdsData1 = result.mdsData1;
                                                                            var currMdsData = { ...mdsData };
                                                                            delete currMdsData.zVal;
                                                                            plotMdsData(currMdsData);

                                                                            var mdsVariablePlot = JSON.parse(result.mdsVariables);
                                                                            console.log("mdsVariablesData ", mdsVariablePlot);*/

        // Plot pcp
        console.log(result);
        json_data = JSON.parse(result.pcp0);
        resultPcp1 = result.pcp1;
        console.log("pcpData ", json_data);
        var d = json_data;
        setDefaultValue(json_data);
        // console.log("pcp array inital ", pcp);

        dataDim.forEach((f) => {
            f.range_value.domain(
                f.data_type === "number" ?
                d3.extent(json_data, (d) => +d[f.value]) :
                Array.from(new Set(json_data.map((d) => d[f.value]))).sort()
            );
        });
        setPcpData(d);
        plotPcp();

        //plot word cloud

        //plot lineChart
        // Parse the JSON string
        lineChartData = JSON.parse(result.lineChart);
        renderLineChartPlot(lineChartData);

        // Extract descriptions into sentences array
        var sentences = parsedData.map(function(item) {
            return item.description;
        });

        console.log(sentences);
        renderWordCloudPlot(sentences);
    });
}

document.addEventListener("DOMContentLoaded", (event) => {
    // Call your function here
    console.log("DOM fully loaded and parsed");
    renderPlot();
});