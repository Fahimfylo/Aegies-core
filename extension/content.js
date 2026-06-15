let warningOverlay = null;
let blocked = false;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SECURITY_WARNING') {
    showWarning(message.data);
  }
  return false;
});

async function showWarning(data) {
  if (warningOverlay) return;

  let { apiUrl } = await chrome.storage.local.get('apiUrl');
  if (!apiUrl || apiUrl.includes('localhost')) {
    await chrome.storage.local.remove('apiUrl');
    apiUrl = 'https://aegies-core.vercel.app/api';
  }
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');

  const isMalicious = data.classification === 'malicious';
  const severityColor = isMalicious ? '#ff4444' : '#ff8800';
  const bgGradient = isMalicious
    ? 'linear-gradient(135deg, #1a0000 0%, #2d0000 100%)'
    : 'linear-gradient(135deg, #1a1000 0%, #2d2000 100%)';

  warningOverlay = document.createElement('div');
  warningOverlay.id = 'aegiscore-warning';
  warningOverlay.innerHTML = `
    <div style="
      position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647;
      background: ${bgGradient};
      border-bottom: 3px solid ${severityColor};
      padding: 12px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #fff;
      box-shadow: 0 4px 20px rgba(255,0,0,0.3);
    ">
      <div style="display: flex; align-items: center; gap: 12px; max-width: 1200px; margin: 0 auto; flex-wrap: wrap;">
        <div style="
          width: 36px; height: 36px;
          background: rgba(255,68,68,0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        ">${isMalicious ? '🚫' : '⚠️'}</div>
        <div style="flex: 1; min-width: 200px;">
          <strong style="color: ${severityColor}; font-size: 14px;">AegisCore Security Warning</strong>
          <p style="margin: 2px 0 0; font-size: 12px; color: #ccc;">
            This site is classified as <strong>${data.classification.toUpperCase()}</strong>
            (confidence: ${data.confidenceScore}%) — ${data.reputation || 'Threat detected'}
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-shrink: 0;">
          <a href="${baseUrl}/dashboard" target="_blank" style="
            background: rgba(59,130,246,0.3);
            border: 1px solid rgba(59,130,246,0.4);
            color: #60A5FA;
            padding: 6px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            text-decoration: none;
          ">View Details</a>
          <button onclick="(function(el){el.closest('#aegiscore-warning').remove();})(this)" style="
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: #fff;
            padding: 6px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
          ">Dismiss</button>
        </div>
      </div>
    </div>
  `;

  document.body.prepend(warningOverlay);
}
