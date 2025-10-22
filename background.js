chrome.runtime.onInstalled.addListener(() => {
  console.log("Job AutoFill installed.");
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "oauth-start") startOAuth();
});

function startOAuth() {
  const clientId =
    "397411675203-f2pfnaq0v70phh4m4o7fphmh0fd3t1ls.apps.googleusercontent.com"; 
  const redirectUri = chrome.identity.getRedirectURL();
  console.log("My Redirect URI is:", redirectUri);
  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}`;

  chrome.identity.launchWebAuthFlow(
    { url: authUrl, interactive: true },
    (redirectedTo) => {
      if (chrome.runtime.lastError || !redirectedTo) {
        console.error("OAuth failed", chrome.runtime.lastError);
        return;
      }
      const m = redirectedTo.match(/[&#]access_token=([^&]+)/);
      if (m) {
        const token = m[1];
        fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: "Bearer " + token },
        })
          .then((r) => r.json())
          .then((userinfo) => {
            chrome.storage.local.set(
              { user: { googleId: userinfo.id, email: userinfo.email } },
              () => {
                chrome.runtime.sendMessage({
                  type: "signed-in",
                  user: userinfo,
                });
              }
            );
          })
          .catch((e) => console.error(e));
      } else {
        console.error("No access token in redirect URL");
      }
    }
  );
}
