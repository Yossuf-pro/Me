const chatForm = document.querySelector("[data-chat-form]");
const chatMessages = document.querySelector("[data-chat-messages]");

if (chatForm && chatMessages) {
    const input = chatForm.querySelector("[data-chat-input]");
    const sendButton = chatForm.querySelector("[data-send-button]");
    const status = document.querySelector("[data-chat-status]");
    const availability = document.querySelector("[data-api-availability]");
    const sourceLanguage = document.querySelector("[data-source-language]");
    const clearButton = document.querySelector("[data-chat-clear]");
    const suggestionButtons = [...document.querySelectorAll("[data-prompt]")];
    const apiUrl = typeof window.YOUSEF_AI_API_URL === "string" ? window.YOUSEF_AI_API_URL.trim() : "";
    const conversation = [];
    let isSending = false;

    const makeMessage = (role, text, sources = []) => {
        const article = document.createElement("article");
        article.className = `chat-message ${role === "user" ? "user-message" : "assistant-message"}`;

        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.textContent = role === "user" ? "ي" : "✳";

        const content = document.createElement("div");
        content.className = "message-content";

        const meta = document.createElement("div");
        meta.className = "message-meta";
        meta.textContent = role === "user" ? "أنت" : "الموسوعة";
        content.append(meta);

        const paragraph = document.createElement("p");
        paragraph.className = "message-text";
        paragraph.textContent = text;
        content.append(paragraph);

        if (sources.length) {
            const sourceSection = document.createElement("div");
            sourceSection.className = "source-section";
            const label = document.createElement("span");
            label.className = "source-heading";
            label.textContent = "مراجع للاستكشاف";
            sourceSection.append(label);

            const list = document.createElement("ul");
            list.className = "source-list";
            sources.forEach((source) => {
                if (!source || typeof source.title !== "string" || typeof source.url !== "string") return;
                let parsedUrl;
                try {
                    parsedUrl = new URL(source.url);
                } catch {
                    return;
                }
                if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname.endsWith(".wikipedia.org")) return;

                const item = document.createElement("li");
                const link = document.createElement("a");
                link.href = parsedUrl.href;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = source.title;
                item.append(link);
                list.append(item);
            });
            if (list.childElementCount) {
                sourceSection.append(list);
                content.append(sourceSection);
            }
        }

        article.append(avatar, content);
        return article;
    };

    const setBusy = (busy) => {
        isSending = busy;
        input.disabled = busy;
        sendButton.disabled = busy || !apiUrl;
        sendButton.setAttribute("aria-label", busy ? "جارٍ إعداد الإجابة" : "إرسال السؤال");
        status.textContent = busy ? "أبحث وأجهّز الإجابة…" : apiUrl ? "مساعدك جاهز للأسئلة" : "ربط الخدمة مطلوب";
        chatForm.classList.toggle("is-busy", busy);
        suggestionButtons.forEach((button) => { button.disabled = busy || !apiUrl; });
        updateCounter();
    };

    const updateCounter = () => {
        let counter = chatForm.querySelector("[data-character-count]");
        if (!counter) {
            counter = document.createElement("span");
            counter.dataset.characterCount = "";
            counter.className = "character-count";
            chatForm.querySelector(".composer-bottom").prepend(counter);
        }
        counter.textContent = `${input.value.length} / 1200`;
    };

    const scrollToLatestMessage = () => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const submitQuestion = async (value) => {
        const question = value.trim();
        if (!question || isSending || !apiUrl) return;

        chatMessages.append(makeMessage("user", question));
        conversation.push({ role: "user", content: question });
        input.value = "";
        input.style.height = "";
        updateCounter();
        setBusy(true);
        scrollToLatestMessage();

        const pending = document.createElement("article");
        pending.className = "chat-message assistant-message pending-message";
        pending.innerHTML = '<div class="message-avatar">✳</div><div class="message-content"><div class="message-meta">الموسوعة</div><div class="typing-dots" aria-label="جارٍ التفكير"><span></span><span></span><span></span></div></div>';
        chatMessages.append(pending);
        scrollToLatestMessage();

        try {
            const response = await fetch(`${apiUrl.replace(/\/$/, "")}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: conversation.slice(-8),
                    sourceLanguage: sourceLanguage.value
                })
            });

            const result = await response.json().catch(() => null);
            if (!response.ok) {
                if (response.status === 429) throw new Error("وصلنا إلى سقف الاستخدام المجاني مؤقتًا. جرّب بعد إعادة ضبط الحصة اليومية.");
                if (response.status === 503) throw new Error("خدمة الذكاء الاصطناعي غير متاحة مؤقتًا أو استُهلكت حصتها اليومية.");
                if (response.status === 413) throw new Error("السؤال أو سياق المحادثة طويل جدًا. ابدأ محادثة جديدة واختصر سؤالك.");
                throw new Error(result && result.error ? result.error : "تعذّر الوصول للموسوعة الآن. حاول مرة أخرى.");
            }
            if (!result || typeof result.answer !== "string" || !result.answer.trim()) {
                throw new Error("لم تصل إجابة مفهومة من المساعد. جرّب مرة أخرى.");
            }

            conversation.push({ role: "assistant", content: result.answer });
            const answer = makeMessage("assistant", result.answer, Array.isArray(result.sources) ? result.sources : []);
            if (result.referenceSearchAvailable === false) {
                const note = document.createElement("p");
                note.className = "reference-warning";
                note.textContent = "تعذّر الوصول إلى ويكيبيديا في هذا الطلب؛ قد لا تتضمن الإجابة مراجع.";
                answer.querySelector(".message-content").append(note);
            } else if (!Array.isArray(result.sources) || result.sources.length === 0) {
                const note = document.createElement("p");
                note.className = "reference-warning";
                note.textContent = "لم تظهر مراجع مطابقة لهذا السؤال في ويكيبيديا باللغة المختارة.";
                answer.querySelector(".message-content").append(note);
            }
            pending.replaceWith(answer);
            if (result.language && result.language !== "auto") sourceLanguage.value = result.language;
            status.textContent = "وجدت إجابة — افتح المراجع للتحقق";
        } catch (error) {
            pending.replaceWith(makeMessage("assistant", error instanceof Error ? error.message : "تعذّر إكمال الطلب."));
            status.textContent = "تعذّر إكمال الطلب";
        } finally {
            setBusy(false);
            scrollToLatestMessage();
            input.focus();
        }
    };

    chatForm.addEventListener("submit", (event) => {
        event.preventDefault();
        submitQuestion(input.value);
    });

    input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
        updateCounter();
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            chatForm.requestSubmit();
        }
    });

    suggestionButtons.forEach((button) => {
        button.addEventListener("click", () => submitQuestion(button.dataset.prompt));
    });

    clearButton.addEventListener("click", () => {
        if (isSending) return;
        conversation.length = 0;
        chatMessages.replaceChildren();
        const welcome = document.createElement("article");
        welcome.className = "chat-message assistant-message welcome-message";
        welcome.innerHTML = '<div class="message-avatar">✳</div><div class="message-content"><div class="message-meta">الموسوعة <span>•</span> بداية جديدة</div><p>تم مسح محادثتك من هذه الصفحة. ما السؤال الجديد الذي تريد استكشافه؟</p><p class="message-footnote">المراجع تعينك على البحث، والنموذج قد يخطئ؛ تحقق من المعلومات المهمة.</p></div>';
        chatMessages.append(welcome);
        scrollToLatestMessage();
        input.focus();
    });

    updateCounter();
    if (!apiUrl) {
        setBusy(false);
        availability.textContent = "الخدمة تحتاج إعداد خادم Cloudflare المجاني";
        sendButton.disabled = true;
        suggestionButtons.forEach((button) => { button.disabled = true; });
    } else {
        availability.textContent = "المساعد متصل بالحصة المجانية اليومية";
        fetch(`${apiUrl.replace(/\/$/, "")}/health`)
            .then((response) => {
                if (!response.ok) throw new Error("Health check failed");
                return response.json();
            })
            .then((health) => {
                if (health.status !== "ok") throw new Error("AI binding is unavailable");
                availability.textContent = "المساعد متصل — يعمل ضمن الحصة المجانية";
            })
            .catch(() => {
                availability.textContent = "المساعد غير متاح حاليًا";
                status.textContent = "تحقق من إعداد الخدمة المجانية";
            });
    }
}
