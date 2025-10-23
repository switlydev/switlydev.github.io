// User's email address
const userEmail = ""; // Replace with your actual email
function noEmailPopup(){
    alert("I cant access my email right now. If you want contact with me you can contact me via social media.");
}
// Function to fetch GitHub repositories
async function fetchGitHubRepos(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        const repos = await response.json();
        return repos.filter(repo => !repo.fork); // Filter out forked repositories
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        return [];
    }
}

// Function to display GitHub repositories on the page
function displayGitHubRepos(repos) {
    const container = document.getElementById('github-repos-container');
    if (!container) return;

    if (repos.length === 0) {
        container.innerHTML = '<p>Failed to load repositories. Please try again later.</p>';
        return;
    }

    // Sort repositories by stars (descending)
    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

    let reposHTML = '';
    repos.forEach(repo => {
        reposHTML += `
        <section class="box github-repo">
            <h2>${repo.name}</h2>
            <p>${repo.description || 'No description available.'}</p>
            <div class="repo-stats">
                <span class="stars">⭐ ${repo.stargazers_count} stars</span>
                <span class="language">${repo.language || 'Unknown'}</span>
            </div>
            <a href="${repo.html_url}" target="_blank" class="button">View on GitHub</a>
        </section>`;
    });

    container.innerHTML = reposHTML;
}

// Function to initialize GitHub repositories loading
async function initGitHubRepos(username) {
    const container = document.getElementById('github-repos-container');
    if (!container) return;

    // Show loading message
    container.innerHTML = '<p>Loading repositories...</p>';

    // Fetch and display repositories
    const repos = await fetchGitHubRepos(username);
    displayGitHubRepos(repos);
}

// Function to handle contact link click
function handleContactClick(event) {
    event.preventDefault();
    // Open email client with pre-filled recipient
    window.location.href = `mailto:${userEmail}`;
}

// Initialize functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize GitHub repositories if on repos page
    if (document.getElementById('github-repos-container')) {
        initGitHubRepos('switlydev');
    }
});