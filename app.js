const events = [
  {
    id: "ev1",
    name: "Campus Tech Fest 2026",
    category: "Technology",
    date: "27 Jun, 10:00 AM",
    venue: "Hyderabad",
    price: 499,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "ev2",
    name: "AI Workshop Bootcamp",
    category: "Workshop",
    date: "03 Jul, 11:30 AM",
    venue: "Bengaluru",
    price: 799,
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "ev3",
    name: "Cultural Night Showcase",
    category: "Cultural",
    date: "11 Jul, 6:30 PM",
    venue: "Chennai",
    price: 599,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"
  }
];

const authForm = document.getElementById("authForm");
const authToggle = document.getElementById("authToggle");
const authMessage = document.getElementById("authMessage");
const authSubmit = document.getElementById("authSubmit");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const nameLabel = document.getElementById("nameLabel");
const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");
const eventsGrid = document.getElementById("eventsGrid");
const selectedEventTitle = document.getElementById("selectedEventTitle");
const selectedEventMeta = document.getElementById("selectedEventMeta");
const decrement = document.getElementById("decrement");
const increment = document.getElementById("increment");
const ticketCount = document.getElementById("ticketCount");
const goPaymentBtn = document.getElementById("goPaymentBtn");
const upiIdInput = document.getElementById("upiIdInput");
const generateQrBtn = document.getElementById("generateQrBtn");
const generatedQr = document.getElementById("generatedQr");
const openUpiBtn = document.getElementById("openUpiBtn");
const verifyPaymentBtn = document.getElementById("verifyPaymentBtn");
const paymentRef = document.getElementById("paymentRef");
const payAmount = document.getElementById("payAmount");
const summaryEvent = document.getElementById("summaryEvent");
const summaryPrice = document.getElementById("summaryPrice");
const summaryCount = document.getElementById("summaryCount");
const summaryTotal = document.getElementById("summaryTotal");
const statusText = document.getElementById("statusText");
const myBookingsList = document.getElementById("myBookingsList");

let isSignup = false;
let selectedEvent = null;
let selectedTickets = 1;
const page = window.location.pathname.split("/").pop() || "index.html";

function getUsers() {
  const rawUsers = JSON.parse(localStorage.getItem("users") || "[]");
  return rawUsers.map((user) => ({
    ...user,
    email: String(user.email || "").trim().toLowerCase()
  }));
}

function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem("session") || "null");
}

function setSession(session) {
  localStorage.setItem("session", JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem("session");
}

function getBookings(email) {
  return JSON.parse(localStorage.getItem(`bookings_${email}`) || "[]");
}

function setBookings(email, bookings) {
  localStorage.setItem(`bookings_${email}`, JSON.stringify(bookings));
}

function updateSummary() {
  if (!selectedEvent) return;
  const total = selectedEvent.price * selectedTickets;
  summaryEvent.textContent = selectedEvent.name;
  summaryPrice.textContent = `Rs. ${selectedEvent.price}`;
  summaryCount.textContent = String(selectedTickets);
  summaryTotal.textContent = `Rs. ${total}`;
}

function renderBookings() {
  const session = getSession();
  if (!session || !myBookingsList) return;
  const bookings = getBookings(session.email);
  if (!bookings.length) {
    myBookingsList.innerHTML = "<p class='muted'>No bookings yet.</p>";
    return;
  }
  myBookingsList.innerHTML = bookings
    .map(
      (booking) => `<article class="booking-item">
        <strong>${booking.eventName}</strong>
        <p class="muted">${booking.date} | ${booking.venue}</p>
        <p>Tickets: ${booking.tickets} | Total: Rs. ${booking.total}</p>
        <p class="muted">Payment ID: ${booking.paymentId || "N/A"}</p>
        <p class="muted">Booked on: ${booking.bookedAt}</p>
      </article>`
    )
    .join("");
}

function createUpiQrUrl(upiId, amount) {
  const cleanUpiId = upiId.trim().toLowerCase();
  const upiUrl = `upi://pay?pa=${encodeURIComponent(cleanUpiId)}&pn=${encodeURIComponent("Akshaya Events")}&am=${encodeURIComponent(amount.toFixed(2))}&cu=INR&tn=${encodeURIComponent("Event Booking")}`;
  const qrUrl = `https://quickchart.io/qr?size=320&text=${encodeURIComponent(upiUrl)}`;
  return { qrUrl, upiUrl };
}

function isValidUpiId(upiId) {
  return /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim());
}

function selectEvent(eventId) {
  selectedEvent = events.find((evt) => evt.id === eventId) || null;
  document.querySelectorAll(".event-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.id === eventId);
  });
  selectedTickets = 1;
  localStorage.setItem("selectedEventId", selectedEvent.id);
  window.location.href = "booking.html";
}

function renderEvents() {
  eventsGrid.innerHTML = events
    .map(
      (event) => `<article class="event-card" data-id="${event.id}">
        <img src="${event.image}" alt="${event.name}">
        <div class="event-card-content">
          <h3>${event.name}</h3>
          <p class="muted">${event.category}</p>
          <p class="muted">${event.date} | ${event.venue}</p>
          <p><strong>Rs. ${event.price}</strong></p>
        </div>
      </article>`
    )
    .join("");

  Array.from(document.querySelectorAll(".event-card")).forEach((card) => {
    card.addEventListener("click", () => {
      selectEvent(card.dataset.id);
    });
  });
}

function renderHeaderUser() {
  const session = getSession();
  if (session && welcomeUser) {
    welcomeUser.textContent = `Hi, ${session.name}`;
  }
}

function requireSession() {
  const session = getSession();
  if (!session && page !== "index.html") {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

function setupAuthPage() {
  if (!authForm || !authToggle) return;
  if (getSession()) {
    window.location.href = "events.html";
    return;
  }

  authToggle.addEventListener("click", () => {
    isSignup = !isSignup;
    nameLabel.classList.toggle("hidden", !isSignup);
    authName.classList.toggle("hidden", !isSignup);
    authName.required = isSignup;
    authSubmit.textContent = isSignup ? "Sign Up" : "Login";
    authToggle.textContent = isSignup
      ? "Already have an account? Login"
      : "Don't have an account? Sign up";
    authMessage.textContent = "";
  });

  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = authEmail.value.trim().toLowerCase();
    const password = authPassword.value.trim();
    const name = authName.value.trim();
    const users = getUsers();

    if (isSignup) {
      if (users.some((user) => user.email === email)) {
        authMessage.textContent = "Account already exists. Please login.";
        return;
      }
      users.push({ name, email, password });
      setUsers(users);
      setSession({ name, email });
      window.location.href = "events.html";
      return;
    }

    const userByEmail = users.find((user) => user.email === email);
    if (!userByEmail) {
      const autoName = email.split("@")[0] || "User";
      users.push({ name: autoName, email, password });
      setUsers(users);
      setSession({ name: autoName, email });
      authMessage.textContent = "New account created and logged in.";
      window.location.href = "events.html";
      return;
    }
    if (userByEmail.password !== password) {
      authMessage.textContent = "Incorrect password. Please try again.";
      return;
    }
    setSession({ name: userByEmail.name, email: userByEmail.email });
    window.location.href = "events.html";
  });
}

function setupBookingPage() {
  if (!ticketCount || !goPaymentBtn) return;
  const eventId = localStorage.getItem("selectedEventId");
  selectedEvent = events.find((evt) => evt.id === eventId) || null;
  if (!selectedEvent) {
    window.location.href = "events.html";
    return;
  }
  selectedTickets = 1;
  selectedEventTitle.textContent = selectedEvent.name;
  selectedEventMeta.textContent = `${selectedEvent.category} | ${selectedEvent.date} | ${selectedEvent.venue}`;
  updateSummary();

  increment.addEventListener("click", () => {
    selectedTickets = Math.min(10, selectedTickets + 1);
    ticketCount.textContent = String(selectedTickets);
    updateSummary();
  });

  decrement.addEventListener("click", () => {
    selectedTickets = Math.max(1, selectedTickets - 1);
    ticketCount.textContent = String(selectedTickets);
    updateSummary();
  });

  goPaymentBtn.addEventListener("click", () => {
    const draft = {
      eventId: selectedEvent.id,
      tickets: selectedTickets,
      total: selectedEvent.price * selectedTickets
    };
    localStorage.setItem("bookingDraft", JSON.stringify(draft));
    window.location.href = "payment.html";
  });
}

function setupPaymentPage() {
  if (!generatedQr || !verifyPaymentBtn) return;
  const session = getSession();
  const draft = JSON.parse(localStorage.getItem("bookingDraft") || "null");
  if (!draft) {
    window.location.href = "events.html";
    return;
  }
  selectedEvent = events.find((evt) => evt.id === draft.eventId) || null;
  if (!selectedEvent) {
    window.location.href = "events.html";
    return;
  }
  selectedTickets = draft.tickets;
  const total = draft.total;
  summaryEvent.textContent = selectedEvent.name;
  summaryPrice.textContent = `Rs. ${selectedEvent.price}`;
  summaryCount.textContent = String(selectedTickets);
  summaryTotal.textContent = `Rs. ${total}`;
  if (payAmount) payAmount.textContent = `Rs. ${total}`;

  const renderQr = () => {
    const upiId = upiIdInput.value.trim();
    if (!isValidUpiId(upiId)) {
      statusText.textContent = "Enter a valid UPI ID (example: akshaya@upi).";
      return false;
    }
    const { qrUrl, upiUrl } = createUpiQrUrl(upiId, total);
    generatedQr.src = qrUrl;
    if (openUpiBtn) {
      openUpiBtn.href = upiUrl;
    }
    return true;
  };
  renderQr();

  generateQrBtn.addEventListener("click", () => {
    const ok = renderQr();
    if (ok) {
      statusText.textContent = `QR generated for Rs. ${total}. Pay in PhonePe/GPay/Paytm.`;
    }
  });

  verifyPaymentBtn.addEventListener("click", () => {
    const ref = paymentRef.value.trim();
    if (ref.length < 6) {
      statusText.textContent = "Enter valid Payment ID / UTR to verify.";
      return;
    }
    const bookings = getBookings(session.email);
    bookings.unshift({
      eventName: selectedEvent.name,
      date: selectedEvent.date,
      venue: selectedEvent.venue,
      tickets: selectedTickets,
      total,
      paymentId: ref,
      bookedAt: new Date().toLocaleString()
    });
    setBookings(session.email, bookings);
    localStorage.removeItem("bookingDraft");
    statusText.textContent = "Payment verified. Booking successful.";
    statusText.classList.add("success");
    setTimeout(() => {
      window.location.href = "my-bookings.html";
    }, 800);
  });
}

function setupLogout() {
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });
}

const canvas = document.getElementById("backgroundAnimation");
const ctx = canvas.getContext("2d");
const particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles.length = 0;
  for (let i = 0; i < 70; i += 1) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((particle) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(168, 142, 255, 0.75)";
    ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  createParticles();
});

resizeCanvas();
createParticles();
drawParticles();

if (getSession()) {
  renderHeaderUser();
}

if (page === "index.html") {
  setupAuthPage();
} else if (requireSession()) {
  renderHeaderUser();
  setupLogout();
  if (page === "events.html") renderEvents();
  if (page === "booking.html") setupBookingPage();
  if (page === "payment.html") setupPaymentPage();
  if (page === "my-bookings.html") renderBookings();
}
