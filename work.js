let allProjects = [];
let currentFilter = 'all';

async function loadProjects() {
  try {
    const response = await fetch('src/data/projects.generated.json');
    if (!response.ok) {
      throw new Error('Failed to load projects');
    }
    
    const data = await response.json();
    allProjects = data.projects || [];
    
    buildFilters();
    renderProjects();
    
    document.getElementById('loading').style.display = 'none';
  } catch (error) {
    console.error('Error loading projects:', error);
    document.getElementById('loading').innerHTML = '<p>Failed to load projects. Please try again later.</p>';
  }
}

function buildFilters() {
  const filtersContainer = document.getElementById('filters');
  const categories = new Set();
  const stacks = new Set();
  
  allProjects.forEach(project => {
    project.categories.forEach(cat => categories.add(cat));
    project.stack.forEach(s => stacks.add(s));
  });
  
  const existingButtons = Array.from(filtersContainer.querySelectorAll('.filter-btn'));
  const existingFilters = new Set(existingButtons.map(btn => btn.dataset.filter));
  
  categories.forEach(cat => {
    if (!existingFilters.has(`cat-${cat}`)) {
      const btn = createFilterButton(`cat-${cat}`, formatLabel(cat));
      filtersContainer.appendChild(btn);
    }
  });
  
  stacks.forEach(stack => {
    if (!existingFilters.has(`stack-${stack}`)) {
      const btn = createFilterButton(`stack-${stack}`, formatLabel(stack));
      filtersContainer.appendChild(btn);
    }
  });
}

function createFilterButton(filter, label) {
  const btn = document.createElement('button');
  btn.className = 'filter-btn';
  btn.dataset.filter = filter;
  btn.textContent = label;
  btn.addEventListener('click', () => setFilter(filter));
  return btn;
}

function formatLabel(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function setFilter(filter) {
  currentFilter = filter;
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  renderProjects();
}

function filterProjects() {
  if (currentFilter === 'all') {
    return allProjects;
  }
  
  if (currentFilter === 'featured') {
    return allProjects.filter(p => p.isFeatured);
  }
  
  if (currentFilter.startsWith('cat-')) {
    const category = currentFilter.replace('cat-', '');
    return allProjects.filter(p => p.categories.includes(category));
  }
  
  if (currentFilter.startsWith('stack-')) {
    const stack = currentFilter.replace('stack-', '');
    return allProjects.filter(p => p.stack.includes(stack));
  }
  
  return allProjects;
}

function renderProjects() {
  const container = document.getElementById('projects');
  const emptyState = document.getElementById('empty');
  const filtered = filterProjects();
  
  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  container.innerHTML = filtered.map(project => createProjectCard(project)).join('');
  
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

function createProjectCard(project) {
  const featuredClass = project.isFeatured ? 'featured' : '';
  const statusBadge = project.status ? `<span class="badge status ${project.status}">${project.status}</span>` : '';
  const featuredBadge = project.isFeatured ? '<span class="badge featured">Featured</span>' : '';
  
  const allTags = [
    ...project.categories.map(c => ({ type: 'category', value: c })),
    ...project.stack.map(s => ({ type: 'stack', value: s })),
    ...project.tags.map(t => ({ type: 'tag', value: t }))
  ].slice(0, 6);
  
  const tags = allTags.map(tag => 
    `<span class="tag">${formatLabel(tag.value)}</span>`
  ).join('');
  
  const primaryLanguages = Object.entries(project.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([lang]) => lang);
  
  const languageTags = primaryLanguages.length > 0 
    ? primaryLanguages.map(lang => `<span class="tag">${lang}</span>`).join('')
    : '';
  
  const demoLink = project.demoUrl 
    ? `<a href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noopener noreferrer" class="link-btn primary">
         <span>Demo</span>
         <span>↗</span>
       </a>`
    : '';
  
  const lastUpdated = new Date(project.lastPushed);
  const timeAgo = getTimeAgo(lastUpdated);
  
  return `
    <article class="project-card ${featuredClass}">
      <div class="project-header">
        <div class="project-meta">
          ${featuredBadge}
          ${statusBadge}
        </div>
        <h2 class="project-title">${escapeHtml(project.title)}</h2>
        <p class="project-description">${escapeHtml(project.summary || project.description || 'No description available')}</p>
      </div>
      
      <div class="project-tags">
        ${tags}
        ${languageTags}
      </div>
      
      <div class="project-footer">
        <div class="project-stats">
          ${project.stars > 0 ? `<span class="stat">⭐ ${project.stars}</span>` : ''}
          <span class="stat">📅 ${timeAgo}</span>
        </div>
        <div class="project-links">
          ${demoLink}
          <a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" class="link-btn">
            <span>Code</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
  
  loadProjects();
});
