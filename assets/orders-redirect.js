/* Corphik – staré adresy /orders/: podrobná poptávka se zrušila, služby, košík i zpráva jsou na úvodu.
   Odkazy /orders/?service=build,web přidají služby do košíku a přesměrují na formulář.
   Cílová adresa je v data-to na <script> (jazyková verze). Samostatný soubor kvůli Content-Security-Policy. */
(() => {
const to = (document.currentScript && document.currentScript.dataset.to) || "/#w-ask";
try{
  const add = (new URLSearchParams(location.search).get('service') || "").split(",").filter(Boolean);
  if(add.length){ const c = JSON.parse(localStorage.getItem('corphikCart') || "[]"); localStorage.setItem('corphikCart', JSON.stringify([...new Set([...c, ...add])])); }
}catch(_){}
location.replace(to);
})();
