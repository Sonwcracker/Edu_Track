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

  const urlParams = new URLSearchParams(window.location.search);
  const turmaId = urlParams.get("turma");

  if (turmaId) localStorage.setItem("turmaId", turmaId);

  const tituloEl = document.getElementById("titulo-mural");
  const container = document.getElementById("avisos-container");
  const abrirForm = document.getElementById("abrir-formulario");
  const form = document.getElementById("form-mural");
  const cancelarBtn = document.getElementById("cancelar");
  const nomeTurmaEl = document.getElementById("nome-turma");

  if (!turmaId) {
    tituloEl.textContent = "Turma não encontrada.";
    return;
  }

  try {
    const turmaDoc = await db.collection("turmas").doc(turmaId).get();
    const turma = turmaDoc.data();
    if (turma && turma.nome) {
      tituloEl.textContent = `Mural da turma ${turma.nome}`;
      if (nomeTurmaEl) nomeTurmaEl.textContent = `Turma ${turma.nome}`;
    }

    async function carregarComentarios(muralId, comentariosContainer, linhaDiv) {
      comentariosContainer.innerHTML = "";
      const snapshot = await db.collection("turmas")
        .doc(turmaId)
        .collection("mural")
        .doc(muralId)
        .collection("comentarios")
        .orderBy("data", "asc")
        .get();

      if (snapshot.empty) {
        linhaDiv.style.display = "none"; // Oculta linha divisória se não houver comentários
        return;
      }

      linhaDiv.style.display = "block"; // Mostra a linha se houver comentários

      snapshot.forEach(doc => {
        const comentario = doc.data();
        const comentarioId = doc.id;
        const hora = new Date(comentario.data.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const div = document.createElement("div");
        div.className = "comentario-item";
        div.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px; margin: 10px 0;">
            <img src="../img/professor.png" class="avatar-comentario" />
            <div style="flex-grow: 1">
              <strong>${comentario.autor || "Professor"}</strong>
              <small style="margin-left: 5px;">${hora}</small>
              <div>${comentario.texto}</div>
            </div>
            <div class="menu-comentario">
              <span class="btn-mais">⋮</span>
              <div class="menu-opcoes" style="display:none;">
                <button class="btn-excluir-comentario">Excluir</button>
              </div>
            </div>
          </div>
        `;

        const btnMais = div.querySelector(".btn-mais");
        const menu = div.querySelector(".menu-opcoes");
        btnMais.addEventListener("click", () => {
          menu.style.display = menu.style.display === "block" ? "none" : "block";
        });

        const btnExcluir = div.querySelector(".btn-excluir-comentario");
        btnExcluir.addEventListener("click", async () => {
          if (confirm("Deseja excluir este comentário?")) {
            await db.collection("turmas")
              .doc(turmaId)
              .collection("mural")
              .doc(muralId)
              .collection("comentarios")
              .doc(comentarioId)
              .delete();
            await carregarComentarios(muralId, comentariosContainer, linhaDiv);
          }
        });

        comentariosContainer.appendChild(div);
      });
    }

    async function carregarAvisos() {
      container.innerHTML = "";

      const snapshot = await db.collection("turmas")
        .doc(turmaId)
        .collection("mural")
        .orderBy("data", "desc")
        .get();

      if (snapshot.empty) {
        container.innerHTML = "<p>Nenhum aviso ainda.</p>";
        return;
      }

      snapshot.forEach(async doc => {
        const aviso = doc.data();
        const avisoId = doc.id;

        const nome = aviso.professor?.nome || "Professor";
        const foto = aviso.professor?.foto || "../img/professor.png";
        const horario = new Date(aviso.data.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const div = document.createElement("div");
        div.className = "aviso";
        div.innerHTML = `
          <div class="cabecalho-aviso">
            <img src="${foto}" alt="Foto do professor" class="avatar-postagem">
            <div class="info-professor">
              <strong>${nome}</strong>
              <small>${horario}</small>
            </div>
            <div class="menu-acao">⋮</div>
          </div>

          <p class="mensagem-aviso">${aviso.mensagem}</p>

          <div class="linha-divisoria" style="display:none;"></div>

          <div class="comentarios-container"></div>

          <div class="comentario-box">
            <img src="${foto}" class="avatar-comentario" />
            <input type="text" placeholder="Adicionar comentário para a turma..." class="input-comentario" />
            <button class="btn-enviar-comentario">➤</button>
          </div>
        `;

        const comentariosContainer = div.querySelector('.comentarios-container');
        const linhaDiv = div.querySelector('.linha-divisoria');
        await carregarComentarios(avisoId, comentariosContainer, linhaDiv);

        const btnEnviar = div.querySelector(".btn-enviar-comentario");
        const inputComentario = div.querySelector(".input-comentario");

        btnEnviar.addEventListener("click", async () => {
          const texto = inputComentario.value.trim();
          if (!texto) return;

          const user = auth.currentUser;
          await db.collection("turmas")
            .doc(turmaId)
            .collection("mural")
            .doc(avisoId)
            .collection("comentarios")
            .add({
              autor: user?.displayName || "Professor",
              texto,
              data: new Date()
            });

          inputComentario.value = "";
          await carregarComentarios(avisoId, comentariosContainer, linhaDiv);
        });

        container.appendChild(div);
      });
    }

    await carregarAvisos();

    abrirForm.addEventListener("click", () => {
      form.style.display = "block";
      abrirForm.style.display = "none";
    });

    cancelarBtn.addEventListener("click", () => {
      form.reset();
      form.style.display = "none";
      abrirForm.style.display = "flex";
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = auth.currentUser;
      const titulo = document.getElementById("titulo")?.value || "Aviso";
      const mensagem = document.getElementById("mensagem").value.trim();

      if (!mensagem) return;

      await db.collection("turmas").doc(turmaId).collection("mural").add({
        titulo,
        mensagem,
        data: new Date(),
        professor: {
          nome: user?.displayName || "Professor",
          foto: user?.photoURL || "../img/professor.png"
        }
      });

      form.reset();
      form.style.display = "none";
      abrirForm.style.display = "flex";

      await carregarAvisos();
    });

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
