(function(){
  "use strict";
  var books=[],meta=null,page=1,pageSize=12,notes={},favorites={};
  var $=function(id){return document.getElementById(id);};
  function readObject(key){try{return JSON.parse(localStorage.getItem(key)||"{}");}catch(e){return {};}}
  function saveObject(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}}
  function normalize(value){var s=String(value||"").toLowerCase();if(s.normalize){s=s.normalize("NFD").replace(/[\u0300-\u036f]/g,"");}return s.replace(/[^a-z0-9]+/g," ").trim();}
  function escapeHtml(value){return String(value||"").replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];});}
  function stars(value){var n=Number(value)||0;return n?"★★★★★".slice(0,n):"Non noté";}
  function authorInitial(author){var words=normalize(author).split(" ");var first=words[0]||"";return first.charAt(0).toUpperCase();}
  function load(){
    notes=readObject("bk_notes");favorites=readObject("bk_favoris");
    Promise.all([fetch("data/index.json").then(function(r){return r.json();}),fetch("data/meta.json").then(function(r){return r.json();})]).then(function(values){
      books=values[0];meta=values[1];
      books.forEach(function(book){book.q=normalize(book.t+" "+book.a+" "+book.s);});
      fillOptions();
      $("library-summary").textContent=meta.books.toLocaleString("fr-FR")+" livres disponibles, sans téléchargement préalable";
      applyFilters();
    }).catch(function(){ $("book-list").innerHTML='<p class="empty">Le catalogue ne peut pas être chargé. Vérifiez la connexion Wi-Fi puis actualisez la page.</p>'; });
  }
  function fillOptions(){
    meta.categories.forEach(function(name){var o=document.createElement("option");o.value=name;o.textContent=name;$("category").appendChild(o);});
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function(letter){var o=document.createElement("option");o.value=letter;o.textContent=letter;$("author-letter").appendChild(o);});
  }
  function filteredBooks(){
    var q=normalize($("search").value),category=$("category").value,format=$("format").value,letter=$("author-letter").value,minRating=Number($("rating").value)||0,favs=$("favorites").checked;
    var out=books.filter(function(book){
      if(q&&book.q.indexOf(q)<0)return false;
      if(category&&book.c!==category)return false;
      if(format&&book.f.indexOf(format)<0)return false;
      if(letter&&authorInitial(book.a)!==letter)return false;
      if(minRating&&(Number(notes[book.i])||0)<minRating)return false;
      if(favs&&!favorites[book.i])return false;
      return true;
    });
    var mode=$("sort").value;
    out.sort(function(a,b){
      if(mode==="rating")return (Number(notes[b.i])||0)-(Number(notes[a.i])||0)||a.t.localeCompare(b.t,"fr");
      if(mode==="author")return a.a.localeCompare(b.a,"fr")||a.t.localeCompare(b.t,"fr");
      if(mode==="series")return (a.s||"zzz").localeCompare(b.s||"zzz","fr")||a.t.localeCompare(b.t,"fr");
      return a.t.localeCompare(b.t,"fr");
    });
    return out;
  }
  function applyFilters(){page=1;render();}
  function render(){
    var found=filteredBooks(),pages=Math.max(1,Math.ceil(found.length/pageSize));if(page>pages)page=pages;
    $("result-count").textContent=found.length.toLocaleString("fr-FR")+" livre"+(found.length>1?"s":"");
    var start=(page-1)*pageSize,current=found.slice(start,start+pageSize);
    $("book-list").innerHTML=current.length?current.map(function(book){
      var series=book.s?(" · "+escapeHtml(book.s)+(book.x?" "+escapeHtml(book.x):"")):"";
      var note=Number(notes[book.i])||0,fav=favorites[book.i]?" ★ Favori":"";
      return '<article class="book-card"><h3>'+escapeHtml(book.t)+'</h3><p class="author">'+escapeHtml(book.a)+'</p><p class="meta">'+escapeHtml(book.c)+series+' · '+escapeHtml(book.f.join(", "))+'</p><p class="rating-line"><span class="stars">'+stars(note)+'</span>'+fav+'</p><a class="button primary" href="livre.html?id='+book.n+'">Voir le livre</a></article>';
    }).join(""):'<p class="empty">Aucun livre ne correspond à ces filtres.</p>';
    $("pagination").innerHTML='<button type="button" class="secondary" id="previous"'+(page<=1?' disabled':'')+'>← Précédent</button><span>Page '+page+' / '+pages+'</span><button type="button" class="secondary" id="next"'+(page>=pages?' disabled':'')+'>Suivant →</button>';
    $("previous").onclick=function(){if(page>1){page--;render();window.scrollTo(0,document.getElementById("results-title").offsetTop);}};
    $("next").onclick=function(){if(page<pages){page++;render();window.scrollTo(0,document.getElementById("results-title").offsetTop);}};
  }
  $("filters").onsubmit=function(e){e.preventDefault();applyFilters();};
  ["category","format","author-letter","sort","rating","favorites"].forEach(function(id){$(id).onchange=applyFilters;});
  $("reset").onclick=function(){$("filters").reset();$("search").value="";applyFilters();};
  load();
}());
