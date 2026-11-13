(function(){
'use strict';
var CFG=window.DEVYBE_CONFIG||{}, FIXED=window.DEVYBE_FIXED||[];
var LIVE=!!(CFG.SUPABASE_URL&&CFG.SUPABASE_ANON_KEY&&window.supabase);
var sb=LIVE?window.supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY):null;
var ORIGIN={lat:13.7466,lon:100.5347,label:'Chula–Siam',radius:5000};

/* ---------- categories (same set as the app) ---------- */
var CATS=[
 {id:'restaurant',label:'Restaurants',pin:'#E8573F',dur:'45–75 min',indoor:true,icon:'M7 3v7a2 2 0 004 0V3M9 3v18M17 3c-2.200 1.600-3 4-3 7 0 1.600 1 2.500 3 2.500V21'},
 {id:'cafe',label:'Cafés',pin:'#B07142',dur:'30–60 min',indoor:true,icon:'M4 9h12v5a5 5 0 01-5 5H9a5 5 0 01-5-5V9zM16 10h1.500a2.500 2.500 0 010 5H16M8 3c0 1.500 1 1.500 1 3M12 3c0 1.500 1 1.500 1 3'},
 {id:'shopping',label:'Shopping',pin:'#8F6BC4',dur:'60–90 min',indoor:true,icon:'M5 8h14l-1 12H6L5 8zM9 8V6.500a3 3 0 016 0V8'},
 {id:'market',label:'Markets',pin:'#D9961C',dur:'45–75 min',indoor:false,icon:'M3 9l2-5h14l2 5M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0M5 12v8h14v-8M10 20v-4h4v4'},
 {id:'park',label:'Parks',pin:'#4F9250',dur:'45–90 min',indoor:false,icon:'M12 21v-6M7 15a4 4 0 01-.500-7.900A5 5 0 0112 3a5 5 0 015.500 4.100A4 4 0 0117 15H7z'},
 {id:'museum',label:'Museums',pin:'#3F86C2',dur:'60–90 min',indoor:true,icon:'M3 9l9-5 9 5H3zM6 9v8M10 9v8M14 9v8M18 9v8M4 20h16'},
 {id:'books',label:'Books',pin:'#5D6DB8',dur:'30–60 min',indoor:true,icon:'M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM5 17a3 3 0 013-3h10'},
 {id:'heritage',label:'Temples',pin:'#98703F',dur:'30–60 min',indoor:false,icon:'M12 3v3M12 6l-3 4h6l-3-4zM8 10l-3.500 4h15L16 10M6.500 14v6M17.500 14v6M4 20h16'},
 {id:'sport',label:'Sports',pin:'#6FA32D',dur:'60–90 min',indoor:true,icon:'M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12'},
 {id:'attraction',label:'Sights',pin:'#E8791F',dur:'30–60 min',indoor:false,icon:'M12 3l2.700 5.600 6.100.900-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.900L12 3z'},
 {id:'activity',label:'Things to do',pin:'#C44F93',dur:'90–150 min',indoor:true,icon:'M3 9V7a1 1 0 011-1h16a1 1 0 011 1v2a2.500 2.500 0 000 6v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a2.500 2.500 0 000-6zM14 6v12'}
];
var CAT={};CATS.forEach(function(c){CAT[c.id]=c});
var ALLOW={
 restaurant:{amenity:['restaurant','fast_food','food_court']},cafe:{amenity:['cafe','ice_cream']},
 shopping:{shop:['mall','department_store','supermarket','convenience','clothes','fashion','beauty','gift','art','craft','variety_store','electronics','toys','jewelry','sports']},
 market:{amenity:['marketplace'],shop:['market']},park:{leisure:['park','garden','nature_reserve','dog_park']},
 museum:{tourism:['museum','gallery'],amenity:['exhibition_centre']},books:{amenity:['library','public_bookcase'],shop:['books']},
 heritage:{amenity:['place_of_worship'],historic:['temple','monument','memorial','ruins','archaeological_site','shrine']},
 sport:{leisure:['fitness_centre','sports_centre','swimming_pool','stadium','dance'],amenity:['dojo']},
 attraction:{tourism:['attraction','viewpoint','artwork'],historic:['castle','fort','city_gate']},
 activity:{leisure:['bowling_alley','escape_game','amusement_arcade','miniature_golf','trampoline_park','water_park'],amenity:['cinema','theatre','arts_centre'],tourism:['theme_park','zoo','aquarium']}
};
var QUERY={
 restaurant:'nwr[amenity~"restaurant|fast_food|food_court"][name]',cafe:'nwr[amenity~"cafe|ice_cream"][name]',
 shopping:'nwr[shop~"mall|department_store|supermarket|convenience|clothes|fashion|beauty|gift|art|craft|variety_store|electronics|toys|jewelry|sports"][name]',
 market:'nwr[amenity=marketplace][name];nwr[shop=market][name]',park:'nwr[leisure~"park|garden|nature_reserve|dog_park"][name]',
 museum:'nwr[tourism~"museum|gallery"][name];nwr[amenity=exhibition_centre][name]',books:'nwr[amenity~"library|public_bookcase"][name];nwr[shop=books][name]',
 heritage:'nwr[amenity=place_of_worship][name];nwr[historic~"temple|monument|memorial|ruins|archaeological_site|shrine"][name]',
 sport:'nwr[leisure~"fitness_centre|sports_centre|swimming_pool|stadium|dance"][name];nwr[amenity=dojo][name]',
 attraction:'nwr[tourism~"attraction|viewpoint|artwork"][name];nwr[historic~"castle|fort|city_gate"][name]',
 activity:'nwr[leisure~"bowling_alley|escape_game|amusement_arcade|miniature_golf|trampoline_park|water_park"][name];nwr[amenity~"cinema|theatre|arts_centre"][name];nwr[tourism~"theme_park|zoo|aquarium"][name]'
};
var QUOTA={restaurant:60,cafe:60,shopping:40,market:30,park:50,museum:45,books:30,heritage:55,sport:35,attraction:55,activity:40};
var VIBES=[['chill','Chill','#7FC3EE'],['creative','Creative','#C9B7DE'],['foodie','Foodie','#FF6E56'],['active','Active','#C6F13E'],['social','Social','#F6B73C'],['romantic','Romantic','#F29BB5']];
var AGES=['18–24','25–34','35–44','45+'];
var MAXV=3, PAGE=60;

/* ---------- helpers ---------- */
function mix(h,a){var n=parseInt(h.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;function f(c){return Math.round(c+(255-c)*a)}return 'rgb('+f(r)+','+f(g)+','+f(b)+')'}
/* Both mock sites share one origin (devybe.github.io), so saved data is keyed per Supabase project so a sign-in on one never leaks into the other. */
var PK=(function(){var m=String(CFG.SUPABASE_URL||'').match(/\/\/([a-z0-9]+)\./);return m?'@'+m[1]:''})();
function ls(k,v){k=k+PK;try{if(v===undefined)return JSON.parse(localStorage.getItem(k));if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
function el(t,a,kids){var e=document.createElement(t);for(var k in a||{}){var v=a[k];if(k==='class')e.className=v;else if(k==='text')e.textContent=v;else if(k==='html')e.innerHTML=v;else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);else if(v===true)e.setAttribute(k,'');else if(v!==false&&v!=null)e.setAttribute(k,v)}(kids||[]).forEach(function(c){if(c)e.appendChild(typeof c==='string'?document.createTextNode(c):c)});return e}
function svgS(d,s,sw,col){return '<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="'+(col||'currentColor')+'" stroke-width="'+(sw||1.9)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>'}
function svg(d,s,sw,col){var t=document.createElement('span');t.style.display='inline-flex';t.innerHTML=svgS(d,s,sw,col);return t.firstChild}
function icon(cat,s,col){return svg(CAT[cat].icon,s,1.8,col||'#2A1B38')}
var PASTEL={restaurant:'#FFB8A8',cafe:'#F2CDA0',shopping:'#D2BDF5',market:'#FFD98A',park:'#B5E3A5',museum:'#A9D3F7',books:'#B8C3F5',heritage:'#E8CFA3',sport:'#C9EC8F',attraction:'#FFC796',activity:'#F4B3DD'};
function tint(cat,a){var p=PASTEL[cat]||'#D8D0F0';return a!=null&&a>=.7?mix(p,.45):p}
var PIN='M12 21s-6.500-5.600-6.500-11a6.500 6.500 0 0113 0c0 5.400-6.500 11-6.500 11z M12 12a2.200 2.200 0 100-4.400 2.200 2.200 0 000 4.400z';
var CLOSE='M6 6l12 12M18 6L6 18',CHEV='M9 6l6 6-6 6',BACK='M15 6l-6 6 6 6';
function toast(m){var t=document.querySelector('.toast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('on')},2200)}
function dist(a,b,c,d){var R=6371000,r=Math.PI/180,dl=(c-a)*r,dn=(d-b)*r,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(dn/2)*Math.sin(dn/2);return Math.round(2*R*Math.asin(Math.sqrt(x)))}
function fmtD(m){return m<1000?m+' m':(m/1000).toFixed(1)+' km'}
function cap(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1)}
function safeUrl(u){if(!u)return '';try{var x=new URL(/^https?:/i.test(u)?u:'https://'+u);return /^https?:$/.test(x.protocol)?x.href:''}catch(e){return ''}}

/* opening hours -> open now (same rules as the app) */
function isOpenNow(opening,date){
  date=date||new Date();var value=String(opening||'').trim();if(!value)return null;if(/^24\s*\/\s*7$/i.test(value))return true;
  var days=['Su','Mo','Tu','We','Th','Fr','Sa'],today=days[date.getDay()],minute=date.getHours()*60+date.getMinutes(),idx={};days.forEach(function(d,i){idx[d]=i});
  function activeDay(part){var tk=part.trim();if(!tk)return true;return tk.split(',').some(function(piece){var m=piece.trim().match(/^(Su|Mo|Tu|We|Th|Fr|Sa)(?:-(Su|Mo|Tu|We|Th|Fr|Sa))?$/);if(!m)return false;if(!m[2])return m[1]===today;var s=idx[m[1]],e=idx[m[2]],n=idx[today];return s<=e?n>=s&&n<=e:n>=s||n<=e})}
  var understood=false,open=false;
  value.split(';').forEach(function(rule){var m=rule.trim().match(/^((?:(?:Su|Mo|Tu|We|Th|Fr|Sa)(?:-(?:Su|Mo|Tu|We|Th|Fr|Sa))?(?:,\s*)?)+)?\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);if(!m)return;understood=true;if(!activeDay(m[1]||''))return;
    function mm(t){var p=t.split(':').map(Number);return p[0]*60+p[1]}var s=mm(m[2]),e=mm(m[3]);if(s<=e?minute>=s&&minute<e:minute>=s||minute<e)open=true});
  return understood?open:null;
}

/* ---------- state ---------- */
var S={user:ls('dv_user'),vibes:ls('dv_vibes')||{},places:[],osm:'loading',cat:'all',q:'',limit:PAGE,view:'list',sel:null,pick:[],note:'',step:0,age:''};
var PL={};var $app=document.getElementById('app'),VIEW='list';

/* ---------- OpenStreetMap places ---------- */
function matchCat(t,cat){var a=ALLOW[cat];return Object.keys(a).some(function(k){return a[k].indexOf(t[k])>=0})}
function classify(t){for(var i=0;i<CATS.length;i++)if(matchCat(t,CATS[i].id))return CATS[i].id;return null}
var BAD=/\b(real\s*estate|estate\s*agent|property|realtor|brokerage|law\s*(firm|office)|accounting|recruitment|logistics|corporate\s*office)\b/i;
function dispName(t){var n=t['name:en']||t.int_name||t.name||'';n=String(n).trim();return /[A-Za-z]{2}/.test(n)&&n.length<90?n:''}
function describe(name,cat,t){
  var s=t['description:en']||t.description;if(s&&/[A-Za-z]{4}/.test(s))return String(s).slice(0,400);
  var cu=t.cuisine?String(t.cuisine).replace(/;/g,', ').replace(/_/g,' '):'';
  var m={restaurant:name+' is a restaurant near '+ORIGIN.label+(cu?', serving '+cu+' food':'')+'.',cafe:name+' is a café for a relaxed break'+(cu?' with '+cu+' options':'')+'.',
   shopping:name+' is a shopping stop worth a look if you like browsing.',market:name+' is a local market for browsing, snacking and small finds.',
   park:name+' is a green space for a slow walk, some shade or a sit-down.',museum:name+' is a museum or gallery with exhibitions to explore.',
   books:name+' is a place for books and quiet reading.',heritage:name+' is a temple or heritage site, usually calm and good for a short visit.',
   sport:name+' is a place to move, train or swim.',attraction:name+' is a landmark or viewpoint worth a stop.',activity:name+' is something to do, from screenings to games.'};
  return m[cat]||name+' is a mapped place.';
}
function highlights(cat,kind,t,d){
  var lb=CAT[cat].label,h=[lb];if(kind&&lb.toLowerCase().indexOf(kind.toLowerCase().slice(0,4))<0)h.push(kind);if(t.cuisine)h.push('Cuisine: '+String(t.cuisine).replace(/;/g,', ').replace(/_/g,' '));
  if(t.fee==='no')h.push('Free entry');if(t.wheelchair==='yes')h.push('Wheelchair access');if(t.outdoor_seating==='yes')h.push('Outdoor seating');
  if(t.internet_access==='wlan'||t.internet_access==='yes')h.push('Wi-Fi');if(t.air_conditioning==='yes')h.push('Air-conditioned');if(t.heritage||t.historic)h.push('Heritage place');
  h.push(fmtD(d)+' from '+ORIGIN.label);return h.filter(function(x,i,a){return x&&a.indexOf(x)===i});
}
function osmPlace(e){
  var t=e.tags||{},lat=e.lat!=null?e.lat:e.center&&e.center.lat,lon=e.lon!=null?e.lon:e.center&&e.center.lon;if(!lat||!lon)return null;
  var name=dispName(t);if(!name||BAD.test(name))return null;
  var cat=classify(t);if(!cat)return null;
  if(/^(yes|residential|apartments|office)$/i.test(t.building||'')&&!t.amenity&&!t.shop&&!t.tourism&&!t.leisure&&!t.historic)return null;
  if(['alcohol','tobacco','cannabis','e-cigarette','lottery','weapons','adult'].indexOf(String(t.shop||'').toLowerCase())>=0)return null;
  var d=dist(ORIGIN.lat,ORIGIN.lon,lat,lon),kind=cap(String(t.cuisine&&cat==='restaurant'?t.cuisine.split(';')[0]:(t.shop||t.tourism||t.leisure||t.amenity||t.historic||cat)).replace(/_/g,' '));
  var team=t['x:src']==='team',addr=t['addr:full']||[t['addr:housenumber'],t['addr:street'],t['addr:subdistrict']||t['addr:suburb']||t['addr:district']].filter(Boolean).join(', ');
  var details=[t.opening_hours,t.website||t['contact:website'],t.phone||t['contact:phone'],addr,t.description,t.cuisine].filter(Boolean).length;
  return {id:(team?'team-':'osm-'+e.type+'-')+e.id,osm:!team,name:name,cat:cat,kind:kind,lat:lat,lon:lon,dist:d,addr:addr,
    desc:describe(name,cat,t),hl:highlights(cat,kind,t,d),hours:t.opening_hours||'',web:safeUrl(t.website||t['contact:website']||''),phone:t.phone||t['contact:phone']||'',
    cost:t['x:price']||(t.fee==='no'?'Free':t.fee==='yes'?'Entry fee':'Check current price'),team:team,note:t['x:note']||'',th:t['name:th']||'',indoor:CAT[cat].indoor,dur:CAT[cat].dur,conf:team?'team':details>=4?'high':details>=2?'medium':'low',
    wiki:t.wikipedia||'',wd:t.wikidata||'',commons:t.wikimedia_commons||'',img:[t.image,t['image:0'],t['contact:image']].map(safeUrl).filter(Boolean)[0]||'',
    url:team?'':'https://www.openstreetmap.org/'+e.type+'/'+e.id};
}
function samplePlace(s){
  var m={Cafés:'cafe',Parks:'park',Bookshops:'books',Museums:'museum',Galleries:'museum',Markets:'market','Street food':'restaurant',Restaurants:'restaurant',Sport:'sport',Activities:'activity',Shopping:'shopping',Heritage:'heritage'};
  var cat=m[s.tag]||'attraction',d=dist(ORIGIN.lat,ORIGIN.lon,s.lat,s.lng);
  return {id:'sample-'+s.id,osm:false,name:s.name,cat:cat,kind:s.tag,lat:s.lat,lon:s.lng,dist:d,addr:s.area,desc:s.blurb,hl:[CAT[cat].label,fmtD(d)+' from '+ORIGIN.label],hours:'',web:'',phone:'',
    cost:s.cost?'฿'+s.cost:'Free',indoor:s.indoor,dur:s.mins+' min',conf:'low',wiki:'',wd:'',commons:'',img:'',url:''};
}
function build(els){
  var out=[],seen={};els.forEach(function(e){var p=osmPlace(e);if(!p)return;var k=p.name.toLowerCase();
    var dup=(seen[k]||[]).some(function(q){return dist(q.lat,q.lon,p.lat,p.lon)<150});if(dup)return;(seen[k]=seen[k]||[]).push(p);out.push(p)});
  out.sort(function(a,b){return a.dist-b.dist});return out;
}
function setPlaces(list,state){S.places=list;PL={};list.forEach(function(p){PL[p.id]=p});S.osm=state}
function loadPlaces(){setPlaces(build(FIXED),'ok');redraw()}

/* ---------- photos (Wikipedia / Wikimedia / OSM image tags) ---------- */
function commonsUrl(f){f=String(f||'').replace(/^File:/i,'').trim();return f?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(f)+'?width=900':''}
async function jget(u){try{var r=await fetch(u);return r.ok?await r.json():null}catch(e){return null}}
async function ensurePhoto(p){
  if(p.photo!==undefined)return p.photo;
  var res=null;
  if(p.img)res={url:p.img,credit:'OpenStreetMap-linked source'};
  if(!res&&/^File:/i.test(p.commons))res={url:commonsUrl(p.commons),credit:'Wikimedia Commons'};
  if(!res&&p.wiki&&/^[a-z-]+:/.test(p.wiki)){var l=p.wiki.split(':')[0],ti=p.wiki.slice(l.length+1);
    var j=await jget('https://'+l+'.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&pithumbsize=900&titles='+encodeURIComponent(ti));
    var pg=j&&j.query&&j.query.pages&&Object.values(j.query.pages)[0];if(pg&&pg.thumbnail)res={url:pg.thumbnail.source,credit:'Wikipedia'}}
  if(!res&&/^Q\d+$/i.test(p.wd)){var w=await jget('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&props=claims&ids='+p.wd);
    var fn=w&&w.entities&&w.entities[p.wd]&&w.entities[p.wd].claims&&w.entities[p.wd].claims.P18&&w.entities[p.wd].claims.P18[0].mainsnak.datavalue.value;if(fn)res={url:commonsUrl(fn),credit:'Wikidata / Wikimedia Commons'}}
  p.photo=res;return res;
}
function hasPhotoSource(p){return !!(p.img||p.commons||p.wiki||p.wd)}
function wikiLink(w){if(!/^[a-z-]+:/.test(w||''))return '';var l=w.split(':')[0];return 'https://'+l+'.wikipedia.org/wiki/'+encodeURIComponent(w.slice(l.length+1).replace(/ /g,'_'))}

/* ---------- data layer (Supabase) ---------- */
async function register(email,nick,age){if(!LIVE)return 'local-'+Date.now();var r=await sb.rpc('mock_register',{p_email:email,p_nickname:nick,p_age:age,p_consent:true});if(r.error)throw r.error;return r.data}
async function loadMine(){if(!LIVE||!S.user)return;var r=await sb.rpc('mock_my_vibes',{p_pid:S.user.id});if(r.data){var o={};r.data.forEach(function(x){o[x.place_id]={vibes:x.vibes,note:x.note||''}});S.vibes=o;ls('dv_vibes',o)}}
async function saveVibe(p,vibes,note){
  if(LIVE){var r=await sb.rpc('mock_save_vibe',{p_pid:S.user.id,p_place:p.id,p_name:p.name,p_category:p.cat,p_lat:p.lat,p_lng:p.lon,p_vibes:vibes,p_note:note});if(r.error)throw r.error}
  S.vibes[p.id]={vibes:vibes,note:note};ls('dv_vibes',S.vibes);
}
function logEv(type,pid){if(LIVE&&S.user)sb.rpc('mock_log',{p_pid:S.user.id,p_type:type,p_place:pid||null})}

/* ---------- onboarding (single page) ---------- */
function field(label,id,input,hint){var fe=el('div',{class:'fe',id:id+'-e',role:'alert'});return {box:el('div',{class:'fg'},[el('label',{class:'fld',for:id,text:label}),input,hint?el('div',{class:'hint',text:hint}):null,fe]),fe:fe,input:input}}
function renderOb(){
  $app.innerHTML='';
  if(!LIVE)$app.appendChild(el('div',{class:'banner',text:'Demo mode: answers stay in this browser'}));
  var w=el('div',{class:'obw'});$app.appendChild(w);
  var G='url(#fg)';
  var stage=el('div',{class:'stage','aria-hidden':'true',html:
    
    '<div class="halo"></div>'+
    '<svg class="mascot" viewBox="0 0 120 120" width="120" height="120" overflow="visible"><defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FC3EE"/><stop offset="1" stop-color="#F29BB5"/></linearGradient><filter id="gb" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter></defs><circle class="breathe" cx="60" cy="86" r="24" fill="'+G+'" filter="url(#gb)" style="transform-box:fill-box;transform-origin:center"/><g fill="none" stroke="#2A1B38" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><g class="wingL"><ellipse cx="47" cy="74" rx="17" ry="34" transform="rotate(9 47 74)"/></g><g class="wingR"><ellipse cx="73" cy="74" rx="17" ry="34" transform="rotate(-9 73 74)"/></g><circle cx="60" cy="30" r="9" fill="#FAFAF9"/></g></svg>'+
    [[8,60,0,7],[88,30,1.6,8],[22,14,3.1,6],[78,86,4.4,9],[50,2,2.2,7],[94,66,5.3,6]].map(function(f){return '<i class="fl'+(f[2]*10%2?' pk':'')+'" style="left:'+f[0]+'%;top:'+f[1]+'%;animation-delay:'+f[2]+'s;animation-duration:'+f[3]+'s"></i>'}).join('')});
  w.appendChild(stage);
  w.appendChild(el('h1',{text:'Find your Bangkok, your way'}));
  w.appendChild(el('p',{class:'lead',text:'Rate real places by how they feel. It takes about five minutes.'}));
  var em=el('input',{class:'in',type:'email',id:'em',placeholder:'you@example.com',autocomplete:'email',inputmode:'email',value:S.em||''});
  var nk=el('input',{class:'in',id:'nk',placeholder:'What should we call you?',maxlength:'40',autocomplete:'nickname',value:S.nk||''});
  var F1=field('Email','em',em,'Only used to tell answers apart. No password, no email check.'),F2=field('Nickname','nk',nk);
  var ageBox=el('div',{class:'age',role:'group','aria-label':'Age range'}),ageE=el('div',{class:'fe',role:'alert'});
  AGES.forEach(function(a){var b=el('button',{type:'button',class:'chip sm','aria-pressed':String(S.age===a),text:a,onclick:function(){S.age=a;ageE.textContent='';[].forEach.call(ageBox.children,function(c){c.setAttribute('aria-pressed',String(c===b))})}});ageBox.appendChild(b)});
  var chk=el('input',{type:'checkbox',id:'cs',checked:!!S.consent,onchange:function(){S.consent=chk.checked;csE.textContent=''}}),csE=el('div',{class:'fe',role:'alert'});
  w.appendChild(F1.box);w.appendChild(F2.box);
  w.appendChild(el('div',{class:'fg'},[el('div',{class:'fld',text:'Age range'}),ageBox,ageE]));
  w.appendChild(el('div',{class:'fg'},[el('label',{class:'chk',for:'cs'},[chk,el('span',{text:'I agree that DeVybe may store my email, nickname, age range and my answers to study how people choose places.'})]),csE]));
  var err=el('div',{class:'err',role:'alert'}),go=el('button',{type:'button',class:'cta',text:'Start exploring'});
  em.addEventListener('input',function(){F1.fe.textContent='';em.classList.remove('bad')});nk.addEventListener('input',function(){F2.fe.textContent='';nk.classList.remove('bad')});
  go.addEventListener('click',async function(){
    S.em=em.value.trim();S.nk=nk.value.trim();var bad=null;
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(S.em)){F1.fe.textContent='Enter a valid email, like you@example.com';em.classList.add('bad');bad=bad||em}
    if(!S.nk){F2.fe.textContent='Add a nickname';nk.classList.add('bad');bad=bad||nk}
    if(!S.age){ageE.textContent='Choose an age range';bad=bad||ageBox}
    if(!chk.checked){csE.textContent='Please agree to continue';bad=bad||chk}
    if(bad){(bad.scrollIntoView||function(){}).call(bad,{block:'center',behavior:'smooth'});if(bad.focus)bad.focus({preventScroll:true});return}
    go.disabled=true;go.textContent='One moment…';err.textContent='';
    try{var id=await register(S.em,S.nk,S.age);S.user={id:id,email:S.em.toLowerCase(),nick:S.nk};ls('dv_user',S.user);await loadMine();start()}
    catch(e){err.textContent='Could not save. Please try again.';console.error(e);go.disabled=false;go.textContent='Start exploring'}
  });
  w.appendChild(err);
  $app.appendChild(el('div',{class:'obbar'},[go]));
}

/* ---------- app shell ---------- */
function start(){renderApp();loadPlaces()}
function renderApp(){
  $app.innerHTML='';
  if(!LIVE)$app.appendChild(el('div',{class:'banner',text:'Demo mode: answers stay in this browser'}));
  $app.appendChild(el('div',{class:'scroll',id:'sc'}));
  var mw=el('div',{class:'mapw hid',id:'mw'},[el('div',{id:'map'}),el('div',{class:'mtop',id:'mtop'}),
    el('button',{type:'button',class:'pillb','aria-label':'Back to Discover',onclick:function(){setView('list')}},[svg(BACK,18),'Back'])]);
  $app.appendChild(mw);
  var tabs=el('nav',{class:'nav','aria-label':'Main'});
  var NV=[['Discover','M12 21a9 9 0 100-18 9 9 0 000 18zM15.500 8.500l-2 5-5 2 2-5z',true],['My Trip','M6 4h12v17l-6-4-6 4z'],['Plan'],['Community','M9 12a3 3 0 100-6 3 3 0 000 6zM3 20c0-3.300 2.700-6 6-6s6 2.700 6 6M16 6.500a3 3 0 010 5.500M18 14.500c1.800.8 3 2.400 3 5.500'],['Me','M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4.400 3.600-8 8-8s8 3.600 8 8']];
  NV.forEach(function(t){
    var on=!!t[2],lab=t[0],kids;
    if(lab==='Plan')kids=[el('span',{class:'pbtn',html:'<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M12 2C12.500 7.500 16.500 11.500 22 12C16.500 12.500 12.500 16.500 12 22C11.500 16.500 7.500 12.500 2 12C7.500 11.500 11.500 7.500 12 2Z"/></svg>'}),lab];
    else kids=[svg(t[1],22,1.8),lab];
    tabs.appendChild(el('button',{type:'button',class:'nv'+(on?' on':' off')+(lab==='Plan'?' pl':''),'aria-current':on?'page':false,'aria-disabled':on?false:'true',onclick:on?function(){S.q='';S.cat='all';S.limit=PAGE;setView('list');document.getElementById('sc').scrollTop=0}:function(){toast(lab+' is in the full app')}},kids))});
  $app.appendChild(tabs);
  $app.appendChild(el('div',{class:'scrim',id:'scrim',onclick:closeSheet}));
  $app.appendChild(el('div',{class:'sheet',id:'sheet',role:'dialog','aria-modal':'true','aria-label':'Place details'}));
  $app.appendChild(el('div',{class:'toast',role:'status'}));
  VIEW='list';drawList();
}
function redraw(){if(!document.getElementById('sc'))return;if(VIEW==='map')drawPins(false);else drawList(true)}
function filtered(){var q=S.q.trim().toLowerCase();return S.places.filter(function(p){return(S.cat==='all'||p.cat===S.cat)&&(!q||(p.name+' '+p.addr+' '+CAT[p.cat].label+' '+p.kind).toLowerCase().indexOf(q)>=0)})}
function chipRow(onPick){
  var ch=el('div',{class:'chips',role:'group','aria-label':'Categories'});
  var all=el('button',{type:'button',class:'cchip all','aria-pressed':String(S.cat==='all'),text:'All',onclick:function(){onPick('all')}});ch.appendChild(all);
  CATS.forEach(function(c){var ic=el('span',{class:'ci',style:'background:'+tint(c.id,.6)},[icon(c.id,16)]);
    ch.appendChild(el('button',{type:'button',class:'cchip','aria-pressed':String(S.cat===c.id),onclick:function(){onPick(c.id)}},[ic,c.label]))});
  return ch;
}

/* ---------- Discover list ---------- */
function howCard(){
  var done=Object.keys(S.vibes).length;
  var goal=10,pct=Math.min(100,done*100/goal);
  var mini='<svg viewBox="12 4 96 108" width="26" height="29" aria-hidden="true" style="overflow:visible;flex:none"><defs><linearGradient id="fg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FC3EE"/><stop offset="1" stop-color="#F29BB5"/></linearGradient></defs><circle cx="60" cy="86" r="26" fill="url(#fg2)"/><g fill="none" stroke="#2A1B38" stroke-width="7" stroke-linecap="round"><ellipse cx="47" cy="74" rx="17" ry="34" transform="rotate(9 47 74)"/><ellipse cx="73" cy="74" rx="17" ry="34" transform="rotate(-9 73 74)"/><circle cx="60" cy="30" r="9" fill="#fff"/></g></svg>';
  return el('div',{class:'how'},[
    el('div',{class:'howt'},[el('span',{class:'hi',html:mini}),el('div',{class:'hx'},[el('b',{text:done>=goal?'Great work, thank you!':'Tell us how places feel'}),el('small',{text:done>=goal?'Keep going if you like. More answers help.':done<3?'Rate about 10 places, any you like':'Rate about 10 places, any you like'})]),el('span',{class:'hn'},[el('b',{text:String(Math.min(done,goal))}),'/'+goal])]),
    el('div',{class:'bar'},[el('i',{style:'width:'+pct+'%'})]),
    done<3?el('ol',{class:'steps'},[el('li',{text:'Find a place'}),el('li',{text:'Tap its vibes'}),el('li',{text:'Saves itself'})]):null]);
}
function updHow(){var b=document.getElementById('howbox');if(b){b.innerHTML='';b.appendChild(howCard())}}
function drawList(keep){
  var sc=document.getElementById('sc'),top=keep?sc.scrollTop:0;sc.innerHTML='';
  var done=Object.keys(S.vibes).length;
  sc.appendChild(el('div',{class:'head'},[el('div',{},[el('div',{class:'eyebrow',text:'Hi '+S.user.nick+' · near '+ORIGIN.label}),el('h1',{text:'Discover'})]),
    el('button',{type:'button',class:'mapbtn','aria-label':'Show places on a map',onclick:function(){setView('map')}},[svg('M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',18),'Map'])]));
  var inp=el('input',{type:'text',value:S.q,placeholder:'Search places or areas','aria-label':'Search places',oninput:function(e){S.q=e.target.value;S.limit=PAGE;drawDyn()}});
  sc.appendChild(el('div',{class:'search'},[svg('M11 17a6 6 0 100-12 6 6 0 000 12zM16 16l4 4',20),inp]));
  sc.appendChild(chipRow(function(id){S.cat=id;S.limit=PAGE;drawList(true)}));
  sc.appendChild(el('div',{id:'howbox'},[howCard()]));
  sc.appendChild(el('div',{id:'dyn'}));drawDyn();sc.scrollTop=top;
}
function art(p,big){
  var a=el('span',{class:'art',style:'background:linear-gradient(160deg,'+tint(p.cat,.5)+','+tint(p.cat,.8)+')'});
  a.appendChild(el('span',{class:'bg'},[icon(p.cat,150,'#2A1B38')]));return a;
}
function vibePicker(p){
  var vq=el('div',{class:'vq',role:'group','aria-label':'How does '+p.name+' feel?'});
  var btns=[];
  function paint(){var cur=(S.vibes[p.id]&&S.vibes[p.id].vibes)||[];btns.forEach(function(b){var on=cur.indexOf(b.dataset.v)>=0;b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-disabled',String(!on&&cur.length>=MAXV))})}
  var timer=null;
  VIBES.forEach(function(m){var b=el('button',{type:'button',class:'vc',style:'--c:'+m[2],'data-v':m[0],onclick:function(){
    var cur=((S.vibes[p.id]&&S.vibes[p.id].vibes)||[]).slice(),i=cur.indexOf(m[0]);
    if(i>=0){if(cur.length===1){toast('Keep at least one vibe. Tap another to change it.');return}cur.splice(i,1)}
    else if(cur.length>=MAXV){toast('Pick up to 3 vibes');return}else cur.push(m[0]);
    var note=(S.vibes[p.id]&&S.vibes[p.id].note)||'';S.vibes[p.id]={vibes:cur,note:note};ls('dv_vibes',S.vibes);paint();updHow();if(VIEW==='map')drawPins(false);
    clearTimeout(timer);timer=setTimeout(function(){saveVibe(p,cur,note).then(function(){toast('Saved')}).catch(function(e){console.error(e);toast('Could not save')})},350)}},[el('i'),m[1]]);btns.push(b);vq.appendChild(b)});
  paint();
  return vq;
}
function drawDyn(){
  var d=document.getElementById('dyn');if(!d)return;d.innerHTML='';
  if(S.osm==='loading'&&S.places.length<40){for(var i=0;i<5;i++)d.appendChild(el('div',{class:'skel'}));d.appendChild(el('p',{class:'foot',text:'Loading real places from OpenStreetMap…'}));return}
  var L=filtered();
  if(!L.length){d.appendChild(el('div',{class:'empty'},[el('div',{text:'Nothing matches that. Try another word or category.'}),el('button',{type:'button',text:'Clear filters',onclick:function(){S.q='';S.cat='all';drawList()}})]));return}
  d.appendChild(el('div',{class:'sec'},[el('h2',{text:S.cat==='all'?'Places near you':CAT[S.cat].label}),el('span',{text:L.length+' places · closest first'})]));
  var rows=el('div',{class:'rows'});
  L.slice(0,S.limit).forEach(function(p){
    var c=CAT[p.cat];
    var vq=vibePicker(p);
    rows.appendChild(el('div',{class:'pc'},[
      el('button',{type:'button',class:'row','aria-label':'Open '+p.name,onclick:function(){openSheet(p)}},[
        el('span',{class:'dot',style:'background:'+tint(p.cat,.6)},[icon(p.cat,24)]),
        el('span',{class:'tx'},[el('b',{text:p.name}),el('span',{class:'meta',text:c.label+' · '+fmtD(p.dist)+(p.hours?' · hours listed':'')})]),
        el('span',{class:'chev',html:svgS(CHEV,18,2,'#8A7F95')})]),
      el('div',{class:'vlab',text:'How does it feel?'}),vq]))});
  d.appendChild(rows);
  if(L.length>S.limit)d.appendChild(el('div',{class:'empty',style:'margin-top:16px'},[el('button',{type:'button',style:'margin:0',text:'Show '+Math.min(PAGE,L.length-S.limit)+' more',onclick:function(){S.limit+=PAGE;drawDyn()}})]));
  var note='Place details from OpenStreetMap and the DeVybe team’s checks of public listings. Hours can change, so check before you go.';
  var ft=el('div',{class:'foot'},[note+' © ',el('a',{href:'https://www.openstreetmap.org/copyright',target:'_blank',rel:'noopener',text:'OpenStreetMap contributors'})]);
  if(S.osm==='fail')ft.appendChild(el('div',{},[el('button',{type:'button',class:'lnk',style:'text-align:left;width:auto;padding:0',text:'Try again',onclick:function(){ls('dv_osm_v4',null);loadPlaces()}})]));
  d.appendChild(ft);
}

/* ---------- Map ---------- */
var map=null,cluster=null;
function pinHtml(p,done){var c=CAT[p.cat];
  return '<div class="pinw"><svg width="38" height="46" viewBox="0 0 38 46" aria-hidden="true"><path d="M19 45C19 45 4 30 4 18a15 15 0 0130 0c0 12-15 27-15 27z" fill="'+c.pin+'" stroke="#fff" stroke-width="2.5"/><g transform="translate(9 8) scale(.833)" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="'+c.icon+'"/></g>'+(done?'<circle cx="31.500" cy="8" r="7.200" fill="#C6F13E" stroke="#2A1B38" stroke-width="1.800"/><path d="M28.200 8.200l2.300 2.300 4.100-4.500" fill="none" stroke="#2A1B38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>':'')+'</svg></div>'}
function setView(v){
  VIEW=v;var sc=document.getElementById('sc'),mw=document.getElementById('mw');
  sc.classList.toggle('hid',v==='map');mw.classList.toggle('hid',v!=='map');
  closeMapCard();
  if(v!=='map'){drawList(true);return}
  var top=document.getElementById('mtop');top.innerHTML='';
  var inp=el('input',{type:'text',value:S.q,placeholder:'Search places or areas','aria-label':'Search places',oninput:function(e){S.q=e.target.value;drawPins(false)}});
  top.appendChild(el('div',{class:'search'},[svg('M11 17a6 6 0 100-12 6 6 0 000 12zM16 16l4 4',20),inp]));
  var holder=el('div');top.appendChild(holder);
  function chips(){holder.innerHTML='';holder.appendChild(chipRow(function(id){S.cat=id;chips();drawPins(true)}))}chips();
  if(!map){
    if(!window.L){toast('Map failed to load');return}
    map=L.map('map',{zoomControl:false,attributionControl:false,maxZoom:19}).setView([ORIGIN.lat,ORIGIN.lon],13);
    L.control.zoom({position:'bottomright'}).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);L.control.attribution({prefix:false,position:'bottomleft'}).addTo(map);
    L.marker([ORIGIN.lat,ORIGIN.lon],{icon:L.divIcon({className:'',iconSize:[18,18],iconAnchor:[9,9],html:'<div style="width:18px;height:18px;border-radius:50%;background:#fff;border:3.500px solid #2A1B38;box-sizing:border-box"></div>'}),interactive:false,keyboard:false}).addTo(map);
    cluster=L.markerClusterGroup?L.markerClusterGroup({showCoverageOnHover:false,maxClusterRadius:44,spiderfyOnMaxZoom:true,chunkedLoading:true,iconCreateFunction:function(c){return L.divIcon({className:'',iconSize:[42,42],html:'<div class="clu">'+c.getChildCount()+'</div>'})}}):L.layerGroup();
    cluster.addTo(map);map.on('click',closeMapCard);
  }
  setTimeout(function(){map.invalidateSize();drawPins(true)},30);
}
function closeMapCard(){var c=document.getElementById('mcard');if(c)c.remove()}
function showMapCard(p){
  closeMapCard();logEv('view_place',p.id);var c=CAT[p.cat];
  var card=el('div',{class:'mcard',id:'mcard',role:'dialog','aria-label':p.name},[
    el('div',{class:'mch'},[
      el('span',{class:'dot sm',style:'background:'+tint(p.cat,.6)},[icon(p.cat,20)]),
      el('span',{class:'tx'},[el('b',{text:p.name}),el('span',{class:'meta',text:c.label+' · '+fmtD(p.dist)})]),
      el('button',{type:'button',class:'mdet',text:'Details',onclick:function(){closeMapCard();openSheet(p)}}),
      el('button',{type:'button',class:'mx','aria-label':'Close',onclick:closeMapCard,html:svgS(CLOSE,18,2.2)})]),
    el('div',{class:'vlab',text:'How does it feel?'}),vibePicker(p)]);
  document.getElementById('mw').appendChild(card);
}
function drawPins(fit){
  if(!map)return;cluster.clearLayers();var pts=[],ms=[];
  filtered().forEach(function(p){
    var m=L.marker([p.lat,p.lon],{icon:L.divIcon({className:'',iconSize:[38,46],iconAnchor:[19,45],html:pinHtml(p,!!S.vibes[p.id])}),title:p.name,alt:p.name,keyboard:true});
    m.on('click',function(){showMapCard(p)});ms.push(m);pts.push([p.lat,p.lon])});
  cluster.addLayers?cluster.addLayers(ms):ms.forEach(function(m){cluster.addLayer(m)});
  if(fit&&pts.length&&S.cat!=='all')map.fitBounds(pts,{padding:[60,60],maxZoom:16});
}

/* ---------- Place detail + vibe question ---------- */
function openSheet(p){
  logEv('view_place',p.id);var v=S.vibes[p.id];S.sel=p;S.pick=v?v.vibes.slice():[];S.note=v?v.note:'';
  var sh=document.getElementById('sheet');sh.innerHTML='';var c=CAT[p.cat];
  var hero=el('div',{class:'hero',style:'background:linear-gradient(160deg,'+tint(p.cat,.35)+','+c.pin+')'});
  hero.appendChild(el('span',{class:'bg'},[icon(p.cat,170,'#fff')]));
  var credit=el('span',{class:'credit'});
  ensurePhoto(p).then(function(ph){if(ph&&hero.isConnected){var im=el('img',{src:ph.url,alt:'Photo of '+p.name,onerror:function(){im.remove();credit.style.display='none'}});hero.insertBefore(im,hero.firstChild);credit.textContent='Photo: '+ph.credit;credit.style.display='block'}});
  hero.appendChild(el('div',{class:'shade'}));hero.appendChild(credit);
  hero.appendChild(el('button',{type:'button',class:'close','aria-label':'Close',onclick:closeSheet},[svg(CLOSE,20,2)]));
  hero.appendChild(el('div',{class:'txt'},[el('span',{class:'tag'},[icon(p.cat,14),c.label]),el('h1',{text:p.name}),el('div',{class:'loc',text:(p.addr?p.addr+' · ':'')+fmtD(p.dist)+' from '+ORIGIN.label})]));
  var st=isOpenNow(p.hours);
  var info=el('div',{class:'info'},[
    el('div',{class:'ii w'},[el('div',{class:'il',text:'Hours'}),el('div',{class:'iv',text:p.hours?p.hours+(p.team?' (unconfirmed)':''):'Not listed. Check before you go.'}),st==null?null:el('span',{class:'open '+(st?'y':'n'),text:st?'Likely open now':'Likely closed now'})]),
    p.note?el('div',{class:'ii w'},[el('div',{class:'il',text:'Good to know'}),el('div',{class:'iv',text:p.note})]):null,
    el('div',{class:'ii'},[el('div',{class:'il',text:'Budget'}),el('div',{class:'iv',text:p.cost})]),
    el('div',{class:'ii'},[el('div',{class:'il',text:'Typical stop'}),el('div',{class:'iv',text:p.dur})]),
    el('div',{class:'ii'},[el('div',{class:'il',text:'Setting'}),el('div',{class:'iv',text:p.indoor?'Mostly indoor':'Mostly outdoor'})]),
    el('div',{class:'ii'},[el('div',{class:'il',text:'Distance'}),el('div',{class:'iv',text:fmtD(p.dist)+' from '+ORIGIN.label})]),
    p.addr?el('div',{class:'ii w'},[el('div',{class:'il',text:'Address'}),el('div',{class:'iv',text:p.addr})]):null,
    p.phone?el('div',{class:'ii w'},[el('div',{class:'il',text:'Phone'}),el('div',{class:'iv',text:p.phone})]):null]);
  var trustTxt={team:['Checked from public listings','The DeVybe team checked this place from public listings. Hours and prices may have changed, so confirm before you go.'],high:['Well described','Hours, contact details and an address are mapped for this place.'],medium:['Some details mapped','A few details are mapped. Check hours before you go.'],low:['Basic details only','Only the basics are mapped. Check hours and details before you travel.']}[p.conf];
  var links=el('div',{class:'links'});
  if(p.url)links.appendChild(el('a',{href:p.url,target:'_blank',rel:'noopener',text:'OpenStreetMap ↗'}));
  if(p.web)links.appendChild(el('a',{href:p.web,target:'_blank',rel:'noopener',text:'Official website ↗'}));
  var wl=wikiLink(p.wiki);if(wl)links.appendChild(el('a',{href:wl,target:'_blank',rel:'noopener',text:'Wikipedia ↗'}));
  links.appendChild(el('a',{href:'https://www.google.com/maps/dir/?api=1&destination='+p.lat+','+p.lon,target:'_blank',rel:'noopener',text:'Directions ↗'}));
  /* vibe question */
  var cnt=el('span',{class:'cnt'}),vbox=el('div',{class:'vibes',role:'group','aria-label':'Vibes'});
  var sv=el('button',{type:'button',class:'cta',onclick:async function(){
    sv.disabled=true;sv.textContent='Saving…';
    try{await saveVibe(p,S.pick.slice(),S.note.trim());closeSheet();if(VIEW==='map')drawPins(false);drawList(true);toast('Saved. '+Object.keys(S.vibes).length+' rated')}
    catch(e){console.error(e);sv.textContent='Try again';sv.disabled=false;toast('Could not save')}}});
  var btns=[];
  function sync(){btns.forEach(function(b){var on=S.pick.indexOf(b.dataset.v)>=0;b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-disabled',String(!on&&S.pick.length>=MAXV))});
    cnt.textContent=S.pick.length+' of '+MAXV+' picked';sv.disabled=!S.pick.length;if(sv.textContent!=='Saving…')sv.textContent=S.vibes[p.id]?'Update vibe':'Save vibe'}
  VIBES.forEach(function(m){var b=el('button',{type:'button',class:'vb',style:'--c:'+m[2],'data-v':m[0],onclick:function(){var i=S.pick.indexOf(m[0]);if(i>=0)S.pick.splice(i,1);else if(S.pick.length>=MAXV){toast('Pick up to 3 vibes');return}else S.pick.push(m[0]);sync()}},[el('i'),m[1]]);btns.push(b);vbox.appendChild(b)});
  var note=el('textarea',{class:'in',maxlength:'280',placeholder:'Anything else? In your own words (optional)','aria-label':'Your own words',oninput:function(e){S.note=e.target.value}});note.value=S.note;
  var body=el('div',{class:'sbody'},[hero,el('div',{class:'pad'},[
    el('div',{class:'story'},[el('h3',{text:'What makes this place worth a stop'}),el('p',{text:p.desc}),el('div',{class:'pills'},p.hl.map(function(x){return el('span',{text:x})}))]),
    info,el('div',{class:'trust'},[el('b',{text:'✓ '+trustTxt[0]}),el('div',{text:(p.team?'':p.osm?'Source: OpenStreetMap. ':'Sample entry. ')+trustTxt[1]})]),
    links]),
    el('div',{class:'q'},[el('h2',{text:'What is the vibe here?'}),el('p',{text:'Pick up to three feelings that fit this place for you. There is no right answer.'}),vbox,note])]);
  sh.appendChild(body);sh.appendChild(el('div',{class:'sfoot'},[cnt,sv]));sync();
  document.getElementById('scrim').classList.add('on');sh.classList.add('on');
}
function closeSheet(){var a=document.getElementById('scrim'),b=document.getElementById('sheet');if(a)a.classList.remove('on');if(b)b.classList.remove('on')}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet()});

window.__dv={map:function(){return map},photo:ensurePhoto,places:function(){return S.places},open:function(i){openSheet(S.places[i])},state:S};
if(S.user)start();else renderOb();
})();
