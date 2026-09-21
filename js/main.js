(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js-ready");

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mainNav = document.querySelector("#site-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setMenuState = (isOpen) => {
    if (!menuToggle || !mainNav) return;

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    mainNav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  mainNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("click", (event) => {
    if (!mainNav?.classList.contains("is-open")) return;
    if (mainNav.contains(event.target) || menuToggle?.contains(event.target)) return;
    setMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuState(false);
  });

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const sectionLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')].filter(
    (link) => link.getAttribute("href") !== "#contact",
  );
  const sectionIds = sectionLinks
    .map((link) => link.getAttribute("href"))
    .filter(Boolean)
    .map((href) => href.slice(1));

  if ("IntersectionObserver" in window && sectionIds.length) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sectionLinks.forEach((link) => {
            link.toggleAttribute("aria-current", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) activeObserver.observe(section);
    });
  }

  const leadForm = document.querySelector("#lead-form");
  const formSuccess = document.querySelector("#form-success");
  const formStatus = document.querySelector("#form-status");

  const getErrorNode = (key) => document.querySelector(`[data-error-for="${key}"]`);

  const getErrorContainer = (key) => {
    if (key === "contactMethod") return document.querySelector(".contact-method");
    if (key === "demo-consent") return document.querySelector(".consent-option");
    return document.getElementById(key)?.closest(".field");
  };

  const setFieldError = (key, message) => {
    const errorNode = getErrorNode(key);
    const container = getErrorContainer(key);
    const control = document.getElementById(key);

    if (errorNode) errorNode.textContent = message;
    container?.classList.toggle("has-error", Boolean(message));

    if (control) {
      if (message) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    }
  };

  const clearErrors = () => {
    ["furniture-type", "room", "dimensions", "budget", "name", "phone", "contactMethod", "demo-consent"].forEach((key) => {
      setFieldError(key, "");
    });
  };

  const validateForm = () => {
    let isValid = true;
    let firstInvalid = null;

    const requiredFields = [
      ["furniture-type", "Выберите тип мебели"],
      ["room", "Укажите помещение"],
      ["dimensions", "Добавьте примерные размеры или задачу"],
      ["budget", "Выберите ориентир"],
      ["name", "Напишите, как к вам обращаться"],
    ];

    requiredFields.forEach(([id, message]) => {
      const control = document.getElementById(id);
      const hasValue = Boolean(control?.value.trim());
      setFieldError(id, hasValue ? "" : message);
      if (!hasValue) {
        isValid = false;
        firstInvalid ||= control;
      }
    });

    const phone = document.getElementById("phone");
    const phoneDigits = phone?.value.replace(/\D/g, "") || "";
    const phoneMessage = phoneDigits.length >= 10 ? "" : "Укажите телефон для связи";
    setFieldError("phone", phoneMessage);
    if (phoneMessage) {
      isValid = false;
      firstInvalid ||= phone;
    }

    const method = leadForm?.querySelector('input[name="contactMethod"]:checked');
    setFieldError("contactMethod", method ? "" : "Выберите способ связи");
    if (!method) {
      isValid = false;
      firstInvalid ||= leadForm?.querySelector('input[name="contactMethod"]');
    }

    const consent = document.getElementById("demo-consent");
    setFieldError("demo-consent", consent?.checked ? "" : "Нужно подтвердить demo-режим формы");
    if (!consent?.checked) {
      isValid = false;
      firstInvalid ||= consent;
    }

    if (!isValid) {
      if (formStatus) formStatus.textContent = "Проверьте отмеченные поля и попробуйте ещё раз.";
      firstInvalid?.focus();
    }

    return isValid;
  };

  leadForm?.querySelectorAll("input, select").forEach((control) => {
    const key = control.name === "contactMethod" ? "contactMethod" : control.id;
    const eventName = control.type === "radio" || control.type === "checkbox" || control.tagName === "SELECT" ? "change" : "input";
    control.addEventListener(eventName, () => setFieldError(key, ""));
  });

  leadForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    if (!validateForm()) return;

    const name = document.getElementById("name")?.value.trim() || "друг";
    const successName = formSuccess?.querySelector("[data-success-name]");
    if (successName) successName.textContent = name;

    leadForm.hidden = true;
    if (formSuccess) formSuccess.hidden = false;
    if (formStatus) formStatus.textContent = "Demo-заявка собрана. Данные не отправлялись.";
    formSuccess?.focus();
  });

  document.querySelector("[data-reset-form]")?.addEventListener("click", () => {
    leadForm?.reset();
    clearErrors();
    if (formSuccess) formSuccess.hidden = true;
    if (leadForm) leadForm.hidden = false;
    formStatus?.replaceChildren();
    document.getElementById("furniture-type")?.focus();
  });

  const focusContactForm = (methodValue) => {
    const method = [...document.querySelectorAll('input[name="contactMethod"]')].find(
      (input) => input.value === methodValue,
    );
    if (method) method.checked = true;

    setMenuState(false);
    const contactSection = document.querySelector("#contact");
    if (contactSection) {
      const scrollPaddingTop = Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      const targetTop = contactSection.getBoundingClientRect().top + window.scrollY - scrollPaddingTop;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
    }
    window.setTimeout(() => {
      document.getElementById("furniture-type")?.focus({ preventScroll: true });
      if (contactSection) {
        const scrollPaddingTop = Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
        const targetTop = contactSection.getBoundingClientRect().top + window.scrollY - scrollPaddingTop;
        window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
      }
    }, reduceMotion.matches ? 0 : 500);
  };

  document.querySelectorAll("[data-open-contact]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      focusContactForm(trigger.getAttribute("data-contact-method") || "Мессенджер");
    });
  });
})();
