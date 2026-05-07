// Page Loader
(function () {
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loader-fill');
  const name = document.getElementById('loader-name');
  if (!loader) return;

  const text = 'switlydev';
  let i = 0;
  const typeInterval = setInterval(() => {
    name.textContent += text[i++];
    fill.style.width = (i / text.length * 70) + '%';
    if (i >= text.length) clearInterval(typeInterval);
  }, 80);

  window.addEventListener('load', () => {
    fill.style.width = '100%';
    setTimeout(() => loader.classList.add('hidden'), 500);
  });
  // Fallback
  setTimeout(() => loader.classList.add('hidden'), 3500);
})();

// Custom cursor
(function () {
  const dot = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  if (!dot || !ring || !matchMedia('(hover:hover)').matches) return;

  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    const x = e.clientX, y = e.clientY;
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    rx += (x - rx) * 0.15;
    ry += (y - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
  });

  // Smooth ring follow via rAF
  function followRing() {
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(followRing);
  }
  followRing();

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,[role=button],.pill,.bento-card,.proj-card,.contact-card,.repo-card'))
      document.body.classList.add('cursor-hover');
    else document.body.classList.remove('cursor-hover');
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
})();

// Typewriter
(function () {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const words = ['Developer', 'Modder', 'Reverse Engineer', 'Builder'];
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, 1800); return; }
      setTimeout(tick, 90);
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 300); return; }
      setTimeout(tick, 45);
    }
  }
  setTimeout(tick, 800);
})();

// GitHub Contribution Heatmap
async function loadHeatmap() {
  const container = document.getElementById('heatmap-container');
  const yearEl = document.getElementById('heat-year');
  if (!container) return;

  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`);
    const data = await res.json();
    const contributions = data.contributions; // [{date, count, level}]

    if (yearEl && contributions.length) {
      const start = contributions[0].date.slice(0, 4);
      const end = contributions[contributions.length - 1].date.slice(0, 4);
      yearEl.textContent = start === end ? start : `${start}–${end}`;
    }

    // Group into weeks (Sun–Sat)
    const COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
    const weeks = [];
    let week = [];

    // Pad first week with empty days
    const firstDay = new Date(contributions[0].date).getDay();
    for (let p = 0; p < firstDay; p++) week.push(null);

    contributions.forEach(day => {
      week.push(day);
      if (week.length === 7) { weeks.push(week); week = []; }
    });
    if (week.length) weeks.push(week);

    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    weeks.forEach((w, weekIndex) => {
      const col = document.createElement('div');
      col.className = 'heatmap-week';
      w.forEach((d, dayIndex) => {
        const cell = document.createElement('div');
        cell.className = 'hcell-day';
        if (d) {
          cell.style.setProperty('--c', COLORS[d.level] || COLORS[0]);
          cell.title = `${d.date}: ${d.count} contribution${d.count !== 1 ? 's' : ''}`;
          
          // Smart tooltip positioning
          cell.addEventListener('mouseenter', function(e) {
            // Check if in bottom rows (show tooltip above)
            if (dayIndex >= 4) {
              this.classList.add('tooltip-top');
            } else {
              this.classList.add('tooltip-bottom');
            }
            
            // Check if near left edge (first 8 weeks)
            if (weekIndex < 8) {
              this.classList.add('tooltip-right');
            }
            // Check if near right edge (last 8 weeks)
            else if (weekIndex > weeks.length - 9) {
              this.classList.add('tooltip-left');
            }
          });
          
          cell.addEventListener('mouseleave', function() {
            this.classList.remove('tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right');
          });
        } else {
          cell.style.setProperty('--c', 'transparent');
        }
        col.appendChild(cell);
      });
      grid.appendChild(col);
    });

    container.innerHTML = '';
    container.appendChild(grid);
    console.log('Heatmap loaded');
  } catch (e) {
    console.error('Heatmap failed to load:', e);
    container.innerHTML = '<p style="color:var(--muted);font-size:.8rem;padding:10px">Could not load activity data.</p>';
  }
}

// Canvas particle network
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  const N = 70, DIST = 140;

  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize();
  addEventListener('resize', resize);

  for (let i = 0; i < N; i++) pts.push({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28
  });

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(79,158,255,${(1 - d / DIST) * .1})`;
          ctx.lineWidth = 1;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99,158,255,.35)';
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    requestAnimationFrame(frame);
  }
  frame();
})();

// Cursor glow
(function () {
  const el = document.getElementById('cursor-glow');
  if (!el || matchMedia('(hover:none)').matches) return;
  document.addEventListener('mousemove', e => {
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
  });
})();

// Navbar scroll
(function () {
  const nb = document.getElementById('navbar');
  if (!nb) return;
  addEventListener('scroll', () => nb.classList.toggle('scrolled', scrollY > 40), { passive: true });
})();

// Hamburger menu
(function () {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const o = menu.classList.toggle('open');
    btn.classList.toggle('open', o);
  });
  menu.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => {
    menu.classList.remove('open'); btn.classList.remove('open');
  }));
})();

// Active nav on scroll
(function () {
  const secs = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  function update() {
    const y = scrollY + 130;
    secs.forEach(s => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-link[href="#${s.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }
  addEventListener('scroll', update, { passive: true });
  update();
})();

// Scroll reveal animation
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 70);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// Stat counters
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.target;
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 35));
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur;
        if (cur >= target) clearInterval(t);
      }, 45);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => io.observe(el));
})();

// GitHub API
const GITHUB_USERNAME = 'switlydev';
const GITHUB_CACHE_KEY = 'github_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCachedData(key) {
  try {
    const cached = localStorage.getItem(GITHUB_CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(GITHUB_CACHE_KEY);
      return null;
    }
    return data[key];
  } catch (e) {
    return null;
  }
}

function setCachedData(key, value) {
  try {
    const cached = localStorage.getItem(GITHUB_CACHE_KEY);
    const data = cached ? JSON.parse(cached) : { timestamp: Date.now() };
    data[key] = value;
    data.timestamp = Date.now();
    localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Cache write failed:', e);
  }
}

async function fetchGitHubData(endpoint) {
  try {
    const r = await fetch(`https://api.github.com/${endpoint}`);
    
    // Check rate limit
    const remaining = r.headers.get('X-RateLimit-Remaining');
    const reset = r.headers.get('X-RateLimit-Reset');
    
    if (remaining && parseInt(remaining) < 5) {
      console.warn(`GitHub API rate limit low: ${remaining} requests remaining`);
      if (reset) {
        const resetDate = new Date(parseInt(reset) * 1000);
        console.warn(`Rate limit resets at: ${resetDate.toLocaleTimeString()}`);
      }
    }
    
    if (!r.ok) {
      if (r.status === 403) {
        throw new Error('Rate limit exceeded. Try again later.');
      }
      throw new Error(`HTTP ${r.status}`);
    }
    
    return await r.json();
  } catch (e) {
    console.error('GitHub API error:', e);
    return null;
  }
}

async function fetchUserStats(username) {
  const cached = getCachedData('userStats');
  if (cached) {
    console.log('Loaded from cache: userStats');
    return cached;
  }
  
  const data = await fetchGitHubData(`users/${username}`);
  if (!data) return null;
  
  const stats = {
    repos: data.public_repos,
    followers: data.followers,
    following: data.following,
    gists: data.public_gists,
    bio: data.bio,
    location: data.location,
    company: data.company,
    blog: data.blog,
    twitter: data.twitter_username,
    created: data.created_at,
    avatar: data.avatar_url,
    name: data.name,
    login: data.login
  };
  
  setCachedData('userStats', stats);
  return stats;
}

async function fetchRepos(username) {
  const cached = getCachedData('repos');
  if (cached) return cached;
  
  const repos = await fetchGitHubData(`users/${username}/repos?sort=updated&per_page=100`);
  if (!repos) return [];
  
  const filtered = repos.filter(r => !r.fork);
  setCachedData('repos', filtered);
  return filtered;
}

function renderRepos(repos) {
  const box = document.getElementById('github-repos-container');
  if (!box) return;
  if (!repos.length) {
    box.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:50px;color:var(--muted)">Could not load repositories.</p>`;
    return;
  }
  
  // Sort by stars by default
  repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

  const LANG_COLOR = { 
    Python: '#3572A5', 'C#': '#178600', JavaScript: '#f1e05a', 
    CSS: '#563d7c', TypeScript: '#2b7489', HTML: '#e34c26',
    'C++': '#f34b7d', Java: '#b07219', Go: '#00ADD8',
    Rust: '#dea584', PHP: '#4F5D95', Ruby: '#701516',
    Swift: '#ffac45', Kotlin: '#A97BFF', Dart: '#00B4AB'
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Updated today';
    if (days === 1) return 'Updated yesterday';
    if (days < 7) return `Updated ${days} days ago`;
    if (days < 30) return `Updated ${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `Updated ${Math.floor(days / 30)} months ago`;
    return `Updated ${Math.floor(days / 365)} years ago`;
  };

  box.innerHTML = repos.map((r, i) => `
    <div class="repo-card reveal" style="animation-delay:${i * 40}ms" data-lang="${r.language || 'none'}">
      <div class="repo-header">
        <div class="repo-name">${r.name}</div>
        ${r.private ? '<span class="repo-badge">Private</span>' : ''}
        ${r.archived ? '<span class="repo-badge archived">Archived</span>' : ''}
      </div>
      <div class="repo-desc">${r.description || 'No description provided.'}</div>
      <div class="repo-meta">
        <span class="repo-stars" title="Stars">★ ${r.stargazers_count}</span>
        <span class="repo-forks" title="Forks">⑂ ${r.forks_count}</span>
        ${r.open_issues_count > 0 ? `<span class="repo-issues" title="Open issues">! ${r.open_issues_count}</span>` : ''}
        ${r.language ? `<span class="repo-lang" style="color:${LANG_COLOR[r.language] || 'var(--dim)'}">• ${r.language}</span>` : ''}
      </div>
      <div class="repo-footer">
        <span class="repo-updated">${formatDate(r.updated_at)}</span>
        <a class="repo-a" href="${r.html_url}" target="_blank" rel="noopener">
          View on GitHub <span>→</span>
        </a>
      </div>
    </div>`).join('');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  box.querySelectorAll('.reveal').forEach(el => io.observe(el));
  
  // Add language stats
  displayLanguageStats(repos);
}

function displayLanguageStats(repos) {
  const langCount = {};
  repos.forEach(r => {
    if (r.language) {
      langCount[r.language] = (langCount[r.language] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  console.log('Top languages:', sorted.map(([lang, count]) => `${lang}: ${count}`).join(', '));
}

// Update About Links
async function updateAboutLinks() {
  const stats = await fetchUserStats(GITHUB_USERNAME);
  if (!stats) return;

  const githubLink = document.getElementById('alink-github');
  if (githubLink && stats.login) {
    githubLink.href = `https://github.com/${stats.login}`;
    const textNode = githubLink.querySelector('svg').nextSibling;
    if (textNode) textNode.textContent = `github.com/${stats.login}`;
  }

  console.log('About links updated');
}

// Update "Currently Working On"
async function updateCurrentlyWorkingOn() {
  const repos = await fetchRepos(GITHUB_USERNAME);
  if (!repos || repos.length === 0) return;

  // Get the most recently updated repo
  const latest = repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
  
  const bentoCard = document.getElementById('bento-cwo');
  if (!bentoCard) return;

  const mainEl = bentoCard.querySelector('.bento-main');
  const subEl = bentoCard.querySelector('.bento-sub');
  const badgeRow = bentoCard.querySelector('.bento-badge-row');

  if (mainEl) mainEl.textContent = latest.name;
  if (subEl) subEl.textContent = latest.description || 'No description available.';
  
  if (badgeRow) {
    const tags = [];
    if (latest.language) tags.push(`<span class="bento-tag">${latest.language}</span>`);
    
    // Calculate days since last update
    const daysSince = Math.floor((Date.now() - new Date(latest.updated_at)) / (1000 * 60 * 60 * 24));
    if (daysSince === 0) {
      tags.push('<span class="bento-tag bento-green">Updated today</span>');
    } else if (daysSince < 7) {
      tags.push(`<span class="bento-tag bento-green">Updated ${daysSince}d ago</span>`);
    } else if (daysSince < 30) {
      tags.push(`<span class="bento-tag">Updated ${Math.floor(daysSince / 7)}w ago</span>`);
    } else {
      tags.push(`<span class="bento-tag">Updated ${Math.floor(daysSince / 30)}mo ago</span>`);
    }
    
    badgeRow.innerHTML = tags.join('');
  }

  console.log('Currently working on updated:', latest.name);
}
async function updateGitHubStats() {
  const stats = await fetchUserStats(GITHUB_USERNAME);
  if (!stats) {
    console.warn('GitHub stats yüklenemedi, varsayılan değerler kullanılıyor');
    return;
  }

  console.log('GitHub stats loaded:', stats);

  // Update avatar image
  const avatarImg = document.getElementById('avatar-img');
  if (avatarImg && stats.avatar) {
    avatarImg.onerror = function() {
      console.warn('Avatar yüklenemedi, varsayılan kullanılıyor');
      this.src = './assets/img/avatar.jpg';
    };
    avatarImg.onload = function() {
      console.log('Avatar updated');
    };
    avatarImg.src = stats.avatar + '?size=400';
  }

  // Update hero stats with real data
  const reposStat = document.querySelector('.stat-num[data-target="9"]');
  const followersStat = document.querySelector('.stat-num[data-target="15"]');
  
  if (reposStat && stats.repos !== undefined) {
    reposStat.dataset.target = stats.repos;
    // Trigger counter animation
    animateCounter(reposStat, 0, stats.repos, 1500);
  }
  
  if (followersStat && stats.followers !== undefined) {
    followersStat.dataset.target = stats.followers;
    // Trigger counter animation
    animateCounter(followersStat, 0, stats.followers, 1500);
  }
}

// Smooth counter animation
function animateCounter(element, start, end, duration) {
  const startTime = performance.now();
  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (end - start) * easeOutQuad(progress));
    element.textContent = current;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
}

function easeOutQuad(t) {
  return t * (2 - t);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateGitHubStats();
  updateAboutLinks();
  // updateCurrentlyWorkingOn(); // Disabled - using static content
  fetchRepos(GITHUB_USERNAME).then(renderRepos);
  loadHeatmap();
  initContactForm();
});

// Contact Form
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.form-submit');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    const messageEl = document.getElementById('form-message');
    
    // Show loading
    submitText.style.display = 'none';
    submitLoading.style.display = 'flex';
    submitBtn.disabled = true;
    messageEl.style.display = 'none';
    
    try {
      const formData = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        messageEl.textContent = 'Message sent successfully! I\'ll get back to you soon.';
        messageEl.className = 'form-message success';
        form.reset();
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Form error:', error);
      messageEl.textContent = 'Failed to send message. Please try again or contact me on Telegram.';
      messageEl.className = 'form-message error';
    } finally {
      submitText.style.display = 'inline';
      submitLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  });
}

// Legacy compatibility
function noEmailPopup() {
  alert("No email access right now — reach me on Telegram or Discord.");
}
function initGitHubRepos(u) { fetchRepos(u).then(renderRepos); }