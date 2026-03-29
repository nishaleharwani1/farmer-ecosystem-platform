const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName");

if (!userId || localStorage.getItem("userRole") !== "consumer") {
  window.location.href = "login.html";
}

document.getElementById("userNameDisplay").innerText = userName;

// Fetch Wallet
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

// Add Money (Simplified for Demo)
async function addMoney() {
  try {
    await fetch(`http://localhost:3000/api/wallet/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: 1000 })
    });
    fetchWallet();
  } catch (err) {
    alert("Failed to add money");
  }
}

// Fetch Marketplace Crops
async function fetchCrops() {
  try {
    const res = await fetch(`http://localhost:3000/api/crops`);
    const crops = await res.json();
    const list = document.getElementById("cropList");
    list.innerHTML = "";

    const available = crops.filter(c => c.status === "available" && c.validatorStatus === "approved");

    if (available.length === 0) {
      list.innerHTML = "<p>No verified crops available right now.</p>";
      return;
    }

    available.forEach(crop => {
      const card = document.createElement("div");
      card.className = "crop-card";
      card.innerHTML = `
                <img src="http://localhost:3000/uploads/${crop.image}" alt="${crop.name}" class="crop-img">
                <h4>${crop.name}</h4>
                <p><strong>Farmer:</strong> ${crop.farmerName}</p>
                <p><strong>Price:</strong> ₹${crop.price}/kg</p>
                <p><strong>Quantity:</strong> ${crop.quantity}kg</p>
                <p><strong>AI Grade:</strong> ${crop.quality}</p>
                <button onclick="placeOrder('${crop.crop_id}', ${crop.price_per_unit})" class="buy-btn">Place Order</button>
            `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error("Fetch crops error:", err);
  }
}

// Place Order - Launch Modal
let pendingCropId = null;

function placeOrder(cropId, price) {
  pendingCropId = cropId;
  const amount = parseFloat(price);
  const fee = amount * 0.02;
  const total = amount + fee;
  
  document.getElementById('checkoutCropAmount').innerText = '₹' + amount.toFixed(2);
  document.getElementById('checkoutFee').innerText = '₹' + fee.toFixed(2);
  document.getElementById('checkoutTotal').innerText = '₹' + total.toFixed(2);
  
  document.getElementById('checkoutModal').style.display = 'flex';
}

function closeCheckout() {
  document.getElementById('checkoutModal').style.display = 'none';
  pendingCropId = null;
}

// Process Secure Payment Escrow
async function processPayment() {
  const btn = document.getElementById('confirmPayBtn');
  btn.innerHTML = "Processing Payment...";
  btn.disabled = true;

  // Simulate Payment Gateway Auth Delay
  setTimeout(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropId: pendingCropId, consumerId: userId })
      });
      const data = await res.json();
      
      if (res.ok) {
        btn.innerHTML = "✅ Paired to Validator!";
        btn.style.background = "#3b82f6";
        setTimeout(() => {
          closeCheckout();
          btn.innerHTML = "🔒 Pay Securely";
          btn.style.background = "";
          btn.disabled = false;
          fetchCrops();
          fetchOrders();
        }, 2000);
      } else {
        alert(data.message);
        btn.innerHTML = "🔒 Pay Securely";
        btn.disabled = false;
      }
    } catch (err) {
      alert("Action failed. Server offline?");
      btn.innerHTML = "🔒 Pay Securely";
      btn.disabled = false;
    }
  }, 2500);
}

// Fetch My Orders
async function fetchOrders() {
  try {
    const res = await fetch(`http://localhost:3000/api/orders/consumer/${userId}`);
    const orders = await res.json();
    const table = document.getElementById("ordersTable");
    table.innerHTML = "";

    if (orders.length === 0) {
      table.innerHTML = "<tr><td colspan='4'>No orders placed yet.</td></tr>";
      return;
    }

    orders.forEach(order => {
        const row = `
            <tr>
                <td>${order.cropName}</td>
                <td>₹${order.totalAmount}</td>
                <td><span class="badge status-${order.orderStatus}">${order.orderStatus}</span></td>
                <td><button disabled class="logout-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Track</button></td>
            </tr>
        `;
        table.innerHTML += row;
    });
  } catch (err) {
    console.error("Fetch orders error:", err);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

fetchWallet();
fetchCrops();
fetchOrders();
