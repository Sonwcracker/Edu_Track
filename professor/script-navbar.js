// Navega para a tela de mural com o ID da turma atual
function irParaMural() {
  const turmaId = localStorage.getItem("turmaId");
  if (turmaId) {
    window.location.href = `mural.html?turma=${turmaId}`;
  } else {
    alert("Nenhuma turma selecionada.");
  }
}

// Navega para a tela de alunos com o ID da turma atual
function irParaAlunos() {
  const turmaId = localStorage.getItem("turmaId");
  if (turmaId) {
    window.location.href = `alunos.html?turma=${turmaId}`;
  } else {
    alert("Nenhuma turma selecionada.");
  }
}

// Navega para a tela de presença com o ID da turma atual
function irParaPresenca() {
  const turmaId = localStorage.getItem("turmaId");
  if (turmaId) {
    window.location.href = `presenca.html?turma=${turmaId}`;
  } else {
    alert("Nenhuma turma selecionada.");
  }
}

// Lista turmas do professor (pode ser substituído por redirecionamento futuramente)
function listarMinhasTurmas() {
  alert("Funcionalidade de listar turmas será implementada aqui.");
}

// Realiza logout e redireciona para a tela de login
function logout() {
  firebase.auth().signOut()
    .then(() => {
      localStorage.removeItem("turmaId"); // limpa turma ao sair
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Erro ao fazer logout:", error);
    });
}

// Aguarda o carregamento da navbar lateral para vincular os eventos
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const itens = document.querySelectorAll("#navbar-lateral ul li");

    if (itens.length >= 4) {
      itens[0].addEventListener("click", irParaMural);        // Início (Mural)
      itens[1].addEventListener("click", listarMinhasTurmas); // Minhas Turmas
      itens[2].addEventListener("click", irParaPresenca);     // Presenças
      itens[3].addEventListener("click", irParaAlunos);       // Alunos
    }

    const botaoLogout = document.querySelector(".logout-btn");
    if (botaoLogout) {
      botaoLogout.addEventListener("click", logout);
    }
  }, 200); // Pequeno delay para garantir que a navbar foi injetada
});
