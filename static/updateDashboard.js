function setFilterYear(year = 2021) {
    let url = 'http://127.0.0.1:5000/set_filter';
    if (year !== 3000) {
        url += `?year=${year}`;
    }
    console.log(`Setting filter to year: ${year}`)
    console.log(`URL: ${url}`)
    // Use the Fetch API to send the request
    fetch(url, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            updateChoro();
            updateLineChartGlobal();
            updateChart();
            updateWordCloud();
            plotPcpFinal();
            // alert(`Filter updated: ${JSON.stringify(data)}`);
        })
        .catch((error) => {
            console.error('Error:', error);
            // alert(`Error setting filter: ${error}`);
        });
}