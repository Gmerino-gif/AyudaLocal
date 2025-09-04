const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("solicitudForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  
  const form = e.target;
  const cedula = form.elements["cedula"].value;
  const nombre = form.elements["nombre"].value;
  const telefono = form.elements["telefono"].value;
  const email = form.elements["email"].value;
  const tipo_ayuda = form.elements["tipo-ayuda"].value;
  const descripcion = form.elements["descripcion"].value;
  const direccion = form.elements["direccion"].value;
  const urgente = form.elements["urgente"].checked;


  try {
    const res = await fetch("http://localhost:4000/api/solicitantes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cedula, nombre, telefono, email, tipo_ayuda, descripcion, direccion, urgente })
    });

    if (!res.ok) {
  mensajeError.style.display = "block";
      return;
    }

    const resJson = await res.json();
    if (resJson.redirect) {
//   alert("Registro exitoso. Serás redirigido al Dashboard.");
  window.location.href = "/dashboard.html";
    }
  } catch (error) {
    mensajeError.classList.toggle("escondido", false);
  }
});