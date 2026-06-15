async function loadSettings() {
  const { apiUrl, whitelist, disabled, notificationsDisabled } = await chrome.storage.local.get([
    'apiUrl', 'whitelist', 'disabled', 'notificationsDisabled'
  ]);

  let apiUrlVal = apiUrl;
  if (!apiUrlVal || apiUrlVal.includes('localhost')) {
    await chrome.storage.local.remove('apiUrl');
    apiUrlVal = 'https://aegies-core.vercel.app/api';
  }
  document.getElementById('apiUrl').value = apiUrlVal;
  document.getElementById('enableProtection').checked = !disabled;
  document.getElementById('enableNotifications').checked = !notificationsDisabled;
  document.getElementById('whitelist').value = (whitelist || []).join('\n');

  const { token, user } = await chrome.storage.local.get(['token', 'user']);
  const accountInfo = document.getElementById('accountInfo');
  const logoutBtn = document.getElementById('logoutBtn');

  if (token && user) {
    accountInfo.innerHTML = `Signed in as <strong>${user.email}</strong>`;
    logoutBtn.style.display = 'inline-block';
  } else if (token) {
    accountInfo.textContent = 'Signed in';
    logoutBtn.style.display = 'inline-block';
  } else {
    accountInfo.innerHTML = 'Not signed in — <a href="#" id="openPopupLink" style="color:#3B82F6;text-decoration:none;">Open extension popup to sign in</a>';
    logoutBtn.style.display = 'none';
  }
}

document.getElementById('saveBtn').addEventListener('click', async () => {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  const whitelist = document.getElementById('whitelist').value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
  const disabled = !document.getElementById('enableProtection').checked;
  const notificationsDisabled = !document.getElementById('enableNotifications').checked;

  await chrome.storage.local.set({ apiUrl, whitelist, disabled, notificationsDisabled });

  const toast = document.getElementById('toast');
  toast.textContent = 'Settings saved successfully';
  toast.className = 'toast success';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await chrome.storage.local.remove(['token', 'user']);
  await chrome.runtime.sendMessage({ type: 'LOGOUT' });

  const accountInfo = document.getElementById('accountInfo');
  accountInfo.innerHTML = 'Not signed in';
  document.getElementById('logoutBtn').style.display = 'none';

  const toast = document.getElementById('toast');
  toast.textContent = 'Signed out successfully';
  toast.className = 'toast success';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
});

document.addEventListener('click', (e) => {
  if (e.target.id === 'openPopupLink') {
    chrome.action.openPopup();
  }
});

loadSettings();
