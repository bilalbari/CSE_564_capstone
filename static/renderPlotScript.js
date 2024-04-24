let elbowPlotData, json_data, resultMdsData1, mdsVariable, resultPcp1;

function renderPlot() {
    // Fetch data from server
    d3.json("/jsonify", function(result) {
        console.log("result here: ", result);

        /*elbowPlotData = result.elbowData;

                        var mdsData = JSON.parse(result.mdsData0);
                        resultMdsData1 = result.mdsData1;
                        var currMdsData = { ...mdsData };
                        delete currMdsData.zVal;
                        plotMdsData(currMdsData);

                        var mdsVariablePlot = JSON.parse(result.mdsVariables);
                        console.log("mdsVariablesData ", mdsVariablePlot);

                        mdsVariable = { ...mdsVariablePlot };
                        delete mdsVariable.zVal;
                        plotMdsVariable(mdsVariable);*/

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
                json_data.map((d) => d[f.value]).sort()
            );
        });
        setPcpData(d);
        plotPcp();

        //plot word cloud
        renderWordCloudPlot();
    });
}