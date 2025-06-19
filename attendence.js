
let attendanceData = JSON.parse(localStorage.getItem("attendanceData") || "{}");

function markAttendance(status) {
  const subject = document.getElementById("subjectInput").value.trim();
  const date = document.getElementById("dateInput").value;

  if (!subject || !date) {
    alert("Please fill both subject and date!");
    return;
  }

  if (!attendanceData[subject]) {
    attendanceData[subject] = [];
  }

  attendanceData[subject].push({ date, status });
  localStorage.setItem("attendanceData", JSON.stringify(attendanceData));

  document.getElementById("subjectInput").value = "";
  document.getElementById("dateInput").value = "";

  renderSubjects();
}

function renderSubjects() {
  const subjectList = document.getElementById("subjectList");
  subjectList.innerHTML = "";

  Object.keys(attendanceData).forEach(subject => {
    const item = document.createElement("div");
    item.className = "chat-item";
    item.innerText = subject;
    item.onclick = () => showSubjectDetails(subject);
    subjectList.appendChild(item);
  });
}

let currentlyOpenSubject = null;

function showSubjectDetails(subject) {
  const detailsDiv = document.getElementById("subjectDetails");

  // If the same subject is clicked again, close it
  if (currentlyOpenSubject === subject) {
    detailsDiv.innerHTML = "";
    currentlyOpenSubject = null;
    return;
  }

  // Otherwise, show details
  const records = attendanceData[subject];
  const total = records.length;
  const present = records.filter(r => r.status === "Present").length;
  const percent = ((present / total) * 100).toFixed(1);

  let html = `<h3>📖 ${subject} - Attendance</h3>`;
  html += `<p>✅ Present: ${present} / ${total} (${percent}%)</p><ul>`;

  records.forEach(r => {
    html += `<li>${r.date} - ${r.status}</li>`;
  });

  html += "</ul>";
  detailsDiv.innerHTML = html;
  currentlyOpenSubject = subject;
}


// Initial render
renderSubjects();
