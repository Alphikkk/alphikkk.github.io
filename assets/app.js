/* =========================================================
   Corphik – společný skript pro všechny stránky
   ========================================================= */

/* ===== NASTAVENÍ ===== */
const EMAIL = "ales@corphik.eu";
/* Volitelné: klíč z web3forms.com – pak se objednávky odesílají rovnou na tvůj e-mail.
   Když je prázdný, objednávka se dokončí odesláním z e-mailu zákazníka. */
const WEB3FORMS_KEY = "2d1be97d-5752-427f-bbf3-e49d1acd0b37";

/* ===== SLUŽBY A CENY – uprav podle sebe (remote:true = jde i na dálku) =====
   tag:"partial" = štítek „Částečně na dálku“, tag:false = štítek se nezobrazí (služba jde na dálku dál)
   onlyRemote:true = jde jen na dálku (štítek „Pouze na dálku“, v objednávce nejde zvolit „Osobně“)
   build = hlavní služba nahoře s fotkami (BUILD_IMGS), ostatní se vypíšou jako ceník s ikonkou (SVC_ICONS)
   czk = číslo z ceny „od“ (jen pro orientační odhad v poptávce), hourly:true = cena za hodinu
   POZOR: když tu něco změníš, uprav stejný text i v index.html, en/index.html a es/index.html
   (texty v HTML jsou pro Google; po načtení je skript stejně vykreslí znovu) */
const SERVICES = [
 { id:"build", czk:1500, remote:false,
   price:{cs:"od 1 500 Kč",en:"from CZK 1,500 (≈ €60)",es:"desde 1.500 CZK (≈ 60 €)"},
   name:{cs:"Sestavení PC na míru",en:"Custom PC build",es:"PC a medida"},
   desc:{cs:"Vyberu komponenty podle rozpočtu a účelu (hry, práce, škola), PC sestavím a otestuju.",
         en:"I pick parts for your budget and needs (gaming, work, school), then build and test the PC.",
         es:"Elijo los componentes según tu presupuesto y uso (juegos, trabajo, estudios), monto el PC y lo pruebo."} },
 { id:"os", czk:700, remote:false,
   price:{cs:"od 700 Kč",en:"from CZK 700 (≈ €28)",es:"desde 700 CZK (≈ 28 €)"},
   name:{cs:"Instalace Windows a Linuxu",en:"Windows & Linux installation",es:"Instalación de Windows y Linux"},
   desc:{cs:"Čistá instalace systému, ovladače, aktualizace a nastavení, aby vše fungovalo od prvního spuštění. Licence Windows není v ceně.",
         en:"Clean OS install, drivers, updates and setup so everything works from the first boot. Windows licence not included.",
         es:"Instalación limpia del sistema, drivers, actualizaciones y configuración para que todo funcione desde el primer arranque. La licencia de Windows no está incluida."} },
 { id:"upgrade", czk:500, remote:false,
   price:{cs:"od 500 Kč",en:"from CZK 500 (≈ €20)",es:"desde 500 CZK (≈ 20 €)"},
   name:{cs:"Upgrade a zrychlení PC",en:"PC upgrade & speed-up",es:"Mejora y aceleración del PC"},
   desc:{cs:"Výměna disku, RAM nebo grafiky, vyčištění a nová teplovodivá pasta. Díly se platí zvlášť.",
         en:"New SSD, RAM or graphics card, cleaning and fresh thermal paste. Parts are paid separately.",
         es:"Cambio de SSD, RAM o tarjeta gráfica, limpieza y pasta térmica nueva. Las piezas se pagan aparte."} },
 { id:"fix", czk:400, remote:true, tag:"partial",
   price:{cs:"od 400 Kč",en:"from CZK 400 (≈ €16)",es:"desde 400 CZK (≈ 16 €)"},
   name:{cs:"Diagnostika a opravy",en:"Diagnostics & repairs",es:"Diagnóstico y reparación"},
   desc:{cs:"PC nejde zapnout, padá, je pomalé nebo hlučné? Najdu příčinu a vyřeším ji. Cena diagnostiky se odečte z opravy.",
         en:"PC won't start, crashes, runs slow or loud? I'll find the cause and fix it. The diagnostics fee is deducted from the repair price.",
         es:"¿El PC no enciende, se cuelga, va lento o hace ruido? Encuentro la causa y lo soluciono. El coste del diagnóstico se descuenta de la reparación."} },
 { id:"dns", czk:800, remote:true, onlyRemote:true,
   price:{cs:"od 800 Kč",en:"from CZK 800 (≈ €32)",es:"desde 800 CZK (≈ 32 €)"},
   name:{cs:"Nastavení domény a DNS",en:"Domain & DNS setup",es:"Configuración de dominio y DNS"},
   desc:{cs:"Záznamy A, AAAA, CNAME, MX a TXT (SPF, DKIM, DMARC). Propojím doménu s webem i e-mailem.",
         en:"A, AAAA, CNAME, MX and TXT records (SPF, DKIM, DMARC). I'll connect your domain to your website and email.",
         es:"Registros A, AAAA, CNAME, MX y TXT (SPF, DKIM, DMARC). Conecto tu dominio con tu web y tu correo."} },
 { id:"web", czk:3499, remote:true,
   price:{cs:"od 3 499 Kč",en:"from CZK 3,499 (≈ €140)",es:"desde 3.499 CZK (≈ 140 €)"},
   name:{cs:"Redesign webu",en:"Website redesign",es:"Rediseño web"},
   desc:{cs:"Starý web předělám do moderní podoby: nový vzhled, mobilní verze, rychlejší načítání a základní zabezpečení.",
         en:"I turn an outdated website into a modern one: fresh design, mobile version, faster loading and basic security.",
         es:"Convierto una web anticuada en una moderna: nuevo diseño, versión móvil, carga más rápida y seguridad básica."} },
 { id:"remote", czk:400, hourly:true, remote:true, tag:false,
   price:{cs:"400 Kč / hod",en:"CZK 400 / hour (≈ €16)",es:"400 CZK / hora (≈ 16 €)"},
   name:{cs:"Vzdálená pomoc",en:"Remote help",es:"Ayuda a distancia"},
   desc:{cs:"Připojím se k tvému počítači přes internet a vyřeším problém, nastavení nebo instalaci programů – ať jsi kdekoli. Účtuje se každých započatých 15 minut.",
         en:"I connect to your computer over the internet and sort out problems, settings or software installs – wherever you are. Billed per started 15 minutes.",
         es:"Me conecto a tu ordenador de forma remota para solucionar problemas, configurar ajustes e instalar programas, estés donde estés. ¡Asistencia informática rápida, cómoda y sin necesidad de desplazarte! Se factura por cada 15 minutos iniciados."} }
];

const T = {
cs:{
 "ck.title":"Objednávka","ck.sub":"Vyplň pár údajů. Ozvu se ti co nejdřív a domluvíme detaily.",
 "ck.s1":"Kontakt","ck.s2":"Co potřebuješ","ck.s3":"Kde a kdy",
 "ck.name":"Jméno a příjmení","ck.email":"E-mail","ck.phone":"Telefon (nepovinné)","ck.service":"Služba",
 "ck.msg":"Popiš, co potřebuješ","ck.msgPh":"Např.: počítač se nezapne / chci herní sestavu do 25 000 Kč / pomalý notebook…",
 "ck.mode":"Jak to chceš vyřešit?","ck.onsite":"Osobně","ck.remote":"Na dálku","ck.remoteNa":"Tuhle službu dělám jen osobně.",
 "ck.address":"Adresa nebo město","ck.when":"Kdy se ti to hodí? (nepovinné)","ck.whenPh":"Např. v týdnu po 17:00, o víkendu…",
 "ck.consent":"Souhlasím se zpracováním uvedených údajů za účelem vyřízení objednávky.",
 "ck.submit":"Odeslat objednávku","ck.sending":"Odesílám…",
 "ck.err":"Vyplň prosím jméno, e-mail a popis a potvrď souhlas.","ck.errEmail":"Zkontroluj prosím, jestli je e-mail správně.","ck.errAddr":"Vyplň prosím adresu nebo město.",
 "ck.fail":"Objednávku se nepodařilo odeslat. Zkus to prosím znovu.",
 "ck.sum":"Shrnutí","ck.price":"Orientační cena","ck.payH":"Platba až po dokončení","ck.pay":"Nic neplatíš předem. Cenu potvrdíme před začátkem práce a platí se až po jejím dokončení.",
 "ck.secure":"Údaje použiju jen k vyřízení objednávky.","ck.change":"Změnit",
 "th.title":"Díky, objednávka je odeslaná!","th.p":"Ozvu se ti co nejdřív na e-mail nebo telefon, který jsi zadal.",
 "th.mailH":"Ještě poslední krok","th.mailP":"Odešli objednávku ze svého e-mailu, ať mi určitě dorazí.","th.mailBtn":"Odeslat e-mailem",
 "th.next":"Co bude dál","th.home":"Zpět na úvod","th.none":"Žádnou objednávku tu nevidím.","th.order":"Vytvořit objednávku",
 "f.email":"E-mail","f.phone":"Telefon","f.mode":"Způsob","f.addr":"Adresa","f.price":"Cena",
 "ft.contact":"Kontakt",
 "nav.portfolio":"Portfolio","pf.h":"Portfolio","pf.all":"Vše","pf.web":"Weby","pf.pc":"Počítače","pf.wip":"Ve vývoji","pf.view":"Otevřít",
 "nav.home":"Služby","nav.about":"O mně","nav.order":"Objednat","theme.dark":"Přepnout na tmavý režim","theme.light":"Přepnout na světlý režim",
 "h.area":"IT podpora v Praze a okolí, i na dálku",
 "h.title":"Výkon na oběžné dráze.",
 "h.lead":"Sestavím, nainstaluju, opravím, zabezpečím a předělám web. Osobně v Praze a okolí, nebo na dálku odkudkoli.",
 "h.cta":"Objednat službu","h.cta2":"Co nabízím",
 "s.h":"Co nabízím","s.remote":"I na dálku","s.partial":"Částečně na dálku","s.only":"Pouze na dálku",
 "wip.h":"Web je ve výstavbě","wip.p":"Objednávky zatím řeším individuálně – v případě zájmu mě nejdřív kontaktuj: <a href=\"mailto:ales@corphik.eu\">ales@corphik.eu</a>","wip.close":"Zavřít upozornění","s.order":"Objednat",
 "p.h":"Jak to probíhá",
 "p.1h":"Objednáš","p.1p":"Vyplníš krátký formulář a popíšeš, co potřebuješ.",
 "p.2h":"Ozvu se","p.2p":"Domluvíme se na detailech, ceně a termínu.",
 "p.3h":"Vyřeším to","p.3p":"Udělám práci a vysvětlím ti, co jsem změnil.",
 "o.h":"Objednávka","o.p":"Napiš, s čím potřebuješ pomoct. Ozvu se co nejdřív.",
 "o.name":"Jméno","o.contact":"E-mail nebo telefon","o.service":"Služba","o.other":"Něco jiného",
 "o.msg":"Co potřebuješ?","o.when":"Kdy se ti to hodí? (nepovinné)","o.send":"Pokračovat k odeslání",
 "o.errFill":"Vyplň prosím jméno, kontakt a popis.",
 "o.doneH":"Objednávka je připravená","o.doneP":"Odešli ji e-mailem jedním klepnutím, nebo ji zkopíruj a pošli, jak chceš.",
 "o.mail":"Odeslat e-mailem","o.copy":"Zkopírovat","o.copied":"Zkopírováno",
 "o.subj":"Objednávka IT podpory",
 "ab.lead":"Dřív jsem opravoval stroje. <strong>Teď se učím, jak se rozbíjejí systémy</strong> – a jak je ochránit.",
 "r.1h":"Mechanik","r.1p":"Zemědělské stroje, nákladní auta, svařování.",
 "r.2y":"od 2026","r.2h":"Logistika","r.2p":"Team lead a administrátor v DSV, Praha.",
 "r.3y":"teď","r.3h":"Kyberbezpečnost a Tandjo","r.3p":"Mířím k penetračnímu testování a stavím vlastní produkt.",
 "ab.h":"O mně",
 "ab.p1":"Vyučil jsem se mechanikem zemědělských strojů a pár let jsem dělal s rukama – opravy, svařování, lisy. Naučilo mě to hledat, proč věci nefungují, a nevzdat se, dokud to nenajdu.",
 "ab.p2":"Dnes vedu tým v logistice, při tom dělám IT podporu, stavím Tandjo a věnuju se kyberbezpečnosti. Baví mě ofenzivní strana: pochopit systém tak dobře, abych v něm našel slabé místo dřív než někdo jiný.",
 "ab.p3":"Mluvím česky a anglicky (v práci denně), učím se španělsky.",
 "tj.role":"Zakladatel a CEO","tj.d":"Sociální síť pro páry, kterou stavím s pomocí AI.","tj.status":"Ve vývoji",
 "le.h":"Co jsem se naučil","le.goal":"Další cíl: CompTIA Security+","le.goalp":"Právě se na certifikaci připravuji.",
 "m.sep":"září 2026","m.aug":"srpen 2026","m.jul":"červenec 2026","m.ongoing":"průběžně",
 "ho.h":"Mimo práci","ho.1":"Moje sestava: Ryzen 7 5800X3D a RX 7800 XT. Čekám na Zen 6.",
 "ho.2":"Terminál, Bandit a všechno, co se dá rozebrat.","ho.3h":"Španělština","ho.3":"Učím se třetí jazyk.",
 "f.name":"Jméno","f.contact":"Kontakt","f.service":"Služba","f.when":"Termín","f.msg":"Popis"
},
en:{
 "ck.title":"Order","ck.sub":"Fill in a few details. I'll get back to you as soon as I can to sort out the rest.",
 "ck.s1":"Contact","ck.s2":"What you need","ck.s3":"Where and when",
 "ck.name":"Full name","ck.email":"Email","ck.phone":"Phone (optional)","ck.service":"Service",
 "ck.msg":"Describe what you need","ck.msgPh":"E.g.: my PC won't start / I want a gaming PC under €1,000 / slow laptop…",
 "ck.mode":"How should I help?","ck.onsite":"In person","ck.remote":"Remotely","ck.remoteNa":"This service is in person only.",
 "ck.address":"Address or town","ck.when":"When suits you? (optional)","ck.whenPh":"E.g. weekdays after 5 pm, at the weekend…",
 "ck.consent":"I agree to my details being processed to handle this order.",
 "ck.submit":"Place order","ck.sending":"Sending…",
 "ck.err":"Please fill in your name, email and description, and tick the consent box.","ck.errEmail":"Please check your email address.","ck.errAddr":"Please fill in your address or town.",
 "ck.fail":"The order couldn't be sent. Please try again.",
 "ck.sum":"Summary","ck.price":"Estimated price","ck.payH":"Pay when it's done","ck.pay":"Nothing to pay upfront. We agree the price before I start and you pay once the work is finished.",
 "ck.secure":"Your details are only used to handle your order.","ck.change":"Change",
 "th.title":"Thanks, your order is in!","th.p":"I'll get back to you as soon as I can by email or phone.",
 "th.mailH":"One last step","th.mailP":"Send the order from your email so it definitely reaches me.","th.mailBtn":"Send by email",
 "th.next":"What happens next","th.home":"Back to home","th.none":"There's no order here.","th.order":"Create an order",
 "f.email":"Email","f.phone":"Phone","f.mode":"Mode","f.addr":"Address","f.price":"Price",
 "ft.contact":"Contact",
 "nav.portfolio":"Portfolio","pf.h":"Portfolio","pf.all":"All","pf.web":"Websites","pf.pc":"PCs","pf.wip":"In progress","pf.view":"Open",
 "nav.home":"Services","nav.about":"About me","nav.order":"Order","theme.dark":"Switch to dark mode","theme.light":"Switch to light mode",
 "h.area":"IT support in the Prague area, and remotely",
 "h.title":"Performance in orbit.",
 "h.lead":"I build, install, repair, secure and redesign websites. In person around Prague, or remotely from anywhere.",
 "h.cta":"Order a service","h.cta2":"What I offer",
 "s.h":"What I offer","s.remote":"Remote available","s.partial":"Partly remote","s.only":"Remote only",
 "wip.h":"Site under construction","wip.p":"For now I handle orders individually – if you're interested, get in touch first: <a href=\"mailto:ales@corphik.eu\">ales@corphik.eu</a>","wip.close":"Close notice","s.order":"Order",
 "p.h":"How it works",
 "p.1h":"You order","p.1p":"Fill in a short form and describe what you need.",
 "p.2h":"I get back to you","p.2p":"We agree on the details, price and date.",
 "p.3h":"I sort it out","p.3p":"I do the work and explain what I changed.",
 "o.h":"Order","o.p":"Tell me what you need help with. I'll get back to you as soon as I can.",
 "o.name":"Name","o.contact":"Email or phone","o.service":"Service","o.other":"Something else",
 "o.msg":"What do you need?","o.when":"When suits you? (optional)","o.send":"Continue to send",
 "o.errFill":"Please fill in your name, contact and description.",
 "o.doneH":"Your order is ready","o.doneP":"Send it by email in one tap, or copy it and send it any way you like.",
 "o.mail":"Send by email","o.copy":"Copy","o.copied":"Copied",
 "o.subj":"IT support order",
 "ab.lead":"I used to fix machines. <strong>Now I'm learning how systems break</strong> – and how to protect them.",
 "r.1h":"Mechanic","r.1p":"Agricultural machinery, trucks, welding.",
 "r.2y":"since 2026","r.2h":"Logistics","r.2p":"Team lead and administrator at DSV, Prague.",
 "r.3y":"now","r.3h":"Cybersecurity & Tandjo","r.3p":"Heading toward penetration testing and building my own product.",
 "ab.h":"About me",
 "ab.p1":"I trained as an agricultural machinery mechanic and spent a few years working with my hands – repairs, welding, presses. It taught me to dig into why things don't work and not give up until I find out.",
 "ab.p2":"Today I lead a team in logistics, do IT support on the side, build Tandjo and study cybersecurity. I enjoy the offensive side: understanding a system well enough to find its weak spot before anyone else does.",
 "ab.p3":"I speak Czech and English (daily at work) and I'm learning Spanish.",
 "tj.role":"Founder & CEO","tj.d":"A social network for couples, built with the help of AI.","tj.status":"In progress",
 "le.h":"What I've learned","le.goal":"Next goal: CompTIA Security+","le.goalp":"Currently preparing for the exam.",
 "m.sep":"Sep 2026","m.aug":"Aug 2026","m.jul":"Jul 2026","m.ongoing":"ongoing",
 "ho.h":"Outside work","ho.1":"My rig: Ryzen 7 5800X3D and RX 7800 XT. Waiting for Zen 6.",
 "ho.2":"The terminal, Bandit and anything I can take apart.","ho.3h":"Spanish","ho.3":"Learning my third language.",
 "f.name":"Name","f.contact":"Contact","f.service":"Service","f.when":"Date","f.msg":"Description"
},
es:{
 "ck.title":"Pedido","ck.sub":"Rellena unos datos. Te responderé lo antes posible para concretar el resto.",
 "ck.s1":"Contacto","ck.s2":"Qué necesitas","ck.s3":"Dónde y cuándo",
 "ck.name":"Nombre y apellidos","ck.email":"Correo","ck.phone":"Teléfono (opcional)","ck.service":"Servicio",
 "ck.msg":"Describe qué necesitas","ck.msgPh":"P. ej.: mi PC no enciende / quiero un PC gaming por menos de 1.000 € / portátil lento…",
 "ck.mode":"¿Cómo te ayudo?","ck.onsite":"En persona","ck.remote":"A distancia","ck.remoteNa":"Este servicio es solo en persona.",
 "ck.address":"Dirección o ciudad","ck.when":"¿Cuándo te viene bien? (opcional)","ck.whenPh":"P. ej. entre semana después de las 17:00, el fin de semana…",
 "ck.consent":"Acepto el tratamiento de mis datos para gestionar este pedido.",
 "ck.submit":"Enviar pedido","ck.sending":"Enviando…",
 "ck.err":"Rellena tu nombre, correo y descripción, y marca la casilla de consentimiento.","ck.errEmail":"Revisa tu dirección de correo.","ck.errAddr":"Rellena tu dirección o ciudad.",
 "ck.fail":"No se pudo enviar el pedido. Inténtalo de nuevo.",
 "ck.sum":"Resumen","ck.price":"Precio orientativo","ck.payH":"Pagas al terminar","ck.pay":"No pagas nada por adelantado. Acordamos el precio antes de empezar y se paga al terminar el trabajo.",
 "ck.secure":"Tus datos solo se usan para gestionar el pedido.","ck.change":"Cambiar",
 "th.title":"¡Gracias, tu pedido está enviado!","th.p":"Te responderé lo antes posible por correo o teléfono.",
 "th.mailH":"Un último paso","th.mailP":"Envía el pedido desde tu correo para que me llegue seguro.","th.mailBtn":"Enviar por correo",
 "th.next":"Qué pasa ahora","th.home":"Volver al inicio","th.none":"Aquí no hay ningún pedido.","th.order":"Crear un pedido",
 "f.email":"Correo","f.phone":"Teléfono","f.mode":"Modo","f.addr":"Dirección","f.price":"Precio",
 "ft.contact":"Contacto",
 "nav.portfolio":"Portafolio","pf.h":"Portafolio","pf.all":"Todo","pf.web":"Webs","pf.pc":"Ordenadores","pf.wip":"En desarrollo","pf.view":"Abrir",
 "nav.home":"Servicios","nav.about":"Sobre mí","nav.order":"Contratar","theme.dark":"Cambiar a modo oscuro","theme.light":"Cambiar a modo claro",
 "h.area":"Soporte informático en Praga y alrededores, y a distancia",
 "h.title":"Tu ordenador, en buenas manos.",
 "h.lead":"Monto, instalo, reparo, protejo y rediseño webs. En persona en Praga y alrededores, o a distancia desde cualquier lugar.",
 "h.cta":"Contratar un servicio","h.cta2":"Qué ofrezco",
 "s.h":"Qué ofrezco","s.remote":"También a distancia","s.partial":"Parcialmente a distancia","s.only":"Solo a distancia",
 "wip.h":"Web en construcción","wip.p":"Por ahora gestiono los pedidos de forma individual: si te interesa, escríbeme primero a <a href=\"mailto:ales@corphik.eu\">ales@corphik.eu</a>","wip.close":"Cerrar aviso","s.order":"Contratar",
 "p.h":"Cómo funciona",
 "p.1h":"Haces el pedido","p.1p":"Rellenas un formulario corto y describes lo que necesitas.",
 "p.2h":"Te contacto","p.2p":"Acordamos los detalles, el precio y la fecha.",
 "p.3h":"Lo soluciono","p.3p":"Hago el trabajo y te explico qué he cambiado.",
 "o.h":"Pedido","o.p":"Cuéntame con qué necesitas ayuda. Te responderé lo antes posible.",
 "o.name":"Nombre","o.contact":"Correo o teléfono","o.service":"Servicio","o.other":"Otra cosa",
 "o.msg":"¿Qué necesitas?","o.when":"¿Cuándo te viene bien? (opcional)","o.send":"Continuar al envío",
 "o.errFill":"Rellena tu nombre, contacto y descripción, por favor.",
 "o.doneH":"Tu pedido está listo","o.doneP":"Envíalo por correo con un toque, o cópialo y envíalo como prefieras.",
 "o.mail":"Enviar por correo","o.copy":"Copiar","o.copied":"Copiado",
 "o.subj":"Pedido de soporte informático",
 "ab.lead":"Antes reparaba máquinas. <strong>Ahora aprendo cómo se rompen los sistemas</strong>, y cómo protegerlos.",
 "r.1h":"Mecánico","r.1p":"Maquinaria agrícola, camiones, soldadura.",
 "r.2y":"desde 2026","r.2h":"Logística","r.2p":"Jefe de equipo y administrador en DSV, Praga.",
 "r.3y":"ahora","r.3h":"Ciberseguridad y Tandjo","r.3p":"Me preparo para trabajar en pruebas de penetración (pentesting) y desarrollo mi propia app, Tandjo.",
 "ab.h":"Sobre mí",
 "ab.p1":"Me formé como mecánico de maquinaria agrícola y pasé unos años trabajando con las manos: reparaciones, soldadura, prensas. Aprendí a buscar por qué algo no funciona y a no rendirme hasta encontrarlo.",
 "ab.p2":"Hoy dirijo un equipo en logística, ofrezco soporte informático, construyo Tandjo y estudio ciberseguridad. Me atrae el lado ofensivo: entender un sistema tan bien como para encontrar su punto débil antes que nadie.",
 "ab.p3":"Hablo checo e inglés (a diario en el trabajo) y estoy aprendiendo español.",
 "tj.role":"Fundador y CEO","tj.d":"Una red social para parejas, creada con ayuda de la IA.","tj.status":"En desarrollo",
 "le.h":"Lo que he aprendido","le.goal":"Próximo objetivo: CompTIA Security+","le.goalp":"Me estoy preparando para el examen.",
 "m.sep":"sep. 2026","m.aug":"ago. 2026","m.jul":"jul. 2026","m.ongoing":"en curso",
 "ho.h":"Fuera del trabajo","ho.1":"Mi equipo: Ryzen 7 5800X3D y RX 7800 XT. Esperando a Zen 6.",
 "ho.2":"La terminal, Bandit y todo lo que se pueda desmontar.","ho.3h":"Español","ho.3":"Aprendiendo mi tercer idioma.",
 "f.name":"Nombre","f.contact":"Contacto","f.service":"Servicio","f.when":"Fecha","f.msg":"Descripción"
}};

/* ===== Texty nového úvodu (redesign) ===== */
Object.assign(T.cs,{
 "ck.country":"Kde se nacházíš?","ck.cz":"Česko","ck.es":"Španělsko","ck.eu":"Jiná země v Evropě",
 "ck.abroadRemote":"Mimo Česko zatím pomáhám jen na dálku.",
 "ck.abroadNa":"Tuhle službu zatím dělám jen v Česku. Mimo Česko si vyber službu, která jde na dálku.",
 "f.country":"Země",
 "h.lead":"IT podpora a stavba PC na míru.",
 "h.r1":"Česko: osobně i na dálku","h.r2":"Španělsko a zbytek Evropy: zatím na dálku",
 "s.big":"Všechno kolem počítače. Na jednom místě.",
 "bd.1h":"Záloha na komponenty předem","bd.1p":"Díly objednám až po zaplacení zálohy.",
 "bd.2h":"Stavba a testy u mě doma","bd.2p":"Počítač sestavím a otestuju u sebe.",
 "bd.3h":"Dovoz hotového PC až k tobě","bd.3p":"Otestovanou sestavu ti přivezu. Po Praze a okolí v ceně, dál podle domluvy.",
 "cta.h":"Pojďme to rozjet.","cta.p":"Napiš mi, co potřebuješ. Ozvu se ti co nejdřív.",
 "ck.payHb":"Záloha na komponenty předem",
 "ck.payb":"U sestavení PC zaplatíš předem zálohu na komponenty, abych je mohl objednat. Zbytek ceny se platí při předání hotového počítače."
});
Object.assign(T.en,{
 "ck.country":"Where are you based?","ck.cz":"Czechia","ck.es":"Spain","ck.eu":"Another European country",
 "ck.abroadRemote":"Outside Czechia I only help remotely for now.",
 "ck.abroadNa":"For now I only offer this service in Czechia. Outside Czechia, please pick a service that can be done remotely.",
 "f.country":"Country",
 "h.lead":"IT support and custom PC builds.",
 "h.r1":"Czechia: in person or remotely","h.r2":"Spain and Europe: remote for now",
 "s.big":"Everything your computer needs. In one place.",
 "bd.1h":"Deposit for parts up front","bd.1p":"I order the parts once the deposit is paid.",
 "bd.2h":"Built and tested at my place","bd.2p":"I assemble and test the PC myself.",
 "bd.3h":"Delivered to your door","bd.3p":"The tested PC is brought right to you. Free around Prague, further by arrangement.",
 "cta.h":"Let's get it done.","cta.p":"Tell me what you need. I'll get back to you as soon as I can.",
 "ck.payHb":"Deposit for parts up front",
 "ck.payb":"For a PC build you pay a deposit for the parts up front so I can order them. The rest is paid when the finished PC is handed over."
});
Object.assign(T.es,{
 "ck.country":"¿Dónde estás?","ck.cz":"Chequia","ck.es":"España","ck.eu":"Otro país de Europa",
 "ck.abroadRemote":"Fuera de Chequia, por ahora solo ayudo a distancia.",
 "ck.abroadNa":"Por ahora este servicio solo lo ofrezco en Chequia. Fuera de Chequia, elige un servicio que se pueda hacer a distancia.",
 "f.country":"País",
 "h.lead":"Soporte informático y PC a medida.",
 "h.r1":"Chequia: en persona o a distancia","h.r2":"España y Europa: por ahora a distancia",
 "s.big":"Todo lo que necesita tu ordenador. En un solo lugar.",
 "bd.1h":"Anticipo para los componentes","bd.1p":"Pido las piezas en cuanto se paga el anticipo.",
 "bd.2h":"Montaje y pruebas","bd.2p":"Monto y pruebo el PC yo mismo.",
 "bd.3h":"Te lo llevo a casa","bd.3p":"Te entrego el equipo ya probado. Gratis en Praga y alrededores; más lejos, según acuerdo.",
 "cta.h":"Manos a la obra.","cta.p":"Cuéntame qué necesitas. Te respondo lo antes posible.",
 "ck.payHb":"Anticipo para los componentes",
 "ck.payb":"En el montaje de un PC pagas por adelantado un anticipo para los componentes, para que pueda pedirlos. El resto se paga al entregar el equipo terminado."
});

/* ===== Černá díra na úvodu (rozcestník) a ukázky portfolia ===== */
Object.assign(T.cs,{"bh.open":"Otevřít rozcestník","bh.close":"Zavřít rozcestník","pf.more":"Celé portfolio"});
Object.assign(T.en,{"bh.open":"Open quick navigation","bh.close":"Close quick navigation","pf.more":"See the full portfolio"});
Object.assign(T.es,{"bh.open":"Abrir navegación rápida","bh.close":"Cerrar navegación rápida","pf.more":"Ver todo el portafolio"});

/* ===== Košík ===== */
Object.assign(T.cs,{
  "h.seo":"Corphik – IT podpora a stavba PC na míru",
  "cart.add":"Do košíku","cart.added":"V košíku","nav.cart":"Košík",
  "ck.s2":"Košík","ck.items":"Vybrané služby (můžeš přidat i odebrat)","ck.empty":"Košík je prázdný. Přidej službu tady nebo na úvodní stránce.",
  "ck.errItems":"Vyber prosím aspoň jednu službu.","ck.mixed":"Služby, které dělám jen na dálku, vyřeším přes internet, zbytek osobně.",
  "ck.remoteNa":"Některou z vybraných služeb dělám jen osobně.",
  "ck.abroadNa":"Některou z vybraných služeb zatím dělám jen v Česku. Mimo Česko si nech v košíku jen služby, které jdou na dálku.",
  "f.services":"Služby"
});
Object.assign(T.en,{
  "h.seo":"Corphik – IT support and custom PC builds",
  "cart.add":"Add to cart","cart.added":"In cart","nav.cart":"Cart",
  "ck.s2":"Cart","ck.items":"Selected services (add or remove any)","ck.empty":"Your cart is empty. Add a service here or on the home page.",
  "ck.errItems":"Please pick at least one service.","ck.mixed":"Remote-only services I'll handle online, the rest in person.",
  "ck.remoteNa":"One of the selected services can only be done in person.",
  "ck.abroadNa":"One of the selected services is only available in Czechia for now. Outside Czechia, keep only services that can be done remotely.",
  "f.services":"Services"
});
Object.assign(T.es,{
  "h.seo":"Corphik – Soporte informático y PC a medida",
  "cart.add":"Carrito","cart.added":"En el carrito","nav.cart":"Carrito",
  "ck.s2":"Carrito","ck.items":"Servicios elegidos (puedes añadir o quitar)","ck.empty":"El carrito está vacío. Añade un servicio aquí o en la página de inicio.",
  "ck.errItems":"Elige al menos un servicio.","ck.mixed":"Los servicios que solo hago a distancia los resolveré online y el resto en persona.",
  "ck.remoteNa":"Alguno de los servicios elegidos solo lo hago en persona.",
  "ck.abroadNa":"Por ahora, alguno de los servicios elegidos solo lo ofrezco en Chequia. Fuera de Chequia, deja en el carrito solo servicios a distancia.",
  "f.services":"Servicios"
});

/* ===== Poptávka: kroky, volby u služeb, odhad ceny (přepisuje i starší texty „objednávky“) ===== */
Object.assign(T.cs,{
 "ck.title":"Poptávka","ck.sub":"Vyber služby, upřesni detaily a pošli nezávaznou poptávku. Ozvu se a domluvíme cenu i termín.",
 "ck.step1":"Vyber služby","ck.step2":"Upřesni detaily","ck.step2e":"Detaily se objeví, jakmile vybereš službu.",
 "ck.step3":"Kontakt a místo","ck.step4":"Zkontroluj a odešli",
 "ck.otherP":"Cena podle domluvy","ck.otherN":"Popiš to prosím ve zprávě v kroku 3.",
 "ck.remove":"Odebrat","ck.edit":"Upravit","ck.less":"Méně","ck.more":"Víc",
 "ck.est":"Odhad od","ck.estNote":"Ceny jsou orientační (od). Přesnou cenu potvrdím před začátkem práce. Vzdálená pomoc se účtuje po započatých 15 minutách.",
 "ck.msgOpt":"Ještě něco dalšího? (nepovinné)","ck.selected":"vybráno","ck.review":"Zkontrolovat",
 "ck.reviewP":"Takhle mi poptávka dorazí:",
 "ck.honest":"Odesláním nic neobjednáváš ani neplatíš. Ozvu se a potvrdíme cenu a termín.",
 "ck.submit":"Odeslat poptávku","ck.consent":"Souhlasím se zpracováním uvedených údajů za účelem vyřízení poptávky.",
 "ck.fail":"Poptávku se nepodařilo odeslat. Zkus to prosím znovu, nebo napiš na ales@corphik.eu.",
 "ck.secure":"Údaje použiju jen k vyřízení poptávky.","ck.empty":"Zatím nic. Vyber službu v kroku 1.",
 "ck.errName":"Vyplň prosím jméno.","ck.errEmailE":"Vyplň prosím e-mail, ať ti můžu odpovědět.",
 "ck.errMsg":"Popiš prosím, s čím potřebuješ pomoct.","ck.errConsent":"Potvrď prosím souhlas se zpracováním údajů.",
 "ck.errSee":"Zkontroluj prosím označená pole.",
 "op.use":"K čemu bude počítač sloužit?","op.use.gaming":"Hry","op.use.work":"Práce","op.use.school":"Škola",
 "op.budget":"Rozpočet na komponenty (nepovinné)","op.budget.ph":"Např. 25 000 Kč",
 "op.have":"Díly, které už máš (nepovinné)","op.have.ph":"Např. skříň a zdroj ze starého PC",
 "op.os":"Systém","op.os.win":"Windows","op.os.linux":"Linux","op.os.unsure":"Nevím, poraď mi",
 "op.dev":"Počet počítačů",
 "op.parts":"Co chceš vylepšit?","op.parts.ssd":"Disk (SSD)","op.parts.ram":"RAM","op.parts.gpu":"Grafika","op.parts.clean":"Čištění a nová pasta",
 "op.sym":"Co se děje?","op.sym.dead":"Nejde zapnout","op.sym.crash":"Padá","op.sym.slow":"Je pomalé","op.sym.loud":"Je hlučné",
 "op.need":"Co propojit?","op.need.site":"Web","op.need.mail":"E-mail","op.need.auth":"SPF, DKIM, DMARC",
 "op.domain":"Doména (nepovinné)","op.domain.ph":"Např. mojefirma.cz",
 "op.goals":"Na čem ti nejvíc záleží?","op.goals.look":"Nový vzhled","op.goals.mobile":"Mobilní verze","op.goals.speed":"Rychlejší načítání","op.goals.sec":"Základní zabezpečení",
 "op.url":"Současný web (nepovinné)","op.url.ph":"Např. mojefirma.cz",
 "op.hours":"Odhad hodin",
 "th.title":"Poptávka odeslaná","th.ready":"Poptávka je připravená",
 "th.p":"Zatím nic není objednané ani zaplacené. Ozvu se ti co nejdřív na e-mail nebo telefon a potvrdíme cenu a termín.",
 "th.mailP":"Odešli ji ze svého e-mailu, ať mi určitě dorazí.","th.none":"Žádnou poptávku tu nevidím.","th.order":"Vytvořit poptávku",
 "o.subj":"Poptávka IT podpory"
});
Object.assign(T.en,{
 "ck.title":"Request","ck.sub":"Pick services, add the details and send a no-obligation request. I'll get back to you to agree the price and date.",
 "ck.step1":"Choose services","ck.step2":"Add the details","ck.step2e":"Details appear once you pick a service.",
 "ck.step3":"Contact and location","ck.step4":"Review and send",
 "ck.otherP":"Price by arrangement","ck.otherN":"Please describe it in the message in step 3.",
 "ck.remove":"Remove","ck.edit":"Edit","ck.less":"Fewer","ck.more":"More",
 "ck.est":"Estimate from","ck.estNote":"Prices are starting prices. I'll confirm the exact price before I start. Remote help is billed per started 15 minutes.",
 "ck.msgOpt":"Anything else? (optional)","ck.selected":"selected","ck.review":"Review",
 "ck.reviewP":"This is what I'll receive:",
 "ck.honest":"Sending this doesn't book or charge anything. I'll get back to you to confirm the price and date.",
 "ck.submit":"Send request","ck.consent":"I agree to my details being processed to handle this request.",
 "ck.fail":"The request couldn't be sent. Please try again or email ales@corphik.eu.",
 "ck.secure":"Your details are only used to handle your request.","ck.empty":"Nothing yet. Pick a service in step 1.",
 "ck.errName":"Please fill in your name.","ck.errEmailE":"Please fill in your email so I can reply.",
 "ck.errMsg":"Please describe what you need help with.","ck.errConsent":"Please tick the consent box.",
 "ck.errSee":"Please check the highlighted fields.",
 "op.use":"What will the PC be used for?","op.use.gaming":"Gaming","op.use.work":"Work","op.use.school":"School",
 "op.budget":"Budget for parts (optional)","op.budget.ph":"E.g. CZK 25,000",
 "op.have":"Parts you already have (optional)","op.have.ph":"E.g. the case and power supply from my old PC",
 "op.os":"System","op.os.win":"Windows","op.os.linux":"Linux","op.os.unsure":"Not sure, advise me",
 "op.dev":"Number of computers",
 "op.parts":"What would you like to upgrade?","op.parts.ssd":"Drive (SSD)","op.parts.ram":"RAM","op.parts.gpu":"Graphics card","op.parts.clean":"Cleaning and thermal paste",
 "op.sym":"What's happening?","op.sym.dead":"Won't start","op.sym.crash":"Crashes","op.sym.slow":"Runs slow","op.sym.loud":"Loud",
 "op.need":"What should I connect?","op.need.site":"Website","op.need.mail":"Email","op.need.auth":"SPF, DKIM, DMARC",
 "op.domain":"Domain (optional)","op.domain.ph":"E.g. mybusiness.com",
 "op.goals":"What matters most?","op.goals.look":"Fresh design","op.goals.mobile":"Mobile version","op.goals.speed":"Faster loading","op.goals.sec":"Basic security",
 "op.url":"Current website (optional)","op.url.ph":"E.g. mybusiness.com",
 "op.hours":"Estimated hours",
 "th.title":"Request sent","th.ready":"Your request is ready",
 "th.p":"Nothing is booked or paid yet. I'll get back to you by email or phone as soon as I can to confirm the price and date.",
 "th.mailP":"Send it from your email so it definitely reaches me.","th.none":"There's no request here.","th.order":"Create a request",
 "o.subj":"IT support request"
});
Object.assign(T.es,{
 "ck.title":"Solicitud","ck.sub":"Elige servicios, añade los detalles y envía una solicitud sin compromiso. Te responderé para acordar el precio y la fecha.",
 "ck.step1":"Elige los servicios","ck.step2":"Añade los detalles","ck.step2e":"Los detalles aparecen al elegir un servicio.",
 "ck.step3":"Contacto y lugar","ck.step4":"Revisa y envía",
 "ck.otherP":"Precio a convenir","ck.otherN":"Descríbelo en el mensaje del paso 3.",
 "ck.remove":"Quitar","ck.edit":"Editar","ck.less":"Menos","ck.more":"Más",
 "ck.est":"Estimación desde","ck.estNote":"Los precios son orientativos (desde). Confirmaré el precio exacto antes de empezar. La ayuda a distancia se factura por cada 15 minutos iniciados.",
 "ck.msgOpt":"¿Algo más? (opcional)","ck.selected":"seleccionados","ck.review":"Revisar",
 "ck.reviewP":"Esto es lo que me llegará:",
 "ck.honest":"Enviar esto no reserva ni cobra nada. Te responderé para confirmar el precio y la fecha.",
 "ck.submit":"Enviar solicitud","ck.consent":"Acepto el tratamiento de mis datos para gestionar esta solicitud.",
 "ck.fail":"No se pudo enviar la solicitud. Inténtalo de nuevo o escribe a ales@corphik.eu.",
 "ck.secure":"Tus datos solo se usan para gestionar tu solicitud.","ck.empty":"Todavía nada. Elige un servicio en el paso 1.",
 "ck.errName":"Escribe tu nombre.","ck.errEmailE":"Escribe tu correo para que pueda responderte.",
 "ck.errMsg":"Describe con qué necesitas ayuda.","ck.errConsent":"Marca la casilla de consentimiento.",
 "ck.errSee":"Revisa los campos marcados.",
 "op.use":"¿Para qué será el PC?","op.use.gaming":"Juegos","op.use.work":"Trabajo","op.use.school":"Estudios",
 "op.budget":"Presupuesto para componentes (opcional)","op.budget.ph":"P. ej. 25.000 CZK",
 "op.have":"Piezas que ya tienes (opcional)","op.have.ph":"P. ej. la caja y la fuente de mi PC antiguo",
 "op.os":"Sistema","op.os.win":"Windows","op.os.linux":"Linux","op.os.unsure":"No lo sé, aconséjame",
 "op.dev":"Número de ordenadores",
 "op.parts":"¿Qué quieres mejorar?","op.parts.ssd":"Disco (SSD)","op.parts.ram":"RAM","op.parts.gpu":"Tarjeta gráfica","op.parts.clean":"Limpieza y pasta térmica",
 "op.sym":"¿Qué le pasa?","op.sym.dead":"No enciende","op.sym.crash":"Se cuelga","op.sym.slow":"Va lento","op.sym.loud":"Hace ruido",
 "op.need":"¿Qué conectamos?","op.need.site":"Web","op.need.mail":"Correo","op.need.auth":"SPF, DKIM, DMARC",
 "op.domain":"Dominio (opcional)","op.domain.ph":"P. ej. miempresa.es",
 "op.goals":"¿Qué es lo más importante?","op.goals.look":"Diseño nuevo","op.goals.mobile":"Versión móvil","op.goals.speed":"Carga más rápida","op.goals.sec":"Seguridad básica",
 "op.url":"Web actual (opcional)","op.url.ph":"P. ej. miempresa.es",
 "op.hours":"Horas estimadas",
 "th.title":"Solicitud enviada","th.ready":"Tu solicitud está lista",
 "th.p":"Todavía no hay nada reservado ni pagado. Te responderé lo antes posible por correo o teléfono para confirmar el precio y la fecha.",
 "th.mailP":"Envíala desde tu correo para que me llegue seguro.","th.none":"Aquí no hay ninguna solicitud.","th.order":"Crear una solicitud",
 "o.subj":"Solicitud de soporte informático"
});

/* ===== Portfolio (případové studie) a O mně (zakladatel CORPHIK) ===== */
/* text stránky 404 (původně všechny tři jazyky naráz) */
Object.assign(T.cs,{"nf.t":"Stránka nenalezena"}); Object.assign(T.en,{"nf.t":"Page not found"}); Object.assign(T.es,{"nf.t":"Página no encontrada"});
Object.assign(T.cs,{
 "pf.lead":"Projekty, na kterých jsem pracoval – weby, aplikace a počítače.",
 "pf.k.tj":"Webová aplikace","pf.k.ap":"Web","pf.k.pc":"Sestavení PC",
 "pf.role":"Role","pf.stack":"Technologie","pf.langs":"Jazyky","pf.status":"Stav",
 "pf.use":"Určení","pf.useGaming":"Hraní ve vysokém rozlišení","pf.cpu":"Procesor","pf.gpu":"Grafika","pf.platform":"Platforma",
 "ab.role":"Zakladatel CORPHIK",
 "ab.intro":"Pod značkou CORPHIK dělám IT řešení, stavím počítače na míru a poskytuju technickou podporu – osobně v Praze a okolí, na dálku po celé Evropě.",
 "ab.doH":"Co dělám v CORPHIK","ab.doLink":"Služby a ceny",
 "ab.d1h":"IT řešení","ab.d1p":"Domény a DNS, e-mailové záznamy (SPF, DKIM, DMARC) a redesign webu.",
 "ab.d2h":"Stavba PC","ab.d2p":"Sestavy na míru podle rozpočtu, upgrady a čisté instalace Windows a Linuxu.",
 "ab.d3h":"Technická podpora","ab.d3p":"Diagnostika a opravy, osobně nebo vzdáleně přes internet.",
 "ab.tjH":"Vlastní projekt","ab.tjLink":"Detail v portfoliu","ab.route":"Cesta"
});
Object.assign(T.en,{
 "pf.lead":"Projects I've worked on – websites, apps and computers.",
 "pf.k.tj":"Web app","pf.k.ap":"Website","pf.k.pc":"PC build",
 "pf.role":"Role","pf.stack":"Stack","pf.langs":"Languages","pf.status":"Status",
 "pf.use":"Built for","pf.useGaming":"High-resolution gaming","pf.cpu":"Processor","pf.gpu":"Graphics","pf.platform":"Platform",
 "ab.role":"Founder of CORPHIK",
 "ab.intro":"Under the CORPHIK name I deliver IT solutions, engineer custom PCs and provide technical support – in person around Prague and remotely across Europe.",
 "ab.doH":"What I do at CORPHIK","ab.doLink":"Services and prices",
 "ab.d1h":"IT solutions","ab.d1p":"Domains and DNS, email records (SPF, DKIM, DMARC) and website redesign.",
 "ab.d2h":"PC engineering","ab.d2p":"Custom builds to your budget, upgrades and clean Windows and Linux installs.",
 "ab.d3h":"Technical support","ab.d3p":"Diagnostics and repairs, in person or remotely over the internet.",
 "ab.tjH":"My own project","ab.tjLink":"See it in the portfolio","ab.route":"Path"
});
Object.assign(T.es,{
 "pf.lead":"Proyectos en los que he trabajado: webs, aplicaciones y ordenadores.",
 "pf.k.tj":"Aplicación web","pf.k.ap":"Sitio web","pf.k.pc":"Montaje de PC",
 "pf.role":"Rol","pf.stack":"Tecnologías","pf.langs":"Idiomas","pf.status":"Estado",
 "pf.use":"Pensado para","pf.useGaming":"Jugar en alta resolución","pf.cpu":"Procesador","pf.gpu":"Gráfica","pf.platform":"Plataforma",
 "ab.role":"Fundador de CORPHIK",
 "ab.intro":"Con la marca CORPHIK ofrezco soluciones IT, monto ordenadores a medida y doy soporte técnico: en persona en Praga y alrededores, y a distancia en toda Europa.",
 "ab.doH":"Qué hago en CORPHIK","ab.doLink":"Servicios y precios",
 "ab.d1h":"Soluciones IT","ab.d1p":"Dominios y DNS, registros de correo (SPF, DKIM, DMARC) y rediseño web.",
 "ab.d2h":"Ingeniería de PC","ab.d2p":"Equipos a medida según tu presupuesto, mejoras e instalaciones limpias de Windows y Linux.",
 "ab.d3h":"Soporte técnico","ab.d3p":"Diagnóstico y reparación, en persona o a distancia por internet.",
 "ab.tjH":"Proyecto propio","ab.tjLink":"Ver en el portafolio","ab.route":"Trayectoria"
});

const root = document.documentElement;
let lang = "en";
const PAGE = document.body.dataset.page;

/* Roboti (Google, Bing, AI crawlery) – nikdy je nepřesměrovávat ani nepřepínat jazyk podle země */
const isBot = /bot|crawl|spider|slurp|google|bing/i.test(navigator.userAgent);

/* Jazykové verze stránky z <link rel="alternate" hreflang> (úvod: /, /en/, /es/) */
const ALT = {};
document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(l=>{ if(T[l.hreflang]) ALT[l.hreflang] = l.getAttribute('href'); });
const HAS_ALT = Object.keys(ALT).length > 0;

/* ===== Jazyk podle toho, odkud návštěvník je (časové pásmo) ===== */
function langFromLocation(){
  let tz = "";
  try{ tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; }catch(e){}
  if(/^Europe\/(Prague|Bratislava)$/.test(tz)) return "cs";
  const es = ["Europe/Madrid","Atlantic/Canary","Africa/Ceuta","Africa/Malabo","Pacific/Galapagos","Pacific/Easter",
    "America/Mexico_City","America/Cancun","America/Merida","America/Monterrey","America/Matamoros","America/Chihuahua",
    "America/Ciudad_Juarez","America/Ojinaga","America/Hermosillo","America/Mazatlan","America/Tijuana","America/Bahia_Banderas",
    "America/Bogota","America/Lima","America/Santiago","America/Punta_Arenas","America/Buenos_Aires","America/Caracas",
    "America/Guayaquil","America/La_Paz","America/Asuncion","America/Montevideo","America/Havana","America/Santo_Domingo",
    "America/Puerto_Rico","America/Panama","America/Costa_Rica","America/Managua","America/Tegucigalpa",
    "America/El_Salvador","America/Guatemala"];
  if(es.includes(tz) || tz.startsWith("America/Argentina/")) return "es";
  return "en";
}

/* logo Tandjo v černobílé verzi (bílé písmo na černé, stejné proporce jako původní barevné) */
const TJLOGO="data:image/webp;base64,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";
/* ===== PORTFOLIO – přidávej projekty (img: "" = automatický náhled, nebo vlož odkaz/data obrázku) ===== */
const PORTFOLIO = [
 { cat:"web", pv:"tj", img:"", url:"", wip:true,
   title:{cs:"Tandjo",en:"Tandjo",es:"Tandjo"},
   desc:{cs:"Webová aplikace pro páry: kalendář, galerie, místa, plány a hry pro dva.",
         en:"A web app for couples: calendar, gallery, places, plans and games for two.",
         es:"Una app web para parejas: calendario, galería, lugares, planes y juegos para dos."},
   tags:["HTML","CSS","JavaScript","PWA"] },
 { cat:"web", pv:"ap", img:"", url:"", wip:false,
   title:{cs:"Tento web",en:"This website",es:"Esta web"},
   desc:{cs:"Firemní web ve třech jazycích s ceníkem a objednávkovým formulářem.",
         en:"A business site in three languages with a price list and order form.",
         es:"Una web de empresa en tres idiomas con lista de precios y formulario de pedido."},
   tags:["HTML","CSS","JavaScript","i18n"] },
 { cat:"pc", pv:"pc", img:"", url:"", wip:false,
   title:{cs:"Herní PC",en:"Gaming PC",es:"PC gaming"},
   desc:{cs:"Sestava s Ryzen 7 5800X3D a Radeon RX 7800 XT pro hraní ve vysokém rozlišení.",
         en:"A build with Ryzen 7 5800X3D and Radeon RX 7800 XT for high-resolution gaming.",
         es:"Un equipo con Ryzen 7 5800X3D y Radeon RX 7800 XT para jugar en alta resolución."},
   tags:["AMD","AM4","Build"] }
];
const PCICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="14" r="3"/><path d="M9 6h6M9 9h6"/></svg>';
function preview(p){
  if(p.img) return `<div class="pv"><img src="${p.img}" alt=""></div>`;
  if(p.pv==="tj") return `<div class="pv pv-tj"><div class="bar"><i></i><i></i><i></i></div><div class="in"><img src="${TJLOGO}" alt=""></div></div>`;
  if(p.pv==="ap") return `<div class="pv pv-ap"><div class="bar"><i></i><i></i><i></i></div><div class="in"><div class="h">AP</div><div class="l"></div><div class="l s"></div><div class="b"></div></div></div>`;
  return `<div class="pv pv-pc">${PCICON}</div>`;
}

const $ = id => document.getElementById(id);
const t = k => (T[lang] && T[lang][k]) ?? k;
const findService = id => SERVICES.find(s => s.id === id);

/* ===== Služby (úvod) ===== */
/*SVC_START*/
/* Fotky u hlavní služby (sestavení PC) – soubory v /assets/img/ */
const BUILD_IMGS = ["/assets/img/pc-skrin.webp","/assets/img/pc-kabely.webp","/assets/img/pc-rog.webp"];
/* Ikonky služeb (jednoduché čárové SVG, barva se řídí motivem) */
const ICON_WRAP = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const SVC_ICONS = {
  os:'<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4M6.5 8.5l2.5 2-2.5 2M11 12.5h4"/>',
  upgrade:'<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M7 7V4.5M11 7V4.5M15 7V4.5M19 7V4.5M6 17v2.5M18 17v2.5M7 10.5h3v3H7zM13 10.5h4"/>',
  fix:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.9 1.9 0 0 0 2.7 2.7l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  dns:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
  web:'<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M2.5 8.5h19M5.5 6.3h.01M8 6.3h.01M6 12h7M6 15.5h4M16 12h2.5v4H16z"/>',
  remote:'<rect x="2.5" y="5" width="13" height="9" rx="1.5"/><path d="M6 18h6M9 14v4"/><path d="M18.5 9.5a3 3 0 0 1 0 4M20.8 7.5a6 6 0 0 1 0 8"/>'
};
const esc = x => String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function svcTag(s){
  if(!s.remote || s.tag===false) return "";
  return `<span class="tag">${esc(t(s.onlyRemote ? "s.only" : s.tag==="partial" ? "s.partial" : "s.remote"))}</span>`;
}
function featureHTML(s){
  const steps = [1,2,3].map(i=>`<li><strong>${t("bd."+i+"h")}</strong><span>${t("bd."+i+"p")}</span></li>`).join("");
  return `<div class="mosaic">${BUILD_IMGS.map(u=>`<img src="${u}" alt="" loading="lazy" width="480" height="640">`).join("")}</div>`
    + `<div class="ft-body"><h3>${esc(s.name[lang])}</h3><p class="d">${esc(s.desc[lang])}</p><ol class="pc-steps">${steps}</ol>`
    + `<div class="ft-buy"><span class="pr">${esc(s.price[lang])}</span><button class="btn primary add" type="button" data-add="${s.id}" aria-pressed="false" aria-label="${esc(t("cart.add")+": "+s.name[lang])}"><span class="lab">${esc(t("cart.add"))}</span></button></div></div>`;
}
function rowHTML(s){
  return `<li class="svc" id="svc-${s.id}"><span class="ic">${ICON_WRAP(SVC_ICONS[s.id]||"")}</span>`
    + `<div><h3>${esc(s.name[lang])}${svcTag(s)}</h3><p class="d">${esc(s.desc[lang])}</p></div>`
    + `<button class="buy add" type="button" data-add="${s.id}" aria-pressed="false" aria-label="${esc(t("cart.add")+": "+s.name[lang]+", "+s.price[lang])}"><span class="pr">${esc(s.price[lang])}</span><span class="go"><span class="lab">${esc(t("cart.add"))}</span></span></button></li>`;
}
/*SVC_END*/
function renderServices(){
  const ft = $('svcFeature'), ul = $('svcList');
  if(ft){ const b = findService("build"); if(b) ft.innerHTML = featureHTML(b); }
  if(ul) ul.innerHTML = SERVICES.filter(s=>s.id!=="build").map(rowHTML).join("");
  updateCartUI();
}

/* ===== Portfolio ===== */
let pfFilter = "all";
/* Portfolio jako případové studie: velký obraz + fakta. Vše jen z dat PORTFOLIO a existujících textů. */
const PF_SPECS = { pc:[["pf.cpu","Ryzen 7 5800X3D"],["pf.gpu","Radeon RX 7800 XT"],["pf.platform","AMD AM4"]] };
function caseVisual(p){
  if(p.pv==="tj") return `<div class="case-visual v-tj"><img src="${TJLOGO}" alt="" width="400" height="400"></div>`;
  if(p.pv==="ap") return `<div class="case-visual v-ap"><div class="v-bar"><i></i><i></i><i></i><span>CS</span><span>EN</span><span>ES</span></div>`
    + `<div class="v-in"><img src="/assets/img/corphik-wordmark.png" alt="" width="640" height="120"><div class="v-btns"><b></b><b></b></div></div></div>`;
  if(p.pv==="pc") return `<div class="case-visual v-pc">${PCICON}<dl>${PF_SPECS.pc.map(([k,v])=>`<div><dt>${esc(t(k))}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>`;
  return `<div class="case-visual">${preview(p)}</div>`;
}
function caseFacts(p){
  const f = [];
  if(p.pv==="tj") f.push([t("pf.role"), t("tj.role")]);
  if(p.pv==="ap") f.push([t("pf.langs"), "CS, EN, ES"]);
  if(p.pv==="pc") f.push([t("pf.use"), t("pf.useGaming")]);
  else f.push([t("pf.stack"), p.tags.join(", ")]);
  /* stav jen tam, kde ho data uvádějí (wip) – „dokončeno“ by si odporovalo s upozorněním „web je ve výstavbě“ */
  if(p.wip) f.push([t("pf.status"), t("pf.wip")]);
  return f;
}
function renderPortfolio(){
  renderWorkTeaser();
  const box = $('pfList'); if(!box) return;
  box.innerHTML = PORTFOLIO.map(p=>`<article class="case" id="pf-${p.pv}"${pfFilter!=="all" && p.cat!==pfFilter ? " hidden" : ""}>`
    + `<div class="case-stage"><svg class="case-orbit" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="100" rx="96" ry="30"/><ellipse cx="100" cy="100" rx="70" ry="21"/></svg>${caseVisual(p)}</div>`
    + `<div class="case-body"><p class="case-k">${esc(t("pf.k."+p.pv))}</p><h2 class="case-t">${esc(p.title[lang])}</h2><p class="case-d">${esc(p.desc[lang])}</p>`
    + `<dl class="case-facts">${caseFacts(p).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`
    + (p.url ? `<a class="btn case-link" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(t("pf.view"))}</a>` : "")
    + `</div></article>`).join("");
  /* odkaz /portfolio/#pf-xx z úvodu: karty vznikají až skriptem, tak k nim doskroluj po prvním vykreslení */
  if(!renderPortfolio.done && location.hash){ const el = document.getElementById(location.hash.slice(1)); if(el){ el.scrollIntoView(); el.classList.add('arrived'); } }
  renderPortfolio.done = true;
}
/* Ukázky portfolia na úvodu – každá vede na svou kartu v /portfolio/ */
function renderWorkTeaser(){
  const ul = $('pfTeaser'); if(!ul) return;
  ul.innerHTML = PORTFOLIO.map(p=>`<li><a class="work-card" href="/portfolio/#pf-${p.pv}" data-pf="${p.pv}">${preview(p)}`
    + `<h3><span class="t">${esc(p.title[lang])}</span>${p.wip?`<span class="mini">${esc(t("pf.wip"))}</span>`:""}</h3>`
    + `<p>${esc(p.desc[lang])}</p></a></li>`).join("");
}
document.querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>{
  pfFilter = b.dataset.f;
  document.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed', x===b));
  renderPortfolio();
}));

/* ===== Košík (uložený v prohlížeči návštěvníka) ===== */
const CART_KEY = "corphikCart";
let memCart = [];
function getCart(){
  let a = memCart;
  try{ const v = JSON.parse(localStorage.getItem(CART_KEY) || "null"); if(Array.isArray(v)) a = v; }catch(_){}
  return a.filter(id => id==="other" || findService(id));
}
function setCart(a){
  const before = getCart().length;
  memCart = [...new Set(a)];
  try{ localStorage.setItem(CART_KEY, JSON.stringify(memCart)); }catch(_){}
  updateCartUI(memCart.length > before);
}
function toggleCart(id){ const c = getCart(); setCart(c.includes(id) ? c.filter(x=>x!==id) : [...c, id]); }
function updateCartUI(bump){
  const c = getCart();
  document.querySelectorAll('.cnt').forEach(el=>{
    el.textContent = c.length; el.hidden = !c.length;
    if(bump){ el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  });
  document.querySelectorAll('[data-add]').forEach(b=>{
    const on = c.includes(b.dataset.add), s = findService(b.dataset.add);
    b.classList.toggle('in', on); b.setAttribute('aria-pressed', on);
    const lab = b.querySelector('.lab'); if(lab) lab.textContent = t(on ? "cart.added" : "cart.add");
    if(s) b.setAttribute('aria-label', t(on ? "cart.added" : "cart.add") + ": " + s.name[lang]);
  });
}
document.addEventListener('click', e=>{ const b = e.target.closest('[data-add]'); if(b) toggleCart(b.dataset.add); });
addEventListener('storage', e=>{ if(e.key===CART_KEY){ updateCartUI(); if($('ckPick')) renderCheckout(); } });

/* ===== Poptávka (stránka /orders/): výběr služeb → detaily → kontakt → kontrola =====
   Košík = pole id služeb (corphikCart, sdílí ho tlačítka na úvodu). Detaily ke službám jsou zvlášť (corphikOpts).
   Ceny jsou „od“, součet je jen orientační odhad. Nic se neobjednává ani neplatí – odešle se poptávka e-mailem. */
const OPTS_KEY = "corphikOpts";
/* Volby u služeb – vychází jen z popisů služeb a cenu nemění (kromě hodin vzdálené pomoci).
   multi = víc možností, one = jedna, num = počítadlo, text/area = volný text */
const SVC_OPTS = {
  build:[{k:"use",type:"multi",ch:["gaming","work","school"]},{k:"budget",type:"text"},{k:"have",type:"area"}],
  os:[{k:"os",type:"one",ch:["win","linux","unsure"]},{k:"dev",type:"num",min:1,max:10}],
  upgrade:[{k:"parts",type:"multi",ch:["ssd","ram","gpu","clean"]},{k:"dev",type:"num",min:1,max:10}],
  fix:[{k:"sym",type:"multi",ch:["dead","crash","slow","loud"]},{k:"dev",type:"num",min:1,max:10}],
  dns:[{k:"need",type:"multi",ch:["site","mail","auth"]},{k:"domain",type:"text"}],
  web:[{k:"goals",type:"multi",ch:["look","mobile","speed","sec"]},{k:"url",type:"text"}],
  remote:[{k:"hours",type:"num",min:1,max:8}]
};
const PICK_ICONS = {
  build:'<rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="14" r="3"/><path d="M9 6h6M9 9h6"/>',
  other:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.5M12 17h.01"/>'
};
/* malá černá díra (stejná jako v závěrečné výzvě na úvodu) – do ní „padají“ vybrané služby */
const BH_MINI = '<svg class="bh-mini" viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(-10 32 32)" fill="none" stroke="currentColor" stroke-linecap="round"><ellipse cx="32" cy="33" rx="30" ry="6" stroke-width="1.2" opacity=".45"/><circle cx="32" cy="32" r="17" stroke-width="7" opacity=".14"/><path d="M15 33a17 17 0 0 1 34 0" stroke-width="3.2"/><path d="M19.5 34.5a12.5 12.5 0 0 0 25 0" stroke-width="1.3" opacity=".75"/><circle cx="32" cy="32" r="11" fill="#000" stroke-width="1.3"/><path d="M2 33a30 6 0 0 0 60 0" stroke-width="2.8"/></g></svg>';
let urlServiceAdded = false, memOpts = {};
function getOpts(){
  try{ const v = JSON.parse(localStorage.getItem(OPTS_KEY) || "null"); if(v && typeof v === "object") return v; }catch(_){}
  return memOpts;
}
function saveOpts(o){ memOpts = o; try{ localStorage.setItem(OPTS_KEY, JSON.stringify(o)); }catch(_){} }
/* uložené volby služby, doplněné a ořezané podle SVC_OPTS */
function optsFor(id){
  const o = {...(getOpts()[id] || {})};
  (SVC_OPTS[id] || []).forEach(f=>{
    if(f.type==="num"){ const n = parseInt(o[f.k], 10); o[f.k] = Math.min(f.max, Math.max(f.min, isNaN(n) ? f.min : n)); }
    else if(f.type==="multi") o[f.k] = Array.isArray(o[f.k]) ? o[f.k].filter(c=>f.ch.includes(c)) : [];
    else if(f.type==="one"){ if(!f.ch.includes(o[f.k])) o[f.k] = ""; }
    else if(typeof o[f.k] !== "string") o[f.k] = "";
  });
  return o;
}
function setOpt(id, k, v){ const all = getOpts(); all[id] = {...optsFor(id), [k]: v}; saveOpts(all); }
function selectedIds(){ const c = getCart(); return [...SERVICES.map(s=>s.id), "other"].filter(id=>c.includes(id)); }
function selectedServices(){ return selectedIds().map(findService).filter(Boolean); }
/* částky ve stejném tvaru jako ceník (CS: 1 500 Kč, EN: CZK 1,500 (≈ €60), ES: 1.500 CZK (≈ 60 €)), € = Kč / 25 jako v ceníku */
function money(czk){
  const g = (n, sep) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep), e = Math.round(czk/25);
  if(lang==="cs") return `${g(czk," ")} Kč`;
  if(lang==="es") return `${g(czk,".")} CZK (≈ ${e} €)`;
  return `CZK ${g(czk,",")} (≈ €${e})`;
}
function itemPrice(s){ if(!s) return t("ck.otherP"); return s.hourly ? money(s.czk*optsFor(s.id).hours) : s.price[lang]; }
function estimate(){ return selectedServices().reduce((sum, s)=>sum + (s.hourly ? s.czk*optsFor(s.id).hours : s.czk), 0); }
/* volby jako text: krátce do souhrnu, celé (i s volným textem) do poptávky */
function optLines(id, full){
  const o = optsFor(id);
  return (SVC_OPTS[id] || []).map(f=>{
    const lab = t("op."+f.k).replace(/\s*\([^)]*\)$/, "");
    if(f.type==="multi") return o[f.k].length ? (full ? lab.replace(/[?¿]/g, "")+": " : "") + o[f.k].map(c=>t("op."+f.k+"."+c)).join(", ") : "";
    if(f.type==="one") return o[f.k] ? (full ? lab.replace(/[?¿]/g, "")+": " : "") + t("op."+f.k+"."+o[f.k]) : "";
    if(f.type==="num") return `${lab}: ${o[f.k]}`;
    return full && o[f.k].trim() ? `${lab}: ${o[f.k].trim()}` : "";
  }).filter(Boolean);
}

function renderPick(){
  const box = $('ckPick'); if(!box) return;
  if(!box.dataset.ready){
    box.innerHTML = [...SERVICES.map(s=>s.id), "other"].map(id=>
      `<button type="button" class="pk" data-pick="${id}" aria-pressed="false"><span class="ic">${ICON_WRAP(SVC_ICONS[id] || PICK_ICONS[id] || "")}</span>`
      + `<span class="pk-t"><b></b><span class="pk-p"></span></span><span class="pk-tag"></span><span class="pk-st" aria-hidden="true"></span></button>`).join("");
    box.dataset.ready = "1";
  }
  const c = getCart();
  box.querySelectorAll('[data-pick]').forEach(b=>{
    const id = b.dataset.pick, s = findService(id);
    b.setAttribute('aria-pressed', c.includes(id));
    b.querySelector('b').textContent = s ? s.name[lang] : t("o.other");
    b.querySelector('.pk-p').textContent = s ? s.price[lang] : t("ck.otherP");
    b.querySelector('.pk-tag').innerHTML = s ? svcTag(s) : "";
  });
}
function optHTML(id, isNew){
  const s = findService(id), o = optsFor(id);
  const fields = (SVC_OPTS[id] || []).map(f=>{
    const lid = `l-${id}-${f.k}`, lab = esc(t("op."+f.k));
    if(f.type==="multi" || f.type==="one")
      return `<div class="op"><span class="op-l" id="${lid}">${lab}</span><div class="chips" role="group" aria-labelledby="${lid}">`
        + f.ch.map(ch=>{ const on = f.type==="multi" ? o[f.k].includes(ch) : o[f.k]===ch;
          return `<button type="button" class="chip" data-o="${id}|${f.k}|${ch}" aria-pressed="${on}">${esc(t("op."+f.k+"."+ch))}</button>`; }).join("")
        + `</div></div>`;
    if(f.type==="num")
      return `<div class="op op-num"><span class="op-l" id="${lid}">${lab}</span><div class="stepper" role="group" aria-labelledby="${lid}">`
        + `<button type="button" data-step="${id}|${f.k}|-1" aria-label="${esc(t("ck.less"))}"${o[f.k]<=f.min?" disabled":""}>−</button>`
        + `<output aria-live="polite">${o[f.k]}</output>`
        + `<button type="button" data-step="${id}|${f.k}|1" aria-label="${esc(t("ck.more"))}"${o[f.k]>=f.max?" disabled":""}>+</button></div></div>`;
    const ph = esc(t("op."+f.k+".ph")), fid = `o-${id}-${f.k}`;
    return `<label class="fld" for="${fid}"><span>${lab}</span>` + (f.type==="area"
      ? `<textarea id="${fid}" data-f="${id}|${f.k}" maxlength="500" placeholder="${ph}">${esc(o[f.k])}</textarea>`
      : `<input id="${fid}" data-f="${id}|${f.k}" maxlength="200" placeholder="${ph}" value="${esc(o[f.k])}">`) + `</label>`;
  }).join("");
  const note = id==="build" ? t("ck.payb") : id==="other" ? t("ck.otherN") : "";
  return `<fieldset class="opt${isNew ? " new" : ""}" data-sid="${id}" id="opt-${id}">`
    + `<legend>${esc(s ? s.name[lang] : t("o.other"))}</legend>`
    + `<button type="button" class="lnk opt-rm" data-rm="${id}">${esc(t("ck.remove"))}</button>`
    + (s ? `<p class="opt-d">${esc(s.desc[lang])}</p>` : "") + fields + (note ? `<p class="note">${esc(note)}</p>` : "") + `</fieldset>`;
}
function renderOpts(){
  const box = $('ckOpts'); if(!box) return;
  const ids = selectedIds(), had = new Set([...box.querySelectorAll('[data-sid]')].map(f=>f.dataset.sid));
  box.innerHTML = ids.length ? ids.map(id=>optHTML(id, box.dataset.ready && !had.has(id))).join("") : `<p class="note">${esc(t("ck.step2e"))}</p>`;
  box.dataset.ready = "1";
}
function renderSummary(){
  const ul = $('sumList'); if(!ul) return;
  const ids = selectedIds(), est = estimate();
  ul.innerHTML = ids.map(id=>{ const s = findService(id), meta = optLines(id, false).join(", ");
    return `<li data-sid="${id}"><div class="si"><b>${esc(s ? s.name[lang] : t("o.other"))}</b>${meta ? `<span>${esc(meta)}</span>` : ""}</div>`
      + `<span class="sp">${esc(itemPrice(s))}</span>`
      + `<div class="sa"><button type="button" class="lnk" data-edit="${id}">${esc(t("ck.edit"))}</button>`
      + `<button type="button" class="lnk" data-rm="${id}">${esc(t("ck.remove"))}</button></div></li>`; }).join("");
  $('sumEmpty').hidden = ids.length > 0;
  $('sumTotal').hidden = !est; $('sumEst').textContent = est ? money(est) : "";
  $('sumNote').hidden = !est;
  /* Sestavení PC: záloha na komponenty předem (ostatní služby se platí až po dokončení) */
  const dep = ids.includes("build");
  document.querySelectorAll('[data-i18n="ck.payH"]').forEach(el=>{ el.innerHTML = t(dep ? "ck.payHb" : "ck.payH"); });
  document.querySelectorAll('[data-i18n="ck.pay"]').forEach(el=>{ el.innerHTML = t(dep ? "ck.payb" : "ck.pay"); });
  /* lišta dole na mobilu */
  const bar = $('ckBar');
  if(bar){ bar.hidden = !ids.length; $('barCount').textContent = ids.length; $('barEst').textContent = est ? money(est) : t("ck.otherP"); }
  document.body.classList.toggle('has-bar', ids.length > 0);
}
/* Osobně jen v Česku; Španělsko a zbytek Evropy zatím jen na dálku */
function updateRules(){
  const ss = selectedServices();
  const onsiteOnly = ss.some(s=>!s.remote), remoteOnly = ss.some(s=>s.onlyRemote), abroad = isAbroad();
  const rem = $('modeRemote'), ons = $('modeOnsite');
  rem.disabled = onsiteOnly;
  ons.disabled = abroad || (remoteOnly && !onsiteOnly);
  $('remoteNa').hidden = !onsiteOnly || abroad || remoteOnly;
  $('mixNote').hidden = !(onsiteOnly && remoteOnly) || abroad;
  const ab = $('abroadNote');
  ab.hidden = !abroad; ab.textContent = abroad ? t(onsiteOnly ? "ck.abroadNa" : "ck.abroadRemote") : ""; ab.classList.toggle('warn', abroad && onsiteOnly);
  if(ons.disabled) rem.checked = true; else if(rem.disabled) ons.checked = true;
  $('addrWrap').hidden = abroad || !ons.checked;
  /* popis je povinný jen u „Něco jiného“ */
  $('msgLab').textContent = t(selectedIds().includes("other") ? "ck.msg" : "ck.msgOpt");
}
function renderReview(){
  const pre = $('ckReview'); if(!pre) return;
  const o = collectOrder();
  pre.textContent = orderText({...o, name: o.name || "—", email: o.email || "—"});
}
function refreshCheckout(){ renderSummary(); updateRules(); renderReview(); }
function renderCheckout(){
  if(!$('ckPick')) return;
  /* starší odkazy /orders/?service=xxx přidají službu do košíku */
  const p = new URLSearchParams(location.search).get('service');
  if(p && !urlServiceAdded && (p==="other" || findService(p))){ urlServiceAdded = true; const c = getCart(); if(!c.includes(p)) setCart([...c, p]); }
  $('ckMsg').placeholder = t("ck.msgPh");
  $('ckWhen').placeholder = t("ck.whenPh");
  renderPick(); renderOpts(); refreshCheckout();
}
function isAbroad(){ const c = $('ckCountry'); return !!c && c.value !== "cz"; }
function countryFromLocation(){
  let tz=""; try{ tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; }catch(e){}
  if(tz==="Europe/Prague") return "cz";
  if(["Europe/Madrid","Atlantic/Canary","Africa/Ceuta"].includes(tz)) return "es";
  return "eu";
}
function collectOrder(){
  const v = id => $(id).value.trim();
  const items = selectedIds().map(id=>{ const s = findService(id);
    return { id, name: s ? s.name[lang] : t("o.other"), price: itemPrice(s), details: optLines(id, true) }; });
  const est = estimate();
  return {
    name:v('ckName'), email:v('ckEmail'), phone:v('ckPhone'),
    items, service: items.map(i=>i.name).join(", "), estimate: est ? money(est) : "",
    country: $('ckCountry') ? $('ckCountry').selectedOptions[0].textContent : "",
    mode: ($('modeOnsite').checked && !isAbroad()) ? t("ck.onsite") : t("ck.remote"),
    address: ($('modeOnsite').checked && !isAbroad()) ? v('ckAddr') : "",
    when:v('ckWhen'), msg:v('ckMsg'), lang
  };
}
function orderText(o){
  return [
    `${t("f.name")}: ${o.name}`, `${t("f.email")}: ${o.email}`, o.phone?`${t("f.phone")}: ${o.phone}`:"",
    "", `${t("f.services")}:`,
    ...(o.items||[]).flatMap(i=>[`– ${i.name}${i.price?`: ${i.price}`:""}`, ...(i.details||[]).map(d=>`   ${d}`)]),
    o.estimate?`${t("ck.est")}: ${o.estimate}`:"", "",
    o.country?`${t("f.country")}: ${o.country}`:"", `${t("f.mode")}: ${o.mode}`,
    o.address?`${t("f.addr")}: ${o.address}`:"", o.when?`${t("f.when")}: ${o.when}`:"",
    o.msg?"":null, o.msg?`${t("f.msg")}:`:"", o.msg||""
  ].filter(x=>x!==null).filter((x,i,a)=>x!=="" || (i>0 && a[i-1]!=="")).join("\n").trim();
}
/* vybraná služba „spadne“ do malé černé díry v souhrnu (na mobilu v liště dole) */
function flyToSummary(from){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !from.animate) return;
  const bar = $('ckBar'), useBar = bar && !bar.hidden && getComputedStyle(bar).display !== "none";
  const target = (useBar ? bar : document.querySelector('.summary')).querySelector('.bh-mini');
  if(!target) return;
  const a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
  const pulse = () => { target.classList.remove('pull'); void target.getBoundingClientRect(); target.classList.add('pull'); };
  if(b.bottom < 0 || b.top > innerHeight){ pulse(); return; }
  const x0 = a.left + a.width/2, y0 = a.top + a.height/2, x1 = b.left + b.width/2, y1 = b.top + b.height/2;
  const mx = (x0 + x1)/2, my = Math.min(y0, y1) - 70;
  const dot = document.createElement('span'); dot.className = 'ck-fly'; document.body.appendChild(dot);
  const frames = [0, .25, .5, .75, 1].map(k=>{ const q = 1 - k, x = q*q*x0 + 2*q*k*mx + k*k*x1, y = q*q*y0 + 2*q*k*my + k*k*y1;
    return { transform: `translate(${x - 6}px,${y - 6}px) scale(${1 - k*0.75})`, opacity: k < 1 ? 1 : 0 }; });
  dot.animate(frames, { duration: 600, easing: 'cubic-bezier(.55,0,.8,.2)' }).onfinish = () => { dot.remove(); pulse(); };
}
function removeItem(id){
  setCart(getCart().filter(x=>x!==id));
  renderPick(); renderOpts(); refreshCheckout();
  const card = document.querySelector(`[data-pick="${id}"]`); if(card) card.focus({preventScroll:true});
}
function editItem(id){
  const f = $('opt-' + id); if(!f) return;
  f.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? "auto" : "smooth", block:"center"});
  const c = f.querySelector('button.chip, .stepper button:not([disabled]), input, textarea'); if(c) c.focus({preventScroll:true});
  f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash');
}
/* chyby přímo u polí */
function fieldError(el, key){
  const host = el.closest('.fld, .consent, .panel') || el;
  let p = host.querySelector(':scope > .fld-err') || (host.classList.contains('consent') ? $('consentErr') : null);
  if(!p){ p = document.createElement('p'); p.className = 'fld-err'; host.appendChild(p); }
  p.id = p.id || ('err-' + (el.id || Math.random().toString(36).slice(2)));
  p.textContent = t(key); p.hidden = false;
  if(el.matches('input,textarea,select')){ el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', p.id); }
}
function clearError(el){
  const host = el.closest('.fld, .consent') ; el.removeAttribute('aria-invalid');
  const p = host && (host.querySelector(':scope > .fld-err') || (host.classList.contains('consent') ? $('consentErr') : null));
  if(p) p.hidden = true;
}
function initCheckout(){
  const form = $('ckForm'); if(!form) return;
  $('ckPick').addEventListener('click', e=>{
    const b = e.target.closest('[data-pick]'); if(!b) return;
    const id = b.dataset.pick, on = getCart().includes(id);
    setCart(on ? getCart().filter(x=>x!==id) : [...getCart(), id]);
    renderPick(); renderOpts(); refreshCheckout();
    $('pickErr').hidden = true;
    if(!on) flyToSummary(b);
  });
  $('ckOpts').addEventListener('click', e=>{
    const chip = e.target.closest('[data-o]'), st = e.target.closest('[data-step]'), rm = e.target.closest('[data-rm]');
    if(chip){
      const [id, k, ch] = chip.dataset.o.split("|"), f = SVC_OPTS[id].find(x=>x.k===k), o = optsFor(id);
      if(f.type==="multi"){ const v = o[k].includes(ch) ? o[k].filter(x=>x!==ch) : [...o[k], ch]; setOpt(id, k, v); chip.setAttribute('aria-pressed', v.includes(ch)); }
      else { const v = o[k]===ch ? "" : ch; setOpt(id, k, v); chip.parentElement.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed', x===chip && v===ch)); }
      refreshCheckout();
    } else if(st){
      const [id, k, d] = st.dataset.step.split("|"), f = SVC_OPTS[id].find(x=>x.k===k);
      const n = Math.min(f.max, Math.max(f.min, optsFor(id)[k] + Number(d))); setOpt(id, k, n);
      const g = st.parentElement, less = g.querySelector('[data-step$="|-1"]'), more = g.querySelector('[data-step$="|1"]');
      g.querySelector('output').textContent = n; less.disabled = n <= f.min; more.disabled = n >= f.max;
      if(st.disabled) (st === less ? more : less).focus();
      refreshCheckout();
    } else if(rm) removeItem(rm.dataset.rm);
  });
  $('ckOpts').addEventListener('input', e=>{
    const f = e.target.closest('[data-f]'); if(!f) return;
    const [id, k] = f.dataset.f.split("|"); setOpt(id, k, f.value); refreshCheckout();
  });
  document.querySelector('.summary').addEventListener('click', e=>{
    const rm = e.target.closest('[data-rm]'), ed = e.target.closest('[data-edit]');
    if(rm) removeItem(rm.dataset.rm); else if(ed) editItem(ed.dataset.edit);
  });
  const cc = $('ckCountry');
  if(cc){ cc.value = countryFromLocation(); cc.addEventListener('change', refreshCheckout); }
  document.querySelectorAll('input[name="mode"]').forEach(r=>r.addEventListener('change', refreshCheckout));
  form.addEventListener('input', e=>{ if(e.target.matches('#ckName,#ckEmail,#ckPhone,#ckAddr,#ckWhen,#ckMsg')){ clearError(e.target); renderReview(); } });
  $('ckConsent').addEventListener('change', e=>clearError(e.target));
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const o = collectOrder(), err = $('ckErr'), bad = [];
    const fail = (el, key) => { fieldError(el, key); bad.push([el, key]); };
    if(!o.items.length){ const p = $('pickErr'); p.textContent = t("ck.errItems"); p.hidden = false; bad.push([$('ckPick'), "ck.errItems"]); }
    if(!o.name) fail($('ckName'), "ck.errName");
    if(!o.email) fail($('ckEmail'), "ck.errEmailE");
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(o.email)) fail($('ckEmail'), "ck.errEmail");
    if(isAbroad() && selectedServices().some(s=>!s.remote)) fail($('ckCountry'), "ck.abroadNa");
    if($('modeOnsite').checked && !isAbroad() && !o.address) fail($('ckAddr'), "ck.errAddr");
    if(selectedIds().includes("other") && !o.msg) fail($('ckMsg'), "ck.errMsg");
    if(!$('ckConsent').checked) fail($('ckConsent'), "ck.errConsent");
    if(bad.length){
      err.textContent = t(bad.length > 1 ? "ck.errSee" : bad[0][1]);
      const first = bad[0][0], target = first.id === "ckPick" ? first.querySelector('button') : first;
      first.scrollIntoView({block:"center"}); if(target) target.focus({preventScroll:true});
      return;
    }
    if($('ckHp').value) return; // ochrana proti robotům
    err.textContent = "";
    const btn = $('ckSubmit'), lab = btn.querySelector('span');
    btn.disabled = true; lab.textContent = t("ck.sending");
    let sent = false;
    if(WEB3FORMS_KEY){
      try{
        const r = await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
          body:JSON.stringify({access_key:WEB3FORMS_KEY, subject:`${t("o.subj")}: ${o.service}`, from_name:"Corphik web", replyto:o.email, message:orderText(o)})});
        const j = await r.json(); sent = !!j.success;
        if(!sent) throw 0;
      }catch(_){ err.textContent = t("ck.fail"); btn.disabled = false; lab.textContent = t("ck.submit"); return; }
    }
    try{ sessionStorage.setItem('corphikOrder', JSON.stringify({...o, sent})); }catch(_){}
    setCart([]); saveOpts({});
    location.href = "/orders/thanks/";
  });
}

/* ===== Děkovací stránka (poptávka odeslaná, nic není objednané ani zaplacené) ===== */
function renderThanks(){
  const box = $('thBox'); if(!box) return;
  let o=null; try{ o = JSON.parse(sessionStorage.getItem('corphikOrder')||"null"); }catch(_){}
  $('thHas').hidden = !o; $('thNone').hidden = !!o;
  if(!o) return;
  $('thTitle').textContent = t(o.sent ? "th.title" : "th.ready");
  $('thText').textContent = orderText(o);
  $('thMail').hidden = o.sent;
  const a = $('thMailBtn');
  a.href = `mailto:${EMAIL}?subject=${encodeURIComponent(t("o.subj")+": "+o.service)}&body=${encodeURIComponent(orderText(o))}`;
}

/* ===== Jazyk ===== */
/* Na ostatních stránkách vedou odkazy na úvod („/“, „/#sluzby“) na úvod ve zvoleném jazyce */
const HOME_URL = {cs:"/", en:"/en/", es:"/es/"};
function localizeHomeLinks(){
  if(HAS_ALT) return;
  document.querySelectorAll('a[href="/"], a[href^="/#"], a[data-home]').forEach(a=>{
    if(a.dataset.home === undefined) a.dataset.home = a.getAttribute('href').slice(1);
    a.setAttribute('href', (HOME_URL[lang] || "/") + a.dataset.home);
  });
}
function setLang(l, remember){
  lang = T[l] ? l : "en"; root.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed', b.dataset.lang===lang));
  renderServices(); renderPortfolio(); renderCheckout(); renderThanks(); renderWip(); themeLabel(); localizeHomeLinks();
  const titles = {home:"h.area", portfolio:"pf.h", about:"nav.about", orders:"ck.title", thanks:"ck.title", notfound:"nf.t"};
  document.title = "Corphik – " + (PAGE==="home" ? t("h.area").split(",")[0] : t(titles[PAGE]||"h.area").replace(/<[^>]+>/g,""));
  if(remember){ try{ localStorage.setItem('lang', lang); }catch(e){} }
}
/* Přepínač CS/EN/ES: na úvodu přejde na jinou adresu (/, /en/, /es/), jinde jen přepne texty */
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{
  const l = b.dataset.lang;
  if(HAS_ALT && ALT[l]){
    try{ localStorage.setItem('lang', l); }catch(e){}
    /* jen cesta z hreflang odkazu – zůstane stejná doména (corphik.eu, www, náhled) i sekce (#sluzby…) */
    if(l !== root.lang){ const u = new URL(ALT[l], location.href); location.href = u.pathname + location.hash; }
    return;
  }
  setLang(l, true);
}));

/* ===== Motiv ===== */
const themeBtn = $('theme');
function isDark(){ const v=root.dataset.theme; return v ? v==="dark" : matchMedia('(prefers-color-scheme: dark)').matches; }
function themeLabel(){ if(!themeBtn) return; const l=t(isDark()?"theme.light":"theme.dark"); themeBtn.setAttribute('aria-label',l); themeBtn.title=l; }
try{ const s=localStorage.getItem('theme'); if(s) root.dataset.theme=s; }catch(e){}
themeBtn && themeBtn.addEventListener('click',()=>{ root.dataset.theme = isDark()?"light":"dark"; try{localStorage.setItem('theme',root.dataset.theme);}catch(e){} themeLabel(); });

document.querySelectorAll('.year').forEach(el=>el.textContent=new Date().getFullYear());
document.querySelectorAll('.mail').forEach(el=>{ el.href="mailto:"+EMAIL; el.textContent=EMAIL; });

/* ===== Plynulé objevování sekcí při scrollu (úvod) ===== */
const revealEls = document.querySelectorAll('.reveal');
if(revealEls.length){
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    root.classList.add('rv');
    const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } }),{threshold:.12});
    revealEls.forEach(el=>io.observe(el));
  }
}

/* ===== Upozornění „Web je ve výstavbě“ (všechny stránky, dá se zavřít) ===== */
function renderWip(){
  let box = $('wipNote');
  let closed = false; try{ closed = sessionStorage.getItem('wipClosed')==="1"; }catch(_){}
  if(closed){ if(box) box.remove(); return; }
  if(!box){
    box = document.createElement('aside');
    box.id = 'wipNote'; box.className = 'wip'; box.setAttribute('role','note');
    box.innerHTML = `<button type="button" class="wip-x">×</button><strong></strong><p></p>`;
    box.querySelector('.wip-x').addEventListener('click',()=>{ try{ sessionStorage.setItem('wipClosed',"1"); }catch(_){} box.remove(); });
    document.body.appendChild(box);
  }
  box.querySelector('strong').textContent = t("wip.h");
  box.querySelector('p').innerHTML = t("wip.p");
  const x = box.querySelector('.wip-x'); x.setAttribute('aria-label', t("wip.close")); x.title = t("wip.close");
}

/* ===== Start ===== */
initCheckout();
let saved=null; try{ saved=localStorage.getItem('lang'); }catch(e){}
if(HAS_ALT){
  /* Stránka má vlastní adresu pro každý jazyk – roboti vidí přesně to, co je v HTML.
     Nového návštěvníka na české verzi přesměruje podle země, jen pokud si jazyk ještě nevybral. */
  const pageLang = root.lang;
  const geo = langFromLocation();
  if(!saved && !isBot && pageLang==="cs" && geo!=="cs" && ALT[geo]) location.replace(ALT[geo]);
  else setLang(pageLang, !isBot);
} else {
  /* Ostatní stránky (O mně, Objednávka, Portfolio): uložený jazyk, jinak podle země, roboti česky */
  setLang(saved || (isBot ? "cs" : langFromLocation()), false);
}
