const DEEPINFRA_API_KEY = "owldngAsHavSHejUh1qrknZ87RpWvsMc"; // <-- REPLACE with your DeepInfra Free Tier key
const DEEPINFRA_API_URL = "https://api.deepinfra.com/v1/text/generate";

(() => {
  'use strict';

  // ---------- Refs ----------
  const $ = id => document.getElementById(id);
  const qsa = sel => document.querySelectorAll(sel);

  // DOM elements
  const chatEl = $('chat');
  const messageInput = $('messageInput');
  const btnSend = $('btnSend');
  const fileInput = $('fileInput');
  const sidebar = $('sidebar');
  const overlay = $('overlay');
  const mobileMenuBtn = $('mobileMenuBtn');
  const inputBoxEl = $('inputBox');
  const btnProfile = $('btnProfile');
  const btnNewChat = $('btnNewChat');
  const btnClear = $('btnClear');

  // Profile
  const profilePanel = $('profilePanel');
  const closeProfile = $('closeProfile');
  const avatarPreview = $('avatarPreview');
  const avatarUpload = $('avatarUpload');
  const btnRemoveAvatar = $('btnRemoveAvatar');
  const profileName = $('profileName');
  const profileEmail = $('profileEmail');
  const btnSaveProfile = $('btnSaveProfile');

  // Settings
  const settingsPanel = $('settingsPanel');
  const btnSettings = $('btnSettings');
  const closeSettings = $('closeSettings');
  const tabBtns = qsa('.tab-btn');
  const panelSections = qsa('.panel-section');
  const themeModeBtns = qsa('.theme-mode');
  const customBlock = $('customBlock');
  const primaryColor = $('primaryColor');
  const secondaryColor = $('secondaryColor');
  const chatOpacity = $('chatOpacity');
  const chatOpacityVal = $('chatOpacityVal');
  const panelOpacity = $('panelOpacity');
  const panelOpacityVal = $('panelOpacityVal');
  const enableBlend = $('enableBlend');
  const blendAngle = $('blendAngle');

  // Background media
  const bgImageUpload = $('bgImageUpload');
  const bgVideoUpload = $('bgVideoUpload');
  const btnResetBg = $('btnResetBg');
  const bgImage = $('bgImage');
  const bgVideo = $('bgVideo');

  // ADDED: Video controls
  const mediaControlsSection = $('mediaControlsSection');
  const videoControlsBlock = $('videoControlsBlock');
  const imageCropControlsBlock = $('imageCropControlsBlock');
  const audioControlsBlock = $('audioControlsBlock');

  const btnPlayVideo = $('btnPlayVideo');
  const btnPauseVideo = $('btnPauseVideo');
  const btnMuteVideo = $('btnMuteVideo');
  const bgVideoVolume = $('bgVideoVolume');
  const bgVideoVolumeVal = $('bgVideoVolumeVal');
  const bgVideoTimeline = $('bgVideoTimeline');
  const bgVideoTime = $('bgVideoTime');
  const bgVideoDuration = $('bgVideoDuration');
  const btnResetBgVideo = $('btnResetBgVideo');
  const btnCropBgImage = $('btnCropBgImage');
  const btnResetBgImage = $('btnResetBgImage');

  const btnAudioPrev = $('btnAudioPrev');
  const btnAudioPlay = $('btnAudioPlay');
  const btnAudioNext = $('btnAudioNext');
  const currentAudioName = $('currentAudioName');
  const bgAudioTimeline = $('bgAudioTimeline');
  const bgAudioTime = $('bgAudioTime');
  const bgAudioDuration = $('bgAudioDuration');
  const bgAudioVolume = $('bgAudioVolume');
  const bgAudioVolumeVal = $('bgAudioVolumeVal');
  const btnResetBgAudio = $('btnResetBgAudio');

  // TTS
  const voiceSelect = $('voiceSelect');
  const ttsRate = $('ttsRate');
  const ttsRateVal = $('ttsRateVal');
  const ttsPitch = $('ttsPitch');
  const ttsPitchVal = $('ttsPitchVal');
  const ttsSample = $('ttsSample');
  const btnSpeak = $('btnSpeak');
  const btnStopSpeak = $('btnStopSpeak');

  // Search/Summary/Creators
  const btnSearchToggle = $('btnSearchToggle');
  const searchPanel = $('searchPanel');
  const closeSearch = $('closeSearch');
  const searchInput = $('searchInput');
  const searchResults = $('searchResults');

  const btnSummaryToggle = $('btnSummaryToggle');
  const summaryPanel = $('summaryPanel');
  const closeSummary = $('closeSummary');
  const summaryContent = $('summaryContent');

  const btnCreators = $('btnCreators');
  const creatorsPanel = $('creatorsPanel');
  const closeCreators = $('closeCreators');

  // Crop modal
  const cropModal = $('cropModal');
  const cropImage = $('cropImage');
  const btnCropConfirm = $('btnCropConfirm');
  const btnCropCancel = $('btnCropCancel');
  const btnCropClose = $('btnCropClose');

  // ---------- State ----------
  const STORAGE_KEY = 'ai_chat_v1';
  let state = {
    messages: [],
    settings: {
      bodyMode: 'dark',
      chatAlpha: 0.8,
      panelOpacity: 0.92,
      customPrimary: '#6a11cb',
      customSecondary: '#2575fc',
      enableBlend: false,
      blendAngle: 135,
      avatarDataUrl: null,
      bgImage: null,
      bgVideo: null
    }
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = Object.assign({}, state, parsed);
      state.settings = Object.assign({}, state.settings, parsed.settings || {});
    }
  } catch (e) {
    console.warn('Storage load error:', e);
  }

  // ---------- Utilities ----------
  const uid = (p = 'm') => p + Math.random().toString(36).slice(2, 9);
  const isoNow = () => new Date().toISOString();

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn('Storage save error:', e); }
  }

  function normalizeAIicons() {
    qsa('i').forEach(ic => { if (!ic.classList.contains('ai-icon')) ic.classList.add('ai-icon'); });
  }

  function setAvatarPreview(url) {
    if (!avatarPreview) return;
    if (url) {
      avatarPreview.style.backgroundImage = `url(${url})`;
      avatarPreview.style.backgroundSize = 'cover';
      avatarPreview.style.backgroundPosition = 'center';
      avatarPreview.textContent = '';
      if (btnRemoveAvatar) btnRemoveAvatar.style.display = 'inline-flex';
      // RESTORE: Update profile button to show avatar (FIXED)
      if (btnProfile) {
        btnProfile.style.backgroundImage = `url(${url})`;
        btnProfile.style.backgroundSize = 'cover';
        btnProfile.style.backgroundPosition = 'center';
        btnProfile.style.width = '40px';
        btnProfile.style.height = '40px';
        btnProfile.style.borderRadius = '50%';
        btnProfile.style.padding = '0';
        btnProfile.style.border = 'none';
        btnProfile.innerHTML = '';
      }
    } else {
      avatarPreview.style.backgroundImage = '';
      const name = localStorage.getItem('profileName') || 'U';
      avatarPreview.textContent = name.slice(0, 2).toUpperCase();
      if (btnRemoveAvatar) btnRemoveAvatar.style.display = 'none';
      // RESTORE: Reset profile button (FIXED)
      if (btnProfile) {
        btnProfile.style.backgroundImage = '';
        btnProfile.style.width = 'auto';
        btnProfile.style.height = 'auto';
        btnProfile.style.borderRadius = '0';
        btnProfile.style.padding = '8px';
        btnProfile.style.border = '0';
        btnProfile.innerHTML = '<i class="fa-solid fa-user"></i>';
      }
    }
  }

  function avatarFor(role) {
    if (role === 'user') {
      const name = localStorage.getItem('profileName') || 'U';
      const initials = name.split(' ').map(s => s[0] || '').join('').slice(0, 2).toUpperCase() || 'U';
      return { bg: '#0b84ff', text: initials };
    }
    return { bg: state.settings.customPrimary || '#6a11cb', text: 'AI' };
  }

  // ---------- GLOBAL THEME SYSTEM (COMPLETE FIX) ----------
  function applyThemeMode(mode) {
    document.body.classList.remove('dark', 'light', 'custom');
    document.body.classList.add(mode);
    state.settings.bodyMode = mode;

    const hasBg = !!(state.settings.bgImage || state.settings.bgVideo);

    if (mode === 'dark') {
      // DARK THEME: Fixed colors, never use customPrimary/customSecondary
      const darkPrimary = '#7c3aed';
      const darkSecondary = '#06b6d4';
      if (!hasBg) {
        document.body.style.background = `linear-gradient(135deg, ${darkPrimary}, ${darkSecondary})`;
      }
      document.body.style.color = '#ffffff';
    } else if (mode === 'light') {
      // LIGHT THEME: Use light theme colors
      const lightPrimary = state.settings.lightPrimary || '#7c3aed';
      const lightSecondary = state.settings.lightSecondary || '#06b6d4';
      if (!hasBg) {
        document.body.style.background = `linear-gradient(135deg, ${lightPrimary}, ${lightSecondary})`;
      }
      document.body.style.color = '#000000';
    } else if (mode === 'custom') {
      // CUSTOM THEME: Use customPrimary/customSecondary only
      if (!hasBg) {
        const angle = enableBlend && enableBlend.checked ? (blendAngle ? blendAngle.value : 135) : 135;
        const primary = state.settings.customPrimary || '#7c3aed';
        const secondary = state.settings.customSecondary || '#06b6d4';
        if (enableBlend && enableBlend.checked) {
          document.body.style.background = `linear-gradient(${angle}deg, ${primary}, ${secondary})`;
        } else {
          document.body.style.background = primary;
        }
      }
      document.body.style.color = '#ffffff';
    }

    // after setting body class and background, update CSS vars for panels/chat/overlay
    updateCSSVars();

    // ensure panels immediately pick up new panel-bg/text vars
    document.querySelectorAll('.panel').forEach(p=>{
      p.style.background = `var(--panel-bg)`;
      p.style.color = `var(--panel-text)`;
    });

    // set header/profile icon foreground for accessibility
    if (btnProfile) {
      if (document.body.classList.contains('light')) {
        btnProfile.style.color = getComputedStyle(document.documentElement).getPropertyValue('--header-icontint').trim();
        btnProfile.style.border = '1px solid rgba(0,0,0,0.06)';
      } else {
        btnProfile.style.color = getComputedStyle(document.documentElement).getPropertyValue('--header-icontint').trim();
        btnProfile.style.border = '0';
      }
    }

    // ensure chat container background uses the CSS var we set
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      // chat background uses CSS var --chat-alpha
      if (document.body.classList.contains('light')) {
        chatContainer.style.background = `rgba(255,255,255,${state.settings.chatAlpha})`;
        chatContainer.style.color = '#000';
      } else {
        chatContainer.style.background = `rgba(0,0,0,${state.settings.chatAlpha})`;
        chatContainer.style.color = '#fff';
      }
    }

    // ensure background overlay applied (CSS uses body.has-bg-image / has-bg-video + var --bg-overlay)
    if (state.settings.bgImage) document.body.classList.add('has-bg-image');
    if (state.settings.bgVideo) document.body.classList.add('has-bg-video');

    // re-render messages to pick up any color changes
    renderAllMessages();
    saveState();
  }

  // fallback: ensure updateCSSVars exists (safe no-op if real impl present)
  function updateCSSVars() {
    try {
      const root = document.documentElement;
      root.style.setProperty('--chat-alpha', (state.settings.chatAlpha || 0.8).toString());
      root.style.setProperty('--panel-opacity', (state.settings.panelOpacity || 0.92).toString());

      // compute panel background/text for light/dark
      let panelBg = `rgba(20,20,30,${state.settings.panelOpacity || 0.92})`;
      let panelText = '#ffffff';
      if (document.body.classList.contains('light')) {
        panelBg = `rgba(250,250,252,${state.settings.panelOpacity || 0.92})`;
        panelText = '#000000';
      }
      root.style.setProperty('--panel-bg', panelBg);
      root.style.setProperty('--panel-text', panelText);
    } catch (e) {
      // ignore - best-effort only
    }
  }

  // ---------- Color Controls ----------
  // LIGHT THEME COLORS
  const lightPrimaryColor = $('lightPrimaryColor');
  const lightSecondaryColor = $('lightSecondaryColor');

  if (lightPrimaryColor) {
    lightPrimaryColor.addEventListener('change', () => {
      state.settings.lightPrimary = lightPrimaryColor.value;
      if (state.settings.bodyMode === 'light') applyThemeMode('light');
      saveState();
    });
  }

  if (lightSecondaryColor) {
    lightSecondaryColor.addEventListener('change', () => {
      state.settings.lightSecondary = lightSecondaryColor.value;
      if (state.settings.bodyMode === 'light') applyThemeMode('light');
      saveState();
    });
  }

  // CUSTOM THEME COLORS
  if (primaryColor) {
    primaryColor.addEventListener('change', () => {
      state.settings.customPrimary = primaryColor.value;
      updateCSSVars();
      if (state.settings.bodyMode === 'custom') applyThemeMode('custom');
      renderAllMessages();
      saveState();
    });
  }

  if (secondaryColor) {
    secondaryColor.addEventListener('change', () => {
      state.settings.customSecondary = secondaryColor.value;
      updateCSSVars();
      if (state.settings.bodyMode === 'custom') applyThemeMode('custom');
      renderAllMessages();
      saveState();
    });
  }

  if (enableBlend) {
    enableBlend.addEventListener('change', () => {
      state.settings.enableBlend = enableBlend.checked;
      if (state.settings.bodyMode === 'custom') applyThemeMode('custom');
      saveState();
    });
  }

  if (blendAngle) {
    blendAngle.addEventListener('input', () => {
      state.settings.blendAngle = blendAngle.value;
      if (state.settings.bodyMode === 'custom') applyThemeMode('custom');
      saveState();
    });
  }

  // ---------- Opacity sliders (ADDED) ----------
  if (chatOpacity) {
    chatOpacity.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      state.settings.chatAlpha = val / 100;
      if (chatOpacityVal) chatOpacityVal.textContent = `${val}%`;
      // apply to chat container immediately
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        if (document.body.classList.contains('light')) {
          chatContainer.style.background = `rgba(255,255,255,${state.settings.chatAlpha})`;
          chatContainer.style.color = '#000';
        } else {
          chatContainer.style.background = `rgba(0,0,0,${state.settings.chatAlpha})`;
          chatContainer.style.color = '#fff';
        }
      }
      updateCSSVars();
      renderAllMessages();
      saveState();
    });
  }

  if (panelOpacity) {
    panelOpacity.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      state.settings.panelOpacity = val / 100;
      if (panelOpacityVal) panelOpacityVal.textContent = `${val}%`;
      // update panels background
      const panels = document.querySelectorAll('.panel');
      panels.forEach(p => {
        if (document.body.classList.contains('light')) {
          p.style.background = `rgba(250,250,252,${state.settings.panelOpacity})`;
          p.style.color = '#000';
        } else {
          p.style.background = `rgba(20,20,30,${state.settings.panelOpacity})`;
          p.style.color = '#fff';
        }
      });
      updateCSSVars();
      saveState();
    });
  }

  // ---------- Panel Helpers (FIXED - moved here to prevent duplication) ----------
  function closeAllPanels() {
    [profilePanel, settingsPanel, searchPanel, summaryPanel, creatorsPanel].forEach(p => {
      if (p) {
        p.classList.remove('open');
        p.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function openPanel(panelEl) {
    if (!panelEl) return;
    closeAllPanels();
    panelEl.classList.add('open');
    panelEl.setAttribute('aria-hidden', 'false');
  }

  // ---------- Panel Button Listeners (FIXED - single set, no duplicates) ----------
  if (btnProfile) btnProfile.addEventListener('click', () => openPanel(profilePanel));
  if (closeProfile) closeProfile.addEventListener('click', () => closeAllPanels());

  if (btnSettings) btnSettings.addEventListener('click', () => openPanel(settingsPanel));
  if (closeSettings) closeSettings.addEventListener('click', () => closeAllPanels());

  if (btnSearchToggle) btnSearchToggle.addEventListener('click', () => openPanel(searchPanel));
  if (closeSearch) closeSearch.addEventListener('click', () => closeAllPanels());

  if (btnSummaryToggle) btnSummaryToggle.addEventListener('click', () => openPanel(summaryPanel));
  if (closeSummary) closeSummary.addEventListener('click', () => closeAllPanels());

  if (btnCreators) btnCreators.addEventListener('click', () => openPanel(creatorsPanel));
  if (closeCreators) closeCreators.addEventListener('click', () => closeAllPanels());

  // ---------- Tab Navigation ----------
  tabBtns.forEach(b => {
    b.addEventListener('click', () => {
      tabBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      panelSections.forEach(s => s.classList.remove('active'));
      const section = $(b.dataset.tab);
      if (section) section.classList.add('active');
    });
  });

  // ---------- Theme Mode Buttons ----------
  themeModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      applyThemeMode(mode);
      if (customBlock) customBlock.style.display = mode === 'custom' ? 'block' : 'none';
    });
  });

  // ---------- Chat Rendering (RESTORED: minimal, robust implementations) ----------
  function renderMessage(m) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-message ' + (m.role === 'user' ? 'user' : 'ai');
    wrap.dataset.id = m.id;

    const av = avatarFor(m.role);
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.style.background = av.bg;
    avatar.textContent = av.text;

    const body = document.createElement('div');
    body.className = 'msg-body';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    if (m.text) {
      const p = document.createElement('div');
      p.style.whiteSpace = 'pre-wrap';
      p.textContent = m.text;
      bubble.appendChild(p);
    }

    if (m.attachment && m.attachment.url) {
      const type = m.attachment.type || '';
      const name = m.attachment.name || 'file';

      // Image preview
      if (type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = m.attachment.url;
        img.alt = name;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '60vh';
        img.style.borderRadius = '8px';
        bubble.appendChild(img);
      }
      // Video preview
      else if (type.startsWith('video/')) {
        const v = document.createElement('video');
        v.src = m.attachment.url;
        v.controls = true;
        v.style.maxWidth = '100%';
        v.style.maxHeight = '60vh';
        v.style.borderRadius = '8px';
        v.style.display = 'block';
        bubble.appendChild(v);
      }
      // Audio player
      else if (type.startsWith('audio/')) {
        const a = document.createElement('audio');
        a.src = m.attachment.url;
        a.controls = true;
        a.style.maxWidth = '100%';
        a.style.width = '100%';
        a.style.minWidth = '200px';
        a.style.borderRadius = '8px';
        a.style.display = 'block';
        a.style.margin = '6px 0';
        bubble.appendChild(a);
      }
      // File container for all other file types
      else {
        const fileContainer = document.createElement('div');
        fileContainer.className = 'file-container';
        fileContainer.setAttribute('data-file-type', getFileExtension(name));

        const fileIcon = document.createElement('div');
        fileIcon.className = 'file-icon';
        fileIcon.textContent = getFileIcon(type, name);

        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';

        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = name;

        const fileType = document.createElement('div');
        fileType.className = 'file-type';
        fileType.textContent = getFileType(type, name);

        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileType);
        fileContainer.appendChild(fileIcon);
        fileContainer.appendChild(fileInfo);

        // Add download link
        const downloadLink = document.createElement('a');
        downloadLink.href = m.attachment.url;
        downloadLink.download = name;
        downloadLink.style.display = 'none';
        downloadLink.id = 'download-' + m.id;
        fileContainer.appendChild(downloadLink);

        fileContainer.addEventListener('click', () => {
          downloadLink.click();
        });

        bubble.appendChild(fileContainer);
      }
    }

    body.appendChild(bubble);

    // optional read aloud button for AI
    if (m.role === 'ai' && m.text && typeof speechSynthesis !== 'undefined') {
      const readBtn = document.createElement('button');
      readBtn.className = 'read-aloud-btn';
      readBtn.textContent = 'Read aloud';
      readBtn.addEventListener('click', () => {
        const u = new SpeechSynthesisUtterance(m.text);
        const voices = speechSynthesis.getVoices();
        u.voice = voices[voiceSelect?.value] || voices[0];
        u.rate = parseFloat(ttsRate?.value) || 1;
        u.pitch = parseFloat(ttsPitch?.value) || 1;
        speechSynthesis.speak(u);
      });
      body.appendChild(readBtn);
    }

    wrap.appendChild(avatar);
    wrap.appendChild(body);
    return wrap;
  }

  // Helper function to get file extension
  function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'file';
  }

  // Helper function to get appropriate icon for file type
  function getFileIcon(type, filename) {
    const ext = getFileExtension(filename).toLowerCase();
    
    // Audio files
    if (type.includes('audio') || ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg'].includes(ext)) {
      return '🎵';
    }
    // Video files
    if (type.includes('video') || ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
      return '🎬';
    }
    // Document files
    if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
      return '📄';
    }
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return '📦';
    }
    // Code files
    if (['js', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c'].includes(ext)) {
      return '💻';
    }
    // Default
    return '📎';
  }

  // Helper function to get readable file type
  function getFileType(type, filename) {
    const ext = getFileExtension(filename).toUpperCase();
    
    if (type) {
      const parts = type.split('/');
      return `${parts[0].toUpperCase()} • ${ext}`;
    }
    return ext;
  }

  function renderAllMessages() {
    if (!chatEl) return;
    chatEl.innerHTML = '';
    (state.messages || []).forEach(m => {
      try { chatEl.appendChild(renderMessage(m)); } catch (e) { console.warn('render message error', e); }
    });
    requestAnimationFrame(() => { chatEl.scrollTop = chatEl.scrollHeight; });
    normalizeAIicons();
  }

  // simple addMessage helper used by UI handlers
  function addMessage(role, text = '', attachment = null) {
    const msg = { id: uid(role === 'user' ? 'u' : 'a'), role, text, timeISO: isoNow(), attachment, history: [] };
    state.messages.push(msg);
    saveState();
    renderAllMessages();
    return msg;
  }

  // minimal AI reply (placeholder) — keep non-blocking and safe
  async function generateAIReply(userText) {
    const m = { id: uid('a'), role: 'ai', text: 'Thinking...', timeISO: isoNow() };
    state.messages.push(m);
    renderAllMessages();

    try {
      // Simple local echo fallback so UI is responsive even if external API fails.
      // If DEEPINFRA_API_KEY is configured use the remote API (best-effort).
      if (DEEPINFRA_API_KEY && !DEEPINFRA_API_KEY.includes('xxxx')) {
        const payload = { model: "gpt-3.5-mini", input: userText, max_output_tokens: 512, temperature: 0.7 };
        const res = await fetch(DEEPINFRA_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPINFRA_API_KEY}` },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const txt = await res.text();
          m.text = `❌ API Error: ${res.status} ${txt}`;
        } else {
          const data = await res.json();
          const text = data?.outputs?.[0]?.content || data?.choices?.[0]?.message?.content || data?.text || JSON.stringify(data);
          m.text = typeof text === 'string' ? text : JSON.stringify(text);
        }
      } else {
        // local fallback
        m.text = `AI (local): I received your message: "${userText}"`;
      }
    } catch (err) {
      m.text = `❌ Error: ${err.message}`;
    }

    saveState();
    renderAllMessages();
  }

  // ---------- Ensure core UI handlers are present (robust, added/safeguarded) ----------
  // Send button (guard duplicate attachments)
  if (btnSend) {
    btnSend.addEventListener('click', () => {
      try {
        const editingId = messageInput?.dataset?.editing;
        const text = (messageInput?.value || '').trim();

        if (editingId) {
          const idx = state.messages.findIndex(m => m.id === editingId);
          if (idx !== -1) {
            state.messages[idx].history = state.messages[idx].history || [];
            state.messages[idx].history.push({ text: state.messages[idx].text, timeISO: state.messages[idx].timeISO });
            state.messages[idx].text = text;
            state.messages[idx].timeISO = isoNow();
            delete messageInput.dataset.editing;
            saveState();
            renderAllMessages();
            messageInput.value = '';
            return;
          }
        }

        // file attachment path
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const reader = new FileReader();
          reader.onload = ev => {
            const attachment = { url: ev.target.result, name: file.name, type: file.type };
            addMessage('user', text || `[file: ${file.name}]`, attachment);
            fileInput.value = '';
            messageInput.value = '';
            if (text) generateAIReply(text);
          };
          reader.readAsDataURL(file);
          return;
        }

        // plain text
        if (!text) return;
        addMessage('user', text, null);
        messageInput.value = '';
        generateAIReply(text);
      } catch (e) { console.error('send error', e); }
    });
  }

  // New Chat: clear all messages after confirmation
  if (btnNewChat) {
    btnNewChat.addEventListener('click', () => {
      if (!confirm('Start a new chat? This will clear all messages. Continue?')) return;
      state.messages = [];
      saveState();
      renderAllMessages();
    });
  }
  
  // Clear Chat: clear messages after confirmation (keeps New Chat behavior explicit)
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (!confirm('Clear all chat messages? This cannot be undone.')) return;
      state.messages = [];
      saveState();
      renderAllMessages();
    });
  }

  // Enter key to send
  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); btnSend && btnSend.click(); }
    });
  }

  // File input: attach and create message
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        addMessage('user', `[file: ${f.name}]`, { url: r.result, name: f.name, type: f.type });
        // ensure bubble layout refreshed and scrolled into view
        requestAnimationFrame(() => { renderAllMessages(); });
      };
      r.readAsDataURL(f);
      e.target.value = '';
    });
  }

  // Mobile menu toggle + overlay
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('show');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('show');
    });
  }

  // ---------- Profile Handlers (AVATAR CROP RESTORE) ----------
  // Avatar crop / upload using Cropper.js
  let avatarCropper = null;
  if (avatarUpload) {
    avatarUpload.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        // show crop modal (reuse cropModal / cropImage elements)
        if (!cropModal || !cropImage) {
          // fallback: set avatar directly if crop modal not present
          state.settings.avatarDataUrl = ev.target.result;
          setAvatarPreview(ev.target.result);
          saveState();
          return;
        }
        cropImage.src = ev.target.result;
        cropModal.style.display = 'flex';
        // destroy existing cropper
        if (avatarCropper) { try { avatarCropper.destroy(); } catch(_){} avatarCropper = null; }
        if (typeof Cropper !== 'undefined') {
          avatarCropper = new Cropper(cropImage, { aspectRatio: 1, viewMode: 1, autoCropArea: 1, responsive: true });
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Crop modal buttons
  if (btnCropConfirm) {
    btnCropConfirm.addEventListener('click', () => {
      if (!avatarCropper) return;
      const canvas = avatarCropper.getCroppedCanvas({ width: 256, height: 256, imageSmoothingQuality: 'high' });
      const dataUrl = canvas.toDataURL('image/png');
      state.settings.avatarDataUrl = dataUrl;
      saveState();
      setAvatarPreview(dataUrl);
      try { avatarCropper.destroy(); } catch (_) {}
      avatarCropper = null;
      if (cropModal) cropModal.style.display = 'none';
    });
  }
  if (btnCropCancel) {
    btnCropCancel.addEventListener('click', () => {
      if (avatarCropper) { try { avatarCropper.destroy(); } catch(_){} avatarCropper = null; }
      if (cropModal) cropModal.style.display = 'none';
    });
  }
  if (btnCropClose) {
    btnCropClose.addEventListener('click', () => {
      if (avatarCropper) { try { avatarCropper.destroy(); } catch(_){} avatarCropper = null; }
      if (cropModal) cropModal.style.display = 'none';
    });
  }

  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', () => {
      localStorage.setItem('profileName', profileName.value || 'User');
      localStorage.setItem('profileEmail', profileEmail.value || '');
      saveState();
      alert('Profile saved!');
    });
  }

  // ---------- Background Media Controls (CLEANED UP - no duplicates) ----------
  function updateMediaControlsVisibility() {
    if (!mediaControlsSection) return;
    const hasVideo = !!state.settings.bgVideo;
    const hasImage = !!state.settings.bgImage;
    const hasAudio = state.settings.bgAudioList && state.settings.bgAudioList.length > 0;
    
    if (hasVideo || hasImage || hasAudio) {
      mediaControlsSection.style.display = 'block';
      if (videoControlsBlock) videoControlsBlock.style.display = hasVideo ? 'block' : 'none';
      if (imageCropControlsBlock) imageCropControlsBlock.style.display = hasImage ? 'block' : 'none';
      if (audioControlsBlock) audioControlsBlock.style.display = hasAudio ? 'block' : 'none';
    } else {
      mediaControlsSection.style.display = 'none';
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  // Image Upload
  if (bgImageUpload) {
    bgImageUpload.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      document.body.style.backgroundImage = `url(${url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.classList.add('has-bg-image');
      if (bgImage) { bgImage.src = url; bgImage.style.display = 'block'; }
      if (bgVideo) { bgVideo.pause(); bgVideo.style.display = 'none'; document.body.classList.remove('has-bg-video'); }
      state.settings.bgImage = url;
      state.settings.bgVideo = null;
      saveState();
      updateMediaControlsVisibility();
    });
  }

  // Video Upload
  if (bgVideoUpload) {
    bgVideoUpload.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (bgVideo) {
        bgVideo.src = url;
        bgVideo.loop = true;
        bgVideo.muted = true;
        bgVideo.autoplay = true;
        bgVideo.playsInline = true;
        bgVideo.style.display = 'block';
        bgVideo.play().catch(() => {});
      }
      document.body.style.backgroundImage = '';
      document.body.classList.add('has-bg-video');
      if (bgImage) { bgImage.style.display = 'none'; document.body.classList.remove('has-bg-image'); }
      state.settings.bgVideo = url;
      state.settings.bgImage = null;
      saveState();
      updateMediaControlsVisibility();
    });
  }

  // Audio Upload
  if (bgAudioUpload) {
    bgAudioUpload.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach(f => {
        const r = new FileReader();
        r.onload = (ev) => {
          if (!state.settings.bgAudioList) state.settings.bgAudioList = [];
          state.settings.bgAudioList.push({ url: ev.target.result, name: f.name });
          saveState();
          updateMediaControlsVisibility();
          if (state.settings.bgAudioList.length === 1) playAudioTrack(0);
        };
        r.readAsDataURL(f);
      });
      bgAudioUpload.value = '';
    });
  }

  // Reset Background
  if (btnResetBg) {
    btnResetBg.addEventListener('click', () => {
      document.body.style.backgroundImage = '';
      if (bgImage) { bgImage.src = ''; bgImage.style.display = 'none'; }
      if (bgVideo) { bgVideo.pause(); bgVideo.src = ''; bgVideo.style.display = 'none'; }
      if (bgAudio) { bgAudio.pause(); bgAudio.src = ''; }
      document.body.classList.remove('has-bg-image', 'has-bg-video');
      state.settings.bgImage = null;
      state.settings.bgVideo = null;
      state.settings.bgAudioList = [];
      state.settings.bgAudioIndex = 0;
      saveState();
      applyThemeMode(state.settings.bodyMode);
      updateMediaControlsVisibility();
    });
  }

  // ---------- Video Timeline & Controls ----------
  if (bgVideoTimeline) {
    bgVideoTimeline.addEventListener('input', () => {
      if (bgVideo && bgVideo.duration) {
        bgVideo.currentTime = (bgVideoTimeline.value / 100) * bgVideo.duration;
      }
    });
  }

  if (bgVideo) {
    bgVideo.addEventListener('timeupdate', () => {
      if (bgVideoTimeline && bgVideo.duration) {
        bgVideoTimeline.value = (bgVideo.currentTime / bgVideo.duration) * 100;
        if (bgVideoTime) bgVideoTime.textContent = formatTime(bgVideo.currentTime);
      }
    });
    bgVideo.addEventListener('loadedmetadata', () => {
      if (bgVideoDuration) bgVideoDuration.textContent = formatTime(bgVideo.duration);
    });
  }

  if (btnPlayVideo) btnPlayVideo.addEventListener('click', () => { if (bgVideo) bgVideo.play().catch(() => {}); });
  if (btnPauseVideo) btnPauseVideo.addEventListener('click', () => { if (bgVideo) bgVideo.pause(); });
  if (btnMuteVideo) {
    btnMuteVideo.addEventListener('click', () => {
      if (bgVideo) {
        bgVideo.muted = !bgVideo.muted;
        btnMuteVideo.innerHTML = bgVideo.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
      }
    });
  }

  if (bgVideoVolume) {
    bgVideoVolume.addEventListener('input', () => {
      const vol = parseInt(bgVideoVolume.value) / 100;
      if (bgVideo) bgVideo.volume = vol;
      if (bgVideoVolumeVal) bgVideoVolumeVal.textContent = bgVideoVolume.value + '%';
      state.settings.bgVideoVolume = vol;
      saveState();
    });
  }

  if (btnResetBgVideo) {
    btnResetBgVideo.addEventListener('click', () => {
      document.body.style.backgroundImage = '';
      if (bgVideo) { bgVideo.pause(); bgVideo.src = ''; bgVideo.style.display = 'none'; }
      document.body.classList.remove('has-bg-video');
      state.settings.bgVideo = null;
      saveState();
      applyThemeMode(state.settings.bodyMode);
      updateMediaControlsVisibility();
      if (bgVideoVolume) bgVideoVolume.value = 100;
      if (bgVideoVolumeVal) bgVideoVolumeVal.textContent = '100%';
    });
  }

  // ---------- Image Crop ----------
  if (btnCropBgImage) {
    btnCropBgImage.addEventListener('click', () => {
      if (!state.settings.bgImage) return alert('No image background set');
      cropImage.src = state.settings.bgImage;
      cropModal.style.display = 'flex';
      if (cropper) { cropper.destroy(); cropper = null; }
      cropper = new Cropper(cropImage, { aspectRatio: 16/9, viewMode: 1, autoCropArea: 1, responsive: true });
      createRotateControls();
    });
  }

  if (btnResetBgImage) {
    btnResetBgImage.addEventListener('click', () => {
      document.body.style.backgroundImage = '';
      if (bgImage) { bgImage.src = ''; bgImage.style.display = 'none'; }
      document.body.classList.remove('has-bg-image');
      state.settings.bgImage = null;
      saveState();
      applyThemeMode(state.settings.bodyMode);
      updateMediaControlsVisibility();
    });
  }

  // ---------- Audio Playback ----------
  function playAudioTrack(index) {
    if (!state.settings.bgAudioList || !state.settings.bgAudioList.length) return;
    state.settings.bgAudioIndex = index % state.settings.bgAudioList.length;
    const track = state.settings.bgAudioList[state.settings.bgAudioIndex];
    if (bgAudio) {
      bgAudio.src = track.url;
      bgAudio.volume = state.settings.bgAudioVolume || 1;
      bgAudio.play().catch(() => {});
      if (currentAudioName) currentAudioName.textContent = track.name;
    }
    saveState();
  }

  if (bgAudioTimeline) {
    bgAudioTimeline.addEventListener('input', () => {
      if (bgAudio && bgAudio.duration) {
        bgAudio.currentTime = (bgAudioTimeline.value / 100) * bgAudio.duration;
      }
    });
  }

  if (bgAudio) {
    bgAudio.addEventListener('timeupdate', () => {
      if (bgAudioTimeline && bgAudio.duration) {
        bgAudioTimeline.value = (bgAudio.currentTime / bgAudio.duration) * 100;
        if (bgAudioTime) bgAudioTime.textContent = formatTime(bgAudio.currentTime);
      }
    });
    bgAudio.addEventListener('loadedmetadata', () => {
      if (bgAudioDuration) bgAudioDuration.textContent = formatTime(bgAudio.duration);
    });
    bgAudio.addEventListener('ended', () => {
      if (btnAudioNext) btnAudioNext.click();
    });
  }

  if (btnAudioPrev) {
    btnAudioPrev.addEventListener('click', () => {
      if (!state.settings.bgAudioList || !state.settings.bgAudioList.length) return;
      playAudioTrack((state.settings.bgAudioIndex || 0) - 1);
    });
  }

  if (btnAudioPlay) {
    btnAudioPlay.addEventListener('click', () => {
      if (!state.settings.bgAudioList || !state.settings.bgAudioList.length) {
        alert('No audio files. Upload audio in Settings > Background');
        return;
      }
      playAudioTrack(state.settings.bgAudioIndex || 0);
    });
  }

  if (btnAudioNext) {
    btnAudioNext.addEventListener('click', () => {
      if (!state.settings.bgAudioList || !state.settings.bgAudioList.length) return;
      playAudioTrack((state.settings.bgAudioIndex || 0) + 1);
    });
  }

  if (bgAudioVolume) {
    bgAudioVolume.addEventListener('input', () => {
      const vol = parseInt(bgAudioVolume.value) / 100;
      if (bgAudio) bgAudio.volume = vol;
      if (bgAudioVolumeVal) bgAudioVolumeVal.textContent = bgAudioVolume.value + '%';
      state.settings.bgAudioVolume = vol;
      saveState();
    });
  }

  if (btnResetBgAudio) {
    btnResetBgAudio.addEventListener('click', () => {
      if (bgAudio) { bgAudio.pause(); bgAudio.src = ''; }
      state.settings.bgAudioList = [];
      state.settings.bgAudioIndex = 0;
      saveState();
      updateMediaControlsVisibility();
      if (currentAudioName) currentAudioName.textContent = 'No audio';
      if (bgAudioVolume) bgAudioVolume.value = 100;
      if (bgAudioVolumeVal) bgAudioVolumeVal.textContent = '100%';
    });
  }

  // ---------- Search ----------
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const query = (e.target.value || '').toLowerCase();
      const results = (state.messages || []).filter(m => (m.text || '').toLowerCase().includes(query));
      if (searchResults) searchResults.textContent = results.map(m => `[${m.role.toUpperCase()}] ${m.text}`).join('\n\n') || 'No results';
    });
  }

  // ---------- Summary ----------
  if (btnSummaryToggle) {
    btnSummaryToggle.addEventListener('click', () => {
      const summary = state.messages.map(m => `${m.role.toUpperCase()}: ${m.text || '[media]'}`).join('\n\n');
      if (summaryContent) summaryContent.textContent = summary || 'No messages yet';
    });
  }

  // ---------- Avatar / Background cropping (NEW unified flow) ----------
  // single Cropper instance used for both avatar and background cropping
  let _cropper = null;
  let _cropTarget = null; // 'avatar' | 'bg'
  let _cropOnSave = null;

  function createRotateControls() {
    const container = $('rotateControlsContainer');
    if (!container) return;
    container.innerHTML = '';

    const makeBtn = (html, cb) => {
      const b = document.createElement('button');
      b.className = 'file-btn';
      b.innerHTML = html;
      b.addEventListener('click', cb);
      b.style.whiteSpace = 'nowrap';
      return b;
    };

    container.appendChild(makeBtn('<i class="fa-solid fa-rotate-left"></i> Rotate', () => { if (_cropper) _cropper.rotate(-90); }));
    container.appendChild(makeBtn('<i class="fa-solid fa-rotate-right"></i> Rotate', () => { if (_cropper) _cropper.rotate(90); }));
    container.appendChild(makeBtn('<i class="fa-solid fa-arrows-left-right"></i> Flip H', () => {
      if (!_cropper) return;
      const d = _cropper.getData();
      const sx = d.scaleX || 1;
      _cropper.scaleX(sx * -1);
    }));
    container.appendChild(makeBtn('<i class="fa-solid fa-arrows-up-down"></i> Flip V', () => {
      if (!_cropper) return;
      const d = _cropper.getData();
      const sy = d.scaleY || 1;
      _cropper.scaleY(sy * -1);
    }));
    container.appendChild(makeBtn('<i class="fa-solid fa-rotate"></i> Reset', () => { if (_cropper) _cropper.reset(); }));
  }

  function clearRotateControls() {
    const container = $('rotateControlsContainer');
    if (container) container.innerHTML = '';
  }

  function openCropModal(dataUrl, target, aspectRatio = NaN, onSave) {
    if (!cropModal || !cropImage) {
      // fallback: call onSave directly
      onSave && onSave(dataUrl);
      return;
    }

    _cropTarget = target;
    _cropOnSave = onSave;

    cropImage.src = dataUrl;
    cropModal.style.display = 'flex';

    // destroy any existing cropper
    try { if (_cropper) { _cropper.destroy(); _cropper = null; } } catch (_) { _cropper = null; }

    // pick aspect ratio (avatar => 1, bg => aspectRatio or free)
    const opts = { viewMode: 1, autoCropArea: 1, responsive: true };
    if (!isNaN(aspectRatio)) opts.aspectRatio = aspectRatio;

    if (typeof Cropper !== 'undefined') {
      _cropper = new Cropper(cropImage, opts);
    }

    createRotateControls();
  }

  function closeCropModal() {
    try { if (_cropper) { _cropper.destroy(); _cropper = null; } } catch (_) { _cropper = null; }
    _cropTarget = null;
    _cropOnSave = null;
    cropModal.style.display = 'none';
    clearRotateControls();
  }

  // Replace previous avatar upload handler to use crop modal
  if (avatarUpload) {
    avatarUpload.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        // open crop modal for avatar with square aspect ratio
        openCropModal(ev.target.result, 'avatar', 1, (dataUrl) => {
          // save avatar
          state.settings.avatarDataUrl = dataUrl;
          saveState();
          setAvatarPreview(dataUrl);
        });
      };
      reader.readAsDataURL(file);
      // reset input so same file can be reselected later
      e.target.value = '';
    });
  }

  // Replace previous bg image upload handler to use crop modal
  if (bgImageUpload) {
    bgImageUpload.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        // open crop modal for background image with 16:9 default aspect ratio (user can reset)
        openCropModal(ev.target.result, 'bg', 16/9, (dataUrl) => {
          // set background to cropped image
          state.settings.bgImage = dataUrl;
          state.settings.bgVideo = null;
          // apply UI
          document.body.style.backgroundImage = `url(${dataUrl})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
          if (bgImage) { bgImage.src = dataUrl; bgImage.style.display = 'block'; }
          if (bgVideo) { bgVideo.pause(); bgVideo.style.display = 'none'; }
          saveState();
          updateMediaControlsVisibility();
        });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }

  // Crop modal confirm/cancel/close buttons
  if (btnCropConfirm) {
    btnCropConfirm.addEventListener('click', () => {
      if (!_cropper || !_cropOnSave) { closeCropModal(); return; }

      // choose output size suitable for the target
      let canvas;
      try {
        if (_cropTarget === 'avatar') {
          canvas = _cropper.getCroppedCanvas({ width: 256, height: 256, imageSmoothingQuality: 'high' });
        } else {
          // background: wide canvas
          const outW = Math.min(1920, _cropper.getImageData().naturalWidth || 1920);
          const outH = Math.round(outW / (_cropper.options.aspectRatio || 16/9));
          canvas = _cropper.getCroppedCanvas({ width: outW, height: outH, imageSmoothingQuality: 'high' });
        }
      } catch (err) {
        // fallback: use default
        try { canvas = _cropper.getCroppedCanvas(); } catch (_) { canvas = null; }
      }

      if (canvas) {
        const mime = _cropTarget === 'avatar' ? 'image/png' : 'image/jpeg';
        const quality = _cropTarget === 'avatar' ? 1.0 : 0.9;
        const dataUrl = canvas.toDataURL(mime, quality);
        try { _cropOnSave(dataUrl); } catch (e) { console.warn('crop save callback failed', e); }
      }

      closeCropModal();
    });
  }

  if (btnCropCancel) {
    btnCropCancel.addEventListener('click', () => closeCropModal());
  }
  if (btnCropClose) {
    btnCropClose.addEventListener('click', () => closeCropModal());
  }

  // ---------- Initialize ----------
  function hydrateUI() {
    renderAllMessages();
    normalizeAIicons();
    setAvatarPreview(state.settings.avatarDataUrl || null);

    const savedMode = state.settings.bodyMode || 'dark';
    document.body.classList.add(savedMode);
    applyThemeMode(savedMode);

    if (savedMode === 'custom') {
      if (customBlock) customBlock.style.display = 'block';
      if (enableBlend) enableBlend.checked = state.settings.enableBlend || false;
      if (blendAngle) blendAngle.value = state.settings.blendAngle || 135;
      if (primaryColor) primaryColor.value = state.settings.customPrimary || '#6a11cb';
      if (secondaryColor) secondaryColor.value = state.settings.customSecondary || '#2575fc';
    } else {
      if (customBlock) customBlock.style.display = 'none';
    }

    // Restore background
    if (state.settings.bgImage) {
      document.body.style.backgroundImage = `url(${state.settings.bgImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.classList.add('has-bg-image');
      if (bgImage) { bgImage.src = state.settings.bgImage; bgImage.style.display = 'block'; }
    } else if (state.settings.bgVideo) {
      if (bgVideo) {
        bgVideo.src = state.settings.bgVideo;
        bgVideo.loop = true;
        bgVideo.muted = true;
        bgVideo.autoplay = true;
        bgVideo.playsInline = true;
        bgVideo.style.display = 'block';
        bgVideo.volume = state.settings.bgVideoVolume || 1;
        bgVideo.play().catch(() => {});
      }
      document.body.classList.add('has-bg-video');
    }

    if (state.settings.bgAudioList && state.settings.bgAudioList.length) {
      playAudioTrack(state.settings.bgAudioIndex || 0);
    }

    if (bgVideoVolume) bgVideoVolume.value = Math.round((state.settings.bgVideoVolume || 1) * 100);
    if (bgVideoVolumeVal) bgVideoVolumeVal.textContent = Math.round((state.settings.bgVideoVolume || 1) * 100) + '%';
    if (bgAudioVolume) bgAudioVolume.value = Math.round((state.settings.bgAudioVolume || 1) * 100);
    if (bgAudioVolumeVal) bgAudioVolumeVal.textContent = Math.round((state.settings.bgAudioVolume || 1) * 100) + '%';

    if (chatOpacity) chatOpacity.value = Math.round(state.settings.chatAlpha * 100);
    if (panelOpacity) panelOpacity.value = Math.round(state.settings.panelOpacity * 100);
    if (chatOpacityVal) chatOpacityVal.textContent = Math.round(state.settings.chatAlpha * 100) + '%';
    if (panelOpacityVal) panelOpacityVal.textContent = Math.round(state.settings.panelOpacity * 100) + '%';

    closeAllPanels();
    updateMediaControlsVisibility();
  }

  hydrateUI();

  // ---------- Accessibility ----------
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      messageInput?.focus();
    }
    if (e.key === 'Escape') {
      closeAllPanels();
      if (window.innerWidth <= 980) sidebar?.classList.remove('open');
    }
  });

  // ---------- Ensure Enter key sends message (ADDED) ----------
  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (btnSend) btnSend.click();
      }
    });
  }

})();
