window.addEventListener('DOMContentLoaded', async () => {
  const db = firebase.firestore();
  const listaUl = document.getElementById("lista-alunos");
  const titulo = document.getElementById("titulo-turma");

  // Pegando o ID da turma da URL
  const urlParams = new URLSearchParams(window.location.search);
  const turmaId = urlParams.get("turma");

  if (!turmaId) {
    titulo.textContent = "Turma não encontrada.";
    return;
  }

  try {
    const turmaDoc = await db.collection("turmas").doc(turmaId).get();
    if (turmaDoc.exists) {
      const turma = turmaDoc.data();
      titulo.textContent = `Alunos da ${turma.nome}`;
    }

    const alunosSnapshot = await db
      .collection("turmas")
      .doc(turmaId)
      .collection("alunos")
      .get();

    alunosSnapshot.forEach(doc => {
      const aluno = doc.data();
      const li = document.createElement("li");
      li.textContent = aluno.nome;
      listaUl.appendChild(li);
    });

    if (alunosSnapshot.empty) {
      listaUl.innerHTML = "<li>Nenhum aluno encontrado.</li>";
    }

  } catch (error) {
    console.error("Erro ao carregar alunos:", error);
    listaUl.innerHTML = "<li>Erro ao carregar alunos</li>";
  }
});
