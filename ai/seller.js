const BASE_URL = "http://localhost:3000";
const farmerId = localStorage.getItem("userId");

async function uploadCrop() {
  const cropName = document.getElementById("cropName").value;
  const quantity = document.getElementById("quantity").value;
  const price = document.getElementById("price").value;
  const image = document.getElementById("image").files[0];

  if (!cropName || !quantity || !price || !image) {
    alert("Please fill all fields");
    return;
  }

  const formData = new FormData();
  formData.append("farmerId", farmerId);
  formData.append("cropName", cropName);
  formData.append("quantity", quantity);
  formData.append("price", price);
  formData.append("image", image);

  document.getElementById("aiStatus").innerText = "AI Quality: Checking...";

  try {
    const response = await fetch(`${BASE_URL}/api/crops/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log("AI RESPONSE:", data); // 🔥 IMPORTANT

    document.getElementById("aiStatus").innerText =
      "AI Quality: " + data.aiReport.quality_grade;

    document.getElementById("warehouseTable").innerHTML += `
      <tr>
        <td>${cropName}</td>
        <td>${quantity}</td>
        <td>${data.aiReport.quality_grade}</td>
        <td>Pending Validation</td>
      </tr>
    `;
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}
