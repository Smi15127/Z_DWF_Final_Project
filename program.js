// Keys
const WORKOUTS_KEY = "workouts";
const CALENDAR_KEY = "calendar";

// Load data
function getWorkouts() {
    return JSON.parse(localStorage.getItem(WORKOUTS_KEY)) || [];
}

function saveWorkouts(workouts) {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

function getCalendar() {
    return JSON.parse(localStorage.getItem(CALENDAR_KEY)) || {};
}

function saveCalendar(data) {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(data));
}

// Workouts page
function loadWorkouts() {
    const list = document.getElementById("workoutList");
    if (!list) return;

    list.innerHTML = "";
    const workouts = getWorkouts();

    workouts.forEach((w, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${w.name}</strong>
            <p>${w.details}</p>
            <button onclick="deleteWorkout(${index})">Delete</button>
        `;
        list.appendChild(li);
    });
}

function addWorkout(event) {
    event.preventDefault();

    const name = document.getElementById("workoutName").value;
    const details = document.getElementById("workoutDetails").value;

    const workouts = getWorkouts();
    workouts.push({ name, details });

    saveWorkouts(workouts);
    loadWorkouts();

    event.target.reset();
}

function deleteWorkout(index) {
    const workouts = getWorkouts();
    workouts.splice(index, 1);
    saveWorkouts(workouts);
    loadWorkouts();
}

// Calendar page
function setupCalendar() {
    const days = document.querySelectorAll("td[data-day]");
    if (!days.length) return;

    days.forEach(day => {
        day.addEventListener("click", () => openModal(day.dataset.day));
    });

    renderCalendar();
}

function openModal(day) {
    const modal = document.getElementById("modal");
    modal.style.display = "block";

    document.getElementById("selectedDay").innerText = "Day " + day;

    const workouts = getWorkouts();
    const select = document.getElementById("workoutSelect");
    select.innerHTML = "";

    workouts.forEach(w => {
        const option = document.createElement("option");
        option.value = w.name;
        option.textContent = w.name;
        select.appendChild(option);
    });

    document.getElementById("saveDay").onclick = () => saveDay(day);
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function saveDay(day) {
    const workout = document.getElementById("workoutSelect").value;
    const completed = document.getElementById("completedCheck").checked;

    const calendar = getCalendar();
    calendar[day] = { workout, completed };

    saveCalendar(calendar);
    closeModal();
    renderCalendar();
}

function renderCalendar() {
    const calendar = getCalendar();

    document.querySelectorAll("td[data-day]").forEach(td => {
        const day = td.dataset.day;
        td.classList.remove("completed");

        if (calendar[day]) {
            td.innerHTML = `${day}<br>${calendar[day].workout}`;

            if (calendar[day].completed) {
                td.classList.add("completed");
            }
        }
    });
}

// Home page
function loadRecentWorkouts() {
    const list = document.getElementById("recentList");
    if (!list) return;

    list.innerHTML = "";
    const calendar = getCalendar();

    Object.keys(calendar).forEach(day => {
        if (calendar[day].completed) {
            const li = document.createElement("li");
            li.textContent = `Day ${day}: ${calendar[day].workout} ✅`;
            list.appendChild(li);
        }
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadWorkouts();
    setupCalendar();
    loadRecentWorkouts();

    const form = document.getElementById("workoutForm");
    if (form) form.addEventListener("submit", addWorkout);
});


// Import/export
function exportData() {
    const data = {
        workouts: getWorkouts(),
        calendar: getCalendar()
    };

    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "workout-data.json";
    a.click();

    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data.workouts && data.calendar) {
                saveWorkouts(data.workouts);
                saveCalendar(data.calendar);

                alert("Data imported successfully!");

                loadWorkouts();
                setupCalendar();
                loadRecentWorkouts();
            } else {
                alert("Invalid file format.");
            }
        } catch (err) {
            alert("Error reading file.");
        }
    };

    reader.readAsText(file);
}