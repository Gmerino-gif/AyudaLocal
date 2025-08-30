const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  
  const form = e.target;
  console.log("Formulario enviado:", form);
  const nombre = form.elements["nombre"].value;
  const user = form.elements["usuario"].value;
  const email = form.elements["email"].value;
  const telefono = form.elements["telefono"].value;
  const password = form.elements["password"].value;
  const confirmPassword = form.elements["confirm-password"].value;

  try {
    const res = await fetch("http://localhost:4000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, user, email, telefono, password, confirmPassword })
    });

    if (!res.ok) {
  mensajeError.style.display = "block";
      return;
    }

    const resJson = await res.json();
    if (resJson.redirect) {
      window.location.href = resJson.redirect;
    }
  } catch (error) {
    mensajeError.classList.toggle("escondido", false);
  }
});