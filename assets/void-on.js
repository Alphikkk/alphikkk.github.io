/* Corphik – úvod: třída .void-on hned na začátku, ať se obsah „uvnitř“ díry neukáže ani na okamžik.
   Samostatný soubor kvůli Content-Security-Policy (script-src 'self' nepovolí skript přímo v HTML). */
document.documentElement.classList.add('void-on');
