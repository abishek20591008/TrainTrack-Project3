// TrainTrack Project 3: jQuery is used for AJAX, event handling and DOM updates.

const API_BASE = "https://rata.digitraffic.fi/api/v1";
let stations = [];
let selectedStation = "HKI";

// Format an API timestamp as local Finnish time.
function formatTime(timestamp) {
  if (!timestamp) return "--:--";
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Helsinki"
  }).format(date);
}

// Display a status message using jQuery and Bootstrap alert classes.
function showStatus(message, type = "info") {
  $("#statusMessage")
    .removeClass("alert-info alert-danger alert-success alert-warning")
    .addClass(`alert-${type}`)
    .text(message)
    .removeClass("d-none");
}

function hideStatus() {
  $("#statusMessage").addClass("d-none");
}

// Load passenger stations from the Digitraffic REST API with jQuery AJAX.
function loadStations() {
  showStatus("Loading railway stations...");
  $.ajax({
    url: `${API_BASE}/metadata/stations`,
    method: "GET",
    dataType: "json"
  })
  .done(function (data) {
    stations = data
      .filter(station => station.passengerTraffic && station.stationName && station.stationShortCode)
      .sort((a, b) => a.stationName.localeCompare(b.stationName, "fi"));

    renderStationOptions(stations);
    $("#stationSelect").val(selectedStation);
    hideStatus();
    loadTimetable();
  })
  .fail(function () {
    showStatus("Could not load railway stations. Please refresh the page and try again.", "danger");
  });
}

// Build the station dropdown dynamically using jQuery DOM methods.
function renderStationOptions(list) {
  const $select = $("#stationSelect");
  $select.empty();

  if (!list.length) {
    $("<option>").val("").text("No matching stations").appendTo($select);
    return;
  }

  list.forEach(station => {
    $("<option>")
      .val(station.stationShortCode)
      .text(station.stationName)
      .appendTo($select);
  });
}

// Find the selected station's full name for the page heading.
function getSelectedStationName() {
  const station = stations.find(item => item.stationShortCode === selectedStation);
  return station ? station.stationName : selectedStation;
}

// Retrieve live trains for the selected station using jQuery AJAX.
function loadTimetable() {
  if (!selectedStation) return;

  const range = Number($("#timeRange").val()) || 120;
  const url = `${API_BASE}/live-trains/station/${encodeURIComponent(selectedStation)}`;

  $("#refreshButton").prop("disabled", true).find(".button-label").text("Loading...");
  $("#selectedStationName").text(getSelectedStationName());
  showStatus("Loading the latest timetable information...");

  $.ajax({
    url,
    method: "GET",
    dataType: "json",
    data: {
      arrived_trains: 0,
      departed_trains: 0,
      minutes_before_departure: 5,
      minutes_after_departure: range,
      minutes_before_arrival: 5,
      minutes_after_arrival: range
    }
  })
  .done(function (trains) {
    renderTimetables(Array.isArray(trains) ? trains : []);
    $("#lastUpdated").text(`Updated at ${formatTime(new Date().toISOString())}`);
    showStatus("Timetable updated successfully.", "success");
  })
  .fail(function (xhr) {
    renderTimetables([]);
    showStatus("Timetable data could not be loaded. The API may be temporarily unavailable. Please try again.", "danger");
  })
  .always(function () {
    $("#refreshButton").prop("disabled", false).find(".button-label").text("Refresh");
  });
}

// Select the timetable row for this station and classify it as arrival/departure.
function findStationRow(train, rowType) {
  if (!Array.isArray(train.timeTableRows)) return null;

  return train.timeTableRows.find(row =>
    row.stationShortCode === selectedStation &&
    row.type === rowType &&
    row.trainStopping !== false
  ) || null;
}

// Convert a station short code from the API into its readable station name.
function getStationNameByCode(shortCode) {
  const station = stations.find(item => item.stationShortCode === shortCode);
  return station ? station.stationName : shortCode || "";
}

// Find the next stop after a departure or the previous stop before an arrival.
function getRelatedStationName(train, selectedRow, direction) {
  const rows = train.timeTableRows || [];
  const selectedIndex = rows.indexOf(selectedRow);
  if (selectedIndex < 0) return "";

  if (direction === "departure") {
    for (let i = selectedIndex + 1; i < rows.length; i++) {
      if (rows[i].stationShortCode !== selectedStation && rows[i].type === "ARRIVAL") {
        return getStationNameByCode(rows[i].stationShortCode);
      }
    }
  } else {
    for (let i = selectedIndex - 1; i >= 0; i--) {
      if (rows[i].stationShortCode !== selectedStation && rows[i].type === "DEPARTURE") {
        return getStationNameByCode(rows[i].stationShortCode);
      }
    }
  }
  return "";
}

// Build each timetable entry safely with jQuery text() to avoid inserting API HTML.
function createTrainItem(train, row, direction) {
  const destination = getRelatedStationName(train, row, direction);

  const time = row.liveEstimateTime || row.scheduledTime;
  const trainType = [train.trainType, train.trainNumber].filter(Boolean).join(" ");
  const track = row.commercialTrack || "—";
  const isCancelled = Boolean(train.cancelled);

  const $item = $("<div>").addClass("list-group-item train-item");
  const $row = $("<div>").addClass("d-flex align-items-center gap-3");
  $("<div>").addClass("train-time").text(formatTime(time)).appendTo($row);

  const $details = $("<div>").addClass("flex-grow-1 min-w-0");
  $("<div>").addClass("train-destination text-truncate")
    .text(destination || (direction === "departure" ? "Destination not available" : "Origin not available"))
    .appendTo($details);
  $("<div>").addClass("train-meta").text(`${trainType} · Track ${track}`).appendTo($details);

  const $badge = $("<span>").addClass("badge track-badge").text(isCancelled ? "Cancelled" : "Scheduled");
  if (isCancelled) $badge.removeClass("track-badge").addClass("text-bg-danger");
  $row.append($details, $badge);
  $item.append($row);
  return $item;
}

// Find the next station name from the train's timetable rows.
function getStationName(rows, rowType) {
  if (!Array.isArray(rows)) return "";
  const index = rows.findIndex(row =>
    row.stationShortCode === selectedStation && row.type === (rowType === "ARRIVAL" ? "DEPARTURE" : "ARRIVAL")
  );
  if (index === -1) return "";
  const step = rowType === "ARRIVAL" ? 1 : -1;
  for (let i = index + step; i >= 0 && i < rows.length; i += step) {
    if (rows[i].stationName) return rows[i].stationName;
  }
  return "";
}

// Render departure and arrival cards based on timetable rows at the selected station.
function renderTimetables(trains) {
  const $departures = $("#departuresList").empty();
  const $arrivals = $("#arrivalsList").empty();
  let departureCount = 0;
  let arrivalCount = 0;

  // Keep only timetable events from the recent past through the selected future range.
  const now = Date.now();
  const rangeMs = (Number($("#timeRange").val()) || 120) * 60 * 1000;
  const earliestAllowed = now - 5 * 60 * 1000;
  const latestAllowed = now + rangeMs;

  trains.forEach(train => {
    const departureRow = findStationRow(train, "DEPARTURE");
    const arrivalRow = findStationRow(train, "ARRIVAL");

    if (departureRow) {
      const departureTime = new Date(departureRow.liveEstimateTime || departureRow.scheduledTime).getTime();
      if (departureTime >= earliestAllowed && departureTime <= latestAllowed) {
        $departures.append(createTrainItem(train, departureRow, "departure"));
        departureCount++;
      }
    }
    if (arrivalRow) {
      const arrivalTime = new Date(arrivalRow.liveEstimateTime || arrivalRow.scheduledTime).getTime();
      if (arrivalTime >= earliestAllowed && arrivalTime <= latestAllowed) {
        $arrivals.append(createTrainItem(train, arrivalRow, "arrival"));
        arrivalCount++;
      }
    }
  });

  if (!departureCount) {
    $("<div>").addClass("empty-state").text("No departures found for this time range.").appendTo($departures);
  }
  if (!arrivalCount) {
    $("<div>").addClass("empty-state").text("No arrivals found for this time range.").appendTo($arrivals);
  }
}

// jQuery event listener: filter station choices while the user types.
$("#stationSearch").on("input", function () {
  const searchText = $(this).val().trim().toLocaleLowerCase("fi");
  const filtered = stations.filter(station =>
    station.stationName.toLocaleLowerCase("fi").includes(searchText)
  );
  renderStationOptions(filtered);
});

// jQuery event listener: load the selected station's timetable.
$("#stationSelect").on("change", function () {
  selectedStation = $(this).val();
  if (selectedStation) loadTimetable();
});

// jQuery event listeners: refresh timetable and update selected time range.
$("#refreshButton").on("click", loadTimetable);
$("#timeRange").on("change", loadTimetable);

// Start the application after the HTML document is ready.
$(document).ready(function () {
  loadStations();
});
