document.addEventListener('DOMContentLoaded', async () => {
  const authView = document.getElementById('authView');
  const dashboardView = document.getElementById('dashboardView');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const authError = document.getElementById('authError');
  const settingsBtn = document.getElementById('settingsBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const currentPageEl = document.getElementById('currentPage');
  const riskStatus = document.getElementById('riskStatus');
  const dashboardBtn = document.getElementById('dashboardBtn');
  const scanCurrentBtn = document.getElementById('scanCurrentBtn');

  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
  refreshBtn.addEventListener('click', () => initPopup());

  async function getWebBaseUrl() {
    const { apiUrl } = await chrome.storage.local.get('apiUrl');
    return (apiUrl || 'https://aegies-core.vercel.app/api').replace(/\/api\/?$/, '');
  }

  async function initPopup() {
    const baseUrl = await getWebBaseUrl();
    const signUpLink = document.getElementById('signUpLink');
    if (signUpLink) signUpLink.href = `${baseUrl}/sign-up`;

    const { token } = await chrome.storage.local.get('token');
    if (!token) {
      authView.style.display = 'block';
      dashboardView.style.display = 'none';
      return;
    }

    const { user } = await chrome.storage.local.get('user');
    authView.style.display = 'none';
    dashboardView.style.display = 'block';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      currentPageEl.textContent = tab.url.length > 60 ? tab.url.slice(0, 60) + '...' : tab.url;
      await checkUrl(tab.url);
    } else {
      currentPageEl.textContent = 'No active tab';
      riskStatus.textContent = 'N/A';
      riskStatus.className = 'value muted';
    }
  }

  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    authError.style.display = 'none';

    if (!email || !password) {
      authError.textContent = 'Please enter email and password';
      authError.style.display = 'block';
      return;
    }

    loginBtn.textContent = 'Signing in...';
    loginBtn.disabled = true;

    try {
      const { apiUrl } = await chrome.storage.local.get('apiUrl');
      const baseUrl = apiUrl || 'https://aegies-core.vercel.app/api';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        authError.textContent = 'Invalid email or password';
        authError.style.display = 'block';
        return;
      }

      const data = await res.json();
      await chrome.storage.local.set({ token: data.token, user: data.user });
      await chrome.runtime.sendMessage({ type: 'LOGIN', token: data.token });
      initPopup();
    } catch {
      authError.textContent = 'Cannot connect to AegisCore API';
      authError.style.display = 'block';
    } finally {
      loginBtn.textContent = 'Sign In';
      loginBtn.disabled = false;
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['token', 'user']);
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    initPopup();
  });

  dashboardBtn.addEventListener('click', async () => {
    const baseUrl = await getWebBaseUrl();
    chrome.tabs.create({ url: `${baseUrl}/dashboard` });
  });

  scanCurrentBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) await checkUrl(tab.url);
  });

  async function checkUrl(url) {
    riskStatus.textContent = 'Scanning...';
    riskStatus.className = 'value';

    const data = await chrome.runtime.sendMessage({ type: 'CHECK_URL', url });

    if (!data) {
      riskStatus.textContent = '❌ API unavailable';
      riskStatus.className = 'value danger';
      return;
    }

    if (data.classification === 'malicious') {
      riskStatus.textContent = `⚠ DANGEROUS — ${data.category} (${data.confidenceScore}%)`;
      riskStatus.className = 'value danger';
    } else if (data.classification === 'suspicious') {
      riskStatus.textContent = `⚡ SUSPICIOUS — ${data.category} (${data.confidenceScore}%)`;
      riskStatus.className = 'value warning';
    } else {
      riskStatus.textContent = '✅ Safe — no threats detected';
      riskStatus.className = 'value safe';
    }
  }

  // Web Scanner
  document.getElementById('scanWebBtn').addEventListener('click', async () => {
    const url = document.getElementById('scanUrl').value.trim();
    const resultEl = document.getElementById('scanWebResult');
    if (!url) { resultEl.innerHTML = '<div class="result-box warning"><div class="result-box-title">Please enter a URL</div></div>'; return; }

    resultEl.innerHTML = '<div class="result-box info">Scanning...</div>';
    const data = await chrome.runtime.sendMessage({ type: 'SCAN_WEB', data: { url } });
    if (!data) { resultEl.innerHTML = '<div class="result-box danger"><div class="result-box-title">Scan failed</div></div>'; return; }

    const scoreColor = data.securityScore > 70 ? 'success' : data.securityScore > 40 ? 'warning' : 'danger';
    resultEl.innerHTML = `
      <div class="result-box ${scoreColor}">
        <div class="result-box-title">Security Score: ${data.securityScore}/100</div>
        <div>SSL: ${data.sslValid ? '✅ Valid' : '❌ Invalid'}</div>
        <div>HSTS: ${data.headerReport.hsts ? '✅' : '❌'}</div>
        <div>CSP: ${data.headerReport.contentSecurityPolicy ? '✅' : '❌'}</div>
        <div>X-Frame-Options: ${data.headerReport.xFrameOptions ? '✅' : '❌'}</div>
        <div>Vulnerabilities: ${data.vulnerabilities.length > 0 ? data.vulnerabilities.map(v => `<span class="tag ${v.severity === 'critical' ? 'red' : v.severity === 'high' ? 'yellow' : 'blue'}">${v.type}</span>`).join('') : 'None'}</div>
        ${data.recommendation ? `<div style="margin-top:4px;font-style:italic;">${data.recommendation}</div>` : ''}
      </div>`;
  });

  // Email Scanner
  document.getElementById('scanEmailBtn').addEventListener('click', async () => {
    const sender = document.getElementById('emailSender').value.trim();
    const subject = document.getElementById('emailSubject').value.trim();
    const body = document.getElementById('emailBody').value.trim();
    const resultEl = document.getElementById('scanEmailResult');

    if (!sender || !subject || !body) {
      resultEl.innerHTML = '<div class="result-box warning"><div class="result-box-title">Please fill in all fields</div></div>';
      return;
    }

    resultEl.innerHTML = '<div class="result-box info">Analyzing...</div>';
    const data = await chrome.runtime.sendMessage({ type: 'SCAN_EMAIL', data: { sender, subject, body } });
    if (!data) { resultEl.innerHTML = '<div class="result-box danger"><div class="result-box-title">Analysis failed</div></div>'; return; }

    const riskColor = data.riskLevel === 'Safe' || data.riskLevel === 'Low' ? 'success' :
      data.riskLevel === 'Medium' ? 'warning' : 'danger';
    resultEl.innerHTML = `
      <div class="result-box ${riskColor}">
        <div class="result-box-title">Risk: ${data.riskLevel} (${data.riskScore}/100)</div>
        <div>SPF: <span class="tag ${data.spfStatus === 'pass' ? 'green' : data.spfStatus === 'fail' ? 'red' : 'yellow'}">${data.spfStatus}</span></div>
        <div>DKIM: <span class="tag ${data.dkimStatus === 'pass' ? 'green' : data.dkimStatus === 'fail' ? 'red' : 'yellow'}">${data.dkimStatus}</span></div>
        <div>DMARC: <span class="tag ${data.dmarcStatus === 'pass' ? 'green' : data.dmarcStatus === 'fail' ? 'red' : 'yellow'}">${data.dmarcStatus}</span></div>
        ${data.typosquattingDetected ? `<div>🚩 Typosquatting detected: ${data.typosquattingMatches.join(', ')}</div>` : ''}
        ${data.urlsFound?.length ? `<div>URLs found: ${data.urlsFound.map(u => `<span class="tag ${u.riskLabel === 'High' ? 'red' : u.riskLabel === 'Medium' ? 'yellow' : 'green'}">${u.riskLabel}</span>`).join('')}</div>` : ''}
        ${data.recommendedActions?.length ? `<div style="margin-top:4px;">${data.recommendedActions.map(a => `• ${a}`).join('<br>')}</div>` : ''}
      </div>`;
  });

  // Breach Checker
  document.getElementById('checkBreachBtn').addEventListener('click', async () => {
    const email = document.getElementById('breachEmail').value.trim();
    const resultEl = document.getElementById('checkBreachResult');

    if (!email) {
      resultEl.innerHTML = '<div class="result-box warning"><div class="result-box-title">Please enter an email</div></div>';
      return;
    }

    resultEl.innerHTML = '<div class="result-box info">Checking...</div>';
    const data = await chrome.runtime.sendMessage({ type: 'CHECK_BREACH', data: { email } });
    if (!data) { resultEl.innerHTML = '<div class="result-box danger"><div class="result-box-title">Check failed</div></div>'; return; }

    const breachColor = data.breachCount === 0 ? 'success' : data.breachCount <= 2 ? 'warning' : 'danger';
    resultEl.innerHTML = `
      <div class="result-box ${breachColor}">
        <div class="result-box-title">${data.breachCount === 0 ? '✅ No breaches found' : `⚠ Found in ${data.breachCount} breach(es)`}</div>
        ${data.breaches?.length ? data.breaches.map(b => `
          <div style="margin-top:4px;padding:6px;background:rgba(255,255,255,0.05);border-radius:4px;">
            <strong>${b.name}</strong> (${b.year})<br>
            Exposed: ${b.exposedFields.join(', ')}<br>
            Severity: <span class="tag ${b.severity === 'critical' || b.severity === 'high' ? 'red' : 'yellow'}">${b.severity}</span>
          </div>
        `).join('') : ''}
        ${data.passwordChangeRecommended ? '<div style="margin-top:6px;color:#EF4444;font-weight:600;">🔑 Password change recommended</div>' : ''}
        <div style="margin-top:4px;font-style:italic;">${data.riskSummary}</div>
      </div>`;
  });

  document.getElementById('loginEmail').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('loginPassword').focus();
  });
  document.getElementById('loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  await initPopup();
});
