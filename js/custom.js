/* =========================================================================
   博客装饰脚本 (custom.js)
   1) 暗色 / 亮色切换  2) 顶部阅读进度条  3) 滚动后导航变毛玻璃
   4) 回到顶部  5) 代码一键复制  6) 自动估算阅读时长
   ========================================================================= */
(function () {
  'use strict';

  var docEl = document.documentElement;

  /* ---------------- 1. 主题切换 ---------------- */
  function currentTheme() {
    return docEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme, remember) {
    docEl.setAttribute('data-theme', theme);
    try {
      if (remember) localStorage.setItem('theme', theme);
    } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e1017' : '#f4f5fa');
  }

  var subNav = document.getElementById('sub-nav');
  if (subNav) {
    var toggle = document.createElement('a');
    toggle.className = 'nav-icon theme-toggle';
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-label', '切换深浅色主题');
    toggle.innerHTML = '<span class="fa"></span>';
    subNav.appendChild(toggle);

    var syncIcon = function () {
      toggle.querySelector('.fa').className =
        'fa ' + (currentTheme() === 'dark' ? 'fa-sun-o' : 'fa-moon-o');
    };
    syncIcon();

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
      syncIcon();
    });

    applyTheme(currentTheme(), false);
  }

  /* ---------------- 2. 阅读进度条 ---------------- */
  var progress = document.createElement('div');
  progress.id = 'read-progress';
  document.body.appendChild(progress);

  /* ---------------- 3. 导航毛玻璃 / 4. 回到顶部 ---------------- */
  var headerInner = document.getElementById('header-inner');
  var toTop = document.createElement('div');
  toTop.id = 'to-top';
  toTop.setAttribute('role', 'button');
  toTop.setAttribute('aria-label', '回到顶部');
  toTop.innerHTML = '<span class="fa fa-arrow-up"></span>';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset || docEl.scrollTop;
    var h = Math.max(
      document.body.scrollHeight,
      docEl.scrollHeight
    ) - window.innerHeight;
    progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    if (headerInner) headerInner.classList.toggle('nav-solid', y > 60);
    toTop.classList.toggle('on', y > 600);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------------- 5. 代码复制 ---------------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }

  Array.prototype.forEach.call(
    document.querySelectorAll('.article-entry figure.highlight'),
    function (fig) {
      var code = fig.querySelector('.code pre') || fig.querySelector('pre');
      if (!code) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = '复制';

      var lang = (fig.className.match(/highlight\s+([\w+#.-]+)/) || [])[1];
      if (lang && lang !== 'highlight') {
        var tag = document.createElement('span');
        tag.className = 'code-lang';
        tag.textContent = lang;
        fig.appendChild(tag);
      }

      btn.addEventListener('click', function () {
        copyText(code.innerText.replace(/\n$/, '')).then(function () {
          btn.textContent = '已复制';
          btn.classList.add('done');
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('done');
          }, 1600);
        });
      });
      fig.appendChild(btn);
    }
  );

  /* ---------------- 6. 阅读时长 ---------------- */  Array.prototype.forEach.call(
    document.querySelectorAll('.article'),
    function (article) {
      var meta = article.querySelector('.article-meta');
      var entry = article.querySelector('.article-entry');
      if (!meta || !entry || meta.querySelector('.read-time')) return;
      var text = (entry.innerText || '').trim();
      if (text.length < 120) return;
      var minutes = Math.max(1, Math.round(text.length / 380));
      var span = document.createElement('span');
      span.className = 'read-time';
      span.textContent = '约 ' + minutes + ' 分钟';
      meta.appendChild(span);
    }
  );
})();
