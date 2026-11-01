/* ===== منطق التنقل وإدارة الشرائح وشريط التقدم ===== */
(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var current = 0;

  // أزرار التنقل (علوية وسفلية)
  var prevButtons = [
    document.getElementById("prevBtn"),
    document.getElementById("prevBtnBottom")
  ];
  var nextButtons = [
    document.getElementById("nextBtn"),
    document.getElementById("nextBtnBottom")
  ];

  var currentSlideLabel = document.getElementById("currentSlide");
  var totalSlidesLabel = document.getElementById("totalSlides");
  var progressFill = document.getElementById("progressFill");

  var FADE_MS = 200; // مدة تأثير التلاشي (يطابق CSS)
  var isAnimating = false;

  /* التحقق من التركيز داخل حقل إدخال حتى لا تتعارض الاختصارات مع الكتابة */
  function isTypingInInput() {
    var active = document.activeElement;
    if (!active) return false;
    var tag = active.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      active.isContentEditable
    );
  }

  /* تحديث واجهة الشرائح: الأزرار المعطلة، رقم الشريحة، شريط التقدم */
  function updateUI() {
    var isFirst = current === 0;
    var isLast = current === slides.length - 1;

    prevButtons.forEach(function (btn) {
      if (btn) btn.disabled = isFirst;
    });
    nextButtons.forEach(function (btn) {
      if (btn) btn.disabled = isLast;
    });

    if (currentSlideLabel) currentSlideLabel.textContent = String(current + 1);
    if (totalSlidesLabel) totalSlidesLabel.textContent = String(slides.length);

    if (progressFill) {
      var percent = ((current + 1) / slides.length) * 100;
      progressFill.style.width = percent + "%";
    }

    // تحديث حالة إمكانية الوصول
    slides.forEach(function (slide, index) {
      slide.setAttribute("aria-hidden", index === current ? "false" : "true");
    });
  }

  /* الانتقال إلى شريحة محددة مع تأثير التلاشي */
  function goTo(index, instant) {
    if (index < 0 || index >= slides.length) return;
    if (isAnimating || index === current) return;

    var from = slides[current];
    var to = slides[index];
    current = index;

    if (instant) {
      from.classList.remove("active");
      to.classList.add("active");
      updateUI();
      return;
    }

    isAnimating = true;

    // إخفاء الشريحة الحالية بتلاشي خارج
    from.classList.add("changing");
    from.style.opacity = "";

    window.setTimeout(function () {
      from.classList.remove("active", "changing");
      to.classList.add("active", "fading-in");
      to.scrollTop = 0;
      updateUI();

      window.setTimeout(function () {
        to.classList.remove("fading-in");
        isAnimating = false;
      }, FADE_MS);
    }, FADE_MS);
  }

  function goToSlideNumber(n) {
    goTo(n - 1);
  }

  function nextSlide() {
    goTo(current + 1);
  }

  function prevSlide() {
    goTo(current - 1);
  }

  /* ---------- ربط الأحداث ---------- */

  // أزرار «السابق» و«التالي»
  nextButtons.forEach(function (btn) {
    if (btn) btn.addEventListener("click", nextSlide);
  });
  prevButtons.forEach(function (btn) {
    if (btn) btn.addEventListener("click", prevSlide);
  });

  // اختصارات لوحة المفاتيح
  document.addEventListener("keydown", function (event) {
    if (isTypingInInput()) return; // عدم تعطيل الكتابة في الحقول

    switch (event.key) {
      case "ArrowLeft": // RTL: السهم الأيسر = التالي
        event.preventDefault();
        nextSlide();
        break;
      case "ArrowRight": // RTL: السهم الأيمن = السابق
        event.preventDefault();
        prevSlide();
        break;
      case " ":
      case "Spacebar":
        event.preventDefault();
        nextSlide();
        break;
      case "PageDown":
        event.preventDefault();
        nextSlide();
        break;
      case "PageUp":
        event.preventDefault();
        prevSlide();
        break;
      case "Home":
        event.preventDefault();
        goToSlideNumber(1);
        break;
      case "End":
        event.preventDefault();
        goToSlideNumber(slides.length);
        break;
    }
  });

  // التهيئة الأولية عند التحميل
  function init() {
    updateUI();
    goToSlideNumber(1);
    // تأكد من التهيئة الصحيحة لشريط التقدم
    if (progressFill) {
      progressFill.style.transition = "none";
      progressFill.style.width = (1 / slides.length) * 100 + "%";
      // إرجاع الانتقال بعد أول إطار لتفادي قفزة مرئية عند التحميل
      window.requestAnimationFrame(function () {
        progressFill.style.transition = "";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
