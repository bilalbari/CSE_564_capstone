let currentWordCloudData;

function plotWordCloud() {
  d3.json(`http://127.0.0.1:5000/word_cloud_data`)
    .then(function (data) {
      // console.log("new word cloud mainData ", data);
      currentWordCloudData = data;
      updateWordCloud();
    })
    .catch((error) => console.error("Error fetching or parsing data:", error));
}

function updateWordCloud() {
  // console.log(
  //   "received data for population in word cloud",
  //   currentWordCloudData
  // );
  const dataField = document.getElementById("dataChoiceNew").value;
  // console.log("Selected field for word cloud: ", dataField);
  let texts; // This will hold an array of text elements to process
  let topHowMany = 10;
  if (dataField === "description") {
    texts = currentWordCloudData.map((item) => item.description);
    topHowMany = 25;
  } else if (dataField === "cast") {
    // Parse the pseudo-array format for cast
    texts = currentWordCloudData.flatMap((item) =>
      item.cast.slice(2, -2).split("', '")
    );
  } else if (dataField === "director") {
    // Directly use the director's name
    // texts = data.map((item) => item.director);
    texts = currentWordCloudData.flatMap((item) =>
      item.director.split(",").map((name) => name.trim())
    );
  }

  let wordCounts = {};
  texts.forEach((text) => {
    if (dataField === "description") {
      tokenize(text).forEach((word) => {
        if (!stopWords.has(word) && word) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    } else {
      // For cast and director, treat each name as a single word
      wordCounts[text] = (wordCounts[text] || 0) + 1;
    }
  });

  let topWords = Object.keys(wordCounts)
    .sort((a, b) => wordCounts[b] - wordCounts[a])
    .slice(0, topHowMany)
    .map((word) => ({ text: word, size: wordCounts[word] }));

  // console.log("current map ", topWords);

  // Calculate the minimum and maximum sizes
  const sizes = topWords.map((word) => word.size);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);

  // Function to scale sizes to a new range
  function scaleSize(oldSize, oldMin, oldMax, newMin, newMax) {
    if (oldMax == oldMin || oldSize == oldMin || newMax == newMin) {
      return 20;
    }
    var newScaledSize =
      ((newMax - newMin) * (oldSize - oldMin)) / (oldMax - oldMin) + newMin;
    // console.log("newScaledSize ", newScaledSize);
    return newScaledSize;
  }

  // Scale the sizes in the formattedTopWords
  const scaledTopWords = topWords.map((word) => ({
    text: word.text,
    size: Math.round(scaleSize(word.size, minSize, maxSize, 16, 30)), // Round to nearest whole number
  }));

  // console.log("scaledTopWords", scaledTopWords);

  drawWordCloud(scaledTopWords);
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\?"]/g, "")
    .split(/\s+/);
}

function drawWordCloud(words) {
  const svg = d3.select("#wcloud");
  svg.selectAll("g").remove(); // Clear previous SVG
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const colorThresholds = { large: 25, medium: 18 };
  const colors = { large: "#ff6347", medium: "#4682b4", small: "#3cb371" };

  function getColor(size) {
    if (size >= colorThresholds.large) return colors.large;
    else if (size >= colorThresholds.medium) return colors.medium;
    else return colors.small;
  }

  var layout = d3.layout
    .cloud()
    .size([500, 550])
    .words(words)
    .rotate(0)
    .font("Impact")
    .fontSize((d) => d.size)
    .on("end", function (drawnWords) {
      const group = svg.append("g").attr("transform", "translate(200,200)");
      group
        .selectAll("text")
        .data(drawnWords)
        .enter()
        .append("text")
        .style("font-size", (d) => d.size + "px")
        .style("fill", (d) => getColor(d.size))
        .style("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
        .text((d) => d.text);
    });

  layout.start();
}

document.addEventListener("DOMContentLoaded", () => {
  const svg = d3.select("#wcloud");
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;
  const select = svg
    .append("foreignObject")
    .attr("width", 100)
    .attr("height", 30)
    .attr("x", width - 100)
    .attr("y", 0)
    .append("xhtml:select")
    .attr("id", "dataChoiceNew");

  const attributes = ["description", "cast", "director"]; // Example attributes

  select
    .selectAll("option")
    .data(attributes)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);

  document
    .getElementById("dataChoiceNew")
    .addEventListener("change", updateWordCloud);

  plotWordCloud(); // Initial plot
});
