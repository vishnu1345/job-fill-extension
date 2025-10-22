
function dispatchEvents(el) {
  try {
    el.focus();
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.blur();
  } catch (e) {
    console.warn("Could not dispatch events", e);
  }
}

function fillInputs(elements, value) {
  if (!value) return; // Don't fill if value is empty
  elements.forEach((el) => {
    el.value = value;
    dispatchEvents(el);
  });
}


function findInputsByHeuristics(allInputs, keywords) {
  const matches = [];
  const lowerCaseKeywords = keywords.map(k => k.toLowerCase());
  
  allInputs.forEach((el) => {
    const attr = (
      (el.name || "") +
      " " +
      (el.id || "") +
      " " +
      (el.placeholder || "") +
      " " +
      (el.className || "") + 
      " " +
      (el.ariaLabel || "") + 
      " " +
      (el.getAttribute("for") || "")
    ).toLowerCase();

    for (const k of lowerCaseKeywords) {
      if (attr.includes(k)) {
        matches.push(el);
        break; 
      }
    }
  });

  document.querySelectorAll("label").forEach((lbl) => {
    const text = (lbl.innerText || "").toLowerCase();
    for (const k of lowerCaseKeywords) {
      if (text.includes(k)) {
        const fid = lbl.getAttribute("for");
        if (fid) {
          const el = document.getElementById(fid);
          if (el && !matches.includes(el)) { 
            matches.push(el);
          }
        }
      }
    }
  });

  return matches;
}


function attemptFill(profile) {
  if (!profile) {
    alert("No profile found. Save one in the extension popup.");
    return;
  }

  const allInputs = Array.from(
    document.querySelectorAll("input, textarea, select")
  );

  const phoneCodeKeys = ["code", "country_code", "phonecode", "areacode"];
  const phoneNumberKeys = ["phone", "phone_number", "mobile", "contact"];
  
  const phoneCodeInputs = findInputsByHeuristics(allInputs, phoneCodeKeys);
  const phoneNumberInputs = findInputsByHeuristics(allInputs, phoneNumberKeys);

  if (profile.phone) {
    if (phoneCodeInputs.length > 0 && phoneNumberInputs.length > 0) {
      console.log("Filling separate phone and code fields.");
      fillInputs(phoneCodeInputs, profile.phone.code);
      fillInputs(phoneNumberInputs, profile.phone.number);
    } else {
      console.log("Filling single, combined phone field.");
      const fullPhone = (profile.phone.code || "") + (profile.phone.number || "");
      fillInputs(phoneNumberInputs, fullPhone); 
    }
  }

  
  const firstJob = (profile.experience && profile.experience[0]) || {};
  const firstSchool = (profile.education && profile.education[0]) || {};

  const heuristics = [
    { value: profile.name, keys: ["name", "fullname", "full_name", "applicantName"] },
    { value: profile.email, keys: ["email", "user_email", "emailAddress", "applicantEmail"] },
    { value: profile.linkedin, keys: ["linkedin", "linkedin_url"] },
    { value: profile.portfolio, keys: ["portfolio", "website", "github", "url"] },
    
    { value: firstJob.title, keys: ["title", "job_title", "role", "position"] },
    { value: firstJob.company, keys: ["company", "company_name", "employer"] },
    { value: firstJob.location, keys: ["location", "job_location"] },

    { value: firstSchool.school, keys: ["school", "university", "college", "institution"] },
    { value: firstSchool.degree, keys: ["degree", "diploma"] },
    { value: firstSchool.field, keys: ["field_of_study", "major", "specialization"] },

    { value: profile.resume_text, keys: ["resume", "cover", "summary", "about", "introduction"] },
  ];

  heuristics.forEach((h) => {
    if (h.value) {
      const inputsToFill = findInputsByHeuristics(allInputs, h.keys);
      
      if (h.keys.includes("phone")) return; 

      fillInputs(inputsToFill, h.value);
    }
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