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
   POZOR: když tu něco změníš, uprav stejný text i v index.html, en/index.html a es/index.html
   (texty v HTML jsou pro Google; po načtení je skript stejně vykreslí znovu) */
const SERVICES = [
 { id:"build", remote:false,
   price:{cs:"od 1 500 Kč",en:"from CZK 1,500 (≈ €60)",es:"desde 1.500 CZK (≈ 60 €)"},
   name:{cs:"Sestavení PC na míru",en:"Custom PC build",es:"PC a medida"},
   desc:{cs:"Vyberu komponenty podle rozpočtu a účelu (hry, práce, škola), PC sestavím a otestuju.",
         en:"I pick parts for your budget and needs (gaming, work, school), then build and test the PC.",
         es:"Elijo los componentes según tu presupuesto y uso (juegos, trabajo, estudios), monto el PC y lo pruebo."} },
 { id:"os", remote:false,
   price:{cs:"od 700 Kč",en:"from CZK 700 (≈ €28)",es:"desde 700 CZK (≈ 28 €)"},
   name:{cs:"Instalace Windows a Linuxu",en:"Windows & Linux installation",es:"Instalación de Windows y Linux"},
   desc:{cs:"Čistá instalace systému, ovladače, aktualizace a nastavení, aby vše fungovalo od prvního spuštění. Licence Windows není v ceně.",
         en:"Clean OS install, drivers, updates and setup so everything works from the first boot. Windows licence not included.",
         es:"Instalación limpia del sistema, drivers, actualizaciones y configuración para que todo funcione desde el primer arranque. La licencia de Windows no está incluida."} },
 { id:"upgrade", remote:false,
   price:{cs:"od 500 Kč",en:"from CZK 500 (≈ €20)",es:"desde 500 CZK (≈ 20 €)"},
   name:{cs:"Upgrade a zrychlení PC",en:"PC upgrade & speed-up",es:"Mejora y aceleración del PC"},
   desc:{cs:"Výměna disku, RAM nebo grafiky, vyčištění a nová teplovodivá pasta. Díly se platí zvlášť.",
         en:"New SSD, RAM or graphics card, cleaning and fresh thermal paste. Parts are paid separately.",
         es:"Cambio de SSD, RAM o tarjeta gráfica, limpieza y pasta térmica nueva. Las piezas se pagan aparte."} },
 { id:"fix", remote:true, tag:"partial",
   price:{cs:"od 400 Kč",en:"from CZK 400 (≈ €16)",es:"desde 400 CZK (≈ 16 €)"},
   name:{cs:"Diagnostika a opravy",en:"Diagnostics & repairs",es:"Diagnóstico y reparación"},
   desc:{cs:"PC nejde zapnout, padá, je pomalé nebo hlučné? Najdu příčinu a vyřeším ji. Cena diagnostiky se odečte z opravy.",
         en:"PC won't start, crashes, runs slow or loud? I'll find the cause and fix it. The diagnostics fee is deducted from the repair price.",
         es:"¿El PC no enciende, se cuelga, va lento o hace ruido? Encuentro la causa y lo soluciono. El coste del diagnóstico se descuenta de la reparación."} },
 { id:"dns", remote:true, onlyRemote:true,
   price:{cs:"od 800 Kč",en:"from CZK 800 (≈ €32)",es:"desde 800 CZK (≈ 32 €)"},
   name:{cs:"Nastavení domény a DNS",en:"Domain & DNS setup",es:"Configuración de dominio y DNS"},
   desc:{cs:"Záznamy A, AAAA, CNAME, MX a TXT (SPF, DKIM, DMARC). Propojím doménu s webem i e-mailem.",
         en:"A, AAAA, CNAME, MX and TXT records (SPF, DKIM, DMARC). I'll connect your domain to your website and email.",
         es:"Registros A, AAAA, CNAME, MX y TXT (SPF, DKIM, DMARC). Conecto tu dominio con tu web y tu correo."} },
 { id:"web", remote:true,
   price:{cs:"od 3 499 Kč",en:"from CZK 3,499 (≈ €140)",es:"desde 3.499 CZK (≈ 140 €)"},
   name:{cs:"Redesign webu",en:"Website redesign",es:"Rediseño web"},
   desc:{cs:"Starý web předělám do moderní podoby: nový vzhled, mobilní verze, rychlejší načítání a základní zabezpečení.",
         en:"I turn an outdated website into a modern one: fresh design, mobile version, faster loading and basic security.",
         es:"Convierto una web anticuada en una moderna: nuevo diseño, versión móvil, carga más rápida y seguridad básica."} },
 { id:"remote", remote:true, tag:false,
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

const TJLOGO="data:image/webp;base64,UklGRiQTAABXRUJQVlA4IBgTAABQdACdASqQAZABPkkkkEYioiOpIXHZWSAJCWduzRQkncZ7X5Qw0Fe5X7r/M3Or2t2458j3+hfAjyWXwCunExp9M+eD/geu/7ufcE/VTqP+Yf9qv2q96X0T/4D1AP7Z/rutQ9A39u/Tf9m79zfSx1VwQBxFwAd3tNRmbNET1rwJxIBrXWYtIlFVNQ7dh7kOyn2N3R/4EyRzAipYuzVMg4i0bPDR4i/7gXY1Tne+ogiX3UIZiBr9P3guD+kkTzQN/K++SF+r4mV7r80SkWSjV+gqotZCKb+YlOQAOJlfckna0sP/ieS8Y5FKYgYhmC1IqaeQ59XlrdN339U90Zph7z+ANt6/aAfGtNLO2azoBWVR5sd9ghJBXBZl+etZBABXdH0+H8csLg6x+kv41MzhpgJRs440rMfr+vCT6I1bWoa7NZj/WMT0wdif1Wv0zESVoZLgxx3+u3Brm8u964p5D5udzfmJhdhjlsXaMHg+FjVOJeVGYUWeTDsKTWJIIYn7XRaSLATG0WX0fkDXn4yxYyVosctUeZenRLpceP/F0u2GEmC2z/3iDVWiurMVsYQv+YJHvcLRp0nt8XWMumqT+QQ1dWjg2+tdtK3ZFdBkEI66uFS7J0Klm8OFjVm0jgpUpL9rd790uT6H3XDqypX01KirOX3hvfKuUzruaYty28R4P5duGGL++4XWtK3J+EABglLtcSJL/OUwGEh0XVKOM53ThzNioYUytnSq/TRsS93R4LFGJHqBzcIUlG5oi814pFfJEMjxQmJ+1ZglfsxT2VRyEqhOixn2Fh5fhyQMwovpwLYfNJys8QsRQb8TlvXgZ3lVqxzHLDOzv3UKrLfk5UY3b+F8CjGE0fh8fXIc+GKFYhZxjr2VAFgjujbd7Um9TW8jx6Xcut+ODlp8gqPnBoOk2OVrJ6alw+Fy1dtuIP3jg1wTw8WIJViunI0QYMymFMlgI4Y/GKLnjDZVkyEyrkj7YpOO38AfStQbgrXsyEyEwMa1wbwOTOcenMI2PKSvsALqcTTf11KAy7Jutvt/GdqxtO32+Yoq7t/Unca7Vkbd2FjBbvx8ts1fQeCNOEax+eMsJwxdL7uNoQDX9fM1FbWDh5B15A7VVKOLGz1abc1G6LMwsDXseH+QsuiTsKghHUuNv30Ds+uplH/++/+2SY/17bPh5MPtPfQPFHLDXgGeGK6b5dyk5pXT8nTEC7TK8rp/1cpj3viz5m2b0wufVygu4aZXxJFLMP3x/QAA/XUGD7P/ZHp75TP36Ze5wU4rxduxYwxuj70ts+a1Z5wB9KnhEwQSlNtY3j4cPDRc/cfFigw9XyMnMdaewfZeS4LsZpgn8fafD5N6QdDsiRhxNR/lv581ncfrV6CA2g8FAprYPkdlZQ4H/1DbvMTkVVKbtt8AxHnnucYkueAvOIDC14WWIN3CojV8YwGKBM3i8+fzkuxzHlCpbB1Q9vttrQrA68CU6rQWW/OSKUe/e+GaGOG2k34RVBUjjqkISLhSnFiE9DH+7l+PqOmwWSCF6zKzO6TUtfawJc2Rzf/rGrIbL9o0AaO49E4YzbAcoDiY85qJq5lzCk86p8vbnxh+4E3Dt1URoj7dPDc4TWTaaiyMo/FPeh9RwSMMn/VfC59ikp1KrcPKqNnoTUIFQhMA3L532pId1lCbTZVwuLI8moX/Tx/Qsc2tWak36GEEo01gQU5+OqfXPyxUra/kLyZv/Ypzg+NL2Mws9NDC/1qEJ2ZrfTMHeFkxh5G2RgcfeXpxRJ4Uw+QwzrtcrGToilLZsFEr6k48E0Ex8/D49LfbDqeiWzwLYr5mR/V9fnd8+GLKrL1u1UuEYGnTjdCrVc1zdnwXv/8y//cz/5sVBL2fvkkgU2GL8/m4mLmBHPxUTSpkAoEvl4PTXj3dzQzjV9QQlN/w8NFT4loPCLX5IvXV9WNXfhvQntPTnb9+S73dV1bslJOZycF8+/jUTcaHFAGEjOLd8j10BvTmgheOisuHL/V4BLhDwMB4bahniJ1yoD+qZwGpTI6FKIkZSJdbqCk28pF6L/YAzdeVvZBGuvhNzsmeFz7HDrV3iVAm94X8/Q1jIwVbG2bLgYiGRGekRrGa2Oe39b1iuKkuc6vyyc2PbPHLRzXhc4qWlJn/HwCn9AuSlRNyPc8mzprXI7adVOgC65caUQtI8uMsaOY3EUqkI/Jz34bdNtwcpGe12bF1lAgUo7wjwVxeMNqCVU+2LWB6EX8xW8FZDy9wb9TIdT+XK5HNW5weuC1lYJPCSiAQZq5qO4tYonnn4T9KYW/EnwCB62ZwL0DKVj/9CaYZYUd30XSuBpRf1RZgPoLqIyOkvbGMdu2UJWwDWu3lhSFaEmxCm+I6YZ7bwTE2tT3U31/Y4Ug1qtFvU3Fg8zADyt5+jDLtjPW3Csy13XiR2FcOPxv9+QPEIs+Ftgg7NMfa6yG4xwr0NOK/TaK8QQJi7JFRGWCBBTgvil3AUPDCV1Sa12APUFzwq9qFVlr1yLlsrFXBRQkrIFZ4D0YvKDod3Y4BLVYgfh0QG74oRzVRj09KN9T61kI+6uKFQtR1MhpoAbI0BF/IEZlJQPKaqYcviyUTb3wUe2ro9ACnSOzZjKhsfrbyhfBa5lwDSkxjv4HqHatzOwv+NNTiX8WRn/G68KyttT7e85Ilm2AeVGGg5PIK04akoz2oP/cp9k/WR+jPaKKnx609b7FI04U45B36SHNw4t17WfqKzvn3pt0KBUNB81n2GviTH2DGqBNn73/NN8u2O2BRFtDXrCeYnsAbGlhrpLFcLAFtMule4cEXqJisvkZjoTSwgegDkqNUegczK17u92qoVmF0fhum7nSWn2wVjgQR7Tx0LqCFLnMxx4Aq72YGYlaG2u/Ib7+9lZcxbBPm85dlpcpzlWLDRTv9Z59OQ9dq+hKm7O866/wywOBxa0AJUy2y2kwlZnS3uwSHb2IRW7vFZCHF0fChnYMWLRs3rMOhAyTX6n/QLLF621BLBuv8indrlmTEmrLXQfZUQsxq45iNdIIltWFmOX10PIq3s1Dg+01RQL9h8YRyQdz82RTXn0QUyTh8J15ABHFRsvWgcvILC0IbMf3Z51E6C8gdWget14cRf2d7iw2RsbzeZbcx8uMGHgcQpPCOhNo0qGs78R8hTA4nAacQWH48mcdZSaj7lcKAlXHHQfp6QHOrGd9rcp6y1RxWnK2MN0Hf+nzDjn6mhj4WByWZkerJI3nMZzHox9lSxByEVrFe17qN/tTiGmYuFyEGioYNpaGLxguoHHPTr/zMehM6mdhR3wbBDYSr1Usr56kx+vAQV9O4gWMufG2+0EpmkKbq6P+DHp0/6NHCJr8ZHj7oZLMfeaLYQNlNb6rXF7BhKyzbtIp9g0V675a4sqaGg9iW4qOGoX45K9dmhHSvyNJEA2lbZKwBAa2xuegaQf0yyDLkPfPzu263QT41+f+8EVX8bLqcSYFvg2+dmA6Jq8siKvE4yXv9JfqUSpCM9zFnobpjwHeIxp6Rw8HD7EsC1Kp1oJrubaxwl1WGIqn96fAFKZ525a93ELZGkUooz4hYBCQfBxqV7B+86WFW/Lq23FD6trsMijbIuICDQOKdrvsJqwf0gtaW2R20T0QBers/HjLMpny38vVDUGddbmawySxwyDAVsBjryswD/txLkKzD0Z9sifaoZAletAVkY6qXAD78SEyuyt+KPydWquFMxrXOs9ucMe/bz0Q8D/hyh+F5jT3w3mYDmjD4Q7M9lDBxxHA5FNZuHyr7FsP5wJPuooS2yX7Gcggn/bmcHxtZDwU/crXn8cQOl+boYZAxKOCJ+YxUIfUR5rydnmS0LgI5QPL1p729QnssSuQ7nMU3rFlt5fYrdtyvou3qtIYLMPtB2xcPRgDdb98KEL/mfizBmAdW3cdxzTXyjElObxe8cmvzxOBK9DbWVwxmCKd0lsYpaZ89q4Qnvxcn5Mq0+aKK/1xbsz8MxQ84oLsalnuoPK/JAO6sp9eivx1kG0TfT+m80kYC962A/1FVVlBkuMk2UOg8fbPuhvr4h44KZ4+VdnRRWS7+hC8y+S6gNY14iBmXkAcWE5mMi5nPUK+aTOncO9fq/PoyIcqLcw0NJ8yUPKdZi440X9/EMFCOafn5PMmupGwvQFhymDv3/z+dGCN0GUbX1g2UfYzZoYcOvyU9kynVnmDU+nQD6KiKd8v+fLzvXiaVet9NlMkZltqENsUdnkdiESGq9kdEdwemkLI3ys7K0+vxwwe09VTdWZBSlAY1wRY1Myye3QcoZMffXGh1t2GmXYezGqTWCVcQGLEc8N7nCdjN84Z/1mV3oj786NVePPrhvJpdaFH9SpZEtPqK7gBXdEN/oi7g9M1VTMyqJBjMKRSdvrDrg3cpDf85Z+sw1lLoK/+oRdlNfRxnpLpM3VJ+JKHbCugk/MTuO558V3tR+8JtmQqjfRftOTVhCp50zTyvw2LiFJPo/4Tq9LLXnp1wi+GO5guS46Nr6B7c7K9tQ9Ou4SsJB6CCh1n+OO3HwtvpCuQJkP/t5oVfE599qhu2bG5mxDgV6xRs2Q8dUsNrwU7qGYQo6+4wyxy77SxTvP8BRteLH0jpdL03Pz4hGTy8ehVoapZge2q2BFLfsKeqn2cq1riDB97N3L6nTmWUZ5pOktByfAMbXa6XqdhCUsQ3U9ziYtxOY1OlUIcoeyO9jzeJ1coGyD6nc5K9wI9vTyzE5O0IUZ6/zxNMDfd0yQzS/+ZD3fJpPUYx5C9EVWSBRYTYpwxhBLwYBGC810WnFT3TXOryTO42DnBR21w3xpnP+VUmWmYRESIOO3wPcnoRc6HnSzWJxrSl7V+KFD9/crcvr6id3NDCGYhNnY1JzuQYYgzVodwcCbiRw4oUoZ4DQqC/GA2OxC+zRcoJ6jU0vCCFBKc6pXZQJZvviJLCqAAIw4LX3AOuwzWEVzRAcE2GcyusJbZfu40MEyKezgoqnwIsZyxWM4A4yYCdDqA7Td30DbVxPelw4UEv/8ThMp6KLzrWPz0KnXdcV+erYVyYha1LPitkLy9FYplhiJVH6Ny/Jgh5TrkdLJa16DgZ0ygczNn4pAioJq0+XcPsTbsotsDJCzqVjsUW+y1FduQib7Ye9mXBCscHrKFD/pCKwafjH1bnprYff6xUNq7Vp5kfYtSfETbLlztD26UONy7lpy+LvR2fbkL6fFVuwqkt047g2gMafxB1jrz3FLN4vQwPc3UyvaqWholeZ3VjHKRLckjGKjQ9KmY2s6vpaCNj2xQL/dmeoWY1JuAmhgQtLrtcH/vQRZ86Jqf+ExfBfPf8E0IV7pTGjs1tled6EMehrrWRtSEwCoLDUnhRfmlLq/v3Qeqi2E0GMxY0LmatG5lAYdD4M3HZNrqaWucFmV68NRncFduvaAzl+CB7miCw/M2QQaKJ3Woem24f3NqxVOCYM/uA38Q6yqiXOJGGDQCoZ09MpccvCnCP4wfjWshGGsS1bWZTPN99P6ALdqdK2qNtR8yaU10d/dQ1rKgWmPPNayDcSpQ9QrjOCn0gJH/1LiQW72Uw+21hQbUPh+YYj9BF3LmRpf5YGrJvSj4R5qSydNUTzOHC4fxtPTrEDPWrix4+b3uVew/cBmEkcLKmktOR0wCgjtO9Hh8s4BRMzaN+u6zmVExraqXWL/SwMb83ForrQoTPIeAf7A8w9pn5Z8GoKwPT4UfOT+9wJzJRawHCZhwDjW48xGS7dfLI4OX3bt642gy2mdT22oPghR5RqmmeTChWqeuK4Y00e/qvMTd2W0Zb9JZS7LJNqYxT2SduH29nqbQYoREej7Cip6cmnLDpw8a87DkesD9rd6BJtUa5OdZgrbbaiEaIvUHznE2iKwMkcLIUbvAFzuIaqF6wKuzV8uz+0aPp7FyGGAnKDBo2D/R0PyzNpjdq9QCNPun4/hsKftGD3ff0xdhfHTOnoN+8LHyqNQyBVEA3Xvf0XCUeEO7VgCEBABae3IkXFCH4tLec0E3ElnFXkxx3toEpbz/Iz+K4IYU85YmjP7OIfDk3uWhCliDT3W2zCBxkfNX9VJkx8A5Mh22jdv1UNEYznXJ7oe01wjD7DhvLkSuRKioQdzL6IV7mZM2UrNcUHy1fSSkgrZrDs1AbhI6lImXzsBbXnnI80fym2sicWWVZwPP10zSwgR1vAsHrlq/S9SQlVKOJSrYY8aQwKOjgxHvwqhRbpGHJY+DHklSHcyyZewAFBSmKPlnAM46qv1Y9icS+xJSzg2VDVBlLMw9m9XlUtetvax46qh8D4kl55Ecq9NUBtgzUTEqjsMEFYmYbRuwodXN5pWAkbittb4gh177ANezVo8XIMaJgHn0X7O9KnUHuE6jnlIxSoi+bnxkCQBdhNLkJQAw0tNcHL1pUQMv87p90vKYGFdVtkS33fj1cCMBL11dysKSbfnnlq0gdY1wd0XzhiUDTd0hp/5mEAWS9Z0wLuHnxC/xmMF8Vzbr3rAiWsef8tiypAwfs70rrVsza9bUL0NWiwAAA";
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
function renderPortfolio(){
  const box = $('pfList'); if(!box) return;
  box.innerHTML = "";
  PORTFOLIO.forEach(p=>{
    const a = document.createElement('article');
    a.hidden = pfFilter!=="all" && p.cat!==pfFilter;
    a.innerHTML = preview(p) + `<h3><span class="t"></span></h3><p></p><ul class="tags"></ul>`;
    a.querySelector('.t').textContent = p.title[lang];
    if(p.wip){ const m=document.createElement('span'); m.className='mini'; m.textContent=t("pf.wip"); a.querySelector('h3').appendChild(m); }
    if(p.url){ const l=document.createElement('a'); l.href=p.url; l.target="_blank"; l.rel="noopener"; l.textContent=t("pf.view"); a.querySelector('h3').appendChild(l); }
    a.querySelector('p').textContent = p.desc[lang];
    p.tags.forEach(x=>{ const li=document.createElement('li'); li.textContent=x; a.querySelector('.tags').appendChild(li); });
    box.appendChild(a);
  });
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
addEventListener('storage', e=>{ if(e.key===CART_KEY){ updateCartUI(); if($('ckItems')) renderCheckout(); } });

/* ===== Objednávka (checkout) ===== */
let urlServiceAdded = false;
function selectedIds(){ return [...document.querySelectorAll('#ckItems input:checked')].map(i=>i.value); }
function selectedServices(){ return selectedIds().map(findService).filter(Boolean); }
function renderCheckout(){
  const box = $('ckItems'); if(!box) return;
  /* starší odkazy /orders/?service=xxx přidají službu do košíku */
  const p = new URLSearchParams(location.search).get('service');
  if(p && !urlServiceAdded && (p==="other" || findService(p))){ urlServiceAdded = true; const c=getCart(); if(!c.includes(p)) setCart([...c, p]); }
  const c = getCart();
  box.innerHTML = [...SERVICES.map(s=>[s.id, s.name[lang], s.price[lang]]), ["other", t("o.other"), ""]].map(([id,n,pr]) =>
    `<label class="pick"><input type="checkbox" value="${id}"${c.includes(id) ? " checked" : ""}><span class="pk-n">${esc(n)}</span><span class="pk-p">${esc(pr)}</span></label>`).join("");
  $('ckMsg').placeholder = t("ck.msgPh");
  $('ckWhen').placeholder = t("ck.whenPh");
  updateSummary();
}
function updateSummary(){
  const ids = selectedIds(), ss = selectedServices();
  $('sumList').innerHTML = ids.map(id=>{ const s=findService(id);
    return `<li><span>${esc(s ? s.name[lang] : t("o.other"))}</span><b>${esc(s ? s.price[lang] : "")}</b></li>`; }).join("");
  $('sumEmpty').hidden = ids.length > 0;
  /* Sestavení PC: záloha na komponenty předem (ostatní služby se platí až po dokončení) */
  const dep = ids.includes("build");
  document.querySelectorAll('[data-i18n="ck.payH"]').forEach(el=>{ el.innerHTML = t(dep ? "ck.payHb" : "ck.payH"); });
  document.querySelectorAll('[data-i18n="ck.pay"]').forEach(el=>{ el.innerHTML = t(dep ? "ck.payb" : "ck.pay"); });
  /* Osobně jen v Česku; Španělsko a zbytek Evropy zatím jen na dálku */
  const onsiteOnly = ss.some(s=>!s.remote), remoteOnly = ss.some(s=>s.onlyRemote), abroad = isAbroad();
  const rem = $('modeRemote'), ons = $('modeOnsite');
  rem.disabled = onsiteOnly;
  ons.disabled = abroad || (remoteOnly && !onsiteOnly);
  $('remoteNa').hidden = !onsiteOnly || abroad || remoteOnly;
  $('mixNote').hidden = !(onsiteOnly && remoteOnly) || abroad;
  const ab = $('abroadNote');
  if(ab){ ab.hidden = !abroad; ab.textContent = abroad ? t(onsiteOnly ? "ck.abroadNa" : "ck.abroadRemote") : ""; ab.classList.toggle('warn', abroad && onsiteOnly); }
  if(ons.disabled) rem.checked = true; else if(rem.disabled) ons.checked = true;
  $('addrWrap').hidden = abroad || !ons.checked;
}
function isAbroad(){ const c=$('ckCountry'); return !!c && c.value !== "cz"; }
function countryFromLocation(){
  let tz=""; try{ tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; }catch(e){}
  if(tz==="Europe/Prague") return "cz";
  if(["Europe/Madrid","Atlantic/Canary","Africa/Ceuta"].includes(tz)) return "es";
  return "eu";
}
function collectOrder(){
  const v = id => $(id).value.trim();
  const items = selectedIds().map(id=>{ const s=findService(id); return { id, name: s ? s.name[lang] : t("o.other"), price: s ? s.price[lang] : "" }; });
  return {
    name:v('ckName'), email:v('ckEmail'), phone:v('ckPhone'),
    items, service: items.map(i=>i.name).join(", "),
    country: $('ckCountry') ? $('ckCountry').selectedOptions[0].textContent : "",
    mode: ($('modeOnsite').checked && !isAbroad()) ? t("ck.onsite") : t("ck.remote"),
    address: ($('modeOnsite').checked && !isAbroad()) ? v('ckAddr') : "",
    when:v('ckWhen'), msg:v('ckMsg'), lang
  };
}
function orderText(o){
  return [
    `${t("f.name")}: ${o.name}`, `${t("f.email")}: ${o.email}`, o.phone?`${t("f.phone")}: ${o.phone}`:"",
    "", `${t("f.services")}:`, ...(o.items||[]).map(i=>`– ${i.name}${i.price?` (${i.price})`:""}`), "",
    o.country?`${t("f.country")}: ${o.country}`:"", `${t("f.mode")}: ${o.mode}`,
    o.address?`${t("f.addr")}: ${o.address}`:"", o.when?`${t("f.when")}: ${o.when}`:"",
    "", `${t("f.msg")}:`, o.msg
  ].filter((x,i,a)=>x!=="" || (i>0 && a[i-1]!=="")).join("\n");
}
function initCheckout(){
  const form = $('ckForm'); if(!form) return;
  $('ckItems').addEventListener('change', ()=>{ setCart(selectedIds()); updateSummary(); });
  const cc = $('ckCountry');
  if(cc){ cc.value = countryFromLocation(); cc.addEventListener('change', updateSummary); }
  document.querySelectorAll('input[name="mode"]').forEach(r=>r.addEventListener('change', updateSummary));
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const o = collectOrder(), err = $('ckErr');
    if(!o.name || !o.email || !o.msg || !$('ckConsent').checked){ err.textContent=t("ck.err"); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(o.email)){ err.textContent=t("ck.errEmail"); $('ckEmail').focus(); return; }
    if(!o.items.length){ err.textContent=t("ck.errItems"); $('ckItems').scrollIntoView({block:"center"}); return; }
    if(isAbroad() && selectedServices().some(s=>!s.remote)){ err.textContent=t("ck.abroadNa"); return; }
    if($('modeOnsite').checked && !isAbroad() && !o.address){ err.textContent=t("ck.errAddr"); $('ckAddr').focus(); return; }
    if($('ckHp').value) return; // ochrana proti robotům
    err.textContent = "";
    const btn = $('ckSubmit'); btn.disabled = true; btn.textContent = t("ck.sending");
    let sent = false;
    if(WEB3FORMS_KEY){
      try{
        const r = await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
          body:JSON.stringify({access_key:WEB3FORMS_KEY, subject:`${t("o.subj")}: ${o.service}`, from_name:"Corphik web", replyto:o.email, message:orderText(o)})});
        const j = await r.json(); sent = !!j.success;
        if(!sent) throw 0;
      }catch(_){ err.textContent=t("ck.fail"); btn.disabled=false; btn.textContent=t("ck.submit"); return; }
    }
    try{ sessionStorage.setItem('corphikOrder', JSON.stringify({...o, sent})); }catch(_){}
    setCart([]);
    location.href = "/orders/thanks/";
  });
}

/* ===== Děkovací stránka ===== */
function renderThanks(){
  const box = $('thBox'); if(!box) return;
  let o=null; try{ o = JSON.parse(sessionStorage.getItem('corphikOrder')||"null"); }catch(_){}
  $('thHas').hidden = !o; $('thNone').hidden = !!o;
  if(!o) return;
  $('thText').textContent = orderText(o);
  $('thMail').hidden = o.sent;
  const a = $('thMailBtn');
  a.href = `mailto:${EMAIL}?subject=${encodeURIComponent(t("o.subj")+": "+o.service)}&body=${encodeURIComponent(orderText(o))}`;
}

/* ===== Jazyk ===== */
function setLang(l, remember){
  lang = T[l] ? l : "en"; root.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed', b.dataset.lang===lang));
  renderServices(); renderPortfolio(); renderCheckout(); renderThanks(); renderWip(); themeLabel();
  const titles = {home:"h.area", portfolio:"pf.h", about:"ab.h", orders:"ck.title", thanks:"ck.title"};
  document.title = "Corphik – " + (PAGE==="home" ? t("h.area").split(",")[0] : t(titles[PAGE]||"h.area").replace(/<[^>]+>/g,""));
  if(remember){ try{ localStorage.setItem('lang', lang); }catch(e){} }
}
/* Přepínač CS/EN/ES: na úvodu přejde na jinou adresu (/, /en/, /es/), jinde jen přepne texty */
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{
  const l = b.dataset.lang;
  if(HAS_ALT && ALT[l]){
    try{ localStorage.setItem('lang', l); }catch(e){}
    if(l !== root.lang) location.href = ALT[l];
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

/* ===== Úvod: nápis CORPHIK, kde „O“ je černá díra (canvas) =====
   Díra se zhroutí, dokreslí se kolem ní disk a písmena z ní vyletí na svá místa.
   Pak po disku pořád obíhají tečky. Písmena jsou v /assets/img/wm-c.png (C)
   a wm-rphik.png (RPHIK + hvězda); barvu berou z motivu (--ink). */
function initBlackHole(){
  const cv = $('bhCanvas'); if(!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG_W = 640, IMG_H = 120, OX = 143, OY = 87;          /* střed „O“ v obrázku nápisu */
  const ROT = -9*Math.PI/180, TAU = Math.PI*2;
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const imgs = ["/assets/img/wm-c.png", "/assets/img/wm-rphik.png"].map(src => { const i = new Image(); i.src = src; return i; });
  let tinted = [], tintFor = "", ink = "", rgb = "0,0,0", dark = false;
  let W=0, H=0, s=1, ox=0, oy=0, hx=0, hy=0, R=0, visible=true, running=false, t0=0;
  const DOTS = Array.from({length:64}, (_,i)=>({ a: i/64*TAU + Math.random()*0.05, r: 0.97 + Math.random()*0.06 }));
  const BIG = [{a:0.4, v:0.55, z:2.6}, {a:2.6, v:0.38, z:2}, {a:4.4, v:0.47, z:2.2}];
  function colors(){
    const v = getComputedStyle(root).getPropertyValue('--ink').trim() || "#000";
    if(v === ink) return;
    ink = v; const h = v.replace('#','');
    const n = h.length === 3 ? h.split('').map(c=>parseInt(c+c,16)) : [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));
    rgb = n.join(','); dark = (n[0]+n[1]+n[2]) > 384;
  }
  function tint(){
    if(tinted.length === 2 && tintFor === ink) return;
    if(!imgs.every(i => i.complete && i.naturalWidth)) return;
    /* písmena v barvě textu + kolem nich tenký okraj v barvě pozadí, aby disk šel „za“ ně jako v logu */
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim() || "#fff";
    tinted = imgs.map(i => { const c = document.createElement('canvas'), x = c.getContext('2d'); c.width = IMG_W + 16; c.height = IMG_H + 16;
      for(let k = 0; k < 16; k++){ const a = k/16*TAU; x.drawImage(i, 8 + Math.cos(a)*5, 8 + Math.sin(a)*5); }
      x.globalCompositeOperation = 'source-in'; x.fillStyle = bg; x.fillRect(0,0,c.width,c.height);
      x.globalCompositeOperation = 'source-over';
      const m = document.createElement('canvas'), mx = m.getContext('2d'); m.width = IMG_W; m.height = IMG_H;
      mx.drawImage(i,0,0); mx.globalCompositeOperation = 'source-in'; mx.fillStyle = ink; mx.fillRect(0,0,IMG_W,IMG_H);
      x.drawImage(m, 8, 8); return c; });
    tintFor = ink;
  }
  function size(){
    const b = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    W = b.width; H = b.height; cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
    const wd = Math.min(W*0.86, 620, H*2.4); s = wd/IMG_W;
    ox = (W - wd)/2; oy = H*0.56 - OY*s; hx = ox + OX*s; hy = oy + OY*s; R = 26*s;
  }
  const col = a => `rgba(${rgb},${a})`;
  /* bod na disku: úhel a, poměr poloměru k */
  function pt(a, k, rx, ry){ const x = Math.cos(a)*rx*k, y = Math.sin(a)*ry*k;
    return [hx + x*Math.cos(ROT) - y*Math.sin(ROT), hy + x*Math.sin(ROT) + y*Math.cos(ROT)]; }
  function frame(now){
    colors(); tint();
    const t = reduce ? 99 : (now - t0)/1000;
    const eh = ease(t/0.9), ed = ease((t - 0.25)/1.3), el = ease((t - 0.55)/1.2), ea = ease((t - 0.9)/0.9);
    const Rk = R*(0.4 + 0.6*eh), rx = R*5.4, ry = rx*0.17;
    ctx.setTransform(Math.min(2, devicePixelRatio || 1),0,0,Math.min(2, devicePixelRatio || 1),0,0);
    ctx.clearRect(0,0,W,H);
    ctx.lineCap = 'round';
    /* záře */
    const g = ctx.createRadialGradient(hx, hy, Rk, hx, hy, R*3.4);
    g.addColorStop(0, col(dark ? .16 : .045)); g.addColorStop(1, col(0));
    ctx.globalAlpha = eh; ctx.fillStyle = g; ctx.fillRect(0,0,W,H); ctx.globalAlpha = 1;
    /* zadní půlka disku */
    ctx.strokeStyle = col(.4); ctx.lineWidth = Math.max(1, 1.3*s);
    ctx.beginPath(); ctx.ellipse(hx, hy, rx, ry, ROT, Math.PI, Math.PI + Math.PI*ed); ctx.stroke();
    /* obíhající tečky (zadní) */
    const spin = t*0.35;
    ctx.fillStyle = col(1);
    const dots = (front) => {
      for(const d of DOTS){ const a = (d.a + spin) % TAU, isFront = a < Math.PI; if(isFront !== front) continue;
        const [x,y] = pt(a, d.r*0.88, rx, ry); ctx.globalAlpha = 0.45*ea; ctx.beginPath(); ctx.arc(x, y, Math.max(.7, 1*s), 0, TAU); ctx.fill(); }
      for(const b of BIG){ const a = (b.a + t*b.v) % TAU, isFront = a < Math.PI; if(isFront !== front) continue;
        const [x,y] = pt(a, 1, rx, ry); ctx.globalAlpha = ea; ctx.beginPath(); ctx.arc(x, y, b.z*s, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
    };
    dots(false);
    /* ohnutý obraz disku nad dírou + slabý pod ní */
    ctx.strokeStyle = col(1); ctx.lineWidth = 3.2*s;
    ctx.beginPath(); ctx.arc(hx, hy, R*1.38, Math.PI + 0.22, Math.PI + 0.22 + (Math.PI - 0.44)*ed); ctx.stroke();
    ctx.strokeStyle = col(.55); ctx.lineWidth = Math.max(1, 1.2*s);
    ctx.beginPath(); ctx.arc(hx, hy, R*1.16, 0.4, 0.4 + (Math.PI - 0.8)*ed); ctx.stroke();
    /* díra */
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(hx, hy, Rk, 0, TAU); ctx.fill();
    ctx.strokeStyle = col(dark ? .95 : .9); ctx.lineWidth = Math.max(1, 1.4*s);
    if(dark){ ctx.shadowColor = '#fff'; ctx.shadowBlur = 10; }
    ctx.beginPath(); ctx.arc(hx, hy, Rk*1.06, 0, TAU); ctx.stroke(); ctx.shadowBlur = 0;
    /* přední půlka disku */
    ctx.strokeStyle = col(1); ctx.lineWidth = 3.4*s;
    ctx.beginPath(); ctx.ellipse(hx, hy, rx, ry, ROT, 0, Math.PI*ed); ctx.stroke();
    dots(true);
    /* písmena vyletí z díry */
    if(tinted.length === 2 && el > 0){
      ctx.save(); ctx.globalAlpha = el;
      ctx.translate(hx, hy); ctx.rotate((1 - el)*-0.6); const k = 0.1 + 0.9*el; ctx.scale(k, k); ctx.translate(-hx, -hy);
      for(const c of tinted) ctx.drawImage(c, ox - 8*s, oy - 8*s, (IMG_W + 16)*s, (IMG_H + 16)*s);
      ctx.restore();
    }
    const busy = !reduce || tinted.length !== 2;
    if(busy && visible && !document.hidden) requestAnimationFrame(frame); else running = false;
  }
  function start(){ if(running) return; running = true; requestAnimationFrame(frame); }
  size(); t0 = performance.now(); start();
  imgs.forEach(i => i.addEventListener('load', start));
  let rt; addEventListener('resize', ()=>{ clearTimeout(rt); rt = setTimeout(()=>{ size(); start(); }, 150); });
  if('IntersectionObserver' in window) new IntersectionObserver(es=>{ visible = es[0].isIntersecting; if(visible) start(); }).observe(cv);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) start(); });
  new MutationObserver(start).observe(root, {attributes:true, attributeFilter:['data-theme']});
  const mq = matchMedia('(prefers-color-scheme: dark)'); if(mq.addEventListener) mq.addEventListener('change', start);
}

/* ===== Start ===== */
initCheckout();
initBlackHole();
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
