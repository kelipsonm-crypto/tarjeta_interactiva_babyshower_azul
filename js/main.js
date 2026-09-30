/**
 * Invitación Interactiva - Portada del Sobre Cerrado
 * Lógica modular para microinteracciones, animaciones y eventos
 */

document.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM
  const waxSeal = document.getElementById('waxSeal');
  const envelopeContainer = document.getElementById('envelopeContainer');
  const envelopeStage = document.getElementById('envelopeStage');
  const tapInviteBtn = document.getElementById('tapInviteBtn');
  const coverScreen = document.getElementById('coverScreen');
  const tigerEl = document.getElementById('tigerCubsImg') || document.getElementById('tigerCubsVideo');
  const btnRsvp = document.getElementById('btnRsvp');
  const btnMap = document.getElementById('btnMap');

  let isOpening = false;
  let isOpened = false;



  /**
   * Crea partículas de destello dorado al pulsar el sello
   */
  const createGoldenSparkles = (originX, originY) => {
    const stage = document.getElementById('envelopeStage');
    if (!stage) return;

    const stageRect = stage.getBoundingClientRect();
    const count = 14;
    const fragment = document.createDocumentFragment();
    const sparkles = [];

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('span');
      sparkle.classList.add('gold-sparkle');

      const angle = (i / count) * 2 * Math.PI;
      const distance = 25 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      sparkle.style.setProperty('--tx', `${tx}px`);
      sparkle.style.setProperty('--ty', `${ty}px`);
      sparkle.style.left = `${originX - stageRect.left}px`;
      sparkle.style.top = `${originY - stageRect.top}px`;

      fragment.appendChild(sparkle);
      sparkles.push(sparkle);
    }

    stage.appendChild(fragment);

    setTimeout(() => {
      sparkles.forEach(s => s.remove());
    }, 800);
  };

  /**
   * Manejador de evento al tocar el sobre o el sello (Secuencia 4 Fases)
   */
  const handleEnvelopeTap = (event) => {
    // Si ya se está abriendo o ya está abierta, evitamos duplicados
    if (isOpening || isOpened) return;

    // Vibración táctil si el dispositivo lo soporta
    if (navigator.vibrate) {
      navigator.vibrate([35, 20, 45]);
    }

    // Coordenadas para destellos dorados
    let clickX, clickY;
    if (event && event.clientX && event.clientY) {
      clickX = event.clientX;
      clickY = event.clientY;
    } else if (waxSeal) {
      const sealRect = waxSeal.getBoundingClientRect();
      clickX = sealRect.left + sealRect.width / 2;
      clickY = sealRect.top + sealRect.height / 2;
    }

    if (clickX && clickY) {
      createGoldenSparkles(clickX, clickY);
    }

    isOpening = true;

    // FASE 1 y 2: Despegue del Sello y Apertura de la Solapa
    if (envelopeStage) envelopeStage.classList.add('is-opening');
    if (coverScreen) coverScreen.classList.add('is-opening');

    console.log('%c✉️ ¡Animación de apertura iniciada! Despegue de sello y despliegue de solapa.', 'color: #C5A059; font-size: 14px; font-weight: bold;');

    // FASE 3 y 4: Extracción de la carta y Expansión Continua a Pantalla Completa (Takeover)
    // Permite que se complete la apertura (solapa ~0.85s + extracción fluida ~1.4s)
    setTimeout(() => {
      const cardEl = document.getElementById('invitationCard');
      const takeoverEl = document.getElementById('cardTakeover');

      if (cardEl && takeoverEl) {
        const rect = cardEl.getBoundingClientRect();

        // 1. Clonar el contenido exacto (la captura fija preview_invitacion.png)
        takeoverEl.innerHTML = cardEl.innerHTML;

        // 2. Posicionar el takeover exactamente sobre la carta extraída
        takeoverEl.style.display = 'block';
        takeoverEl.style.position = 'fixed';
        takeoverEl.style.top = `${rect.top}px`;
        takeoverEl.style.left = `${rect.left}px`;
        takeoverEl.style.width = `${rect.width}px`;
        takeoverEl.style.height = `${rect.height}px`;
        takeoverEl.style.borderRadius = '12px';
        takeoverEl.style.backgroundColor = '#FFFFFF';
        takeoverEl.style.boxShadow = '0 24px 50px rgba(35, 25, 15, 0.28)';
        takeoverEl.style.zIndex = '99999';

        // 3. Ocultar la carta original dentro del sobre
        cardEl.style.opacity = '0';

        // 4. Forzar reflujo del navegador
        void takeoverEl.offsetWidth;

        // 5. Determinar dimensiones objetivo (pantalla completa o frame móvil en desktop)
        const mobileDevice = document.getElementById('mobileDevice');
        const isMobileScreen = window.innerWidth <= 600;
        const targetRect = (mobileDevice && !isMobileScreen)
          ? mobileDevice.getBoundingClientRect()
          : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        const targetRadius = (mobileDevice && !isMobileScreen) ? '38px' : '0px';

        // 6. Animar expansión milimétrica y fluida a pantalla completa
        takeoverEl.style.transition = 'top 0.82s cubic-bezier(0.22, 1, 0.36, 1), left 0.82s cubic-bezier(0.22, 1, 0.36, 1), width 0.82s cubic-bezier(0.22, 1, 0.36, 1), height 0.82s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.65s ease, box-shadow 0.65s ease';
        takeoverEl.style.top = `${targetRect.top}px`;
        takeoverEl.style.left = `${targetRect.left}px`;
        takeoverEl.style.width = `${targetRect.width}px`;
        takeoverEl.style.height = `${targetRect.height}px`;
        takeoverEl.style.borderRadius = targetRadius;
        takeoverEl.style.boxShadow = 'none';

        // 7. Redirección invisible e instantánea a invitacion.html al completar la cobertura
        setTimeout(() => {
          window.location.href = 'invitacion.html';
        }, 840);
      } else {
        // Fallback si no está el elemento takeover
        window.location.href = 'invitacion.html';
      }
    }, 2350);
  };

  // Asignación de eventos interactivos
  if (waxSeal) {
    waxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      handleEnvelopeTap(e);
    });
  }

  if (envelopeContainer) {
    envelopeContainer.addEventListener('click', (e) => {
      // Si la carta ya está abierta y en lectura, dejamos que sus botones actúen normalmente
      if (isOpened && e.target.closest('.invitation-card')) {
        return;
      }
      handleEnvelopeTap(e);
    });

    // Accesibilidad por teclado (Enter o Espacio)
    envelopeContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnvelopeTap(e);
      }
    });
  }

  if (tapInviteBtn) {
    tapInviteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleEnvelopeTap(e);
    });
    tapInviteBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnvelopeTap(e);
      }
    });
  }

  const hostsInvitation = document.getElementById('hostsInvitation');
  if (hostsInvitation) {
    hostsInvitation.addEventListener('click', (e) => {
      e.stopPropagation();
      handleEnvelopeTap(e);
    });
    hostsInvitation.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnvelopeTap(e);
      }
    });
  }

  /**
   * Sincroniza dinámicamente el contenido de la carta interior con la configuración actual
   */
  const syncLiveInvitationCard = (cfg) => {
    if (!cfg || !cfg.evento) return;
    const ev = cfg.evento;

    const subEl = document.getElementById('cardLiveSubtitle');
    const name1El = document.getElementById('cardLiveName1');
    const name2El = document.getElementById('cardLiveName2');
    const hostsLine1El = document.getElementById('hostsLine1');
    const hostsLine2El = document.getElementById('hostsLine2');
    const dedEl = document.getElementById('cardLiveDedication');

    if (subEl && ev.subtitulo_superior) {
      subEl.textContent = ev.subtitulo_superior;
    }
    if (name1El && ev.nombre_linea_1) {
      name1El.textContent = ev.nombre_linea_1;
    }
    if (name2El && ev.nombre_linea_2) {
      name2El.textContent = ev.nombre_linea_2;
    }
    if (hostsLine1El && ev.anfitriones_linea_1) {
      hostsLine1El.textContent = ev.anfitriones_linea_1;
    }
    if (hostsLine2El && ev.anfitriones_linea_2) {
      hostsLine2El.textContent = ev.anfitriones_linea_2;
    }
    if (dedEl && ev.dedicatoria) {
      const clean = ev.dedicatoria.replace(/^[«"“]/, '').replace(/[»"”]$/, '').trim();
      dedEl.textContent = `«${clean}»`;
    }
  };

  // Sincronización inicial inmediata
  if (window.APP_CONFIG) {
    syncLiveInvitationCard(window.APP_CONFIG);
  }

  // Sincronización en tiempo real desde config.json (sin caché)
  fetch('config.json?t=' + Date.now())
    .then(res => res.json())
    .then(data => syncLiveInvitationCard(data))
    .catch(() => {});

  // Auto-apertura si se pasa el parámetro ?open=1 en la URL (para previsualizaciones o pruebas)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('open') === '1' || urlParams.get('state') === 'open') {
    setTimeout(() => {
      handleEnvelopeTap();
    }, 350);
  }
});
