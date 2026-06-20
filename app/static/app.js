/* ===================================================
   Flood Risk Prediction — Frontend Logic
   =================================================== */

// --- DOM References ---
const subdivisionSelect = document.getElementById("subdivision");
const predictionForm = document.getElementById("predictionForm");
const submitBtn = document.getElementById("submitBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const resultsSection = document.getElementById("resultsSection");
const errorSection = document.getElementById("errorSection");

// --- Chart instances (for cleanup) ---
let rainfallChartInstance = null;
let probabilityChartInstance = null;

// ===================================================
// 1. Load Subdivisions Dropdown
// ===================================================
async function loadSubdivisions() {
    try {
        const response = await fetch("/subdivisions");
        if (!response.ok) throw new Error("Failed to load subdivisions");

        const data = await response.json();

        subdivisionSelect.innerHTML = '<option value="" disabled selected>Select subdivision</option>';

        data.subdivisions.forEach(function (name) {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            subdivisionSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Subdivision load error:", error);
        subdivisionSelect.innerHTML = '<option value="" disabled selected>⚠ Failed to load</option>';
    }
}

loadSubdivisions();

// ===================================================
// 2. Form Submission
// ===================================================
predictionForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // --- Client-side validation ---
    const rainfall = parseFloat(document.getElementById("rainfall").value);
    const month = parseInt(document.getElementById("month").value, 10);
    const year = parseInt(document.getElementById("year").value, 10);
    const subdivision = subdivisionSelect.value;

    if (isNaN(rainfall) || rainfall <= 0) {
        showError("Please enter a valid rainfall value greater than 0.");
        return;
    }
    if (isNaN(month) || month < 1 || month > 12) {
        showError("Please select a valid month.");
        return;
    }
    if (isNaN(year) || year < 1900) {
        showError("Please enter a valid year (1900 or later).");
        return;
    }
    if (!subdivision) {
        showError("Please select a subdivision.");
        return;
    }

    // --- Show loading ---
    showLoading(true);
    hideError();
    hideResults();

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                rainfall: rainfall,
                month: month,
                year: year,
                subdivision: subdivision,
            }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(function () {
                return { detail: "Server error (" + response.status + ")" };
            });
            throw new Error(errData.detail || "Prediction failed");
        }

        const result = await response.json();
        renderResults(result, rainfall);

    } catch (error) {
        console.error("Prediction error:", error);
        showError(error.message || "Could not get prediction. Please try again.");
    } finally {
        showLoading(false);
    }
});

// ===================================================
// 3. Render Results
// ===================================================
function renderResults(result, inputRainfall) {
    // --- Risk Badge ---
    const riskClass = result.risk.toLowerCase();
    const riskIcons = { low: "✅", medium: "⚠️", high: "🚨" };

    document.getElementById("riskBadge").innerHTML =
        '<div class="risk-badge ' + riskClass + '">' +
        '  <span class="risk-badge-icon">' + (riskIcons[riskClass] || "❓") + '</span>' +
        '  Risk Level: ' + result.risk +
        '</div>';

    // --- Metrics ---
    animateValue("valProbability", result.probability, "%");
    animateValue("valConfidence", result.confidence, "%");
    animateValue("valUncertainty", result.uncertainty, "%");
    document.getElementById("valThreshold").textContent =
        result.threshold !== null ? result.threshold.toFixed(1) : "N/A";

    // --- Progress Bars (delayed for animation) ---
    setTimeout(function () {
        document.getElementById("progressProbability").style.width = Math.min(result.probability, 100) + "%";
        document.getElementById("progressConfidence").style.width = Math.min(result.confidence, 100) + "%";
        document.getElementById("progressUncertainty").style.width = Math.min(result.uncertainty, 100) + "%";
    }, 100);

    // --- Charts ---
    renderRainfallChart(inputRainfall, result.threshold);
    renderProbabilityChart(result.probability);

    // --- Timestamp ---
    document.getElementById("predictionTimestamp").textContent =
        "Prediction generated at " + new Date().toLocaleString();

    // --- Show ---
    showResults();
}

// ===================================================
// 4. Animated Counter
// ===================================================
function animateValue(elementId, target, suffix) {
    var el = document.getElementById(elementId);
    var current = 0;
    var step = target / 40;
    var interval = setInterval(function () {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current.toFixed(1) + (suffix || "");
    }, 20);
}

// ===================================================
// 5. Rainfall vs Threshold Chart (Bar)
// ===================================================
function renderRainfallChart(rainfall, threshold) {
    var ctx = document.getElementById("rainfallChart").getContext("2d");

    // Destroy old chart
    if (rainfallChartInstance) {
        rainfallChartInstance.destroy();
        rainfallChartInstance = null;
    }

    var thresholdVal = threshold !== null ? threshold : 0;

    rainfallChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Your Rainfall", "Flood Threshold"],
            datasets: [{
                label: "Millimeters (mm)",
                data: [rainfall, thresholdVal],
                backgroundColor: [
                    "rgba(56, 189, 248, 0.7)",
                    "rgba(239, 68, 68, 0.5)",
                ],
                borderColor: [
                    "rgba(56, 189, 248, 1)",
                    "rgba(239, 68, 68, 1)",
                ],
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.5,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    titleColor: "#f1f5f9",
                    bodyColor: "#94a3b8",
                    borderColor: "rgba(148, 163, 184, 0.2)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(148, 163, 184, 0.08)" },
                    ticks: { color: "#64748b", font: { family: "Inter" } },
                },
                x: {
                    grid: { display: false },
                    ticks: { color: "#94a3b8", font: { family: "Inter", weight: 600 } },
                },
            },
        },
    });
}

// ===================================================
// 6. Probability Gauge Chart (Doughnut)
// ===================================================
function renderProbabilityChart(probability) {
    var ctx = document.getElementById("probabilityChart").getContext("2d");

    // Destroy old chart
    if (probabilityChartInstance) {
        probabilityChartInstance.destroy();
        probabilityChartInstance = null;
    }

    var probClamped = Math.min(probability, 100);
    var remaining = 100 - probClamped;

    // Color by risk
    var probColor;
    if (probability < 30) {
        probColor = "#22c55e";
    } else if (probability < 70) {
        probColor = "#f59e0b";
    } else {
        probColor = "#ef4444";
    }

    probabilityChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Flood Probability", "Remaining"],
            datasets: [{
                data: [probClamped, remaining],
                backgroundColor: [probColor, "rgba(148, 163, 184, 0.1)"],
                borderColor: [probColor, "rgba(148, 163, 184, 0.05)"],
                borderWidth: 1,
                cutout: "72%",
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    titleColor: "#f1f5f9",
                    bodyColor: "#94a3b8",
                    borderColor: "rgba(148, 163, 184, 0.2)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: function (ctx) {
                            return " " + ctx.parsed.toFixed(1) + "%";
                        },
                    },
                },
            },
        },
        plugins: [{
            id: "centerText",
            afterDraw: function (chart) {
                var ctx2 = chart.ctx;
                var width = chart.width;
                var height = chart.height;

                ctx2.save();
                ctx2.font = "800 1.6rem Inter, sans-serif";
                ctx2.fillStyle = probColor;
                ctx2.textAlign = "center";
                ctx2.textBaseline = "middle";
                ctx2.fillText(
                    probClamped.toFixed(1) + "%",
                    width / 2,
                    height / 2
                );
                ctx2.restore();
            },
        }],
    });
}

// ===================================================
// 7. UI Helpers
// ===================================================
function showLoading(visible) {
    if (visible) {
        loadingOverlay.classList.remove("hidden");
        submitBtn.disabled = true;
    } else {
        loadingOverlay.classList.add("hidden");
        submitBtn.disabled = false;
    }
}

function showResults() {
    resultsSection.classList.remove("hidden");
    errorSection.classList.add("hidden");
}

function hideResults() {
    resultsSection.classList.add("hidden");
    // Reset progress bars
    document.getElementById("progressProbability").style.width = "0%";
    document.getElementById("progressConfidence").style.width = "0%";
    document.getElementById("progressUncertainty").style.width = "0%";
}

function showError(message) {
    document.getElementById("errorMessage").textContent = message;
    errorSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");
}

function hideError() {
    errorSection.classList.add("hidden");
}
