const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let times = JSON.parse(localStorage.getItem("timeSlots")) || ["8:40-9:40 AM", "9:40-10:40 AM", "11:10-12:10 PM", "12:10-1:10 PM","2:00-2:50 PM","2:50-3:40 PM"];

const timetableEl = document.getElementById("timetable");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");

let editable = false;

function getSavedData() {
  const data = localStorage.getItem("smartTimetable");
  if (data) return JSON.parse(data);

  const empty = {};
  for (let d of days) {
    empty[d] = {};
    for (let t of times) {
      empty[d][t] = "";
    }
  }
  return empty;
}

let timetableData = getSavedData();

function renderTable(editMode = false) {
  let html = `<div class="timetable-header"></div>`;
  for (let t of times) {
    html += `<div class="timetable-header">${t}</div>`;
  }

  for (let d of days) {
    html += `<div class="time-label">${d}</div>`;
    for (let t of times) {
      if (!timetableData[d]) timetableData[d] = {};
      if (!timetableData[d][t]) timetableData[d][t] = "";
      let val = timetableData[d][t];
      if (editMode) {
        html += `
          <div class="timetable-cell editable">
            <input 
              type="text" 
              data-day="${d}" 
              data-time="${t}" 
              value="${val}" 
              placeholder="Add task..."
            />
          </div>`;
      } else {
        html += `<div class="timetable-cell" data-day="${d}" data-time="${t}">${val || ""}</div>`;
      }
    }
  }
  timetableEl.innerHTML = html;
  timetableEl.style.gridTemplateColumns = `repeat(${times.length + 1}, 1fr)`;
}

function saveData() {
  const inputs = document.querySelectorAll("#timetable input[type='text']");
  inputs.forEach((input) => {
    const day = input.getAttribute("data-day");
    const time = input.getAttribute("data-time");
    timetableData[day][time] = input.value.trim();
  });
  localStorage.setItem("smartTimetable", JSON.stringify(timetableData));
  localStorage.setItem("timeSlots", JSON.stringify(times));
}

function addTimeSlot() {
  const slotInput = document.getElementById("newTimeSlot");
  const newSlot = slotInput.value.trim();

  if (newSlot && !times.includes(newSlot)) {
    times.push(newSlot);
    for (let d of days) {
      if (!timetableData[d]) timetableData[d] = {};
      timetableData[d][newSlot] = "";
    }
    localStorage.setItem("timeSlots", JSON.stringify(times));
    slotInput.value = "";
    renderTable(editable);
  } else {
    alert("Please enter a unique and valid time slot.");
  }
}

editBtn.addEventListener("click", () => {
  editable = true;
  renderTable(true);
  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
});

saveBtn.addEventListener("click", () => {
  saveData();
  editable = false;
  renderTable(false);
  saveBtn.style.display = "none";
  editBtn.style.display = "inline-block";
});

clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all saved timetable data?")) {
    localStorage.removeItem("smartTimetable");
    localStorage.removeItem("timeSlots");
    times = ["8:40-9:40 AM", "9:40-10:40 AM", "11:10-12:10 PM", "12:10-1:10 PM","2:00-2:50 PM","2:50-3:40 PM"];
    timetableData = {};
    for (let d of days) {
      timetableData[d] = {};
      for (let t of times) {
        timetableData[d][t] = "";
      }
    }
    editable = false;
    renderTable(false);
    saveBtn.style.display = "none";
    editBtn.style.display = "inline-block";
  }
});

function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  document.getElementById("currentTime").textContent = `Current Time: ${timeString}`;
}

function parseTimeToMinutes(timeStr) {
  const [time, modifier] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}


function checkCurrentPeriod() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue", etc.
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const current = JSON.parse(localStorage.getItem("smartTimetable")) || {};
  const today = current[currentDay];

  // Remove old glow
  document.querySelectorAll('.timetable-cell.glow').forEach(cell => {
    cell.classList.remove('glow');
  });

  if (!today) {
    document.getElementById("currentPeriod").textContent = "Current Period: No classes today";
    return;
  }

  let match = "Free Time / Break";

  for (let time in today) {
    let original = time;
    let [startRaw, endRaw] = time.split("-");
    if (!startRaw || !endRaw) continue;

    startRaw = startRaw.trim();
    endRaw = endRaw.trim();

    // Add AM/PM if missing
    if (!startRaw.includes("AM") && !startRaw.includes("PM")) {
      const suffix = endRaw.includes("AM") ? "AM" : "PM";
      startRaw += ` ${suffix}`;
    }
    if (!endRaw.includes("AM") && !endRaw.includes("PM")) {
      const suffix = startRaw.includes("AM") ? "AM" : "PM";
      endRaw += ` ${suffix}`;
    }

    const startMin = parseTimeToMinutes(startRaw);
    const endMin = parseTimeToMinutes(endRaw);
    if (isNaN(startMin) || isNaN(endMin)) continue;

    if (currentTime >= startMin && currentTime < endMin) {
      match = today[time];

      // Normalize and select the cell
      const selector = `.timetable-cell[data-day="${currentDay}"][data-time="${original.replace(/\s+/g, ' ').trim()}"]`;
      const cell = document.querySelector(selector);
      if (cell) {
        cell.classList.add("glow");
      }
      break;
    }
  }

  document.getElementById("currentPeriod").textContent = `Current Period: ${match}`;
}

updateTime();
checkCurrentPeriod();
renderTable(false);

setInterval(updateTime, 1000); 
setInterval(checkCurrentPeriod, 3000); 
