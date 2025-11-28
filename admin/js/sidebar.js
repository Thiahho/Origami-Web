// ==================== SIDEBAR COMPONENT INIT ====================
(function(){
  function loadSidebar(){
    const placeholder = document.getElementById('sidebar-placeholder');
    if(!placeholder) return;

    fetch(`components/sidebar.html?v=${Date.now()}`, { cache: 'no-store' })
      .then(r=>r.text())
      .then(html=>{
        placeholder.innerHTML = html;
        initSidebarBehavior();
      })
      .catch(()=>{
        // Fallback simple
        placeholder.innerHTML = '<nav class="admin-sidebar"><div class="sidebar-header"><h2>Origami Admin</h2></div></nav>';
      });
  }

  function initSidebarBehavior(){
    const layout = document.querySelector('.admin-layout');
    const sidebar = document.querySelector('.admin-sidebar');
    const main = document.querySelector('.admin-main');
    if(!sidebar || !layout || !main) return;

    // Persisted collapsed state (solo desktop)
    if(window.innerWidth > 768){
      const collapsed = localStorage.getItem('admin_sidebar_collapsed') === '1';
      if(collapsed){
        layout.classList.add('sidebar-collapsed');
      }
    }

    // Toggle button (desktop collapse)
    const toggleBtn = sidebar.querySelector('.sidebar-toggle');
    if(toggleBtn){
      toggleBtn.addEventListener('click', ()=>{
        layout.classList.toggle('sidebar-collapsed');
        localStorage.setItem('admin_sidebar_collapsed', layout.classList.contains('sidebar-collapsed') ? '1' : '0');
      });
    }

    // ==================== MOBILE SIDEBAR TOGGLE ====================
    // Crear botón hamburguesa y overlay para móvil
    if(window.innerWidth <= 768){
      createMobileSidebarToggle();
    }

    // Recrear en resize
    window.addEventListener('resize', function(){
      const existingToggle = document.querySelector('.sidebar-toggle-mobile');
      if(window.innerWidth <= 768 && !existingToggle){
        createMobileSidebarToggle();
      } else if(window.innerWidth > 768 && existingToggle){
        existingToggle.remove();
        const overlay = document.querySelector('.sidebar-overlay');
        if(overlay) overlay.remove();
        sidebar.classList.remove('is-open');
      }
    });

    function createMobileSidebarToggle(){
      // Verificar si ya existe
      if(document.querySelector('.sidebar-toggle-mobile')) return;

      // Crear overlay
      const overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);

      // Crear botón toggle
      const mobileToggle = document.createElement('button');
      mobileToggle.className = 'sidebar-toggle-mobile';
      mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      mobileToggle.setAttribute('aria-label', 'Toggle sidebar');
      document.body.appendChild(mobileToggle);

      // Event listeners
      mobileToggle.addEventListener('click', function(){
        sidebar.classList.toggle('is-open');
        overlay.classList.toggle('is-open');
        document.body.style.overflow = sidebar.classList.contains('is-open') ? 'hidden' : '';
      });

      overlay.addEventListener('click', function(){
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
      });

      // Cerrar al hacer clic en un link
      sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(){
          if(window.innerWidth <= 768){
            sidebar.classList.remove('is-open');
            overlay.classList.remove('is-open');
            document.body.style.overflow = '';
          }
        });
      });
    }

    // Mark active link
    const path = location.pathname.split('/').pop();
    sidebar.querySelectorAll('a').forEach(a=>{
      const href = a.getAttribute('href');
      if(href && href === path){
        a.classList.add('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', loadSidebar);
})();


