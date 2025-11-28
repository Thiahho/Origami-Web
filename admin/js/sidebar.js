// // ==================== SIDEBAR COMPONENT INIT ====================
// (function(){
//   function loadSidebar(){
//     const placeholder = document.getElementById('sidebar-placeholder');
//     if(!placeholder) return;

//     fetch(`components/sidebar.html?v=${Date.now()}`, { cache: 'no-store' })
//       .then(r=>r.text())
//       .then(html=>{
//         placeholder.innerHTML = html;
//         initSidebarBehavior();
//       })
//       .catch(()=>{
//         // Fallback simple
//         placeholder.innerHTML = '<nav class="admin-sidebar"><div class="sidebar-header"><h2>Origami Admin</h2></div></nav>';
//       });
//   }

//   function initSidebarBehavior(){
//     const layout = document.querySelector('.admin-layout');
//     const sidebar = document.querySelector('.admin-sidebar');
//     const main = document.querySelector('.admin-main');
//     if(!sidebar || !layout || !main) return;

//     // Persisted collapsed state (solo desktop)
//     if(window.innerWidth > 768){
//       const collapsed = localStorage.getItem('admin_sidebar_collapsed') === '1';
//       if(collapsed){
//         layout.classList.add('sidebar-collapsed');
//       }
//     }

//     // Toggle button (desktop collapse)
//     const toggleBtn = sidebar.querySelector('.sidebar-toggle');
//     if(toggleBtn){
//       toggleBtn.addEventListener('click', ()=>{
//         layout.classList.toggle('sidebar-collapsed');
//         localStorage.setItem('admin_sidebar_collapsed', layout.classList.contains('sidebar-collapsed') ? '1' : '0');
//       });
//     }

//     // ==================== MOBILE SIDEBAR TOGGLE ====================
//     // Crear botón hamburguesa y overlay para móvil
//     if(window.innerWidth <= 768){
//       createMobileSidebarToggle();
//     }

//     // Recrear en resize
//     window.addEventListener('resize', function(){
//       const existingToggle = document.querySelector('.sidebar-toggle-mobile');
//       if(window.innerWidth <= 768 && !existingToggle){
//         createMobileSidebarToggle();
//       } else if(window.innerWidth > 768 && existingToggle){
//         existingToggle.remove();
//         const overlay = document.querySelector('.sidebar-overlay');
//         if(overlay) overlay.remove();
//         sidebar.classList.remove('is-open');
//       }
//     });

//     function createMobileSidebarToggle(){
//       // Verificar si ya existe
//       if(document.querySelector('.sidebar-toggle-mobile')) return;

//       // Crear overlay
//       const overlay = document.createElement('div');
//       overlay.className = 'sidebar-overlay';
//       document.body.appendChild(overlay);

//       // Crear botón toggle
//       const mobileToggle = document.createElement('button');
//       mobileToggle.className = 'sidebar-toggle-mobile';
//       mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
//       mobileToggle.setAttribute('aria-label', 'Toggle sidebar');
//       document.body.appendChild(mobileToggle);

//       // Event listeners
//       mobileToggle.addEventListener('click', function(){
//         sidebar.classList.toggle('is-open');
//         overlay.classList.toggle('is-open');
//         document.body.style.overflow = sidebar.classList.contains('is-open') ? 'hidden' : '';
//       });

//       overlay.addEventListener('click', function(){
//         sidebar.classList.remove('is-open');
//         overlay.classList.remove('is-open');
//         document.body.style.overflow = '';
//       });

//       // Cerrar al hacer clic en un link
//       sidebar.querySelectorAll('a').forEach(link => {
//         link.addEventListener('click', function(){
//           if(window.innerWidth <= 768){
//             sidebar.classList.remove('is-open');
//             overlay.classList.remove('is-open');
//             document.body.style.overflow = '';
//           }
//         });
//       });
//     }

//     // Mark active link
//     const path = location.pathname.split('/').pop();
//     sidebar.querySelectorAll('a').forEach(a=>{
//       const href = a.getAttribute('href');
//       if(href && href === path){
//         a.classList.add('active');
//       }
//     });
//   }

//   document.addEventListener('DOMContentLoaded', loadSidebar);
// })();
// ==================== SIDEBAR COMPONENT INIT ====================
(function () {
  // Contenido del sidebar embebido
  const sidebarHTML = `
    <nav class="admin-sidebar">
      <div class="sidebar-header">
        <img src="../img/iconoOrigami.webp" alt="Logo Origami" class="sidebar-logo">
        <h2>Origami Admin</h2>
        <button class="sidebar-toggle" aria-label="Toggle sidebar">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>
      
      <ul class="sidebar-nav">
        <li>
          <a href="dashboard.html">
            <i class="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </a>
        </li>
        <li>
          <a href="products.html">
            <i class="fas fa-box"></i>
            <span>Productos</span>
          </a>
        </li>
        <li>
          <a href="variantes.html">
            <i class="fas fa-palette"></i>
            <span>Variantes</span>
          </a>
        </li>
        <li>
          <a href="categorias.html">
            <i class="fas fa-tags"></i>
            <span>Categorías</span>
          </a>
        </li>
        <li>
          <a href="marcas.html">
            <i class="fas fa-tag"></i>
            <span>Marcas</span>
          </a>
        </li>
        <li>
          <a href="condiciones.html">
            <i class="fas fa-tag"></i>
            <span>Condiciones</span>
          </a>
        </li>
        <li>
          <a href="#" class="logout-link">
            <i class="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </a>
        </li>
      </ul>
    </nav>
  `;

  function loadSidebar() {
    const placeholder = document.getElementById("sidebar-placeholder");
    if (!placeholder) return;

    // Intentar cargar desde archivo externo primero
    fetch(`components/sidebar.html?v=${Date.now()}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Sidebar file not found");
        return r.text();
      })
      .then((html) => {
        placeholder.innerHTML = html;
        initSidebarBehavior();
      })
      .catch(() => {
        // Fallback: usar contenido embebido
        console.log("Using embedded sidebar HTML");
        placeholder.innerHTML = sidebarHTML;
        initSidebarBehavior();
      });
  }

  function initSidebarBehavior() {
    const layout = document.querySelector(".admin-layout");
    const sidebar = document.querySelector(".admin-sidebar");
    const main = document.querySelector(".admin-main");
    if (!sidebar || !layout || !main) return;

    // Persisted collapsed state (solo desktop)
    if (window.innerWidth > 768) {
      const collapsed = localStorage.getItem("admin_sidebar_collapsed") === "1";
      if (collapsed) {
        layout.classList.add("sidebar-collapsed");
      }
    }

    // Toggle button (desktop collapse)
    const toggleBtn = sidebar.querySelector(".sidebar-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Desktop toggle clicked, window width:", window.innerWidth);

        // Solo permitir collapse en desktop
        if (window.innerWidth > 768) {
          console.log("Toggling sidebar collapse");
          layout.classList.toggle("sidebar-collapsed");
          const isCollapsed = layout.classList.contains("sidebar-collapsed");
          console.log("Sidebar collapsed:", isCollapsed);
          localStorage.setItem(
            "admin_sidebar_collapsed",
            isCollapsed ? "1" : "0"
          );
        } else {
          console.log("Desktop toggle ignored in mobile view");
        }
      });
    }

    // Logout handler
    const logoutLink = sidebar.querySelector(".logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", function (e) {
        e.preventDefault();
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          window.location.href = "login.html";
        }
      });
    }

    // ==================== MOBILE SIDEBAR TOGGLE ====================
    // Crear botón hamburguesa y overlay para móvil
    if (window.innerWidth <= 768) {
      createMobileSidebarToggle();
    }

    // Recrear en resize
    window.addEventListener("resize", function () {
      const existingToggle = document.querySelector(".sidebar-toggle-mobile");
      if (window.innerWidth <= 768 && !existingToggle) {
        createMobileSidebarToggle();
      } else if (window.innerWidth > 768 && existingToggle) {
        existingToggle.remove();
        const overlay = document.querySelector(".sidebar-overlay");
        if (overlay) overlay.remove();
        sidebar.classList.remove("is-open");
      }
    });

    function createMobileSidebarToggle() {
      // Verificar si ya existe
      if (document.querySelector(".sidebar-toggle-mobile")) return;

      // Crear overlay
      const overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);

      // Crear botón toggle
      const mobileToggle = document.createElement("button");
      mobileToggle.className = "sidebar-toggle-mobile";
      mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      mobileToggle.setAttribute("aria-label", "Toggle sidebar");
      document.body.appendChild(mobileToggle);

      // Event listeners
      mobileToggle.addEventListener("click", function () {
        console.log("Toggle clicked"); // Debug
        console.log("Sidebar:", sidebar); // Debug
        console.log("Sidebar classes before:", sidebar.className); // Debug
        sidebar.classList.toggle("is-open");
        console.log("Sidebar classes after:", sidebar.className); // Debug

        const styles = window.getComputedStyle(sidebar);
        console.log("Sidebar left position:", styles.left);
        console.log("Sidebar display:", styles.display);
        console.log("Sidebar visibility:", styles.visibility);
        console.log("Sidebar opacity:", styles.opacity);
        console.log("Sidebar z-index:", styles.zIndex);
        console.log("Sidebar background:", styles.background);
        console.log("Sidebar width:", styles.width);
        console.log("Sidebar height:", styles.height);

        overlay.classList.toggle("is-open");
        document.body.style.overflow = sidebar.classList.contains("is-open")
          ? "hidden"
          : "";
      });

      overlay.addEventListener("click", function () {
        sidebar.classList.remove("is-open");
        overlay.classList.remove("is-open");
        document.body.style.overflow = "";
      });

      // Cerrar al hacer clic en un link
      sidebar.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", function () {
          if (window.innerWidth <= 768) {
            sidebar.classList.remove("is-open");
            overlay.classList.remove("is-open");
            document.body.style.overflow = "";
          }
        });
      });
    }

    // Mark active link
    const path = location.pathname.split("/").pop();
    sidebar.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href && href === path) {
        a.classList.add("active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", loadSidebar);
})();
