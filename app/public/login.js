 const mensajeError = document.getElementsByClassName ("error")[0];

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const user = form.elements["usuario"].value;
    const password = form.elements["password"].value;
    const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
            },
            body: JSON.stringify({ 
            user, password 
        })
    });

        if (!res.ok) return mensajeError.classList.toggle("escondido", false);
        const resJson = await res.json();
        if (resJson.usuario) {
            // Guardar usuario en localStorage (sin contraseña)
            localStorage.setItem('usuarioLogueado', JSON.stringify(resJson.usuario));
        }
        if (resJson.redirect) {
            window.location.href = resJson.redirect;
        }
    
})