const app=document.getElementById('app');
const state={screen:'home',mode:'study',exam:EXAM53,index:0,answers:[],revealed:false,resultRecorded:false,practiceType:null};
const PAST_SESSION_KEY='riyoshi_past_exam_session_v1';
const PAST_HISTORY_KEY='riyoshi_past_exam_history_v1';
let pastNavigationReady=false;
function pastNavigationState(){return{screen:state.screen,mode:state.mode,examKey:examKey(state.exam),questionIds:state.exam.questions.map(q=>String(q.id)),practiceType:state.practiceType,index:state.index,answers:[...state.answers],revealed:state.revealed,resultRecorded:state.resultRecorded}}
function commitPastNavigation(replace=false){
 try{history[replace?'replaceState':'pushState']({pastApp:true,state:pastNavigationState()},'',location.href)}catch(_){}
}
function restorePastNavigation(saved){
 if(!saved)return;
 state.screen=['home','overview','quiz','result'].includes(saved.screen)?saved.screen:'home';
 state.mode=saved.mode==='exam'?'exam':'study';
 const base=EXAMS.find(e=>examKey(e)===String(saved.examKey))||EXAM53;
 state.exam=Array.isArray(saved.questionIds)?makePracticeExam(base,saved.questionIds,saved.practiceType):base;
 state.practiceType=saved.practiceType||null;
 state.index=Math.min(Math.max(0,Number(saved.index)||0),state.exam.count-1);
 state.answers=Array.isArray(saved.answers)?saved.answers:Array(state.exam.count).fill(null);
 state.revealed=!!saved.revealed;
 state.resultRecorded=!!saved.resultRecorded;
 render();
}
function resetToPastHome(push=true){
 if(state.screen==='quiz')saveSession();
 state.screen='home';
 state.index=0;
 state.answers=[];
 state.revealed=false;
 state.resultRecorded=false;
 state.practiceType=null;
 render();
 scrollTo(0,0);
 if(pastNavigationReady)commitPastNavigation(!push);
}
function pastHome(){
 if(state.screen==='home')return;
 resetToPastHome(true);
}
(()=>{const s=document.createElement('style');s.textContent='.review-matrix{display:grid;grid-template-columns:minmax(7em,auto) 1fr;margin:8px 0;border:1px solid #dfe6f2;border-radius:10px;overflow:hidden}.review-matrix dt,.review-matrix dd{margin:0;padding:8px 10px;border-bottom:1px solid #e8edf5}.review-matrix dt{font-weight:700;background:#f4f7fc}.review-matrix dd{background:#fff}.saved-result{display:flex;flex-wrap:wrap;gap:6px 12px;padding:9px 11px;border-radius:12px;background:#f4f8fd;color:#536580;font-size:13px}@media(max-width:560px){.review-matrix{grid-template-columns:1fr}}';document.head.appendChild(s)})();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const correct=(q,a)=>q.neutral||Array.isArray(q.answer)?q.neutral||q.answer.includes(a):a===q.answer;
function header(title){return `<header class="header"><span></span><h1>${esc(title)}</h1><span></span></header>`}
const examKey=e=>String(e.baseExamKey??e.examKey??e.round);
const examLabel=e=>e.title.replace(' 理容師国家試験','');
const OFFICIAL_ACADEMIC_YEARS={24:2011,25:2011,26:2012,27:2012,28:2013,29:2013,30:2014,31:2014,32:2015,33:2015,34:2016,35:2016,36:2017,37:2017,38:2018,39:2018,40:2019,41:2019,42:2020,43:2020,44:2021,45:2021,46:2022,47:2022,48:2023,49:2023,50:2024,51:2024,52:2025,53:2025};
const academicYear=e=>OFFICIAL_ACADEMIC_YEARS[Number(e.round)]||'年度確認中';
const fullExamTitle=e=>`${academicYear(e)}年度：${e.title}`;
function pendingPast(){try{const row=JSON.parse(localStorage.getItem(PAST_SESSION_KEY)||'null');return row&&Array.isArray(row.answers)?row:null}catch(_){return null}}
function loadPastHistory(){
 try{
  const value=JSON.parse(localStorage.getItem(PAST_HISTORY_KEY)||'null');
  return value&&value.version===1&&value.exams&&typeof value.exams==='object'?value:{version:1,exams:{}};
 }catch(_){return{version:1,exams:{}}}
}
function savePastHistory(value){try{localStorage.setItem(PAST_HISTORY_KEY,JSON.stringify(value))}catch(_){}}
function questionHistory(e,q){const row=pastExamHistory(e);return row&&row.questions?row.questions[String(q.id||`${examKey(e)}-${q.number}`)]||null:null}
function learningState(row){
 if(!row||!(Number(row.attempts)>0))return '未学習';
 const attempts=Number(row.attempts)||0,corrects=Number(row.correct)||0,rate=attempts?corrects/attempts*100:0,streak=Number(row.correctStreak)||0;
 if(row.lastCorrect===false||(Number(row.wrong)>=2&&rate<60))return '要復習';
 if(streak>=2&&rate>=80)return '習得';
 return '学習中';
}
function learningSummary(e){const out={'未学習':0,'学習中':0,'要復習':0,'習得':0};e.questions.forEach(q=>out[learningState(questionHistory(e,q))]++);return out}
function learningRate(row){if(!row||!row.attempts)return 0;return Math.round((Number(row.correct)||0)/Number(row.attempts)*100)}
function updateQuestionHistory(e,q,answer){
 if(q.neutral||answer===null||answer===undefined)return;
 const history=loadPastHistory(),key=examKey(e),examRow=history.exams[key]&&typeof history.exams[key]==='object'?history.exams[key]:{attempts:[],questions:{}};
 if(!Array.isArray(examRow.attempts))examRow.attempts=[];if(!examRow.questions||typeof examRow.questions!=='object')examRow.questions={};
 const id=String(q.id||`${key}-${q.number}`),row=examRow.questions[id]||{attempts:0,correct:0,wrong:0,correctStreak:0};
 const ok=correct(q,answer),now=new Date().toISOString();
 row.attempts=(Number(row.attempts)||0)+1;row.correct=(Number(row.correct)||0)+(ok?1:0);row.wrong=(Number(row.wrong)||0)+(ok?0:1);
 row.correctStreak=ok?(Number(row.correctStreak)||0)+1:0;row.lastAnswer=answer;row.lastCorrect=ok;row.lastAnsweredAt=now;if(ok&&!row.firstCorrectAt)row.firstCorrectAt=now;
 examRow.questions[id]=row;history.exams[key]=examRow;savePastHistory(history);
}
function makePracticeExam(base,ids,type){const set=new Set((ids||[]).map(String)),questions=base.questions.filter(q=>set.has(String(q.id)));return{...base,baseExamKey:examKey(base),questions,count:questions.length,practiceType:type||null}}
function practiceQuestions(e,type){
 const rows=e.questions.map(q=>({q,row:questionHistory(e,q)}));
 if(type==='unlearned')return rows.filter(x=>learningState(x.row)==='未学習').map(x=>x.q);
 if(type==='review')return rows.filter(x=>learningState(x.row)==='要復習').map(x=>x.q);
 if(type==='weak')return rows.filter(x=>x.row&&x.row.attempts).sort((a,b)=>learningRate(a.row)-learningRate(b.row)||Number(b.row.wrong||0)-Number(a.row.wrong||0)).map(x=>x.q);
 return e.questions;
}
function startPractice(key,type){const base=EXAMS.find(e=>examKey(e)===String(key));if(!base)return;const questions=practiceQuestions(base,type);if(!questions.length){alert('対象問題はありません');return}if(pendingPast()&&!confirm('未完了の過去問があります。新しい学習を開始しますか？'))return;state.exam={...base,baseExamKey:examKey(base),questions,count:questions.length,practiceType:type};state.practiceType=type;state.mode='study';state.screen='quiz';state.index=0;state.answers=Array(questions.length).fill(null);state.revealed=false;state.resultRecorded=false;saveSession();render();if(pastNavigationReady)commitPastNavigation()}
function exportPastBackup(){const blob=new Blob([JSON.stringify({kind:'riyoshi-past-exam-backup',version:1,exportedAt:new Date().toISOString(),history:loadPastHistory()},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`過去問バックアップ_${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function importPastBackup(input){const file=input.files&&input.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(data.kind!=='riyoshi-past-exam-backup'||!data.history||data.history.version!==1)throw new Error();if(!confirm('現在の過去問学習履歴を、選択したバックアップで置き換えますか？'))return;savePastHistory(data.history);render();alert('バックアップを復元しました')}catch(_){alert('このファイルは過去問バックアップとして読み込めません')}finally{input.value=''}};reader.readAsText(file)}
function pastExamHistory(e){return loadPastHistory().exams[examKey(e)]||null}
function pastExamSummary(e){
 const row=pastExamHistory(e),attempts=row&&Array.isArray(row.attempts)?row.attempts:[];
 if(!attempts.length)return '';
 const last=attempts[attempts.length-1];
 const best=attempts.reduce((max,x)=>Math.max(max,Number(x.rate)||0),0);
 return `<div class="saved-result"><span>受験 ${attempts.length}回</span><span>前回 ${last.correctCount}/${last.gradedCount}問（${last.rate}％）</span><span>最高 ${best}％</span></div>`;
}
function resultMetrics(e,answers){
 const graded=e.questions.filter(q=>!q.neutral);
 const correctCount=e.questions.reduce((n,q,i)=>n+(!q.neutral&&correct(q,answers[i])?1:0),0);
 const rate=graded.length?Math.round(correctCount/graded.length*100):0;
 const passLine=graded.length>=55?33:30;
 const categories=[...new Set(graded.map(q=>q.category))];
 const categoryStats=categories.map(category=>{
  const rows=e.questions.map((q,i)=>({q,i})).filter(x=>!x.q.neutral&&x.q.category===category);
  const ok=rows.filter(x=>correct(x.q,answers[x.i])).length;
  return{category,total:rows.length,ok,rate:rows.length?Math.round(ok/rows.length*100):0};
 });
 const zeroCategories=categoryStats.filter(x=>x.ok===0).map(x=>x.category);
 return{gradedCount:graded.length,correctCount,rate,passLine,categoryStats,passed:correctCount>=passLine&&zeroCategories.length===0};
}
function recordPastResult(){
 const e=state.exam,answers=[...state.answers],metrics=resultMetrics(e,answers),history=loadPastHistory(),key=examKey(e);
 const examRow=history.exams[key]&&typeof history.exams[key]==='object'?history.exams[key]:{attempts:[],questions:{}};
 if(!Array.isArray(examRow.attempts))examRow.attempts=[];
 if(!examRow.questions||typeof examRow.questions!=='object')examRow.questions={};
 const completedAt=new Date().toISOString();
 if(!state.practiceType)examRow.attempts.push({completedAt,mode:state.mode,answers,correctCount:metrics.correctCount,gradedCount:metrics.gradedCount,rate:metrics.rate,passed:metrics.passed,categoryStats:metrics.categoryStats});
 if(examRow.attempts.length>50)examRow.attempts=examRow.attempts.slice(-50);
 if(state.mode!=='study')e.questions.forEach((q,i)=>{
  if(q.neutral||answers[i]===null||answers[i]===undefined)return;
  const id=String(q.id||`${key}-${q.number}`),row=examRow.questions[id]||{attempts:0,correct:0,wrong:0};
  const ok=correct(q,answers[i]);
  row.attempts=(Number(row.attempts)||0)+1;
  row.correct=(Number(row.correct)||0)+(ok?1:0);
  row.wrong=(Number(row.wrong)||0)+(ok?0:1);
  row.lastAnswer=answers[i];
  row.lastCorrect=ok;
  row.lastAnsweredAt=completedAt;
  examRow.questions[id]=row;
 });
 history.exams[key]=examRow;
 savePastHistory(history);
 return metrics;
}
function pastModeLabel(e,mode){const row=pendingPast();return row&&String(row.examKey)===examKey(e)&&row.mode===mode?'続きから再開':mode==='exam'?'本試験モード':'学習モード'}
function home(){return `<main class="shell">${header('理容師国家試験 過去問')}<section class="content"><p class="page-description">第29回～第53回の実過去問</p>${EXAMS.map(e=>`<section class="card round-card"><h2>${esc(fullExamTitle(e))}</h2><div class="round-meta"><span>全${e.count}問</span><span>原本順</span></div>${pastExamSummary(e)}${(()=>{const x=learningSummary(e),y=explanationSummary(e);return `<div class="learning-summary"><span>未学習 ${x['未学習']}</span><span>学習中 ${x['学習中']}</span><span>要復習 ${x['要復習']}</span><span>習得 ${x['習得']}</span></div><div class="saved-result"><span>解説監修済み ${y.reviewed}問</span><span>監修待ち ${y.pending}問</span></div>`})()}<div class="mode-grid"><button class="mode exam" onclick="openOverview('${esc(examKey(e))}','exam')">本試験モード</button><button class="mode study" onclick="openOverview('${esc(examKey(e))}','study')">学習モード</button></div><p class="note">本試験モード：全問解答後に採点<br>学習モード：1問ごとに正誤と解説を確認</p><div class="round-footer"><p class="source-note">出典：${esc(e.source)}</p><button class="round-reset" type="button" onclick="resetPastExam('${esc(examKey(e))}')" aria-label="${esc(academicYear(e))}年度の学習状況をリセット" title="${esc(academicYear(e))}年度の学習状況をリセット">↻</button></div></section>`).join('')}</section></main>`}

function openOverview(key,mode){
 const exam=EXAMS.find(e=>examKey(e)===String(key));
 if(!exam)return;
 if(state.screen==='quiz')saveSession();
 state.screen='overview';
 state.exam=exam;
 state.mode=mode==='exam'?'exam':'study';
 state.index=0;
 state.answers=[];
 state.revealed=false;
 state.resultRecorded=false;
 render();
 scrollTo(0,0);
 if(pastNavigationReady)commitPastNavigation();
}

function explanationSummary(e){
 const out={reviewed:0,pending:0};
 e.questions.forEach(q=>{
  const status=String(q.explanationReviewStatus||q.auditStatus?.['解説']||'監修待ち');
  if(/監修済み|確認済み/.test(status)&&!/待ち/.test(status))out.reviewed++;else out.pending++;
 });
 return out;
}
function explanationStatusPanel(e){
 const x=explanationSummary(e);
 return `<section class="explanation-status"><h3>解説監査状況</h3><div class="saved-result"><span>監修済み ${x.reviewed}問</span><span>監修待ち ${x.pending}問</span></div><p class="note">監修待ちの問題では、個別理由を断定せず、公式正答と確認の観点を表示します。</p></section>`;
}
function learningPanel(e){const x=learningSummary(e),weak=practiceQuestions(e,'weak').length;return `<section class="learning-panel"><h3>問題別学習状況</h3><div class="learning-summary large"><span>未学習 ${x['未学習']}</span><span>学習中 ${x['学習中']}</span><span>要復習 ${x['要復習']}</span><span>習得 ${x['習得']}</span></div><div class="practice-grid"><button onclick="startPractice('${esc(examKey(e))}','unlearned')" ${x['未学習']?'':'disabled'}>未学習だけ</button><button onclick="startPractice('${esc(examKey(e))}','review')" ${x['要復習']?'':'disabled'}>要復習だけ</button><button onclick="startPractice('${esc(examKey(e))}','weak')" ${weak?'':'disabled'}>苦手順</button></div><div class="backup-actions"><button onclick="exportPastBackup()">履歴を書き出す</button><label>履歴を読み込む<input type="file" accept="application/json" onchange="importPastBackup(this)"></label></div></section>`}
function overview(){
 const e=state.exam,row=pendingPast(),canResume=row&&String(row.examKey)===examKey(e)&&row.mode===state.mode;
 const modeTitle=state.mode==='exam'?'本試験モード':'学習モード';
 const description=state.mode==='exam'?'全問解答後に採点します。':'1問ごとに正誤と解説を確認します。';
 return `<main class="shell">${header(`${academicYear(e)}年度 第${e.round}回`)}<section class="content overview-content"><section class="card overview-card"><h2>${esc(modeTitle)}</h2><div class="overview-meta"><span>全${e.count}問</span><span>原本順</span></div><p>${esc(description)}</p><button class="overview-start ${state.mode}" type="button" onclick="start('${esc(examKey(e))}','${state.mode}')">${canResume?'続きから再開':'問題を開始'}</button>${state.mode==='study'?learningPanel(e)+explanationStatusPanel(e):''}<p class="source-note">出典：${esc(e.source)}</p></section></section></main>`;
}
function saveSession(){try{localStorage.setItem(PAST_SESSION_KEY,JSON.stringify({examKey:examKey(state.exam),questionIds:state.exam.questions.map(q=>String(q.id)),practiceType:state.practiceType,mode:state.mode,index:state.index,answers:state.answers,revealed:state.revealed,resultRecorded:state.resultRecorded}))}catch(_){}}
function clearSession(){try{localStorage.removeItem(PAST_SESSION_KEY)}catch(_){}}
function resetPastExam(key){
 const target=EXAMS.find(e=>examKey(e)===String(key));
 if(!target||!confirm('この年度の学習状況をリセットしますか？'))return;
 const saved=pendingPast();
 if(saved&&String(saved.examKey)===String(key))clearSession();
 const history=loadPastHistory();
 if(history.exams&&history.exams[String(key)]){delete history.exams[String(key)];savePastHistory(history);}
 if(examKey(state.exam)===String(key)){
  state.index=0;
  state.answers=[];
  state.revealed=false;
  state.resultRecorded=false;
  if(state.screen!=='home')state.screen='home';
 }
 render();
}
function start(key,mode){const existing=pendingPast();if(existing&&String(existing.examKey)===String(key)&&existing.mode===mode){restoreSession();render();if(pastNavigationReady)commitPastNavigation();return}if(existing&&!confirm('未完了の過去問があります。最初から開始しますか？'))return;state.screen='quiz';state.exam=EXAMS.find(e=>examKey(e)===String(key))||EXAM53;state.mode=mode;state.practiceType=null;state.index=0;state.answers=Array(state.exam.count).fill(null);state.revealed=false;state.resultRecorded=false;saveSession();render();if(pastNavigationReady)commitPastNavigation()}
function restoreSession(){try{const saved=JSON.parse(localStorage.getItem(PAST_SESSION_KEY)||'null');if(!saved||!Array.isArray(saved.answers))return false;const base=EXAMS.find(e=>examKey(e)===String(saved.examKey));if(!base)return false;const exam=Array.isArray(saved.questionIds)?makePracticeExam(base,saved.questionIds,saved.practiceType):base;if(saved.answers.length!==exam.count)return false;state.exam=exam;state.practiceType=saved.practiceType||null;state.mode=saved.mode==='exam'?'exam':'study';state.index=Math.min(Math.max(0,Number(saved.index)||0),exam.count-1);state.answers=saved.answers;state.revealed=!!saved.revealed;state.resultRecorded=!!saved.resultRecorded;state.screen='quiz';saveSession();return true}catch(_){return false}}
function splitCombinationStem(value){
 const text=String(value||'');
 if(!/組合せ/.test(text))return null;
 const re=/([a-d])[.．]?[ \u3000]+/g,labels=[],order='abcd';
 let match,expected=0;
 while((match=re.exec(text))){
  const before=match.index?text[match.index-1]:'';
  if(match[1]===order[expected]&&!/[A-Za-z0-9]/.test(before)){labels.push({index:match.index,end:re.lastIndex});expected++;if(expected===4)break;}
 }
 if(labels.length!==4)return null;
 const intro=text.slice(0,labels[0].index).trim();
 const statements=labels.map((item,i)=>text.slice(item.end,i<3?labels[i+1].index:text.length).trim());
 return intro&&statements.every(Boolean)?{intro,statements}:null;
}
function stemHtml(q){
 if(!q.stem)return '';
 if(q.statements)return `<h2 class="stem">${esc(q.stem)}</h2>`;
 const parsed=splitCombinationStem(q.stem);
 if(!parsed)return `<h2 class="stem">${esc(q.stem)}</h2>`;
 return `<h2 class="stem">${esc(parsed.intro)}</h2><div class="statements">${parsed.statements.map((s,i)=>`<div class="statement"><span>${'abcd'[i]}.</span><span>${esc(s)}</span></div>`).join('')}</div>`;
}
function question(){const e=state.exam,q=e.questions[state.index],selected=state.answers[state.index],show=state.mode==='study'&&state.revealed;return `<main class="shell unified-question">${header(`${examLabel(e)}　問題${q.number}`)}<section class="content question-content"><div class="progress"><i style="width:${(state.index+1)/e.count*100}%"></i></div><section class="card question-card"><div class="question-meta"><span>${esc(q.category)}</span><span>${state.index+1} / ${e.count}</span></div>${stemHtml(q)}${q.statements?`<div class="statements">${q.statements.map((s,i)=>`<div class="statement"><span>${'abcd'[i]}.</span><span>${esc(s)}</span></div>`).join('')}</div>`:''}${q.image?`<img class="question-image" src="${esc(q.image)}" alt="${esc(examLabel(e))}問題${q.number}">`:''}<div class="choices">${q.choices.map((c,i)=>`<button class="choice ${selected===i?'selected ':''}${show&&correct(q,i)?'correct ':''}${show&&selected===i&&!correct(q,i)?'wrong ':''}" onclick="choose(${i})" ${show?'disabled':''}><em>${i+1}</em><span>${esc(c)}</span></button>`).join('')}</div>${show?feedback(q,selected):''}<div class="source">原本 PDF ${q.sourcePage}ページ</div></section></section><div class="question-actions"><button type="button" onclick="previousQuestion()" ${state.index===0?'disabled':''}>＜前へ</button><button class="next" onclick="next()" ${selected===null?'disabled':''}>${state.index===e.count-1?'採点する＞':'次へ＞'}</button></div></main>`}
function feedback(q,selected){const audit=q.auditStatus?`<h4>監査状態</h4><dl class="review-matrix">${Object.entries(q.auditStatus).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`:'',ok=correct(q,selected),label=q.neutral?'採点対象外です':ok?'正解です':`正解は ${Array.isArray(q.answer)?q.answer.map(v=>v+1).join(' または '):q.answer+1} です`,legal=q.currentLegalReview?`<h4>現行法令・通知の最終照合</h4><dl class="review-matrix">${Object.entries(q.currentLegalReview).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p><a href="${esc(q.currentLegalUrl)}" target="_blank" rel="noopener">${esc(q.currentLegalSource)}</a></p>`:'',review=q.structuredReview?`<h4>確認の観点</h4><dl class="review-matrix">${Object.entries(q.structuredReview).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`:'',choiceNotes=(q.verifiedChoiceExplanations||[]).length?`<h4>監修済み選択肢別解説</h4><ol>${q.verifiedChoiceExplanations.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:'',pending=!(q.verifiedChoiceExplanations||[]).length?`<p class="explanation-pending">選択肢ごとの詳細理由は監修待ちです。根拠未確認の説明は表示していません。</p>`:'',current=q.currentSourceUrl?`<p>現行資料：<a href="${esc(q.currentSourceUrl)}" target="_blank" rel="noopener">${esc(q.currentSourceTitle)}</a></p>`:'';return `<section class="feedback"><h3>${label}</h3><p>${esc(q.explanation)}</p>${pending}${audit}${legal}${review}${choiceNotes}<p>根拠状態：${esc(q.evidenceStatus)}</p><p>公開資料基準日：${esc(q.reviewDate||'2026-07-16')}／<a href="${esc(q.officialSourceUrl||'https://www.rbc.or.jp/exam/past_question/')}" target="_blank" rel="noopener">公式過去問</a></p>${current}</section>`}
function choose(i){if(state.mode==='study'&&state.revealed)return;state.answers[state.index]=i;if(state.mode==='study'){state.revealed=true;updateQuestionHistory(state.exam,state.exam.questions[state.index],i)}saveSession();render()}
function next(){if(state.answers[state.index]===null)return;if(state.index===state.exam.count-1){if(!state.resultRecorded){recordPastResult();state.resultRecorded=true;}state.screen='result';clearSession();render();if(pastNavigationReady)commitPastNavigation();scrollTo(0,0);return}state.index++;state.revealed=false;saveSession();render();if(pastNavigationReady)commitPastNavigation(true);scrollTo(0,0)}
function previousQuestion(){if(state.index<=0)return;state.index--;state.revealed=state.mode==='study'&&state.answers[state.index]!==null;saveSession();render();if(pastNavigationReady)commitPastNavigation(true);scrollTo(0,0)}
function result(){const e=state.exam,metrics=resultMetrics(e,state.answers),graded=e.questions.filter(q=>!q.neutral);if(state.practiceType){return `<main class="shell">${header(`${academicYear(e)}年度 学習結果`)}<section class="content"><section class="card result"><span>正答数</span><div class="score">${metrics.correctCount} / ${graded.length}</div><p class="correct-rate">正答率 ${metrics.rate}％</p><p class="pass-note">問題別学習履歴へ反映しました</p><div class="result-actions"><button onclick="startPractice('${esc(examKey(e))}','${esc(state.practiceType)}')">もう一度</button><button onclick="showHome()">回別一覧へ</button></div></section></section></main>`}const correctCount=metrics.correctCount,rate=metrics.rate,passLine=metrics.passLine,stats=metrics.categoryStats,zeroCategories=stats.filter(x=>x.ok===0).map(x=>x.category),passed=metrics.passed,short=Math.max(0,passLine-correctCount),low=stats.filter(x=>x.rate<40).map(x=>x.category),reasons=[];if(!passed){if(correctCount<passLine)reasons.push(`合格基準の60％に達していません（あと${short}問）。`);if(zeroCategories.length)reasons.push(`無得点の分野があります：${zeroCategories.join('、')}`);if(low.length)reasons.push(`正答率が特に低い分野があります：${low.join('、')}`)}return `<main class="shell">${header(`${academicYear(e)}年度 第${e.round}回 採点結果`)}<section class="content"><section class="card result"><div class="pass-result ${passed?'passed':'failed'}">${passed?'合格！':'不合格！'}</div><span>総正答数</span><div class="score">${correctCount} / ${graded.length}</div><p class="correct-rate">総正答率 ${rate}％</p><p class="pass-note">合格基準：${passLine}問以上（60％以上）かつ全課目で1点以上${graded.length!==e.count?`／採点対象${graded.length}問`:''}</p><section class="category-results">${stats.map(x=>`<div class="category-row"><span>${esc(x.category)}</span><span>${x.ok} / ${x.total}問　${x.rate}％</span></div>`).join('')}</section>${reasons.length?`<section class="fail-reasons"><h3>不合格になった主な要因</h3><ul>${reasons.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`:''}<div class="result-actions"><button onclick="start('${esc(examKey(e))}','${state.mode}')">もう一度</button><button onclick="showHome()">回別一覧へ</button></div></section></section></main>`}
function showHome(){pastHome()}
function pastBack(){
 if(state.screen==='result'){
  state.screen='quiz';
  state.index=Math.min(state.index,state.exam.count-1);
  state.revealed=state.mode==='study'&&state.answers[state.index]!==null;
  saveSession();
  render();
  scrollTo(0,0);
  if(pastNavigationReady)commitPastNavigation(true);
  return;
 }
 if(state.screen==='quiz'){
  saveSession();
  state.screen='overview';
  state.index=0;
  state.answers=[];
  state.revealed=false;
  render();
  scrollTo(0,0);
  if(pastNavigationReady)commitPastNavigation(true);
  return;
 }
 if(state.screen==='overview'){
  resetToPastHome(false);
 }
}
function render(){
 app.innerHTML=state.screen==='home'?home():state.screen==='overview'?overview():state.screen==='result'?result():question();
 const back=document.getElementById('pastBack');
 const homeButton=document.getElementById('pastHome');
 const isHome=state.screen==='home';
 if(back)back.hidden=isHome;
 if(homeButton)homeButton.hidden=isHome;
 if(isHome)app.querySelectorAll('.round-card').forEach((card,index)=>{
  const exam=EXAMS[index],buttons=card.querySelectorAll('.mode');
  if(buttons[0])buttons[0].textContent=pastModeLabel(exam,'exam');
  if(buttons[1])buttons[1].textContent=pastModeLabel(exam,'study');
 });
}
// アプリ起動時は必ず第1階層を表示する。未完了データは保持し、各回の『続きから再開』から復元する。
state.screen='home';
render();
pastNavigationReady=true;
commitPastNavigation(true);
window.addEventListener('popstate',event=>{
 if(event.state&&event.state.pastApp){
  restorePastNavigation(event.state.state);
 }else{
  state.screen='home';
  state.index=0;
  state.answers=[];
  state.revealed=false;
  state.resultRecorded=false;
  render();
 }
});
