window.addEventListener('DOMContentLoaded', async () => {
  const db = firebase.firestore();
  const auth = firebase.auth();

  // Carrega as NAVBARs
  fetch("navbar.html")
    .then(res => res.text())
    .then(html => document.getElementById("navbar-lateral").innerHTML = html);
  fetch("navbar-top.html")
    .then(res => res.text())
    .then(html => document.getElementById("navbar-top").innerHTML = html);

  // Recupera o ID da turma da URL
  const urlParams = new URLSearchParams(window.location.search);
  const turmaId = urlParams.get("turma");

  // Salva o ID da turma no localStorage (para uso pela navbar)
  if (turmaId) {
    localStorage.setItem("turmaId", turmaId);
  }

  const tituloEl = document.getElementById("titulo-mural");
  const form = document.getElementById("form-mural");
  const container = document.getElementById("avisos-container");

  if (!turmaId) {
    tituloEl.textContent = "Turma não encontrada.";
    return;
  }

  try {
    // 🔹 Busca nome da turma
    const turmaDoc = await db.collection("turmas").doc(turmaId).get();
    const turma = turmaDoc.data();
    if (turma && turma.nome) {
      tituloEl.textContent = `Mural da turma ${turma.nome}`;
    }

    // 🔹 Carrega os avisos da turma
    async function carregarAvisos() {
      container.innerHTML = "";

      const snapshot = await db.collection("turmas")
        .doc(turmaId)
        .collection("mural")
        .orderBy("data", "desc")
        .get();

      snapshot.forEach(doc => {
        const aviso = doc.data();
        const div = document.createElement("div");
        div.className = "aviso";
        div.innerHTML = `
          <h3>${aviso.titulo}</h3>
          <p>${aviso.mensagem}</p>
          <small>${new Date(aviso.data.toDate()).toLocaleString()}</small>
        `;
        container.appendChild(div);
      });
    }

    await carregarAvisos();

    // 🔹 Submete novo aviso
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo = document.getElementById("titulo").value.trim();
      const mensagem = document.getElementById("mensagem").value.trim();

      if (!titulo || !mensagem) return;

      await db.collection("turmas").doc(turmaId).collection("mural").add({
        titulo,
        mensagem,
        data: new Date()
      });

      form.reset();
      await carregarAvisos();
    });

    // 🔹 Links de navegação entre abas
    document.getElementById("link-presenca")?.addEventListener("click", () => {
      window.location.href = `presenca.html?turma=${turmaId}`;
    });

    document.getElementById("link-alunos")?.addEventListener("click", () => {
      window.location.href = `alunos.html?turma=${turmaId}`;
    });

  } catch (error) {
    console.error("Erro ao carregar mural:", error);
    tituloEl.textContent = "Erro ao carregar mural da turma.";
  }
});
