const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName");
const token = localStorage.getItem("token");

if (!userId || localStorage.getItem("userRole") !== "farmer") {
  window.location.href = "login.html";
}

document.getElementById("userNameDisplay").innerText = userName;
document.getElementById("welcomeName").innerText = userName;

// Fetch Wallet Balance
async function fetchWallet() {
  try {
    const res = await fetch(`http://localhost:3000/api/wallet/${userId}`);
    const data = await res.json();
    if (res.ok) {
      document.getElementById("walletBalance").innerText = `₹${data.balance.toFixed(2)}`;
    } else {
      // Create wallet if not exists
      await fetch(`http://localhost:3000/api/wallet/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    }
  } catch (err) {
    console.error("Wallet error:", err);
  }
}

// Fetch Farmer's Crops
async function fetchMyCrops() {
  try {
    const res = await fetch(`http://localhost:3000/api/crops`);
    const allCrops = await res.json();
    const myCrops = allCrops.filter(c => c.farmerId == userId || (c.farmerId && c.farmerId._id == userId));

    const table = document.getElementById("myCropsTable");
    table.innerHTML = "";
    document.getElementById("cropCount").innerText = myCrops.length;

    myCrops.forEach(crop => {
      const row = `
                <tr>
                    <td>${crop.name}</td>
                    <td>${crop.quantity} kg</td>
                    <td>₹${crop.price}</td>
                    <td><span class="badge grade-${crop.quality}">${crop.quality}</span></td>
                    <td><span class="badge status-${crop.status}">${crop.status}</span></td>
                </tr>
            `;
      table.innerHTML += row;
    });
  } catch (err) {
    console.error("Fetch crops error:", err);
  }
}

// Handle Form Submit
document.getElementById("addCropForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  const aiStatus = document.getElementById("aiStatus");

  btn.disabled = true;
  btn.innerText = "Analyzing Quality...";
  aiStatus.className = "ai-status processing";
  aiStatus.innerText = "🤖 AI is analyzing your crop image. Please wait...";

  const formData = new FormData();
  formData.append("farmerId", userId);
  formData.append("name", document.getElementById("cropName").value);
  formData.append("category", document.getElementById("category").value);
  formData.append("quantity", document.getElementById("quantity").value);
  formData.append("price", document.getElementById("price").value);
  formData.append("image", document.getElementById("image").files[0]);

  try {
    const res = await fetch("http://localhost:3000/api/crops/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      aiStatus.className = "ai-status success";
      aiStatus.innerHTML = `✅ AI Result: <strong>Grade ${data.aiReport.quality_grade}</strong>. Pest Detected: ${data.aiReport.pest_detected}. Crop listed!`;
      fetchMyCrops();
      document.getElementById("addCropForm").reset();
    } else {
      aiStatus.className = "ai-status error";
      aiStatus.innerText = "❌ Upload failed: " + data.message;
    }
  } catch (err) {
    aiStatus.className = "ai-status error";
    aiStatus.innerText = "❌ Connection error. Is AI service running?";
  } finally {
    btn.disabled = false;
    btn.innerText = "Check Quality & Upload";
  }
});

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// Initial Load
fetchWallet();
fetchMyCrops();
setInterval(fetchWallet, 5000); // Poll wallet balance
