// auth.js
document.addEventListener("DOMContentLoaded", () => {
  const rawUser = localStorage.getItem("bpUser");
  const authArea = document.getElementById("auth-area");

  /* ================= HEADER: auth-area (index + profile) ================= */
  if (authArea) {
    if (rawUser) {
      const user = JSON.parse(rawUser);
      const firstName = (user.name || "User").split(" ")[0];

      authArea.innerHTML = `
        <span class="welcome-text" style="margin-right: 10px;">
          Welcome, ${firstName}
        </span>
        <a href="/profile.html" class="auth-btn">Profile</a>
        <button type="button" id="logout-header" class="auth-btn">
          Logout
        </button>
      `;

      const logoutBtn = document.getElementById("logout-header");
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("bpUser");
        window.location.href = "/index.html";
      });
    } else {
      authArea.innerHTML = `
        <a href="/signinform.html" class="auth-btn">Sign In</a>
        <a href="/signupform.html" class="auth-btn">Sign Up</a>
      `;
    }
  }

  /* ================= SIGNIN FORM (signinform.html) ================= */
  const signinForm = document.getElementById("signin-form");
  const signinMsg = document.getElementById("signin-message");

  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (signinMsg) signinMsg.textContent = "Signing in...";

      const formData = new FormData(signinForm);
      const data = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        const res = await fetch("/api/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
          if (signinMsg) signinMsg.textContent = result.message || "Login failed.";
          return;
        }

        if (signinMsg) signinMsg.textContent = result.message || "Sign in successful.";

        // Save user and go to home
        localStorage.setItem("bpUser", JSON.stringify(result.user));
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 800);
      } catch (err) {
        console.error("Fetch error in signin:", err);
        if (signinMsg) signinMsg.textContent = "Something went wrong. Please try again.";
      }
    });
  }

  /* ================= SIGNUP FORM (signupform.html) ================= */
  const signupForm = document.getElementById("signup-form");
  const signupMsg = document.getElementById("signup-message");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (signupMsg) signupMsg.textContent = "Creating your account...";

      const formData = new FormData(signupForm);
      const data = {
        name: formData.get("name"),
        dob: formData.get("dob"),
        state: formData.get("state"),
        category: formData.get("category"),
        employmentStatus: formData.get("employmentStatus"),
        casteCategory: formData.get("casteCategory"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();
        if (signupMsg) signupMsg.textContent = result.message;

        if (result.success) {
          setTimeout(() => {
            window.location.href = "/signinform.html";
          }, 1500);
        }
      } catch (err) {
        console.error("Signup error:", err);
        if (signupMsg) signupMsg.textContent = "Something went wrong. Please try again.";
      }
    });
  }

  /* ================= PROFILE PAGE (profile.html) ================= */
  const profileNameEl = document.getElementById("profile-name");

  if (profileNameEl) {
    if (!rawUser) {
      window.location.href = "/signinform.html";
      return;
    }

    const user = JSON.parse(rawUser);

    const profileEmailEl = document.getElementById("profile-email");
    const dobEl = document.getElementById("profile-dob");
    const stateEl = document.getElementById("profile-state");
    const categoryEl = document.getElementById("profile-category");
    const employmentEl = document.getElementById("profile-employment");
    const casteEl = document.getElementById("profile-caste");
    const photoDiv = document.getElementById("profile-photo");

    profileNameEl.textContent = user.name || "";
    if (profileEmailEl) profileEmailEl.textContent = user.email || "";
    if (dobEl) dobEl.textContent = user.dob || "-";
    if (stateEl) stateEl.textContent = user.state || "-";
    if (categoryEl) categoryEl.textContent = user.category || "-";
    if (employmentEl) employmentEl.textContent = user.employmentStatus || "-";
    if (casteEl) casteEl.textContent = user.casteCategory || "-";

    if (photoDiv) {
      const initial = (user.name || "?").trim().charAt(0).toUpperCase();
      photoDiv.textContent = initial || "U";
    }
  }
});
