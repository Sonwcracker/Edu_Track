window.addEventListener('DOMContentLoaded', async () => {
  // NAVBARS
  fetch("navbar.html").then(res => res.text()).then(html => {
    document.getElementById("navbar-lateral").innerHTML = html;
  });
  fetch("navbar-top.html").then(res => res.text()).then(html => {
    document.getElementById("navbar-top").innerHTML = html;
  });

  const db = firebase.firestore();
  const auth = firebase.auth();
  const turmaId = new URLSearchParams(window.location.search).get("turma");

  const infoTurma = document.getElementById("info-turma");
  const tbody = document.getElementById("lista-presenca");
  const historicoContainer = document.getElementById("historico-semanas");

  if (!turmaId) {
    infoTurma.textContent = "Turma não encontrada.";
    return;
  }

  const turmaDoc = await db.collection("turmas").doc(turmaId).get();
  const turmaData = turmaDoc.data();
  infoTurma.innerHTML = `${turmaData.nome}<br>Prof. (carregando...)`;

  const nomeTurmaEl = document.getElementById("nome-turma");
  if (nomeTurmaEl) nomeTurmaEl.textContent = turmaData.nome;

  auth.onAuthStateChanged(user => {
    if (user) {
      const nomeProf = user.displayName || "Professor";
      const nomeProfEl = document.getElementById("nome-professor");
      if (nomeProfEl) nomeProfEl.textContent = nomeProf;
      infoTurma.innerHTML = `${turmaData.nome}<br>Prof. ${nomeProf}`;
    }
  });

  const alunosSnapshot = await db.collection("turmas").doc(turmaId).collection("alunos").get();

  const diasSemana = ["seg", "ter", "qua", "qui", "sex"];
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda...

  const ultimoDiaPermitido = Math.min(Math.max(diaSemana - 1, 0), 4);

  // 🔹 Montar tabela da semana atual com dropdowns
  alunosSnapshot.forEach(doc => {
    const aluno = doc.data();
    const tr = document.createElement("tr");
    const tdNome = document.createElement("td");
    tdNome.textContent = aluno.nome;
    tr.appendChild(tdNome);

    diasSemana.forEach((dia, index) => {
      const td = document.createElement("td");
      const select = document.createElement("select");
      select.name = `${doc.id}-${dia}`;

      const optDefault = document.createElement("option");
      optDefault.value = "";
      optDefault.textContent = "—";

      const optPresente = document.createElement("option");
      optPresente.value = "presente";
      optPresente.textContent = "Presente";

      const optFalta = document.createElement("option");
      optFalta.value = "falta";
      optFalta.textContent = "Falta";

      select.appendChild(optDefault);
      select.appendChild(optPresente);
      select.appendChild(optFalta);

      if (index > ultimoDiaPermitido) {
        select.disabled = true;
        select.title = "Esse dia ainda não chegou.";
      }

      td.appendChild(select);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  // 🔹 Envio da semana atual
  document.getElementById("form-presenca").addEventListener("submit", async (e) => {
    e.preventDefault();
    const presencas = {};

    alunosSnapshot.forEach(doc => {
      const alunoId = doc.id;
      presencas[alunoId] = {};
      diasSemana.forEach((dia, index) => {
        const sel = document.querySelector(`select[name='${alunoId}-${dia}']`);
        if (sel && !sel.disabled) {
          presencas[alunoId][dia] = sel.value === "presente";
        }
      });
    });

    const dataHoje = new Date().toISOString().split("T")[0];
    const registroRef = db.collection("turmas").doc(turmaId).collection("presencas").doc(dataHoje).collection("registro");

    for (const alunoId in presencas) {
      await registroRef.doc(alunoId).set(presencas[alunoId]);
    }

    alert("Presença da semana atual salva com sucesso!");
    await carregarHistorico();
  });

  // 🔹 Histórico com possibilidade de completar dias faltantes
  async function carregarHistorico() {
    historicoContainer.innerHTML = "";
    const snapshot = await db.collection("turmas").doc(turmaId).collection("presencas").get();

    snapshot.forEach(async (docPresenca) => {
      const data = docPresenca.id;
      const registros = await docPresenca.ref.collection("registro").get();
      if (registros.empty) return;

      const box = document.createElement("div");
      box.className = "historico-box";

      const titulo = document.createElement("div");
      titulo.className = "historico-titulo";
      titulo.innerHTML = `Semana: ${data} <span style="float: right; cursor: pointer;">▼</span>`;
      box.appendChild(titulo);

      const tabela = document.createElement("table");
      tabela.innerHTML = `
        <thead>
          <tr><th>Aluno</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th></tr>
        </thead>
      `;
      const tbody = document.createElement("tbody");

      registros.forEach(reg => {
        const presenca = reg.data();
        const alunoNome = alunosSnapshot.docs.find(a => a.id === reg.id)?.data().nome || "Desconhecido";
        const tr = document.createElement("tr");
        const tdNome = document.createElement("td");
        tdNome.textContent = alunoNome;
        tr.appendChild(tdNome);

        diasSemana.forEach(dia => {
          const td = document.createElement("td");
          if (presenca[dia] === undefined) {
            const select = document.createElement("select");
            select.name = `${reg.id}-${data}-${dia}`;

            ["—", "Presente", "Falta"].forEach(txt => {
              const opt = document.createElement("option");
              opt.value = txt.toLowerCase();
              opt.textContent = txt;
              select.appendChild(opt);
            });

            td.appendChild(select);
          } else {
            td.textContent = presenca[dia] ? "✓" : "F";
          }
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      tabela.appendChild(tbody);
      tabela.style.display = "none";
      box.appendChild(tabela);

      const btnSalvar = document.createElement("button");
      btnSalvar.textContent = "Salvar dias faltantes";
      btnSalvar.style.display = "none";
      btnSalvar.addEventListener("click", async () => {
        const registroRef = db.collection("turmas").doc(turmaId).collection("presencas").doc(data).collection("registro");
        for (const aluno of alunosSnapshot.docs) {
          const alunoId = aluno.id;
          const atual = {};
          diasSemana.forEach(dia => {
            const sel = document.querySelector(`select[name='${alunoId}-${data}-${dia}']`);
            if (sel && sel.value !== "—") {
              atual[dia] = sel.value === "presente";
            }
          });
          if (Object.keys(atual).length > 0) {
            await registroRef.doc(alunoId).set(atual, { merge: true });
          }
        }
        alert("Dias faltantes atualizados com sucesso!");
        await carregarHistorico();
      });

      box.appendChild(btnSalvar);

      titulo.addEventListener("click", () => {
        const expanded = tabela.style.display === "table";
        tabela.style.display = expanded ? "none" : "table";
        btnSalvar.style.display = expanded ? "none" : "block";
      });

      historicoContainer.appendChild(box);
    });
  }

  await carregarHistorico();
});
