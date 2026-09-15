/* ==========================================================================
   个人主页 · 交互脚本
   1. 亮色 / 暗色主题切换（localStorage 记忆，支持键盘 T 快捷键，giscus 跟随）
   2. 问候语随时间变化 + 一句话介绍打字机效果
   3. 页脚「最后更新时间」、年份、金句轮换、点击涟漪
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

  /* ---------- 3. 页脚金句：LOL / 王者荣耀台词 + 废话文学，本地随机轮换（点击换一条） ---------- */
  var quote = document.getElementById('daily-quote');
  if (quote) {
    var quoteText = quote.querySelector('p');
    var quoteFrom = quote.querySelector('.quote-from');
    var QUOTES = [
      { text: '坚如磐石。', from: '墨菲特 · 英雄联盟' },
      { text: '俺也是从石头里蹦出来的，为啥不是猴子呢？', from: '墨菲特 · 英雄联盟' },
      { text: '我已经是全速前进了！', from: '墨菲特 · 英雄联盟' },
      { text: '这就是和石头战斗的代价！', from: '墨菲特 · 英雄联盟' },
      { text: '王牌飞行员，申请出战！', from: '库奇 · 英雄联盟' },
      { text: '现在的我已经飙到极限了！', from: '库奇 · 英雄联盟' },
      { text: '大部分人都会打飞机，这对飞机来说很不公平！', from: '库奇 · 英雄联盟' },
      { text: '你买单，我就来！', from: '古拉加斯 · 英雄联盟' },
      { text: '欢乐时光就要开始了！', from: '古拉加斯 · 英雄联盟' },
      { text: '死亡如风，常伴吾身。', from: '亚索 · 英雄联盟' },
      { text: '双眼失明丝毫不影响我追捕敌人。', from: '李青 · 英雄联盟' },
      { text: '无形之刃，最为致命。', from: '劫 · 英雄联盟' },
      { text: '我于杀戮之中盛放，亦如黎明中的花朵。', from: '烬 · 英雄联盟' },
      { text: '无敌的我，又迷路了。', from: '宫本武藏 · 王者荣耀' },
      { text: '鲁班大师，智商二百五。', from: '鲁班七号 · 王者荣耀' },
      { text: '星光荡开宇宙，本人闪耀其中。', from: '曜 · 王者荣耀' },
      { text: '那些打不死我的，一直在打我。', from: '佚名' },
      { text: '把自卑的人翻过来会变成一个卑自。', from: '佚名' },
      { text: '据我所知，我一无所知。', from: '佚名' },
      { text: '一想到马上要睡着了，就兴奋得睡不着。', from: '佚名' },
      { text: '收徒啥也不教。', from: '佚名' },
      { text: '恭喜你，被我恭喜到了。', from: '佚名' },
      { text: '作为一个过来人，我给的建议是别过来。', from: '佚名' },
      { text: '世上无难事，只要肯放弃。', from: '佚名' },
      { text: '你的背后一定有你的屁股。', from: '佚名' },
      { text: '但凡有一点办法，也不至于一点办法都没有。', from: '佚名' }
    ];
    var lastIndex = -1;
    function rollQuote() {
      var i;
      do { i = Math.floor(Math.random() * QUOTES.length); } while (i === lastIndex && QUOTES.length > 1);
      lastIndex = i;
      if (quoteText) quoteText.textContent = '「' + QUOTES[i].text + '」';
      if (quoteFrom) quoteFrom.textContent = '—— ' + QUOTES[i].from;
    }
    quote.addEventListener('click', rollQuote);
    rollQuote();
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
