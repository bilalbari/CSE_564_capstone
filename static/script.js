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

function resetDashboard() {
    renderPlot();
}