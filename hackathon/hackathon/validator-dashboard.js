const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName");

if (!userId || localStorage.getItem("userRole") !== "validator") {
  window.location.href = "login.html";
}

document.getElementById("userNameDisplay").innerText = userName;

async function fetchPendingCrops() {
  try {
    const res = await fetch(`http://localhost:3000/api/crops`);
    const crops = await res.json();
    const list = document.getElementById("cropList");
    list.innerHTML = "";

    const pending = crops.filter(c => c.validatorStatus === "pending");

    if (pending.length === 0) {
      list.innerHTML = "<p>No crops pending verification.</p>";
      return;
    }

    pending.forEach(crop => {
      const card = document.createElement("div");
      card.className = "crop-card";
      card.innerHTML = `
                <img src="http://localhost:3000/uploads/${crop.image}" alt="${crop.name}" class="crop-img">
                <h4>${crop.name}</h4>
                <p><strong>Farmer:</strong> ${crop.farmerName}</p>
                <p><strong>AI Grade:</strong> ${crop.quality}</p>
                <p><strong>Pest Check:</strong> ${crop.pestDetected ? "❌ Detected" : "✅ Clean"}</p>
                <div class="actions">
                    <button onclick="verify('${crop._id}', 'approve')" class="approve-btn">Approve</button>
                    <button onclick="verify('${crop._id}', 'reject')" class="reject-btn">Reject</button>
                </div>
            `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error("Fetch crops error:", err);
  }
}

async function verify(cropId, action) {
  try {
    const res = await fetch(`http://localhost:3000/api/validator/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cropId, validatorId: userId })
    });
    if (res.ok) {
      alert(`Crop ${action}d successfully! Logged to Blockchain.`);
      fetchPendingCrops();
    } else {
      alert("Action failed");
    }
  } catch (err) {
    alert("Connection error");
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

fetchPendingCrops();
