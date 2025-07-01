function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const perfil = document.getElementById("perfil").value;

  firebase.auth().signInWithEmailAndPassword(email, senha)
    .then((userCredential) => {
      localStorage.setItem("perfil", perfil);
      if (perfil === "professor") {
        window.location.href = "professor/dashboard.html";
      } else {
        window.location.href = "responsavel/dashboard.html";
      }
    })
    .catch((error) => {
      document.getElementById("erroMsg").textContent = "Erro: " + error.message;
    });

    function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "../index.html";
  }).catch((error) => {
    console.error("Erro ao sair:", error);
  });
}

}
