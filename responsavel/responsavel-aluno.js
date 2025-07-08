window.addEventListener("DOMContentLoaded", async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "../index.html";
      return;
    }

    const doc = await db.collection("usuarios").doc(user.uid).get();
    const dados = doc.data();

    if (dados.perfil !== "responsavel") {
      alert("Acesso não autorizado.");
      await auth.signOut();
      return;
    }

    const alunoId = dados.alunoId;
    const turmaId = dados.turmaId;

    // Nome e turma do aluno
    const alunoDoc = await db.collection("turmas").doc(turmaId).collection("alunos").doc(alunoId).get();
    document.getElementById("nome-aluno").textContent = alunoDoc.data()?.nome || "Aluno";
    document.getElementById("turma-aluno").textContent = `Turma ${turmaId}`;

    // Resumo de presença
    const resumoPresencaEl = document.getElementById("resumo-presenca");
    resumoPresencaEl.textContent = "Carregando...";

    try {
      const presencas = await db.collection("turmas")
        .doc(turmaId)
        .collection("presencas")
        .orderBy(firebase.firestore.FieldPath.documentId(), "desc")
        .limit(1)
        .get();

      if (!presencas.empty) {
        const ultimoDoc = presencas.docs[0];
        const dataRegistro = ultimoDoc.id;

        const presencaRef = db.collection("turmas")
          .doc(turmaId)
          .collection("presencas")
          .doc(dataRegistro)
          .collection("registro")
          .doc(alunoId);

        const presencaDoc = await presencaRef.get();

        if (presencaDoc.exists) {
          const presenca = presencaDoc.data();
          const diasSemana = ["seg", "ter", "qua", "qui", "sex"];
          const totalDias = diasSemana.length;
          const diasPresentes = diasSemana.filter(dia => presenca[dia] === true).length;

          resumoPresencaEl.textContent = `${diasPresentes} de ${totalDias} dias`;
        } else {
          resumoPresencaEl.textContent = "-- de -- dias";
        }
      } else {
        resumoPresencaEl.textContent = "-- de -- dias";
      }

    } catch (error) {
      console.error("Erro ao buscar presença:", error);
      resumoPresencaEl.textContent = "-- de -- dias";
    }
  });

  // Logout
  document.querySelector(".logout-btn").addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
      window.location.href = "../index.html";
    });
  });
});
