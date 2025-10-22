function attemptFill(profile) {
  if (!profile) {
    alert("No profile found. Save one in the extension popup.");
    return;
  }

  const heuristics = [
    {
      keys: ["name", "fullname", "full_name", "applicantName"],
      value: profile.name,
    },
    {
      keys: ["email", "user_email", "emailAddress", "applicantEmail"],
      value: profile.email,
    },
    {
      keys: ["phone", "phone_number", "contact", "mobile"],
      value: profile.phone,
    },
    {
      keys: ["resume", "cover", "summary", "about"],
      value: profile.resume_text,
    },
  ];

  const inputs = Array.from(
    document.querySelectorAll("input, textarea, select")
  );
  inputs.forEach((el) => {
    const attr = (
      (el.name || "") +
      " " +
      (el.id || "") +
      " " +
      (el.placeholder || "") +
      " " +
      (el.className || "")
    ).toLowerCase();
    heuristics.forEach((h) => {
      if (!h.value) return;
      h.keys.forEach((k) => {
        if (attr.includes(k.toLowerCase())) {
          try {
            el.focus();
            el.value = h.value;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          } catch (e) {}
        }
      });
    });
  });

  // fallback: fill by label text
  document.querySelectorAll("label").forEach((lbl) => {
    const text = (lbl.innerText || "").toLowerCase();
    heuristics.forEach((h) => {
      if (!h.value) return;
      h.keys.forEach((k) => {
        if (text.includes(k.toLowerCase())) {
          const fid = lbl.getAttribute("for");
          if (fid) {
            const el = document.getElementById(fid);
            if (el) {
              el.value = h.value;
              el.dispatchEvent(new Event("input", { bubbles: true }));
              el.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        }
      });
    });
  });

  alert("Auto-fill attempted. Verify fields before submit.");
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "fill-from-extension") {
    chrome.storage.local.get("profile", (res) => {
      attemptFill(res.profile);
    });
  }
});
