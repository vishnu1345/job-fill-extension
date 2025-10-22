document.addEventListener("DOMContentLoaded", () => {
  const signinBtn = document.getElementById("signin");
  const signed = document.getElementById("signed");
  const saveBtn = document.getElementById("save");
  const fillBtn = document.getElementById("fill");
  const logoutBtn = document.getElementById("logout");

  chrome.storage.local.get(["profile", "user"], (res) => {
    if (res.user) {
      signinBtn.style.display = "none";
      signed.style.display = "block";
      document.getElementById("userEmail").innerText = res.user.email || "";
      if (res.profile) {
        document.getElementById("name").value = res.profile.name || "";
        document.getElementById("email").value = res.profile.email || "";
        document.getElementById("phone").value = res.profile.phone || "";
        document.getElementById("resume").value = res.profile.resume_text || "";
      }
    } else {
      signinBtn.style.display = "block";
      signed.style.display = "none";
    }
  });

  signinBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "oauth-start" });
  });

  saveBtn.addEventListener("click", () => {
    const profile = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      resume_text: document.getElementById("resume").value,
    };
    chrome.storage.local.set({ profile }, () => {
      alert("Profile saved");
    });
  });

  fillBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.sendMessage(tab.id, { type: "fill-from-extension" });
  });

  logoutBtn.addEventListener("click", () => {
    chrome.storage.local.remove(["user"], () => {
      alert(
        "Signed out locally. If you want to revoke Google access, do it in your Google account."
      );
      window.location.reload();
    });
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "signed-in") {
      window.location.reload();
    }
  });
});
