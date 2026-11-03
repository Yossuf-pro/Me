# موقع يوسف الشخصي

موقع عربي ثابت متعدد الصفحات مع مساعد معرفي متعدد اللغات. الشخصية والصفة المذكورة فيه خياليتان لأغراض إبداعية وليستا منصبًا أو جهة رسمية.

## تشغيل محلي

افتح `index.html` في المتصفح. صفحات الموقع لا تحتاج إلى تثبيت حزم. لاختبار مساعد الذكاء الاصطناعي محليًا، استخدم خادم تطوير Worker مع ربط AI من Cloudflare وإعداد السماح لأصل localhost.

## النشر على GitHub Pages

المستودع المستهدف: [`Yossuf-pro/Me`](https://github.com/Yossuf-pro/Me)  
الرابط المتوقع بعد إتمام النشر: <https://yossuf-pro.github.io/Me/>

يُنشر الموقع تلقائيًا بواسطة GitHub Actions عند دفع تغييرات إلى فرع `main`.

## المساعد المجاني

واجهة المساعد في `assistant.html` تعمل مع Cloudflare Worker في `worker/`. يربط Worker نموذج Cloudflare Workers AI مع مراجع موسوعة ويكيبيديا؛ لا يحتاج إلى مفتاح Gemini أو OpenAI.

التكامل لا يفرض اشتراكًا أو حدًا مدفوعًا. Cloudflare يوفّر حاليًا حصة مجانية مقدارها **10,000 Neurons في اليوم** لـ Workers AI. الحصة محدودة وتتجدد يوميًا بتوقيت UTC؛ تتوقف إجابات النموذج عند نفادها بدل الاشتراك التلقائي بخطة مدفوعة. الاستخدام مجاني ضمن هذه الحصة.

لتفعيل المساعد على الموقع العام:

1. أنشئ حساب Cloudflare مجانيًا، ثم أنشئ **API Token** محدود الصلاحيات لنشر Workers. لا تضع التوكن في ملفات الموقع ولا ترسله في المحادثات.
2. في GitHub افتح **Settings → Secrets and variables → Actions → New repository secret**، وأضف:
   - `CLOUDFLARE_API_TOKEN`: توكن النشر الخاص بك.
   - `CLOUDFLARE_ACCOUNT_ID`: معرّف حساب Cloudflare.
3. من تبويب **Actions** شغّل يدويًا **Deploy free encyclopedia AI worker** وانتظر نجاح التشغيل. عنوان Worker يظهر في تفاصيل التشغيل أو لوحة Workers & Pages.
4. في تبويب **Settings** داخل Cloudflare، انسخ نطاق `workers.dev` الكامل الذي أُسند إلى Worker. في GitHub افتح **Settings → Secrets and variables → Actions → Variables → New repository variable**، وأنشئ `AI_WORKER_URL` بقيمة أصل Worker، مثل `https://yousef-world-encyclopedia.<workers-subdomain>.workers.dev` (دون `/chat`).
5. شغّل **Publish website to GitHub Pages** من تبويب Actions، أو ادفع أي تحديث جديد إلى `main`.

تُرسل الأسئلة إلى Cloudflare AI وبحث ويكيبيديا لتحضير الإجابات. Worker يطبّق حدًا تقريبيًا قدره 10 أسئلة لكل عنوان IP في الدقيقة. لا يخزّن الموقع سجل المحادثة محليًا. النموذج قد يخطئ، والمراجع المتاحة ليست بديلًا عن التحقق أو المصادر المتخصصة. إجادة جميع لغات العالم غير مضمونة؛ المراجع تتوفر حسب اللغات المدرجة في الواجهة.

## قبل النشر العام

- غيّر `your-email@example.com` في `contact.html` و`assets/site.js` إلى بريد التواصل الذي تريده.
- الصور الخارجية من Unsplash والخطوط الخارجية تحتاج اتصالًا بالإنترنت.
- صورة الملف الشخصي داخل `assets/yousef-profile.png`؛ تأكد من رغبتك بمشاركتها في مستودع عام.
- حدّث `your-email@example.com` في `contact.html` و`assets/site.js` قبل استخدام نموذج التواصل.
- عند ربط نطاق خاص مستقبلًا، أضف النطاق إلى إعدادات Pages واضبط سجلات DNS لدى مسجل النطاق.
