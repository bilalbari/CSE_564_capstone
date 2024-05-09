function updateDashboard(year) {
    // Reset all buttons to inactive state
    document.querySelectorAll(".year-button").forEach((button) => {
        button.classList.remove("active");
    });
    // Set clicked button to active state
    document.getElementById(year).classList.add("active");
    // Placeholder function for demonstration
    // alert("Dashboard updated to show data for: " + year);
    // Actual implementation would involve AJAX calls or data filtering logic here
}

const genres = ['TV Action & Adventure', 'TV Dramas', 'Thrillers', 'Music & Musicals', 'Crime TV Shows', 'Horror Movies', 'Stand-Up Comedy'];

function resetDashboard() {
    renderPlot();
}

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}