/**
 * Invitación Interactiva - Liam Alexander
 * Lógica del Reproductor de Música y Extracción de Fondo en Tiempo Real para Videos
 */

document.addEventListener('DOMContentLoaded', () => {
  const playerWrapper = document.getElementById('playerWrapper');
  const playBtn = document.getElementById('playBtn');
  const bgMusic = document.getElementById('bgMusic');

  let isAudioPlaying = false;

  /* ==========================================================================
     1. Extracción de Fondo en Tiempo Real (Chroma Keying a Transparente)
     ========================================================================== */
  const setupCanvasKeying = (videoEl, canvasEl, thresholdWhite = 234, thresholdFeather = 214) => {
    if (!videoEl || !canvasEl) return;

    const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let isProcessing = false;

    const render = () => {
      if (videoEl.readyState >= 2 && !videoEl.paused) {
        const w = canvasEl.width;
        const h = canvasEl.height;
        ctx.drawImage(videoEl, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const buf32 = new Uint32Array(imgData.data.buffer);
        const len = buf32.length;

        for (let i = 0; i < len; i++) {
          const pixel = buf32[i];
          const r = pixel & 0xFF;
          const g = (pixel >> 8) & 0xFF;
          const b = (pixel >> 16) & 0xFF;

          // Fondo blanco / off-white del video (> thresholdWhite)
          if (r > thresholdWhite && g > thresholdWhite && b > thresholdWhite) {
            buf32[i] = 0; // Transparente 100%
          } else if (r > thresholdFeather && g > thresholdFeather && b > thresholdFeather) {
            // Suavizado anti-aliasing en bordes finos
            const avg = (r + g + b) / 3;
            const a = Math.min(255, Math.max(0, Math.round((255 - avg) * 12.5)));
            buf32[i] = (pixel & 0x00FFFFFF) | (a << 24);
          }
        }
        ctx.putImageData(imgData, 0, 0);
        if (canvasEl.parentElement) {
          canvasEl.parentElement.classList.add('is-ready');
        }
      }

      if ('requestVideoFrameCallback' in videoEl) {
        videoEl.requestVideoFrameCallback(render);
      } else {
        requestAnimationFrame(render);
      }
    };

    videoEl.addEventListener('play', () => {
      if (!isProcessing) {
        isProcessing = true;
        if ('requestVideoFrameCallback' in videoEl) {
          videoEl.requestVideoFrameCallback(render);
        } else {
          requestAnimationFrame(render);
        }
      }
    });

    // Iniciar render inicial si ya está reproduciendo
    if (!videoEl.paused && videoEl.readyState >= 2) {
      isProcessing = true;
      render();
    }
  };

  // Configurar keying para Elefantito y Mariposas
  setupCanvasKeying(
    document.getElementById('elephantVideo'),
    document.getElementById('elephantCanvas'),
    235,
    215
  );

  setupCanvasKeying(
    document.getElementById('butterflyLeftVideo'),
    document.getElementById('butterflyLeftCanvas'),
    230,
    210
  );

  setupCanvasKeying(
    document.getElementById('butterflyRightVideo'),
    document.getElementById('butterflyRightCanvas'),
    230,
    210
  );

  setupCanvasKeying(
    document.getElementById('giraffeVideo'),
    document.getElementById('giraffeCanvas'),
    234,
    214
  );

  setupCanvasKeying(
    document.getElementById('zebraVideo'),
    document.getElementById('zebraCanvas'),
    230,
    205
  );

  /* ==========================================================================
     2. Reproducción Continua de Videos Silenciados en Móviles
     ========================================================================== */
  const videoElements = [
    document.getElementById('elephantVideo'),
    document.getElementById('butterflyLeftVideo'),
    document.getElementById('butterflyRightVideo'),
    document.getElementById('giraffeVideo'),
    document.getElementById('zebraVideo')
  ];

  const ensureVideoAutoplay = () => {
    videoElements.forEach(v => {
      if (v) {
        v.muted = true;
        v.setAttribute('playsinline', '');
        v.setAttribute('muted', '');
        const p = v.play();
        if (p !== undefined) {
          p.catch(() => {
            document.addEventListener('pointerdown', () => v.play().catch(() => {}), { once: true });
          });
        }
      }
    });
  };

  ensureVideoAutoplay();

  /* ==========================================================================
     3. Control del Reproductor de Música
     ========================================================================== */
  const toggleAudio = (e) => {
    if (e) e.stopPropagation();

    if (!bgMusic) return;

    if (!isAudioPlaying) {
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isAudioPlaying = true;
            playerWrapper.classList.add('is-playing');
            if (playBtn) playBtn.title = 'Pausar música';
          })
          .catch((err) => {
            console.info('Audio aún no cargado o bloqueado por el navegador:', err.message);
            // Mostrar animación activa como respuesta táctil interactiva
            isAudioPlaying = true;
            playerWrapper.classList.add('is-playing');
          });
      }
    } else {
      bgMusic.pause();
      isAudioPlaying = false;
      playerWrapper.classList.remove('is-playing');
      if (playBtn) playBtn.title = 'Reproducir música';
    }
  };

  if (playBtn) {
    playBtn.addEventListener('click', toggleAudio);
  }

  if (bgMusic) {
    bgMusic.addEventListener('ended', () => {
      isAudioPlaying = false;
      playerWrapper.classList.remove('is-playing');
    });
  }

  /* ==========================================================================
     4. Carga y Aplicación de Configuración Centralizada (config.json / config.js)
     ========================================================================== */
  let targetDate = new Date('2026-10-22T20:00:00');
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');
  const cdFinishedMsg = document.getElementById('cdFinishedMsg');
  const cdBoxesWrap = document.querySelector('.countdown-boxes-wrap');

  const aplicarConfiguracion = (cfg) => {
    if (!cfg || !cfg.evento) return;
    const ev = cfg.evento;

    // 1. Título y Nombres del Bebé (Línea 1 y Línea 2)
    const name1 = ev.nombre_linea_1 || (ev.nombre_bebe ? ev.nombre_bebe.trim().split(' ')[0] : 'Liam');
    const name2 = ev.nombre_linea_2 || (ev.nombre_bebe ? ev.nombre_bebe.trim().split(' ').slice(1).join(' ') : 'Alexander');
    
    document.title = `Invitación Especial | ${name1} ${name2}`.trim();
    const nameFirstEl = document.getElementById('nameFirst');
    const nameSecondEl = document.getElementById('nameSecond');
    if (nameFirstEl) nameFirstEl.textContent = name1;
    if (nameSecondEl) nameSecondEl.textContent = name2;

    // 2. Subtítulo Superior
    if (ev.subtitulo_superior) {
      const introSub = document.getElementById('introSubtitle');
      if (introSub) introSub.textContent = ev.subtitulo_superior;
    }

    // 3. Dedicatoria
    if (ev.dedicatoria) {
      const dedEl = document.getElementById('dedicationText');
      if (dedEl) {
        const cleanText = ev.dedicatoria.replace(/^[«"“]/, '').replace(/[»"”]$/, '').trim();
        dedEl.textContent = `«${cleanText}»`;
      }
    }

    // 4. Música
    if (ev.musica) {
      const audioEl = document.getElementById('bgMusic');
      const labelEl = document.getElementById('playerTextLabel');
      const playerWrapper = document.getElementById('playerWrapper');
      const playBtn = document.getElementById('playBtn');

      if (ev.musica.archivo_audio && audioEl) {
        audioEl.src = ev.musica.archivo_audio;
      }
      if (ev.musica.texto_reproductor) {
        if (labelEl) labelEl.textContent = ev.musica.texto_reproductor;
        if (playerWrapper) playerWrapper.setAttribute('aria-label', ev.musica.texto_reproductor);
        if (playBtn) playBtn.setAttribute('title', ev.musica.texto_reproductor);
      }
    }

    // 5. Fecha del Evento
    const fechaObj = ev.fecha || ev.fecha_texto;
    if (fechaObj) {
      const dayEl = document.getElementById('eventDayName');
      const dateEl = document.getElementById('eventDateVal');
      const yearEl = document.getElementById('eventYearName');
      if (dayEl && fechaObj.dia_semana) dayEl.textContent = fechaObj.dia_semana;
      if (dateEl && fechaObj.dia_mes) dateEl.textContent = fechaObj.dia_mes;
      if (yearEl && fechaObj.anio) yearEl.textContent = fechaObj.anio;
    }

    // 6. Hora del Evento
    const horaVal = ev.hora || ev.hora_texto;
    if (horaVal) {
      const timeEl = document.getElementById('eventTimeVal');
      if (timeEl) timeEl.textContent = horaVal;
    }

    // 7. Cuenta Regresiva ISO
    const fechaIso = ev.cuenta_regresiva_iso || ev.fecha_iso_cuenta_regresiva;
    if (fechaIso) {
      const parsedDate = new Date(fechaIso);
      if (!isNaN(parsedDate.getTime())) {
        targetDate = parsedDate;
      }
    }

    // 8. Ubicación y Enlace de Google Maps
    if (ev.ubicacion) {
      const venueEl = document.getElementById('eventVenueLabel');
      const addrEl = document.getElementById('eventAddressText');
      const mapBtn = document.getElementById('btnLocationMap');

      // Nombre del lugar / título de la dirección
      const venueName = ev.ubicacion.nombre_lugar || ev.ubicacion.nombre_direccion || ev.ubicacion.titulo_lugar;
      if (venueEl && venueName) {
        venueEl.textContent = venueName;
      }

      // Dirección física
      if (addrEl && ev.ubicacion.direccion) {
        addrEl.textContent = ev.ubicacion.direccion;
      }

      // Enlace compartido de Google Maps (ej. https://maps.app.goo.gl/...)
      const mapsUrl = ev.ubicacion.url_google_maps || ev.ubicacion.link_google_maps || ev.ubicacion.enlace_google_maps;
      if (mapBtn) {
        if (mapsUrl) {
          const cleanUrl = mapsUrl.replace(/\[([^\]]+)\]\(([^)]+)\)/, '$2').trim();
          mapBtn.href = cleanUrl;
        } else if (ev.ubicacion.direccion) {
          mapBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.ubicacion.direccion)}`;
        }
      }
    }

    // 9. Confirmación de Asistencia (RSVP WhatsApp)
    if (ev.confirmacion) {
      const rsvpTitleEl = document.getElementById('rsvpTitle');
      const rsvpSubEl = document.getElementById('rsvpSubtitle');
      const rsvpBtnTextEl = document.getElementById('rsvpBtnText');
      const rsvpBtnEl = document.getElementById('btnRsvpWhatsapp');

      if (rsvpTitleEl && ev.confirmacion.titulo) rsvpTitleEl.textContent = ev.confirmacion.titulo;
      if (rsvpSubEl && ev.confirmacion.subtitulo) rsvpSubEl.textContent = ev.confirmacion.subtitulo;
      if (rsvpBtnTextEl && ev.confirmacion.boton_texto) rsvpBtnTextEl.textContent = ev.confirmacion.boton_texto;

      if (rsvpBtnEl && ev.confirmacion.telefono_whatsapp) {
        const phone = ev.confirmacion.telefono_whatsapp.toString().replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(ev.confirmacion.mensaje_whatsapp || '');
        rsvpBtnEl.href = `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;
      }
    }

    // 10. Agradecimiento Final
    if (ev.agradecimiento_final) {
      const thanksTopEl = document.getElementById('thanksTopText');
      const thanksHighlightEl = document.getElementById('thanksHighlightText');

      if (thanksTopEl && ev.agradecimiento_final.texto_superior) {
        thanksTopEl.textContent = ev.agradecimiento_final.texto_superior;
      }
      if (thanksHighlightEl && ev.agradecimiento_final.texto_destacado) {
        thanksHighlightEl.textContent = ev.agradecimiento_final.texto_destacado;
      }
    }

    // 11. Mensajes del Cronómetro
    if (ev.mensajes) {
      const headingEl = document.getElementById('countdownHeading');
      if (headingEl && ev.mensajes.faltan) {
        headingEl.textContent = `— ${ev.mensajes.faltan} —`;
      }
      if (cdFinishedMsg && ev.mensajes.cuenta_finalizada) {
        cdFinishedMsg.textContent = ev.mensajes.cuenta_finalizada;
      }
    }

    // Actualizar cronómetro inmediatamente con la nueva fecha
    updateCountdown();
  };

  // Cargar configuración de forma asíncrona desde config.json con fallback inmediato a window.APP_CONFIG
  const inicializarConfiguracion = async () => {
    // 1. Aplicación sincrónica inmediata si ya está cargado js/config.js (evita cualquier parpadeo)
    if (window.APP_CONFIG) {
      aplicarConfiguracion(window.APP_CONFIG);
    }

    // 2. Consulta asíncrona de config.json en la raíz
    try {
      const response = await fetch('config.json?v=' + Date.now());
      if (response.ok) {
        const jsonConfig = await response.json();
        if (jsonConfig && jsonConfig.evento) {
          aplicarConfiguracion(jsonConfig);
        }
      }
    } catch (e) {
      console.info('Uso de configuración fallback desde window.APP_CONFIG');
    }
  };

  /* ==========================================================================
     5. Cronómetro de Cuenta Regresiva Dinámico
     ========================================================================== */
  const updateCountdown = () => {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (cdBoxesWrap) cdBoxesWrap.style.display = 'none';
      if (cdFinishedMsg) cdFinishedMsg.style.display = 'block';
      return;
    } else {
      if (cdBoxesWrap) cdBoxesWrap.style.display = 'flex';
      if (cdFinishedMsg) cdFinishedMsg.style.display = 'none';
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, '0');
    if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, '0');
  };

  // Iniciar configuración y cronómetro
  inicializarConfiguracion();
  setInterval(updateCountdown, 1000);
});
