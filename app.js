document.addEventListener("DOMContentLoaded", function () {
  const targetSizes = [20, 40, 60, 80]; // Corresponds to size 1, 2, 3, 4
  const distances = [100, 200, 300, 400]; // Corresponds to distance 1, 2, 3, 4
  const numberOfTargets = 40; // Reduce to 10 for testing
  const marginSize = 20; // Margin size around the target area

  const screenWidth = window.innerWidth - 2 * marginSize;
  const screenHeight = window.innerHeight - 2 * marginSize;

  //Initialize participant vars and targets
  let targetIndex = 0;
  let lastClickTime = performance.now();
  let lastTargetX, lastTargetY;
  let participantID = null;
  let handPreference = null;

  document.body.style.fontFamily = "'Arial', 'Helvetica', sans-serif";

  const experimentArea = document.createElement("div");
  experimentArea.style.position = "absolute";
  experimentArea.style.left = `${marginSize}px`;
  experimentArea.style.top = `${marginSize}px`;
  experimentArea.style.width = `${screenWidth}px`;
  experimentArea.style.height = `${screenHeight}px`;
  experimentArea.style.border = "3px solid #333";
  experimentArea.style.boxSizing = "border-box";
  experimentArea.style.display = "none"; // Initially hidden
  document.body.appendChild(experimentArea);

  const timeDisplay = document.createElement("div");
  timeDisplay.style.position = "absolute";
  timeDisplay.style.top = "10px";
  timeDisplay.style.right = "10px";
  timeDisplay.style.fontSize = "20px";
  experimentArea.appendChild(timeDisplay);

  const target = document.createElement("div");
  target.style.position = "absolute";
  target.style.backgroundColor = "red";
  target.style.borderRadius = "50%";
  target.style.cursor = "pointer"; // Make sure the cursor changes to a pointer over the target
  target.style.display = "none"; // Initially hidden
  experimentArea.appendChild(target);

  const footer = document.createElement("footer");
  footer.style.position = "fixed";
  footer.style.bottom = "0";
  footer.style.left = "0";
  footer.style.width = "100%";
  footer.style.height = "30px";
  footer.style.display = "flex";
  footer.style.justifyContent = "center";
  footer.style.alignItems = "center";
  footer.style.backgroundColor = "#f8f8f8";
  footer.style.borderTop = "1px solid #333";
  footer.textContent =
    "Developed by SR with inspiration from http://simonwallner.at/ext/fitts/ and assistance from ChatGPT";
  document.body.appendChild(footer);

  const surveyForm = document.createElement("form");
  surveyForm.style.position = "fixed";
  surveyForm.style.top = "40%";
  surveyForm.style.left = "50%";
  surveyForm.style.transform = "translate(-50%, -50%)";
  surveyForm.style.padding = "20px";
  surveyForm.style.border = "2px solid #333";
  surveyForm.style.backgroundColor = "#f8f8f8";
  surveyForm.style.textAlign = "center";
  document.body.appendChild(surveyForm);

  const surveyTitle = document.createElement("h2");
  const surveyText = document.createElement("p");
  surveyText.textContent =
    "Welcome to the Fitts' Law Experiment! Try to hover over the red targets as quickly as possible. Enter a participant ID and Dominant or Non-Dominant hand and then click the start button below to begin.";
  surveyTitle.textContent = "Fitts' Law Experiment";
  surveyForm.appendChild(surveyTitle);
  surveyForm.appendChild(surveyText);

  const participantIDLabel = document.createElement("label");
  participantIDLabel.textContent = "Participant ID (1-20): ";
  surveyForm.appendChild(participantIDLabel);

  const participantIDInput = document.createElement("input");
  participantIDInput.type = "number";
  participantIDInput.min = "1";
  participantIDInput.max = "20";
  participantIDInput.required = true;
  participantIDInput.style.marginBottom = "10px";
  participantIDInput.style.width = "60px";
  participantIDInput.addEventListener("input", validateParticipantID);
  surveyForm.appendChild(participantIDInput);

  const idError = document.createElement("div");
  idError.style.color = "red";
  idError.style.fontSize = "12px";
  idError.style.marginTop = "5px";
  idError.style.display = "none";
  idError.textContent = "Please enter a valid Participant ID between 1 and 20.";
  surveyForm.appendChild(idError);

  surveyForm.appendChild(document.createElement("br"));

  const handLabel = document.createElement("label");
  handLabel.textContent = "Hand Used: ";
  surveyForm.appendChild(handLabel);

  const dominantButton = document.createElement("input");
  dominantButton.type = "radio";
  dominantButton.name = "hand";
  dominantButton.value = "Dominant";
  dominantButton.style.marginLeft = "10px";
  dominantButton.addEventListener("change", () => {
    handPreference = "Dominant";
    checkFormCompletion();
  });
  surveyForm.appendChild(dominantButton);
  const dominantLabel = document.createElement("label");
  dominantLabel.textContent = "Dominant";
  surveyForm.appendChild(dominantLabel);

  const nonDominantButton = document.createElement("input");
  nonDominantButton.type = "radio";
  nonDominantButton.name = "hand";
  nonDominantButton.value = "Non-Dominant";
  nonDominantButton.style.marginLeft = "10px";
  nonDominantButton.addEventListener("change", () => {
    handPreference = "Non-Dominant";
    checkFormCompletion();
  });
  surveyForm.appendChild(nonDominantButton);
  const nonDominantLabel = document.createElement("label");
  nonDominantLabel.textContent = "Non-Dominant";
  surveyForm.appendChild(nonDominantLabel);

  surveyForm.appendChild(document.createElement("br"));

  const startButton = document.createElement("button");
  startButton.textContent = "Click to Start";
  const startButtonRect = startButton.getBoundingClientRect();
  const startButtonX = startButtonRect.left + startButtonRect.width / 2;
  const startButtonY = startButtonRect.top + startButtonRect.height / 2;

  startButton.style.marginTop = "20px";
  startButton.style.padding = "10px 20px";
  startButton.style.fontSize = "20px";
  startButton.style.cursor = "pointer";
  startButton.disabled = true; // Initially disabled until form is completed
  surveyForm.appendChild(startButton);

  // Disable "Enter" key on the form to prevent starting with the keyboard
  surveyForm.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  function validateParticipantID() {
    const idValue = parseInt(participantIDInput.value, 10);
    if (idValue >= 1 && idValue <= 20) {
      participantID = idValue;
      idError.style.display = "none";
    } else {
      participantID = null;
      idError.style.display = "block";
    }
    checkFormCompletion();
  }

  function checkFormCompletion() {
    startButton.disabled = !(participantID && handPreference);
  }

  const data = [];

  function setRandomPositionAndSize() {
    const targetSize =
      targetSizes[Math.floor(Math.random() * targetSizes.length)];
    target.style.width = targetSize + "px";
    target.style.height = targetSize + "px";

    let newX, newY;
    let distance = 0;

    if (targetIndex === 0) {
      // Pick a random distance from the distances array
      distance = distances[Math.floor(Math.random() * distances.length)];
      const angle = Math.random() * 2 * Math.PI;

      // Calculate the new position based on the start button's center
      newX = startButtonX + distance * Math.cos(angle);
      newY = startButtonY + distance * Math.sin(angle);

      // Ensure the target stays within bounds
      newX = Math.max(0, Math.min(newX, screenWidth - targetSize));
      newY = Math.max(0, Math.min(newY, screenHeight - targetSize));
    } else {
      distance = distances[Math.floor(Math.random() * distances.length)];
      const angle = Math.random() * 2 * Math.PI;
      newX = lastTargetX + distance * Math.cos(angle);
      newY = lastTargetY + distance * Math.sin(angle);

      // Ensure the target stays fully within bounds
      newX = Math.max(0, Math.min(newX, screenWidth - targetSize));
      newY = Math.max(0, Math.min(newY, screenHeight - targetSize));
    }

    lastTargetX = newX;
    lastTargetY = newY;

    target.style.left = newX + "px";
    target.style.top = newY + "px";
    target.style.display = "block"; // Ensure the target is displayed

    // Ensure that the data array has an entry for this target
    data[targetIndex] = {
      id: targetIndex + 1,
      size: targetSize,
      distance: distance.toFixed(2), // Record distance
      time: 0,
    };
  }

  function onMouseoverTarget() {
    const currentTime = performance.now();
    const timeTaken = currentTime - lastClickTime;
    lastClickTime = currentTime;

    // Update the time for the current target in data array
    data[targetIndex].time = timeTaken.toFixed(2);

    timeDisplay.textContent = `Time: ${timeTaken.toFixed(2)} ms`;

    targetIndex++;
    if (targetIndex < numberOfTargets) {
      setRandomPositionAndSize();
    } else {
      target.style.display = "none";
      timeDisplay.style.display = "none";
      showResults();
    }
  }

  function startExperiment(event) {
    event.preventDefault(); // Prevent form submission
    surveyForm.style.display = "none"; // Hide the survey form
    experimentArea.style.display = "block";
    setRandomPositionAndSize();
    lastClickTime = performance.now(); // Start the timer
  }

  startButton.addEventListener("click", startExperiment);
  target.addEventListener("mouseover", onMouseoverTarget);

  // Function to detect outliers
  function detectOutliers(dataArray) {
    const values = [...dataArray];
    values.sort((a, b) => a - b);
    const q1 = values[Math.floor(values.length / 4)];
    const q3 = values[Math.ceil(values.length * (3 / 4))];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return dataArray.map((x) => x < lowerBound || x > upperBound);
  }

  function showResults() {
    experimentArea.innerHTML = ""; // Clear the screen

    const topContainer = document.createElement("div");
    topContainer.style.width = "100%";
    topContainer.style.height = "30%"; // Smaller height for the top chart
    experimentArea.appendChild(topContainer);

    const bottomContainer = document.createElement("div");
    bottomContainer.style.width = "100%";
    bottomContainer.style.height = "30%"; // Smaller height for the bottom chart
    experimentArea.appendChild(bottomContainer);

    const messageContainer = document.createElement("div");
    messageContainer.style.width = "100%";
    messageContainer.style.height = "30%"; // Reserve some space for the outlier message
    messageContainer.style.display = "flex";
    messageContainer.style.justifyContent = "center";
    messageContainer.style.alignItems = "center";
    experimentArea.appendChild(messageContainer);

    const downloadButtonContainer = document.createElement("div");
    downloadButtonContainer.style.width = "100%";
    downloadButtonContainer.style.height = "10%";
    downloadButtonContainer.style.display = "flex";
    downloadButtonContainer.style.justifyContent = "center";
    downloadButtonContainer.style.alignItems = "center";
    experimentArea.appendChild(downloadButtonContainer);

    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download Data";
    downloadButton.style.padding = "10px 20px";
    downloadButton.style.fontSize = "16px";
    downloadButtonContainer.appendChild(downloadButton);

    downloadButton.addEventListener("click", downloadResults);

    const topCanvas = document.createElement("canvas");
    topCanvas.id = "scatterPlot";
    topCanvas.width = topContainer.clientWidth;
    topCanvas.height = topContainer.clientHeight;
    topContainer.appendChild(topCanvas);

    const bottomCanvas = document.createElement("canvas");
    bottomCanvas.id = "fittsLawPlot";
    bottomCanvas.width = bottomContainer.clientWidth;
    bottomCanvas.height = bottomContainer.clientHeight;
    bottomContainer.appendChild(bottomCanvas);

    // Detect outliers in the data
    const times = data.map((item) => parseFloat(item.time));
    const outlierFlags = detectOutliers(times);
    const outliersExist = outlierFlags.includes(true);
    const message = outliersExist
      ? "Outliers were detected in the data."
      : "No outliers were detected in the data.";
    const outlierMessage = document.createElement("h3");
    outlierMessage.textContent = message;
    messageContainer.appendChild(outlierMessage);

    // Separate outliers and non-outliers for graphing
    const normalData = data.filter((_, i) => !outlierFlags[i]);
    const outlierData = data.filter((_, i) => outlierFlags[i]);

    // Scatter Plot (Top)
    const scatterCtx = topCanvas.getContext("2d");
    const scatterData = {
      datasets: [
        {
          label: "Distance vs Time (Normal)",
          data: normalData.map((d) => ({
            x: d.distance,
            y: d.time,
            r: d.size / 4, // Scale size for better visibility
            id: d.id,
          })),
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Outliers",
          data: outlierData.map((d) => ({
            x: d.distance,
            y: d.time,
            r: d.size / 4, // Scale size for better visibility
            id: d.id,
          })),
          backgroundColor: "rgba(255, 0, 0, 0.5)", // Outliers now in red
          borderColor: "rgba(255, 0, 0, 1)",
          borderWidth: 1,
        },
      ],
    };

    new Chart(scatterCtx, {
      type: "bubble",
      data: scatterData,
      options: {
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            title: {
              display: true,
              text: "Distance (px)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Time (ms)",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const item = context.raw;
                return `Target ID: ${item.id}\nSize: ${
                  item.r * 4
                }px, Distance: ${item.x}px, Time: ${item.y}ms`;
              },
            },
          },
          datalabels: {
            anchor: "end",
            align: "end",
            formatter: (value, context) =>
              context.dataset.data[context.dataIndex].id,
            color: "black",
          },
        },
      },
    });

    // Fitts' Law Prediction vs. Actual Time Plot (Bottom)
    const fittsCtx = bottomCanvas.getContext("2d");

    const predictedTimes = data.map(
      (d) => 50 + 150 * Math.log2(1 + d.distance / d.size)
    );

    const fittsLawData = {
      labels: data.map((d) => `Target ${d.id}`),
      datasets: [
        {
          label: "Actual Time (ms) (Normal)",
          data: normalData.map((d) => ({ x: d.id, y: d.time })),
          borderColor: "rgba(54, 162, 235, 1)",
          fill: false,
          spanGaps: true, // Avoid gaps for null values
        },
        {
          label: "Predicted Time (ms)",
          data: data.map((d, i) => ({
            x: d.id,
            y: predictedTimes[i].toFixed(2),
          })),
          borderColor: "rgba(255, 99, 132, 1)",
          fill: false,
          borderDash: [5, 5],
        },
        {
          label: "Outliers",
          data: outlierData.map((d) => ({ x: d.id, y: d.time })),
          borderColor: "rgba(255, 0, 0, 1)", // Outliers now in red
          backgroundColor: "rgba(255, 0, 0, 0.5)",
          fill: false,
          pointBackgroundColor: "rgba(255, 0, 0, 1)",
          pointBorderColor: "rgba(255, 0, 0, 1)",
          pointRadius: 5,
        },
      ],
    };

    new Chart(fittsCtx, {
      type: "line",
      data: fittsLawData,
      options: {
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "linear",
            title: {
              display: true,
              text: "Target Number",
            },
            ticks: {
              autoSkip: false, // Show every target
            },
          },
          y: {
            title: {
              display: true,
              text: "Time (ms)",
            },
          },
        },
        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });
  }

  function downloadResults() {
    const csvContent = [
      ["Participant ID", participantID],
      ["Hand Preference", handPreference],
      [],
      ["Target ID", "Size", "Distance (px)", "Time (ms)"],
      ...data.map((d) => [d.id, d.size, d.distance, d.time]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `log_${participantID}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});
