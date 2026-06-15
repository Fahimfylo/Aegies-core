const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function getSettings() {
  const { apiUrl, disabled, notificationsDisabled } = await chrome.storage.local.get([
    'apiUrl', 'disabled', 'notificationsDisabled'
  ]);
  return {
    apiUrl: apiUrl || 'https://aegies-core.vercel.app/api',
    disabled: !!disabled,
    notificationsDisabled: !!notificationsDisabled,
  };
}

async function getAuthHeaders() {
  const { token } = await chrome.storage.local.get('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function apiPost(path, body) {
  const { apiUrl } = await getSettings();
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      if (res.status === 401) {
        await chrome.storage.local.remove('token');
        updateBadge('offline');
      }
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

async function apiGet(path) {
  const { apiUrl } = await getSettings();
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${apiUrl}${path}`, {
      headers: { ...headers },
    });
    if (!res.ok) {
      if (res.status === 401) {
        await chrome.storage.local.remove('token');
        updateBadge('offline');
      }
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

async function checkUrl(url) {
  const cached = CACHE.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await apiPost('/security/ioc/check', { value: url, type: 'url' });
  if (data) {
    CACHE.set(url, { data, timestamp: Date.now() });
  }
  return data;
}

function updateBadge(status) {
  const colors = {
    safe: '#22C55E',
    suspicious: '#F59E0B',
    malicious: '#EF4444',
    offline: '#6B7280',
    loading: '#3B82F6',
  };
  const texts = {
    safe: '',
    suspicious: '!',
    malicious: '!!',
    offline: '?',
    loading: '...',
  };
  const text = texts[status] || '';
  const color = colors[status] || '#6B7280';
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

const HISTORY_KEY = 'browsingHistory';
const HISTORY_LIMIT = 100;

async function addHistoryEntry(entry) {
  const { [HISTORY_KEY]: history = [] } = await chrome.storage.local.get(HISTORY_KEY);
  history.unshift({
    url: entry.url,
    hostname: entry.hostname,
    timestamp: Date.now(),
    classification: entry.classification,
    category: entry.category,
    confidenceScore: entry.confidenceScore,
  });
  if (history.length > HISTORY_LIMIT) history.length = HISTORY_LIMIT;
  await chrome.storage.local.set({ [HISTORY_KEY]: history });
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  console.log('AegisCore: navigating to', details.url);

  const { disabled } = await chrome.storage.local.get('disabled');
  if (disabled) return;

  const url = new URL(details.url);
  const { whitelist = [] } = await chrome.storage.local.get('whitelist');
  if (whitelist.some(d => url.hostname.includes(d))) return;

  const { token } = await chrome.storage.local.get('token');
  if (!token) return;

  updateBadge('loading');
  const result = await checkUrl(url.href);

  if (!result) {
    updateBadge('offline');
    return;
  }

  addHistoryEntry({
    url: url.href,
    hostname: url.hostname,
    classification: result.classification,
    category: result.category,
    confidenceScore: result.confidenceScore,
  });

  if (result.classification === 'safe') {
    updateBadge('safe');
    return;
  }

  updateBadge(result.classification);

  chrome.tabs.sendMessage(details.tabId, {
    type: 'SECURITY_WARNING',
    data: result,
  }).catch(() => {});

  const { notificationsDisabled } = await getSettings();
  if (!notificationsDisabled) {
    chrome.notifications.create({
      type: 'basic',
      title: 'AegisCore Security Alert',
      message: `${result.classification === 'malicious' ? 'Dangerous' : 'Suspicious'} site detected: ${url.hostname}`,
      priority: 2,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'CHECK_URL':
      updateBadge('loading');
      checkUrl(message.url).then((data) => {
        if (data) updateBadge(data.classification);
        sendResponse(data);
      });
      return true;

    case 'LOGIN':
      chrome.storage.local.set({ token: message.token }).then(() => {
        updateBadge('safe');
        sendResponse({ success: true });
      });
      return true;

    case 'LOGOUT':
      chrome.storage.local.remove('token').then(() => {
        updateBadge('offline');
        CACHE.clear();
        sendResponse({ success: true });
      });
      return true;

    case 'GET_AUTH':
      chrome.storage.local.get('token').then(({ token }) => {
        sendResponse({ token: token || null });
      });
      return true;

    case 'SCAN_EMAIL':
      apiPost('/security/email/analyze', message.data).then(sendResponse);
      return true;

    case 'CHECK_BREACH':
      apiPost('/security/breach/check', message.data).then(sendResponse);
      return true;

    case 'SCAN_WEB':
      apiPost('/security/web/scan', message.data).then(sendResponse);
      return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'scan-url',
      title: 'Scan this link with AegisCore',
      contexts: ['link'],
    });
    chrome.contextMenus.create({
      id: 'scan-page',
      title: 'Scan this page with AegisCore',
      contexts: ['page'],
    });
  });
  chrome.storage.local.get('token').then(({ token }) => {
    updateBadge(token ? 'safe' : 'offline');
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const { notificationsDisabled } = await getSettings();

  if (info.menuItemId === 'scan-url' && info.linkUrl) {
    checkUrl(info.linkUrl).then((result) => {
      if (!result) return;
      addHistoryEntry({
        url: info.linkUrl,
        hostname: new URL(info.linkUrl).hostname,
        classification: result.classification,
        category: result.category,
        confidenceScore: result.confidenceScore,
      });
      if (notificationsDisabled) return;
      const status = result.classification === 'malicious' ? 'DANGEROUS' :
        result.classification === 'suspicious' ? 'SUSPICIOUS' : 'SAFE';
      chrome.notifications.create({
        type: 'basic',
        title: `AegisCore: ${status}`,
        message: `${info.linkUrl}\nConfidence: ${result.confidenceScore}%`,
        priority: result.classification === 'malicious' ? 2 : 1,
      });
    });
  }
  if (info.menuItemId === 'scan-page' && tab?.url) {
    checkUrl(tab.url).then((result) => {
      if (!result) return;
      addHistoryEntry({
        url: tab.url,
        hostname: new URL(tab.url).hostname,
        classification: result.classification,
        category: result.category,
        confidenceScore: result.confidenceScore,
      });
      if (notificationsDisabled) return;
      const status = result.classification === 'malicious' ? 'DANGEROUS' :
        result.classification === 'suspicious' ? 'SUSPICIOUS' : 'SAFE';
      chrome.notifications.create({
        type: 'basic',
        title: `AegisCore: ${status}`,
        message: `${new URL(tab.url).hostname}\nConfidence: ${result.confidenceScore}%`,
        priority: result.classification === 'malicious' ? 2 : 1,
      });
    });
  }
});


