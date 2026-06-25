let leads = JSON.parse(localStorage.getItem("crmLeads")) || [];

function saveLeads() {
  localStorage.setItem("crmLeads", JSON.stringify(leads));
}

function calculateLeadScore(businessSize, digitalPresence, leadNeed, notes) {
  let score = 40;

  if (businessSize === "Small") score += 8;
  if (businessSize === "Medium") score += 14;
  if (businessSize === "Large") score += 18;

  if (digitalPresence === "Weak") score += 22;
  if (digitalPresence === "Average") score += 14;
  if (digitalPresence === "Strong") score += 6;

  if (leadNeed === "More appointments") score += 14;
  if (leadNeed === "Better follow-up") score += 16;
  if (leadNeed === "More qualified leads") score += 18;
  if (leadNeed === "Automation support") score += 20;

  const lowerNotes = notes.toLowerCase();

  const painKeywords = [
    "outdated",
    "slow",
    "manual",
    "weak",
    "no booking",
    "no automation",
    "poor follow-up",
    "low leads",
    "no crm"
  ];

  painKeywords.forEach((keyword) => {
    if (lowerNotes.includes(keyword)) {
      score += 3;
    }
  });

  return Math.min(score, 100);
}

function getPainPoint(digitalPresence, leadNeed, notes) {
  if (digitalPresence === "Weak") {
    return "The business may be losing leads because its online presence looks weak or under-optimized.";
  }

  if (leadNeed === "Better follow-up") {
    return "The business may be losing potential customers because follow-up is not structured or automated.";
  }

  if (leadNeed === "More appointments") {
    return "The business may need a better appointment booking and lead capture system.";
  }

  if (leadNeed === "More qualified leads") {
    return "The business may be attracting leads, but not enough high-quality prospects.";
  }

  if (leadNeed === "Automation support") {
    return "The business may benefit from automating repetitive lead generation and follow-up tasks.";
  }

  return notes || "The business may need a clearer digital growth and lead generation system.";
}

function getOutreachAngle(businessName, industry, leadNeed, painPoint) {
  return `Hi ${businessName}, I noticed your business is in the ${industry} space. One possible opportunity is improving your ${leadNeed.toLowerCase()} process.

${painPoint}

A simple AI-powered workflow could help organize leads, improve response speed, and create a more consistent follow-up system.`;
}

function addLead() {
  const businessName = document.getElementById("businessName").value.trim();
  const industry = document.getElementById("industry").value.trim();
  const location = document.getElementById("location").value.trim();
  const website = document.getElementById("website").value.trim();
  const businessSize = document.getElementById("businessSize").value;
  const digitalPresence = document.getElementById("digitalPresence").value;
  const leadNeed = document.getElementById("leadNeed").value;
  const notes = document.getElementById("notes").value.trim();

  if (
    !businessName ||
    !industry ||
    !location ||
    !website ||
    !businessSize ||
    !digitalPresence ||
    !leadNeed ||
    !notes
  ) {
    alert("Please fill in all fields before adding the lead.");
    return;
  }

  const score = calculateLeadScore(businessSize, digitalPresence, leadNeed, notes);
  const painPoint = getPainPoint(digitalPresence, leadNeed, notes);
  const outreachAngle = getOutreachAngle(businessName, industry, leadNeed, painPoint);

  const lead = {
    id: Date.now(),
    businessName,
    industry,
    location,
    website,
    businessSize,
    digitalPresence,
    leadNeed,
    notes,
    score,
    painPoint,
    outreachAngle,
    status: "New",
    createdAt: new Date().toLocaleDateString()
  };

  leads.unshift(lead);
  saveLeads();

  document.getElementById("latestSummary").textContent =
    `${businessName} is a ${businessSize.toLowerCase()} ${industry} business located in ${location}. ` +
    `Digital presence is ${digitalPresence.toLowerCase()}, and the main lead generation need is ${leadNeed.toLowerCase()}. ` +
    `Lead score: ${score}/100. Pain point: ${painPoint}`;

  document.getElementById("latestOutreach").textContent = outreachAngle;

  clearForm();
  renderLeads();
}

function clearForm() {
  document.getElementById("businessName").value = "";
  document.getElementById("industry").value = "";
  document.getElementById("location").value = "";
  document.getElementById("website").value = "";
  document.getElementById("businessSize").value = "";
  document.getElementById("digitalPresence").value = "";
  document.getElementById("leadNeed").value = "";
  document.getElementById("notes").value = "";
}

function getNextStatus(status) {
  if (status === "New") return "Contacted";
  if (status === "Contacted") return "Interested";
  if (status === "Interested") return "Closed";
  return "Closed";
}

function moveLead(id) {
  leads = leads.map((lead) => {
    if (lead.id === id) {
      return {
        ...lead,
        status: getNextStatus(lead.status)
      };
    }

    return lead;
  });

  saveLeads();
  renderLeads();
}

function changeStatus(id, newStatus) {
  leads = leads.map((lead) => {
    if (lead.id === id) {
      return {
        ...lead,
        status: newStatus
      };
    }

    return lead;
  });

  saveLeads();
  renderLeads();
}

function deleteLead(id) {
  const confirmDelete = confirm("Are you sure you want to delete this lead?");

  if (!confirmDelete) {
    return;
  }

  leads = leads.filter((lead) => lead.id !== id);
  saveLeads();
  renderLeads();
}

function getScoreClass(score) {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

function createLeadCard(lead) {
  const card = document.createElement("div");
  card.className = "lead-card";

  card.innerHTML = `
    <h4>${lead.businessName}</h4>
    <span class="score-pill">${lead.score}/100 • ${getScoreClass(lead.score)} Score</span>
    <p><strong>Industry:</strong> ${lead.industry}</p>
    <p><strong>Location:</strong> ${lead.location}</p>
    <p><strong>Need:</strong> ${lead.leadNeed}</p>
    <p><strong>Digital Presence:</strong> ${lead.digitalPresence}</p>
    <p><strong>Notes:</strong> ${lead.notes}</p>

    <select onchange="changeStatus(${lead.id}, this.value)">
      <option value="New" ${lead.status === "New" ? "selected" : ""}>New</option>
      <option value="Contacted" ${lead.status === "Contacted" ? "selected" : ""}>Contacted</option>
      <option value="Interested" ${lead.status === "Interested" ? "selected" : ""}>Interested</option>
      <option value="Closed" ${lead.status === "Closed" ? "selected" : ""}>Closed</option>
    </select>

    <div class="card-actions">
      <button onclick="moveLead(${lead.id})">Move Next</button>
      <button class="delete-btn" onclick="deleteLead(${lead.id})">Delete</button>
    </div>
  `;

  return card;
}

function renderLeads() {
  const searchValue = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const statusFilter = document.getElementById("statusFilter")?.value || "All";

  const columns = {
    New: document.getElementById("newLeads"),
    Contacted: document.getElementById("contactedLeads"),
    Interested: document.getElementById("interestedLeads"),
    Closed: document.getElementById("closedLeads")
  };

  Object.values(columns).forEach((column) => {
    if (column) {
      column.innerHTML = "";
    }
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.businessName.toLowerCase().includes(searchValue) ||
      lead.industry.toLowerCase().includes(searchValue) ||
      lead.location.toLowerCase().includes(searchValue);

    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  filteredLeads.forEach((lead) => {
    const card = createLeadCard(lead);
    columns[lead.status].appendChild(card);
  });

  updateStats();
}

function updateStats() {
  const total = leads.length;
  const highScore = leads.filter((lead) => lead.score >= 80).length;
  const followUp = leads.filter((lead) => lead.status === "New" || lead.status === "Contacted").length;

  const average =
    total === 0
      ? 0
      : Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / total);

  document.getElementById("totalLeads").textContent = total;
  document.getElementById("highScoreLeads").textContent = highScore;
  document.getElementById("averageScore").textContent = average;
  document.getElementById("followUpLeads").textContent = followUp;
}

function exportCSV() {
  if (leads.length === 0) {
    alert("No leads available to export.");
    return;
  }

  const headers = [
    "Business Name",
    "Industry",
    "Location",
    "Website",
    "Business Size",
    "Digital Presence",
    "Lead Need",
    "Lead Score",
    "Status",
    "Notes"
  ];

  const rows = leads.map((lead) => [
    lead.businessName,
    lead.industry,
    lead.location,
    lead.website,
    lead.businessSize,
    lead.digitalPresence,
    lead.leadNeed,
    lead.score,
    lead.status,
    lead.notes
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "business-leads-crm-export.csv";
  link.click();

  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", renderLeads);
