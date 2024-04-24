const svg = d3.select("svg");
console.log(svg);
const width = +svg.attr("width");
const height = +svg.attr("height");
console.log(svg);
// const projection = d3.geoNaturalEarth1();  // A commonly used projection
// const pathGenerator = d3.geoPath().projection(projection);


// Map and projection
var projection = d3.geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([width / 2, height / 2]);

Promise.all([
    d3.json("../world.geojson"),
    d3.json("http://127.0.0.1:5000/data")
]).then(([world, data]) => {
    const countries = world.features;
    const dataMap = new Map(data.map(item => [item.country, item.count]));
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain(d3.extent(data, d => d.count));
    console.log(countries);
    svg.append("g").selectAll("path")
        .data(countries)
        .join("path")
        .attr("d", d3.geoPath()
            .projection(projection))
        .attr("fill", d => {
            console.log("Rendering country:", d.properties.name);
            const count = dataMap.get(d.properties.name);
            console.log(colorScale(count));
            return count ? colorScale(count) : "#ccc";
        });
}).catch(error => {
    console.error("Error loading or processing data:", error);
});