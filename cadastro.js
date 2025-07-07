async function cadastrar() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const perfil = document.getElementById("perfil").value;
  const erroMsg = document.getElementById("mensagemErro");

  if (!nome || !email || !senha) {
    erroMsg.textContent = "Preencha todos os campos.";
    return;
  }

  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, senha);
    const user = userCredential.user;
    const uid = user.uid;

    // Atualiza o nome do usuário no Firebase Auth
    await user.updateProfile({ displayName: nome });

    // Salva dados no Firestore
    await firebase.firestore().collection("usuarios").doc(uid).set({
      nome,
      email,
      perfil
    });

    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    erroMsg.textContent = "Erro: " + error.message;
  }
}
