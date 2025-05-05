document.addEventListener('DOMContentLoaded', function() {
    const orgName = 'JDETeck';
    const language = 'lua';
    
    const projectsList = document.getElementById('projects-list');
    const searchInput = document.getElementById('project-search');
    const sortSelect = document.getElementById('project-sort');
    
    async function loadProjects() {
        try {
            projectsList.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
            
            const response = await fetch(`https://api.github.com/orgs/${orgName}/repos`);
            let repos = await response.json();
            
            repos = repos.filter(repo => {
                const repoLanguage = repo.language ? repo.language.toLowerCase() : '';
                return repoLanguage.includes(language);
            });
            
            if (repos.length === 0) {
                projectsList.innerHTML = `
                    <div class="no-projects">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Currently, no projects on ${orgName}.</p>
                    </div>
                `;
                return;
            }
            
            displayProjects(repos);
            setupSearchAndSort(repos);
            
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            projectsList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Oh nuts! We couldn't load the projects right now...</p>
                </div>
            `;
        }
    }
    
    function displayProjects(repos) {
        projectsList.innerHTML = '';
        
        repos.forEach(repo => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            let description = repo.description || 'No description';
            description = description.replace(/:[a-z_]+:/g, '');
            if (description.length > 120) {
                description = description.substring(0, 120) + '...';
            }
            
            const updatedAt = new Date(repo.updated_at);
            const formattedDate = updatedAt.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            projectCard.innerHTML = `
                <div class="project-card-header">
                    <h3>
                        <i class="fab fa-java"></i>
                        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                    </h3>
                    <p>${description}</p>
                </div>
                <div class="project-card-body">
                    ${repo.homepage ? `<p><strong>Demo:</strong> <a href="${repo.homepage}" target="_blank">${repo.homepage}</a></p>` : ''}
                    <div class="topics">
                        ${repo.topics && repo.topics.length > 0 ? 
                          `<div class="tags">${repo.topics.map(topic => `<span class="tag">${topic}</span>`).join('')}</div>` : 
                          ''}
                    </div>
                </div>
                <div class="project-card-footer">
                    <div class="project-meta">
                        <span title="Stars"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                        <span title="Forks"><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                        <span title="Last update"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                    </div>
                    <a href="${repo.html_url}" class="project-link" target="_blank">Ver no GitHub</a>
                </div>
            `;
            
            projectsList.appendChild(projectCard);
        });
    }
    
    function setupSearchAndSort(repos) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filteredRepos = repos.filter(repo => 
                repo.name.toLowerCase().includes(searchTerm) || 
                (repo.description && repo.description.toLowerCase().includes(searchTerm))
            );
            displayProjects(filteredRepos);
        });
        
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            let sortedRepos = [...repos];
            
            switch(sortValue) {
                case 'name-asc':
                    sortedRepos.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    sortedRepos.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'stars-desc':
                    sortedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
                    break;
                case 'updated-desc':
                    sortedRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                    break;
                default:
                    break;
            }
            
            displayProjects(sortedRepos);
        });
    }
    
    loadProjects();
});
