(function(){
  "use strict";
  var $=function(id){return document.getElementById(id);};
  function readObject(key){try{return JSON.parse(localStorage.getItem(key)||"{}");}catch(e){return {};}}
  function saveObject(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}}
  function escapeHtml(value){return String(value||"").replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];});}
  function getId(){var match=location.search.match(/[?&]id=(\d+)/);return match?Number(match[1]):-1;}
  function render(book){
    document.title=book.t+" · Bibliothèque Kobo";
    var series=book.s?'<p class="meta"><strong>Série :</strong> '+escapeHtml(book.s)+(book.x?' · '+escapeHtml(book.x):'')+'</p>':'';
    var year=book.y?'<p class="meta"><strong>Publication :</strong> '+book.y+'</p>':'';
    var downloads=book.l.map(function(link){var url='https://drive.google.com/uc?export=download&id='+encodeURIComponent(link.i);return '<a class="button primary" rel="noopener" href="'+url+'">Télécharger '+escapeHtml(link.f)+(link.z?' · '+link.z+' Mo':'')+'</a>';}).join('');
    $("book-detail").innerHTML='<p class="eyebrow">'+escapeHtml(book.c)+'</p><h1>'+escapeHtml(book.t)+'</h1><p class="author">'+escapeHtml(book.a)+'</p>'+series+year+'<p class="meta"><strong>Formats :</strong> '+escapeHtml(book.f.join(", "))+'</p><p class="description">'+escapeHtml(book.d)+'</p><h2>Ma note</h2><div id="rating-buttons" class="rating-buttons"></div><button id="favorite-button" class="favorite-button" type="button"></button><h2>Téléchargement</h2><p class="notice">Si Google le demande, connectez-vous une fois avec le compte de Gwendoline. Le livre téléchargé apparaîtra ensuite dans <strong>Mes livres</strong>.</p><div class="download-list">'+downloads+'</div>';
    setupPersonal(book);
  }
  function setupPersonal(book){
    var notes=readObject("bk_notes"),favorites=readObject("bk_favoris"),box=$("rating-buttons"),fav=$("favorite-button");
    function refresh(){
      box.innerHTML="";for(var n=1;n<=5;n++){var b=document.createElement("button");b.type="button";b.textContent=(Number(notes[book.i])===n?"✓ ":"")+"★"+n;b.setAttribute("data-rating",n);b.onclick=function(){notes[book.i]=Number(this.getAttribute("data-rating"));saveObject("bk_notes",notes);refresh();};box.appendChild(b);}
      fav.textContent=favorites[book.i]?"★ Retirer des favoris":"☆ Ajouter aux favoris";
    }
    fav.onclick=function(){if(favorites[book.i])delete favorites[book.i];else favorites[book.i]=true;saveObject("bk_favoris",favorites);refresh();};refresh();
  }
  var id=getId();if(id<0){$("book-detail").innerHTML='<p class="empty">Livre introuvable.</p>';return;}
  var chunk=String(Math.floor(id/100));while(chunk.length<3)chunk="0"+chunk;
  fetch("data/details-"+chunk+".json").then(function(r){return r.json();}).then(function(items){var book=null;for(var i=0;i<items.length;i++){if(items[i].n===id){book=items[i];break;}}if(!book)throw new Error("missing");render(book);}).catch(function(){$("book-detail").innerHTML='<p class="empty">Le détail de ce livre ne peut pas être chargé. Vérifiez le Wi-Fi puis réessayez.</p>';});
}());
