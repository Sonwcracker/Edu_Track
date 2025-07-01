// Espera carregar o Firebase
window.addEventListener('DOMContentLoaded', async () => {
  const db = firebase.firestore();
  const turmasContainer = document.getElementById("turmas-container");

  try {
    const snapshot = await db.collection("turmas").get();
    snapshot.forEach(doc => {
      const turmaId = doc.id;
      const turma = doc.data();

      const card = document.createElement("div");
      card.className = "card-turma";
      card.style.cursor = "pointer";

      // Redireciona para a página de alunos ao clicar no card
      card.addEventListener("click", () => {
        window.location.href = `alunos.html?turma=${turmaId}`;
      });

      card.innerHTML = `
        <h3>${turma.nome}</h3>
        <p>Alunos: ${turma.quantidadeAlunos}</p>
        <div class="botoes">
          <button onclick="event.stopPropagation()">Notas</button>
          <button onclick="event.stopPropagation()">Faltas</button>
        </div>
      `;

      turmasContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar turmas:", error);
  }
});

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html"; // Redireciona para o login
  });
}
