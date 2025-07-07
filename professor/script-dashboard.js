window.addEventListener('DOMContentLoaded', () => {
  // Carrega NAVBAR lateral
  fetch("navbar.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("navbar-lateral").innerHTML = html;
    });

  // Carrega NAVBAR superior
  fetch("navbar-top.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("navbar-top").innerHTML = html;
    });

  const db = firebase.firestore();
  const auth = firebase.auth();
  const turmasContainer = document.getElementById("turmas-container");

  // ✅ Espera o usuário estar autenticado antes de buscar turmas
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const snapshot = await db.collection("turmas").get();

        snapshot.forEach(doc => {
          const turmaId = doc.id;
          const turma = doc.data();

          const nomeImagem = turma.nome
            .normalize("NFD").replace(/[\u0300-\u036f]/g, '')
            .replace(/\s/g, '')
            .replace(/[º°]/g, '')
            .replace(/[^\w]/g, '')
            .toUpperCase();

          const card = document.createElement("div");
          card.className = "card-turma";
          card.style.cursor = "pointer";

          card.addEventListener("click", () => {
            window.location.href = `mural.html?turma=${turmaId}`;
          });

          card.innerHTML = `
            <img src="../img/${nomeImagem}.jpg" alt="Imagem da turma" class="card-imagem">
            <div class="conteudo-card">
              <h3>${turma.nome}</h3>
              <p>Alunos: ${turma.quantidadeAlunos || 0}</p>
            </div>
            <div class="botoes">
              <button onclick="event.stopPropagation()">Notas</button>
              <button onclick="event.stopPropagation()">Faltas</button>
            </div>
          `;

          turmasContainer.appendChild(card);
        });

      } catch (error) {
        console.error("Erro ao carregar turmas:", error);
        turmasContainer.innerHTML = "<p>Erro ao carregar turmas.</p>";
      }

    } else {
      console.warn("Usuário não autenticado");
      turmasContainer.innerHTML = "<p>Usuário não autenticado.</p>";
    }
  });
});
