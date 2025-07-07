window.addEventListener("DOMContentLoaded", () => {
  const tabsContainer = document.getElementById("tabs-container");
  const turmaId = new URLSearchParams(window.location.search).get("turma");

  if (tabsContainer && turmaId) {
    tabsContainer.innerHTML = `
      <div class="tabs">
        <a href="mural.html?turma=${turmaId}" class="tab-link ${window.location.pathname.includes('mural') ? 'active' : ''}">Mural</a>
        <a href="presenca.html?turma=${turmaId}" class="tab-link ${window.location.pathname.includes('presenca') ? 'active' : ''}">Presença</a>
        <a href="alunos.html?turma=${turmaId}" class="tab-link ${window.location.pathname.includes('alunos') ? 'active' : ''}">Pessoas</a>
      </div>
    `;
  }
});