async function cadastrar() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const perfil = document.getElementById("perfil").value;
  const erroMsg = document.getElementById("mensagemErro");

  const alunoId = document.getElementById("alunoId").value.trim();
  const turmaId = document.getElementById("turmaId").value.trim();

  if (!nome || !email || !senha) {
    erroMsg.textContent = "Preencha todos os campos.";
    return;
  }

  // Valida os campos extras apenas se for responsável
  if (perfil === "responsavel" && (!alunoId || !turmaId)) {
    erroMsg.textContent = "Informe o ID do aluno e a turma.";
    return;
  }

  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, senha);
    const user = userCredential.user;
    const uid = user.uid;

    // Atualiza o nome no Firebase Auth
    await user.updateProfile({ displayName: nome });

    // Prepara os dados para o Firestore
    const dados = {
      nome,
      email,
      perfil
    };

    if (perfil === "responsavel") {
      dados.alunoId = alunoId;
      dados.turmaId = turmaId;
    }

    // Salva no Firestore
    await firebase.firestore().collection("usuarios").doc(uid).set(dados);

    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";

  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    erroMsg.textContent = "Erro: " + error.message;
  }
}
