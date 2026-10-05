(() => {
  "use strict";

  const root = document.querySelector("[data-assistant]");
  if (!root) return;

  const launcher = root.querySelector("[data-assistant-open]");
  const panel = root.querySelector("#assistant-panel");
  const closeButton = root.querySelector("[data-assistant-close]");
  const log = root.querySelector("[data-assistant-log]");
  const welcome = root.querySelector("[data-assistant-welcome]");
  const form = root.querySelector("[data-assistant-form]");
  const input = root.querySelector("#assistant-message");
  const prompts = [...root.querySelectorAll("[data-assistant-prompt]")];
  const status = root.querySelector("[data-assistant-status]");

  const answers = new Map([
    ["Как начать заказ?", "Для первого шага достаточно описать, какую мебель вы планируете и для какого помещения. Затем обычно уточняют размеры, пожелания по материалам и задачу хранения."],
    ["Можно выбрать МДФ?", "Да, МДФ можно рассматривать как один из вариантов материала. Конкретное решение лучше выбирать с учётом внешнего вида, нагрузки и условий эксплуатации."],
    ["Можно сделать по моим размерам?", "Да, идея такого проекта — адаптация мебели под конкретное пространство. Для обсуждения понадобятся хотя бы примерные размеры и понимание того, что должно поместиться."],
    ["Какая гарантия?", "В этой публичной демо-версии подтверждённые условия гарантии не заданы. Их нужно уточнять у конкретного исполнителя."],
  ]);

  function setOpen(value) {
    panel.hidden = !value;
    launcher.setAttribute("aria-expanded", String(value));
    document.body.classList.toggle("assistant-open", value);
    if (value) input.focus();
    else launcher.focus();
  }

  function showMessage(kind, content) {
    const article = document.createElement("article");
    article.className = `assistant-message assistant-message--${kind}`;
    const paragraph = document.createElement("p");
    paragraph.textContent = content;
    article.append(paragraph);
    welcome.hidden = true;
    log.append(article);
    log.scrollTop = log.scrollHeight;
  }

  function submitMessage(message) {
    const text = message.trim();
    if (!text) return;
    showMessage("user", text);
    input.value = "";
    status.textContent = "Демо-ответ…";
    window.setTimeout(() => {
      const answer = answers.get(text) || "Это статическая демонстрация интерфейса без подключения к AI. Выберите один из тестовых вопросов выше, чтобы посмотреть сценарий ответа.";
      showMessage("assistant", answer);
      status.textContent = "";
    }, 350);
  }

  launcher.addEventListener("click", () => setOpen(true));
  closeButton.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitMessage(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  prompts.forEach((button) => button.addEventListener("click", () => submitMessage(button.dataset.assistantPrompt || "")));
})();
