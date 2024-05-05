var words = [
  { text: "Hello", size: 16 }, // Slightly reduced size
  { text: "World", size: 26 }, // Adjusted for better fit
  { text: "D3", size: 20 }, // Adjusted size
  { text: "JavaScript", size: 16 }, // Adjusted size
  { text: "Visualization", size: 30 }, // Largest, adjusted size
];

console.log("words ", words);

var maxWord = "Visualization"; // The largest word, kept horizontal

var layout = d3.layout
  .cloud()
  .size([335, 300]) // Adjusted size to 335x300
  .words(
    words.map(function (d) {
      return { text: d.text, size: d.size };
    })
  )
  .padding(5)
  .rotate(function (d) {
    // 0 degrees for the largest word, 90 degrees for others
    return d.text === maxWord ? 0 : 90;
  })
  .font("Impact")
  .fontSize(function (d) {
    return d.size;
  })
  .spiral("rectangular") // Rectangular spiral to better utilize the space
  .on("end", draw);

layout.start();

function draw(words) {
  const svg = d3
    .select("#wcloud")
    .append("svg")
    .attr("width", 335) // Adjusted width
    .attr("height", 300);

  const group = svg.append("g").attr("transform", "translate(167.5,150)"); // Centering group in new SVG dimensions

  group
    .selectAll("text")
    .data(words)
    .enter()
    .append("text")
    .style("font-size", function (d) {
      return d.size + "px";
    })
    .style("fill", "#000") // Color of the text
    .attr("text-anchor", "middle")
    .attr("transform", function (d) {
      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function (d) {
      return d.text;
    });
}
