const $=s=>document.querySelector(s),app=$('#app');
const store={get:k=>JSON.parse(localStorage.getItem('riyo_'+k)||'null'),set:(k,v)=>localStorage.setItem('riyo_'+k,JSON.stringify(v))};
let state={page:'home',category:null,session:[],idx:0,selected:null,answered:false,search:'',view:null};
const prog=()=>store.get('prog')||{done:{},wrong:{},fav:{},history:[]};
const save=p=>store.set('prog',p);
const pct=(n,d)=>d?Math.round(n/d*100):0;
const cat=id=>CATEGORIES.find(c=>c.id===id)||CATEGORIES[0];
const sub=id=>SUBJECTS.find(s=>s.id===id)||SUBJECTS[0];
const jpNo=['①','②','③','④'];

const GROUP_RULE={
  microbe:'disinfection',infection_control:'disinfection',environment:'public_health',health_promo:'public_health',
  hair:'skin',anatomy:'skin',nutrition:'skin',disease:'skin',
  surfactant:'cosmetics',perm:'cosmetics',cosmetic_safety:'cosmetics',ph:'cosmetics',color:'cosmetics',
  style:'history',design:'history',aesthetics:'history',
  customer:'shop',accounting:'shop',labor:'shop',complaint:'shop',store:'shop',commerce:'shop',
  shampoo:'cut',setting:'cut',tools:'cut'
};
const groupId=q=>GROUP_RULE[q.category]||q.category;
const qsCat=id=>QUESTIONS.filter(q=>groupId(q)===id);
const qsSub=id=>QUESTIONS.filter(q=>q.subject===id);
const shuffle=arr=>[...arr].sort(()=>Math.random()-.5);
const takeRandom=(arr,n)=>shuffle(arr).slice(0,n);
const smartCount=21;

function templateIndex(q){
  const gid=groupId(q);
  const bank=TEMPLATES[gid]||TEMPLATES[q.category]||TEMPLATES.barber_act;
  return (q.id-1)%bank.length;
}
function themeKey(q){return `${groupId(q)}:${templateIndex(q)}`}
function recentIds(p,n=30){return new Set((p.history||[]).slice(-n).map(x=>x.id))}
function recentThemes(p,n=30){return new Set((p.history||[]).slice(-n).map(x=>x.theme||x.group))}
function pickFromCategory(catId,used,recent,usedThemes,lastTheme){
  let pool=qsCat(catId).filter(q=>!used.has(q.id));
  const score=q=>{
    let sc=0,th=themeKey(q);
    if(recent.has(q.id))sc-=100;
    if(usedThemes.has(th))sc-=30;
    if(th===lastTheme)sc-=80;
    if(q.importance>=5)sc+=8;
    if(q.importance===4)sc+=4;
    sc+=Math.random()*3;
    return sc;
  };
  pool.sort((a,b)=>score(b)-score(a));
  return pool[0]||null;
}
function buildSmartSession(count=smartCount){
  const p=prog(),used=new Set(),usedThemes=new Set(),recent=recentIds(p,30);
  const cats=shuffle(CATEGORIES.filter(c=>qsCat(c.id).length));
  const session=[];
  let lastTheme=null;
  // まず①〜⑮を一巡させ、広く出題する
  for(const c of cats){
    if(session.length>=count)break;
    const q=pickFromCategory(c.id,used,recent,usedThemes,lastTheme);
    if(q){session.push(q);used.add(q.id);lastTheme=themeKey(q);usedThemes.add(lastTheme)}
  }
  // 残りは、出題数が少ない分野から補充する
  while(session.length<count){
    const counts=Object.fromEntries(CATEGORIES.map(c=>[c.id,session.filter(q=>groupId(q)===c.id).length]));
    const ordered=shuffle(CATEGORIES).sort((a,b)=>(counts[a.id]||0)-(counts[b.id]||0));
    let picked=null;
    for(const c of ordered){
      picked=pickFromCategory(c.id,used,recent,usedThemes,lastTheme);
      if(picked)break;
    }
    if(!picked)break;
    session.push(picked);used.add(picked.id);lastTheme=themeKey(picked);usedThemes.add(lastTheme);
  }
  return session;
}

const POOLS={
  authority:['保健所長','保健所設置市長','都道府県知事','厚生労働大臣','指定試験機関','管理理容師','特別区長','開設者'],
  deadline:['あらかじめ','速やかに','直ちに','１０日以内','３０日以内','７日以内','毎年７月３１日まで','検査確認後'],
  role:['理容師','管理理容師','開設者','従業者','利用者','指定試験機関','都道府県知事','保健所長'],
  infection:['一類感染症','二類感染症','三類感染症','四類感染症','五類感染症','指定感染症','新感染症','新型インフルエンザ等感染症'],
  disinfection:['煮沸消毒','蒸気消毒','エタノール消毒','次亜塩素酸ナトリウム消毒','紫外線消毒','逆性石けん','流水洗浄','乾燥保管'],
  health:['表皮','真皮','皮下組織','毛包','皮脂腺','汗腺','角質層','メラニン'],
  chem:['界面活性剤','酸化染毛剤','還元剤','酸化剤','アルカリ剤','酸性染毛料','香料','防腐剤'],
  culture:['バロック','ロココ','ルネサンス','古代エジプト','明治時代','大正時代','昭和時代','現代'],
  manage:['固定費','変動費','損益分岐点','売上高','粗利益','労働時間','顧客満足','衛生管理'],
  theory:['ブラントカット','レイヤーカット','グラデーションカット','セニング','シェービング','シャンプーイング','セット','クリッパー']
};
const TEMPLATES={
  barber_act:[
    ['理容所の開設届について、提出先として最も適切なものはどれか。','都道府県知事','authority','開設届は、開設者が都道府県知事に届け出る。保健所長や管理理容師と混同しない。','開設者・届出先・時期を分けて覚える'],
    ['理容所の開設者が届出事項を変更した場合の届出時期として最も適切なものはどれか。','速やかに','deadline','変更・廃止の届出は、あらかじめではなく速やかに行う。','開設はあらかじめ、変更・廃止は速やかに'],
    ['理容師が２人以上いる理容所で、置かなければならない者はどれか。','管理理容師','role','理容師が２人以上従事する理容所では、管理理容師を置く必要がある。','２人以上なら管理理容師']
  ],
  order:[
    ['理容師法施行令で混同しやすい免許・試験事務の主体として最も適切なものはどれか。','厚生労働大臣','authority','免許・試験に関する主体は、保健所長ではなく厚生労働大臣や指定試験機関との区別が重要。','店舗手続と免許手続を混同しない'],
    ['理容師試験の実施事務に関して、最も関係が深いものはどれか。','指定試験機関','authority','試験事務では指定試験機関が問われやすい。店舗の開設届とは別に整理する。','試験は指定試験機関']
  ],
  rules:[
    ['開設届に添付する書類として、管理理容師に関係するものを求められる場合があるのはどのような場合か。','管理理容師','role','理容師が２人以上従事する理容所では管理理容師に関する書類が重要になる。','添付書類は従業者数と結びつける'],
    ['開設届の時期として最も適切なものはどれか。','あらかじめ','deadline','開設後ではなく、開設しようとするときにあらかじめ届け出る。','開設前に届出']
  ],
  infection:[
    ['結核の分類として最も適切なものはどれか。','二類感染症','infection','結核は二類感染症として出題されやすい。コレラなど三類との混同に注意。','結核は二類'],
    ['コレラの分類として最も適切なものはどれか。','三類感染症','infection','コレラは三類感染症。結核・ジフテリアなど二類との混同に注意。','コレラは三類'],
    ['エボラ出血熱の分類として最も適切なものはどれか。','一類感染症','infection','エボラ出血熱は一類感染症。名称の強さだけでなく分類で覚える。','エボラは一類']
  ],
  community:[
    ['地域保健の中核的施設として最も適切なものはどれか。','保健所','authority','地域保健では保健所と市町村保健センターの役割を分ける。','地域保健は施設の役割を区別'],
    ['地域保健行政で都道府県や保健所設置市と関係が深いものはどれか。','保健所設置市長','authority','保健所設置市という語は、理容所手続の提出先とも混同しやすい。','保健所設置市に注意']
  ],
  consumer:[
    ['消費者基本法で中心に置かれる考え方として最も適切なものはどれか。','消費者の権利','manage','消費者基本法は、事業者都合ではなく消費者の権利・利益を中心に考える。','消費者の権利が軸'],
    ['事業者が消費者に対して特に重視すべきものはどれか。','情報提供','manage','消費者保護では、適切な情報提供と安全確保が重要。','説明不足はトラブルの原因']
  ],
  visit:[
    ['出張理容で最も注意すべき判断として適切なものはどれか。','衛生管理','manage','出張理容では場所が変わっても衛生管理を省略できない。','出張でも衛生管理は同じ'],
    ['出張理容で器具を扱う際、最も重視すべきものはどれか。','消毒済み器具','disinfection','出張時は消毒済み器具と使用済み器具の区別が重要。','清潔・不潔を分ける']
  ],
  disinfection:[
    ['血液が付着したおそれのある器具に対して、特に重視すべき消毒法はどれか。','次亜塩素酸ナトリウム消毒','disinfection','血液付着のおそれがある器具では、適切な薬液消毒等を選ぶ必要がある。','血液付着は強めの消毒'],
    ['消毒前にまず行うべき基本操作として最も適切なものはどれか。','流水洗浄','disinfection','汚れが残ると消毒効果が下がるため、洗浄と消毒を分けて考える。','洗浄してから消毒']
  ],
  public_health:[
    ['公衆衛生で重視される対象として最も適切なものはどれか。','集団の健康','manage','公衆衛生は個人だけでなく集団全体の健康を守る考え方。','個人衛生と公衆衛生を区別'],
    ['感染予防で、病原体が広がる経路を断つ考え方として最も適切なものはどれか。','感染経路対策','disinfection','感染源・感染経路・感受性者の３つを分けて考える。','感染の鎖を切る']
  ],
  skin:[
    ['皮膚の最外層として最も適切なものはどれか。','角質層','health','角質層は外界に接する最外層で、バリア機能と関係する。','最外層は角質層'],
    ['毛を作る部分として最も関係が深いものはどれか。','毛包','health','毛髪は毛包・毛乳頭などの構造と関連して理解する。','毛は毛包で考える']
  ],
  cosmetics:[
    ['洗浄剤で汚れを落とす働きに最も関係が深いものはどれか。','界面活性剤','chem','界面活性剤は水と油をなじませ、洗浄作用に関わる。','洗浄は界面活性剤'],
    ['パーマ第１剤で毛髪の結合を切る働きに関係が深いものはどれか。','還元剤','chem','パーマでは還元と酸化を混同しない。第１剤は還元、第２剤は酸化。','１剤は還元、２剤は酸化']
  ],
  history:[
    ['理容文化史で時代・様式を問う問題への対応として最も適切なものはどれか。','時代順','culture','文化論は名称だけでなく時代順と特徴の組合せで問われやすい。','文化論は時代順で整理'],
    ['髪型や服飾の変化を理解する際、最も混同しやすい観点はどれか。','様式名','culture','様式名・時代・地域を入れ替えた選択肢に注意する。','様式名と時代をセットで覚える']
  ],
  shop:[
    ['売上から変動費を差し引いて考える利益として最も適切なものはどれか。','粗利益','manage','店舗管理では売上・費用・利益の違いを正確に区別する。','売上と利益を混同しない'],
    ['経営で固定費と変動費を分けて考える指標として最も関係が深いものはどれか。','損益分岐点','manage','損益分岐点は、売上と費用の関係を見る重要指標。','固定費・変動費・売上']
  ],
  cut:[
    ['毛先をそろえて重さを残しやすいカットとして最も適切なものはどれか。','ブラントカット','theory','ブラントカットは切り口がそろいやすく、重さを表現しやすい。','重さはブラント'],
    ['段差をつけて軽さや動きを出す技法として最も適切なものはどれか。','レイヤーカット','theory','レイヤーは段差によって軽さや動きを作る。','軽さはレイヤー']
  ],
  shaving:[
    ['シェービングで皮膚を傷つけないために最も重視すべきものはどれか。','皮膚の緊張','theory','刃を当てる角度・皮膚の緊張・毛流れを合わせて考える。','皮膚を張って刃を安定'],
    ['シェービングで毛の生えている方向を確認する目的として最も適切なものはどれか。','毛流れの把握','theory','毛流れを無視すると皮膚刺激や剃り残しにつながる。','毛流れを見て剃る']
  ]
};
function ssBase(q){const gid=groupId(q); const bank=TEMPLATES[gid]||TEMPLATES[q.category]||TEMPLATES.barber_act; const t=bank[templateIndex(q)]; return {q:t[0],correct:t[1],pool:POOLS[t[2]]||POOLS.authority,exp:t[3],point:t[4],gid,theme:themeKey(q)};}
function makeChoices(q){const b=ssBase(q); const wrong=takeRandom(b.pool.filter(x=>x!==b.correct),3); let arr=[b.correct,...wrong]; return shuffle(arr).map(text=>({text,correct:text===b.correct}));}
function currentQ(){const raw=state.session[state.idx]||QUESTIONS[0]; if(!state.view||state.view.id!==raw.id||state.view.idx!==state.idx){state.view={id:raw.id,idx:state.idx,choices:makeChoices(raw)};} return raw;}
function route(page,extra={}){state={...state,page,...extra,selected:null,answered:false,view:null};render()}
function bottom(active){return `<nav class="bottom"><button class="${active==='home'?'on':''}" onclick="route('home')">⌂<span>ホーム</span></button><button class="${active==='random'?'on':''}" onclick="startRandom()">☷<span>ランダム</span></button><button class="${active==='review'?'on':''}" onclick="route('review')">△<span>苦手</span></button><button class="${active==='score'?'on':''}" onclick="route('score')">▥<span>進捗</span></button><button class="${active==='settings'?'on':''}" onclick="route('settings')">⚙<span>設定</span></button></nav>`}
function header(title='理容師国家試験対策',back=false){return `<header class="top">${back?`<button onclick="route('home')">‹</button>`:`<button>☰</button>`}<h1>${title}</h1><button onclick="route('search')">⌕</button></header>`}
function home(){const p=prog();return `<main>${header()}<section class="content"><div class="today"><h2>今日の学習</h2><div><b>４択・ＳＳ問題</b><small>重複を抑え、①〜⑮から偏りなく２１問を自動抽出します。</small></div><button onclick="startToday()">開始</button></div><h2>①〜⑮ 進捗</h2><div class="list">${CATEGORIES.map((c,i)=>{let qs=qsCat(c.id),d=qs.filter(q=>p.done[q.id]).length,w=qs.filter(q=>p.wrong[q.id]).length,clr=sub(c.subject).color;return `<button class="law" onclick="startCategory('${c.id}')"><span class="num" style="background:${clr}">${i+1}</span><span class="grow"><span>${i+1}　${c.name}</span><small>学習済み ${d}/${qs.length}　苦手 ${w}</small></span><span class="imp">${pct(d,qs.length)}% ›</span></button>`}).join('')}</div>${progressCard(p)}</section>${bottom('home')}</main>`}
function progressCard(p){let done=Object.keys(p.done).length,wrong=Object.keys(p.wrong).length,imp=QUESTIONS.filter(q=>q.importance>=4),impDone=imp.filter(q=>p.done[q.id]).length,doneCats=CATEGORIES.filter(c=>qsCat(c.id).length&&qsCat(c.id).every(q=>p.done[q.id])).length;return `<section class="progress"><h2>学習の進捗</h2><div class="progress-body"><div class="ring" style="--p:${pct(done,QUESTIONS.length)}"><span>${pct(done,QUESTIONS.length)}%</span><em>${done}/${QUESTIONS.length}</em><small>全体の進捗</small></div><div class="progress-list"><button onclick="route('score')"><span>□　学習済み問題</span><span>${done} / ${QUESTIONS.length} ›</span></button><button onclick="route('score')"><span>☆　重要問題</span><span>${impDone} / ${imp.length} ›</span></button><button onclick="route('review')"><span>△　苦手問題</span><span>${wrong} ›</span></button><button onclick="route('score')"><span>⚖　完了分野</span><span>${doneCats} / ${CATEGORIES.length} ›</span></button></div></div></section>`}
function startCategory(id){let qs=qsCat(id).sort((a,b)=>b.importance-a.importance);state.session=qs;route('question',{category:id,idx:0})}
function startToday(){state.session=buildSmartSession(21);route('question',{idx:0})}
function startRandom(){state.session=buildSmartSession(21);route('question',{idx:0})}
function question(){let q=currentQ(),b=ssBase(q),c=cat(b.gid),s=sub(q.subject);let correctIndex=state.view.choices.findIndex(x=>x.correct);return `<main>${header(`第${state.idx+1}問 / ${state.session.length}問`,true)}<section class="content"><div class="qcard"><div class="qmeta"><span>${s.name} ＞ ${c.name}</span><span>ＳＳ問題・４択</span></div><p class="qtext">${b.q}</p>${state.view.choices.map((ch,i)=>{let cls=state.selected===i?'sel':'';if(state.answered&&ch.correct)cls+=' ok';if(state.answered&&state.selected===i&&!ch.correct)cls+=' ng';return `<button class="choice ${cls}" onclick="select(${i})"><span>${jpNo[i]}</span>${ch.text}</button>`}).join('')}<button class="primary" onclick="answer()">解答する</button></div>${state.answered?answerBox(q,correctIndex,b):''}</section>${bottom('home')}</main>`}
function answerBox(q,correctIndex,b){let ok=state.view.choices[state.selected]?.correct;return `<div class="qcard answer"><h2>${ok?'正解です':'確認しましょう'}</h2><p>正解　${jpNo[correctIndex]}</p><hr><p>解説</p><p>${b.exp}</p><div class="point">覚えるポイント<br>${b.point}</div><div class="actions"><button onclick="markAgain(${q.id})">もう一度解く</button><button onclick="nextQ()">次の問題へ</button></div></div>`}
function select(i){if(!state.answered){state.selected=i;render()}}
function answer(){if(state.selected===null)return;let q=currentQ(),p=prog(),ok=state.view.choices[state.selected]?.correct;p.done[q.id]=true;if(ok)delete p.wrong[q.id];else p.wrong[q.id]=true;p.history.push({id:q.id,ok,day:new Date().toISOString().slice(0,10),group:groupId(q),theme:themeKey(q)});save(p);state.answered=true;render()}
function markAgain(id){let p=prog();p.wrong[id]=true;save(p);nextQ()}
function nextQ(){state.idx<state.session.length-1?route('question',{idx:state.idx+1}):route('score')}
function review(){let p=prog(),qs=QUESTIONS.filter(q=>p.wrong[q.id]);return `<main>${header('苦手問題',true)}<section class="content">${qs.length?qs.map(q=>{let b=ssBase(q);return `<button class="law" onclick="state.session=[QUESTIONS.find(x=>x.id===${q.id})];route('question',{idx:0})"><span class="num">△</span><span class="grow"><span>${cat(b.gid).name}</span><small>${b.q}</small></span><span>解く ›</span></button>`}).join(''):`<div class="empty">苦手問題はありません。</div>`}</section>${bottom('review')}</main>`}
function searchPage(){let t=state.search,qs=t?QUESTIONS.filter(q=>{let b=ssBase(q);return (b.q+b.exp+b.point+cat(b.gid).name).includes(t)}):[];return `<main>${header('検索',true)}<section class="content"><input class="search" placeholder="キーワードで検索" value="${t}" oninput="state.search=this.value;render()">${qs.map(q=>{let b=ssBase(q);return `<button class="law" onclick="state.session=[QUESTIONS.find(x=>x.id===${q.id})];route('question',{idx:0})"><span class="num">⌕</span><span class="grow"><span>${cat(b.gid).name}</span><small>${b.q}</small></span><span>›</span></button>`}).join('')}</section>${bottom('home')}</main>`}
function score(){let p=prog(),h=p.history,ok=h.filter(x=>x.ok).length;return `<main>${header('進捗',true)}<section class="content">${progressCard(p)}<div class="qcard"><h2>正答率</h2><p class="score">${pct(ok,h.length)}%</p><p>${ok} / ${h.length}</p></div><h2>①〜⑮ 別進捗</h2>${CATEGORIES.map((c,i)=>{let qs=qsCat(c.id),d=qs.filter(q=>p.done[q.id]).length,w=qs.filter(q=>p.wrong[q.id]).length;return `<button class="subject-row" onclick="startCategory('${c.id}')"><span>${i+1}　${c.name}<small>苦手 ${w}</small></span><span>${d}/${qs.length}　${pct(d,qs.length)}%</span></button>`}).join('')}</section>${bottom('score')}</main>`}
function settings(){return `<main>${header('設定',true)}<section class="content"><div class="qcard"><p>学習データは、この端末のブラウザに保存されます。</p><button class="danger" onclick="localStorage.clear();route('home')">学習データをリセット</button></div></section>${bottom('settings')}</main>`}
function render(){app.innerHTML=({home,question,review,search:searchPage,score,settings}[state.page]||home)()}
render();
