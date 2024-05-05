function plotWordCloud() {
  d3.json(`http://127.0.0.1:5000/word_cloud_data`)
    .then(function (data) {
      console.log("new word cloud data ", data);

      //Add your script here
      const descriptions = data;

      // Function to clean and split text into words
      function tokenize(text) {
        return text
          .toLowerCase()
          .replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\?"]/g, "")
          .split(/\s+/);
      }

      // Collecting all words in a single array
      let wordCounts = {};

      descriptions.forEach((item) => {
        const words = tokenize(item.description);
        words.forEach((word) => {
          if (!stopWords.has(word) && word) {
            // Ignore stop words and empty strings
            if (wordCounts[word]) {
              wordCounts[word]++;
            } else {
              wordCounts[word] = 1;
            }
          }
        });
      });

      // Sorting words by frequency and picking the top 25
      let topWords = Object.keys(wordCounts)
        .sort((a, b) => wordCounts[b] - wordCounts[a])
        .slice(0, 25);

      // Format as array of objects with 'text' and 'size'
      const formattedTopWords = topWords.map((word) => ({
        text: word,
        size: wordCounts[word],
      }));

      console.log("formattedTopWords", formattedTopWords);

      // Calculate the minimum and maximum sizes
      const sizes = formattedTopWords.map((word) => word.size);
      const minSize = Math.min(...sizes);
      const maxSize = Math.max(...sizes);

      // Function to scale sizes to a new range
      function scaleSize(oldSize, oldMin, oldMax, newMin, newMax) {
        return (
          ((newMax - newMin) * (oldSize - oldMin)) / (oldMax - oldMin) + newMin
        );
      }

      // Scale the sizes in the formattedTopWords
      const scaledTopWords = formattedTopWords.map((word) => ({
        text: word.text,
        size: Math.round(scaleSize(word.size, minSize, maxSize, 16, 30)), // Round to nearest whole number
      }));

      console.log("scaledTopWords", scaledTopWords);

      //   var words = [
      //     { text: "Hello", size: 16 }, // Slightly reduced size
      //     { text: "World", size: 26 }, // Adjusted for better fit
      //     { text: "D3", size: 20 }, // Adjusted size
      //     { text: "JavaScript", size: 16 }, // Adjusted size
      //     { text: "Visualization", size: 30 }, // Largest, adjusted size
      //   ];

      //   console.log("words ", words);

      //   var maxWord = "Visualization"; // The largest word, kept horizontal

      var words = scaledTopWords;

      console.log("words ", words);

      var maxWord = words[0].text; // The largest word, kept horizontal

      //Add colors
      var colorThresholds = { large: 25, medium: 18 }; // Thresholds for large and medium
      var colors = { large: "#ff6347", medium: "#4682b4", small: "#3cb371" }; // Colors for each category

      function getColor(size) {
        if (size >= colorThresholds.large) return colors.large;
        else if (size >= colorThresholds.medium) return colors.medium;
        else return colors.small;
      }

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
          //   return d.text === maxWord ? 0 : 90;
          return 0;
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
          //   .style("fill", "#000") // Color of the text
          .style("fill", (d) => getColor(d.size)) // Assign color based on size
          .style("font-weight", "bold") // Make text bold
          .attr("text-anchor", "middle")
          .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function (d) {
            return d.text;
          });
      }

      //finishe your script
    })
    .catch((error) => console.error("Error fetching or parsing data:", error));
}

document.addEventListener("DOMContentLoaded", (event) => {
  plotWordCloud();
});
