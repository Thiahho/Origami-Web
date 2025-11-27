// Contacto page scripts - Usa backend con Cloudflare Turnstile
(function () {
  var url = document.body.getAttribute("data-bg");
  if (url) {
    document.body.style.backgroundImage = "url('" + url + "')";
  }
})();

// IMPORTANTE: Reemplaza esta clave con tu Site Key de Cloudflare Turnstile
// Obtén tu Site Key gratis en: https://dash.cloudflare.com/?to=/:account/turnstile
const TURNSTILE_SITE_KEY = "1x00000000000000000000AA"; // 🔑 TESTING KEY - Cámbiala en producción

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = document.getElementById("btn-text");
  const btnLoading = document.getElementById("btn-loading");
  const formMessage = document.getElementById("form-message");

  let turnstileWidgetId = null;
  let turnstileToken = null;

  // Renderizar widget de Turnstile
  function renderTurnstile() {
    if (typeof turnstile !== "undefined") {
      turnstileWidgetId = turnstile.render("#turnstile-widget", {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "light",
        callback: function (token) {
          turnstileToken = token;
          //  console.log("✅ Turnstile verificado");
        },
        "error-callback": function () {
          console.error("❌ Error en Turnstile");
          showMessage(
            "Error al cargar la verificación. Recarga la página.",
            true
          );
        },
        "expired-callback": function () {
          turnstileToken = null;
          console.warn("⚠️ Turnstile expirado");
        },
      });
    } else {
      console.error("Turnstile no está cargado");
      setTimeout(renderTurnstile, 500); // Reintentar
    }
  }

  // Esperar a que Turnstile esté disponible
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderTurnstile);
  } else {
    // Pequeño delay para asegurar que el script esté cargado
    setTimeout(renderTurnstile, 100);
  }

  function showMessage(message, isError = false) {
    const alertIcon = formMessage.querySelector(".alert-icon");
    const alertText = formMessage.querySelector(".alert-text");

    // Configurar el contenido
    alertText.textContent = message;
    alertIcon.className = isError
      ? "alert-icon fa-solid fa-exclamation-triangle"
      : "alert-icon fa-solid fa-check-circle";

    // Configurar el estilo
    formMessage.className = `form-alert ${isError ? "error" : "success"}`;
    formMessage.style.display = "block";

    // Auto-ocultar después de 8 segundos
    setTimeout(() => {
      formMessage.style.display = "none";
    }, 8000);
  }

  function setLoading(loading) {
    if (loading) {
      submitBtn.disabled = true;
      btnText.style.display = "none";
      btnLoading.style.display = "inline";
    } else {
      submitBtn.disabled = false;
      btnText.style.display = "inline";
      btnLoading.style.display = "none";
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validar formulario
    const fromEmail = document.getElementById("from_email").value.trim();
    const fromName = document.getElementById("from_name").value.trim();
    const message = document.getElementById("message").value.trim();
    const website = document.getElementById("website").value.trim();

    // Validaciones básicas
    if (!fromEmail || !fromName || !message) {
      showMessage("Por favor, completa todos los campos.", true);
      return;
    }

    if (!isValidEmail(fromEmail)) {
      showMessage("Por favor, ingresa un email válido.", true);
      return;
    }

    if (message.length < 20) {
      showMessage("El mensaje debe tener al menos 20 caracteres.", true);
      return;
    }

    if (message.length > 2000) {
      showMessage("El mensaje no puede exceder 2000 caracteres.", true);
      return;
    }

    // Validar CAPTCHA
    if (!turnstileToken) {
      showMessage("Por favor, completa la verificación de seguridad.", true);
      return;
    }

    setLoading(true);

    try {
      // Enviar al backend
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fromName,
          email: fromEmail,
          message: message,
          website: website, // honeypot
          turnstileToken: turnstileToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          data.message ||
            "¡Mensaje enviado exitosamente! Te responderemos pronto."
        );
        form.reset(); // Limpiar formulario
        // Resetear Turnstile
        if (turnstileWidgetId !== null && typeof turnstile !== "undefined") {
          turnstile.reset(turnstileWidgetId);
          turnstileToken = null;
        }
      } else {
        // Manejar errores específicos
        if (response.status === 429) {
          showMessage(
            "Has enviado demasiados mensajes. Por favor, espera un momento e intenta nuevamente.",
            true
          );
        } else if (response.status === 503) {
          showMessage(
            data.message ||
              "Error temporal. Por favor, contáctanos por WhatsApp.",
            true
          );
        } else {
          showMessage(
            data.message || "Error al enviar el mensaje. Intenta nuevamente.",
            true
          );
        }
        // Resetear Turnstile en caso de error
        if (turnstileWidgetId !== null && typeof turnstile !== "undefined") {
          turnstile.reset(turnstileWidgetId);
          turnstileToken = null;
        }
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      showMessage(
        "Error de conexión. Por favor, verifica tu internet e intenta nuevamente o contáctanos por WhatsApp.",
        true
      );
      // Resetear Turnstile en caso de error
      if (turnstileWidgetId !== null && typeof turnstile !== "undefined") {
        turnstile.reset(turnstileWidgetId);
        turnstileToken = null;
      }
    } finally {
      setLoading(false);
    }
  });

  // Background images
  const backgroundImages = ["../img/PLANTILLA 1.webp"];
  let currentImageIndex = 0;
  const body = document.body;

  function changeBackground() {
    const nextImage = new Image();
    const nextImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    nextImage.src = backgroundImages[nextImageIndex];
    body.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;
    currentImageIndex = nextImageIndex;
  }

  changeBackground();

  // Forzar actualización del formulario para mostrar todos los campos
  if (form) {
    form.style.display = "none";
    setTimeout(() => {
      form.style.display = "flex";
    }, 100);
  }
});

// Cargar navbar
fetch("/Navbar/navbar.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("navbar-placeholder").innerHTML = html;
    setTimeout(async () => {
      if (typeof initNavbarAuth === "function") {
        await initNavbarAuth();
      } else {
        console.error("initNavbarAuth no está disponible");
      }
    }, 100);
  });

// Cargar footer
fetch("/Footer/footer.html")
  .then((r) => r.text())
  .then((html) => {
    document.getElementById("footer-placeholder").innerHTML = html;
  });
