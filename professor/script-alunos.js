window.addEventListener('DOMContentLoaded', async () => {
  // 🔹 Salvar ID da turma da URL no localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const turmaId = urlParams.get("turma");
  if (turmaId) {
    localStorage.setItem("turmaId", turmaId);
  }

  // 🔹 Carregar NAVBAR lateral
  fetch("navbar.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("navbar-lateral").innerHTML = html;
    });

  // 🔹 Carregar NAVBAR superior
  fetch("navbar-top.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("navbar-top").innerHTML = html;
    });

  const db = firebase.firestore();
  const listaUl = document.getElementById("lista-alunos");
  const titulo = document.getElementById("titulo-turma");

  if (!turmaId) {
    titulo.textContent = "Turma não encontrada.";
    return;
  }

  try {
    // 🔹 Buscar dados da turma
    const turmaDoc = await db.collection("turmas").doc(turmaId).get();

    if (turmaDoc.exists) {
      const turma = turmaDoc.data();
      titulo.textContent = `Alunos da ${turma.nome}`;

      const nomeTurmaEl = document.getElementById("nome-turma");
      if (nomeTurmaEl) nomeTurmaEl.textContent = turma.nome;
    }

    // 🔹 Listar alunos da turma
    const alunosSnapshot = await db.collection("turmas").doc(turmaId).collection("alunos").get();

    if (alunosSnapshot.empty) {
      listaUl.innerHTML = "<li>Nenhum aluno encontrado.</li>";
    } else {
      alunosSnapshot.forEach(doc => {
        const aluno = doc.data();
        const li = document.createElement("li");
        li.textContent = aluno.nome;
        listaUl.appendChild(li);
      });
    }

    // 🔹 Adicionar botão "Registrar Presença"
    const botaoPresenca = document.createElement("a");
    botaoPresenca.href = `presenca.html?turma=${turmaId}`;
    botaoPresenca.innerHTML = `<button style="margin-top: 20px; padding: 10px 20px; background-color: #468ef9; color: white; border: none; border-radius: 6px; cursor: pointer;">
      Registrar Presença
    </button>`;
    document.querySelector(".conteudo").appendChild(botaoPresenca);

  } catch (error) {
    console.error("Erro ao carregar alunos:", error);
    listaUl.innerHTML = "<li>Erro ao carregar alunos</li>";
  }

  // 🔹 Exibir nome do professor (caso esteja logado)
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const nomeProfEl = document.getElementById("nome-professor");
      if (nomeProfEl) nomeProfEl.textContent = user.displayName || "Professor";
    }
  });
});
