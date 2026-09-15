/* ==========================================================================
   个人主页 · 交互脚本
   1. 亮色 / 暗色主题切换（localStorage 记忆，支持键盘 T 快捷键，giscus 跟随）
   2. 问候语随时间变化 + 一句话介绍打字机效果
   3. 页脚「最后更新时间」、年份、每日一言、点击涟漪
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getTheme() {
    return root.getAttribute('data-theme') || 'light';
  }

  /* ---------- 1. 主题切换 ---------- */
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) { /* 忽略隐私模式异常 */ }
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    syncGiscusTheme(theme);
  }

  var toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
    // 键盘快捷键：按 T 切换主题
    document.addEventListener('keydown', function (e) {
      if (e.key === 't' || e.key === 'T') {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
      }
    });
    toggleBtn.textContent = getTheme() === 'dark' ? '☀️' : '🌙';
  }

  /* giscus 评论区跟随本站主题（未配置 giscus 时自动跳过，无副作用） */
  function syncGiscusTheme(theme) {
    var iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } },
        'https://giscus.app'
      );
    } catch (e) { /* 跨域消息失败时静默 */ }
  }
  // giscus 加载完成后会向页面发消息，此时再同步一次当前主题
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://giscus.app' || !e.data || !e.data.giscus) return;
    syncGiscusTheme(getTheme());
  });

  /* ---------- 2. 问候语 + 打字机 ---------- */
  var greeting = document.getElementById('greeting');
  if (greeting) {
    var h = new Date().getHours();
    var word;
    if (h < 5) word = '夜深了';
    else if (h < 11) word = '早上好';
    else if (h < 13) word = '中午好';
    else if (h < 18) word = '下午好';
    else word = '晚上好';
    greeting.textContent = word + '，我是';
  }

  // 打字机效果：系统开启「减少动效」或 JS 被禁用时，HTML 中的完整文字原样显示
  var intro = document.getElementById('typed-intro');
  if (intro) {
    if (reducedMotion) {
      var cursor = document.querySelector('.type-cursor');
      if (cursor) cursor.remove();
    } else {
      var chars = Array.from(intro.textContent);
      intro.textContent = '';
      var i = 0;
      var timer = setInterval(function () {
        i++;
        intro.textContent = chars.slice(0, i).join('');
        if (i >= chars.length) clearInterval(timer);
      }, 90);
    }
  }

  /* ---------- 3. 每日一言（hitokoto.cn 免费接口） ---------- */
  var quote = document.getElementById('daily-quote');
  if (quote) {
    var quoteText = quote.querySelector('p');
    var quoteFrom = quote.querySelector('.quote-from');
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 4000);
    fetch('https://v1.hitokoto.cn/', { signal: controller.signal })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        clearTimeout(timeout);
        if (quoteText) quoteText.textContent = '「' + data.hitokoto + '」';
        if (quoteFrom && data.from) quoteFrom.textContent = '—— ' + data.from;
      })
      .catch(function () { /* 加载失败时保留 HTML 中的默认句子 */ });
  }

  /* ---------- 4. 点击涟漪 ---------- */
  if (!reducedMotion) {
    document.addEventListener('click', function (e) {
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    });
  }

  /* ---------- 5. 页脚信息 ---------- */
  // ★ 手动指定更新时间：把下面改成固定日期（如 '2026-09-15'）；
  //   留空 '' 则自动读取文件修改时间（本地双击预览时有效；
  //   GitHub Pages 上建议手动填写一个固定日期，更新内容时顺手改一下）
  var LAST_UPDATED = '';

  var updatedEl = document.getElementById('last-updated');
  if (updatedEl) {
    updatedEl.textContent = LAST_UPDATED || formatDate(document.lastModified);
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function formatDate(raw) {
    if (!raw) return '未知';
    // document.lastModified 形如 "09/15/2026 10:30:00"，随浏览器语言环境略有差异
    var d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }
})();
