console.log("script.js cargado: POSTIA JSON text/plain");

const form = document.querySelector("#earlyAccessForm");
const statusMessage = document.querySelector("#formStatus");

if (!form) {
  throw new Error("No se encontró el formulario con id #earlyAccessForm");
}


if (!statusMessage) {
  throw new Error("No se encontró el elemento con id #formStatus");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');

  const payload = {
    nombre: form.elements.nombre.value.trim(),
    empresa: form.elements.empresa.value.trim(),
    tipo_negocio: form.elements.tipo_negocio.value.trim(),
    whatsapp: form.elements.whatsapp.value.trim(),
    correo: form.elements.correo.value.trim(),
    maneja_redes: form.elements.maneja_redes.value.trim(),
  };

  console.log("Payload enviado:");
  console.log(JSON.stringify(payload, null, 2));

  statusMessage.className = "form-status";
  statusMessage.textContent = "Sending your request...";

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
  }

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",

      /*
        Importante:
        No usamos application/json desde navegador porque dispara preflight OPTIONS.
        Google Apps Script Web App no responde OPTIONS correctamente.
        Mandamos JSON real, pero como text/plain para evitar CORS/preflight.
      */
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },

      body: JSON.stringify(payload),
      redirect: "follow",
    });

    const responseText = await response.text();

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    console.log("Response redirected:", response.redirected);
    console.log("Response url:", response.url);
    console.log("Response body:", responseText);


    statusMessage.classList.add("success");

    try {
      const responseJson = JSON.parse(responseText);

      if (responseJson.ok) {
        statusMessage.textContent =
          responseJson.message || "Done. We will contact you soon.";
        form.reset();
      } else {
        throw new Error(responseJson.error || "Respuesta inválida del servidor");
      }
    } catch {
      statusMessage.textContent =
        responseText.trim() || "Done. We will contact you soon.";
      form.reset();
    }
  } catch (error) {
    console.error("Error enviando formulario:", error);

    statusMessage.classList.add("error");
    statusMessage.textContent =
      "No se pudo enviar la solicitud. Revisa la consola para ver el error.";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Reserve my access";
    }
  }
});
