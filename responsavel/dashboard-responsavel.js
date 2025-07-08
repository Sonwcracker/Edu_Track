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

    // ✅ Redireciona para a página de presença
    const linkPresenca = document.getElementById("link-presenca");
    if (linkPresenca) {
      linkPresenca.addEventListener("click", () => {
        window.location.href = "responsavel-aluno.html";
      });
    }

    // Avisos
const avisosLista = document.getElementById("avisos-lista");
avisosLista.innerHTML = "<p>Carregando avisos...</p>";

try {
  const avisosSnapshot = await db.collection("turmas")
    .doc(turmaId)
    .collection("mural")
    .orderBy("data", "desc")
    .limit(3)
    .get();

  avisosLista.innerHTML = "";

  if (avisosSnapshot.empty) {
    avisosLista.innerHTML = "<p>Nenhum aviso encontrado.</p>";
  } else {
    for (const doc of avisosSnapshot.docs) {
      const aviso = doc.data();

      // Formata a data
      const dataFormatada = aviso.data?.toDate().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

      // Cria o card do aviso
      const card = document.createElement("div");
      card.className = "aviso-card";

      card.innerHTML = `
        <img src="../img/icon-aviso.png" alt="Aviso">
        <div class="aviso-conteudo">
          <h4>${aviso.professor || "Professor(a)"}</h4>
          <p><strong>${aviso.titulo}</strong></p>
          <p>${aviso.mensagem}</p>
          <p style="font-size: 12px; color: gray;">${dataFormatada}</p>
        </div>
      `;

      avisosLista.appendChild(card);
    }
  }
} catch (error) {
  console.error("Erro ao carregar avisos:", error);
  avisosLista.innerHTML = "<p>Erro ao carregar avisos.</p>";
}

  });

  // Logout
  document.querySelector(".logout-btn").addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
      window.location.href = "../index.html";
    });
  });
});
