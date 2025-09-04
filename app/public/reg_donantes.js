const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("donacionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  
  const form = e.target;
  const cedula = form.elements["cedula"].value;
  const nombre = form.elements["nombre"].value;
  const telefono = form.elements["telefono"].value;
  const email = form.elements["email"].value;
  const tipo_donacion = form.elements["tipo-donacion"].value;
  const cantidad = form.elements["cantidad"].value;
  const disponibilidad = form.elements["disponibilidad"].value;
  const contactar = form.elements["contactar"].checked;


  try {
    const res = await fetch("http://localhost:4000/api/donantes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cedula, nombre, telefono, email, tipo_donacion, cantidad, disponibilidad, contactar })
    });

    if (!res.ok) {
  mensajeError.style.display = "block";
      return;
    }

    const resJson = await res.json();
    if (resJson.redirect) {
        //alert("Registro exitoso. Serás redirigido al Dashboard.");
      window.location.href = resJson.redirect;
    }
  } catch (error) {
    mensajeError.classList.toggle("escondido", false);
  }
});