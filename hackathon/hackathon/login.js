document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("token", data.token); // Save JWT Token

      // ROLE BASED REDIRECT
      if (data.user.role === "farmer") {
        window.location.href = "seller-dashboard.html";
      } else if (data.user.role === "consumer") {
        window.location.href = "consumer-dashboard.html";
      } else if (data.user.role === "validator") {
        window.location.href = "validator-dashboard.html";
      }
    } else {
      alert("Login Failed: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Backend connection error. Make sure the server is running on port 3000.");
  }
});
