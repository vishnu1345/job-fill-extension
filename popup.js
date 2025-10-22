document.addEventListener("DOMContentLoaded", () => {
  const signinBtn = document.getElementById("signin");
  const signed = document.getElementById("signed");
  const saveBtn = document.getElementById("save");
  const fillBtn = document.getElementById("fill");
  const logoutBtn = document.getElementById("logout");
  const userEmail = document.getElementById("userEmail");

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const phoneCode = document.getElementById("phoneCode");
  const phoneNumber = document.getElementById("phoneNumber");
  const linkedin = document.getElementById("linkedin");
  const portfolio = document.getElementById("portfolio");
  const jobTitle = document.getElementById("jobTitle");
  const companyName = document.getElementById("companyName");
  const jobLocation = document.getElementById("jobLocation");
  const schoolName = document.getElementById("schoolName");
  const degree = document.getElementById("degree");
  const fieldOfStudy = document.getElementById("fieldOfStudy");
  const resume = document.getElementById("resume");


  chrome.storage.local.get(["profile", "user"], (res) => {
    if (res.user) {

      signinBtn.style.display = "none";
      signed.style.display = "block";
      userEmail.innerText = res.user.email || "";

      if (res.profile) {
        name.value = res.profile.name || "";
        email.value = res.profile.email || "";
        linkedin.value = res.profile.linkedin || "";
        portfolio.value = res.profile.portfolio || "";
        resume.value = res.profile.resume_text || "";

        if (res.profile.phone) {
          phoneCode.value = res.profile.phone.code || "";
          phoneNumber.value = res.profile.phone.number || "";
        }
        if (res.profile.experience && res.profile.experience[0]) {
          const firstJob = res.profile.experience[0];
          jobTitle.value = firstJob.title || "";
          companyName.value = firstJob.company || "";
          jobLocation.value = firstJob.location || "";
        }
        if (res.profile.education && res.profile.education[0]) {
          const firstSchool = res.profile.education[0];
          schoolName.value = firstSchool.school || "";
          degree.value = firstSchool.degree || "";
          fieldOfStudy.value = firstSchool.field || "";
        }
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
      name: name.value,
      email: email.value,
      linkedin: linkedin.value,
      portfolio: portfolio.value,
      resume_text: resume.value,
      phone: {
        code: phoneCode.value,
        number: phoneNumber.value,
      },
      experience: [
        {
          title: jobTitle.value,
          company: companyName.value,
          location: jobLocation.value,
        },
      ],
      education: [
        {
          school: schoolName.value,
          degree: degree.value,
          field: fieldOfStudy.value,
        },
      ],
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
    chrome.storage.local.remove(["user", "profile"], () => {
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
