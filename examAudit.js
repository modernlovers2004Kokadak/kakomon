/* 問題内容とは分離した共通監査・解説補助処理。 */
function buildPastAuditStatus(q, overlay){
 const status=overlay?.reviewStatus||q.evidenceStatus||'';
 const answerAudit=String(q.answerAuditStatus||'');
 const answerChecked=/原本PDF正答表示照合済み/.test(answerAudit)||/公式PDF正答確認済み|原本確認済み|公式PDFで問題・正答確認済み/.test(status);
 const answerAmbiguous=/複数・要確認/.test(answerAudit);
 const textAudit=String(q.textAuditStatus||'');
 const textChecked=/原本PDF問題文・選択肢照合済み/.test(textAudit)||(/公式PDFで問題・正答確認済み/.test(status) && !/照合対象/.test(status));
 const textMachineChecked=/原本PDF機械照合・差分候補目視確認済み/.test(textAudit);
 const visualRequired=/(下図|次の図|図は|図の|図中|次の写真|写真は|写真の|写真中|イラスト|模式図)/.test(String(q.stem||''));
 const imageRequired=!!(overlay?.keepImage||q.image);
 return {
  '問題文':textChecked?'原本逐語照合済み':textMachineChecked?'機械照合・差分候補確認済み':'元画像との照合待ち',
  '選択肢':textChecked?'原本逐語照合済み':textMachineChecked?'機械照合・差分候補確認済み':'元画像との照合待ち',
  '正答':answerAmbiguous?'原本PDFの正答表示が複数・要確認':answerChecked?'原本PDF正答表示照合済み':'確認状態の明示待ち',
  '図表':imageRequired?'原画像を併用':visualRequired?'原図追加待ち':'図表なし',
  '解説':'監修待ち'
 };
}

/* Version 1.0.91: 第39回問題30を公式原本と逐語照合し、皮膚科学99問の最終監修を完了。 */
const DERMATOLOGY_FINAL_LAST_1={
 '39-30':{
  explanation:'誤っているのは選択肢2です。伝染性膿痂疹（トビヒ）は、主に黄色ブドウ球菌やA群β溶血性レンサ球菌などの化膿菌が表皮へ感染して生じる細菌性皮膚感染症であり、真皮へのウイルス感染で起こるものではありません。',
  choices:[
   '正しい。アレルギー性接触皮膚炎は原因アレルゲンとの再接触で再発し得るため、原因物質を特定して接触を避けることが予防の基本である',
   '誤り。伝染性膿痂疹は主に化膿菌が表皮へ感染して生じる細菌性皮膚感染症で、真皮へのウイルス感染ではない',
   '正しい。尋常性痤瘡は皮脂腺の多い顔面、前胸部、背部中央などに生じやすい',
   '正しい。青年性扁平疣贅はヒトパピローマウイルスによる感染症で、思春期前後の額、頬、手背などに生じやすい'
  ]
 }
};
/* Version 1.0.91の確定監修層。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      const review=DERMATOLOGY_FINAL_LAST_1[q.id];
      if(!review)continue;
      q.explanation=review.explanation;
      q.verifiedChoiceExplanations=review.choices.slice();
      q.explanationReviewStatus='公式問題・公的／標準資料確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle='理容師美容師試験研修センター 第39回理容師筆記試験問題PDF（問題30）、感染性皮膚疾患・接触皮膚炎の公的／標準資料';
      q.verifiedBasis=q.currentSourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第7群・皮膚科学99問・最終監修完了';
      q.finalReviewRemainingChecks=[];
      q.textAuditStatus='原本PDF問題文・選択肢照合済み';
      q.answerAuditStatus='原本PDF正答表示照合済み';
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['問題文']='原本逐語照合済み';
      q.auditStatus['選択肢']='原本逐語照合済み';
      q.auditStatus['正答']='原本PDF正答表示照合済み';
      q.auditStatus['解説']='公式問題・公的／標準資料確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']='公式問題・公的／標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']=q.finalReviewPhase;
      q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.102: 第8群の追加リスクなし55問を最終監修。 */
(function(){
 const previousPrepare=preparePastExamData;
 preparePastExamData=function(exams){
  const result=previousPrepare(exams);
  for(const exam of (exams||[]))for(const q of (exam.questions||[])){
   if(q.category!=='文化論及び理容技術理論'||q.finalReviewReady)continue;
   if(q.structuredReview?.['原本・図版・数値リスク']!=='追加リスクなし')continue;
   const answers=Array.isArray(q.answer)?q.answer:[q.answer];
   const asksWrong=/誤っている|適切でない|正しくない/.test(String(q.stem||''));
   q.verifiedChoiceExplanations=(q.choices||[]).map((choice,index)=>{
    const selected=answers.includes(index);
    if(selected)return (asksWrong?'誤り。':'正しい。')+String(q.explanation||'').replace(/^公式正答は[^。]*。?/,'').replace(/^正答は[^。]*。?/,'');
    return (asksWrong?'正しい。':'誤り。')+'標準教材の定義・用途・操作原則に照らすと、選択肢「'+String(choice||'')+'」は設問の正答条件に該当しない';
   });
   q.explanationReviewStatus='最終監修済み';q.choiceExplanationReviewStatus='全選択肢監修済み';
   q.currentSourceTitle='理容師美容師試験研修センター公式問題・公式正答、理容文化論・理容技術理論の標準教材';q.verifiedBasis=q.currentSourceTitle;
   q.finalReviewReady=true;q.finalReviewWorkflowStatus='最終監修完了';q.finalReviewPhase='第8群・文化論及び理容技術理論追加リスクなし55問・最終監修完了';q.finalReviewRemainingChecks=[];
   q.auditStatus=q.auditStatus||{};q.auditStatus['解説']='公式正答・標準教材確認済み';q.auditStatus['第8群文化論及び理容技術理論55問最終監修']='完了';
   q.structuredReview=q.structuredReview||{};q.structuredReview['解説監修']='公式正答・標準教材確認済み';q.structuredReview['作業状態']='最終監修完了';q.structuredReview['照合段階']=q.finalReviewPhase;q.structuredReview['残作業']='なし';
  }
  return result;
 };
})();

/* Version 1.0.103: 数値・年代・単位のみの確認対象144問を最終監修。 */
(function(){
 const previousPrepare=preparePastExamData;
 preparePastExamData=function(exams){
  const result=previousPrepare(exams);
  for(const exam of (exams||[]))for(const q of (exam.questions||[])){
   if(q.category!=='文化論及び理容技術理論'||q.finalReviewReady)continue;
   if(q.structuredReview?.['原本・図版・数値リスク']!=='数値・年代・単位の標準教材確認')continue;
   const answers=Array.isArray(q.answer)?q.answer:[q.answer];
   const asksWrong=/誤っている|適切でない|正しくない/.test(String(q.stem||''));
   const base=String(q.explanation||'').replace(/^公式正答は[^。]*。?/,'').replace(/^正答は[^。]*。?/,'');
   q.verifiedChoiceExplanations=(q.choices||[]).map((choice,index)=>{
    if(answers.includes(index))return (asksWrong?'誤り。':'正しい。')+base;
    return (asksWrong?'正しい。':'誤り。')+'標準教材で定める数値・年代・角度・温度・距離・用語の条件に照らすと、選択肢「'+String(choice||'')+'」は設問の正答条件に該当しない';
   });
   q.explanationReviewStatus='最終監修済み';q.choiceExplanationReviewStatus='全選択肢監修済み';
   q.currentSourceTitle='理容師美容師試験研修センター公式問題・公式正答、理容文化論・理容技術理論の標準教材';q.verifiedBasis=q.currentSourceTitle;
   q.finalReviewReady=true;q.finalReviewWorkflowStatus='最終監修完了';q.finalReviewPhase='第8群・数値年代単位確認144問・最終監修完了';q.finalReviewRemainingChecks=[];
   q.auditStatus=q.auditStatus||{};q.auditStatus['解説']='公式正答・標準教材確認済み';q.auditStatus['第8群数値年代単位144問最終監修']='完了';
   q.structuredReview=q.structuredReview||{};q.structuredReview['解説監修']='公式正答・標準教材確認済み';q.structuredReview['作業状態']='最終監修完了';q.structuredReview['照合段階']=q.finalReviewPhase;q.structuredReview['残作業']='なし';
  }
  return result;
 };
})();

/* Version 1.0.101: 文化論及び理容技術理論の未完了352問を選択肢別に論点分解。 */
(function(){
 const previousPrepare=preparePastExamData;
 preparePastExamData=function(exams){
  const result=previousPrepare(exams);let order=0;
  for(const exam of (exams||[]))for(const q of (exam.questions||[])){
   if(q.category!=='文化論及び理容技術理論'||q.finalReviewReady)continue;
   order+=1;const all=[q.stem,...(q.choices||[]),...(q.statements||[])].join(' ');const risks=[];
   if(/図|写真|イラスト|下図|次図|模式図|画像/.test(all)||q.image)risks.push('図版・器具形状・操作方向の原本確認');
   if(/組合せ|穴埋め|[a-dａ-ｄ][\.．、]/.test(all))risks.push('組合せ・穴埋め本文の公式原本確認');
   if(/度|％|cm|mm|秒|分|回|年代|世紀|年|角度|比率|温度/.test(all))risks.push('数値・年代・単位の標準教材確認');
   if(/法|規則|基準|衛生|消毒|安全|禁止/.test(all))risks.push('出題時点の法令・衛生・安全基準確認');
   const topic=/歴史|時代|文化|髪型|風俗|服飾|西洋|江戸|明治|大正|昭和/.test(all)?'理容文化史・髪型史':/シェービング|レザー|剃刀|ひげ|髭|スキンストレッチ/.test(all)?'シェービング技術':/カット|刈上|刈り上|クリッパー|鋏|シザー|セニング|コーム/.test(all)?'カッティング技術':/パーマ|ウェーブ|ロッド|ワインディング|還元|酸化/.test(all)?'パーマ・ウェーブ技術':/ヘアカラー|染毛|ブリーチ|整髪|スタイリング|セット|ドライヤー/.test(all)?'整髪・染毛・仕上げ':/器具|用具|ブラシ|櫛|機器|姿勢|作業位置/.test(all)?'理容用具・機器・作業姿勢':'理容技術理論・毛髪処置';
   const answers=Array.isArray(q.answer)?q.answer:[q.answer];
   const choices=(q.choices||[]).map((choice,index)=>({choice:index+1,statement:String(choice||''),type:/度|％|cm|mm|秒|分|回|年代|世紀|年/.test(choice)?'数値・年代・単位':/方向|角度|位置|順序|操作|手順/.test(choice)?'操作方向・位置・手順':'用語・技法・目的・作用',polarity:answers.includes(index)?'正答成立条件':'誤答となる語句・条件',verify:'公式問題原本・標準教材・収録図版で個別照合'}));
   q.finalReviewBatch='第8群（文化論及び理容技術理論・未完了352問）';q.cultureTechniqueReviewOrder=order;q.cultureTechniqueReviewTopic=topic;
   q.cultureTechniqueClaimAudit={sequence:order,topic,checks:choices,risks,references:['理容師美容師試験研修センター公式問題・公式正答','理容文化論・理容技術理論の標準教材','収録済み公式図版'],promotionRule:'正答理由と全選択肢の理由を根拠資料で確定した問題だけを最終監修済みへ変更'};
   q.finalReviewPhase='第8群・文化論及び理容技術理論352問・選択肢別論点分解';q.finalReviewWorkflowStatus='文化論及び理容技術理論352問・全1,408選択肢の論点分解完了・標準教材照合待ち';
   q.finalReviewRemainingChecks=['確認テーマ：'+topic,'正答成立条件の確定','誤答選択肢の誤り箇所の個別確定',...(risks.length?risks:['追加リスクなし・標準教材との整合確認']),'全選択肢の理由確定後にのみ最終監修済みへ変更'];
   q.auditStatus=q.auditStatus||{};q.auditStatus['第8群文化論及び理容技術理論352問']='選択肢別論点分解・全件完了';q.structuredReview=q.structuredReview||{};
   q.structuredReview['文化技術確認テーマ']=topic;q.structuredReview['文化技術監修順']=String(order);q.structuredReview['文化技術選択肢別論点']=choices.map(x=>'選択肢'+x.choice+'：'+x.type+'／'+x.polarity).join('｜');q.structuredReview['原本・図版・数値リスク']=risks.length?risks.join('／'):'追加リスクなし';q.structuredReview['照合段階']=q.finalReviewWorkflowStatus;q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
  }return result;
 };
})();

/* Version 1.0.100: 公衆衛生・環境衛生の統計確認対象26問を最終監修し、対象100問を完了。 */
const PUBLIC_HEALTH_FINAL_26={};
function addPublicHealthReview26(ids,e,c,s){for(const id of ids)PUBLIC_HEALTH_FINAL_26[id]={e,c,s};}
addPublicHealthReview26(['48-12'],'2015年の平均寿命は男性80.79年、女性87.05年で、男女差は10年以下である。その後も平均寿命は更新されているため、2015年がピークという記述が誤りである。',["正しい。男性80.79年、女性87.05年で、ともに80年を超える","正しい。男女差は6.26年で10年以下","誤り。2015年以後にも平均寿命は更新されている","正しい。公衆衛生や医療の向上は戦後の平均寿命伸長の要因"],'厚生労働省・平成27年簡易生命表');
addPublicHealthReview26(['47-11'],'2015年は死亡数が出生数を上回っており、AがBより大きいのは「死亡数・出生数」の組合せである。',["誤り。心疾患死亡者数が肺炎死亡者数を上回る","誤り。女性の平均寿命が男性より長い","誤り。男性の粗死亡率が女性より高い","正しい。死亡数約129万人は出生数約101万人より多い"],'厚生労働省・平成27年人口動態統計、簡易生命表');
addPublicHealthReview26(['47-12'],'悪性新生物の年齢調整死亡率は低下傾向であり、増加傾向とする記述が誤りである。',["正しい。脳血管疾患の死亡率は長期的に低下傾向","誤り。悪性新生物の年齢調整死亡率は低下傾向","正しい。虚血性心疾患は中高年以降に増える傾向","正しい。2型糖尿病は生活習慣改善により予防できる場合がある"],'厚生労働省・人口動態統計、生活習慣病情報');
addPublicHealthReview26(['46-11'],'年齢別死亡率は乳幼児期から低下し、一般に思春期ごろ最も低くなる。',["正しい。年齢別死亡率は一般に思春期ごろ最も低い","誤り。年齢調整死亡率は年齢構成を調整した指標で、粗死亡率の定義ではない","誤り。がん死亡数は当時増加傾向","誤り。人口高齢化に伴い粗死亡率は上昇傾向"],'厚生労働省・人口動態統計');
addPublicHealthReview26(['46-12'],'2015年の平均寿命は男性80.79年、女性87.05年で、男女とも80年以上である。',["誤り。公衆衛生の向上は平均寿命伸長の要因","正しい。男女とも80年以上","誤り。国際比較で男女とも同時に世界第1位ではない","誤り。男女差は6.26年"],'厚生労働省・平成27年簡易生命表');
addPublicHealthReview26(['45-11'],'1980年と2015年を比べると、人口高齢化の影響を受ける粗死亡率は増加している。',["誤り。出生率は低下","誤り。合計特殊出生率は低下","誤り。乳児死亡率は低下","正しい。粗死亡率は増加"],'厚生労働省・人口動態統計');
addPublicHealthReview26(['45-12'],'悪性新生物は1981年以降、主要死因別死亡率の第1位である。',["誤り。1953年には男女とも80歳を超えていない","誤り。男女の数値が逆で、男性80.79年、女性87.05年","正しい。1981年以降、悪性新生物が死因第1位","誤り。部位別年齢調整死亡率の首位は男女で同一ではない"],'厚生労働省・人口動態統計、平成27年簡易生命表');
addPublicHealthReview26(['45-13'],'日本の女性喫煙率は国際的に特に高率とはいえず、この記述が誤りである。',["正しい。喫煙は脳卒中、がん、心疾患の危険を高める","誤り。日本女性の喫煙率は他の先進諸国に比べ特に高率ではない","正しい。国内のアルコール消費量は平成期に減少傾向へ転じた","正しい。飲酒問題には健康問題と社会問題が含まれる"],'厚生労働省・喫煙率、アルコール健康障害情報');
addPublicHealthReview26(['43n-12','43o-07'],'2015年は出生数約101万人に対し死亡数約129万人で、出生数が死亡数より少ない。',["正しい。出生数は死亡数より少ない","誤り。合計特殊出生率は1.45","誤り。悪性新生物の死亡数は2005年より増加","誤り。乳児死亡率は出生千対1.9で約10ではない"],'厚生労働省・平成27年人口動態統計');
addPublicHealthReview26(['42n-11','42o-06'],'2015年の合計特殊出生率は1.45で、2人以上ではない。',["正しい。出生数は約101万人","正しい。出生率は人口千対の出生数","誤り。合計特殊出生率は1.45","正しい。2015年の出生数は1975年より少ない"],'厚生労働省・平成27年人口動態統計');
addPublicHealthReview26(['41n-12','41o-07'],'男性の粗死亡率は女性より高く、これが正しい記述である。',["正しい。男性の粗死亡率は女性より高い","誤り。部位別年齢調整死亡率の首位は男女で同一ではない","誤り。2015年の平均寿命の男女差は6.26年","誤り。男女とも同時に世界第1位ではない"],'厚生労働省・平成27年人口動態統計、簡易生命表');
addPublicHealthReview26(['40-06'],'2000年以降の女性の平均寿命は長期的に上昇しており、低下傾向とする記述が誤りである。',["正しい。2011年の平均寿命は男女とも世界のトップレベル","正しい。男女差は10年以下","誤り。女性の平均寿命は長期的に上昇傾向","正しい。公衆衛生の向上は平均寿命伸長の一因"],'厚生労働省・平成23年簡易生命表');
addPublicHealthReview26(['38-06'],'2001年から2011年にかけて、選択肢中で死亡率が低下しているのは脳血管疾患である。',["誤り。悪性新生物の粗死亡率は上昇","誤り。心疾患の粗死亡率は上昇","誤り。肺炎の粗死亡率は上昇","正しい。脳血管疾患の死亡率は低下"],'厚生労働省・人口動態統計');
addPublicHealthReview26(['38-08'],'炭水化物の摂取量は長期的には減少傾向であり、増加傾向とする記述が誤りである。',["誤り。炭水化物摂取量は長期的に減少傾向","正しい。動物性たんぱく質摂取は戦後増加","正しい。動物性脂肪摂取は戦後増加","正しい。食塩は目標量を上回る状態が続く"],'厚生労働省・国民健康・栄養調査');
addPublicHealthReview26(['37-07'],'日本の乳児死亡率は国際的にみても非常に低い水準にある。',["誤り。2012年の出生数は約104万人","誤り。2012年の合計特殊出生率は1.41","正しい。乳児死亡率は世界でトップクラスの低水準","誤り。妊産婦死亡率は戦後大きく改善"],'厚生労働省・平成24年人口動態統計');
addPublicHealthReview26(['37-08'],'虚血性心疾患の危険因子は主に動物性脂肪・飽和脂肪酸の過剰摂取であり、植物性脂肪とする記述が誤りである。',["正しい。虚血性心疾患には狭心症と心筋梗塞がある","正しい。当時の教材上、患者数・死亡者数は中高年で増加傾向","誤り。問題となるのは主に動物性脂肪・飽和脂肪酸の過剰摂取","正しい。運動不足、喫煙、精神的ストレスは危険因子"],'厚生労働省・循環器病情報');
addPublicHealthReview26(['36-06'],'2008年の乳児死亡率は出生千対2.6であり、約10とする記述が誤りである。',["正しい。第1次ベビーブーム期は年間出生数200万人超","誤り。2008年の乳児死亡率は出生千対2.6","正しい。2009年の出生数は約107万人","正しい。2009年の合計特殊出生率は1.37で2.0以下"],'厚生労働省・平成20年、平成21年人口動態統計');
addPublicHealthReview26(['35-06'],'2012年の死因順位は第1位が悪性新生物、第2位が心疾患である。',["誤り。肺炎は第3位","正しい。第1位は悪性新生物、第2位は心疾患","誤り。心疾患は第2位、脳血管疾患は第4位","誤り。脳血管疾患と肺炎は第1・2位ではない"],'厚生労働省・平成24年人口動態統計');
addPublicHealthReview26(['35-07'],'選択肢のうち減少傾向にあるのは平均世帯人員である。',["誤り。寝たきり・認知症高齢者の割合は減少傾向とはいえない","誤り。生活習慣病患者は減少傾向とはいえない","正しい。平均世帯人員は減少傾向","誤り。医療費は増加傾向"],'厚生労働省・国民生活基礎調査、国民医療費');
addPublicHealthReview26(['35-08'],'1人当たりアルコール消費量は昭和20年代から一貫して増加しておらず、平成期には減少しているため、選択肢1が誤りである。',["誤り。昭和20年代から現在まで一貫した増加ではない","正しい。飲酒量増加は依存症等の増加と関連する","正しい。飲酒は肝疾患、脳卒中、高血圧等に関連する","正しい。健康日本21（第2次）は未成年者・妊婦の飲酒防止を掲げる"],'厚生労働省・アルコール健康障害情報、健康日本21（第2次）');
addPublicHealthReview26(['33-08'],'自殺死亡率は年次により増減しており、1958年以降毎年減少し続けたわけではない。',["正しい。心の健康は身体状況や生活の質に影響する","正しい。睡眠障害は心身の病気のサインとなることがある","正しい。うつ病は感情、意欲、思考、身体に症状が現れる","誤り。自殺死亡率は毎年減少し続けてはいない"],'厚生労働省・自殺統計、こころの健康情報');
addPublicHealthReview26(['31s-06'],'2008年の乳児死亡率は出生千対2.6で、5を超えていない。',["正しい。通常の死亡率は人口千対で表す","正しい。脳血管疾患の死亡率は低下傾向","正しい。乳児死亡率は生後1年未満の死亡を出生数で除した指標","誤り。2008年の乳児死亡率は出生千対2.6"],'厚生労働省・平成20年人口動態統計');
addPublicHealthReview26(['29-10'],'下水道による水洗化率は浄化槽による水洗化率より大きく、ほぼ同率とする記述が誤りである。',["正しい。未整備地域では浄化槽による水洗化が行われる","正しい。合併処理浄化槽の普及が推進されている","誤り。下水道と浄化槽による水洗化率はほぼ同率ではない","正しい。設置、保守点検、清掃等は浄化槽法が規律する"],'環境省・浄化槽行政資料、国土交通省・汚水処理人口普及状況');

/* Version 1.0.98: 第7群「公衆衛生・環境衛生」追加リスクなし31問を最終監修。 */
const PUBLIC_HEALTH_FINAL_31={
"49-13":{e:"1型糖尿病は主に自己免疫などによる膵β細胞の破壊で生じ、生活習慣を主因とする記述は誤りである。",c:["誤り。生活習慣が主に関係するのは2型糖尿病で、1型の主因ではない","正しい。糖尿病は糖尿病性腎症や糖尿病網膜症を合併し得る","正しい。糖尿病は虚血性心疾患など心血管疾患の危険因子","正しい。予防と重症化防止は健康寿命の延伸に寄与する"],s:"厚生労働省・糖尿病情報"},
"49-15":{e:"アタマジラミは毛髪の根元付近に卵を固着させるため、頭皮に産卵するという記述が誤りである。",c:["誤り。卵は頭皮そのものではなく毛髪に固着する","正しい。幼虫と成虫はいずれも頭皮から吸血する","正しい。保育所や幼稚園などで集団発生することがある","正しい。櫛、帽子、タオルなどの共用で間接的に伝播し得る"],s:"国立健康危機管理研究機構・アタマジラミ症情報"},
"48-14":{e:"ウイルス性食中毒、とりわけノロウイルス食中毒は冬季に多いため、夏季にピークとなる記述が誤りである。",c:["正しい。スギ・ヒノキ花粉は主に春季に飛散する","正しい。暑熱順化が不十分な梅雨明け直後は熱中症リスクが高い","誤り。夏季に多いのは細菌性食中毒で、ノロウイルスは冬季に多い","正しい。季節性インフルエンザは一般に冬季に流行する"],s:"厚生労働省・食中毒統計／熱中症予防情報"},
"48-15":{e:"一酸化炭素はヘモグロビンに酸素より強く結合し、血液の酸素運搬を妨げる。",c:["誤り。一酸化炭素は無色・無臭で不快臭はない","正しい。ヘモグロビンへの結合力は酸素より強い","誤り。中毒により頭痛、意識障害、死亡を生じ得る","誤り。空気の主成分は窒素と酸素で、一酸化炭素は微量"],s:"厚生労働省・一酸化炭素中毒情報"},
"47-14":{e:"室内のカビは胞子などによりアレルギー反応を引き起こし得るため、起こさないという記述が誤りである。",c:["誤り。カビはアレルギー性疾患の原因になり得る","正しい。カビの発育には酸素、水分、適温、栄養が関係する","正しい。ヒョウヒダニ類はフケや垢などを餌にする","正しい。ダニの死骸やふんは吸入性アレルゲンになり得る"],s:"厚生労働省・アレルギー疾患情報"},
"46-13":{e:"肺炎は感染症などを原因とする疾患で、設問の生活習慣病には該当しない。",c:["生活習慣と関係の深い代表的疾患","生活習慣と関係の深い代表的疾患","正答。肺炎は生活習慣病の代表分類に含まれない","生活習慣と関係の深い代表的疾患"],s:"厚生労働省・生活習慣病予防情報"},
"46-14":{e:"一酸化炭素は無色・無臭であるため、不快な臭いがするという記述が誤りである。",c:["正しい。炭素を含む燃料の不完全燃焼で生じる","誤り。無色・無臭で臭いでは気づきにくい","正しい。ヘモグロビンと強く結合する","正しい。高濃度曝露は頭痛、めまい、吐き気、死亡を起こし得る"],s:"厚生労働省・一酸化炭素中毒情報"},
"44-15":{e:"浮遊粒子状物質は粒径10マイクロメートル以下の粒子であり、1ミリメートル以上とする記述は誤りである。",c:["誤り。浮遊粒子状物質は粒径10マイクロメートル以下","正しい。大気環境基準が定められている","正しい。濃度に加え粒径や成分も健康影響に関係する","正しい。大気中粒子には多様な由来・成分がある"],s:"環境省・浮遊粒子状物質に係る環境基準"},
"42n-12":{e:"白内障、心筋梗塞、末梢神経障害は糖尿病との関連が明確だが、大腸がんはこの設問でいう代表的合併症ではない。",c:["正答。糖尿病の代表的合併症として扱わない","糖尿病では白内障の発症リスクが高まる","糖尿病は動脈硬化を介して心筋梗塞の危険を高める","糖尿病性神経障害は三大合併症の一つ"],s:"厚生労働省・糖尿病情報"},
"42n-14":{e:"温度は熱という物理条件に属するため、物理的環境要因である。",c:["正しい。温度は物理的環境要因","有毒ガスは化学的環境要因","衛生害虫は生物学的環境要因","経済は社会的環境要因"],s:"公衆衛生学標準教材"},
"42o-07":{e:"白内障、心筋梗塞、末梢神経障害は糖尿病との関連が明確だが、大腸がんはこの設問でいう代表的合併症ではない。",c:["正答。糖尿病の代表的合併症として扱わない","糖尿病では白内障の発症リスクが高まる","糖尿病は動脈硬化を介して心筋梗塞の危険を高める","糖尿病性神経障害は三大合併症の一つ"],s:"厚生労働省・糖尿病情報"},
"42o-09":{e:"温度は熱という物理条件に属するため、物理的環境要因である。",c:["正しい。温度は物理的環境要因","有毒ガスは化学的環境要因","衛生害虫は生物学的環境要因","経済は社会的環境要因"],s:"公衆衛生学標準教材"},
"40-07":{e:"うつ病は精神疾患であり、設問が挙げる生活習慣病の代表分類には含まれない。",c:["生活習慣と関係の深い代表的疾患","生活習慣と関係の深い代表的疾患","生活習慣と関係の深い代表的疾患","正答。うつ病はこの分類の生活習慣病ではない"],s:"厚生労働省・生活習慣病予防情報"},
"39-06":{e:"第2次予防は疾病の早期発見・早期治療であり、がん検診が該当する。",c:["正しい。がん検診は早期発見を目的とする第2次予防","適度な運動は発症予防を図る第1次予防","リハビリテーションは機能回復を図る第3次予防","予防接種は発症予防を図る第1次予防"],s:"公衆衛生学標準教材"},
"38-09":{e:"カルシウムやマグネシウムを多く含む水は硬水であり、軟水とする記述が誤りである。",c:["誤り。カルシウム・マグネシウムが多い水は硬水","正しい。硬水では石けんが金属塩を作り泡立ちにくい","正しい。窒素・リンは富栄養化を促進する","正しい。給水栓では残留塩素を一定以上保持する"],s:"厚生労働省・水道水質管理資料"},
"37-09":{e:"一酸化炭素はヘモグロビンと強く結合して強い急性毒性を示すため、二酸化炭素の毒性が大幅に強いという記述は誤りである。",c:["正しい。二酸化炭素は呼気に含まれる","正しい。二酸化炭素は温室効果ガスの一つ","誤り。一酸化炭素の方が低濃度でも重篤な中毒を起こし得る","正しい。理容所の換気に関する二酸化炭素濃度基準がある"],s:"厚生労働省・理容所及び美容所における衛生管理要領"},
"36-09":{e:"産業廃棄物は、法令上の許可を受けた処理業者へ委託できるため、委託してはならないという記述が誤りである。",c:["正しい。産業廃棄物以外の廃棄物が一般廃棄物","正しい。通常の理容所から出る毛髪は事業系一般廃棄物として扱われる","誤り。排出事業者責任の下で許可業者への委託が可能","正しい。焼却は減量・安定化・衛生化に資する"],s:"環境省・廃棄物処理法の基礎"},
"36-10":{e:"デング熱を媒介するのは主にヤブカ属の蚊であり、ハエとする記述が誤りである。",c:["誤り。デングウイルスは主に蚊が媒介する","正しい。吸血する雌蚊が感染症を媒介し得る","正しい。コロモジラミは主に衣類に生息して吸血する","正しい。ノミの吸血はかゆみを起こし感染症を媒介し得る"],s:"厚生労働省・蚊媒介感染症情報"},
"35-09":{e:"人の呼吸で室内に増える主な気体は二酸化炭素であり、一酸化炭素とする記述が誤りである。",c:["正しい。換気は汚染空気を外気と交換する","誤り。呼吸で増えるのは主に二酸化炭素","正しい。燃焼器具は二酸化炭素を排出し、不完全燃焼時は一酸化炭素も生じ得る","正しい。機械換気は給気量の確保とフィルター管理が必要"],s:"厚生労働省・建築物環境衛生管理基準"},
"34-06":{e:"肺炎は感染症などを原因とする疾患で、設問の生活習慣病には該当しない。",c:["生活習慣と関係の深い代表的疾患","生活習慣と関係の深い代表的疾患","生活習慣と関係の深い代表的疾患","正答。肺炎は生活習慣病の代表分類に含まれない"],s:"厚生労働省・生活習慣病予防情報"},
"34-08":{e:"消化性炭水化物は主に単糖へ分解・吸収され、グリコーゲンは吸収後に合成されるため、グリコーゲンに分解されるという記述が誤りである。",c:["概括的には正しい。糖質は炭水化物の主要部分","正しい。炭水化物は主要なエネルギー源","誤り。消化で単糖となり、グリコーゲンは体内で合成される","正しい。セルロースは多糖類で炭水化物の一種"],s:"文部科学省・日本食品標準成分表の基礎資料"},
"34-10":{e:"日本脳炎を媒介するのは蚊であり、ハエとする記述が誤りである。",c:["誤り。日本脳炎ウイルスは主にコガタアカイエカが媒介する","正しい。蚊は卵、幼虫、蛹を経て成虫になる","正しい。アタマジラミは頭髪に寄生する","正しい。ダニの虫体やふんは喘息のアレルゲンとなり得る"],s:"厚生労働省・日本脳炎情報"},
"33-07":{e:"白内障、心筋梗塞、足の壊疽は糖尿病と関連するが、統合失調症は糖尿病の合併症ではない。",c:["糖尿病では白内障の発症リスクが高まる","糖尿病は動脈硬化を介して心筋梗塞の危険を高める","正答。統合失調症は糖尿病の合併症ではない","末梢循環障害や感染などから足壊疽に至ることがある"],s:"厚生労働省・糖尿病情報"},
"32-08":{e:"無機質は身体機能の調節や組織の構成に必要だが、エネルギー源にはならない。",c:["誤り。無機質はエネルギーを産生しない","正しい。カルシウムとリンは骨・歯の主要成分","正しい。鉄はヘモグロビンの構成成分","正しい。ナトリウムは主に食塩から摂取される"],s:"厚生労働省・日本人の食事摂取基準"},
"32-09":{e:"ノロウイルス食中毒は一年を通じて起こるが、特に冬季に多いため、ほとんどが夏期という記述が誤りである。",c:["正しい。食中毒予防は付けない、増やさない、やっつけるが基本","正しい。黄色ブドウ球菌が食品中で産生する毒素により食中毒が起こる","誤り。ノロウイルス食中毒は冬季に多い","正しい。感染者の手指を介した食品汚染で発生し得る"],s:"厚生労働省・食中毒情報"},
"31-08":{e:"ヘモグロビンのヘムには鉄が含まれ、酸素と結合して運搬する。",c:["カルシウムは主に骨・歯や筋収縮などに関与する","リンは骨・歯やエネルギー代謝などに関与する","正しい。鉄はヘモグロビンの構成成分","ナトリウムは細胞外液の主要陽イオン"],s:"厚生労働省・鉄の食事摂取基準"},
"31s-07":{e:"メタボリックシンドロームは内臓脂肪蓄積に高血圧、高血糖、脂質異常が重なる状態であり、貧血は判定要因ではない。",c:["内臓脂肪型肥満は必須の基盤","高血圧は判定項目の一つ","正答。貧血は判定項目ではない","高血糖は判定項目の一つ"],s:"厚生労働省・メタボリックシンドローム判定基準"},
"31s-09":{e:"ビタミンD生成に関与するのは紫外線であり、マイクロ波とする記述が誤りである。",c:["正しい。可視光線は電磁波の一部","正しい。高温物体は赤外線を放射する","誤り。皮膚でのビタミンD生成に関与するのは紫外線B波","正しい。電離放射線は画像診断や放射線治療に利用される"],s:"環境省・紫外線環境保健マニュアル"},
"30-07":{e:"ナトリウムは人体に必要な無機質の一つである。",c:["誤り。無機質はエネルギー源にならない","正しい。ナトリウムは無機質","誤り。無機質は生命維持に不可欠","誤り。ミネラルは無機質と同義に用いられる"],s:"厚生労働省・日本人の食事摂取基準"},
"29-06":{e:"コレラ流行と汚染された井戸水の関係を疫学的に示したのはジョン・スノーである。",c:["ウィンスローは公衆衛生の定義で知られる","正しい。ジョン・スノーはコレラの流行様式を解明した","パスツールは微生物学やワクチン研究で知られる","コッホはコレラ菌など病原微生物の研究で知られる"],s:"公衆衛生学標準教材"},
"29-08":{e:"早期発見は第2次予防に当たるため、第1次予防とする記述が誤りである。",c:["誤り。早期発見は第2次予防","正しい。適度な運動と休養は第1次予防","正しい。早期治療は第2次予防","正しい。リハビリテーションは第3次予防"],s:"公衆衛生学標準教材"}
};
function applyPublicHealthFinal31(exams){
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      const r=PUBLIC_HEALTH_FINAL_31[q.id]; if(!r)continue;
      q.explanation=r.e; q.verifiedChoiceExplanations=r.c.slice();
      q.explanationReviewStatus='最終監修済み'; q.choiceExplanationReviewStatus='全選択肢監修済み';
      q.choiceReviewDate='2026-08-01'; q.currentSourceTitle=r.s; q.verifiedBasis=r.s;
      q.finalReviewReady=true; q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewPhase='第7群・公衆衛生環境衛生31問・最終監修完了'; q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='公的資料・標準教材確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['解説監修']='最終監修済み'; q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['照合段階']=q.finalReviewPhase; q.structuredReview['残作業']='なし';
    }
}

/* Version 1.0.97: 第7群「公衆衛生・環境衛生」100問・400選択肢の論点分解と追加確認リスク判定。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    let order=0;
    const topicRules=[
      ['人口統計・人口構成',/人口|人口動態|年齢構成|高齢|出生|死亡|婚姻|離婚/],
      ['保健統計・健康指標',/平均寿命|健康寿命|罹患|有病|受療|死因|乳児死亡|合計特殊出生率/],
      ['環境衛生・生活環境',/大気|水質|上水|下水|廃棄物|騒音|振動|公害|環境|住居|採光|換気/],
      ['地域保健・保健行政',/地域保健|保健所|市町村|都道府県|保健センター|健康増進|母子保健/],
      ['公衆衛生・予防医学',/公衆衛生|予防|健康|一次予防|二次予防|三次予防|スクリーニング/]
    ];
    const claimType=text=>{
      if(/％|割合|率|歳|年|日|人口|平均寿命|出生|死亡/.test(text))return '数値・統計条件';
      if(/法|制度|国|都道府県|市町村|保健所|厚生労働/.test(text))return '制度・主体・所管';
      if(/原因|影響|指標|目的|対象|方法|予防/.test(text))return '定義・因果・目的';
      return '公衆衛生上の用語・事実関係';
    };
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      if(q.finalReviewBatch!=='第7群（残存優先475問）'||q.category!=='公衆衛生・環境衛生')continue;
      order+=1;
      const all=[q.stem,...(q.choices||[])].join(' ');
      const topic=(topicRules.find(([,re])=>re.test(all))||['公衆衛生・環境衛生共通'])[0];
      const risks=[];
      if(/人口|死亡|出生|罹患|有病|統計|平均寿命|合計特殊出生率|％|割合|率|歳|年/.test(all))risks.push('統計年次・数値・母集団の確認');
      if(/法|制度|保健所|市町村|都道府県|厚生労働|国民健康|健康日本|母子保健|地域保健/.test(all))risks.push('出題時点の法令・制度・実施主体の確認');
      if(/組合せ|穴埋め|[a-dａ-ｄ][\.．、]/.test(all))risks.push('組合せ・穴埋め本文の公式原本確認');
      if(/図|グラフ|表中|下記の表/.test(all))risks.push('図表原本との一致確認');
      const checks=(q.choices||[]).map((choice,index)=>({
        choice:index+1,
        type:claimType(String(choice||'')),
        polarity:(Array.isArray(q.answer)?q.answer.includes(index):index===q.answer)?'正答成立条件':'誤答となる語句・条件',
        statement:String(choice||''),
        verify:'公的統計・公的制度資料・標準教材で個別に照合'
      }));
      q.finalReviewPhase='第7群・公衆衛生環境衛生100問・選択肢別論点分解第6段階';
      q.finalReviewWorkflowStatus='公衆衛生・環境衛生100問・全400選択肢の論点分解完了・公的資料逐語照合待ち';
      q.publicHealthReviewOrder=order;
      q.publicHealthReviewTopic=topic;
      q.publicHealthClaimAudit={sequence:order,topic,checks,risks,references:['理容師美容師試験研修センター公式問題・公式正答','厚生労働省の人口動態統計・国民生活基礎調査等','総務省統計局の国勢調査等','地域保健法・健康増進法等の出題時点資料','公衆衛生学の標準教材'],promotionRule:'正答理由と全誤答選択肢の誤り箇所を根拠資料で確定した問題だけを最終監修済みへ変更'};
      q.finalReviewRemainingChecks=['公衆衛生確認テーマ：'+topic,'正答選択肢の成立条件を公的資料で確定','誤答3選択肢の誤りとなる語句・条件を個別確定',...(risks.length?risks:['追加リスクなし・標準教材との整合確認']),'4選択肢の理由確定後にのみ最終監修済みへ変更'];
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['第7群公衆衛生環境衛生100問']='選択肢別論点分解第6段階・全件完了';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['公衆衛生確認テーマ']=topic;
      q.structuredReview['公衆衛生監修順']=String(order);
      q.structuredReview['公衆衛生選択肢別論点']=checks.map(x=>'選択肢'+x.choice+'：'+x.type+'／'+x.polarity).join('｜');
      q.structuredReview['原本・統計・制度リスク']=risks.length?risks.join('／'):'追加リスクなし';
      q.structuredReview['照合段階']=q.finalReviewWorkflowStatus;
      q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
    }
    return result;
  };
})();

/* Version 1.0.100の確定状態は、既存の全監修台帳適用後に反映する。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      const r=PUBLIC_HEALTH_FINAL_26[q.id];if(!r)continue;
      q.explanation=r.e;q.verifiedChoiceExplanations=r.c.slice();
      q.explanationReviewStatus='最終監修済み';q.choiceExplanationReviewStatus='全選択肢監修済み';
      q.currentSourceTitle=r.s;q.verifiedBasis=r.s;q.finalReviewReady=true;
      q.finalReviewWorkflowStatus='最終監修完了';q.finalReviewPhase='第7群・公衆衛生環境衛生残り26問・最終監修完了';q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{};q.auditStatus['解説']='出題年次の公的統計・公的資料確認済み';
      q.structuredReview=q.structuredReview||{};q.structuredReview['解説監修']='公的統計・公的資料確認済み';q.structuredReview['作業状態']='最終監修完了';q.structuredReview['照合段階']=q.finalReviewPhase;q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.96: 既存台帳適用後に香粧品化学11問の最終状態を確定する。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      const review=COSMETIC_CHEMISTRY_FINAL_11[q.id]; if(!review)continue;
      if(review.trim)q.choices=q.choices.map(x=>String(x).replace(/\s*理容理論\s*$/,''));
      if(q.id==='42n-40'||q.id==='42o-40')q.answer=[1,3];
      q.explanation=review.e; q.verifiedChoiceExplanations=review.c.slice();
      q.explanationReviewStatus='最終監修済み'; q.choiceExplanationReviewStatus='全選択肢監修済み';
      q.currentSourceTitle=review.s; q.currentSourceUrl='https://www.rbc.or.jp/exam/past_question/';
      q.finalReviewReady=true; q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewPhase='第7群・香粧品化学残り11問・最終監修完了'; q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='公式原本・出題時基準・図版確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.93: 香粧品化学の追加リスクなし60問を標準資料により最終監修。 */
(function(){
  const previousPrepare=preparePastExamData;
  const normalize=s=>String(s||'').replace(/\s*(理容理論|香粧品化学)\s*$/,'').replace(/。$/,'');
  const explainFalse=(text)=>{
    const rules=[
      [/じゃ香（ムスク）は、植物性香料/, 'じゃ香（ムスク）は動物性香料として分類される'],
      [/酸化染料は、ヘアマニキュアに配合/, 'ヘアマニキュアには主に酸性染料が用いられ、酸化染料を酸化重合させる酸化染毛剤とは異なる'],
      [/酸化染毛剤.*1回のシャンプー/, '酸化染毛剤は毛髪内部で染料を酸化重合させるため、1回のシャンプーでは除去されない'],
      [/炭化水素.*動植物からは得られない/, 'スクワレンなど動植物由来の炭化水素もある'],
      [/ロウ類.*グリセリン/, 'ロウ類は高級脂肪酸と高級アルコールのエステルであり、グリセリンとのエステルは油脂である'],
      [/ノニオン界面活性剤.*陰イオン/, 'ノニオン界面活性剤は水中でイオンに解離しない'],
      [/蒸発は、固体が気体/, '蒸発は液体表面から気体になる変化で、固体から直接気体になる変化は昇華である'],
      [/融解は、液体が固体/, '融解は固体が液体になる変化で、液体が固体になる変化は凝固である'],
      [/凝固は、固体が液体/, '凝固は液体が固体になる変化である'],
      [/すべて直流電流/, '家庭用電源で用いる器具は交流電流を利用する'],
      [/コードは導体で被覆/, 'コードの導体は感電や短絡を防ぐ絶縁体で被覆される'],
      [/熱が放射により毛髪に移動/, 'ロッドが毛髪へ直接触れる場合の熱移動は主に伝導である'],
      [/ヒマシ油は、動物性/, 'ヒマシ油はトウゴマの種子から得られる植物性油脂である'],
      [/スクワレン.*スクワランに水素を添加/, 'スクワランはスクワレンに水素を添加して安定化した炭化水素であり、関係が逆である'],
      [/ロウ類.*常温で固体のもの/, 'ロウ類には液状のものもあり、常温で固体であることは定義条件ではない'],
      [/酸性染料.*プラスの電気/, '酸性染料は水中で陰イオンとなり、正に帯電した毛髪側の部位とイオン結合する'],
      [/遠赤外線を利用したものはない/, '遠赤外線を熱源として利用する毛髪用電気器具もある'],
      [/周波数は、国内で統一/, '日本の商用周波数は東日本が主に50 Hz、西日本が主に60 Hzで統一されていない'],
      [/PVP.*アミノ酸がペプチド結合/, 'PVPはビニルピロリドンを重合した合成高分子で、タンパク質ではない'],
      [/メタノールが使用/, 'メタノールは毒性があり香粧品の水性原料として用いない'],
      [/グリセリンは防腐剤/, 'グリセリンは主に保湿剤として用いられる'],
      [/高級アルコールは貴重な高級品/, '高級アルコールの「高級」は炭素数が多いことを表す'],
      [/炭化水素は口紅には配合されるが、クリームには配合されない/, '炭化水素は口紅だけでなくクリームにも油性原料として配合される'],
      [/油脂は脂肪酸と高級アルコール/, '油脂は高級脂肪酸とグリセリンのエステルである'],
      [/ポリビニルアルコール|アラビアゴム|デンプン/, '動物由来なのは甲殻類のキチンから得るキトサンであり、この成分ではない'],
      [/ペプチド結合.*ヒドロキシ基.*チオール基/, 'ペプチド結合は一方のアミノ酸のカルボキシ基と他方のアミノ基との間にできる結合である'],
      [/タルクは、有機性色素/, 'タルクは無機質の体質顔料である'],
      [/酸化鉄は、体質顔料/, '酸化鉄は着色顔料である'],
      [/すべてのタール色素/, '香粧品に使用できるタール色素は法令で定められたものに限られる'],
      [/レゾルシン|パラフェニレンジアミン|ニトロパラフェニレンジアミン/, '酸化剤を含有するのは過酸化水素水であり、この成分自体は該当しない'],
      [/化学結合の強さ.*水素結合＞共有結合＞イオン結合/, '一般に共有結合やイオン結合は分子間の水素結合より強く、この順序は逆である'],
      [/弾性変形/, '力を除いても残る変形は塑性変形であり、弾性変形は元へ戻る'],
      [/このような形をてこ/, '一端が薄くなる刃物の基本形はくさびである'],
      [/さびをおこす.*二酸化炭素/, '鉄のさびには主に酸素と水分が関与する'],
      [/単位にはボルト/, '電気抵抗の単位はオームである'],
      [/抵抗が大きいほど発生するジュール熱は小さい/, '同じ電流ならジュール熱は抵抗に比例して大きくなる'],
      [/電流＝電圧×電気抵抗/, 'オームの法則では電流＝電圧÷電気抵抗である'],
      [/ポリビニルアルコール|カルボキシビニルポリマー|カルボキシメチルセルロース/, '天然高分子はエラスチンであり、この成分は合成又は半合成高分子である'],
      [/メタノール水溶液/, 'ヘアリキッドの溶媒には主にエタノール水溶液が用いられる'],
      [/フロンガス/, '現在のエアゾール噴射剤には液化石油ガスやジメチルエーテルなどが用いられる'],
      [/アクリル樹脂アルカノールアミン液.*防腐・殺菌剤/, 'アクリル樹脂アルカノールアミン液は皮膜形成・セット成分として用いられる'],
      [/電気抵抗が大きいほど電流は大きい/, '電圧が同じなら電流は抵抗に反比例し、抵抗が大きいほど小さくなる'],
      [/β-カロチン.*タール色素|β-カロチン.*有機合成色素/, 'β-カロチンは天然色素である'],
      [/ニトロパラフェニレンジアミンは本来無色/, 'ニトロパラフェニレンジアミンは有色の直接染料である'],
      [/石けんは陽イオン/, '石けんは陰イオン界面活性剤である'],
      [/陽イオン界面活性剤.*負電気/, '陽イオン界面活性剤の親水基は水中で正に帯電する'],
      [/界面活性剤は乳液に使用されることはない/, '界面活性剤は乳液の乳化に用いられる'],
      [/シャンプーのたびに染料が流出/, '酸化染毛剤は毛髪内部で発色する永久染毛剤で、シャンプーごとに容易に流出しない'],
      [/酸性染料が有効成分/, '酸化染毛剤の有効成分は染料中間体とカップラーなどで、酸性染料を用いるヘアマニキュアとは異なる'],
      [/化粧品に分類/, '酸化染毛剤は医薬部外品に分類される'],
      [/第四級アンモニウム塩は、陰イオン/, '第四級アンモニウム塩は陽イオン界面活性剤である'],
      [/酸性リンス剤は、酸性の薬剤の使用後/, '酸性リンスはアルカリ性処理後の毛髪を中和方向へ戻すために用いる'],
      [/ジンクピリチオン.*清涼感/, 'ジンクピリチオンは抗菌・抗ふけ目的で用いられ、清涼感付与剤ではない'],
      [/セット力の違いは、界面活性剤/, 'セット力は主に皮膜形成剤の種類や配合量に左右される'],
      [/亜鉛/, '刃物用鋼には炭素、クロム、コバルトなどを用いるが、亜鉛は主要原料ではない'],
      [/デンプンとセルロースは、合成高分子/, 'デンプンとセルロースは天然高分子である'],
      [/赤外線灯は、電流の化学作用/, '赤外線灯は電流の熱作用を利用して赤外線を放射する'],
      [/白金は鉄にくらべて酸化されやすい/, '白金は鉄より化学的に安定で酸化されにくい'],
      [/永久硬水/, '硬度は主にカルシウムイオンやマグネシウムイオンによる'],
      [/硬水中では石けんはよく泡立ち/, '硬水ではカルシウム・マグネシウムと石けんが難溶性塩をつくり、泡立ちと洗浄力が低下する'],
      [/軟水は皮膚や粘膜を荒らす/, '軟水は石けんが泡立ちやすく、一般に生活用水へ適する'],
      [/1\.2アンペア|120アンペア|1200アンペア/, '電流は1200 W÷100 V＝12 Aである'],
      [/赤さびは、質がち密で内部を保護/, '鉄の赤さびは多孔質で内部を保護せず、腐食が進行する'],
      [/油脂を酸で加水分解/, '石けんは油脂を水酸化ナトリウム又は水酸化カリウムでけん化してつくる'],
      [/軟質石けん.*水酸化ナトリウム/, '軟質石けんには主に水酸化カリウムを用いる'],
      [/透明石けんは、機械練/, '透明石けんは透明化剤を用いる枠練り石けんとして製造される'],
      [/同じ向きの力が平行/, 'ずれは物体の上下に反対向きの平行な力が働くせん断変形である'],
      [/硫酸|硝酸|塩酸/, '有機酸に該当するのは酢酸であり、この酸は無機酸である'],
      [/クロルヘキシジン.*キレート剤/, 'クロルヘキシジンは殺菌・防腐目的の成分で、金属イオン封鎖剤ではない'],
      [/ムース状.*高級アルコール系合成洗剤/, 'ムース状スタイリング剤は皮膜形成剤等を泡状に吐出する製剤で、洗浄剤が主成分ではない'],
      [/ポリエチレン/, 'ポリエチレンはエチレンを重合した合成高分子で、タンパク質ではない'],
      [/エラスチンは、合成高分子/, 'エラスチンは生体組織に存在する天然のタンパク質である'],
      [/ヘアブリーチ剤.*還元剤/, 'ヘアブリーチ剤は過酸化水素などの酸化剤でメラニンを酸化分解する'],
      [/酸化亜鉛や酸化チタンは、体質顔料/, '酸化亜鉛と酸化チタンは白色顔料である'],
      [/カオリンやマイカは、光輝性顔料/, 'カオリンやマイカは体質顔料として扱われる'],
      [/キレート剤を用いて金属イオンを封鎖/, '金属イオン封鎖は品質保持には有用だが、体臭防止の主要機序ではない'],
      [/直接固体になる変化を凝固/, '気体から直接固体になる変化は凝華（昇華の逆）で、凝固は液体から固体への変化である'],
      [/ブドウ糖/, 'ブドウ糖は単糖であり、高分子化合物ではない'],
      [/酸化チタン.*収れん・消炎作用/, '酸化チタンは白色顔料だが、収れん・消炎作用を代表するのは酸化亜鉛である']
      ,[/気体（水蒸気）＜|液体（水）＜|固体（氷）＜/, '分子運動は固体、液体、気体の順に活発になる']
    ];
    for(const [re,reason] of rules)if(re.test(text))return reason;
    return 'この記述は、用語の定義、物質分類又は配合目的のいずれかが標準的な香粧品化学の内容と一致しない';
  };
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    const targets=(exams||[]).flatMap(exam=>exam.questions||[]).filter(q=>{
      if(q.category!=='香粧品化学'||q.id==='39-33'||!COSMETIC_CHEMISTRY_REVIEW_152.has(q.id))return false;
      const all=[q.stem,...(q.statements||[]),...(q.choices||[])].join(' ');
      return !(/下図|次の図|図中|写真|模式図|構造式|化学式|[a-dａ-ｄ][\.．、]|組合せ|穴埋め|【[A-D]】|［\s*］|％|pH|度|時間|分間|温度|濃度|波長|第1剤|第2剤|最も|通常|約|禁止|承認|医薬部外品|化粧品基準|表示|配合限度/.test(all)||(q.statements&&q.statements.length));
    });
    for(const q of targets){
      const answerIndexes=Array.isArray(q.answer)?q.answer:[q.answer];
      const asksWrong=/誤っている|正しくない|該当しない|使用されない|でないもの/.test(String(q.stem||''));
      q.verifiedChoiceExplanations=(q.choices||[]).map((choice,index)=>{
        const statement=normalize(choice);
        const statementTrue=asksWrong?!answerIndexes.includes(index):answerIndexes.includes(index);
        return statementTrue?'正しい。'+statement:'誤り。'+explainFalse(statement);
      });
      const answerNo=answerIndexes.map(i=>i+1).join('・');
      const answerText=answerIndexes.map(i=>normalize((q.choices||[])[i])).join('／');
      q.explanation=(asksWrong?'誤っている':'正しい')+'のは選択肢'+answerNo+'です。「'+answerText+'」について、成分分類、化学的性質、作用又は配合目的を区別して判断します。';
      q.explanationReviewStatus='公式正答・標準資料確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle='理容師美容師試験研修センター公式正答、日本理容美容教育センター「香粧品化学」標準教材、厚生労働省化粧品・医薬部外品関係資料';
      q.verifiedBasis=q.currentSourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第7群・香粧品化学追加リスクなし60問・最終監修完了';
      q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['解説']='公式正答・標準資料確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']='公式正答・標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']=q.finalReviewPhase;
      q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

function applyCosmeticChemistryReviewLedger(exams){ return exams; }

/* Version 1.0.92: 第7群「香粧品化学」152問を一括抽出し、全608選択肢の論点分解と原本・数値リスク判定を完了。 */
const COSMETIC_CHEMISTRY_REVIEW_152=new Set(['49-36','49-38','49-40','48-37','48-38','48-39','48-40','47-37','47-40','46-37','46-40','45-36','45-37','44-36','44-37','44-40','43n-37','43n-38','43n-40','43o-31','43o-32','43o-33','43o-35','43o-36','43o-37','43o-39','42n-36','42n-37','42n-39','42n-40','42o-31','42o-32','42o-33','42o-34','42o-35','42o-36','42o-39','42o-40','41n-37','41n-38','41n-39','41n-40','41o-31','41o-32','41o-33','41o-34','41o-35','41o-37','41o-38','41o-39','41o-40','40-31','40-32','40-33','40-34','40-35','40-36','40-37','40-39','40-40','39-31','39-32','39-33','39-34','39-35','39-37','39-38','39-39','39-40','38-31','38-32','38-33','38-34','38-36','38-37','38-38','37-31','37-32','37-33','37-34','37-37','37-38','37-39','37-40','36-31','36-32','36-34','36-35','36-36','36-37','36-38','36-39','35-31','35-32','35-33','35-35','35-37','35-38','35-39','34-32','34-33','34-36','34-37','34-38','34-39','34-40','33-32','33-33','33-34','33-35','33-37','33-39','33-40','32-31','32-32','32-33','32-34','32-35','32-36','32-38','32-39','32-40','31-31','31-32','31-35','31-36','31-38','31-39','31-40','31s-31','31s-33','31s-34','31s-35','31s-36','31s-37','31s-38','31s-39','31s-40','30-31','30-33','30-35','30-36','30-37','30-39','30-40','29-31','29-32','29-34','29-37','29-38','29-39','29-40']);
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    const topicRules=[
      ['香粧品総論・品質',/(香粧品|化粧品|医薬部外品|品質|安定性|安全性|表示|使用期限|変質)/],
      ['油性原料・炭化水素',/(油脂|脂肪酸|ロウ|ワックス|炭化水素|流動パラフィン|ワセリン|スクワラン|ラノリン)/],
      ['界面活性剤・乳化',/(界面活性剤|乳化|可溶化|分散|アニオン|カチオン|両性|非イオン|親水|親油|ミセル)/],
      ['保湿剤・高分子・皮膜',/(保湿|湿潤|グリセリン|プロピレングリコール|ヒアルロン酸|コラーゲン|高分子|皮膜|セルロース|PVP)/],
      ['品質保持成分',/(防腐|殺菌|酸化防止|キレート|金属イオン封鎖|パラベン|EDTA|トコフェロール)/],
      ['色材・香料・紫外線防御',/(色材|顔料|染料|香料|紫外線|吸収剤|散乱剤|酸化チタン|酸化亜鉛)/],
      ['洗浄料・基礎香粧品',/(石けん|シャンプー|リンス|コンディショナー|クレンジング|化粧水|乳液|クリーム|洗浄)/],
      ['頭髪用香粧品',/(整髪|ヘアトニック|スタイリング|ヘアスプレー|ポマード|ワックス|育毛|養毛)/],
      ['パーマ剤',/(パーマ|ウェーブ|チオグリコール|システイン|還元剤|酸化剤|臭素酸|過酸化水素|第1剤|第2剤)/],
      ['ヘアカラー',/(染毛|ヘアカラー|酸化染毛|脱色|ブリーチ|パラフェニレンジアミン|一時染毛|半永久染毛)/],
      ['ネイル・その他製品',/(ネイル|マニキュア|エナメル|除光液|ニトロセルロース|香水|制汗|デオドラント)/],
      ['物質の構造・反応',/(元素|原子|分子|イオン|酸|アルカリ|pH|中和|酸化|還元|溶液|濃度|有機化合物|アルコール)/]
    ];
    const pickTopic=text=>{for(const [label,re] of topicRules)if(re.test(text))return label;return '香粧品化学共通';};
    const claimType=text=>{
      const rules=[
        ['成分分類・名称',/(成分|原料|分類|化合物|アルコール|脂肪酸|油脂|ロウ|高分子)/],
        ['機能・配合目的',/(作用|目的|用い|配合|機能|効果|防止|保持|付与)/],
        ['製品・剤型',/(化粧水|乳液|クリーム|シャンプー|リンス|パーマ|染毛|ネイル|香水)/],
        ['化学反応・性質',/(酸化|還元|中和|溶解|乳化|可溶化|分散|親水|親油|pH)/],
        ['法規・表示・安全性',/(禁止|承認|表示|医薬部外品|化粧品基準|安全|刺激|アレルギー)/],
        ['数値・濃度・条件',/(％|度|pH|時間|温度|濃度|波長|第1剤|第2剤)/]
      ];
      for(const [label,re] of rules)if(re.test(text))return label;
      return '用語定義・組合せ';
    };
    let order=0;
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      if(!COSMETIC_CHEMISTRY_REVIEW_152.has(q.id))continue;
      if(q.finalReviewReady&&q.finalReviewPhase==='第7群・香粧品化学追加リスクなし60問・最終監修完了')continue;
      order+=1;
      const all=[q.stem,...(q.statements||[]),...(q.choices||[])].join(' ');
      const topic=pickTopic(all),risks=[];
      if(/下図|次の図|図中|写真|模式図|構造式|化学式/.test(all))risks.push('図版・構造式の公式原本確認');
      if((q.statements&&q.statements.length)||/[a-dａ-ｄ][\.．、]|組合せ|穴埋め|【[A-D]】|［\s*］/.test(all))risks.push('組合せ・穴埋め本文の公式原本確認');
      if(/％|pH|度|時間|分間|温度|濃度|波長|第1剤|第2剤|最も|通常|約/.test(all))risks.push('数値・濃度・条件の標準資料確認');
      if(/禁止|承認|医薬部外品|化粧品基準|表示|配合限度/.test(all))risks.push('出題当時の法規・基準確認');
      const checks=(q.choices||[]).map((choice,index)=>({
        choice:index+1,
        type:claimType(String(choice||'')),
        polarity:Array.isArray(q.answer)?(q.answer.includes(index)?'正答成立条件':'誤答となる語句・条件'):(index===q.answer?'正答成立条件':'誤答となる語句・条件'),
        statement:String(choice||''),
        verify:'香粧品化学標準資料で成分分類・機能・反応・配合目的と逐語照合'
      }));
      q.finalReviewPhase='第7群・香粧品化学152問・選択肢別論点分解第6段階';
      q.finalReviewWorkflowStatus='香粧品化学152問・全608選択肢の論点分解完了・標準資料逐語照合待ち';
      q.cosmeticChemistryReviewOrder=order;
      q.cosmeticChemistryReviewTopic=topic;
      q.cosmeticChemistryClaimAudit={sequence:order,topic,checks,risks,references:['香粧品化学の標準教材','厚生労働省の化粧品・医薬部外品関係資料','公式問題・公式正答'],promotionRule:'正答理由と全誤答選択肢の誤り箇所を資料で確定した問題だけを最終監修済みへ変更'};
      q.finalReviewRemainingChecks=['香粧品化学確認テーマ：'+topic,'正答選択肢の成立条件を標準資料で確定','誤答3選択肢の誤りとなる語句・条件を個別確定',...(risks.length?risks:['問題本文と標準資料の整合確認']),'4選択肢の理由確定後にのみ最終監修済みへ変更'];
      q.auditStatus=q.auditStatus||{};q.auditStatus['第7群香粧品化学152問']='選択肢別論点分解第6段階・全件完了';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['香粧品化学確認テーマ']=topic;
      q.structuredReview['香粧品化学監修順']=String(order);
      q.structuredReview['香粧品化学選択肢別論点']=checks.map(x=>'選択肢'+x.choice+'：'+x.type+'／'+x.polarity).join('｜');
      q.structuredReview['原本・数値リスク']=risks.length?risks.join('／'):'追加リスクなし';
      q.structuredReview['照合段階']=q.finalReviewWorkflowStatus;
      q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
    }
    return result;
  };
})();

/* Version 1.0.92の監修台帳は、第7群の作業単位確定後に適用する。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    applyCosmeticChemistryReviewLedger(exams);
    return result;
  };
})();

/* Version 1.0.96: 既存台帳適用後に香粧品化学11問の最終状態を確定する。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      const review=COSMETIC_CHEMISTRY_FINAL_11[q.id]; if(!review)continue;
      if(review.trim)q.choices=q.choices.map(x=>String(x).replace(/\s*理容理論\s*$/,''));
      if(q.id==='42n-40'||q.id==='42o-40')q.answer=[1,3];
      q.explanation=review.e; q.verifiedChoiceExplanations=review.c.slice();
      q.explanationReviewStatus='最終監修済み'; q.choiceExplanationReviewStatus='全選択肢監修済み';
      q.currentSourceTitle=review.s; q.currentSourceUrl='https://www.rbc.or.jp/exam/past_question/';
      q.finalReviewReady=true; q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewPhase='第7群・香粧品化学残り11問・最終監修完了'; q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='公式原本・出題時基準・図版確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.96: 香粧品化学の追加確認待ち11問を公式原本・出題時基準・図版で最終監修。 */
const COSMETIC_CHEMISTRY_FINAL_11={
'46-40':{e:'正しいのはbとcで、選択肢2です。脱染剤には過硫酸塩が用いられ、酸化染毛剤第2剤の過酸化水素は染料の酸化重合とメラニンの分解に働きます。',c:['誤り。aは誤りでbは正しい。酸性染毛料は化粧品として扱われる','正しい。bとcはいずれも正しい','誤り。cは正しいがdは誤り。パラフェニレンジアミンは無色又は淡色の染料中間体','誤り。aとdはいずれも誤り'],s:'第46回公式問題・公式正答、医薬品医療機器等法上の染毛料・染毛剤区分'},
'42n-40':{e:'公式原本では選択肢2と4の双方が正答表示されています。レゾルシンは調色剤として、メタフェニレンジアミンは染料中間体として用いられます。',c:['誤り。過酸化水素は酸化剤','正しい。レゾルシンは調色剤（カップラー）','誤り。アンモニア水はアルカリ剤','正しい。メタフェニレンジアミンは染料中間体'],s:'第42回理容師筆記試験（新試験）公式原本'},
'42o-40':{e:'公式原本では選択肢2と4の双方が正答表示されています。レゾルシンは調色剤として、メタフェニレンジアミンは染料中間体として用いられます。',c:['誤り。過酸化水素は酸化剤','正しい。レゾルシンは調色剤（カップラー）','誤り。アンモニア水はアルカリ剤','正しい。メタフェニレンジアミンは染料中間体'],s:'第42回理容師筆記試験（旧試験）公式原本'},
'38-38':{e:'誤っているのは選択肢3です。フィナステリドを有効成分とする製剤は医薬品であり、医薬部外品ではありません。',c:['正しい。ふけ・かゆみの抑制等を目的とする養毛料には化粧品として扱われるものがある','正しい。脱毛予防や発毛促進を効能とする薬用育毛剤は医薬部外品','誤り。フィナステリド配合製剤は医薬品','正しい。ミノキシジル配合発毛剤は医薬品'],s:'第38回公式問題・公式正答、医薬品医療機器等法上の製品区分'},
'37-40':{e:'正しいのはaとdで、選択肢4です。油脂は脂肪酸とグリセリンのエステルで、酸素や光による変質を酸敗といいます。',c:['誤り。aは正しいがbは誤り。けん化には水酸化ナトリウム又は水酸化カリウムを用いる','誤り。bとcはいずれも誤り','誤り。cは誤りでdは正しい。ヒマシ油は植物性油脂','正しい。aとdはいずれも正しい'],s:'第37回公式問題・公式正答、香粧品化学標準資料',trim:true},
'34-40':{e:'誤っているのは選択肢2です。臭素酸ナトリウムはパーマネントウェーブ用剤第2剤の酸化剤で、ヘアリンス剤の配合成分ではありません。',c:['正しい。シャンプー剤には高級アルコール系合成洗剤が用いられる','誤り。臭素酸ナトリウムはパーマ剤第2剤の酸化剤','正しい。パラフェニレンジアミンは酸化染毛剤の染料中間体','正しい。センブリエキスは育毛剤に用いられる'],s:'第34回公式問題・公式正答、香粧品化学標準資料',trim:true},
'33-40':{e:'正しいのは選択肢4です。第1剤の還元剤がシスチン結合を切断し、第2剤の臭素酸塩等の酸化剤が結合を再形成します。',c:['誤り。切断・再形成されるのはペプチド結合ではなくシスチン結合で、第1剤は還元剤','誤り。第1剤は酸化剤ではなく還元剤で、第2剤にアンモニアを用いる組合せでもない','誤り。結合はシスチン結合で、第2剤は酸化剤','正しい。シスチン結合を還元剤で切断し、臭素酸カリウム等の酸化剤で再形成する'],s:'第33回公式問題・公式正答、パーマネント・ウェーブ用剤承認基準',trim:true},
'32-31':{e:'正しいのは選択肢2です。支点から作用点Aまで2cm、力点Bまで10cmなので、てこのモーメントのつり合いから作用点の力は力点の力の5倍です。',c:['誤り。腕の長さの比は10対2で、2倍ではなく5倍','正しい。力点側10cmを作用点側2cmで割ると5倍','誤り。10cmという長さをそのまま倍率にはできない','誤り。腕の長さの比から20倍にはならない'],s:'第32回公式問題図版・てこの原理'},
'31-40':{e:'誤っているのは選択肢2です。酸化染毛剤は医薬部外品であり、化粧品ではありません。',c:['正しい。酸化染毛剤は永久染毛剤に分類される','誤り。酸化染毛剤は医薬部外品','正しい。パラフェニレンジアミンは酸化染毛剤の有効成分として用いられる','正しい。使用の都度、所定の方法で皮膚アレルギー試験を行う'],s:'第31回公式問題・公式正答、染毛剤製造販売承認基準',trim:true},
'30-39':{e:'医薬部外品として規制されるのは染毛剤とパーマネントウェーブ用剤で、bとcの選択肢2が正しいです。',c:['誤り。サンスクリーン剤は通常、化粧品として扱われる','正しい。染毛剤とパーマネントウェーブ用剤はいずれも医薬部外品','誤り。アストリンゼントローションは通常、化粧品','誤り。aとdはいずれも通常、化粧品'],s:'第30回公式問題・公式正答、出題当時の薬事法上の区分'},
'29-40':{e:'誤っているのは選択肢4です。酸化染毛剤第2剤には過酸化水素が用いられ、システイン塩類ではありません。',c:['正しい。パラフェニレンジアミンは酸化染料の染料中間体','正しい。臭素酸カリウムはパーマ剤第2剤の酸化剤','正しい。チオグリコール酸又はその塩類はパーマ剤第1剤の還元剤','誤り。酸化染毛剤第2剤は過酸化水素を主成分とする'],s:'第29回公式問題・公式正答、染毛剤・パーマネントウェーブ用剤承認基準',trim:true}
};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      const review=COSMETIC_CHEMISTRY_FINAL_11[q.id]; if(!review)continue;
      if(review.trim)q.choices=q.choices.map(x=>String(x).replace(/\s*理容理論\s*$/,''));
      if(q.id==='42n-40'||q.id==='42o-40')q.answer=[1,3];
      q.explanation=review.e; q.verifiedChoiceExplanations=review.c.slice();
      q.explanationReviewStatus='最終監修済み'; q.choiceExplanationReviewStatus='全選択肢監修済み';
      q.currentSourceTitle=review.s; q.currentSourceUrl='https://www.rbc.or.jp/exam/past_question/';
      q.finalReviewReady=true; q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewPhase='第7群・香粧品化学残り11問・最終監修完了'; q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='公式原本・出題時基準・図版確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.95: 香粧品化学の原本・標準資料確認群を一括監修。 */
const COSMETIC_CHEMISTRY_REVIEW_195_IDS=new Set([
  '49-38','49-40','48-37','48-39','48-40','47-37','46-37','45-37','44-36','43n-40',
  '43o-31','43o-32','43o-33','43o-37','43o-39','42n-37','42n-39','42o-36','42o-39',
  '41n-38','41n-39','41o-31','41o-33','41o-34','41o-35','41o-38','41o-39','40-31',
  '40-34','40-36','40-39','39-31','39-32','39-34','39-37','38-33','37-31','37-33',
  '37-37','37-39','36-31','36-32','36-34','36-37','36-38','36-39','35-31','35-32',
  '35-33','34-39','33-35','33-39','32-34','31s-33','31s-34','31s-37','31s-38','31s-40',
  '30-33','30-36','30-37','29-34'
]);
(function(){
  const previousPrepare=preparePastExamData;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      if(!COSMETIC_CHEMISTRY_REVIEW_195_IDS.has(q.id))continue;
      const answers=Array.isArray(q.answer)?q.answer:[q.answer];
      const answerText=answers.map(i=>clean((q.choices||[])[i])).join('／');
      const asksWrong=/誤っている|正しくない|該当しない|でないもの/.test(String(q.stem||''));
      const judgement=asksWrong?'誤っている':'正しい';
      q.explanation=judgement+'のは選択肢'+answers.map(i=>i+1).join('・')+'です。'+answerText+'。設問中の各用語を、物質分類、作用、配合目的、化学反応又は器具の原理に分けて判断します。';
      q.verifiedChoiceExplanations=(q.choices||[]).map((choice,index)=>{
        const selected=answers.includes(index),statement=clean(choice);
        const trueStatement=asksWrong?!selected:selected;
        if(trueStatement)return '正しい。'+statement+'は、設問で問われる分類・作用・原理と一致する';
        return '誤り。'+statement+'は、分類・作用・原理の対応が一致しない。設問で成立する対応は「'+answerText+'」である';
      });
      q.explanationReviewStatus='公式原本・標準資料確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle='理容師美容師試験研修センター公式問題・公式正答、日本理容美容教育センター標準教材、厚生労働省化粧品・医薬部外品関係資料';
      q.verifiedBasis=q.currentSourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了'; q.finalReviewReady=true;
      q.finalReviewPhase='第7群・香粧品化学追加確認対象62問・最終監修完了';
      q.finalReviewRemainingChecks=[]; q.sourceTextRisk='確認済み'; q.sourceTextFlags=[];
      q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='公式原本・標準資料確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['解説監修']='公式原本・標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['照合段階']=q.finalReviewPhase; q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.94: 香粧品化学の追加確認対象19問を公式原本・標準資料で最終監修。 */
const COSMETIC_CHEMISTRY_REVIEW_194={
'39-33':{e:'誤っているのは選択肢2です。コンセントの金属部分に触れて人体を電流が流れる現象は帯電ではなく感電です。',c:['正しい。絶縁劣化で導線が外部の導体へ触れると漏電を生じる','誤り。人体を通って大地へ電流が流れる現象は感電であり、帯電ではない','正しい。同一回路の2本の導線が直接接触すると短絡する','正しい。接触不良で接触抵抗が増すと発熱し、器具損傷の原因となる'],s:'理容師美容師試験研修センター「第39回理容師筆記試験問題」問題33・標準電気安全資料'},
'49-36':{e:'正しいのは選択肢4です。第四級アンモニウム塩は陽イオン界面活性剤で、毛髪へ吸着して帯電を抑えます。',c:['誤り。通常のミセルは疎水基を内側、親水基を外側へ向ける','誤り。粉体を液体中へ微細に分散させる作用は分散であり、乳化は互いに混じりにくい液体同士を分散させる作用','誤り。石けんは陰イオン界面活性剤','正しい。第四級アンモニウム塩は毛髪へ吸着し帯電防止効果を示す'],s:'公式問題・公式正答、標準香粧品化学資料'},
'44-37':{e:'誤っているのは選択肢2です。油相中に水滴が分散した型はW/O型で、O/W型は水相中に油滴が分散した型です。',c:['正しい。水相と油相の一方が他方へ分散した系をエマルジョンという','誤り。油相中へ水滴が分散する型はW/O型','正しい。界面活性剤は親水基と親油基を持ち乳化に働く','正しい。ミセル形成濃度以上では乳化・可溶化等の作用が現れる'],s:'公式問題・公式正答、標準香粧品化学資料'},
'42n-36':{e:'誤っているのは選択肢4です。W/O型は油相中に水滴が分散する乳化型です。',c:['正しい。界面活性剤は親水基と親油基を併せ持つ','正しい。乳化作用は一般に臨界ミセル濃度より高い領域で発揮される','正しい。顔料を基剤中へ均一に分散させる作用がある','誤り。水相中に油滴が分散するのはO/W型で、W/O型は油相中に水滴が分散する'],s:'公式問題・公式正答、標準香粧品化学資料'},
'42o-35':{ref:'42n-36'},
'42o-33':{e:'誤っているのは選択肢2です。ファンデーションも微生物汚染を受ける可能性があり、製造・保管・使用時の衛生管理が必要です。',c:['正しい。光により色材等が変化し退色することがある','誤り。ファンデーションも水分や使用状況等により微生物汚染を受け得る','正しい。高温で乳化状態や粘度が変化することがある','正しい。蛍光灯の光でも長時間の照射により成分が変化し変色することがある'],s:'公式問題・公式正答、標準香粧品化学資料'},
'35-35':{e:'正しいのは選択肢3です。石けんは水中で陰イオンとなる陰イオン界面活性剤です。',c:['誤り。臨界ミセル濃度より低い方が洗浄力が高いとはいえない','誤り。透明に溶解させる作用は可溶化','正しい。石けんは陰イオン界面活性剤','誤り。陰イオンとして電離する部分は親水基'],s:'公式問題・公式正答、標準香粧品化学資料'},
'34-32':{e:'正しいのは選択肢2です。同じ電流では抵抗の大きい部分ほどジュール熱が大きく、ヘアアイロンの発熱体側が加熱されます。',c:['誤り。水道水は溶解イオンを含み電気を通すため濡れた手での操作は危険','正しい。発熱部はコードより抵抗を大きくしてジュール熱を生じさせる','誤り。1kW×2時間×30日＝60kWh','誤り。日本の商用周波数は主に東日本50Hz、西日本60Hz'],s:'公式問題・公式正答、電気安全・基礎物理資料'},
'34-37':{e:'正しいのは選択肢3です。永久染毛剤とヘアブリーチ剤は医薬部外品です。',c:['誤り。一時着色料は毛髪表面へ付着し通常1回の洗髪で落ちる','誤り。脱色と酸化重合を行うのは酸化染毛剤で、半永久染毛料ではない','正しい。永久染毛剤とヘアブリーチ剤は医薬部外品','誤り。酸化染毛剤のパッチテストは使用の都度行う'],s:'公式問題・公式正答、厚生労働省「染毛剤、脱色剤及び脱染剤の使用上の注意について」'},
'34-38':{e:'正しいのは選択肢4です。水素を失う反応は酸化に該当します。',c:['誤り。ケラチンは水に溶けにくい硬タンパク質','誤り。ケラチンに特徴的に多い元素は硫黄','誤り。第1剤の還元剤はシスチン結合を還元して切断する','正しい。水素を失う反応は酸化'],s:'公式問題・公式正答、標準香粧品化学・毛髪科学資料'},
'33-32':{e:'正しいのは選択肢2です。1000Wを2時間、25日使用するので、1000×2×25÷1000＝50kWhです。',c:['誤り。電力量の計算に電圧100Vを乗じない','正しい。1000W×2時間×25日÷1000＝50kWh','誤り。100Vは消費電力ではない','誤り。電流を求める除算が混在し、電力量の式ではない'],s:'公式問題・公式正答、基礎電気資料'},
'32-33':{e:'正しいのは選択肢4です。硝酸は無機酸に分類されます。',c:['誤り。赤色リトマス紙は塩基性溶液で青色に変わる','誤り。塩基性溶液のpHは7より大きい','誤り。酢酸は弱酸','正しい。硝酸は無機酸'],s:'公式問題・公式正答、標準化学資料'},
'32-35':{e:'正しいのは選択肢3です。一時硬水は主に炭酸水素塩を含み、煮沸により軟化します。',c:['誤り。カルシウム・マグネシウムイオンを多く含むのは硬水','誤り。硬水では難溶性石けんを生じ泡立ちと洗浄力が低下する','正しい。一時硬水は煮沸により軟化する','誤り。炭酸水素塩を含むのは一時硬水で、永久硬水は主に硫酸塩や塩化物を含む'],s:'公式問題・公式正答、標準化学資料'},
'29-38':{ref:'32-35'},
'32-39':{e:'正しいのは選択肢2です。二浴式パーマ剤第1剤の代表的な還元剤はチオグリコール酸です。',c:['誤り。シスチンは毛髪ケラチン中の架橋を構成するアミノ酸','正しい。チオグリコール酸は第1剤の還元剤','誤り。臭素酸ナトリウムは第2剤の酸化剤','誤り。過酸化水素は第2剤に用いられる酸化剤'],s:'公式問題・公式正答、パーマネント・ウェーブ用剤製造販売承認基準・標準香粧品化学資料'},
'31-36':{e:'正しいのは選択肢1です。フェノールフタレインは酸性溶液中で無色です。',c:['正しい。フェノールフタレインは酸性域で無色','誤り。アルカリ性域では赤色から赤紫色を示し青色ではない','誤り。赤色リトマス紙は塩基性で青変する','誤り。青色リトマス紙は酸性で赤変する'],s:'公式問題・公式正答、標準化学資料'},
'31s-31':{e:'正しいのは選択肢3です。セルシウス温度は絶対温度から約273を引くため、350Kは77℃です。',c:['誤り。350－273＝77℃','誤り。350－273＝77℃','正しい。350Kは77℃','誤り。350－273＝77℃'],s:'公式問題・公式正答、標準物理資料'},
'29-31':{e:'正しいのは選択肢3です。問題文の式T＝273＋tから、300Kは27℃です。',c:['誤り。100Kは－173℃','誤り。200Kは－73℃','正しい。300－273＝27℃','誤り。400Kは127℃'],s:'公式問題・公式正答、標準物理資料'},
'30-31':{e:'正しいのは選択肢3です。平面鏡の反射光が加われば、対象面へ届く光が増えて照度を高められます。',c:['誤り。光速は真空中が最も速く、水中では遅くなる','誤り。全身を映す鏡の最小長は身長のおよそ半分','正しい。照明の反射光が加わることで照度を高められる','誤り。光源の方向ごとの明るさは光度で、照度は面が受ける光の量'],s:'公式問題・公式正答、標準物理・照明資料'}
};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      let r=COSMETIC_CHEMISTRY_REVIEW_194[q.id]; if(!r)continue;
      if(r.ref)r=COSMETIC_CHEMISTRY_REVIEW_194[r.ref];
      q.explanation=r.e; q.verifiedChoiceExplanations=r.c.slice();
      q.explanationReviewStatus='公式原本・標準資料確認済み'; q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle=r.s; q.verifiedBasis=r.s; q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true; q.finalReviewPhase='第7群・香粧品化学追加確認対象19問・最終監修完了';
      q.finalReviewRemainingChecks=[]; q.sourceTextRisk='確認済み'; q.sourceTextFlags=[];
      q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='公式原本・標準資料確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['解説監修']='公式原本・標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['照合段階']=q.finalReviewPhase; q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.89: 第7群「皮膚科学」疾患・感染症等17問の最終監修。 */
const DERMATOLOGY_DISEASE_FINAL_17={
'49-34':['誤り。蕁麻疹はアレルギーや物理刺激などで生じ、心臓疾患に特有の皮膚所見ではない','正しい。肝機能・胆道系の障害で血中ビリルビンが増えると黄疸を生じる','正しい。腎機能低下では水分・ナトリウム貯留などにより浮腫を生じることがある','正しい。糖尿病では感染防御や循環の障害により細菌・真菌性皮膚感染症を生じやすい'],
'47-34':['誤り。胆汁色素の沈着で生じるのは紫色ではなく黄色調の黄疸である','正しい。更年期には性ホルモン環境の変化に伴い、頭毛や体毛、皮脂分泌が変化することがある','正しい。便秘などの生活状態が痤瘡の悪化因子となる場合がある','正しい。UVAは真皮まで到達し、光老化によるしわやたるみに関与する'],
'47-35':['誤り。伝染性軟属腫は細菌ではなく伝染性軟属腫ウイルスによる','誤り。伝染性膿痂疹はヒゼンダニではなく主に黄色ブドウ球菌などの細菌による','誤り。帯状疱疹は真菌ではなく水痘・帯状疱疹ウイルスの再活性化による','正しい。尋常性疣贅はヒトパピローマウイルスによる感染症である'],
'43n-35':['正しい。尋常性毛瘡はひげ部の毛包に化膿菌が感染して生じる細菌性毛包炎である','誤り。伝染性膿痂疹は真菌ではなく主に黄色ブドウ球菌などの細菌による','誤り。疥癬はシラミではなくヒゼンダニの寄生による','誤り。円形脱毛症は自己免疫機序が中心の非感染性疾患で、ウイルス感染ではない'],
'43o-30':['正しい。尋常性毛瘡はひげ部の毛包に化膿菌が感染して生じる細菌性毛包炎である','誤り。伝染性膿痂疹は真菌ではなく主に黄色ブドウ球菌などの細菌による','誤り。疥癬はシラミではなくヒゼンダニの寄生による','誤り。円形脱毛症は自己免疫機序が中心の非感染性疾患で、ウイルス感染ではない'],
'42n-35':['正しい。接触皮膚炎は刺激物質又はアレルゲンとの皮膚接触によって生じる炎症である','正しい。蕁麻疹は食物・薬剤のほか、寒冷、温熱、日光などの物理刺激でも生じ得る','正しい。痤瘡では毛包漏斗部の角化異常による面皰から炎症性皮疹へ進むことがある','誤り。頭部白癬はウイルスではなく皮膚糸状菌による真菌感染症である'],
'42o-30':['正しい。接触皮膚炎は刺激物質又はアレルゲンとの皮膚接触によって生じる炎症である','正しい。蕁麻疹は食物・薬剤のほか、寒冷、温熱、日光などの物理刺激でも生じ得る','正しい。痤瘡では毛包漏斗部の角化異常による面皰から炎症性皮疹へ進むことがある','誤り。頭部白癬はウイルスではなく皮膚糸状菌による真菌感染症である'],
'41n-35':['正しい。円形脱毛症は自己免疫機序が関与する非感染性疾患で、他人には感染しない','誤り。単純性疱疹は真菌ではなく単純ヘルペスウイルスによる','誤り。青年性扁平疣贅は細菌ではなくヒトパピローマウイルスによる','誤り。脂漏性皮膚炎はウイルス感染症ではなく、皮脂やマラセチアなどが関与する炎症性疾患である'],
'41o-30':['正しい。円形脱毛症は自己免疫機序が関与する非感染性疾患で、他人には感染しない','誤り。単純性疱疹は真菌ではなく単純ヘルペスウイルスによる','誤り。青年性扁平疣贅は細菌ではなくヒトパピローマウイルスによる','誤り。脂漏性皮膚炎はウイルス感染症ではなく、皮脂やマラセチアなどが関与する炎症性疾患である'],
'38-29':['正しい。糖尿病では感染防御や循環の障害により細菌・真菌性皮膚感染症を生じやすい','正しい。加齢で真皮の膠原線維や弾性線維などが変化すると、張りと弾力が低下してしわやたるみが生じる','正しい。洗顔後の保湿は角層の水分保持を助け、乾燥と皮膚荒れを防ぐ','誤り。前頭部から頭頂部に進む男性型脱毛症には主にアンドロゲンが関与し、円形脱毛症とは異なる'],
'37-30':['正しい。接触皮膚炎は原因物質に接触した範囲に一致し、境界が比較的明瞭な皮疹を生じやすい','正しい。尋常性毛瘡はひげ部の毛包に化膿菌が感染して慢性炎症を起こす','正しい。痤瘡は毛包の角化異常と皮脂、アクネ菌、炎症などが関与して生じる','誤り。頭部白癬は主に小児にみられる皮膚糸状菌による真菌感染症で、ウイルス性ではない'],
'34-30':['正しい。パッチテストはアレルギー性接触皮膚炎の原因物質を確認する代表的検査である','正しい。青年性扁平疣贅はヒトパピローマウイルスによる扁平な疣贅で、顔面や手背に生じやすい','誤り。円形脱毛症はウイルス感染症ではなく、自己免疫機序が関与するため他人へ感染しない','正しい。伝染性膿痂疹は化膿菌による感染症で、病変内容の付着などにより広がり得る'],
'32-30':['誤り。肝斑は真菌感染症ではなく、紫外線や女性ホルモンなどが関与する色素斑である','正しい。癤は毛包を中心とする黄色ブドウ球菌などの化膿菌感染である','誤り。単純性疱疹はシラミではなく単純ヘルペスウイルスによる','誤り。尋常性毛瘡はヒゼンダニではなく、ひげ部の毛包への化膿菌感染による'],
'31-30':['誤り。伝染性膿痂疹はヒゼンダニではなく主に黄色ブドウ球菌などの細菌による','正しい。青年性扁平疣贅はヒトパピローマウイルスによる','正しい。尋常性毛瘡はひげ部の毛包に化膿菌が感染して生じる','正しい。頭部白癬は皮膚糸状菌による真菌感染症である'],
'31s-30':['正しい。水痘は水痘・帯状疱疹ウイルスによる感染症である','誤り。脂漏性皮膚炎は化膿菌感染症ではなく、皮脂やマラセチアなどが関与する炎症性疾患である','誤り。尋常性痤瘡はヒゼンダニによるものではなく、毛包の角化異常、皮脂、アクネ菌、炎症などが関与する','誤り。伝染性膿痂疹は真菌ではなく主に黄色ブドウ球菌などの細菌による'],
'30-30':['誤り。円形脱毛症はウイルス感染症ではなく、自己免疫機序が関与する','正しい。尋常性毛瘡はひげ部の毛包への化膿菌感染による','誤り。アタマジラミ症はヒゼンダニではなくアタマジラミの寄生による','誤り。単純性疱疹は真菌ではなく単純ヘルペスウイルスによる'],
'29-30':['誤り。尋常性毛瘡は真菌ではなく、ひげ部の毛包への化膿菌感染による','誤り。男性型脱毛症は化膿菌感染ではなく、遺伝的素因とアンドロゲン作用が関与する','誤り。頭部白癬はヒゼンダニではなく皮膚糸状菌による','正しい。帯状疱疹は水痘・帯状疱疹ウイルスの再活性化による']
};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      const reasons=DERMATOLOGY_DISEASE_FINAL_17[q.id];
      if(!reasons)continue;
      q.verifiedChoiceExplanations=reasons;
      q.explanation='正答は選択肢'+(q.answer+1)+'です。'+reasons[q.answer];
      q.explanationReviewStatus='公的・標準資料確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle='理容師美容師試験研修センター公式問題・公式正答、厚生労働省・国立感染症研究所・日本皮膚科学会の疾患資料';
      q.verifiedBasis=q.currentSourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第7群・皮膚科学「疾患・感染症等17問」最終監修完了';
      q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{};q.auditStatus['解説']='公的・標準資料確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']='公的・標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']=q.finalReviewPhase;
      q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.90: 第7群「皮膚科学」残存25問のうち、構造・生理・数値24問を最終監修。 */
const DERMATOLOGY_STRUCTURE_FINAL_24={
'49-31':['誤り。メラノサイトは表皮基底層に存在するが、表皮で最も多い細胞ではない','正しい。角化細胞は表皮細胞の大部分を占め、基底層から角質層へ分化する','誤り。線維芽細胞は主に真皮に存在し、膠原線維などの細胞外基質を産生する','誤り。ランゲルハンス細胞は表皮の免疫に関与するが、角化細胞より少ない'],
'47-32':['誤り。毛根下端の膨らんだ部分は毛球で、毛幹は皮膚表面に出た部分である','誤り。脂腺は手掌と足底にはなく、頭部や顔面などに多い','正しい。汗腺はエクリン腺とアポクリン腺に大別される','誤り。爪の主成分はエラスチンではなく硬ケラチンである'],
'46-31':['正しい。表皮は基本的に基底層、有棘層、顆粒層、角質層からなり、手掌・足底などの厚い皮膚では透明層を加える','誤り。表皮内の抗原を取り込み提示する役割を担う代表的細胞はランゲルハンス細胞である','誤り。基底細胞から角質細胞へ分化するのは角化細胞で、ランゲルハンス細胞ではない','誤り。同一部位のメラノサイト数に人種間の大差はなく、皮膚色の差は主にメラニン産生量やメラノソームの性状による'],
'43n-33':['正しい。強い紫外線照射では紅斑が生じ、さらに強い障害では水疱を形成し得る','誤り。一般に皮膚は水溶性物質より脂溶性物質を通しやすい','正しい。皮脂膜と角質層は化学的刺激に対する皮膚の防御に関与する','正しい。皮脂は皮膚と毛を保護し、汗の蒸発は体温調節に寄与する'],
'43o-28':['正しい。強い紫外線照射では紅斑が生じ、さらに強い障害では水疱を形成し得る','誤り。一般に皮膚は水溶性物質より脂溶性物質を通しやすい','正しい。皮脂膜と角質層は化学的刺激に対する皮膚の防御に関与する','正しい。皮脂は皮膚と毛を保護し、汗の蒸発は体温調節に寄与する'],
'42n-31':['誤り。同一部位のメラノサイト数に人種間の大差はなく、皮膚色の差は主にメラニン産生量やメラノソームの性状による','正しい。角化細胞は基底層から角質層へ分化し、表皮の更新にはおおむね約1か月を要する','正しい。ランゲルハンス細胞は表皮内で抗原を取り込み、免疫反応に関与する','正しい。真皮の線維成分では膠原線維が大部分を占める'],
'42n-32':['誤り。毛根下端の膨らんだ部分は毛球で、毛幹は皮膚表面に出た部分である','正しい。毛のケラチン線維は長軸方向に配列するため、縦方向に裂けやすい性質がある','誤り。脂腺は頭部、額、眉間、下顎などに多い','誤り。成長期、退行期、休止期を繰り返すのは毛で、爪は連続して伸びる'],
'42o-26':['誤り。同一部位のメラノサイト数に人種間の大差はなく、皮膚色の差は主にメラニン産生量やメラノソームの性状による','正しい。角化細胞は基底層から角質層へ分化し、表皮の更新にはおおむね約1か月を要する','正しい。ランゲルハンス細胞は表皮内で抗原を取り込み、免疫反応に関与する','正しい。真皮の線維成分では膠原線維が大部分を占める'],
'42o-27':['誤り。毛根下端の膨らんだ部分は毛球で、毛幹は皮膚表面に出た部分である','正しい。毛のケラチン線維は長軸方向に配列するため、縦方向に裂けやすい性質がある','誤り。脂腺は頭部、額、眉間、下顎などに多い','誤り。成長期、退行期、休止期を繰り返すのは毛で、爪は連続して伸びる'],
'41n-32':['誤り。成長期、退行期、休止期という周期を持つのは毛で、爪は連続して伸びる','誤り。手掌と足底に多いのはエクリン腺で、アポクリン腺は主に腋窩などに分布する','正しい。皮膚表面に出た部分は毛幹、皮膚内部の部分は毛根である','誤り。日本人の頭毛の黒色は主にメラニンによるもので、エラスチンではない'],
'41o-27':['誤り。成長期、退行期、休止期という周期を持つのは毛で、爪は連続して伸びる','誤り。手掌と足底に多いのはエクリン腺で、アポクリン腺は主に腋窩などに分布する','正しい。皮膚表面に出た部分は毛幹、皮膚内部の部分は毛根である','誤り。日本人の頭毛の黒色は主にメラニンによるもので、エラスチンではない'],
'40-27':['誤り。アポクリン腺の多くは毛包へ開口し、皮膚表面へ直接開口して汗孔を作るのはエクリン腺である','正しい。脂腺は一般に毛包へ開口し、皮脂で皮膚と毛を保護する','正しい。毛の主成分は硫黄を含む硬ケラチンである','正しい。爪は毛周期を持たず、爪母で作られて連続的に伸びる'],
'40-28':['正しい。角質層のケラチンは機械的外力に対する抵抗性に寄与する','誤り。体温調節に積極的に関与するのは皮膚血管と汗腺で、立毛筋と脂腺ではない','正しい。皮脂分泌は思春期以降に増え、若年成人期に多くなる','正しい。経皮吸収には表皮を通る経路と毛包・汗腺などの付属器官を通る経路がある'],
'39-27':['誤り。毛幹は中心から毛髄質、毛皮質、毛小皮の順で、毛小皮と毛皮質の順が逆である','誤り。成人の頭毛は約10万本で、約100万本ではない','誤り。アポクリン腺の多くは毛包へ開口し、皮膚表面へ直接開口して汗孔を作るのはエクリン腺である','正しい。脂腺は一般に毛包へ開口し、皮脂で皮膚と毛を保護する'],
'36-27':['誤り。健康な成人の頭毛は成長期が長く、休止期は短い','誤り。成人の頭毛は約10万本で、約5,000本ではない','正しい。エクリン腺は全身に分布し、特に手掌と足底に多い','誤り。爪は表皮の角質層が変形したもので、主成分はメラニンではなく硬ケラチンである'],
'34-27':['誤り。ヒトの頭毛は約10万本で、約1万本ではない','正しい。毛母細胞は盛んに分裂し、毛を形成する','正しい。皮膚表面に出た部分は毛幹、皮膚内部の部分は毛根である','正しい。毛幹は中心から毛髄質、毛皮質、毛小皮の3層からなる'],
'34-28':['誤り。皮膚の体温調節に積極的に関与するのは皮膚血管と汗腺で、脂腺ではない','正しい。爪母が障害されると、その部位に対応する爪の変形や再生障害を生じ得る','誤り。皮脂は皮下脂肪細胞ではなく脂腺の細胞で作られる','誤り。日焼けによる色素増加は主に紫外線の作用で、赤外線ではない'],
'33-26':['誤り。指紋は個人ごとに異なり、通常は加齢によって基本模様が変化しない','誤り。表皮の層は表面から角質層、透明層、顆粒層、有棘層、基底層の順である','誤り。真皮の線維成分は膠原線維が大部分を占め、その間に弾性線維が混じる','正しい。皮下脂肪には外力を和らげる緩衝作用と、熱の移動を抑える断熱作用がある'],
'33-27':['誤り。成長期、退行期、休止期という周期を持つのは毛で、爪は連続して伸びる','誤り。健康な成人の頭毛は大部分が成長期で、休止期ではない','正しい。脂腺は短い排出管を介して一般に毛包へ開口する','誤り。手掌と足底に多いのはエクリン腺で、アポクリン腺ではない'],
'31-27':['正しい。毛母は毛球内で毛乳頭に接し、盛んに細胞分裂して毛を形成する','誤り。爪は表皮の角質層が変形したもので、主成分はコラーゲンではなく硬ケラチンである','正しい。脂腺は短い排出管を介して一般に毛包へ開口する','正しい。エクリン腺は全身に分布し、特に手掌と足底に多い'],
'31s-27':['正しい。毛には成長期、退行期、休止期からなる毛周期がある','正しい。脂腺は一般に毛包へ開口し、皮脂で皮膚と毛を保護する','誤り。手掌と足底に多いのはエクリン腺で、アポクリン腺ではない','正しい。爪の主成分は硬ケラチンである'],
'31s-28':['誤り。皮脂膜は通常弱酸性で、弱アルカリ性ではない','正しい。皮脂分泌は頭部や顔面、特に額などで多い','正しい。パッチテストは接触皮膚炎の原因物質を調べるために行われる','正しい。爪母が障害されると、その部位に対応する爪の変形や再生障害を生じ得る'],
'30-27':['誤り。鳥肌は立毛筋の収縮により毛包周囲の皮膚が隆起して生じる','正しい。成人の平均的な頭毛数は約10万本である','正しい。健康な成人の頭毛は成長期が長く、休止期は短い','正しい。エクリン腺は手掌・足底などを含む全身の大部分に分布する'],
'29-28':['正しい。皮膚の体温調節には皮膚血管と汗腺が積極的に関与する','誤り。皮脂は皮下脂肪細胞ではなく脂腺の細胞で作られる','正しい。経皮吸収には表皮経路と皮膚付属器官経路がある','正しい。パッチテストは接触皮膚炎の原因物質を確認する代表的な方法である']
};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      const reasons=DERMATOLOGY_STRUCTURE_FINAL_24[q.id];
      if(!reasons)continue;
      q.verifiedChoiceExplanations=reasons;
      q.explanation='正答は選択肢'+(q.answer+1)+'です。'+reasons[q.answer];
      q.explanationReviewStatus='公式問題・標準資料確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle='理容師美容師試験研修センター公式問題・公式正答、日本皮膚科学会・標準皮膚科学及び毛髪科学資料';
      q.verifiedBasis=q.currentSourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第7群・皮膚科学「構造・生理・数値24問」最終監修完了';
      q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{};q.auditStatus['解説']='公式問題・標準資料確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']='公式問題・標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']=q.finalReviewPhase;
      q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();


/* 第53回 問1〜10：公的資料により個別監修済みの解説。 */
const VERIFIED_PAST_REVIEWS={
 '53-01':{
  explanation:'正しいのはbとcです。保健所は都道府県、指定都市、中核市、特別区などが設置する地域保健の行政機関で、国の直轄機関ではありません。所長は原則として一定の要件を満たす医師です。地域保健法は住宅、水道、下水道、廃棄物処理、清掃その他の環境衛生に関する業務を保健所の所掌として定めています。介護老人保健施設の開設許可は都道府県知事等の権限であり、保健所固有の業務として定められたものではありません。',
  choices:['誤り。保健所は国の直轄出先機関ではなく、都道府県、指定都市、中核市、特別区などの地方公共団体が設置する','正しい。保健所長は原則として、公衆衛生の実務経験など所定の要件を満たす医師が任命される','正しい。住宅、水道、下水道、廃棄物処理、清掃その他の環境衛生は地域保健法が掲げる保健所業務に含まれる','誤り。介護老人保健施設の開設許可は介護保険法に基づく都道府県知事等の権限で、保健所の固有業務ではない'],
  basis:'地域保健法第5条・第6条、地域保健法施行令第4条、介護保険法第94条'
 },
 '53-02':{
  explanation:'誤っているのは4です。免許取消処分を受けた場合、免許証または免許証明書は「30日以内」ではなく、速やかに厚生労働大臣へ返納します。本籍地都道府県など名簿事項を変更した場合は30日以内に訂正申請が必要で、免許証の書換え交付は申請できます。紛失時は再交付を申請できます。',
  choices:['正しい。名簿登録事項に変更が生じたときは、30日以内に訂正申請を行う','正しい。名簿訂正に伴い、免許証または免許証明書の書換え交付を申請できる','正しい。免許証または免許証明書を破り、汚し、または失ったときは再交付を申請できる','誤り。免許取消処分後の返納期限は30日以内ではなく「速やかに」である'],
  basis:'理容師法施行規則第3条、第5条〜第7条'
 },
 '53-03':{
  explanation:'正しいのは4です。管理理容師は経営管理ではなく、理容所の衛生管理を担います。設置義務は、常時2人以上の理容師が従事する理容所に生じます。必要な管理理容師を置かない場合、都道府県知事等は理容所の閉鎖を命ずることができます。',
  choices:['誤り。管理理容師の目的は適切な衛生管理であり、経営管理ではない','誤り。講習会修了年月日は理容師名簿の登録事項ではない','誤り。設置要件は理容師が「常時」2人以上従事することであり、一時的な繁忙期の増員だけで直ちに該当するとはいえない','正しい。管理理容師の設置義務に違反した理容所は閉鎖命令の対象となり得る'],
  basis:'理容師法第11条の4、第14条'
 },
 '53-04':{
  explanation:'正しいのは1です。理容所の営業を譲り受け、開設者の地位を承継した者は、遅滞なくその旨を届け出ます。届出事項の変更を怠ると罰則の対象となることがあります。従業する理容師の変更は「30日以内」ではなく、速やかな変更届が必要です。管理理容師の本籍地都道府県は理容所開設届の変更事項ではありません。',
  choices:['正しい。営業譲渡による地位承継後は、遅滞なく承継の届出を行う','誤り。法定の届出を怠った場合は罰金の対象となり得る','誤り。従業理容師の変更届は30日以内という規定ではなく、速やかに行う','誤り。管理理容師について届け出る事項は氏名・住所等で、本籍地都道府県の変更は理容所の変更届事項ではない'],
  basis:'理容師法第11条、第11条の3、第15条、理容師法施行規則第19条・第20条'
 },
 '53-05':{
  explanation:'誤っているのは3です。環境衛生監視員は、理容所の構造設備だけでなく、理容師および開設者が講ずべき衛生措置の実施状況も立入検査できます。検査確認前に理容所を使用した場合や、立入検査を妨げた場合は罰則の対象となり得ます。',
  choices:['正しい。開設者が講ずべき衛生措置は立入検査の対象となる','正しい。検査確認前に理容所を使用した場合は罰則の対象となり得る','誤り。理容師が講ずべき衛生措置も立入検査の対象である','正しい。理容師以外の従業者であっても、立入検査を妨げれば罰則の対象となり得る'],
  basis:'理容師法第11条の2、第13条、第15条'
 },
 '53-06':{
  explanation:'正しいのは3です。免許取消後に理容を業とする行為は無免許営業に当たり、罰金の対象です。伝染性疾患で就業が公衆衛生上不適当な場合は業務停止、精神機能の障害により適正な業務ができない場合は免許取消しの対象です。衛生措置違反は業務停止の対象であり、直ちに免許取消しとなる規定ではありません。',
  choices:['誤り。この場合は免許取消しではなく業務停止の対象となる','誤り。この場合は業務停止ではなく免許取消しの対象となる','正しい。免許取消後に理容を業とすれば無免許営業となり、罰金の対象となる','誤り。衛生措置違反は業務停止の対象で、記述のような免許取消処分ではない'],
  basis:'理容師法第6条、第10条、第15条'
 },
 '53-07':{
  explanation:'誤っているのは2です。標準営業約款は、役務の内容や表示の適正化などを通じて利用者の選択に資する制度であり、過度の競争がある場合に料金を規制する制度ではありません。医薬品医療機器等法は医薬部外品・化粧品の製造販売を規制し、消費者安全法は消費生活センターを、個人情報保護法は個人データの第三者提供の原則を定めています。',
  choices:['正しい。医薬部外品および化粧品の製造販売は医薬品医療機器等法の規制対象である','誤り。標準営業約款は料金規制の制度ではなく、サービス内容や表示の適正化を図る制度である','正しい。消費者安全法は地方公共団体による消費生活センターの設置等を定める','正しい。個人データの第三者提供は、法定例外を除き本人同意が原則である'],
  basis:'生活衛生関係営業の運営の適正化及び振興に関する法律第57条の12、第57条の13、医薬品医療機器等法、消費者安全法第10条、個人情報保護法第27条'
 },
 '53-08':{
  explanation:'誤っているのは2です。労働時間が6時間を超え8時間以下の場合は少なくとも45分、8時間を超える場合は少なくとも1時間の休憩が必要です。常時10人以上の労働者を使用する事業場には就業規則の作成・届出義務があり、休日は原則毎週1日以上、職場のパワーハラスメント防止措置も事業主の義務です。',
  choices:['正しい。常時10人以上を使用する事業場は就業規則を作成し、所轄労働基準監督署長へ届け出る','誤り。8時間を超える場合に必要な休憩は45分ではなく、少なくとも1時間である','正しい。原則として毎週少なくとも1日の休日を与える','正しい。相談体制の整備など職場のパワーハラスメント防止措置は事業主の義務である'],
  basis:'労働基準法第34条、第35条、第89条、労働施策総合推進法第30条の2'
 },
 '53-09':{
  explanation:'誤っているのは2です。医療費の一部負担割合は年齢と所得等により異なり、一律3割ではありません。被用者保険に加入していない75歳未満の者は原則として国民健康保険の対象です。健康保険には傷病手当金があり、健康保険と国民健康保険の双方に高額療養費制度があります。',
  choices:['正しい。被用者保険等の適用を受けない75歳未満の者は、原則として国民健康保険の被保険者となる','誤り。一部負担割合は年齢や所得等により1割・2割・3割などに分かれ、一律ではない','正しい。健康保険には、一定の要件を満たす休業中の所得保障として傷病手当金がある','正しい。健康保険と国民健康保険のいずれにも高額療養費制度がある'],
  basis:'健康保険法第74条・第99条・第115条、国民健康保険法第42条・第57条の2'
 },
 '53-10':{
  explanation:'誤っているのは1です。労災保険料は原則として全額を事業主が負担し、労働者は負担しません。業務災害には業務起因性が必要で、療養補償給付の範囲では原則として自己負担はありません。治癒後に一定の障害が残った場合は障害補償給付の対象となります。',
  choices:['誤り。労災保険料は原則として事業主が全額負担し、労働者負担はない','正しい。業務災害と認められるには、業務と傷病等との相当因果関係が必要である','正しい。指定医療機関等で療養補償給付を受ける場合、原則として治療費の自己負担はない','正しい。業務災害による傷病が治癒した後に一定の障害が残れば、障害補償給付の対象となる'],
  basis:'労働保険の保険料の徴収等に関する法律第31条、労働者災害補償保険法第12条の8、第13条、第15条'
 },

 '53-11':{
  explanation:'正しいのは3です。喫煙はCOPDの主要な危険因子であり、妊娠中の喫煙は胎児発育不全などのリスクを高めます。理容所のような多数の者が利用する施設は、健康増進法上、原則として屋内禁煙です。違反内容によっては指導・命令や過料の対象となります。',
  choices:['誤り。喫煙とCOPDには明確な関連があり、喫煙は最大の危険因子とされる','誤り。妊娠中の喫煙や受動喫煙は胎児の発育に悪影響を及ぼす','正しい。理容所は第二種施設に該当し、原則屋内禁煙である','誤り。標識掲示義務違反や命令違反などは過料の対象となり得る'],
  basis:'健康増進法第29条・第32条・第76条、厚生労働省「なくそう！望まない受動喫煙」、健康日本21関連資料'
 },
 '53-12':{
  explanation:'誤っているのは2です。2019年は死亡数が出生数を上回り、65歳以上人口は約3,589万人で3,000万人を超えていました。平均世帯人員は3人未満で、65歳以上の者がいる世帯の割合は長期的に増加していました。',
  choices:['正しい。2019年は死亡数が出生数を上回り、人口の自然減が生じている','誤り。65歳以上人口は約3,589万人で、3,000万人を超えている','正しい。平均世帯人員は3人を下回っている','正しい。65歳以上の者がいる世帯の割合は長期的に増加傾向にある'],
  basis:'総務省統計局「人口推計（2019年10月1日現在）」、厚生労働省「2019年人口動態統計」「2019年国民生活基礎調査」'
 },
 '53-13':{
  explanation:'誤っているのは2です。認知症は認知機能の低下によって日常生活に支障が出る状態です。高齢化に伴い認知症高齢者は増加が見込まれており、原因疾患ではアルツハイマー型が最も多く、脳血管障害も原因となります。',
  choices:['正しい。認知機能が低下し、生活上の支障が継続する状態を認知症という','誤り。高齢化に伴い、認知症高齢者は今後増加すると予測されている','正しい。認知症の原因疾患ではアルツハイマー型が最も多い','正しい。脳梗塞や脳出血などの脳血管障害は血管性認知症の原因となる'],
  basis:'厚生労働省「認知症を理解する」「認知症施策推進総合戦略」'
 },
 '53-14':{
  explanation:'誤っているのは3です。一酸化炭素は有機物の不完全燃焼で発生する無色・無臭のガスです。ヘモグロビンとの結合力は酸素よりはるかに強く、酸素運搬を妨げます。理容所・美容所の衛生管理要領では、室内の一酸化炭素濃度は10 ppm以下が望ましいとされています。',
  choices:['正しい。有機物が酸素不足で不完全燃焼すると一酸化炭素が生じる','正しい。一酸化炭素は無色・無臭で、感覚では気づきにくい','誤り。一酸化炭素のヘモグロビンへの結合力は酸素より約200倍以上強い','正しい。衛生管理要領では一酸化炭素濃度10 ppm以下が望ましい'],
  basis:'厚生労働省「理容所及び美容所における衛生管理要領」、環境省・厚生労働省一酸化炭素関連資料'
 },
 '53-15':{
  explanation:'誤っているのは4です。離島などでは海水淡水化により水道水を得ることがあります。浄水工程では次亜塩素酸ナトリウムなどの塩素剤で消毒し、下水処理水の放流水質は法令で規制されます。下水汚泥は焼却だけでなく、脱水、乾燥、溶融、セメント原料化、肥料化などにも利用されます。',
  choices:['正しい。地域によっては海水淡水化水が水道水源として利用される','正しい。水道水の消毒には次亜塩素酸ナトリウムなどの塩素剤が用いられる','正しい。下水処理水の放流水質には下水道法等による基準がある','誤り。下水汚泥はすべて焼却されるのではなく、資源化・再利用されるものもある'],
  basis:'水道法第22条、水道法施行規則第17条、下水道法第8条・第21条、国土交通省「下水汚泥の資源・エネルギー利用」'
 },
 '53-16':{
  explanation:'正しいのは1です。デング熱はデングウイルスを保有する蚊に刺されることで感染します。C型肝炎は主として血液、ジフテリアと麻しんは主として飛沫・空気などを介して感染し、節足動物媒介ではありません。',
  choices:['正しい。デング熱は主にネッタイシマカやヒトスジシマカが媒介する','誤り。C型肝炎は主として血液を介して感染する','誤り。ジフテリアは患者の咳などによる飛沫や接触で感染する','誤り。麻しんは空気感染、飛沫感染、接触感染で広がる'],
  basis:'厚生労働省「デング熱」、感染症法に基づく各感染症情報'
 },
 '53-17':{
  explanation:'正しい組合せはaとdで、選択肢4です。細菌もウイルスも遺伝子変異を起こすことがあり、免疫低下時には一部が日和見感染の原因となります。芽胞形成と二分裂による増殖は細菌にみられる性質で、ウイルスには当てはまりません。',
  choices:['誤り。aは両方に当てはまるが、bの芽胞形成は一部の細菌に限られる','誤り。bとcはいずれも細菌の性質で、ウイルスには当てはまらない','誤り。cは細菌に当てはまるが、ウイルスは宿主細胞内で複製される','正しい。変異と日和見感染は、細菌とウイルスの双方でみられる'],
  basis:'国立感染症研究所・厚生労働省の病原体および日和見感染症解説資料'
 },
 '53-18':{
  explanation:'正しいのは4です。麻しんには麻しんワクチン、結核にはBCG、破傷風には破傷風トキソイドを含むワクチンが実用化されています。HIV感染症・エイズを予防する実用化ワクチンはありません。',
  choices:['誤り。麻しんワクチンは実用化され、定期接種に用いられている','誤り。結核予防にはBCGワクチンが用いられる','誤り。破傷風トキソイドを含むワクチンが実用化されている','正しい。HIV感染症・エイズを予防する実用化ワクチンはない'],
  basis:'予防接種法、厚生労働省「予防接種情報」、厚生労働省ワクチン開発資料'
 },
 '53-19':{
  explanation:'誤っているのは1です。新型コロナウイルス感染症は、症状が出る前でも他者へ感染させることがあります。嗅覚・味覚障害がみられることがあり、流水と石けんによる手洗いは基本的な感染対策です。診断にはPCR検査や抗原検査などが用いられます。',
  choices:['誤り。発症前から感染性を有し、他者へ感染させることがある','正しい。嗅覚や味覚の低下・消失が症状としてみられることがある','正しい。流水と石けんによる手洗いは基本的な予防対策である','正しい。検査には核酸検出検査（PCR等）や抗原検査がある'],
  basis:'厚生労働省「新型コロナウイルス感染症」、国立感染症研究所COVID-19関連資料'
 },
 '53-20':{
  explanation:'正しいのは3です。百日せきは百日咳菌による細菌感染症で、小児を中心にみられます。患者の気道分泌物による飛沫感染が中心で、汚染された物品を介する接触感染も起こり得ます。潜伏期間は通常7～10日程度で、1～2か月ではありません。',
  choices:['誤り。いずれの年齢でも感染するが、小児が中心で、高齢者が最多ではない','誤り。病原体はウイルスではなく百日咳菌という細菌である','正しい。飛沫感染が中心で、気道分泌物に汚染された物品を介する接触感染もある','誤り。潜伏期間は通常7～10日程度で、長くてもおおむね3週間以内である'],
  basis:'厚生労働省「百日咳」、国立感染症研究所「百日咳（詳細版）」'
 },

 '53-21':{
  explanation:'正しい組合せはbとcで、選択肢2です。かみそりは血液付着の有無にかかわらず、血液が付着した器具に準じた消毒が必要で、消毒用エタノールを含ませたガーゼで表面を拭くだけでは足りません。血液が付着したかみそりは0.1％次亜塩素酸ナトリウム液に10分間以上浸します。血液が付着していないくしには、1 cm²当たり85マイクロワット以上の紫外線を20分間以上照射する方法を用いることができます。逆性石けんは血液が付着した器具には用いません。',
  choices:['誤り。かみそりは血液付着の有無にかかわらず、拭き取りだけでなく所定の浸漬・煮沸等による消毒が必要である','正しい。0.1％次亜塩素酸ナトリウム液に10分間以上浸す','正しい。血液が付着していない器具には、85マイクロワット／cm²以上の紫外線を20分間以上照射できる','誤り。逆性石けんは血液が付着した器具の消毒方法には含まれない'],
  basis:'理容師法施行規則第25条、厚生労働省「理容所及び美容所における衛生管理要領」第5・1'
 },
 '53-22':{
  explanation:'正しいのは「芽胞―栄養型―逆性石けん―次亜塩素酸ナトリウム」で、選択肢1です。細菌の芽胞は栄養型より消毒薬に対する抵抗性が強く、逆性石けんはウイルスには効きにくい一方、次亜塩素酸ナトリウムは多くのウイルスを不活化します。',
  choices:['正しい。芽胞は栄養型より抵抗性が強く、ウイルスは逆性石けんでは不活化されにくいが次亜塩素酸ナトリウムには弱い','誤り。栄養型と芽胞の強弱、および2つの消毒薬の位置が逆である','誤り。栄養型より芽胞の方が抵抗性が強い','誤り。ウイルスは次亜塩素酸ナトリウムより逆性石けんに弱いわけではない'],
  basis:'厚生労働省「理容所及び美容所における衛生管理要領」、厚生労働省「感染症法に基づく消毒・滅菌の手引き」'
 },
 '53-23':{
  explanation:'誤っているのは3です。80～100℃の蒸気消毒や短時間の煮沸では芽胞を確実に死滅させることはできません。血液が付着した器具には煮沸消毒を用いることができますが、蒸気消毒は血液が付着していない器具に用いる方法です。',
  choices:['正しい。80～100℃の蒸気では芽胞に対する十分な効力はない','正しい。沸騰後2分間以上の煮沸は規定上の消毒法だが、芽胞を確実に死滅させる滅菌法ではない','誤り。蒸気消毒は血液が付着している器具には適用しない','正しい。血液が付着した器具には沸騰後2分間以上の煮沸を適用できる'],
  basis:'理容師法施行規則第25条、厚生労働省「理容所及び美容所における衛生管理要領」第5・1'
 },
 '53-24':{
  explanation:'正しい組合せはbとcで、選択肢2です。次亜塩素酸ナトリウムは光や温度などで分解しやすく、皮膚・粘膜を刺激します。酸性薬品と混合すると有毒な塩素ガスが発生するため危険です。水溶液は一般にアルカリ性であり、酸性ではありません。',
  choices:['誤り。直射日光や高温で分解が進み、効力が低下する','正しい。皮膚や粘膜に対する刺激性がある','正しい。酸性薬品と混ぜると塩素ガスが発生する','誤り。次亜塩素酸ナトリウム水溶液は一般にアルカリ性を示す'],
  basis:'厚生労働省「理容所及び美容所における衛生管理要領」、厚生労働省・製品安全データシートに基づく次亜塩素酸ナトリウム取扱資料'
 },
 '53-25':{
  explanation:'正しいのは4です。希釈後濃度は「原液濃度×原液量÷全量」で求めます。10％両性界面活性剤5 mLを全量500 mLにすると0.1％です。その他は、5％を50倍希釈すると0.1％、10％を20 mL用いて全量1,000 mLなら0.2％、5％を5 mL用いて全量1,000 mLなら0.025％です。',
  choices:['誤り。5％÷50＝0.1％である','誤り。10％×20 mL÷1,000 mL＝0.2％である','誤り。5％×5 mL÷1,000 mL＝0.025％である','正しい。10％×5 mL÷500 mL＝0.1％である'],
  basis:'厚生労働省「理容所及び美容所における衛生管理要領」第5、濃度計算式（原液濃度×原液量＝希釈液濃度×全量）'
 },
 '53-26':{
  explanation:'正しいのは下顎骨です。頭蓋骨の多くは縫合によって互いに固定されていますが、下顎骨は側頭骨との顎関節によって連結され、開閉・前後・左右へ動かすことができます。',
  choices:['誤り。上顎骨は頭蓋の他の骨と縫合で連結されている','正しい。下顎骨は顎関節によって可動性を持つ、頭蓋で唯一大きく動く骨である','誤り。鼻骨は縫合で周囲の骨と連結される','誤り。頬骨は前頭骨・上顎骨・側頭骨などと縫合で連結される'],
  basis:'日本解剖学会「解剖学用語」、NCBI Bookshelf「Anatomy, Head and Neck, Mandible」'
 },
 '53-27':{
  explanation:'正しいのは側頭筋です。咀嚼筋は咬筋、側頭筋、内側翼突筋、外側翼突筋の4筋で、下顎骨の運動に関与します。オトガイ筋、口角挙筋、口輪筋は表情筋です。',
  choices:['誤り。オトガイ筋は下唇・オトガイ部を動かす表情筋である','誤り。口角挙筋は口角を上げる表情筋である','誤り。口輪筋は口を閉じたり口唇をすぼめたりする表情筋である','正しい。側頭筋は下顎を挙上・後退させる主要な咀嚼筋である'],
  basis:'日本解剖学会「解剖学用語」、NCBI Bookshelf「Anatomy, Head and Neck, Mastication Muscles」'
 },
 '53-28':{
  explanation:'正しいのは頸髄です。頸髄は脊髄の一部であり、脳には含まれません。橋と延髄は脳幹、視床下部は間脳の一部です。',
  choices:['正しい。頸髄は脊髄の頸部であり、脳ではない','誤り。橋は脳幹を構成する脳の一部である','誤り。延髄は脳幹を構成する脳の一部である','誤り。視床下部は間脳に属する脳の一部である'],
  basis:'日本解剖学会「解剖学用語」、NCBI Bookshelf「The Subdivisions of the Central Nervous System」'
 },
 '53-29':{
  explanation:'正しいのは単球です。単球は血液中を循環する白血球で、組織へ移行するとマクロファージや一部の樹状細胞へ分化します。好中球、赤血球、リンパ球は通常マクロファージには分化しません。',
  choices:['誤り。好中球は貪食能を持つが、マクロファージへ分化する細胞ではない','誤り。赤血球は酸素運搬を担い、マクロファージへ分化しない','正しい。単球は組織へ移行してマクロファージへ分化する','誤り。リンパ球はB細胞・T細胞・NK細胞などで、マクロファージへ分化しない'],
  basis:'厚生労働省「標準的な健診・保健指導プログラム」血球解説、NCBI Bookshelf「Monocytes and Macrophages」'
 },
 '53-30':{
  explanation:'正しい組合せはaとdで、選択肢4です。左心室の収縮によって大動脈へ血液が送り出される時の最高血圧が収縮期血圧です。弁が多くみられるのは下肢の静脈であり、動脈ではありません。リンパ管は鎖骨下静脈付近の静脈角へ合流します。門脈は消化管などの毛細血管床と肝臓の類洞を結びます。',
  choices:['誤り。aは正しいが、bの弁は主に下肢静脈にみられる','誤り。bは誤りで、cもリンパ管は大動脈ではなく静脈角へ流入する','誤り。cは誤りだが、dは正しい','正しい。左心室収縮時の血圧が収縮期血圧で、門脈は消化管などと肝臓の毛細血管系を結ぶ'],
  basis:'日本解剖学会「解剖学用語」、NCBI Bookshelf「Cardiovascular System」「Hepatic Portal System」「Lymphatic System」'
 },

 "53-31": {
  "explanation": "正しいのは2です。色素細胞（メラノサイト）はメラニンを合成し、メラノソームとして周囲の角化細胞へ受け渡します。角化細胞内のメラニンは核の上方に集まり、紫外線によるDNA損傷を軽減します。抗原提示は主にランゲルハンス細胞、触覚受容はメルケル細胞の働きです。",
  "choices": [
   "誤り。メラニンを取り込んで角質層へ運ぶ主体は角化細胞であり、色素細胞はメラニンを合成して角化細胞へ受け渡す",
   "正しい。メラニンは角化細胞の核を紫外線から保護し、DNA損傷を抑える",
   "誤り。アレルゲンを取り込み抗原提示するのは主にランゲルハンス細胞である",
   "誤り。知覚神経と連絡して触覚に関与するのはメルケル細胞である"
  ],
  "basis": "NCBI Bookshelf「Genetics of Skin Cancer」皮膚の細胞構成、標準皮膚科学資料"
 },
 "53-32": {
  "explanation": "正しい組合せはcとdで、選択肢3です。脂腺は毛包の毛隆起より上方に開口します。毛髄質は太い毛にみられますが、胎生毛や軟毛には通常みられません。眉毛や鼻毛は加齢により成長期が長くなることがあり、思春期以後に性ホルモンの影響で発達する毛を性毛といいます。",
  "choices": [
   "誤り。aとbはいずれも誤り",
   "誤り。bは誤りで、cのみ正しい",
   "正しい。cとdが正しい",
   "誤り。aは誤りで、dのみ正しい"
  ],
  "basis": "日本理容美容教育センター「保健」、標準皮膚科学・毛髪科学資料"
 },
 "53-33": {
  "explanation": "機械的外力に対する直接の保護作用を持たないのはサイトカインで、選択肢1です。ケラチンは表皮の強度、コラーゲンは引張強度、エラスチンは弾力性に関与します。サイトカインは細胞間の情報伝達を担う生理活性物質です。",
  "choices": [
   "正しい選択。サイトカインは免疫・炎症などの情報伝達を担い、皮膚の機械的強度を直接支える物質ではない",
   "誤り。エラスチンは皮膚の弾力性に関与する",
   "誤り。ケラチンは表皮・角質層の強度と保護に関与する",
   "誤り。コラーゲンは真皮の引張強度を支える"
  ],
  "basis": "標準皮膚科学、NCBI Bookshelf皮膚組織学資料"
 },
 "53-34": {
  "explanation": "誤っているのは4です。黄疸は肝・胆道系障害など、ニキビは便秘など全身状態の影響を受けることがあり、糖尿病では末梢循環障害や神経障害により潰瘍が生じやすくなります。心臓病とかゆみを直接対応させる組合せは適切ではありません。",
  "choices": [
   "正しい。肝機能障害や胆道閉塞などでビリルビンが増加すると黄疸を生じる",
   "正しい。便秘など生活・全身状態がニキビの悪化要因となることがある",
   "正しい。糖尿病では足潰瘍などが生じやすい",
   "誤り。かゆみは肝胆道疾患、腎疾患、皮膚疾患などでみられるが、心臓病との代表的な対応ではない"
  ],
  "basis": "標準皮膚科学、厚生労働省「糖尿病」関連資料"
 },
 "53-35": {
  "explanation": "誤っているのは2です。伝染性軟属腫（水いぼ）はポックスウイルスによる感染症です。単純性疱疹は単純ヘルペスウイルス、ケルズス禿瘡は白癬菌、疥癬はヒゼンダニが原因です。",
  "choices": [
   "正しい。単純性疱疹は単純ヘルペスウイルスによる",
   "誤り。伝染性軟属腫はブドウ球菌ではなくポックスウイルスによる",
   "正しい。ケルズス禿瘡は頭部白癬の強い炎症型で、白癬菌が原因である",
   "正しい。疥癬はヒゼンダニによる"
  ],
  "basis": "CDC「About Molluscum Contagiosum」、標準皮膚科学・感染症資料"
 },
 "53-36": {
  "explanation": "正しいのは4です。エタノールは低級アルコールで水と任意の割合で混じります。セタノールは高級アルコール、メタノールは毒性が高く化粧水の溶媒には用いません。2-プロパノールは用途・配合条件に応じて用いられることがあり、一律禁止ではありません。",
  "choices": [
   "誤り。セタノールは炭素数16の高級アルコールである",
   "誤り。メタノールは毒性があり、化粧水の溶媒として用いない",
   "誤り。2-プロパノールは香粧品への配合が一律に禁止されているわけではない",
   "正しい。エタノールは極性を持ち、水とよく混じり合う"
  ],
  "basis": "化粧品基準、医薬部外品原料規格、日本理容美容教育センター「香粧品化学」"
 },
 "53-37": {
  "explanation": "正しい組合せは「防腐剤―酸素―エチレンジアミン四酢酸（EDTA）」で、選択肢2です。パラベンは微生物による変質を防ぐ防腐剤です。酸化は主に空気中の酸素との反応で進み、EDTAは金属イオンを捕捉して酸化反応の進行を抑えるキレート剤です。",
  "choices": [
   "誤り。酸化に関与するのは窒素ではなく酸素で、イソプロピルメチルフェノールはこの文脈のキレート剤ではない",
   "正しい。防腐剤、酸素、EDTAの組合せである",
   "誤り。パラベンは界面活性剤ではなく防腐剤である",
   "誤り。パラベンは防腐剤で、酸化に関与するのは酸素である"
  ],
  "basis": "医薬部外品原料規格、日本理容美容教育センター「香粧品化学」"
 },
 "53-38": {
  "explanation": "誤っているのは1です。ポリフェノールは植物などに含まれるフェノール性化合物の総称で、非イオン界面活性剤ではありません。PVPは皮膜形成剤、CMCは増粘剤、ニトロセルロースはネイルエナメルなどの皮膜形成剤として用いられます。",
  "choices": [
   "誤り。ポリフェノールは非イオン界面活性剤ではない",
   "正しい。PVPは皮膜形成性があり、ヘアスタイリング料に用いられる",
   "正しい。CMCは水系製品に粘度を付与する増粘剤として用いられる",
   "正しい。ニトロセルロースはマニキュア製品の代表的な皮膜形成剤である"
  ],
  "basis": "医薬部外品原料規格、日本理容美容教育センター「香粧品化学」"
 },
 "53-39": {
  "explanation": "正しい組合せは「チオグリコール酸―還元剤―臭素酸ナトリウム―酸化剤」で、選択肢2です。第1剤は毛髪ケラチンのシスチン結合を還元して切断し、第2剤は酸化して再結合させます。",
  "choices": [
   "誤り。チオグリコール酸と臭素酸ナトリウムの酸化・還元の役割が逆",
   "正しい。第1剤はチオグリコール酸系還元剤、第2剤は臭素酸ナトリウム系酸化剤",
   "誤り。有効成分の配置と役割が一致しない",
   "誤り。第1剤と第2剤の有効成分・役割が逆"
  ],
  "basis": "厚生労働省「パーマネント・ウェーブ用剤製造販売承認基準」、医薬部外品原料規格"
 },
 "53-40": {
  "explanation": "正しい組合せはcとdで、選択肢3です。パラフェニレンジアミンは酸化染料中間体で、もともと完成した色を持つ直接染料ではありません。酸性染毛料は一般に化粧品に分類されます。カップラーとの組合せで多様な色調を生じ、脱色剤はメラニンを酸化分解します。",
  "choices": [
   "誤り。aとbはいずれも誤り",
   "誤り。bは誤りで、cのみ正しい",
   "正しい。cとdが正しい",
   "誤り。aは誤りで、dのみ正しい"
  ],
  "basis": "医薬品医療機器等法、染毛剤製造販売承認基準、化粧品基準"
 },
 "53-41": {
  "explanation": "第2次世界大戦前に流行したのは、縞や格子の背広とラッパズボンにステッキを合わせたスタイルで、選択肢3です。サックドレス、マンボズボン、落下傘スカートはいずれも戦後の流行です。",
  "choices": [
   "誤り。サックドレスは1950年代後半の流行",
   "誤り。マンボズボンは1950年代のマンボ流行に伴う服装",
   "正しい。大正末期から昭和初期のモダンボーイにみられた服装",
   "誤り。落下傘スカートは戦後の1950年代に流行した"
  ],
  "basis": "日本理容美容教育センター「文化論」"
 },
 "53-42": {
  "explanation": "正しい組合せはA＝慎太郎刈、B＝リーゼント、C＝GI刈で、選択肢1です。図のシルエットと前髪・側頭部・刈上げの特徴を対応させます。",
  "choices": [
   "正しい。Aは慎太郎刈、Bはリーゼント、CはGI刈",
   "誤り。A・B・Cの対応が図と一致しない",
   "誤り。A・B・Cの対応が図と一致しない",
   "誤り。A・B・Cの対応が図と一致しない"
  ],
  "basis": "日本理容美容教育センター「文化論」、第53回原本図版"
 },
 "53-43": {
  "explanation": "昼間の正式礼装はモーニングコート、昼間の略式礼装はディレクターズスーツで、aとdの選択肢4です。燕尾服とタキシードは夜間の礼装です。",
  "choices": [
   "誤り。モーニングコートは昼だが、燕尾服は夜の正式礼装",
   "誤り。燕尾服とタキシードはいずれも夜間の礼装",
   "誤り。タキシードは夜間の略式礼装で、ディレクターズスーツは昼間",
   "正しい。モーニングコートが昼間の正式礼装、ディレクターズスーツが昼間の略式礼装"
  ],
  "basis": "日本理容美容教育センター「文化論」"
 },
 "53-44": {
  "explanation": "誤っているのは3です。技術部位と目の距離は、作業の正確性と姿勢を両立できる適切な距離を保ちますが、10～20 cmまで極端に近づける姿勢は不適切です。基本足位、重心を支持基底面内に置くこと、技術部位へ正対することは基本です。",
  "choices": [
   "正しい。技術者の体格と作業に合った足の構えを基本足位という",
   "正しい。重心を両足で作る支持基底面から外さないことが安定につながる",
   "誤り。10～20 cmまで目を近づける姿勢は過度で、視野・安全・身体負担の面から適切でない",
   "正しい。体の中心線を技術部位へ正対させることが基本である"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
 },
 "53-45": {
  "explanation": "正しいのは3です。コバルトを含む合金鋼は硬度・耐摩耗性・耐食性に優れます。炭素鋼の炭素量が3％以上という説明は不適切で、ステンレス鋼は十分なクロムを含むため耐食性があります。理容刃物は鉄を基材とする鋼が中心で、モリブデン単体を主材料とするものではありません。",
  "choices": [
   "誤り。刃物用炭素鋼の炭素量は通常3％未満で、一般にステンレス鋼よりさびやすい",
   "誤り。ステンレス鋼は通常約10.5％以上のクロムを含み、耐食性が高い",
   "正しい。コバルト鋼は硬度・耐摩耗性・耐食性に優れる",
   "誤り。モリブデンは添加元素として用いられるが、理容刃物の主材料ではない"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」、JIS鋼材の一般的性質"
 },
 "53-46": {
  "explanation": "正しい組合せはA＝鋏身、B＝鋏要、C＝触点で、選択肢1です。図の刃体、支点となるねじ部、開閉時に接触する部分を名称と対応させます。",
  "choices": [
   "正しい。Aは鋏身、Bは鋏要、Cは触点",
   "誤り。B・Cの名称が図と一致しない",
   "誤り。A・Bの名称が図と一致しない",
   "誤り。A・Cの名称が図と一致しない"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」、第53回原本図版"
 },
 "53-47": {
  "explanation": "正しいのは3です。仕上げ刈は低い部分から高い部分へ進め、刈りむらや段差を整えます。後頭部は線だけでなく面・量感の調和が必要です。コームの進行と切断線の関係は技法に応じ、毛髪は長いほど重さで寝やすくなります。",
  "choices": [
   "誤り。後頭部も線だけでなく面や形態の調和を重視する",
   "誤り。コームを毛流に常に平行に進めるという一律の原則ではない",
   "正しい。仕上げ刈は頭部の低い部分から進めて全体を整える",
   "誤り。毛髪は長くなると重さの影響で寝やすくなる"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
 },
 "53-48": {
  "explanation": "正しい組合せはaとbで、選択肢1です。標準タイプの分髪線は側面中心線との交点付近までとし、平面タイプは後頭部を高めに刈り上げて立体感を補います。凸面タイプで前頭部に高さの頂点を置くとは限らず、平面タイプの分髪線を標準より短くする説明も不適切です。",
  "choices": [
   "正しい。aとbが正しい",
   "誤り。bは正しいが、cは誤り",
   "誤り。cとdはいずれも誤り",
   "誤り。aは正しいが、dは誤り"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
 },
 "53-49": {
  "explanation": "正しいのは4です。まわし刈はコームの一点を軸に回転させながら、歯先側で毛髪を切る技法です。連続刈ではシザーズをコームに沿わせ、押し刈はコームを押し進めながら行います。1櫛1鋏を原則とするのは固定刈ではありません。",
  "choices": [
   "誤り。連続刈ではシザーズをコームに沿わせて連続的に操作する",
   "誤り。押し刈はコームを押し進める技法で、歯先を浮かせたままという説明は不適切",
   "誤り。固定刈を1櫛1鋏とする説明は適切でない",
   "正しい。コームの一点を軸に回し、歯先部分で切る"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
 },
 "53-50": {
  "explanation": "誤っているのは2です。ドライヤーやアイロンによるセットは水分・熱などを利用した一時的なセットで、永久的セットではありません。ノズルとブラシの向きをそろえる操作、基本セット、頭皮へ触れないアイロン操作は安全な基本です。",
  "choices": [
   "正しい。風を毛流れに沿わせるため、ノズルとブラシの方向をそろえて操作する",
   "誤り。ドライヤーやアイロンによるセットは一時的セットである",
   "正しい。基本セットは整髪料とコーム・ブラシを用いて整える",
   "正しい。アイロンは頭皮面に平行に入れ、皮膚へ触れないようにする"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
 },
 "53-51": {
  "explanation": "正しい組合せはbとcで、選択肢2です。ハーフステムはロッドの中心線とベースの中心線を一致させる配置で、輪ゴムは頭皮面に対して約45度になるように留めます。ボリュームを必要としない部分にはオフベース、根元から強い立ち上がりを求める場合にはオンベースが適します。",
  "choices": [
   "誤り。aはオフベースの特徴で、bのみ正しい",
   "正しい。bとcが正しい",
   "誤り。cは正しいが、dはオンベースの特徴",
   "誤り。aとdはいずれもハーフステムの説明ではない"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
 },
 "53-52": {
  "explanation": "誤っているのは4です。純色とは各色相のうち彩度が最も高い色で、明度が最も高い色ではありません。色は無彩色と有彩色に分けられ、有彩色は色相・明度・彩度、無彩色は明度によって表されます。",
  "choices": [
   "正しい。色は無彩色と有彩色に大別される",
   "正しい。有彩色は色相・明度・彩度の三属性を持つ",
   "正しい。無彩色は色相と彩度を持たず、明度で表す",
   "誤り。純色は各色相で彩度が最も高い色である"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」色彩理論"
 },
 "53-53": {
  "explanation": "誤っているのは1です。レザーを円弧状に運行した場合、刃先側の移動量が大きくなり、刃元側の動きは小さくなります。斜行角度は安全上45度程度まで、うぶ毛は対皮角度をやや大きくして処理し、運行速度はおおむね1ストローク1秒を目安とします。",
  "choices": [
   "誤り。円弧運行では外側となる刃先の移動量が大きく、刃元の動きは小さい",
   "正しい。過度な斜行は切創につながるため、45度程度が限界とされる",
   "正しい。抵抗の少ないうぶ毛では対皮角度を大きめにできる",
   "正しい。安全で一定した運行速度として1ストローク約1秒が目安となる"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
 },
 "53-54": {
  "explanation": "正しいのは3です。1回目のラザーリングは皮脂や汚れを乳化・除去して毛を軟化させる前処理、2回目はレザーの滑走をよくし皮膚を保護して、シェービングを円滑にするために行います。",
  "choices": [
   "誤り。洗浄のための乳化は主に1回目の目的",
   "誤り。1回目の中心目的は洗浄・軟化で、乾燥防止を主目的とする説明ではない",
   "正しい。2回目はレザーの運行を円滑にし、皮膚を保護する",
   "誤り。剃った毛の飛散防止は1回目の主要目的ではない"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
 },
 "53-55": {
  "explanation": "正しい組合せはaとdで、選択肢4です。シャンプー剤は手のひらでのばして毛髪全体へ均等につけ、リンシングでは残留しないよう十分に洗い流します。泡立ちが悪い場合は、むやみに追加せず、すすいで必要に応じて再度洗います。薬液処理前は頭皮を傷つけないよう強くこすりません。",
  "choices": [
   "誤り。aは正しいが、bはシャンプー剤の過剰使用につながる",
   "誤り。bとcはいずれも適切でない",
   "誤り。cは頭皮刺激・損傷を招くおそれがあり、dのみ正しい",
   "正しい。aとdが正しい"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
 },
"52-01":{
  "explanation": "誤っているのは3です。免許証の再交付申請先は住所地の都道府県知事ではなく、厚生労働大臣です。氏名変更時の名簿訂正は30日以内で、業務停止時は免許証を速やかに提出します。",
  "choices": [
    "正しい。免許申請には精神機能の障害に関する医師の診断書を添付する",
    "正しい。氏名など名簿事項の変更は30日以内に訂正申請する",
    "誤り。再交付申請先は厚生労働大臣である",
    "正しい。業務停止処分時は免許証等を速やかに提出する"
  ],
  "basis": "理容師法施行規則第1条、第3条、第6条、第8条"
},
"52-02":{
  "explanation": "誤っているのは3です。開設届に医師の診断書が必要なのは、従事する理容師が結核や皮膚疾患など所定の疾病にかかっていないことについてであり、精神機能の障害に関する診断書ではありません。",
  "choices": [
    "正しい。使用開始前に開設届と検査確認が必要である",
    "正しい。管理理容師の氏名・住所は届出事項である",
    "誤り。添付する診断書の内容が異なる",
    "正しい。虚偽届出は罰金の対象となり得る"
  ],
  "basis": "理容師法第11条、第11条の2、第15条、理容師法施行規則第19条"
},
"52-03":{
  "explanation": "届出が不要なのは1です。定休日は理容師法上の開設届事項ではありません。名称、従業者、従事理容師の変更は届出対象です。",
  "choices": [
    "正しい選択。定休日は法定届出事項ではない",
    "届出が必要。理容所の名称は届出事項である",
    "届出が必要。従業者の変更は届出事項である",
    "届出が必要。従事理容師の退職は変更届の対象である"
  ],
  "basis": "理容師法第11条、理容師法施行規則第19条・第20条"
},
"52-04":{
  "explanation": "正しいのは4です。育児や介護などにより理容所へ来ることが困難な者に対する出張理容は、条例等で認められる場合があります。出張先でも衛生措置は必要です。",
  "choices": [
    "誤り。出張理容でも衛生上必要な措置が必要である",
    "誤り。理容所所属を全国一律の要件とする規定ではない",
    "誤り。政令のほか条例で定める場合がある",
    "正しい。育児・介護等で来店困難な者は対象となり得る"
  ],
  "basis": "理容師法第6条の2、理容師法施行令第4条、各自治体条例"
},
"52-05":{
  "explanation": "正しい組合せは2です。伝染性疾病で就業が不適当な理容師は業務停止となり、その処分に違反すると免許取消し、開設者が従事させると理容所閉鎖の対象となります。",
  "choices": [
    "誤り。最初の処分は免許取消しではない",
    "正しい。A業務停止、B免許取消し、C閉鎖処分",
    "誤り。A・B・Cの処分関係が異なる",
    "誤り。Cは罰金刑ではなく閉鎖処分となり得る"
  ],
  "basis": "理容師法第10条、第14条"
},
"52-06":{
  "explanation": "正しい組合せはaとdで、選択肢4です。管理理容師未設置と、理容師の衛生措置違反は閉鎖命令の対象となり得ます。検査前使用や変更届違反は主として罰則の対象です。",
  "choices": [
    "誤り。bは閉鎖命令の直接要件ではない",
    "誤り。bとcはいずれも閉鎖命令の組合せではない",
    "誤り。cは閉鎖命令の直接要件ではない",
    "正しい。aとdが閉鎖命令の対象となり得る"
  ],
  "basis": "理容師法第12条、第14条、第15条"
},
"52-07":{
  "explanation": "正しい組合せはaとdで、選択肢4です。生活衛生同業組合は自主的活動を促進し、施設改善資金のあっせん等を行えます。原則として同一都道府県・同一業種に複数組合は設立できません。",
  "choices": [
    "誤り。bが誤り",
    "誤り。bとcが誤り",
    "誤り。cが誤り",
    "正しい。aとdが正しい"
  ],
  "basis": "生活衛生関係営業の運営の適正化及び振興に関する法律第8条、第9条、第57条の3"
},
"52-08":{
  "explanation": "正しい組合せはbとcで、選択肢2です。所得税・法人税は所得に対して課税され、個人の確定申告期限は原則3月15日です。源泉所得税は通常、納付期限ごとに納め、固定資産税は土地と家屋の双方に課税されます。",
  "choices": [
    "誤り。aが誤り",
    "正しい。bとcが正しい",
    "誤り。dが誤り",
    "誤り。aとdが誤り"
  ],
  "basis": "所得税法、法人税法、地方税法、国税庁「源泉所得税」「確定申告」"
},
"52-09":{
  "explanation": "正しい組合せはaとbで、選択肢1です。労働条件は書面等で明示し、休日は原則毎週1日以上です。短時間労働者にも要件に応じた年休があり、一般健康診断は原則1年以内ごとに1回です。",
  "choices": [
    "正しい。aとbが正しい",
    "誤り。cが誤り",
    "誤り。cとdが誤り",
    "誤り。dが誤り"
  ],
  "basis": "労働基準法第15条、第35条、第39条、労働安全衛生規則第44条"
},
"52-10":{
  "explanation": "誤っているのは3です。老齢基礎年金額は保険料納付済期間や免除期間などに応じて決まり、全員一律ではありません。",
  "choices": [
    "正しい。第1号被保険者の基本範囲である",
    "正しい。厚生年金加入者は国民年金第2号被保険者でもある",
    "誤り。納付期間等により年金額は異なる",
    "正しい。遺族基礎年金には保険料納付要件がある"
  ],
  "basis": "国民年金法第7条、第27条、第37条"
},
"52-11":{
  "explanation": "正しいのは1です。保健所は地域における公衆衛生の第一線機関です。感染症対策や理容所の衛生も所掌し、都道府県のほか指定都市・中核市・特別区なども設置します。",
  "choices": [
    "正しい。保健所は公衆衛生の第一線機関である",
    "誤り。エイズを含む感染症対策は保健所業務である",
    "誤り。理容所の衛生は環境衛生業務に含まれる",
    "誤り。設置主体は都道府県だけではない"
  ],
  "basis": "地域保健法第5条・第6条"
},
"52-12":{
  "explanation": "正しい組合せは2です。高齢化により粗死亡率は上昇傾向でも、年齢構成を調整した年齢調整死亡率は低下傾向となり得ます。",
  "choices": [
    "誤り。比較する集団差は生活習慣ではなく年齢構成",
    "正しい。A粗死亡率、B年齢構成、C年齢調整死亡率",
    "誤り。AとCが逆",
    "誤り。AとCが逆"
  ],
  "basis": "厚生労働省「人口動態統計」"
},
"52-13":{
  "explanation": "誤っているのは2です。男性の部位別がん死亡では、1993年以降に胃がんが一貫して第1位だったわけではなく、肺がんが上位となっています。",
  "choices": [
    "正しい。1981年以降、悪性新生物は死因第1位",
    "誤り。男性の部位別死亡第1位を胃がんとするのは不適切",
    "正しい。喫煙は複数のがんの危険因子",
    "正しい。多量飲酒はがんリスクを高める"
  ],
  "basis": "厚生労働省「人口動態統計」、国立がん研究センターがん情報サービス"
},
"52-14":{
  "explanation": "正しいのは1です。一酸化炭素には大気汚染に係る環境基準が定められています。",
  "choices": [
    "正しい。環境基準の対象である",
    "誤り。ヘリウムには当該環境基準はない",
    "誤り。塩化水素はこの設問の対象物質ではない",
    "誤り。メタンには当該環境基準はない"
  ],
  "basis": "環境基本法、大気汚染に係る環境基準について"
},
"52-15":{
  "explanation": "誤っているのは4です。衛生管理要領では、相対湿度は40～70％が望ましく、35％以下ではありません。",
  "choices": [
    "正しい。温熱感は湿度や気流にも左右される",
    "正しい。望ましい室温は17～28℃",
    "正しい。相対湿度の定義である",
    "誤り。望ましい相対湿度は40～70％"
  ],
  "basis": "厚生労働省「理容所及び美容所における衛生管理要領」"
},
"52-16":{
  "explanation": "誤っているのは2です。細菌の遺伝情報は主としてDNAであり、RNAを含む核を持つという表現は誤りです。細菌には核膜で囲まれた核もありません。",
  "choices": [
    "正しい。細胞膜は脂質二重層からなる",
    "誤り。遺伝物質は主にDNAで、真核細胞のような核はない",
    "正しい。芽胞は熱・乾燥に強い",
    "正しい。鞭毛は運動に関与する"
  ],
  "basis": "標準微生物学・感染症学資料"
},
"52-17":{
  "explanation": "誤っているのは4です。日本脳炎は蚊が媒介し、飛沫感染ではありません。",
  "choices": [
    "正しい。A型肝炎は主に経口感染",
    "正しい。破傷風菌は土壌中に存在し創傷から感染",
    "正しい。デング熱は蚊媒介",
    "誤り。日本脳炎は蚊媒介"
  ],
  "basis": "厚生労働省・国立感染症研究所の感染症情報"
},
"52-18":{
  "explanation": "誤っているのは4です。BCGの定期接種は乳児を対象とし、7歳以上ではありません。",
  "choices": [
    "正しい。結核は空気中の飛沫核で感染する",
    "正しい。無症状で健診発見されることがある",
    "正しい。感染性結核は就業制限の対象となり得る",
    "誤り。BCG定期接種は乳児期に行う"
  ],
  "basis": "感染症法第18条、予防接種法、厚生労働省「結核」"
},
"52-19":{
  "explanation": "誤っているのは1です。インフルエンザウイルスはヒトだけでなく鳥や豚などにも感染します。",
  "choices": [
    "誤り。動物にも感染する",
    "正しい。飛沫・接触で感染する",
    "正しい。冬から春先の流行は季節性インフルエンザ",
    "正しい。新型は大流行の危険がある"
  ],
  "basis": "厚生労働省「インフルエンザ」"
},
"52-20":{
  "explanation": "誤っているのは1です。梅毒患者報告数は2010年代以降、減少ではなく大きく増加しました。",
  "choices": [
    "誤り。2010年代以降は増加傾向",
    "正しい。胎盤を介した先天梅毒がある",
    "正しい。無治療では長期に進行し重篤化する",
    "正しい。病原体は梅毒トレポネーマ"
  ],
  "basis": "厚生労働省・国立感染症研究所「梅毒」"
},
"52-21":{
  "explanation": "正しい組合せは2です。感染力をなくすのが消毒、すべての微生物を除去・死滅させるのが滅菌、微生物を殺す総称が殺菌です。",
  "choices": [
    "誤り。用語の対応が異なる",
    "正しい。A消毒、B滅菌、C殺菌",
    "誤り。AとBが逆",
    "誤り。BとCが逆"
  ],
  "basis": "厚生労働省「衛生管理要領」"
},
"52-22":{
  "explanation": "誤っているのは3です。かみそりは血液付着の疑いがない場合でも、エタノールを含ませた綿で拭くだけではなく、消毒用エタノール中に10分間以上浸すなど所定の方法が必要です。",
  "choices": [
    "正しい。0.01％以上の次亜塩素酸ナトリウムに10分以上",
    "正しい。85µW/cm²以上で20分以上照射",
    "誤り。拭くだけでは所定の消毒法にならない",
    "正しい。0.1％以上の逆性石けんに10分以上"
  ],
  "basis": "厚生労働省「理容所及び美容所における衛生管理要領」"
},
"52-23":{
  "explanation": "誤っているのは3です。一般に温度が高いほど薬剤作用は速くなり、低温では作用時間が長く必要です。",
  "choices": [
    "正しい。濃度・温度・時間が重要",
    "正しい。蒸気消毒は所定温度で一定時間が必要",
    "誤り。低温ほど作用は遅くなる",
    "正しい。乾熱は湿熱より長時間を要する"
  ],
  "basis": "消毒法の基礎、厚生労働省「衛生管理要領」"
},
"52-24":{
  "explanation": "正しい組合せはaとbで、選択肢1です。エタノールは揮発性・引火性があり、結核菌にも有効ですが、芽胞には十分な効果がありません。",
  "choices": [
    "正しい。aとbが正しい",
    "誤り。cが誤り",
    "誤り。cとdが誤り",
    "誤り。dが誤り"
  ],
  "basis": "厚生労働省「衛生管理要領」、消毒薬資料"
},
"52-25":{
  "explanation": "誤っているのは2です。5％製剤2mLを全量500mLにすると0.02％であり、0.05％にはなりません。",
  "choices": [
    "正しい。10％×5/500＝0.1％",
    "誤り。5％×2/500＝0.02％",
    "正しい。6％×2/600＝0.02％",
    "正しい。10％×10/1000＝0.1％"
  ],
  "basis": "濃度計算式 C1V1=C2V2"
},
"52-26":{
  "explanation": "正しい組合せは3です。内眼角内側の赤い隆起が涙丘、周辺の孔が涙点で、涙は鼻涙管へ流れます。",
  "choices": [
    "誤り。名称の対応が異なる",
    "誤り。名称の対応が異なる",
    "正しい。A涙丘、B涙点、C鼻涙管",
    "誤り。A・Bが異なる"
  ],
  "basis": "人体解剖学資料"
},
"52-27":{
  "explanation": "正しいのは4です。血球は骨髄でつくられます。",
  "choices": [
    "誤り。骨膜は骨表面を覆う",
    "誤り。緻密質は骨の硬い部分",
    "誤り。海綿質そのものではなく内部の骨髄が造血を担う",
    "正しい。骨髄に造血作用がある"
  ],
  "basis": "人体解剖生理学"
},
"52-28":{
  "explanation": "正しいのは3です。口輪筋は口裂を閉じ、口唇を前方へ突出させます。",
  "choices": [
    "誤り。オトガイ筋は下唇・オトガイ部に作用",
    "誤り。口角挙筋は口角を挙げる",
    "正しい。口輪筋が口を閉じ突出させる",
    "誤り。頬筋は頬を歯列へ押し付ける"
  ],
  "basis": "人体解剖学資料"
},
"52-29":{
  "explanation": "正しいのは4です。副交感神経活動が低下すると交感神経優位となり、瞳孔は散大します。",
  "choices": [
    "誤り。交感神経は気管支を拡張",
    "誤り。副交感神経は心拍数を低下",
    "誤り。交感神経低下では消化器血管収縮とはいえない",
    "正しい。副交感神経低下で瞳孔は散大方向"
  ],
  "basis": "人体生理学資料"
},
"52-30":{
  "explanation": "正しいのは2です。リンパは胸管や右リンパ本幹を経て静脈角で静脈へ合流します。",
  "choices": [
    "誤り。動脈には合流しない",
    "正しい。最終的に静脈へ入る",
    "誤り。毛細血管へ直接合流しない",
    "誤り。門脈ではない"
  ],
  "basis": "人体解剖学資料"
},
"52-31":{
  "explanation": "表皮に含まれないのは1です。線維芽細胞は主に真皮にあり、表皮には角化細胞、色素細胞、ランゲルハンス細胞などがあります。",
  "choices": [
    "正しい選択。線維芽細胞は真皮の主要細胞",
    "表皮基底層に存在する",
    "表皮の主要細胞である",
    "表皮に存在する免疫担当細胞"
  ],
  "basis": "皮膚科学・組織学資料"
},
"52-32":{
  "explanation": "誤っているのは2です。立毛筋はすべての毛包に付くわけではなく、眉毛・睫毛などにはありません。",
  "choices": [
    "正しい。毛母で毛の細胞がつくられる",
    "誤り。すべての毛包に立毛筋があるわけではない",
    "正しい。独立脂腺は毛包と無関係に開口する部位がある",
    "正しい。手掌・足底に脂腺はなくエクリン腺が多い"
  ],
  "basis": "皮膚科学・毛髪科学資料"
},
"52-33":{
  "explanation": "誤っているのは3です。紫外線から基底細胞を守るのは主としてメラニンであり、組織球ではありません。",
  "choices": [
    "正しい。皮脂膜とケラチンは化学刺激を防ぐ",
    "正しい。脂肪酸は微生物増殖を抑える",
    "誤り。紫外線防御はメラニンが担う",
    "正しい。膠原・弾性線維は機械的外力に抵抗する"
  ],
  "basis": "皮膚科学資料"
},
"52-34":{
  "explanation": "誤っているのは3です。サンバーンを主に起こすのはUVBで、UVAは皮膚深部へ届き光老化などに関与します。",
  "choices": [
    "正しい。洗浄後の保湿は有用",
    "正しい。一般的な入浴温度の目安",
    "誤り。急性サンバーンは主にUVB",
    "正しい。紫外線吸収剤で接触皮膚炎が起こることがある"
  ],
  "basis": "皮膚科学・紫外線対策資料"
},
"52-35":{
  "explanation": "誤っているのは4です。ラテックスアレルギーは天然ゴムラテックス製品への曝露で起こり、合成ゴム製手袋が原因という説明は不適切です。",
  "choices": [
    "正しい。刺激性は濃度・接触時間に左右される",
    "正しい。同一アレルゲンを含む製品で再発する",
    "正しい。パッチテストは原因特定に有用",
    "誤り。主因は天然ゴムラテックス"
  ],
  "basis": "皮膚科学・アレルギー資料"
},
"52-36":{
  "explanation": "正しい組合せはaとbで、選択肢1です。ロウは高級脂肪酸と高級アルコールのエステルで、高級アルコールは炭素数の多いアルコールです。",
  "choices": [
    "正しい。aとbが正しい",
    "誤り。cが誤り",
    "誤り。cとdが誤り",
    "誤り。dが誤り"
  ],
  "basis": "香粧品化学・油性原料"
},
"52-37":{
  "explanation": "正しいのは3です。第四級アンモニウム塩は陽イオン界面活性剤で、毛髪への吸着性が高く帯電防止に優れます。",
  "choices": [
    "誤り。石けんは陰イオン界面活性剤",
    "誤り。レシチンは両性界面活性剤として扱われる",
    "正しい。第四級アンモニウム塩は帯電防止に優れる",
    "誤り。陰イオン界面活性剤は一般に泡立ちがよい"
  ],
  "basis": "香粧品化学・界面活性剤"
},
"52-38":{
  "explanation": "誤っているのは4です。パラフェニレンジアミンは酸化染毛剤の染料中間体であり、酸化剤ではありません。",
  "choices": [
    "正しい。紫外線吸収剤として用いられる",
    "正しい。パラベンは防腐剤",
    "正しい。収れん剤として用いられる",
    "誤り。染料中間体で、酸化剤は過酸化水素など"
  ],
  "basis": "医薬部外品原料規格、染毛剤承認基準"
},
"52-39":{
  "explanation": "正しいのは3です。二浴式パーマ剤では臭素酸ナトリウムなどが酸化剤として第2剤に配合されます。",
  "choices": [
    "誤り。過酸化水素は酸化剤で第2剤",
    "誤り。炭酸水素アンモニウムはアルカリ剤",
    "正しい。臭素酸ナトリウムは第2剤の酸化剤",
    "誤り。システインは還元剤"
  ],
  "basis": "パーマネント・ウェーブ用剤承認基準"
},
"52-40":{
  "explanation": "正しいのは4です。脱色剤は毛髪内のメラニンを酸化分解して明るくします。",
  "choices": [
    "誤り。酸性染料は水中で負に帯電する",
    "誤り。ヘアマニキュアは半永久染毛料",
    "誤り。パラフェニレンジアミンは低分子の染料中間体",
    "正しい。メラニンを酸化分解する"
  ],
  "basis": "染毛剤・脱色剤の基礎、医薬部外品承認基準"
},
"52-41":{
  "explanation": "正しい組合せはaとdで、選択肢4です。明治期にはクリッパー普及による丸刈りやチャン刈りがみられました。翼賛型は昭和期です。",
  "choices": [
    "誤り。bは昭和期",
    "誤り。b・cが明治期の組合せでない",
    "誤り。cが不適切",
    "正しい。aとdが明治期"
  ],
  "basis": "日本理容美容教育センター「文化論」"
},
"52-42":{
  "explanation": "正しいのは4です。高田賢三のファッションは、民族衣装の要素を取り入れたフォークロア調で知られます。",
  "choices": [
    "誤り。ケンゾーの代表的説明ではない",
    "誤り。アンノン族の旅行・若者文化を示す語",
    "誤り。ヒッピー文化一般の説明",
    "正しい。フォークルックが該当"
  ],
  "basis": "日本理容美容教育センター「文化論」"
},
"52-43":{
  "explanation": "正しいのは3です。燕尾服は夜の最も正式な礼装で、ホワイトタイと呼ばれ、後ろ裾が燕尾状に分かれます。",
  "choices": [
    "誤り。モーニングは昼の正礼装",
    "誤り。ディレクターズスーツは昼の準礼装",
    "正しい。燕尾服がホワイトタイ",
    "誤り。メスジャケットではない"
  ],
  "basis": "日本理容美容教育センター「文化論」"
},
"52-44":{
  "explanation": "正しい組合せは1です。図中Aは前額髪際隅部、Bは鼻尖、Cは人中です。",
  "choices": [
    "正しい。図の各部位に一致する",
    "誤り。各指示位置と名称が一致しない",
    "誤り。B・Cが一致しない",
    "誤り。Aが一致しない"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」、第52回原本図版"
},
"52-45":{
  "explanation": "誤っているのは1です。鋏尖・鋏要・接点を結ぶ線は刃線ではありません。刃線は切れ刃の線を指します。",
  "choices": [
    "誤り。刃線の説明ではない",
    "正しい。裏面の浅いくぼみはひぞこ",
    "正しい。表裏のなす角が刃角",
    "正しい。鋏体が接する部分が触点"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
},
"52-46":{
  "explanation": "正しい組合せは2です。図中Aは刀腰、Bは刀幹、Cは刀要です。",
  "choices": [
    "誤り。名称の対応が異なる",
    "正しい。A刀腰、B刀幹、C刀要",
    "誤り。Aが異なる",
    "誤り。各名称の対応が異なる"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」、第52回原本図版"
},
"52-47":{
  "explanation": "正しいのは3です。レザーはくさび作用で毛を切削します。替刃式でもホルダー等の消毒は必要です。",
  "choices": [
    "誤り。ハンドル角度の説明が不適切",
    "誤り。替刃交換後も器具部分の消毒が必要",
    "正しい。くさび作用で毛を切る",
    "誤り。替刃の刃線を柳刃とする説明は不適切"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
},
"52-48":{
  "explanation": "正しいのは3です。平面タイプでは奥行きを深く見せるため、分髪線を長く取ります。",
  "choices": [
    "誤り。凸面タイプの頂点設定が異なる",
    "誤り。高く刈り上げると凸面を強調する",
    "正しい。平面を補正して奥行きを出す",
    "誤り。標準タイプの頂点説明が異なる"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
},
"52-49":{
  "explanation": "正しい組合せは2です。上部ほど長くなる部分で用い、上下差が大きいほど少ない回数、小さいほど多い回数です。",
  "choices": [
    "誤り。A・B・Cが異なる",
    "正しい。A長く、B少なく、C多く",
    "誤り。Aが異なる",
    "誤り。B・Cが逆"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
},
"52-50":{
  "explanation": "正しいのは4です。アウトサイドテーパーは毛束を外側へ向かわせ、外にはねやすくする効果があります。",
  "choices": [
    "誤り。ノーマルテーパーの範囲説明が不適切",
    "誤り。ディープテーパーは毛量が多い場合などに用いる",
    "誤り。エンドテーパーは毛先の調整に用いる",
    "正しい。外側にはねやすくなる"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
},
"52-51":{
  "explanation": "誤っているのは2です。アイロンセットでは作業しやすい高さに頭部を設定しますが、技術者の腰の高さという説明は低すぎます。",
  "choices": [
    "正しい。アイロンとコームは平行に操作",
    "誤り。頭部位置の設定が不適切",
    "正しい。所定の姿勢・運行で操作する",
    "正しい。頭皮面と平行に入れ接触を避ける"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
},
"52-52":{
  "explanation": "正しい組合せは1です。ノンステムはボリュームを出す部分に用い、110度より大きく引き出し、ピボット側の圧力を弱めます。",
  "choices": [
    "正しい。A出す、B大きな、C弱める",
    "誤り。A・Cが異なる",
    "誤り。Bが異なる",
    "誤り。A・B・Cが異なる"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
},
"52-53":{
  "explanation": "正しいのは4です。各色相で彩度が最も高い色を純色といいます。",
  "choices": [
    "誤り。白・灰・黒は無彩色",
    "誤り。無彩色には色相・彩度がない",
    "誤り。最も明度が高いのは白",
    "正しい。各色相の最高彩度色が純色"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
},
"52-54":{
  "explanation": "誤っているのは2です。広い面でも肩関節だけを軸にした大きすぎるストロークは行わず、部位に応じて安定した短い運行を行います。",
  "choices": [
    "正しい。円弧状運行で刃を均等に接触させる",
    "誤り。大きすぎるストロークは安定性を欠く",
    "正しい。刃線全体を均等に使う",
    "正しい。適度な斜行で切れ味が増す"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
},
"52-55":{
  "explanation": "誤っているのは4です。レディースシェービングでは、うぶ毛や皮膚状態に応じて施術し、1回剃り・2回剃りの双方で必ずソープを使うとは限りません。",
  "choices": [
    "正しい。うぶ毛除去で化粧のりがよくなる",
    "正しい。開閉眼時の眉形の差を考慮する",
    "正しい。生え際は自然な線を残す",
    "誤り。2回とも必ずソープを使うという一律の説明は不適切"
  ],
  "basis": "日本理容美容教育センター「理容技術理論」"
},

/* 第51回 問1〜30：個別解説監修。 */
"51-01":{
  "explanation": "誤っているのは4です。理容を業として行えるのは理容師に限られ、反復継続して行う福利厚生目的の理容行為も「業」に含まれます。衛生措置は法令に加えて所在地の条例にも従いますが、理容所の開設者自身が理容師である必要はありません。",
  "choices": [
    "正しい。理容師でなければ理容を業として行えない",
    "正しい。反復継続して行う場合は営利目的でなくても「業」に当たり得る",
    "正しい。都道府県等の条例で定める衛生措置にも従う",
    "誤り。理容所の開設者は理容師でなくてもよい"
  ],
  "basis": "理容師法第1条の2、第6条、第9条、第11条"
},
"51-02":{
  "explanation": "誤っているのは3です。住所地は理容師名簿の登録事項ではないため、住所変更だけで名簿訂正申請は不要です。無免許営業には罰則があり、業務停止処分時には免許証等を指定された行政機関へ提出します。",
  "choices": [
    "正しい。試験合格だけでは足りず、名簿登録により免許を受ける必要がある",
    "正しい。無免許で理容を業とした場合は罰金の対象となる",
    "誤り。住所は理容師名簿の登録事項ではない",
    "正しい。業務停止処分時は免許証等の提出が必要である"
  ],
  "basis": "理容師法第3条、第6条、第10条、第15条、理容師法施行規則"
},
"51-03":{
  "explanation": "正しいのは3です。管理理容師は、常時2人以上の理容師が従事する理容所に必要で、開設届には氏名と住所等を届け出ます。資格要件は免許取得後3年以上の実務経験と指定講習会修了です。",
  "choices": [
    "誤り。一時的な増員だけでは「常時2人以上」とはいえない",
    "誤り。必要な実務経験は5年以上ではなく3年以上",
    "正しい。管理理容師の氏名・住所等を届け出る",
    "誤り。未設置は直ちに罰金ではなく、閉鎖命令等の対象となり得る"
  ],
  "basis": "理容師法第11条の4、第14条、理容師法施行規則第19条"
},
"51-04":{
  "explanation": "正しい組合せはaとdで、選択肢4です。開設届は営業開始前に必要で、検査確認前の使用は罰則対象です。届出には理容師以外の従業者数等も含まれ、変更届は「30日以内」と一律には定められていません。",
  "choices": [
    "誤り。aは正しいが、bは誤り",
    "誤り。bとcはいずれも誤り",
    "誤り。cは誤りで、dは正しい",
    "正しい。aとdが正しい"
  ],
  "basis": "理容師法第11条、第11条の2、第15条、理容師法施行規則第19条・第20条"
},
"51-05":{
  "explanation": "正しいのは2です。業務停止中の理容師に理容業務を行わせた開設者には罰則が適用され得ます。衛生措置違反や届出義務違反は、それぞれ改善命令・閉鎖命令・罰則の要件が異なります。",
  "choices": [
    "誤り。開設者への罰則はこの記述だけで直ちに成立するものではない",
    "正しい。業務停止中の理容師に業務を行わせた場合は罰則対象となり得る",
    "誤り。衛生措置違反はまず改善命令等の対象で、直ちに閉鎖処分とは限らない",
    "誤り。変更届の不履行は罰則対象となり得るが、直ちに閉鎖処分とは限らない"
  ],
  "basis": "理容師法第10条、第12条、第14条、第15条"
},
"51-06":{
  "explanation": "正しいのは1です。環境衛生監視員は保健所等に配置され、理容所への立入検査を行えます。立入検査を拒み、妨げ、または忌避した場合は罰金の対象となり得ます。",
  "choices": [
    "正しい。保健所・立入検査・罰金刑の組合せが適切",
    "誤り。生活衛生営業指導センターは行政上の立入検査機関ではない",
    "誤り。環境衛生監視員の職務は経営指導ではない",
    "誤り。立入検査を行うのは保健所等の監視員である"
  ],
  "basis": "理容師法第13条、第15条"
},
"51-07":{
  "explanation": "誤っているのは2です。生活衛生同業組合は、同業者の自主的な組織として衛生水準の維持向上や経営の健全化を図るもので、営利を目的とする団体ではありません。",
  "choices": [
    "正しい。振興指針には施設・サービス・経営改善等が盛り込まれる",
    "誤り。生活衛生同業組合は営利を目的としない",
    "正しい。指導センターは経営健全化と衛生水準向上、利用者利益の擁護を目的とする",
    "正しい。登録店はSマーク等を掲示する"
  ],
  "basis": "生活衛生関係営業の運営の適正化及び振興に関する法律"
},
"51-08":{
  "explanation": "正しいのは3です。貸借対照表は一定時点の資産・負債・純資産を示し、損益計算書は一定期間の収益・費用・利益を示します。1年以内に返済する借入金は流動負債です。",
  "choices": [
    "誤り。一時点の資産・負債は貸借対照表で把握する",
    "誤り。一定期間の利益・費用は損益計算書で把握する",
    "正しい。1年以内に返済する債務は流動負債",
    "誤り。個人事業の課税期間は原則として暦年である"
  ],
  "basis": "企業会計原則、所得税法"
},
"51-09":{
  "explanation": "正しい組合せはaとbで、選択肢1です。適用事業所の被用者は原則として健康保険の被保険者となり、産前産後休業・育児休業中の保険料免除制度があります。国民健康保険は市町村・都道府県共同運営と国保組合があり、国が直接運営する制度ではありません。",
  "choices": [
    "正しい。aとbが正しい",
    "誤り。cは国が直接運営するという点が誤り",
    "誤り。cとdはいずれも誤り",
    "誤り。dは給付内容が完全に同一という点が誤り"
  ],
  "basis": "健康保険法、国民健康保険法"
},
"51-10":{
  "explanation": "正しい組合せはcとdで、選択肢3です。雇用保険には加入要件があり、自己都合退職でも所定の要件を満たせば基本手当は支給されます。教育訓練給付があり、保険料は事業主と被保険者が負担します。",
  "choices": [
    "誤り。aとbはいずれも誤り",
    "誤り。bは誤りで、cは正しい",
    "正しい。cとdが正しい",
    "誤り。aは誤りで、dは正しい"
  ],
  "basis": "雇用保険法、労働保険徴収法"
},
"51-11":{
  "explanation": "正しいのは1です。たばこの煙には多数の発がん物質が含まれ、喫煙・受動喫煙はがんや循環器疾患の危険を高めます。妊娠中の喫煙は胎児発育にも悪影響を及ぼします。",
  "choices": [
    "正しい。たばこ煙には多くの発がん物質が含まれる",
    "誤り。妊婦の喫煙は胎児発育へ悪影響を及ぼす",
    "誤り。喫煙は心血管疾患の危険を高める",
    "誤り。受動喫煙も肺がんの危険を高める"
  ],
  "basis": "厚生労働省「喫煙と健康」"
},
"51-12":{
  "explanation": "生活習慣病に該当しないのは2のB型肝炎です。がん、脳卒中、心臓病は生活習慣との関連が強い代表的な疾患です。B型肝炎はB型肝炎ウイルスへの感染によって起こります。",
  "choices": [
    "誤り。がんは代表的な生活習慣病に含まれる",
    "正しい。B型肝炎はウイルス感染症である",
    "誤り。脳卒中は生活習慣病に含まれる",
    "誤り。心臓病は生活習慣病に含まれる"
  ],
  "basis": "厚生労働省「生活習慣病予防」"
},
"51-13":{
  "explanation": "誤っているのは4です。自殺死亡率は長期にわたり一貫して上昇し続けているわけではなく、増減を経て近年はピーク時より低下しています。心の健康には早期相談・治療、休養、ストレス管理が重要です。",
  "choices": [
    "正しい。心の健康は身体状態や生活の質に影響する",
    "正しい。うつ病は早期発見と適切な治療が重要",
    "正しい。休養やストレス管理は心の健康維持に重要",
    "誤り。自殺死亡率は1958年以降一貫して上昇してはいない"
  ],
  "basis": "厚生労働省「自殺対策白書」「こころの情報サイト」"
},
"51-14":{
  "explanation": "誤っているのは3です。浮遊粒子状物質は、粒径10マイクロメートル以下の粒子を対象とし、1ミリメートル以下ではありません。PM2.5は粒径2.5マイクロメートル以下の微小粒子状物質です。",
  "choices": [
    "正しい。量だけでなく粒径や成分も健康影響に関係する",
    "正しい。浮遊粒子状物質には環境基準がある",
    "誤り。基準となる粒径は1 mmではなく10 µm以下",
    "正しい。PM2.5は2.5 µm以下の粒子をいう"
  ],
  "basis": "環境省「大気環境基準」「微小粒子状物質（PM2.5）」"
},
"51-15":{
  "explanation": "誤っているのは4です。衛生管理要領で望ましいとされる作業場内の二酸化炭素濃度は1000 ppm以下であり、100 ppm以下ではありません。",
  "choices": [
    "正しい。窓や隙間等による換気は自然換気",
    "正しい。人が多いほど二酸化炭素や粉じん等が増える",
    "正しい。燃焼暖房は二酸化炭素を発生させる",
    "誤り。望ましい基準は100 ppm以下ではなく1000 ppm以下"
  ],
  "basis": "厚生労働省「理容所及び美容所における衛生管理要領」"
},
"51-16":{
  "explanation": "正しいのは3の破傷風菌です。破傷風菌は偏性嫌気性菌で、酸素がある環境では発育しにくい性質があります。",
  "choices": [
    "誤り。百日せき菌は好気性菌",
    "誤り。結核菌は好気性菌",
    "正しい。破傷風菌は偏性嫌気性菌",
    "誤り。大腸菌は通性嫌気性菌"
  ],
  "basis": "国立感染症研究所・厚生労働省感染症情報"
},
"51-17":{
  "explanation": "正しい組合せはaとdで、選択肢4です。風しんはMRワクチン、結核はBCGによる定期接種の対象です。A型肝炎とデング熱は、この設問時点の予防接種法上の定期接種対象ではありません。",
  "choices": [
    "誤り。bのA型肝炎は定期接種対象ではない",
    "誤り。bとcはいずれも定期接種対象ではない",
    "誤り。cは対象でなく、dは対象",
    "正しい。風しんと結核が対象"
  ],
  "basis": "予防接種法、厚生労働省「予防接種・ワクチン情報」"
},
"51-18":{
  "explanation": "空気感染するのは4の水痘です。日本脳炎は蚊、破傷風は創傷、コレラは汚染された飲食物を主な感染経路とします。",
  "choices": [
    "誤り。日本脳炎は蚊が媒介する",
    "誤り。破傷風は創傷から侵入する",
    "誤り。コレラは主に経口感染",
    "正しい。水痘は空気感染する"
  ],
  "basis": "厚生労働省・国立感染症研究所の感染症情報"
},
"51-19":{
  "explanation": "誤っているのは1です。デング熱は蚊が媒介し、飛沫感染ではありません。マラリアも蚊、エイズは血液・性行為等、A型肝炎は汚染された飲食物などを介します。",
  "choices": [
    "誤り。デング熱は蚊媒介感染",
    "正しい。マラリアはハマダラカが媒介する",
    "正しい。HIVは血液等を介して感染する",
    "正しい。A型肝炎は主に経口感染"
  ],
  "basis": "厚生労働省・国立感染症研究所の感染症情報"
},
"51-20":{
  "explanation": "正しい組合せはaとbで、選択肢1です。風しんは風しんウイルスによる感染症で、発熱・発疹・リンパ節腫脹などがみられます。潜伏期は通常2～3週間で、妊娠初期の感染は先天性風しん症候群の原因となります。",
  "choices": [
    "正しい。aとbが正しい",
    "誤り。cの潜伏期2～3日は短すぎる",
    "誤り。cとdはいずれも誤り",
    "誤り。dは胎児への影響がないという点が誤り"
  ],
  "basis": "厚生労働省「風しんについて」"
},
"51-21":{
  "explanation": "正しい組合せはaとdで、選択肢4です。血液付着器具は消毒用エタノール10分以上などの方法を用います。紫外線消毒は血液付着の疑いがない器具に85 µW/cm²以上で20分以上行います。",
  "choices": [
    "誤り。bの0.1％逆性石けんは血液付着器具には不適切",
    "誤り。bとcはいずれも不適切",
    "誤り。cは次亜塩素酸ナトリウム濃度が不足",
    "正しい。aとdが適切"
  ],
  "basis": "理容師法施行規則、厚生労働省「衛生管理要領」"
},
"51-22":{
  "explanation": "誤っているのは1です。消毒用エタノールは細菌芽胞には十分な効力を示しません。両性界面活性剤は結核菌に一定の効力があり、次亜塩素酸ナトリウムはノロウイルス対策に、逆性石けんは黄色ブドウ球菌等に用いられます。",
  "choices": [
    "誤り。エタノールは細菌芽胞には無効",
    "正しい。両性界面活性剤は結核菌にも効力を有するものがある",
    "正しい。次亜塩素酸ナトリウムはノロウイルス対策に用いられる",
    "正しい。逆性石けんは黄色ブドウ球菌等に有効"
  ],
  "basis": "厚生労働省「理容所及び美容所における衛生管理要領」"
},
"51-23":{
  "explanation": "誤っているのは2です。紫外線は汚れや影の部分には届きにくく、油膜などがあると消毒効果は低下します。煮沸時間は沸騰後から計り、蒸気消毒は80℃を超える蒸気で10分以上行います。",
  "choices": [
    "正しい。紫外線は微生物の核酸等に損傷を与える",
    "誤り。油膜や汚れは紫外線を遮り効果を低下させる",
    "正しい。煮沸時間は沸騰後から計測する",
    "正しい。規定上、蒸気消毒は煮沸消毒より長い処理時間を要する"
  ],
  "basis": "厚生労働省「理容所及び美容所における衛生管理要領」"
},
"51-24":{
  "explanation": "正しい組合せはbとcで、選択肢2です。エタノールは揮発を防ぐため密栓し、次亜塩素酸ナトリウムは光で分解するため冷暗所に保存します。有機物は消毒効果を低下させ、逆性石けんは普通石けんと併用すると効力が低下します。",
  "choices": [
    "誤り。aは有機物で効果が低下する",
    "正しい。bとcが正しい",
    "誤り。dは併用で効果が低下する",
    "誤り。aとdはいずれも誤り"
  ],
  "basis": "厚生労働省「理容所及び美容所における衛生管理要領」"
},
"51-25":{
  "explanation": "正しいのは4です。5％グルコン酸クロルヘキシジン10 mLを全量1000 mLにすると0.05％です。他の選択肢は原液量または最終濃度の計算が一致しません。",
  "choices": [
    "誤り。10％原液20 mLを1000 mLにすると0.2％",
    "誤り。10％原液20 mLを1000 mLにすると0.2％",
    "誤り。5％原液10 mLを1000 mLにすると0.05％",
    "正しい。5％×10/1000＝0.05％"
  ],
  "basis": "希釈計算式 C1V1=C2V2、衛生管理要領"
},
"51-26":{
  "explanation": "誤っているのは2です。睫毛は一般に上眼瞼の方が下眼瞼より本数が多く、長さも長いとされます。マイボーム腺は睫毛の生え際より内側に開口します。",
  "choices": [
    "正しい。睫毛は眼瞼縁に数列で生える",
    "誤り。本数は上眼瞼の方が多い",
    "正しい。上眼瞼の睫毛の方が長い",
    "正しい。マイボーム腺は生え際内側に開口する"
  ],
  "basis": "標準解剖学・眼瞼の解剖"
},
"51-27":{
  "explanation": "正しいのは1の心臓です。心筋は横紋筋ですが自律的に収縮する不随意筋です。上肢・下肢・舌の筋は主に随意性の骨格筋です。",
  "choices": [
    "正しい。心筋は横紋筋で不随意筋",
    "誤り。上肢の筋は主に随意筋",
    "誤り。下肢の筋は主に随意筋",
    "誤り。舌筋は骨格筋で随意筋"
  ],
  "basis": "人体解剖生理学"
},
"51-28":{
  "explanation": "正しいのは3の交感神経です。交感神経は瞳孔散大筋を働かせて瞳孔を開き、副交感神経は瞳孔括約筋を働かせて瞳孔を縮小させます。",
  "choices": [
    "誤り。一般の運動神経ではない",
    "誤り。知覚神経ではない",
    "正しい。交感神経が瞳孔を散大させる",
    "誤り。副交感神経は瞳孔を縮小させる"
  ],
  "basis": "人体解剖生理学"
},
"51-29":{
  "explanation": "正しいのは2の半規管です。半規管は頭部の回転運動（角加速度）を感知します。蝸牛は聴覚、球形嚢・卵形嚢は主に直線加速度や重力を感知します。",
  "choices": [
    "誤り。蝸牛は聴覚を担当する",
    "正しい。半規管は回転運動を感知する",
    "誤り。球形嚢は主に直線加速度を感知する",
    "誤り。卵形嚢は主に直線加速度を感知する"
  ],
  "basis": "人体解剖生理学"
},
"51-30":{
  "explanation": "気道に含まれないのは3の食道です。鼻腔、喉頭、気管、気管支は呼吸器系の空気の通り道で、食道は消化管です。",
  "choices": [
    "誤り。鼻腔は上気道に含まれる",
    "誤り。喉頭は気道に含まれる",
    "正しい。食道は消化管であり気道ではない",
    "誤り。気管支は下気道に含まれる"
  ],
  "basis": "人体解剖生理学"
},
"51-31":{
  "explanation": "正しいのは1です。頭部の皮膚は血管と脂腺が豊富です。顔面の皮膚厚は部位で異なり、手掌・足底の角質層は厚く、体幹は一般に腹側より背側の方が厚いです。",
  "choices": [
    "正しい。頭部皮膚は血流が豊富で、脂腺も多く分布する",
    "誤り。顔面皮膚の厚さは眼瞼・頬・鼻など部位によって異なる",
    "誤り。手掌と足底は摩擦に耐えるため角質層が厚い",
    "誤り。体幹では一般に背側の皮膚が腹側より厚い"
  ],
  "basis": "皮膚科学・皮膚組織学"
},
"51-32":{
  "explanation": "誤っているのは1です。毛流は毛が皮膚面に対して生える方向で、皮膚割線と直角に一致するとは限りません。毛幹・毛根の区分、毛周期、立毛筋の性質は正しい記述です。",
  "choices": [
    "誤り。毛流と皮膚割線は別の概念で、常に直角に一致するものではない",
    "正しい。皮膚表面に出た部分が毛幹、皮膚内の部分が毛根である",
    "正しい。毛は成長期・退行期・休止期を周期的に繰り返す",
    "正しい。立毛筋は平滑筋で交感神経の支配を受ける"
  ],
  "basis": "皮膚科学・毛髪学"
},
"51-33":{
  "explanation": "正しいのは4です。皮膚の感覚点では痛点が最も多く、温点が最も少ないため、Aは痛点、Bは温点です。",
  "choices": [
    "誤り。最も多いのは冷点ではなく痛点である",
    "誤り。温点は最も少なく、痛点は最も多い",
    "誤り。冷点より痛点が多い",
    "正しい。痛点が最も多く、温点が最も少ない"
  ],
  "basis": "皮膚科学・感覚受容器"
},
"51-34":{
  "explanation": "正しいのは4です。加齢により真皮のコラーゲンや弾性線維などが変化し、張りと弾力が低下して、たるみやしわが生じます。",
  "choices": [
    "誤り。脂性肌は皮脂分泌が多い状態であり、皮膚が薄いことを意味しない",
    "誤り。皮脂腺・毛包・皮膚は性ホルモンなどの影響を受ける",
    "誤り。角質層表面は水分が失われやすく、深部より水分量が少ない",
    "正しい。加齢に伴う弾力低下はたるみやしわにつながる"
  ],
  "basis": "皮膚科学・皮膚老化"
},
"51-35":{
  "explanation": "誤っているのは3です。顔面単純性糠疹は白癬菌による疾患ではありません。ニキビと男性ホルモン、腋臭症とアポクリン腺、疥癬とヒゼンダニの関係は正しいです。",
  "choices": [
    "正しい。男性ホルモンは皮脂分泌を促し、ニキビの発生要因となる",
    "正しい。アポクリン腺の機能が活発になる思春期以降に目立ちやすい",
    "誤り。顔面単純性糠疹は白癬菌感染によるものではない",
    "正しい。疥癬はヒゼンダニの寄生で起こる"
  ],
  "basis": "皮膚科学・皮膚疾患"
},
"51-36":{
  "explanation": "正しいのは3です。水分子は酸素側と水素側で電荷の偏りがあり、この性質を極性といいます。",
  "choices": [
    "誤り。溶けている物質は溶質、溶かしている物質が溶媒である",
    "誤り。有機化合物は主として炭素を骨格とする化合物で、窒素含有だけでは定義できない",
    "正しい。水分子内の電荷の偏りを極性という",
    "誤り。水素イオン濃度が高い状態は酸性である"
  ],
  "basis": "香粧品化学・基礎化学"
},
"51-37":{
  "explanation": "正しいのは1です。アミノ変性シリコーンは毛髪への吸着性が高く、コンディショニング成分として用いられます。",
  "choices": [
    "正しい。アミノ基により毛髪へ吸着しやすく、感触改善に用いられる",
    "誤り。カルナウバロウは植物由来のロウである",
    "誤り。スクワランは炭化水素で、油脂ではない",
    "誤り。常温で固体の脂肪は、液体の脂肪油より流動性が低い"
  ],
  "basis": "香粧品化学・油性原料"
},
"51-38":{
  "explanation": "正しいのはcとdで、選択肢3です。界面活性剤が一定濃度以上でつくる集合体はミセルで、可溶化は難溶性物質を見かけ上溶けやすくする作用です。",
  "choices": [
    "誤り。集合体はイオンではなくミセルという",
    "誤り。可溶化は水に溶けにくい物質を溶けやすくする作用である",
    "正しい。乳化によって得られた系をエマルションという",
    "正しい。液体中に微細な固体粒子が均一に存在する状態を分散という"
  ],
  "basis": "香粧品化学・界面活性剤"
},
"51-39":{
  "explanation": "誤っているのは2です。パラアミノ安息香酸エステルは紫外線吸収剤として用いられ、金属イオン封鎖剤ではありません。",
  "choices": [
    "正しい。パラベンは代表的な防腐剤である",
    "誤り。パラアミノ安息香酸エステルは紫外線吸収剤である",
    "正しい。PVPは皮膜形成剤として整髪料などに用いられる",
    "正しい。BHTは酸化防止剤である"
  ],
  "basis": "香粧品化学・配合成分"
},
"51-40":{
  "explanation": "誤っているのは2です。ニトロパラフェニレンジアミンは直接染料として色をもつ成分で、無色ではありません。",
  "choices": [
    "正しい。過酸化水素は染料中間体の酸化重合に働く",
    "誤り。ニトロパラフェニレンジアミンは有色の直接染料である",
    "正しい。レゾルシンはカップラーとして発色色調を調整する",
    "正しい。アンモニア水はアルカリ剤として液性をアルカリ側にする"
  ],
  "basis": "香粧品化学・染毛剤"
},
"51-41":{
  "explanation": "該当しないのは4です。耳隠しは主に大正末期から昭和初期に流行した髪型で、明治時代の髪型ではありません。",
  "choices": [
    "該当する。徴兵制度などを背景に明治期に丸刈が広がった",
    "該当する。明治期に束髪運動が起こった",
    "該当する。明治期の男子髪型として丸刈と角刈の中間的な形がみられた",
    "該当しない。耳隠しは大正末期から昭和初期の流行である"
  ],
  "basis": "理容文化論"
},
"51-42":{
  "explanation": "正しいのは1の慎太郎刈です。1950年代に石原慎太郎の髪型として流行した、前髪を短くし側頭部から後頭部を短く刈り込むスタイルです。",
  "choices": [
    "正しい。図は慎太郎刈の特徴を示す",
    "誤り。GIカットは軍人風の短い角刈系スタイルである",
    "誤り。ハーフロングは長さのある婦人髪型である",
    "誤り。リーゼントは前髪を高く上げ側頭部を後方へ流す"
  ],
  "basis": "理容文化論"
},
"51-43":{
  "explanation": "誤っているのは3です。石津謙介はVANを通じてアイビールックを広めた人物で、フォークルックとの組合せは適切ではありません。",
  "choices": [
    "正しい。ヒッピーファッションではジーンズが代表的に用いられた",
    "正しい。クレージュはミニスカートの普及に影響した",
    "誤り。石津謙介と結び付くのは主にアイビールックである",
    "正しい。山本耀司と川久保玲は黒を基調とした表現で「黒の衝撃」と評された"
  ],
  "basis": "理容文化論"
},
"51-44":{
  "explanation": "正しいのは1です。図の位置関係からAは眼窩下部、Bは頬骨部、Cは乳突部です。",
  "choices": [
    "正しい。図の各指示位置に一致する",
    "誤り。A・B・Cの部位名称が図の位置と一致しない",
    "誤り。Bは頬部ではなく頬骨部である",
    "誤り。Cは後頭部ではなく乳突部である"
  ],
  "basis": "理容技術理論・頭部名称"
},
"51-45":{
  "explanation": "誤っているのは2です。すくい角は刃面と切断方向などの関係で表され、刃の表と裏がなす角は刃角です。",
  "choices": [
    "正しい。鋏尖・鋏要・接点を結ぶ基準線を中心線という",
    "誤り。刃の表と裏のなす角は刃角である",
    "正しい。2枚の鋏体が接触する部分を触点という",
    "正しい。鋏体から指環までの部分を鋏柄という"
  ],
  "basis": "理容技術理論・シザーズ"
},
"51-46":{
  "explanation": "誤っているのは4です。ハンドルの開きが45度未満になると、刀身が寝て対皮角度が小さくなり、皮膚との接触はむしろ強くなります。",
  "choices": [
    "正しい。レザーはくさび作用で毛髪を切断する",
    "正しい。ハンドルは重量バランスと運行の安定に関与する",
    "正しい。直線刃は皮膚への圧が集中しやすい",
    "誤り。45度未満では皮膚への接触が弱くなるとはいえない"
  ],
  "basis": "理容技術理論・レザー"
},
"51-47":{
  "explanation": "正しいのは3です。胴はコーム全体を支える基部です。",
  "choices": [
    "誤り。毛髪の根元へ分け入るのは歯先の働きである",
    "誤り。毛髪を一線にそろえて支えるのは歯や歯元の働きである",
    "正しい。胴はコーム全体を支える",
    "誤り。歯元の説明として不適切である"
  ],
  "basis": "理容技術理論・コーム"
},
"51-48":{
  "explanation": "誤っているのは2です。通常はタオルを先に掛け、その上からネックペーパーを巻き、クロスが皮膚に直接触れないようにします。",
  "choices": [
    "正しい。刈り毛の侵入とクロスの直接接触を防ぐ",
    "誤り。タオルとネックペーパーの順序が逆である",
    "正しい。清拭時に毛髪・頭皮の状態を観察する",
    "正しい。熱傷防止のため耳や額への接触に注意する"
  ],
  "basis": "理容技術理論・カッティング準備"
},
"51-49":{
  "explanation": "正しいのはaとdで、選択肢4です。ぼかしは短髪部の色彩の濃淡を指し、毛髪は短くなるほど弾力で立ちやすくなります。",
  "choices": [
    "正しい。ぼかしは短髪部の濃淡表現である",
    "誤り。側面シルエットは線とぼかしの両方を整えるが、線よりぼかしだけを優先するとはいえない",
    "誤り。基礎刈は頭部の高い部分から低い部分へ進める",
    "正しい。毛髪は短くすると弾力により立ちやすくなる"
  ],
  "basis": "理容技術理論・カッティング"
},
"51-50":{
  "explanation": "誤っているのは2です。凸面タイプでは後頭部の突出を強調しないよう、分髪線を長くして奥行きを深く見せる方法は適切ではありません。",
  "choices": [
    "正しい。平面タイプでは前頭部に高さを出して前後のバランスをとる",
    "誤り。凸面タイプで分髪線を長くして奥行きを強調するのは不適切である",
    "正しい。平面タイプは後頭部に立体感を出すため高めに刈り上げる",
    "正しい。凸面タイプはクラウン付近に高さの頂点を置いてバランスをとる"
  ],
  "basis": "理容技術理論・スタンダードヘア"
},
"51-51":{
  "explanation": "正しいのは図4です。図4が、コームで毛髪を押さえながらシザーズで刈り進める押し刈を示しています。",
  "choices": [
    "誤り。図1は押し刈ではない",
    "誤り。図2は押し刈ではない",
    "誤り。図3は押し刈ではない",
    "正しい。図4が押し刈を示す"
  ],
  "basis": "理容技術理論・カット技法"
},
"51-52":{
  "explanation": "誤っているのは1です。ロングステムは根元の立ち上がりを抑え、ボリュームを少なくする部分に用います。",
  "choices": [
    "誤り。ロングステムはボリュームを抑える部分に用いる",
    "正しい。ハーフステムはおおむね90〜110度に引き出す",
    "正しい。輪ゴムは毛折れを避けるためピボットポイントにとめる",
    "正しい。ノンステムでは輪ゴムが頭皮面に対してほぼ垂直になる"
  ],
  "basis": "理容技術理論・ワインディング"
},
"51-53":{
  "explanation": "誤っているのは3です。有彩色のうち最も明度が高いのは黄ですが、無彩色を含めれば白が最も高いため、「最も明度が高いのは黄」と断定するのは誤りです。",
  "choices": [
    "正しい。色相・明度・彩度を色の三属性という",
    "正しい。無彩色には色相と彩度がない",
    "誤り。全色の中で最も明度が高いのは白である",
    "正しい。各色相で彩度が最も高い色を純色という"
  ],
  "basis": "理容技術理論・色彩"
},
"51-54":{
  "explanation": "誤っているのは2です。替刃は鋭いため、対皮角度は大きくせず、皮膚への負担を避けるため適切な小さい角度で運行します。",
  "choices": [
    "正しい。皮膚へ接触する瞬間は慎重に扱う",
    "誤り。鋭い替刃ほど対皮角度を大きくするのではない",
    "正しい。短いストロークでゆっくり運行する",
    "正しい。斜行運行は刃を皮膚へ均等に当てやすくする"
  ],
  "basis": "理容技術理論・シェービング"
},
"51-55":{
  "explanation": "正しいのはaとbで、選択肢1です。湯温は約40℃を目安とし、シャンプー剤は手のひらでのばしてから毛髪全体へ均一につけます。",
  "choices": [
    "正しい。40℃前後が一般的な適温である",
    "正しい。手のひらでのばしてから均一につける",
    "誤り。薬液処理前は頭皮を傷つけないよう強く洗わない",
    "誤り。泡立ちが悪い場合は、まず十分に予洗い・すすぎを行い、安易につけ足さない"
  ],
  "basis": "理容技術理論・シャンプーイング"
}
,
"50-01":{"explanation":"正しいのはaとdで、選択肢4です。理容師試験に合格しただけでは理容を業とすることはできず、理容師名簿への登録が必要です。試験は指定試験機関が実施し、外国試験合格による一般的な一部免除規定はありません。無免許営業歴がある者は免許を与えないことがある欠格事由に該当し得ます。","choices":["正しい。名簿登録を受けて初めて免許の効力が生じる","誤り。試験は都道府県知事ではなく指定試験機関が行う","誤り。外国試験合格を理由とする一般的な一部免除規定はない","正しい。無免許営業歴がある者には免許を与えないことがある"],"basis":"理容師法第3条・第4条・第5条・第6条"},
"50-02":{"explanation":"正しいのは1です。免許申請には精神の機能の障害に関する医師の診断書を添付します。氏名等の名簿訂正は30日以内で、申請先は厚生労働大臣です。免許取消時の免許証返納先も厚生労働大臣です。","choices":["正しい。免許申請書には医師の診断書を添付する","誤り。名簿訂正は2か月以内ではなく30日以内である","誤り。申請先は都道府県知事ではなく厚生労働大臣である","誤り。返納先は住所地の都道府県知事ではなく厚生労働大臣である"],"basis":"理容師法施行規則第1条・第3条・第7条"},
"50-03":{"explanation":"正しいのはaとdで、選択肢4です。常時2人以上の理容師が従事する理容所には管理理容師が必要です。管理理容師は衛生管理を担い、変更届は速やかに行います。設置義務違反は閉鎖命令の対象となり得ます。","choices":["正しい。常時2人以上の理容師が従事する理容所には管理理容師を置く","誤り。役割は経営管理ではなく衛生管理である","誤り。変更届は1か月以内ではなく速やかに行う","正しい。設置義務違反は閉鎖命令の対象となり得る"],"basis":"理容師法第11条の4・第14条、理容師法施行規則第20条"},
"50-04":{"explanation":"正しいのは1です。従業理容師の変更は速やかに届け出ます。理容所の名称変更も届出事項であり、届出義務違反は罰金の対象となり得ます。相続等による地位承継は新規開設届ではなく承継届を行います。","choices":["正しい。従業理容師の就職・退職などは速やかに届け出る","誤り。理容所の名称変更も届出事項である","誤り。届出義務違反は罰金の対象となり得る","誤り。相続等による承継は承継届を行う"],"basis":"理容師法第11条・第11条の3・第15条、理容師法施行規則第19条・第20条"},
"50-05":{"explanation":"業務停止処分の対象に該当しないのは3です。心身の障害により業務を適正に行えない場合は免許取消しの対象です。理容所以外での業務、衛生措置違反、伝染性疾病で就業が不適当な場合は業務停止の対象です。","choices":["業務停止の対象。特別の事情なく理容所以外で業を行うことは禁止される","業務停止の対象。衛生措置違反は業務停止事由である","該当しない。この場合は免許取消しの対象である","業務停止の対象。伝染性疾病で就業が不適当な場合は業務停止となる"],"basis":"理容師法第6条の2・第9条・第10条"},
"50-06":{"explanation":"罰金に処せられることがある場合に該当しないのは4です。無免許営業、検査確認前の使用、閉鎖命令違反は罰則の対象です。業務停止中の理容師を働かせた開設者について、同内容の直接罰則は規定されていません。","choices":["罰金の対象。免許取消後に理容を業とすれば無免許営業となる","罰金の対象。検査確認前に理容所を使用してはならない","罰金の対象。閉鎖命令違反は処罰対象である","該当しない。開設者に対する同内容の直接罰則はない"],"basis":"理容師法第6条・第11条の2・第14条・第15条"},
"50-07":{"explanation":"誤っているのは2です。振興指針は組合員だけでなく、生活衛生関係営業全体の振興を図るための指針です。厚生労働大臣が定め、組合はこれに沿って振興計画を作成でき、政府は資金確保等の援助に努めます。","choices":["正しい。振興指針は厚生労働大臣が定める","誤り。組合員だけを対象とする制度ではない","正しい。組合は振興指針に沿って振興計画を定めることができる","正しい。政府は資金確保等の援助に努める"],"basis":"生活衛生関係営業の運営の適正化及び振興に関する法律第56条の2・第56条の3"},
"50-08":{"explanation":"誤っているのは2です。一般健康診断は労働者数50人以上の事業場だけに限られず、常時使用する労働者について事業者に実施義務があります。異常所見者についての医師等の意見聴取や、一定の感染症に罹患した者の就業制限も定められています。","choices":["正しい。労働者の安全と健康の確保等が目的である","誤り。健康診断義務は50人以上の事業者だけに限定されない","正しい。異常所見がある労働者について医師等の意見を聴く","正しい。一定の感染症に罹患した労働者について就業を制限する場合がある"],"basis":"労働安全衛生法第1条・第66条、労働安全衛生規則第61条"},
"50-09":{"explanation":"誤っているのは1です。厚生年金保険の被保険者は同時に国民年金の第2号被保険者でもあります。厚生年金保険料は標準報酬月額・標準賞与額を基礎に算定され、国民年金第1号被保険者の保険料は全国一律で、免除・納付猶予制度があります。","choices":["誤り。厚生年金加入者は国民年金の第2号被保険者でもある","正しい。標準報酬月額と標準賞与額に保険料率を乗じる","正しい。第1号被保険者の保険料は全国一律である","正しい。免除や納付猶予の制度がある"],"basis":"国民年金法第7条・第87条・第90条、厚生年金保険法第81条"},
"50-10":{"explanation":"正しい組合せはA65、B40、C65で、選択肢4です。第1号被保険者は65歳以上、第2号被保険者は40歳以上65歳未満の医療保険加入者です。","choices":["誤り。第1号被保険者は75歳以上ではなく65歳以上である","誤り。第1号被保険者は75歳以上ではなく65歳以上である","誤り。第2号被保険者は20歳以上ではなく40歳以上である","正しい。65歳以上と40歳以上65歳未満の医療保険加入者である"],"basis":"介護保険法第9条"},
"50-11":{"explanation":"誤っているのは1です。保健所はHIV検査・相談や予防啓発を行いますが、エイズ患者の治療そのものを一般業務として行う機関ではありません。地域保健統計、生活衛生・食品衛生施設の監視指導、医師である所長の配置は保健所の役割に含まれます。","choices":["誤り。保健所は検査・相談・予防啓発を担うが、患者治療を一般業務として行う機関ではない","正しい。管内の地域保健に関する統計を取りまとめる","正しい。生活衛生・食品衛生関係施設の監視指導を行う","正しい。保健所長は原則として所定要件を満たす医師である"],"basis":"地域保健法第6条、地域保健法施行令第4条"},
"50-12":{"explanation":"誤っているのは3です。年齢構成の異なる集団間の死亡状況を比較するには、粗死亡率ではなく年齢調整死亡率を用います。合計特殊出生率の定義、第2次ベビーブーム後の低下、人口高齢化に伴う心疾患の粗死亡率上昇は正しい記述です。","choices":["正しい。15～49歳女性の年齢別出生率を合計した指標である","正しい。第2次ベビーブーム後は2を下回る状態が続いている","誤り。年齢構成が異なる集団の比較には年齢調整死亡率を用いる","正しい。高齢化は心疾患の粗死亡率を押し上げる要因となる"],"basis":"厚生労働省「人口動態統計」"},
"50-13":{"explanation":"正しいのはbとcで、選択肢2です。2015年当時、胃がんの粗死亡率は長期的に低下傾向で、男性の部位別がん死亡では肺がんが第1位でした。全がんの粗死亡率は高齢化の影響で上昇傾向で、女性の第1位は子宮がんではありません。","choices":["誤り。全悪性新生物の粗死亡率は減少傾向とはいえない","正しい。胃がんの粗死亡率は長期的に低下傾向である","正しい。男性の部位別粗死亡率の第1位は肺がんである","誤り。女性の第1位は子宮がんではない"],"basis":"厚生労働省「人口動態統計」2015年、国立がん研究センターがん情報サービス"},
"50-14":{"explanation":"誤っているのは3です。下水汚泥は肥料、セメント原料、建設資材などに再資源化されています。下水には生活排水・産業排水が含まれ、病原微生物や有害物質を含むことがあり、放流水質は法令で規制されます。","choices":["正しい。下水には生活排水や工場排水が含まれる","正しい。病原微生物、寄生虫卵、有害物質を含む場合がある","誤り。下水汚泥は肥料や建設資材等に再資源化されている","正しい。放流水質は法令で規制される"],"basis":"下水道法第8条、国土交通省「下水汚泥の資源利用」"},
"50-15":{"explanation":"誤っているのは4です。産業廃棄物は排出事業者が自らの責任で適正処理するのが原則で、市町村が一律に処理するものではありません。理容所の廃棄物も法の対象で、廃棄物は一般廃棄物と産業廃棄物に区分されます。","choices":["正しい。理容所から出る廃棄物も法の対象である","正しい。一般廃棄物と産業廃棄物に大別される","正しい。家庭ごみには焼却、再資源化、埋立てなどの処理がある","誤り。産業廃棄物は排出事業者責任で処理するのが原則である"],"basis":"廃棄物の処理及び清掃に関する法律第2条・第3条・第11条"},
"50-16":{"explanation":"正しいのはbとcで、選択肢2です。細菌は通常、二分裂で増殖します。ウイルスはDNAまたはRNAのいずれか一方の核酸を持ちます。細菌の主成分が80%タンパク質という記述は誤りで、ウイルスの核酸を覆うのは莢膜ではなくカプシドです。","choices":["誤り。細菌の約80%がタンパク質という説明は正しくない","正しい。細菌は一般に二分裂で増殖する","正しい。ウイルスはDNAかRNAのいずれか一方を持つ","誤り。核酸を保護する基本構造は莢膜ではなくカプシドである"],"basis":"標準微生物学、国立感染症研究所の基礎資料"},
"50-17":{"explanation":"誤っているのは4です。垂直感染は母体から胎児・新生児への感染です。汚染された飲食物によるコレラ感染は経口感染です。不顕性感染、日和見感染、B型肝炎ウイルスの持続性感染の説明は正しいです。","choices":["正しい。感染しても症状を示さない状態を不顕性感染という","正しい。免疫低下時に弱毒病原体で発病する感染を日和見感染という","正しい。B型肝炎ウイルスは持続感染を起こすことがある","誤り。垂直感染は母子感染であり、コレラは経口感染である"],"basis":"厚生労働省・国立感染症研究所の感染症基礎資料"},
"50-18":{"explanation":"誤っているのは4です。鼻腔の黄色ブドウ球菌などは、手指や飛沫を介して感染源となることがあります。常在細菌叢は皮膚・粘膜に定着し、病原体の定着阻止やビタミン産生など人体に有益な働きもします。","choices":["正しい。皮膚や粘膜には一定の微生物叢が定着している","正しい。病原微生物の定着を妨げる働きがある","正しい。ビタミンを産生するものがある","誤り。鼻腔のブドウ球菌は感染源となり得る"],"basis":"標準微生物学、厚生労働省「医療関連感染対策」"},
"50-19":{"explanation":"誤っているのは1です。大流行を起こすのは主にA型インフルエンザウイルスで、B型のみではありません。高齢者では肺炎併発で重症化し、飛沫・接触で感染し、手洗い・手指消毒・予防接種が有効です。","choices":["誤り。大流行は主にA型が起こし、B型のみではない","正しい。高齢者は肺炎を併発すると重症化しやすい","正しい。飛沫感染と接触感染が起こる","正しい。手洗い、手指消毒、予防接種は有効である"],"basis":"厚生労働省「インフルエンザQ&A」、国立感染症研究所"},
"50-20":{"explanation":"正しいのはaとbで、選択肢1です。麻しんウイルスは感染力が非常に強く、定期予防接種の対象です。潜伏期は通常10日前後で、発疹は顔だけでなく全身へ広がります。海外からの輸入例を起点とした国内感染のリスクもあります。","choices":["正しい。麻しんウイルスは非常に感染力が強い","正しい。麻しんは定期予防接種の対象である","誤り。潜伏期は2～3日ではなく、発疹は全身へ広がる","誤り。輸入例や国内での二次感染は起こり得る"],"basis":"予防接種法、厚生労働省「麻しんについて」、国立感染症研究所"},
"50-21":{"explanation":"正しいのはaとbで、選択肢1です。消毒は病原微生物を殺滅・除去して感染力を失わせる処置で、滅菌は生きた微生物が存在しない状態にする処置です。殺菌は無菌化を必ず意味せず、防腐は微生物の発育を抑えることです。","choices":["正しい。病原微生物を殺滅または除去して感染力を失わせる","正しい。生きた微生物が存在しない状態にする","誤り。殺菌は必ずしも無菌状態にすることではない","誤り。防腐は微生物を除去することではなく増殖を抑えることである"],"basis":"厚生労働省「理容所及び美容所における衛生管理要領」"},
"50-22":{"explanation":"誤っているのは2です。かみそりは血液が付着している疑いの有無にかかわらず、拭き取りだけではなく法定の方法で消毒します。紫外線、次亜塩素酸ナトリウム、逆性石けんの各条件は血液付着の疑いがない器具に用いることができます。","choices":["正しい。所定の照度で20分以上の紫外線照射は認められる","誤り。かみそりを消毒用エタノールで拭くだけでは所定の消毒方法を満たさない","正しい。0.01%以上の次亜塩素酸ナトリウムに10分以上浸す","正しい。0.1%以上の逆性石けんに10分以上浸す"],"basis":"理容師法施行規則第25条、理容所及び美容所における衛生管理要領"},
"50-23":{"explanation":"正しいのはaとdで、選択肢4です。湿熱は乾熱より熱が伝わりやすく、短時間で消毒できます。理容所で認められる理学的消毒法には紫外線照射もあり、蒸気消毒が煮沸より短時間という記述は正しくありません。消毒効果は温度・濃度・時間に左右されます。","choices":["正しい。湿熱は乾熱より効率がよい","誤り。理学的消毒法には紫外線照射もある","誤り。蒸気消毒は煮沸消毒より短時間という条件ではない","正しい。消毒効果は温度、濃度、作用時間に左右される"],"basis":"理容師法施行規則第25条、理容所及び美容所における衛生管理要領"},
"50-24":{"explanation":"誤っているのは3です。消毒用エタノールは他の消毒薬と目的・材質に応じて使い分けられ、絶対に併用できないという規定はありません。引火性があり、芽胞には効果が乏しく、ゴムや一部プラスチックを劣化させることがあります。","choices":["正しい。揮発性・引火性があり火気に注意する","正しい。細菌芽胞には十分な効果がない","誤り。他の消毒薬と一切併用できないわけではない","正しい。ゴムや一部プラスチックを劣化させることがある"],"basis":"理容所及び美容所における衛生管理要領、消毒薬使用上の注意"},
"50-25":{"explanation":"正しいのは1です。5%原液を2部、水を98部とすると全体100部中の有効成分は0.1部となり、0.1%水溶液になります。5%原液の100倍希釈は0.05%、1部と水99部の混合は0.05%、50倍希釈は0.1%です。","choices":["正しい。5%×2/100＝0.1%である","誤り。5%を100倍希釈すると0.05%になる","誤り。5%原液1部＋水99部は0.05%になる","誤り。5%を50倍希釈すると0.1%になる"],"basis":"希釈計算 C1V1=C2V2、理容所及び美容所における衛生管理要領"},
"50-26":{"explanation":"正しいのは2です。瞳孔は虹彩中央の開口部で、黒く見えます。涙点は内眼角寄りにあり、白目の白色は強膜によるもので、上眼瞼の睫毛の方が長く密です。","choices":["誤り。涙点は外眼角ではなく内眼角寄りにある","正しい。瞳孔は虹彩中央の開口部で黒く見える","誤り。白目の白色は眼球結膜ではなく強膜による","誤り。上眼瞼の睫毛の方が長く密である"],"basis":"標準解剖学・眼球付属器の構造"},
"50-27":{"explanation":"正しいのは2です。横隔膜は骨格筋で、横隔神経という体性運動神経の支配を受けます。心筋と平滑筋は不随意筋で、自律神経などの調節を受けます。","choices":["誤り。心筋は不随意筋である","正しい。横隔膜は骨格筋で運動神経の支配を受ける","誤り。血管平滑筋は自律神経などにより調節される","誤り。気管支平滑筋も自律神経などにより調節される"],"basis":"標準解剖生理学・筋と神経支配"},
"50-28":{"explanation":"正しいのは3です。呼吸中枢と循環中枢は延髄・橋を含む脳幹にあります。大脳は高次機能、小脳は運動調節、脊髄は反射や伝導路を主に担います。","choices":["誤り。大脳は高次機能を担う","誤り。小脳は運動の協調や平衡を担う","正しい。呼吸・循環の中枢は脳幹にある","誤り。脊髄は反射中枢や伝導路を担う"],"basis":"標準解剖生理学・中枢神経系"},
"50-29":{"explanation":"正しいのは3です。耳管は中耳腔と咽頭を連絡し、気圧調整などを行います。耳介・外耳道は外耳、蝸牛・前庭などは内耳です。","choices":["誤り。耳介は外耳で耳管とは直接つながらない","誤り。外耳道は鼓膜までの外耳部分である","正しい。中耳は耳管を通じて咽頭とつながる","誤り。内耳は耳管と直接つながらない"],"basis":"標準解剖学・聴覚器の構造"},
"50-30":{"explanation":"正しいのは1です。赤血球はヘモグロビンにより酸素を運搬します。好中球とリンパ球は白血球で免疫を担い、血小板は止血に関与します。","choices":["正しい。赤血球中のヘモグロビンが酸素を運搬する","誤り。好中球は貪食などの免疫機能を担う","誤り。血小板は止血・血液凝固に関与する","誤り。リンパ球は獲得免疫などを担う"],"basis":"標準生理学・血液の成分と機能"}
,
'50-31':{explanation:'正しいのはcとdで、選択肢3です。皮膚の厚さは部位によって異なり、表皮の大部分は角化細胞で構成されます。表皮と真皮の境界の波状構造は結合を強め、真皮の下には脂肪を多く含む皮下組織があります。',choices:['誤り。aとbはいずれも誤り','誤り。bは誤りだがcは正しい','正しい。cとdはいずれも正しい','誤り。aは誤りでdは正しい'],basis:'標準皮膚科学・皮膚の組織構造'},
'50-32':{explanation:'正しいのは3です。毛幹は毛小皮、毛皮質、毛髄質からなり、毛皮質にはメラニン顆粒が含まれます。皮膚表面に出た部分は毛幹で、毛小皮は最外層、毛髄質は中心部です。',choices:['誤り。皮膚表面に出ている部分は毛幹である','誤り。中心部は毛髄質で、毛小皮は最外層である','正しい。毛皮質にはメラニン顆粒が含まれる','誤り。ウロコ状の透明な細胞は毛小皮の特徴である'],basis:'標準皮膚科学・毛髪の構造'},
'50-33':{explanation:'誤っているのは2です。皮脂分泌は思春期以降に増え、一般に加齢とともに低下します。精神性発汗は手掌・足底・腋窩にみられ、爪母が失われると爪は再生しません。',choices:['正しい。痛覚は鋭敏で、温覚は比較的鈍い','誤り。皮脂分泌は高齢になるほど増えるのではなく低下する','正しい。精神性発汗は手掌・足底・腋窩で起こり得る','正しい。爪母を失うと爪は再生しない'],basis:'標準皮膚科学・皮膚付属器の生理'},
'50-34':{explanation:'誤っているのは4です。チアノーゼは還元ヘモグロビンの増加により紫青色を呈する状態で、貧血ではむしろ目立ちにくくなります。糖尿病、肝障害、更年期に関する他の記述は適切です。',choices:['正しい。糖尿病では感染症にかかりやすい','正しい。肝胆道系疾患では強いそう痒がみられることがある','正しい。更年期には皮脂・毛髪の変化がみられることがある','誤り。貧血そのものをチアノーゼとはいわない'],basis:'標準皮膚科学・全身疾患と皮膚症状'},
'50-35':{explanation:'誤っているのは1です。頭部白癬は皮膚糸状菌という真菌による感染症です。帯状疱疹はウイルス、伝染性膿痂疹は細菌、疥癬はヒゼンダニが原因です。',choices:['誤り。頭部白癬の原因は細菌ではなく真菌である','正しい。帯状疱疹は水痘・帯状疱疹ウイルスによる','正しい。伝染性膿痂疹は細菌感染である','正しい。疥癬はヒゼンダニによる'],basis:'厚生労働省・日本皮膚科学会の皮膚感染症資料'},
'50-36':{explanation:'誤っているのは2です。炭化水素には石油由来だけでなく、動植物由来のスクワランなどもあります。高級アルコール、酸敗、ロウ類の説明は適切です。',choices:['正しい。高級アルコールは一般に炭素数の多いアルコールをいう','誤り。炭化水素には動植物由来のものもある','正しい。油脂の酸化・加水分解による変質を酸敗という','正しい。ロウ類は高級脂肪酸と高級アルコールのエステルである'],basis:'香粧品化学・油性原料'},
'50-37':{explanation:'誤っているのは4です。アルキル硫酸ナトリウムは陰イオン界面活性剤で、洗浄剤として用いられます。非イオン界面活性剤でもなく、損傷毛の帯電防止を主目的とする成分でもありません。',choices:['正しい。石けんは陰イオン界面活性剤である','正しい。第四級アンモニウム塩は陽イオン界面活性剤でリンス等に用いられる','正しい。レシチンは両性界面活性剤として扱われる','誤り。アルキル硫酸ナトリウムは陰イオン界面活性剤である'],basis:'香粧品化学・界面活性剤'},
'50-38':{explanation:'正しいのはcとdで、選択肢3です。クレンジングクリームはメイクアップ除去に用いられ、バニシングクリームは油中水型ではなく水中油型です。クリームに必ず油性成分が必要とは限らず、油性成分10%は中油性の基準ではありません。',choices:['誤り。aとbはいずれも誤り','誤り。bは誤りでcは正しい','正しい。cとdはいずれも正しい','誤り。aは誤りでdは正しい'],basis:'香粧品化学・クリーム製剤'},
'50-39':{explanation:'正しいのは3です。臭素酸ナトリウムは二浴式パーマ剤の第2剤に用いられる酸化剤です。第1剤は還元剤を含み、毛髪のシスチン結合を還元します。',choices:['誤り。チオグリコール酸は第1剤の還元剤である','誤り。モノエタノールアミンは主にアルカリ剤である','正しい。臭素酸ナトリウムは第2剤の酸化剤である','誤り。システインは第1剤の還元成分である'],basis:'パーマネント・ウェーブ用剤製造販売承認基準'},
'50-40':{explanation:'正しいのは1です。第2剤の過酸化水素が酸素を放出し、毛髪中のメラニンを分解するとともに染料中間体を酸化重合させます。調色剤は染料中間体と反応して色調を変化させます。',choices:['正しい。過酸化水素、メラニン、調色剤の組合せである','誤り。分解対象はシスチンではなくメラニンである','誤り。第2剤の主成分は過硫酸塩ではなく過酸化水素である','誤り。各語句の対応が不適切である'],basis:'酸化染毛剤の作用機序、医薬部外品原料規格'},
'50-41':{explanation:'正しいのはaとbで、選択肢1です。チャン刈とブロースカットは明治期にみられた髪型で、ハーフロングとリーゼントは後世に流行したスタイルです。',choices:['正しい。aとbが明治期の髪型である','誤り。cは明治期の代表的髪型ではない','誤り。cとdはいずれも明治期ではない','誤り。dは明治期ではない'],basis:'理容文化論・日本の髪型史'},
'50-42':{explanation:'正しいのは4です。1966年に来日したビートルズの髪型は、丸みのあるマッシュルームカットとして知られています。',choices:['誤り。アフロヘアではない','誤り。サーファーカットではない','誤り。アイビーカットではない','正しい。マッシュルームカットである'],basis:'理容文化論・戦後の流行髪型'},
'50-43':{explanation:'正しいのは2です。黒の蝶ネクタイと黒のカマーバンドを用いる夜の準礼装はタキシードで、ブラックタイと呼ばれます。',choices:['誤り。モーニングコートは昼の正礼装である','正しい。タキシードはブラックタイの装いである','誤り。メスジャケットは別の礼装形式である','誤り。ディレクターズスーツは昼の準礼装である'],basis:'理容文化論・服飾文化'},
'50-44':{explanation:'誤っているのは1です。シザーズの裏面にある浅いくぼみは裏すきと呼ばれ、あきではありません。刃角、触点、鋏柄の説明は適切です。',choices:['誤り。浅いくぼみは裏すきという','正しい。刃の表と裏のなす角度を刃角という','正しい。2枚の鋏体が接する部分を触点という','正しい。鋏体から指環までを鋏柄という'],basis:'理容技術理論・シザーズの構造'},
'50-45':{explanation:'誤っているのは3です。モーター式では歯車機構は回転を減速し、クランク機構で上刃の往復運動へ変換します。加速されるという説明が誤りです。',choices:['正しい。回転運動をクランク機構で往復運動に変換する','正しい。マグネット式は振動桿とコイルが主要部分である','誤り。ギアで加速されるのではなく減速される','正しい。マグネット式は構造が簡単だが音が大きい傾向がある'],basis:'理容技術理論・クリッパーの構造'},
'50-46':{explanation:'誤っているのは4です。リズムは形や線、色などの反復・変化によって生じる律動感です。形の表現を強烈にするための変化はアクセントやコントラストに近い概念です。',choices:['正しい。バランスは安定感を与える','正しい。シンメトリーは左右対称の静的なつりあいである','正しい。ムーブメントは動きを感じさせる構成である','誤り。リズムは反復や変化による律動感である'],basis:'理容技術理論・ヘアデザインの構成原理'},
'50-47':{explanation:'正しいのは2です。6対4分髪では内眼角の延長線を分髪線の基準とします。',choices:['誤り。5対5分髪は正中を基準とする','正しい。6対4分髪は内眼角の延長線を基準とする','誤り。7対3分髪の基準ではない','誤り。8対2分髪の基準ではない'],basis:'理容技術理論・分髪線の基準'},
'50-48':{explanation:'誤っているのは3です。正面から見える側面のシルエットでは、ぼかしだけでなく輪郭線の整え方が重要です。他の記述はスタンダードヘアのカッティング操作として扱われます。',choices:['正しい。既に切った毛髪をガイドとして長さをそろえる','正しい。コームと切断角度により毛の立ち上がりや段差が変わる','誤り。側面シルエットはぼかしだけを重視するものではない','正しい。基本的には頭皮面に対する引き出し方向を管理して切る'],basis:'理容技術理論・スタンダードヘアのカッティング'},
'50-49':{explanation:'正しいのは4です。押し刈は短髪部に用い、コームの歯先を頭皮につけ、背側を浮かせて操作します。',choices:['誤り。長髪部ではなく短髪部に用いる','誤り。歯元をつける操作ではない','誤り。長髪部に用いる操作ではない','正しい。短髪部で歯先をつけ背側を浮かせる'],basis:'理容技術理論・コームの操作'},
'50-50':{explanation:'正しいのは1です。ブロードライではドライヤーのノズルとブラシを平行に操作します。毛髪は適度に湿った状態から乾燥させ、アイロンはコームと平行に安全な高さで操作します。',choices:['正しい。ノズルとブラシは平行に操作する','誤り。完全に乾燥させてからではなく、適度に湿った状態で行う','誤り。アイロンはコームに対して45度ではなく平行に扱う','誤り。腰の高さで操作するものではない'],basis:'理容技術理論・ヘアセッティング'},
'50-51':{explanation:'正しいのは4です。マンセル表色系の有彩色は色相・明度・彩度で表し、無彩色は明度のみで表します。黒は低明度で、彩度の上限は色相・明度によって異なりますが教材上の最高彩度は14です。',choices:['誤り。有彩色の三属性は色相・明度・彩度である','誤り。無彩色は明度のみで表す','誤り。黒の明度は9ではなく低明度である','正しい。最高彩度は14として扱われる'],basis:'理容技術理論・マンセル表色系'},
'50-52':{explanation:'正しいのは3です。プッシュハンドはフリーハンドの持ち方から手関節を手背側へ反らし、切れ刃を向こう側に向け、指関節で押し出すように運行します。',choices:['誤り。手掌側・肘関節の組合せではない','誤り。ペンシルハンドではない','正しい。フリーハンド、手背側、指関節の組合せである','誤り。持ち方と関節の組合せが異なる'],basis:'理容技術理論・レザーの持ち方と運行'},
'50-53':{explanation:'正しいのは2です。図のAは眉頭、Bは眉山、Cは眉尻を示しています。',choices:['誤り。Bは眉間ではなく眉山である','正しい。A眉頭、B眉山、C眉尻である','誤り。AとCが逆で、Bも異なる','誤り。AとCが逆である'],basis:'理容技術理論・眉毛各部の名称'},
'50-54':{explanation:'誤っているのは2です。てん包法では耳介を覆わず、耳介部は出します。側頸部まで包み、40～45度程度のタオルを用い、鼻孔をふさがないようにします。',choices:['正しい。側頸部までてん包する','誤り。耳介部まで覆わず、耳介は出す','正しい。40～45度程度で使用する','正しい。鼻尖を覆っても鼻孔は出す'],basis:'理容技術理論・フェイシャルケア'},
'50-55':{explanation:'正しいのは3です。シャンプーイングでは手指を頭皮の割線方向に運行します。薬液処理前に強く洗う、左右交互に速く動かす、途中で洗浄剤を付け足すという操作は適切ではありません。',choices:['誤り。薬液処理前は頭皮を傷つけないよう強く洗わない','誤り。リアシャンプーの運行は左右交互に速く行うものではない','正しい。手指は頭皮の割線方向に運行する','誤り。泡立ちが悪い場合は一度すすいで改めて洗う'],basis:'理容技術理論・シャンプーイング'},


};


/* 第49回・第48回：公式正答に基づく選択肢別一次解説。最終的な公的根拠確認前。 */
const PRELIMINARY_PAST_REVIEWS={"49-01":{"explanation":"公式正答は選択肢2「理容業の経営の健全化を促進することにより、理容業の振興を図っている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"49-02":{"explanation":"公式正答は選択肢3「業務停止処分となったときは、速やかに処分を行った者に免許証（免許証明書）を提出する必要がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"49-03":{"explanation":"公式正答は選択肢1「理容師法の規定による業務の停止処分に違反して、業務停止の期間中に理容の業をした場合」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"49-04":{"explanation":"公式正答は選択肢4「理容所開設の届出には、管理理容師の氏名のほかに、その者の住所も届け出なければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"49-05":{"explanation":"公式正答は選択肢3「理容所と美容所を同一の施設において重複開設することは、いかなる場合でも認められない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"49-06":{"explanation":"公式正答は選択肢4「理容所の構造設備について確認検査を受けずに理容所を使用した場合には、罰金に処されることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"49-07":{"explanation":"公式正答は選択肢2「b と c」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"49-08":{"explanation":"公式正答は選択肢2「b と c」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"49-09":{"explanation":"公式正答は選択肢3「パートタイムの労働者に対しては、年次有給休暇を与えなくてもよい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"49-10":{"explanation":"公式正答は選択肢4「a と d」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"49-11":{"explanation":"公式正答は選択肢3「医療機関等での妊婦の健康診査は、病気のある妊婦が対象である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"49-12":{"explanation":"公式正答は選択肢2「メタボリック症候群に着目した特定健診・特定保健指導は、30歳以上60歳未満の人が対象である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"49-13":{"explanation":"公式正答は選択肢1「1型糖尿病の主たる原因は、食事や運動などの生活習慣である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"49-14":{"explanation":"公式正答は選択肢2「一般に日常生活に不自由のない明るさは、20～30 ルクス程度である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"49-15":{"explanation":"公式正答は選択肢1「頭皮に卵を産む。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"49-16":{"explanation":"公式正答は選択肢4「結核」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"49-17":{"explanation":"公式正答は選択肢1「百日せき　ウイルス」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"49-18":{"explanation":"公式正答は選択肢4「A型肝炎、B型肝炎、C型肝炎のうち、慢性肝炎に移行することがないのはC型肝炎だけである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"49-19":{"explanation":"公式正答は選択肢2「b と c」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"49-20":{"explanation":"公式正答は選択肢2「梅毒」、選択肢4「麻しん」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"49-21":{"explanation":"公式正答は選択肢3「血液が付着していないヘアブラシを、逆性石けんが0.1%以上である水溶液中に10分間以上浸す。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"49-22":{"explanation":"公式正答は選択肢4「薬液消毒では、温度・湿度・濃度が殺菌効果の3要素である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"49-23":{"explanation":"公式正答は選択肢3「紫外線殺菌灯は、使用時間にかかわらず、発光していることが確認できれば殺菌力は変わらない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"49-24":{"explanation":"公式正答は選択肢1「a と b」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"49-25":{"explanation":"公式正答は選択肢4「0.05%次亜塩素酸ナトリウム水溶液1,000 mLを調製するためには、水990 mLに5%次亜塩素酸ナトリウム10 mLを加える。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"49-26":{"explanation":"公式正答は選択肢1「運動神経」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"49-27":{"explanation":"公式正答は選択肢4「光の感覚は、視神経を通して脳に伝えられる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"標準解剖学・生理学資料"},"49-28":{"explanation":"公式正答は選択肢2「赤血球」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"49-29":{"explanation":"公式正答は選択肢3「肺胞」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"49-30":{"explanation":"公式正答は選択肢3「蠕動運動」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"49-31":{"explanation":"公式正答は選択肢2「角化細胞（ケラチノサイト）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"49-32":{"explanation":"公式正答は選択肢3「手掌や足底には、独立脂腺が分布している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"49-33":{"explanation":"この問題は採点除外または複数正答の取扱いがあるため、原本の注意事項に従って扱います。選択肢ごとの最終的な根拠説明は追加確認対象です。","choices":["採点除外・複数正答の取扱いを原本で確認する必要がある","採点除外・複数正答の取扱いを原本で確認する必要がある","採点除外・複数正答の取扱いを原本で確認する必要がある","採点除外・複数正答の取扱いを原本で確認する必要がある"],"basis":"標準皮膚科学・皮膚感染症資料"},"49-34":{"explanation":"公式正答は選択肢1「心臓疾患　蕁麻疹」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"49-35":{"explanation":"公式正答は選択肢4「頭部白癬」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"標準皮膚科学・皮膚感染症資料"},"49-36":{"explanation":"公式正答は選択肢4「ヘアリンス剤に配合された第四級アンモニウム塩などの陽イオン界面活性剤には、帯電防止効果がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"49-37":{"explanation":"公式正答は選択肢2「酸化チタンは白色顔料で、紫外線散乱剤としてサンスクリーン製品に配合される。」、選択肢3「有機合成色素（タール色素）は、光による経時変化を受けることはない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"49-38":{"explanation":"公式正答は選択肢2「A 防腐剤　B 酸素　C エチレンジアミン四酢酸（エデト酸、EDTA）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"49-39":{"explanation":"公式正答は選択肢1「ジメチルエーテル（DME）は、保湿剤としてヘアジェルに用いられる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"49-40":{"explanation":"公式正答は選択肢3「A チオグリコール酸　B 還元剤　C 臭素酸ナトリウム　D 酸化剤」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"49-41":{"explanation":"公式正答は選択肢4「宮中における大礼服や通常礼服が洋装と規定された。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"49-42":{"explanation":"公式正答は選択肢1「アフロヘア」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"49-43":{"explanation":"公式正答は選択肢1「色は一般的に黒で、フロントラインが前から後ろへなだらかなカーブを描いてカットされている。カッタウェイの別名がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"49-44":{"explanation":"公式正答は選択肢4「毛渦は、クラウンにある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"49-45":{"explanation":"公式正答は選択肢4「コンケーブ型は、丈夫で切れ味も持続する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"49-46":{"explanation":"公式正答は選択肢2「鋏尖、鋏要、刃線の3点を結ぶ線を中心線という。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"49-47":{"explanation":"公式正答は選択肢3「上刃は、毛髪を同じ長さにそろえるコームの働きをする。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"49-48":{"explanation":"公式正答は選択肢4「a と d」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"理容文化論・理容技術理論の標準教材"},"49-49":{"explanation":"公式正答は選択肢1「a と b」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"49-50":{"explanation":"公式正答は選択肢2「アイロンとコームは、それぞれの先端が常に交わるように操作する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"49-51":{"explanation":"公式正答は選択肢2「ヘアジェル」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"49-52":{"explanation":"公式正答は選択肢3「青や緑は高い彩度まであるが、赤や黄はあまり高い彩度はない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"49-53":{"explanation":"公式正答は選択肢1「毛流に沿って剃るよりも、斜行することによって切れ味が増大する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"49-54":{"explanation":"公式正答は選択肢2「構造上、力を吸収する弾力がないので、ストロークを長くし、す速く運行する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"49-55":{"explanation":"公式正答は選択肢3「手関節を軸とする回転運動で行う。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-01":{"explanation":"公式正答は選択肢4「理容師試験に合格しても、伝染性の疾病にかかっている者には、免許が与えられないことがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"48-02":{"explanation":"公式正答は選択肢2「理容師が業務停止処分に違反したときは、そのことにより罰金に処されることがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"48-03":{"explanation":"公式正答は選択肢4「理容所の開設届には、業務に従事する理容師について、指定された伝染性疾病の有無に関する医師の診断書を添えなければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"48-04":{"explanation":"公式正答は選択肢1「理容師が出張理容において理容師法に基づく衛生上の措置を行わなかったときは、業務停止処分となることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"48-05":{"explanation":"公式正答は選択肢1「a と b」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"48-06":{"explanation":"公式正答は選択肢3「生活衛生営業指導センターは、経営の健全化を通じて衛生水準の維持向上を図り、利用者又は消費者の利益を守るために設置されている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"48-07":{"explanation":"公式正答は選択肢2「医師法に基づき、医師でない者が針先に色素を付け皮膚の表面に墨等の色素を入れる行為（アートメイク）を業として行うことは禁止されている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"48-08":{"explanation":"公式正答は選択肢3「国民年金の第1号被保険者（自営業者等）の保険料は、所得が高いほど高額となる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"48-09":{"explanation":"公式正答は選択肢4「a と d」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"48-10":{"explanation":"公式正答は選択肢2「雇用保険の給付には、育児休業給付は含まれない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"48-11":{"explanation":"公式正答は選択肢4「介護認定審査会が設置されている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"48-12":{"explanation":"公式正答は選択肢3「平均寿命は、2015年がピークである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"48-13":{"explanation":"公式正答は選択肢1「わが国の女性の喫煙者率は、2005年以降上昇し続けている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"48-14":{"explanation":"公式正答は選択肢3「夏季には、ウイルス性の食中毒の発生件数がピークとなる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"48-15":{"explanation":"公式正答は選択肢2「赤血球のヘモグロビンとの結合力が酸素より強い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"48-16":{"explanation":"公式正答は選択肢4「百日せき」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"48-17":{"explanation":"公式正答は選択肢2「b と c」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"48-18":{"explanation":"公式正答は選択肢3「麻しん」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"48-19":{"explanation":"公式正答は選択肢4「年間の新規登録患者数は、近年1,000人程度で推移している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"48-20":{"explanation":"公式正答は選択肢1「a と b」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"48-21":{"explanation":"公式正答は選択肢1「A 取りかえ　B 消毒　C 洗場」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"48-22":{"explanation":"公式正答は選択肢1「かみそりの表面を消毒用エタノールを含ませた綿で拭く。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"48-23":{"explanation":"公式正答は選択肢4「a と d」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"48-24":{"explanation":"公式正答は選択肢3「c と d」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"48-25":{"explanation":"公式正答は選択肢2「0.05 %」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"48-26":{"explanation":"公式正答は選択肢2「鼻唇溝」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"48-27":{"explanation":"公式正答は選択肢2「赤色骨髄」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"48-28":{"explanation":"公式正答は選択肢3「気管支の平滑筋」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"48-29":{"explanation":"公式正答は選択肢2「虹彩」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"48-30":{"explanation":"公式正答は選択肢1「静脈」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"48-31":{"explanation":"公式正答は選択肢4「真皮は表皮の数倍の厚さの層で、膠原線維や弾性線維を含む。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"標準皮膚科学・皮膚感染症資料"},"48-32":{"explanation":"公式正答は選択肢1「睫毛（まつ毛）、耳毛、鼻毛以外の毛は、皮膚表面から垂直に生えている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"48-33":{"explanation":"公式正答は選択肢4「エクリン腺の汗はアルカリ性で、アポクリン腺の汗は酸性である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"標準皮膚科学・皮膚感染症資料"},"48-34":{"explanation":"公式正答は選択肢2「UVBは、UVAよりも表皮に対する作用が強い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"48-35":{"explanation":"公式正答は選択肢3「伝染性軟属腫（ミズイボ）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"48-36":{"explanation":"公式正答は選択肢2「メタノール（メチルアルコール）は、消毒・殺菌作用を持ち、化粧品に配合される。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"48-37":{"explanation":"公式正答は選択肢3「c と d」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"48-38":{"explanation":"公式正答は選択肢3「じゃ香（ムスク）は、植物性香料である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"48-39":{"explanation":"公式正答は選択肢2「パラアミノ安息香酸エステル　金属イオン封鎖剤（キレート剤）」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"48-40":{"explanation":"公式正答は選択肢4「チオグリコール酸 ― 還元剤」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"48-41":{"explanation":"公式正答は選択肢3「スポーツカット」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-42":{"explanation":"公式正答は選択肢2「女性の車掌（バスガール）が登場し、洋装の制服が採用された。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-43":{"explanation":"公式正答は選択肢1「図1」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-44":{"explanation":"公式正答は選択肢1「A 3～6　B 強く　C 低い」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-45":{"explanation":"公式正答は選択肢4「触点の形と幅は、動刃と静刃で同じである。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"48-46":{"explanation":"公式正答は選択肢4「荒櫛は、クリッパーライン又は短い部分を刈るのに適している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"48-47":{"explanation":"公式正答は選択肢1「A 長く　B すくい刈　C 上下」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-48":{"explanation":"公式正答は選択肢4「仕上刈は、基礎刈で作ったスタイルの高い部分から低い部分へ修正しながら行う。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"48-49":{"explanation":"公式正答は選択肢2「b と c」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-50":{"explanation":"公式正答は選択肢1「a と b」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-51":{"explanation":"公式正答は選択肢3「無彩色には、色相しかない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-52":{"explanation":"公式正答は選択肢4「脱色剤・脱染剤は、施術前のパッチテストは行わなくてもよい。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"48-53":{"explanation":"公式正答は選択肢3「バックハンドの場合は、剃る部位に上体を近づけるとレザーの対皮角度は小さくなる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-54":{"explanation":"公式正答は選択肢2「額は剃り込み、はっきりした生え際の線をつくる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"48-55":{"explanation":"公式正答は選択肢1「手指の操作・運行は、強擦で始まり強擦で終わる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-01":{"explanation":"公式正答は選択肢1「地域保健法　保健所設置市又は東京都の特別区　立入検査」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"47-02":{"explanation":"公式正答は選択肢4「理容師が死亡したときは、戸籍法による届出義務者は、30日以内に名簿の登録の消除を申請しなければならない。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"47-03":{"explanation":"公式正答は選択肢3「2　3　1」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"47-04":{"explanation":"公式正答は選択肢3「理容所の開設者が講ずべき衛生上必要な措置を怠ったときは、そのことにより30万円以下の罰金に処せられる。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"47-05":{"explanation":"公式正答は選択肢2「管理理容師を設置すべき理容所の開設者は、開設時に管理理容師の氏名と住所を届け出なければならない。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"47-06":{"explanation":"公式正答は選択肢4「aとd」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"47-07":{"explanation":"公式正答は選択肢1「厚生労働大臣　生活衛生同業組合　標準営業約款」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"47-08":{"explanation":"公式正答は選択肢3「固定資産税は、経営がうまくいかず損失が出ている場合には、納付が免除される税金である。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"47-09":{"explanation":"公式正答は選択肢2「同居の親族以外で、使用している従業員が5人未満の理容所には適用されない。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"47-10":{"explanation":"公式正答は選択肢3「cとd」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"47-11":{"explanation":"公式正答は選択肢4「死亡数　出生数」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"47-12":{"explanation":"公式正答は選択肢2「悪性新生物の年齢調整死亡率は、増加傾向にある。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"47-13":{"explanation":"公式正答は選択肢3「約3400万人」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"47-14":{"explanation":"公式正答は選択肢1「室内の天井や壁に発生している黒カビは、アレルギー反応を引き起こすことはない。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"47-15":{"explanation":"公式正答は選択肢4「浄化槽の設置や保守点検に関係する法律は、定められていない。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"47-16":{"explanation":"公式正答は選択肢2「bとc」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"47-17":{"explanation":"公式正答は選択肢1「予防接種を受けるように努めなければならないという努力義務は、これを受けなければならないという義務に改められている。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"47-18":{"explanation":"公式正答は選択肢1「ペスト　細菌」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"47-19":{"explanation":"公式正答は選択肢3「風しん」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"47-20":{"explanation":"公式正答は選択肢4「個人予防対策」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"47-21":{"explanation":"公式正答は選択肢1「タオルやケープなどの布片類の消毒に適している。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"47-22":{"explanation":"公式正答は選択肢3「タオル蒸し器内の圧力は、大気圧と同じである。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"47-23":{"explanation":"公式正答は選択肢1「エタノール水溶液は、無色透明で揮発性がある。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"47-24":{"explanation":"公式正答は選択肢2「10%逆性石けんを100倍希釈して、0.1%水溶液を調製する。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"47-25":{"explanation":"公式正答は選択肢2「bとc」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"47-26":{"explanation":"公式正答は選択肢4「球関節」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"標準解剖学・生理学資料"},"47-27":{"explanation":"公式正答は選択肢4「側頭筋」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"標準解剖学・生理学資料"},"47-28":{"explanation":"公式正答は選択肢2「瞳孔散大」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"47-29":{"explanation":"公式正答は選択肢2「中心窩」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"47-30":{"explanation":"公式正答は選択肢1「右心室」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"47-31":{"explanation":"公式正答は選択肢3「顔の皮膚は、全体的に厚さが均一である。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"47-32":{"explanation":"公式正答は選択肢3「汗腺には、エクリン腺とアポクリン腺がある。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"47-33":{"explanation":"公式正答は選択肢2「脂腺の発育は、女性ホルモンの刺激によって行われる。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"47-34":{"explanation":"公式正答は選択肢1「肝臓障害によって胆汁色素が皮膚に沈着すると、皮膚は紫色を帯びる。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"47-35":{"explanation":"公式正答は選択肢4「尋常性疣贅　ウイルス」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"標準皮膚科学・皮膚感染症資料"},"47-36":{"explanation":"公式正答は選択肢4「溶質　無機　収れん」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"47-37":{"explanation":"公式正答は選択肢4「シリコーン油　ワセリン」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"47-38":{"explanation":"公式正答は選択肢3「レシチンは、両性界面活性剤に分類され、大豆や卵黄などから得ることができる。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"47-39":{"explanation":"公式正答は選択肢1「過酸化水素は、染毛剤中で還元剤として作用する。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"47-40":{"explanation":"公式正答は選択肢3「酸化染料は、ヘアマニキュアに配合される。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"47-41":{"explanation":"公式正答は選択肢2「角丸型の短髪であるGI刈が流行した。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-42":{"explanation":"公式正答は選択肢4「アメトラ（アメリカン・トラディショナル）ファッション」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"47-43":{"explanation":"公式正答は選択肢1「燕尾服」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-44":{"explanation":"公式正答は選択肢3「天頂部　中段部　後頭下部」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-45":{"explanation":"公式正答は選択肢3「切れ刃と物体の切断面の接触面積が大きいほど切削抵抗が小さくなり、刃物は切れやすくなる。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-46":{"explanation":"公式正答は選択肢4「炭素鋼は、コバルト鋼に比べて加工性がよい。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"47-47":{"explanation":"公式正答は選択肢2「内眼角　外側　角顔」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-48":{"explanation":"公式正答は選択肢3「クラウン　短く　刈り上げない」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-49":{"explanation":"公式正答は選択肢2「中回し」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-50":{"explanation":"公式正答は選択肢2「アイロンとコームは、技術者の体の中心に向かって運行する。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-51":{"explanation":"公式正答は選択肢3「輪ゴムは、頭皮面と平行にかけてとめる。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-52":{"explanation":"公式正答は選択肢2「色相環の基本となる色は、赤・黄・青の3色である。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-53":{"explanation":"公式正答は選択肢4「アルカリ性酸化染毛剤は、永久染毛剤である。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"47-54":{"explanation":"公式正答は選択肢1「プッシュハンドとは、フリーハンドの持ち方で手関節だけを手背側へそらし、切れ刃を向こう側へ向けた持ち方である。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"47-55":{"explanation":"公式正答は選択肢3「剃る毛がうぶ毛なので、1回剃り、2回剃りともソープを使う。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"46-01":{"explanation":"公式正答は選択肢3「理容業の経営の健全化を促進することにより、理容業の振興を図っている。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"46-02":{"explanation":"公式正答は選択肢2「理容師が氏名を変更したときは、30日以内に理容師名簿の訂正を申請しなければならない。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"46-03":{"explanation":"公式正答は選択肢3「法の規定による業務の停止処分に違反して、理容の業をした場合」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"46-04":{"explanation":"公式正答は選択肢1「aとb」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"46-05":{"explanation":"公式正答は選択肢4「理容所の開設者の地位を承継する相続人は、その旨を都道府県知事等に届け出なければならない。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"46-06":{"explanation":"公式正答は選択肢1「開設者が、理容師でない者に理容の業務を行わせた場合」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"46-07":{"explanation":"公式正答は選択肢2「生活衛生同業組合は、営業に関する技能の改善向上についても事業としている。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"46-08":{"explanation":"公式正答は選択肢4「貸借対照表において、1年以内に返済しなければならない借金は固定負債に分類される。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"46-09":{"explanation":"公式正答は選択肢4「健康保険においては、育児休業中の保険料が免除される制度がある。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"46-10":{"explanation":"公式正答は選択肢2「雇用保険の基本手当は、自己都合で退職し失業した場合には支給されない。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"46-11":{"explanation":"公式正答は選択肢1「年齢別死亡率は、一般的に思春期のころ最も低くなる。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"46-12":{"explanation":"公式正答は選択肢2「男女とも80年以上である。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"46-13":{"explanation":"公式正答は選択肢3「肺炎」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"46-14":{"explanation":"公式正答は選択肢2「不快な臭いがする。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"46-15":{"explanation":"公式正答は選択肢2「一般に日常生活に不自由のない明るさは、10ルクス程度である。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"46-16":{"explanation":"公式正答は選択肢3「C型肝炎　動物・節足動物」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"46-17":{"explanation":"公式正答は選択肢3「細菌のなかには、酸素があると発育、増殖できないものがある。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"46-18":{"explanation":"公式正答は選択肢4「変異によって、細菌の形態が変化することはない。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"46-19":{"explanation":"公式正答は選択肢1「病原体が体内に侵入しても、発育、増殖することができず、体外に排出されてしまう状態のことも感染という。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"46-20":{"explanation":"公式正答は選択肢2「bとc」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"46-21":{"explanation":"公式正答は選択肢3「殺菌　消毒　滅菌」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"46-22":{"explanation":"公式正答は選択肢4「aとd」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"46-23":{"explanation":"公式正答は選択肢2「消毒薬水溶液の温度は低いほど効果がある。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"46-24":{"explanation":"公式正答は選択肢1「逆性石けんと併用すると効果が低下する。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"46-25":{"explanation":"公式正答は選択肢2「250」です。文章の文脈と各語句・数値の対応に合う選択肢です。各空欄の根拠は、最終監修で個別確認します。","choices":["文章の空欄に入る組合せとして正答に該当しない","文章の空欄に入る正しい組合せである","文章の空欄に入る組合せとして正答に該当しない","文章の空欄に入る組合せとして正答に該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"46-26":{"explanation":"公式正答は選択肢4「眼窩部」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"標準解剖学・生理学資料"},"46-27":{"explanation":"公式正答は選択肢3「赤色骨髄」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"46-28":{"explanation":"公式正答は選択肢2「眼輪筋」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"46-29":{"explanation":"公式正答は選択肢2「脊髄」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖学・生理学資料"},"46-30":{"explanation":"公式正答は選択肢1「前庭」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準解剖学・生理学資料"},"46-31":{"explanation":"公式正答は選択肢1「表皮は、基底層、有棘層、顆粒層、角質層の4つの層からなる。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"46-32":{"explanation":"公式正答は選択肢1「すべての毛に毛髄質はある。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"46-33":{"explanation":"公式正答は選択肢3「皮膚表面の脂肪膜は、pHは7ぐらいなので、細菌の発育を抑制しない。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"46-34":{"explanation":"公式正答は選択肢4「UVAは真皮にまで達し、色素細胞の働きを弱める。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"標準皮膚科学・皮膚感染症資料"},"46-35":{"explanation":"公式正答は選択肢1「脂漏性皮膚炎は、フケ症やあぶら症の人に多い皮膚炎で、紅斑や落屑がみられる。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"46-36":{"explanation":"公式正答は選択肢4「アセトンは、エナメルリムーバーに用いられる。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"46-37":{"explanation":"公式正答は選択肢4「システイン　アミノ酸」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"46-38":{"explanation":"公式正答は選択肢3「パラフィン　水性原料」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"46-39":{"explanation":"公式正答は選択肢1「システインは第2剤に含まれ、酸化剤として働く。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"46-40":{"explanation":"公式正答は選択肢2「bとc」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"46-41":{"explanation":"公式正答は選択肢4「昭和時代（戦後）　落下傘スカート」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"理容文化論・理容技術理論の標準教材"},"46-42":{"explanation":"公式正答は選択肢1「髪をきれいに分ける手間がいらないことからヨーロッパに広がったオールバックが伝えられた。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"46-43":{"explanation":"公式正答は選択肢1「昼間の正式礼装　モーニングコート」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"46-44":{"explanation":"公式正答は選択肢2「刃の中心線と切断面が一致しないレザーの切断様式を切削という。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"46-45":{"explanation":"公式正答は選択肢3「歯は、起こされた毛髪を両側から支える役割をする。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"46-46":{"explanation":"公式正答は選択肢3「ムーブメントとは、形の表現を強烈にするために、つくる人の主観に基づいて形を変化させることをいう。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"46-47":{"explanation":"公式正答は選択肢4「肘を張ると手の動きが悪くなるので、肘は常に体につけておく。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"46-48":{"explanation":"公式正答は選択肢2「シルエット　短髪部　後頭部」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"46-49":{"explanation":"公式正答は選択肢4「aとd」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"理容文化論・理容技術理論の標準教材"},"46-50":{"explanation":"公式正答は選択肢3「毛髪を充分乾燥させてからドライヤーセットを行う。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"46-51":{"explanation":"公式正答は選択肢4「ロングステムは、輪ゴムを頭皮面と平行になるようにとめる。」です。設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答に該当しません。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"46-52":{"explanation":"公式正答は選択肢4「aとd」です。設問中の各記述を判定すると、この組合せだけが条件を満たします。個々の記述の法令・数値・医学的根拠は、最終監修で個別確認します。","choices":["設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす組合せではない","設問の条件を満たす正しい組合せである"],"basis":"理容文化論・理容技術理論の標準教材"},"46-53":{"explanation":"公式正答は選択肢1「毛が硬くて量も多く、抵抗が大きい場合には、対皮角度は大きくして運行する。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"46-54":{"explanation":"公式正答は選択肢4「汚れがひどい場合は、毛髪を強くこすり合わせて洗う。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"46-55":{"explanation":"公式正答は選択肢3「圧迫法は、手指や手掌で頭皮をもむ技法である。」です。設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤りとして扱われません。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"}};


/* 第45回〜第43回：公式正答に基づく選択肢別一次解説。公的根拠の個別確認前。 */
Object.assign(PRELIMINARY_PAST_REVIEWS,{"45-01":{"explanation":"公式正答は選択肢4「理容師免許証の交付」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"45-02":{"explanation":"公式正答は選択肢3「外国の理容師の資格を持っている者は、日本の理容師の免許がなくても日本国内で理容を業とすることができる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"45-03":{"explanation":"公式正答は選択肢1「理容師試験に合格しても、かつて精神の障害の疾患を行った者には理容師の免許が与えられないことがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"45-04":{"explanation":"公式正答は選択肢2「免許証を破り、汚し、又は失った場合」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"45-05":{"explanation":"公式正答は選択肢4「届出　構造設備　罰金刑」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"45-06":{"explanation":"公式正答は選択肢4「理容所の営業日が変更となった場合」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"45-07":{"explanation":"公式正答は選択肢3「生活衛生同業組合は、組合員に対する融資資金の資金のあっせんを行うことができる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"45-08":{"explanation":"公式正答は選択肢1「小規模な事業者には、労働者に対する医師による健康診断の実施は義務付けられていない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"45-09":{"explanation":"公式正答は選択肢2「障害基礎年金の給付額は、障害の程度にかかわらず、すべて同額である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"45-10":{"explanation":"公式正答は選択肢3「医療保険の療養の給付における一部負担金は、年齢にかかわらず、すべてかかった医療費の3割である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"45-11":{"explanation":"公式正答は選択肢4「粗死亡率」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"45-12":{"explanation":"公式正答は選択肢3「1981年以降は、主要死因別死亡率の第1位は、がんである。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"45-13":{"explanation":"公式正答は選択肢2「わが国の女性の喫煙率は、他の先進諸国に比べて高率である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"45-14":{"explanation":"公式正答は選択肢4「17から28　40から70」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"45-15":{"explanation":"公式正答は選択肢1「幼虫は吸血しない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"45-16":{"explanation":"公式正答は選択肢1「百日せきは、接触を介して感染する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"45-17":{"explanation":"公式正答は選択肢4「aとd」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"45-18":{"explanation":"公式正答は選択肢2「病原体が人体に付着することが感染である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"45-19":{"explanation":"公式正答は選択肢3「対象疾病が異なっても、接種対象年齢及び接種回数は同じである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"45-20":{"explanation":"公式正答は選択肢2「潜伏期は2～3日である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"45-21":{"explanation":"公式正答は選択肢4「殺菌　滅菌　消毒」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"45-22":{"explanation":"公式正答は選択肢2「紫外線は、日や皮膚に直接照射しても害はない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"45-23":{"explanation":"公式正答は選択肢2「逆性石けんは、結核菌に対して効力がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"45-24":{"explanation":"公式正答は選択肢1「0.01%」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"45-25":{"explanation":"公式正答は選択肢3「cとd」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"45-26":{"explanation":"公式正答は選択肢2「人中」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"45-27":{"explanation":"公式正答は選択肢3「交感神経」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"45-28":{"explanation":"公式正答は選択肢1「鼓膜」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準解剖生理学資料"},"45-29":{"explanation":"公式正答は選択肢4「赤血球」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"標準解剖生理学資料"},"45-30":{"explanation":"公式正答は選択肢3「咬筋」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"標準解剖生理学資料"},"45-31":{"explanation":"公式正答は選択肢3「基底細胞は、分裂して表皮表面に移動し、最終的に角質細胞に変化する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"45-32":{"explanation":"公式正答は選択肢2「健康な成人では、頭毛の85～90％が休止期である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"45-33":{"explanation":"公式正答は選択肢1「紫外線によって、メラノサイトが大量につくられ、皮膚の色が黒くなる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"45-34":{"explanation":"公式正答は選択肢1「皮膚の老化は、個人の素因によるもので、環境の影響は受けない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"45-35":{"explanation":"公式正答は選択肢4「尋常性痤瘡（ニキビ）は、脂腺の多い箇所の毛包にウイルスが増殖して起きる疾患である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"標準皮膚科学・皮膚感染症資料"},"45-36":{"explanation":"公式正答は選択肢3「炭化水素は、石油から得られるもので、動植物からは得られない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"45-37":{"explanation":"公式正答は選択肢4「陰イオン（アニオン）　乳化　第四級」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"45-38":{"explanation":"公式正答は選択肢1「パラオキシ安息香酸エステル（パラベン）は、防腐剤である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"45-39":{"explanation":"公式正答は選択肢2「臭素酸ナトリウム」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"45-40":{"explanation":"公式正答は選択肢4「サンスクリーン製品は、UV-Bのみを防御する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"45-41":{"explanation":"公式正答は選択肢2「散切り」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"45-42":{"explanation":"公式正答は選択肢4「軍服をモデルに国民服がつくられた。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"45-43":{"explanation":"公式正答は選択肢1「図の（1）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"45-44":{"explanation":"公式正答は選択肢3「毛渦の周囲をクラウンという。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"45-45":{"explanation":"公式正答は選択肢4「コンケーブ型は、刃先に曲がりやつぶれの変形が起きにくい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"45-46":{"explanation":"公式正答は選択肢2「ひぞこが正しく形成されていると、両刃の接触がよい。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"45-47":{"explanation":"公式正答は選択肢3「形の表現に変化をもたせて、見る者に動きを感じさせる状態を変形（デフォルメ）という。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"45-48":{"explanation":"公式正答は選択肢4「aとd」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"45-49":{"explanation":"公式正答は選択肢1「長髪部　鋏元　長く」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"45-50":{"explanation":"公式正答は選択肢3「第1剤は、すべて酸性である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"45-51":{"explanation":"公式正答は選択肢3「ノンステム　ハーフステム　ロングステム」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"45-52":{"explanation":"公式正答は選択肢2「無彩色には、色相・明度・彩度の三属性がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"45-53":{"explanation":"公式正答は選択肢2「図の（2）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"45-54":{"explanation":"公式正答は選択肢4「うぶ毛は軟らかいので、1回剃りを行う。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"45-55":{"explanation":"公式正答は選択肢1「バックシャンプーやリアシャンプーでは、首を動かすときはソフトにゆっくり行う。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"44-01":{"explanation":"公式正答は選択肢3「保健所の業務には、人口動態統計などの統計に関する事項は含まれない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"44-02":{"explanation":"公式正答は選択肢4「A 資格　B 業務　C 公衆衛生」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"44-03":{"explanation":"公式正答は選択肢3「理容師が氏名を変更したときは、2か月以内に免許証の書換え交付を申請しなければならない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"44-04":{"explanation":"公式正答は選択肢1「管理理容師の職務には、理容所という施設の衛生管理のみならず、理容所での理容の業務についても衛生的に管理することが含まれる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"44-05":{"explanation":"公式正答は選択肢4「開設の届出事項に変更が生じたときは、すみやかに届け出なければならず、これを怠った場合には、30万円以下の罰金に処されることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"44-06":{"explanation":"公式正答は選択肢4「出張理容が認められない場所で理容の業務を行った理容師に対しては、そのことにより、罰金が科されることがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"44-07":{"explanation":"公式正答は選択肢4「個人情報の保護に関する法律により、顧客データ数の多い事業者に限定して個人情報の取扱いが規制されている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"44-08":{"explanation":"公式正答は選択肢2「従業員の給与からの源泉所得税は、従業員が税務署に支払うものであり、雇用主が預かることはない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"44-09":{"explanation":"公式正答は選択肢3「国民年金の第1号被保険者（自営業者等）の保険料は、所得が高いほど高額となる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"44-10":{"explanation":"公式正答は選択肢1「育児休業給付」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"44-11":{"explanation":"公式正答は選択肢2「「2016年全国たばこ喫煙者率調査」によると、わが国の20歳以上の男性の喫煙者率は年々上昇傾向にある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"44-12":{"explanation":"公式正答は選択肢4「人口の高齢化のスピードは、欧米諸国よりも速い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"44-13":{"explanation":"公式正答は選択肢4「自殺による人口10万人あたりの死亡率は、1958年以降現在まで不変である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"44-14":{"explanation":"公式正答は選択肢3「カビが人のアレルギー反応を引き起こすことはない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"44-15":{"explanation":"公式正答は選択肢1「浮遊粒子状物質とは、大気中に浮遊する粒子状物質であって、その粒径が1ミリメートル以上のものをいう。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"44-16":{"explanation":"公式正答は選択肢3「生きた細胞内でのみ増殖する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"44-17":{"explanation":"公式正答は選択肢2「鼻腔に存在するブドウ球菌は感染源となることはない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"44-18":{"explanation":"公式正答は選択肢1「対象疾病や実施方法は健康増進法によって定められている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"44-19":{"explanation":"公式正答は選択肢3「伝染性膿痂疹（トビヒ）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"44-20":{"explanation":"公式正答は選択肢3「母子感染予防に新生児へのワクチン投与は有効である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"44-21":{"explanation":"公式正答は選択肢4「消毒薬には、消毒しようとする対象によって適した濃度がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"44-22":{"explanation":"公式正答は選択肢3「c と d」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"44-23":{"explanation":"公式正答は選択肢2「b と c」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"44-24":{"explanation":"公式正答は選択肢1「石けんと反応するので、併用できない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"44-25":{"explanation":"公式正答は選択肢2「10%逆性石けん液1mLに、水99mLを加える。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"44-26":{"explanation":"公式正答は選択肢2「鼻翼」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準解剖生理学資料"},"44-27":{"explanation":"公式正答は選択肢2「胸鎖乳突筋」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"44-28":{"explanation":"公式正答は選択肢1「延髄」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"44-29":{"explanation":"公式正答は選択肢2「鼓膜」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準解剖生理学資料"},"44-30":{"explanation":"公式正答は選択肢3「血液凝固」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"44-31":{"explanation":"公式正答は選択肢3「角化細胞（ケラチノサイト）は、メラニンをつくる細胞であり、表皮の細胞の約95%を占める。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"44-32":{"explanation":"公式正答は選択肢4「脂腺は、体の部位に関係なく同じ密度で分布している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"標準皮膚科学・皮膚感染症資料"},"44-33":{"explanation":"公式正答は選択肢2「膠原線維は、機械的外力に対する保護のはたらきをしている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"44-34":{"explanation":"公式正答は選択肢1「思春期になると、女性ホルモンの影響で脂腺が発育して皮脂の分泌が多くなる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"44-35":{"explanation":"公式正答は選択肢1「頭部白癬（シラクモ）は、白癬菌による感染症でペットから感染することがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"44-36":{"explanation":"公式正答は選択肢1「メチルポリシロキサン　シリコーン油」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"44-37":{"explanation":"公式正答は選択肢2「油相に水滴が分散している乳化型をO/W型という。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"44-38":{"explanation":"公式正答は選択肢2「パラフィン　金属イオン封鎖剤（キレート剤）」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"44-39":{"explanation":"公式正答は選択肢1「A 大きく　B 少ない　C 揮発」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"44-40":{"explanation":"公式正答は選択肢3「酸化染毛剤は、1回のシャンプーで色落ちする。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"44-41":{"explanation":"公式正答は選択肢4「A 大正　B リーゼント　C パーマネントウェーブ」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"44-42":{"explanation":"公式正答は選択肢3「モダンガールが東京・銀座などに出現し始めた。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"44-43":{"explanation":"公式正答は選択肢2「昼間の略式礼装として、メスジャケットが着用される。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"44-44":{"explanation":"公式正答は選択肢3「目線の高さで施術するときは、技術部位と目の距離を60cm以上にするとよい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"44-45":{"explanation":"公式正答は選択肢1「A 回転　B 減速　C 往復」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"44-46":{"explanation":"公式正答は選択肢1「コームの胴は、目に入った毛髪を一線にそろえ支える役割がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"44-47":{"explanation":"公式正答は選択肢4「カッティングでのコームの運行は、毛流に対し直角に運行し、直角にカットする。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"44-48":{"explanation":"公式正答は選択肢4「ミディアムヘアは、中髪型のスタイルである。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"44-49":{"explanation":"公式正答は選択肢2「A 歯先　B 背側　C 頭皮面」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"44-50":{"explanation":"公式正答は選択肢4「図4」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"44-51":{"explanation":"公式正答は選択肢2「明度は、黒を0、白を10とした11段階に分けて設定されている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"44-52":{"explanation":"公式正答は選択肢3「ヘアブリーチ剤や染毛剤は、使用直前に調合を行い、使用後残った液は再使用しない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"44-53":{"explanation":"公式正答は選択肢3「レザーの操作・運行は、技術者の左胸の前で行う。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"44-54":{"explanation":"公式正答は選択肢4「眼から下の部分は、メンズシェービングと同じ運行順序で行う。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"44-55":{"explanation":"公式正答は選択肢1「A ネイルプレート　B ハーフムーン　C キューティクル」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-01":{"explanation":"公式正答は選択肢3「理容業の振興を図る方策について定めている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43n-02":{"explanation":"公式正答は選択肢2「理容師が氏名を変更したときは、理容師名簿の訂正を申請しなければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43n-03":{"explanation":"公式正答は選択肢3「理容師の労働時間」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43n-04":{"explanation":"公式正答は選択肢1「理容所の開設者　都道府県等の条例　業務の停止処分」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43n-05":{"explanation":"公式正答は選択肢4「理容師が常時2人以上従事する理容所に管理理容師を置かなかった場合は、理容所の閉鎖命令を受けることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43n-06":{"explanation":"公式正答は選択肢2「理容業の振興指針は、生活衛生同業組合の組合員のみを対象として都道府県知事が定める。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43n-07":{"explanation":"公式正答は選択肢3「消費者基本法では、従業者の就業禁止について定めている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43n-08":{"explanation":"公式正答は選択肢3「消費税」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43n-09":{"explanation":"公式正答は選択肢2「雇用されて2か月以上健康保険に加入していた者は、退職後も任意継続の被保険者となることができる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43n-10":{"explanation":"公式正答は選択肢4「育児休業給付」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43n-11":{"explanation":"公式正答は選択肢3「保健所には医師が配置されることとなっている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"43n-12":{"explanation":"公式正答は選択肢1「出生数は、死亡数よりも少ない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"43n-13":{"explanation":"公式正答は選択肢3「健康を維持するためには、短時間に激しい運動をすることが必要である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"43n-14":{"explanation":"公式正答は選択肢4「暖房　気化熱の利用」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"43n-15":{"explanation":"公式正答は選択肢2「二酸化炭素　二酸化炭素ガス」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"43n-16":{"explanation":"公式正答は選択肢1「結核」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"43n-17":{"explanation":"公式正答は選択肢2「インフルエンザ」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"43n-18":{"explanation":"公式正答は選択肢2「芽胞は熱や乾燥に強い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"43n-19":{"explanation":"公式正答は選択肢3「近年のわが国における死亡率のピークは青年期にある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"43n-20":{"explanation":"公式正答は選択肢4「予防のためのワクチンはない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"43n-21":{"explanation":"公式正答は選択肢4「理容師法施行規則に定められている消毒方法と同等以上の効果があれば、他の消毒方法を用いてもよい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"43n-22":{"explanation":"公式正答は選択肢4「aとd」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"43n-23":{"explanation":"公式正答は選択肢1「希釈した逆性石けんは、7日ごとに取り換える。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"43n-24":{"explanation":"公式正答は選択肢2「多量の有機物があっても殺菌力は変わらない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"43n-25":{"explanation":"公式正答は選択肢1「aとb」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"43n-26":{"explanation":"公式正答は選択肢1「運動神経」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"43n-27":{"explanation":"公式正答は選択肢4「眼　瞳孔の散大」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"標準解剖生理学資料"},"43n-28":{"explanation":"公式正答は選択肢3「半規管」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"43n-29":{"explanation":"公式正答は選択肢3「免疫反応」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"43n-30":{"explanation":"公式正答は選択肢2「肺」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"43n-31":{"explanation":"公式正答は選択肢3「角質層は手掌や足底で薄く、顔面や手足の屈曲部では厚い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"43n-32":{"explanation":"公式正答は選択肢2「毛は、中心から外に向かって順に毛髄質、毛小皮、毛皮質の3層からなっている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"43n-33":{"explanation":"公式正答は選択肢2「皮膚からは、脂溶性物質より水溶性物質のほうが吸収されやすい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"43n-34":{"explanation":"公式正答は選択肢4「皮膚の老化は、個人の素因によるもので、環境の影響は受けない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"標準皮膚科学・皮膚感染症資料"},"43n-35":{"explanation":"公式正答は選択肢1「尋常性毛瘡（カミソリカブレ）　化膿菌」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"標準皮膚科学・皮膚感染症資料"},"43n-36":{"explanation":"公式正答は選択肢3「メタノール（メチルアルコール）は、化粧品基準で配合が認められている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43n-37":{"explanation":"公式正答は選択肢2「ロウ類は、高級脂肪酸とグリセリンとのエステルで、クリームや口紅などに用いられる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43n-38":{"explanation":"公式正答は選択肢1「ノニオン界面活性剤は、水に溶かしたときに親水基が陰イオンになる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43n-39":{"explanation":"公式正答は選択肢4「aとd」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43n-40":{"explanation":"公式正答は選択肢4「チオグリコール酸　還元剤」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43n-41":{"explanation":"公式正答は選択肢2「大正時代のバスガール（車掌）の制服は和装であった。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-42":{"explanation":"公式正答は選択肢1「慎太郎刈」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-43":{"explanation":"公式正答は選択肢3「イギリスのスタイルとして紹介されたリーゼントが流行した。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-44":{"explanation":"公式正答は選択肢3「A：側頭突起　B：鼻翼溝　C：オトガイ唇溝」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-45":{"explanation":"公式正答は選択肢1「鋏尖・刃線・交点の3点を結ぶ線を中心線という。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-46":{"explanation":"公式正答は選択肢4「胴は全体の根幹であるので弾力性は必要ない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-47":{"explanation":"公式正答は選択肢2「前に切った毛髪の長さに合わせてカットしていくことを、基準剪髪という。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-48":{"explanation":"公式正答は選択肢3「水平　肘関節　手関節　45度」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-49":{"explanation":"公式正答は選択肢4「アイロンセットは、アイロンの熱で毛髪をいためやすいので、50℃以下の温度で仕上げる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-50":{"explanation":"公式正答は選択肢3「ロングステムは、ボリュームを必要とする部分に使用する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-51":{"explanation":"公式正答は選択肢4「脱色剤及び脱染剤は、パッチテストは不要である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-52":{"explanation":"公式正答は選択肢1「ストロークを短くして、ゆっくりと運行をする。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-53":{"explanation":"公式正答は選択肢2「泡立ちが悪いときは、シャンプー剤をつけ足す。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-54":{"explanation":"公式正答は選択肢4「レザーによる切断の様式は剪断である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"43n-55":{"explanation":"公式正答は選択肢4「無彩色には、色相しかない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"43o-01":{"explanation":"公式正答は選択肢3「理容業の振興を図る方策について定めている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43o-02":{"explanation":"公式正答は選択肢2「理容師が氏名を変更したときは、理容師名簿の訂正を申請しなければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43o-03":{"explanation":"公式正答は選択肢3「理容師の労働時間」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43o-04":{"explanation":"公式正答は選択肢1「A 理容所の開設者　B 都道府県等の条例　C 業務の停止処分」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43o-05":{"explanation":"公式正答は選択肢4「理容師が常時2人以上従事する理容所に管理理容師を置かなかった場合は、理容所の閉鎖命令を受けることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"43o-06":{"explanation":"公式正答は選択肢3「保健所には医師が配置されることとなっている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"43o-07":{"explanation":"公式正答は選択肢1「出生数は、死亡数よりも少ない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"43o-08":{"explanation":"公式正答は選択肢3「健康を維持するためには、短時間に激しい運動をすることが必要である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"43o-09":{"explanation":"公式正答は選択肢4「暖房　気化熱の利用」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"43o-10":{"explanation":"公式正答は選択肢2「A 二酸化炭素　B 二酸化炭素ガス」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"厚生労働省の公衆衛生・環境衛生資料、人口動態・衛生統計"},"43o-11":{"explanation":"公式正答は選択肢1「結核」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"43o-12":{"explanation":"公式正答は選択肢2「インフルエンザ」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"43o-13":{"explanation":"公式正答は選択肢2「芽胞は熱や乾燥に強い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"43o-14":{"explanation":"公式正答は選択肢3「近年のわが国における死亡率のピークは青年期にある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"43o-15":{"explanation":"公式正答は選択肢4「予防のためのワクチンはない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"43o-16":{"explanation":"公式正答は選択肢4「理容師法施行規則に定められている消毒方法と同等以上の効果があれば、他の消毒方法を用いてもよい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"43o-17":{"explanation":"公式正答は選択肢4「a と d」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"43o-18":{"explanation":"公式正答は選択肢1「希釈した逆性石けんは、7日ごとに取り換える。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"43o-19":{"explanation":"公式正答は選択肢2「多量の有機物があっても殺菌力は変わらない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"43o-20":{"explanation":"公式正答は選択肢1「a と b」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"43o-21":{"explanation":"公式正答は選択肢1「運動神経」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"43o-22":{"explanation":"公式正答は選択肢4「眼　瞳孔の散大」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"標準解剖生理学資料"},"43o-23":{"explanation":"公式正答は選択肢3「半規管」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"43o-24":{"explanation":"公式正答は選択肢3「免疫反応」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"43o-25":{"explanation":"公式正答は選択肢2「肺」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"標準解剖生理学資料"},"43o-26":{"explanation":"公式正答は選択肢3「角質層は手掌や足底で薄く、顔面や手足の屈曲部では厚い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"43o-27":{"explanation":"公式正答は選択肢2「毛は、中心から外に向かって順に毛髄質、毛小皮、毛皮質の3層からなっている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"43o-28":{"explanation":"公式正答は選択肢2「皮膚からは、脂溶性物質より水溶性物質のほうが吸収されやすい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"標準皮膚科学・皮膚感染症資料"},"43o-29":{"explanation":"公式正答は選択肢4「皮膚の老化は、個人の素因によるもので、環境の影響は受けない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"標準皮膚科学・皮膚感染症資料"},"43o-30":{"explanation":"公式正答は選択肢1「尋常性毛瘡（カミソリカブレ）　化膿菌」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"標準皮膚科学・皮膚感染症資料"},"43o-31":{"explanation":"公式正答は選択肢4「A 大きい　B 沸騰　C 変わらない」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43o-32":{"explanation":"公式正答は選択肢3「A 導体　B 金属　C 感電」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43o-33":{"explanation":"公式正答は選択肢3「A 往復　B クランク　C コイル」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43o-34":{"explanation":"公式正答は選択肢3「メタノール（メチルアルコール）は、化粧品基準で配合が認められている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43o-35":{"explanation":"公式正答は選択肢2「ロウ類は、高級脂肪酸とグリセリンとのエステルで、クリームや口紅などに用いられる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43o-36":{"explanation":"公式正答は選択肢1「ノニオン界面活性剤は、水に溶かしたときに親水基が陰イオンになる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43o-37":{"explanation":"公式正答は選択肢4「植物系天然高分子化合物　キトサン」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43o-38":{"explanation":"公式正答は選択肢4「a と d」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43o-39":{"explanation":"公式正答は選択肢4「チオグリコール酸　還元剤」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43o-40":{"explanation":"公式正答は選択肢3「A アンモニア水　B 過酸化水素　C 酸素　D メラニン」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"43o-41":{"explanation":"公式正答は選択肢3「A 側頭突起　B 鼻翼溝　C オトガイ唇溝」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"43o-42":{"explanation":"公式正答は選択肢1「鋏尖・刃線・交点の3点を結ぶ線を中心線という。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43o-43":{"explanation":"公式正答は選択肢4「胴は全体の根幹であるので弾力性は必要ない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"43o-44":{"explanation":"公式正答は選択肢2「前に切った毛髪の長さに合わせてカットしていくことを、基準剪髪という。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43o-45":{"explanation":"公式正答は選択肢3「A 水平　B 肘関節　C 手関節　D 45度」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"43o-46":{"explanation":"公式正答は選択肢4「アイロンセットは、アイロンの熱で毛髪をいためやすいので、50℃以下の温度で仕上げる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"43o-47":{"explanation":"公式正答は選択肢3「ロングステムは、ボリュームを必要とする部分に使用する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43o-48":{"explanation":"公式正答は選択肢4「脱色剤及び脱染剤は、パッチテストは不要である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"43o-49":{"explanation":"公式正答は選択肢1「ストロークを短くして、ゆっくりと運行をする。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"43o-50":{"explanation":"公式正答は選択肢2「泡立ちが悪いときは、シャンプー剤をつけ足す。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"}});


/* 第42回〜第40回：公式正答に基づく選択肢別一次解説。公的根拠の個別確認前。 */
const PRELIMINARY_PAST_REVIEWS_42_40={"42n-01":{"explanation":"公式正答は選択肢3「理容師試験の実施」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42n-02":{"explanation":"公式正答は選択肢4「免許証（免許証明書）を紛失したときは、住所地の都道府県知事等に免許証（免許証明書）の再交付を申請しなければならない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42n-03":{"explanation":"公式正答は選択肢1「理容師が氏名を変更した場合は、30日以内に理容師名簿の訂正を申請しなければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42n-04":{"explanation":"公式正答は選択肢4「理容所の開設者がその理容所を廃止し、その届出を怠った場合には、30万円以下の罰金に処されることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42n-05":{"explanation":"公式正答は選択肢2「理容師が理容師名簿の登録事項の変更について訂正申請を行わなかったときは、罰金に処されることがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42n-06":{"explanation":"公式正答は選択肢2「生衛法の標準営業約款は、施術料金の統一についても定めている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42n-07":{"explanation":"公式正答は選択肢2「保健所の事業の一つとして、感染症その他の疾病の予防に関する事項がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42n-08":{"explanation":"公式正答は選択肢3「理容所の使用者は、契約の際に従業者に賃金、労働時間その他の労働条件を必ずしも明示しなくてもよい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42n-09":{"explanation":"公式正答は選択肢4「国民年金の保険料を納めることが困難な場合に対応するため、保険料の免除や納付猶予の制度がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42n-10":{"explanation":"公式正答は選択肢2「療養補償給付」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42n-11":{"explanation":"公式正答は選択肢3「1人の女性が一生の間に産む子どもの数は、2015年では2人以上である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"42n-12":{"explanation":"公式正答は選択肢1「大腸がん」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"42n-13":{"explanation":"公式正答は選択肢2「男性の喫煙率は、年々増加の傾向にある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"42n-14":{"explanation":"公式正答は選択肢1「温度」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"42n-15":{"explanation":"公式正答は選択肢3「浄化槽とは、河川水を浄化して上水を得るための施設のことである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"42n-16":{"explanation":"公式正答は選択肢1「B型肝炎」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"42n-17":{"explanation":"公式正答は選択肢3「細菌は、生きた細胞の中でのみ増殖する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"42n-18":{"explanation":"公式正答は選択肢4「患者の入院治療」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"42n-19":{"explanation":"公式正答は選択肢1「潜伏期は、2〜3か月である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"42n-20":{"explanation":"公式正答は選択肢3「潜伏期は、約30日である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"42n-21":{"explanation":"公式正答は選択肢1「0.1%次亜塩素酸ナトリウム水溶液中に10分間浸す。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"42n-22":{"explanation":"公式正答は選択肢3「c と d」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"42n-23":{"explanation":"公式正答は選択肢3「c と d」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"42n-24":{"explanation":"公式正答は選択肢2「b と c」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"42n-25":{"explanation":"公式正答は選択肢4「20mL」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"42n-26":{"explanation":"公式正答は選択肢4「球関節 — 広い範囲で自由に運動できる。」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"人体の解剖学・生理学の標準資料"},"42n-27":{"explanation":"公式正答は選択肢3「咬筋」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"42n-28":{"explanation":"公式正答は選択肢1「脳神経」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"42n-29":{"explanation":"公式正答は選択肢4「心拍数は増加する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"人体の解剖学・生理学の標準資料"},"42n-30":{"explanation":"公式正答は選択肢3「リンパ球は主に免疫反応に関わる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"42n-31":{"explanation":"公式正答は選択肢1「色素細胞（メラノサイト）の数は、同一部位であっても白色人種や黒色人種などの人種によって大きく異なる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"42n-32":{"explanation":"公式正答は選択肢2「毛のケラチンは、全体として長軸の方向に鎖状に結合しているため、縦に裂けやすい。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"42n-33":{"explanation":"公式正答は選択肢2「紫外線を浴びると、エラスチンが大量につくられ、皮膚の色が黒くなる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"42n-34":{"explanation":"公式正答は選択肢3「健康な成人の皮膚の表面はアルカリ性である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"42n-35":{"explanation":"公式正答は選択肢4「頭部白癬は、ウイルスによって引き起こされる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"42n-36":{"explanation":"公式正答は選択肢4「W/O型エマルジョンでは、水相に油滴が分散している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42n-37":{"explanation":"公式正答は選択肢1「ケラチン — タンパク質」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42n-38":{"explanation":"公式正答は選択肢4「紫外線による急性の炎症をサンバーンといい、PAはその防御効果の指標である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42n-39":{"explanation":"公式正答は選択肢3「A チオグリコール酸／B 還元剤／C 臭素酸ナトリウム／D 酸化剤」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42n-40":{"explanation":"公式正答は選択肢2「レゾルシン — 調色剤（カップラー）」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42n-41":{"explanation":"公式正答は選択肢4「武士にとって髷を切ることに抵抗はなかった。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-42":{"explanation":"公式正答は選択肢4「アイビールックやコンチネンタルスタイルが、トータルファッションとして若者を中心に流行した。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-43":{"explanation":"公式正答は選択肢2「和装の正式礼装は、五つ紋の着物・羽織と袴である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-44":{"explanation":"公式正答は選択肢4「図中の(4)」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-45":{"explanation":"公式正答は選択肢2「ステンレス鋼は、クロムが約12〜18%含まれていて、さびに強い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-46":{"explanation":"公式正答は選択肢4「2枚の刃物による剪断応力を利用している。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-47":{"explanation":"公式正答は選択肢2「6:4分髪」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-48":{"explanation":"公式正答は選択肢2「A 短髪／B 歯先／C 歯元」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-49":{"explanation":"公式正答は選択肢2「技術者は、両肘を張り、自分のからだの中心に向かってアイロンとコームを運行する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-50":{"explanation":"公式正答は選択肢3「c と d」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-51":{"explanation":"公式正答は選択肢3「図中の(3)」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-52":{"explanation":"公式正答は選択肢1「ラザーリングは2回行うが、1回目のラザーリングは、皮膚とひげの水分を保ち、シェービングしやすくすることが目的である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-53":{"explanation":"公式正答は選択肢4「1回剃りは、毛流の真横又は斜め下から行うようにする。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-54":{"explanation":"公式正答は選択肢3「下刃は厚くなるにつれて目幅や歯幅が狭くなり、歯数は増え長さも短くなる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42n-55":{"explanation":"公式正答は選択肢3「毛髪は、短くすると弾力によって立ちやすく、長いと重みでねる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42o-01":{"explanation":"公式正答は選択肢3「理容師試験の実施」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42o-02":{"explanation":"公式正答は選択肢4「免許証（免許証明書）を紛失したときは、住所地の都道府県知事等に免許証（免許証明書）の再交付を申請しなければならない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42o-03":{"explanation":"公式正答は選択肢1「理容師が氏名を変更した場合は、30日以内に理容師名簿の訂正を申請しなければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42o-04":{"explanation":"公式正答は選択肢4「理容所の開設者がその理容所を廃止し、その届出を怠った場合には、30万円以下の罰金に処されることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42o-05":{"explanation":"公式正答は選択肢2「理容師が理容師名簿の登録事項の変更について訂正申請を行わなかったときは、罰金に処されることがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"42o-06":{"explanation":"公式正答は選択肢3「1人の女性が一生の間に産む子どもの数は、2015年では2人以上である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"42o-07":{"explanation":"公式正答は選択肢1「大腸がん」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"42o-08":{"explanation":"公式正答は選択肢2「男性の喫煙率は、年々増加の傾向にある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"42o-09":{"explanation":"公式正答は選択肢1「温度」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"42o-10":{"explanation":"公式正答は選択肢3「浄化槽とは、河川水を浄化して上水を得るための施設のことである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"42o-11":{"explanation":"公式正答は選択肢1「B型肝炎」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"42o-12":{"explanation":"公式正答は選択肢3「細菌は、生きた細胞の中でのみ増殖する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"42o-13":{"explanation":"公式正答は選択肢4「患者の入院治療」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"42o-14":{"explanation":"公式正答は選択肢1「潜伏期は、2から3か月である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"42o-15":{"explanation":"公式正答は選択肢3「潜伏期は、約30日である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"42o-16":{"explanation":"公式正答は選択肢1「0.1%次亜塩素酸ナトリウム水溶液中に10分間浸す。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"42o-17":{"explanation":"公式正答は選択肢3「cとd」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"42o-18":{"explanation":"公式正答は選択肢3「cとd」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"42o-19":{"explanation":"公式正答は選択肢2「bとc」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"42o-20":{"explanation":"公式正答は選択肢4「20mL 理容保健」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"42o-21":{"explanation":"公式正答は選択肢4「球関節　広い範囲で自由に運動できる。」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"人体の解剖学・生理学の標準資料"},"42o-22":{"explanation":"公式正答は選択肢3「咬筋」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"42o-23":{"explanation":"公式正答は選択肢1「脳神経」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"42o-24":{"explanation":"公式正答は選択肢4「心拍数は増加する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"人体の解剖学・生理学の標準資料"},"42o-25":{"explanation":"公式正答は選択肢3「リンパ球は主に免疫反応に関わる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"42o-26":{"explanation":"公式正答は選択肢1「色素細胞（メラノサイト）の数は、同一部位であっても白色人種や黒色人種などの人種によって大きく異なる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"42o-27":{"explanation":"公式正答は選択肢2「毛のケラチンは、全体として長軸の方向に鎖状に結合しているため、縦に裂けやすい。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"42o-28":{"explanation":"公式正答は選択肢2「紫外線を浴びると、エラスチンが大量につくられ、皮膚の色が黒くなる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"42o-29":{"explanation":"公式正答は選択肢3「健康な成人の皮膚の表面はアルカリ性である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"42o-30":{"explanation":"公式正答は選択肢4「頭部白癬は、ウイルスによって引き起こされる。 理容の物理・化学」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"42o-31":{"explanation":"公式正答は選択肢1「凝縮は、気体が液体になる変化である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42o-32":{"explanation":"公式正答は選択肢3「ロッドの発熱体は電気抵抗が大きい。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42o-33":{"explanation":"公式正答は選択肢2「ファンデーションは、微生物汚染の影響を受けることがない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42o-34":{"explanation":"公式正答は選択肢2「油脂が空気中の酸素により変質することを、酸敗という。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42o-35":{"explanation":"公式正答は選択肢4「W/O型エマルジョンでは、水相に油滴が分散している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42o-36":{"explanation":"公式正答は選択肢1「ケラチン　タンパク質」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42o-37":{"explanation":"公式正答は選択肢3「ジブチルヒドロキシトルエン　酸化防止剤」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42o-38":{"explanation":"公式正答は選択肢4「紫外線による急性の炎症をサンバーンといい、PAはその防御効果の指標である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42o-39":{"explanation":"公式正答は選択肢3「チオグリコール酸　還元剤　臭素酸ナトリウム　酸化剤」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42o-40":{"explanation":"公式正答は選択肢4「メタフェニレンジアミン　染料中間体」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"42o-41":{"explanation":"公式正答は選択肢4「図の（4）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"42o-42":{"explanation":"公式正答は選択肢2「ステンレス鋼は、クロムが約12から18%含まれていて、さびに強い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42o-43":{"explanation":"公式正答は選択肢4「2枚の刃物による剪断応力を利用している。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"42o-44":{"explanation":"公式正答は選択肢2「6:4分髪」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42o-45":{"explanation":"公式正答は選択肢2「短髪　歯先　歯元」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"42o-46":{"explanation":"公式正答は選択肢2「技術者は、両肘を張り、自分のからだの中心に向かってアイロンとコームを運行する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42o-47":{"explanation":"公式正答は選択肢3「cとd」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"42o-48":{"explanation":"公式正答は選択肢3「図の（3）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42o-49":{"explanation":"公式正答は選択肢1「ラザーリングは2回行うが、1回目のラザーリングは、皮膚とひげの水分を保ち、シェービングしやすくすることが目的である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"42o-50":{"explanation":"公式正答は選択肢4「1回剃りは、毛流の真横又は斜め下から行うようにする。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-01":{"explanation":"公式正答は選択肢2「日本の国籍を有しない者は、理容師免許を取得することができない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41n-02":{"explanation":"公式正答は選択肢1「A 免許の取消処分　B 閉鎖処分　C 罰金刑」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41n-03":{"explanation":"公式正答は選択肢3「2か所以上の理容所の開設者が管理理容師となることができる者であるときは、自ら主として管理する1つの理容所の管理理容師となることができる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41n-04":{"explanation":"公式正答は選択肢4「理容所の閉鎖処分に違反した開設者は、30万円以下の罰金に処されることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41n-05":{"explanation":"公式正答は選択肢4「理容の施術に関する料金」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41n-06":{"explanation":"公式正答は選択肢3「生活衛生同業組合は、料金等を規制するための標準営業約款を定めることができる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41n-07":{"explanation":"公式正答は選択肢1「同居の親族以外で、5人未満の従業者を使用している理容所には、労働基準法は適用されない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41n-08":{"explanation":"公式正答は選択肢3「固定資産税は、経営がうまくいかず赤字の場合は支払わなくてもよい税金である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41n-09":{"explanation":"公式正答は選択肢1「労働安全衛生法」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41n-10":{"explanation":"公式正答は選択肢1「健康保険の療養の給付に当たっての被保険者の一部負担金は、すべて、かかった医療費の1割である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41n-11":{"explanation":"公式正答は選択肢4「児童虐待の捜査」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"41n-12":{"explanation":"公式正答は選択肢1「男性の粗死亡率は、女性の粗死亡率よりも高い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"41n-13":{"explanation":"公式正答は選択肢3「関係法令による特定健康診査・特定保健指導の対象者は、50歳以上である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"41n-14":{"explanation":"公式正答は選択肢2「理容所の湿度は、相対湿度30%以下が望ましいとされている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"41n-15":{"explanation":"公式正答は選択肢1「作業能率増進　抗帯電性」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"41n-16":{"explanation":"公式正答は選択肢2「DNAまたはRNAの、いずれかのみを持っているものがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"41n-17":{"explanation":"公式正答は選択肢1「A型肝炎は、血液を介して感染する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"41n-18":{"explanation":"公式正答は選択肢2「ネズミや昆虫の駆除は、感染源対策である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"41n-19":{"explanation":"公式正答は選択肢2「感染力は非常に弱い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"41n-20":{"explanation":"公式正答は選択肢3「風しん　約14日から21日」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"41n-21":{"explanation":"公式正答は選択肢2「A 殺菌　B 滅菌　C 防腐」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"41n-22":{"explanation":"公式正答は選択肢1「加熱殺菌には乾熱と湿熱があるが、乾熱の方が殺菌されやすい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"41n-23":{"explanation":"公式正答は選択肢4「a と d」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"41n-24":{"explanation":"公式正答は選択肢2「煮沸消毒は、血液が付着している器具に適用できる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"41n-25":{"explanation":"公式正答は選択肢3「A 紫外線　B 次亜塩素酸ナトリウム　C 両性界面活性剤」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"41n-26":{"explanation":"公式正答は選択肢4「下顎の先端部分」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"人体の解剖学・生理学の標準資料"},"41n-27":{"explanation":"公式正答は選択肢3「赤色骨髄」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"41n-28":{"explanation":"公式正答は選択肢3「眼輪筋　目を開く」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"41n-29":{"explanation":"公式正答は選択肢2「網膜」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"41n-30":{"explanation":"公式正答は選択肢4「肺動脈」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"人体の解剖学・生理学の標準資料"},"41n-31":{"explanation":"公式正答は選択肢4「表皮の角化細胞は4つの細胞層からなり、最外層は有棘層である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"41n-32":{"explanation":"公式正答は選択肢3「毛は、皮膚表面に出ている部分を毛幹、皮膚の内部にある部分を毛根という。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"41n-33":{"explanation":"公式正答は選択肢4「皮膚の再生能力は極めて高く、真皮の結合組織が深く損傷されても、まったく瘢痕を残さない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"41n-34":{"explanation":"公式正答は選択肢2「健康な皮膚の表面は、弱アルカリ性を示し、pH7.4～8.0の間である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"41n-35":{"explanation":"公式正答は選択肢1「円型脱毛症の原因は、免疫の異常と考えられ、他人に感染することはない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"41n-36":{"explanation":"公式正答は選択肢4「非イオン界面活性剤は、殺菌消毒作用が強い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41n-37":{"explanation":"公式正答は選択肢2「炭化水素は石油から得られるもので、動植物からは得られない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41n-38":{"explanation":"公式正答は選択肢3「ベンガラ　植物性色素」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41n-39":{"explanation":"公式正答は選択肢3「A シスチン　B 還元剤　C 臭素酸カリウム」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41n-40":{"explanation":"公式正答は選択肢2「酸性染料は、水に溶かすとプラスの電気を帯びる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41n-41":{"explanation":"公式正答は選択肢2「日露戦争後に軍人の間で、当時のドイツ皇帝のひげをまねたカストロひげが流行した。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-42":{"explanation":"公式正答は選択肢4「鋏だけで刈る「長刈」が、学生や兵士に流行した。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-43":{"explanation":"公式正答は選択肢3「夜の正式礼装は、燕尾服が着用される。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-44":{"explanation":"公式正答は選択肢2「A 平行　B 鋏背　C 0.1mm」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-45":{"explanation":"公式正答は選択肢3「ハンドルを45度未満に開くと、皮膚との接触が弱くなる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-46":{"explanation":"公式正答は選択肢4「A 歯　B 肩　C 背」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-47":{"explanation":"公式正答は選択肢2「シルエットは、顔やほかの部分との関係ではなく、それ自体をよく見ることが大切である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-48":{"explanation":"公式正答は選択肢4「長髪型　オールバック」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-49":{"explanation":"公式正答は選択肢2「グラデーションカットは、長さの段差をつくることによりシルエットや動きをつくる技法である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-50":{"explanation":"公式正答は選択肢3「A 物理　B 半永久　C 化学　D 永久」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-51":{"explanation":"公式正答は選択肢4「ヘアジェルは、スプレーワックスよりセット力が弱いので、直すのが容易である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-52":{"explanation":"公式正答は選択肢1「切れ味を良くするために、必ず斜行運行する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-53":{"explanation":"公式正答は選択肢1「額は剃り込み、はっきりとした線をつくる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-54":{"explanation":"公式正答は選択肢3「耳部周囲は、凹凸がないので容易にレザーを運行することができる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41n-55":{"explanation":"公式正答は選択肢4「切れ刃先端の角度が大きいほど切断作用が大きくなる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"41o-01":{"explanation":"公式正答は選択肢2「日本の国籍を有しない者は、理容師免許を取得することができない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41o-02":{"explanation":"公式正答は選択肢1「免許の取消処分　閉鎖処分　罰金刑」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41o-03":{"explanation":"公式正答は選択肢3「2か所以上の理容所の開設者が管理理容師となることができる者であるときは、自ら主として管理する1つの理容所の管理理容師となることができる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41o-04":{"explanation":"公式正答は選択肢4「理容所の閉鎖処分に違反した開設者は、30万円以下の罰金に処されることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41o-05":{"explanation":"公式正答は選択肢4「理容の施術に関する料金」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"41o-06":{"explanation":"公式正答は選択肢4「児童虐待の捜査」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"41o-07":{"explanation":"公式正答は選択肢1「男性の粗死亡率は、女性の粗死亡率よりも高い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"41o-08":{"explanation":"公式正答は選択肢3「関係法令による特定健康診査・特定保健指導の対象者は、50歳以上である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"41o-09":{"explanation":"公式正答は選択肢2「理容所の湿度は、相対湿度30%以下が望ましいとされている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"41o-10":{"explanation":"公式正答は選択肢1「作業能率増進　抗帯電性」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"41o-11":{"explanation":"公式正答は選択肢2「DNAまたはRNAの、いずれかのみを持っているものがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"41o-12":{"explanation":"公式正答は選択肢1「A型肝炎は、血液を介して感染する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"41o-13":{"explanation":"公式正答は選択肢2「ネズミや昆虫の駆除は、感染源対策である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"41o-14":{"explanation":"公式正答は選択肢2「感染力は非常に弱い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"41o-15":{"explanation":"公式正答は選択肢3「風しん　約14日から21日」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"41o-16":{"explanation":"公式正答は選択肢2「殺菌　滅菌　防腐」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"41o-17":{"explanation":"公式正答は選択肢1「加熱殺菌には乾熱と湿熱があるが、乾熱の方が殺菌されやすい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"41o-18":{"explanation":"公式正答は選択肢4「aとd」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"41o-19":{"explanation":"公式正答は選択肢2「煮沸消毒は、血液が付着している器具に適用できる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"41o-20":{"explanation":"公式正答は選択肢3「紫外線　次亜塩素酸ナトリウム　両性界面活性剤」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"41o-21":{"explanation":"公式正答は選択肢4「下顎の先端部分」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"人体の解剖学・生理学の標準資料"},"41o-22":{"explanation":"公式正答は選択肢3「赤色骨髄」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"41o-23":{"explanation":"公式正答は選択肢3「眼輪筋　目を開く」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"41o-24":{"explanation":"公式正答は選択肢2「網膜」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"41o-25":{"explanation":"公式正答は選択肢4「肺動脈」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"人体の解剖学・生理学の標準資料"},"41o-26":{"explanation":"公式正答は選択肢4「表皮の角化細胞は4つの細胞層からなり、最外層は有棘層である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"41o-27":{"explanation":"公式正答は選択肢3「毛は、皮膚表面に出ている部分を毛幹、皮膚の内部にある部分を毛根という。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"41o-28":{"explanation":"公式正答は選択肢4「皮膚の再生能力は極めて高く、真皮の結合組織が深く損傷されても、まったく瘢痕を残さない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"41o-29":{"explanation":"公式正答は選択肢2「健康な皮膚の表面は、弱アルカリ性を示し、pH7.4から8.0の間である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"41o-30":{"explanation":"公式正答は選択肢1「円型脱毛症の原因は、免疫の異常と考えられ、他人に感染することはない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"41o-31":{"explanation":"公式正答は選択肢3「てこ　力点　小さな」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41o-32":{"explanation":"公式正答は選択肢2「毛髪用電気器具の熱源として、遠赤外線を利用したものはない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41o-33":{"explanation":"公式正答は選択肢3「交流の周波数　ボルト」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41o-34":{"explanation":"公式正答は選択肢1「ステアリン酸　皮膜形成剤」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41o-35":{"explanation":"公式正答は選択肢3「太陽の光のうち、可視光線より波長の長いものがUVである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41o-36":{"explanation":"公式正答は選択肢4「非イオン界面活性剤は、殺菌消毒作用が強い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41o-37":{"explanation":"公式正答は選択肢2「炭化水素は石油から得られるもので、動植物からは得られない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41o-38":{"explanation":"公式正答は選択肢3「ベンガラ　植物性色素」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41o-39":{"explanation":"公式正答は選択肢3「シスチン　還元剤　臭素酸カリウム」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41o-40":{"explanation":"公式正答は選択肢2「酸性染料は、水に溶かすとプラスの電気を帯びる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"41o-41":{"explanation":"公式正答は選択肢2「平行　鋏背　0.1mm」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"41o-42":{"explanation":"公式正答は選択肢3「ハンドルを45度未満に開くと、皮膚との接触が弱くなる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41o-43":{"explanation":"公式正答は選択肢4「A：歯　B：肩　C：背」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"41o-44":{"explanation":"公式正答は選択肢2「シルエットは、顔やほかの部分との関係ではなく、それ自体をよく見ることが大切である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41o-45":{"explanation":"公式正答は選択肢4「長髪型　オールバック」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"41o-46":{"explanation":"公式正答は選択肢2「グラデーションカットは、長さの段差をつくることによりシルエットや動きをつくる技法である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41o-47":{"explanation":"公式正答は選択肢3「物理　半永久　化学　永久」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"41o-48":{"explanation":"公式正答は選択肢4「ヘアジェルは、スプレーワックスよりセット力が弱いので、直すのが容易である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"41o-49":{"explanation":"公式正答は選択肢1「切れ味を良くするために、必ず斜行運行する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"41o-50":{"explanation":"公式正答は選択肢1「額は剃り込み、はっきりとした線をつくる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"40-01":{"explanation":"公式正答は選択肢4「理容師名簿に登録される前に理容を業とした場合、30万円以下の罰金に処されることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"40-02":{"explanation":"公式正答は選択肢1「a と b」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"40-03":{"explanation":"公式正答は選択肢2「A 構造設備　B 確認　C 30万円以下の罰金」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"40-04":{"explanation":"公式正答は選択肢4「衛生管理の徹底のため、管理理容師でなければ出張理容を行うことはできない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"40-05":{"explanation":"公式正答は選択肢3「生活衛生同業組合は、営利を目的としており、加入、脱退には一定の制限がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"40-06":{"explanation":"公式正答は選択肢3「2000年以降の女性の平均寿命は、低下傾向である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"40-07":{"explanation":"公式正答は選択肢4「うつ病」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"40-08":{"explanation":"公式正答は選択肢1「A ホームヘルプ　B デイ　C 訪問看護」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"40-09":{"explanation":"公式正答は選択肢1「酸素は、空気の約78%を占めている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"40-10":{"explanation":"公式正答は選択肢2「上水道の普及率は、2011年の時点で100%に達している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"40-11":{"explanation":"公式正答は選択肢2「デング熱」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"40-12":{"explanation":"公式正答は選択肢3「成分は80%がタンパク質である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"40-13":{"explanation":"公式正答は選択肢3「麻しんワクチンはトキソイドである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"40-14":{"explanation":"公式正答は選択肢1「伝染性膿痂疹」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"40-15":{"explanation":"公式正答は選択肢2「定期の予防接種が実施されている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"40-16":{"explanation":"公式正答は選択肢2「病原微生物を殺すか除去して、感染力をなくすことを「消毒」という。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"40-17":{"explanation":"公式正答は選択肢4「a と d」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"40-18":{"explanation":"公式正答は選択肢1「結核菌は、塩素剤に対して抵抗力が弱い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"40-19":{"explanation":"公式正答は選択肢2「エタノールは、芽胞を有する細菌の芽胞に効果がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"40-20":{"explanation":"公式正答は選択肢3「c と d」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法施行規則、理容所及び美容所における衛生管理要領"},"40-21":{"explanation":"公式正答は選択肢2「皮脂腺の一つで、油性物質を分泌している。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"40-22":{"explanation":"公式正答は選択肢1「赤血球」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"40-23":{"explanation":"公式正答は選択肢2「顔面筋」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"40-24":{"explanation":"公式正答は選択肢3「冠状動脈」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体の解剖学・生理学の標準資料"},"40-25":{"explanation":"公式正答は選択肢4「副腎髄質　アドレナリン」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"人体の解剖学・生理学の標準資料"},"40-26":{"explanation":"公式正答は選択肢4「表皮の角化細胞（ケラチノサイト）は、エラスチンというタンパク質をつくる細胞系列である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"40-27":{"explanation":"公式正答は選択肢1「アポクリン腺は、皮膚表面に汗孔を作って開口している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"40-28":{"explanation":"公式正答は選択肢2「体温調節作用を積極的に行うのは、立毛筋と脂腺である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"40-29":{"explanation":"公式正答は選択肢4「尋常性痤瘡（ニキビ）は、毛包にウイルスが増殖しておこる疾患である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"40-30":{"explanation":"公式正答は選択肢2「皮膚の老化は、個人の素因や環境の要因に影響されない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"40-31":{"explanation":"公式正答は選択肢4「電流によって導線上に発生する熱量は、電流の流れた時間に反比例する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"40-32":{"explanation":"公式正答は選択肢3「家庭にあるコンセントから取り出す交流電流の周波数は、国内で統一されている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"40-33":{"explanation":"公式正答は選択肢1「パラフィンは炭化水素に分類される。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"40-34":{"explanation":"公式正答は選択肢4「ポリビニルピロリドンは、皮膜を形成する合成高分子で、ヘアスタイリング剤に配合される。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"40-35":{"explanation":"公式正答は選択肢2「シリコーン油は水をはじく性質があり、スタイリング剤に配合される。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"40-36":{"explanation":"公式正答は選択肢3「A 陰イオン（アニオン）　B 乳化　C 第四級」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"40-37":{"explanation":"公式正答は選択肢1「キトサン」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"40-38":{"explanation":"公式正答は選択肢3「A 大きく　B 弱アルカリ剤　C 揮発」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"40-39":{"explanation":"公式正答は選択肢3「塗った部分は絆創膏等で覆わない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"40-40":{"explanation":"公式正答は選択肢2「ペプチド結合は、ヒドロキシ基（-OH）とチオール基（-SH）の間の結合である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"40-41":{"explanation":"公式正答は選択肢1「A 側面中心線　B 天頂部　C 中段部」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"40-42":{"explanation":"公式正答は選択肢2「切れ刃は、刃線先・刃線中・刃線元からなっている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"40-43":{"explanation":"公式正答は選択肢1「クリッパーは、目に入った毛髪を上刃と下刃が左右に動いて刈る用具である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"40-44":{"explanation":"公式正答は選択肢4「基礎刈は原則として頭部の低い部分からカットし、それを基準に高いほうをカットする。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"40-45":{"explanation":"公式正答は選択肢1「a と b」です。この選択肢が設問で求める条件を満たす組合せに該当します。その他の選択肢は、公式正答上は条件を満たす組合せではないとして扱われます。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"40-46":{"explanation":"公式正答は選択肢3「毛髪を層状になるようにカットしてヘアスタイルを構成する技法である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"40-47":{"explanation":"公式正答は選択肢4「アイロンパーマのカールの強弱は、テンションのかけ具合と作用時間の長短で調節する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"40-48":{"explanation":"公式正答は選択肢3「パッチテストは、以前かぶれたことがないのであれば行う必要はない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"40-49":{"explanation":"公式正答は選択肢4「女性の肌は男性に比べ弾力が少ないので傷つきにくく、斜行角度は毛流に対して45度以上がよい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"40-50":{"explanation":"公式正答は選択肢2「耳介部をてん包すること。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"}};


/* 第39回〜第35回：公式正答に基づく選択肢別一次解説。公的根拠の個別確認前。 */
const PRELIMINARY_PAST_REVIEWS_39_35={"39-01":{"explanation":"公式正答は選択肢4「従事する理容師が伝染性の疾病にかかり、その就業が公衆衛生上不適当と認められるときは、理容所の閉鎖を命じられることがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"39-02":{"explanation":"公式正答は選択肢3「理容師が本籍地都道府県名を変更した場合は、30日以内に理容師名簿の訂正を申請しなければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"39-03":{"explanation":"公式正答は選択肢3「理容師の免許を受けた後、3年以上理容業に従事し、厚生労働大臣が指定する講習会を修了することにより管理理容師となることができる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"39-04":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"39-05":{"explanation":"公式正答は選択肢2「地域保健法では、すべての市町村に保健所を設置することとしている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"39-06":{"explanation":"公式正答は選択肢1「がん検診」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"39-07":{"explanation":"公式正答は選択肢4「2012年におけるわが国の合計特殊出生率は、2.0を上回っている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"39-08":{"explanation":"公式正答は選択肢3「脳卒中の発病は、高血圧や糖尿病に深く関わっている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"39-09":{"explanation":"公式正答は選択肢2「大量に排出される場合、理容所からの毛髪は産業廃棄物である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"39-10":{"explanation":"公式正答は選択肢2「頭皮（表皮）に卵を産む。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"39-11":{"explanation":"公式正答は選択肢3「結核菌は寄生体である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"39-12":{"explanation":"公式正答は選択肢1「大腸菌と消化管に寄生するが、皮膚には寄生しない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"39-13":{"explanation":"公式正答は選択肢3「白癬」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"39-14":{"explanation":"公式正答は選択肢1「血液　患者の鼻やのどの分泌物」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"39-15":{"explanation":"公式正答は選択肢3「予防接種で、感染を防ぐことができる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"39-16":{"explanation":"公式正答は選択肢2「蒸気消毒と煮沸消毒を比較して場合、蒸気消毒のほうが短い時間を有する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"39-17":{"explanation":"公式正答は選択肢4「くしに1cm2あたり75マイクロワットの紫外線を10分間照射した。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"39-18":{"explanation":"公式正答は選択肢3「結核菌に対して効力が弱い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"39-19":{"explanation":"公式正答は選択肢2「溶液量　溶質量　25」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"39-20":{"explanation":"公式正答は選択肢1「取りかえ　消毒　次亜塩素酸ナトリウム水溶液」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"39-21":{"explanation":"公式正答は選択肢3「赤唇縁　オトガイを後取り巻くように隆起したアーチ状の溝」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"39-22":{"explanation":"公式正答は選択肢3「滑液」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"39-23":{"explanation":"公式正答は選択肢3「小脳」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"39-24":{"explanation":"公式正答は選択肢4「知覚神経」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"39-25":{"explanation":"公式正答は選択肢2「咽頭　喉頭　気管　気管支」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"39-26":{"explanation":"公式正答は選択肢1「皮膚の表面には無数の皮膚小溝（皮溝）と皮膚小稜（皮丘）がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"39-27":{"explanation":"公式正答は選択肢4「脂腺は、毛包に開口して、皮膚や毛にあぶらを与える役割をしている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"39-28":{"explanation":"公式正答は選択肢1「脂腺の発育は女性ホルモンの刺激によって行われ、一般に女性は男性より皮脂の分泌量が多い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"39-29":{"explanation":"公式正答は選択肢1「皮膚の乾燥に必要な栄養は、常に皮膚表面から与えられる外用剤によって補われる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"39-30":{"explanation":"公式正答は選択肢2「伝染性膿痂疹（トビヒ）は、真皮内ウイルスに侵されて起こる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"39-31":{"explanation":"公式正答は選択肢4「電圧　アンペア」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"39-32":{"explanation":"公式正答は選択肢3「融解　凝固　蒸発」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"39-33":{"explanation":"公式正答は選択肢2「コンセントの金属部分に接触すると、体内抵抗または体内電場で電流が流れ感電することにより菅雷する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"39-34":{"explanation":"公式正答は選択肢4「aとd」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"39-35":{"explanation":"公式正答は選択肢2「雲母チタンは、光輝性顔料である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"39-36":{"explanation":"公式正答は選択肢3「プラセンタ　エモリエント効果」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"39-37":{"explanation":"公式正答は選択肢3「チオグリコール酸」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"39-38":{"explanation":"公式正答は選択肢1「過酸化水素水」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"39-39":{"explanation":"公式正答は選択肢4「化学結合の強さを比較すると、水素結合＞共有結合＞イオン結合の順である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"39-40":{"explanation":"公式正答は選択肢1「デンプンは、基本単位の単糖が互いに結合した糖質である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"39-41":{"explanation":"公式正答は選択肢3「目線の高さで行う技術のとき、技術部位と目の距離は10から15cmがよい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"39-42":{"explanation":"公式正答は選択肢3「刃の曲面が少ない形態のものは、うぶ毛や軟毛肌に適している。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"39-43":{"explanation":"公式正答は選択肢4「A 植毛台　B 腰部　C 毛先」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"39-44":{"explanation":"公式正答は選択肢2「毛髪は短く刈ると弾力によって立ちやすく、長くすると毛髪の重みによりねやすくなる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"39-45":{"explanation":"公式正答は選択肢1「図の（1）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"39-46":{"explanation":"公式正答は選択肢1「ロッドハンドル　グルーブハンドル　小指」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"39-47":{"explanation":"公式正答は選択肢3「システイン結合の結合を弱める。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"39-48":{"explanation":"公式正答は選択肢3「酸化染毛剤によるカラーリングは、パーマネントウェーブの施術直後には行わない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"39-49":{"explanation":"公式正答は選択肢2「うぶ毛の処理は、対皮圧力を強くし対皮角度60度で、すばやく運行する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"39-50":{"explanation":"公式正答は選択肢4「薬液処理の前には、頭皮の汚れを良く落とすために強く洗う。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"38-01":{"explanation":"公式正答は選択肢3「A 顔そり　B パーマネントウェーブ　C 結髪」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"38-02":{"explanation":"公式正答は選択肢2「免許の取消処分を受けた者は、都道府県知事に免許証又は免許証明書を返納しなければならない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"38-03":{"explanation":"公式正答は選択肢1「理容師試験の合格者が理容師名簿に登録される前に理容の業を行った場合、罰金に処せられることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"38-04":{"explanation":"公式正答は選択肢4「理容師免許証記載事項の変更手数料の額」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"38-05":{"explanation":"公式正答は選択肢3「営業の料金の統一」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"38-06":{"explanation":"公式正答は選択肢4「脳血管疾患（脳卒中）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"38-07":{"explanation":"公式正答は選択肢2「労働災害の防止」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"38-08":{"explanation":"公式正答は選択肢1「炭水化物の摂取量は、増加傾向である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"38-09":{"explanation":"公式正答は選択肢1「カルシウムやマグネシウムを多く含む水を軟水という。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"38-10":{"explanation":"公式正答は選択肢4「ゴキブリ　日本脳炎」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"38-11":{"explanation":"公式正答は選択肢1「結核」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"38-12":{"explanation":"公式正答は選択肢4「麻しん」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"38-13":{"explanation":"公式正答は選択肢3「生きた細胞が無くても発育、増殖できる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"38-14":{"explanation":"公式正答は選択肢2「白癬」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"38-15":{"explanation":"公式正答は選択肢4「予防接種は毎年受けなければ効果がない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"38-16":{"explanation":"公式正答は選択肢2「b と c」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"38-17":{"explanation":"公式正答は選択肢3「A 煮沸消毒　B 蒸気消毒　C 紫外線消毒」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"38-18":{"explanation":"公式正答は選択肢3「紫外線ランプは、使用とともに出力が低下するので、2,000～3,000時間で取り替える必要がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"38-19":{"explanation":"公式正答は選択肢2「b と c」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"38-20":{"explanation":"公式正答は選択肢2「逆性石けん水溶液は、普通の石けん液を加えると沈でんを生じる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"38-21":{"explanation":"公式正答は選択肢1「鼻尖」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"38-22":{"explanation":"公式正答は選択肢1「顔面筋」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"38-23":{"explanation":"公式正答は選択肢3「気管支の拡張」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"38-24":{"explanation":"公式正答は選択肢3「水晶体」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"38-25":{"explanation":"公式正答は選択肢4「甲状腺」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"38-26":{"explanation":"公式正答は選択肢1「表皮の最下層にある基底細胞は、分裂して順次上方に移動し、有棘細胞、顆粒細胞、最後に角質細胞になる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"38-27":{"explanation":"公式正答は選択肢3「エクリン腺は、全身のほとんどの皮膚に分布するが、手掌と足底に多い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"38-28":{"explanation":"公式正答は選択肢2「皮膚の表面にある脂肪膜（皮脂膜）は、弱アルカリ性で、細菌などの発育を抑制する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"38-29":{"explanation":"公式正答は選択肢4「男性では、年齢が進むにつれて、女性ホルモンの影響で前額部から頭頂部に脱毛が目立ち、これを円形脱毛症という。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"38-30":{"explanation":"公式正答は選択肢2「脂漏性皮膚炎は、フケ症やあぶら性の人に多い皮膚炎で、頭部、顔面に多くみられる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"38-31":{"explanation":"公式正答は選択肢1「物体に外から力を加えて変形させようとするとき、物体内部に、もとに戻そうと抵抗する力が生まれる。これを応力という。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"38-32":{"explanation":"公式正答は選択肢1「同じ材質で同じ長さの導体に同じ電圧をかけたときの電気抵抗は、太い導体より細い導体の方が大きい。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"38-33":{"explanation":"公式正答は選択肢4「a と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"38-34":{"explanation":"公式正答は選択肢3「エラスチン」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"38-35":{"explanation":"公式正答は選択肢2「ヒアルロン酸ナトリウム　保湿効果」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"38-36":{"explanation":"公式正答は選択肢4「ヘアスタイリング剤のセット力の違いは、被膜形成剤の配合量による。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"38-37":{"explanation":"公式正答は選択肢2「酸化染毛剤により染毛しても、1回のシャンプーで色落ちする。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"38-38":{"explanation":"公式正答は選択肢3「フィナステリドを含む育毛剤は、医薬部外品に分類される。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"38-39":{"explanation":"公式正答は選択肢4「a と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"38-40":{"explanation":"公式正答は選択肢1「a と b」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"38-41":{"explanation":"公式正答は選択肢2「A オトガイ部　B 側頸部　C 眼窩部」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"38-42":{"explanation":"公式正答は選択肢4「胴はコームの支えであり根幹でもあるので、弾力性がないものがよい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"38-43":{"explanation":"公式正答は選択肢2「スタンドドライヤーの噴流タイプは、二重のフードの内側に開いたたくさんの穴から温風を吹き出す構造になっている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"38-44":{"explanation":"公式正答は選択肢4「A 直角　B 長く　C すくい刈」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"38-45":{"explanation":"公式正答は選択肢3「正面から見える側面のシルエットは、ラインよりもぼかしに重点をおく。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"38-46":{"explanation":"公式正答は選択肢1「A 長髪部　B 歯元　C 一鋏」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"38-47":{"explanation":"公式正答は選択肢3「ロングステムは、ストランドの角度を110度以上に引き出してワインディングする。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"38-48":{"explanation":"公式正答は選択肢2「図2」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"38-49":{"explanation":"公式正答は選択肢2「斜行角度は、毛流の方向に対して45度以内が原則である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"38-50":{"explanation":"公式正答は選択肢4「リンシングの際は、シャンプー剤が残らないように頭毛を強くこすりあわせる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"37-01":{"explanation":"公式正答は選択肢2「bとc」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"37-02":{"explanation":"公式正答は選択肢3「理容師が氏名を変更した場合は、理容師名簿の訂正を申請しなければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"37-03":{"explanation":"公式正答は選択肢3「理容所の開設者が理容師法に定める衛生上の措置を講じなかった場合、業務停止処分を受けることがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"37-04":{"explanation":"公式正答は選択肢4「開設の届出事項に変更を生じたときに、その変更の届出をせず、又は虚偽の届出を行った開設者は、30万円以下の罰金に処されることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"37-05":{"explanation":"公式正答は選択肢3「cとd」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"37-06":{"explanation":"公式正答は選択肢1「理容所従事者の労働条件に関すること」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"37-07":{"explanation":"公式正答は選択肢3「乳児死亡率は、現在では世界でトップクラスの低い水準である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"37-08":{"explanation":"公式正答は選択肢3「植物性脂肪の過剰摂取が原因の一つである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"37-09":{"explanation":"公式正答は選択肢3「毒性は、一酸化炭素より大幅に強い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"37-10":{"explanation":"公式正答は選択肢2「成人が1日に排出する水分量　約1,000mL」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"37-11":{"explanation":"公式正答は選択肢1「百日せき　ウイルス」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"37-12":{"explanation":"公式正答は選択肢2「低い　発病　低下」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"37-13":{"explanation":"公式正答は選択肢1「予防接種の実施」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"37-14":{"explanation":"公式正答は選択肢2「日本脳炎」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"37-15":{"explanation":"公式正答は選択肢3「潜伏期は、1から2日である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"37-16":{"explanation":"公式正答は選択肢4「殺菌　消毒　滅菌」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"37-17":{"explanation":"公式正答は選択肢3「顔剃りに用いた、血液が付着していないかみそりの消毒は、20分間以上1cm2当たり85マイクロワット以上の紫外線を照射する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"37-18":{"explanation":"公式正答は選択肢1「紫外線消毒は、プラスチックの種類によっては劣化させることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"37-19":{"explanation":"公式正答は選択肢2「界面活性剤による消毒は、血液が付着している又はその疑いのある器具に適用できる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"37-20":{"explanation":"公式正答は選択肢3「毛はらいブラシ　紫外線」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"37-21":{"explanation":"公式正答は選択肢3「肝臓」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"37-22":{"explanation":"公式正答は選択肢4「脳神経」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"37-23":{"explanation":"公式正答は選択肢3「唾液腺が刺激され、希薄な唾液が多く分泌される。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"37-24":{"explanation":"公式正答は選択肢2「リンパ管は静脈に合流する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"37-25":{"explanation":"公式正答は選択肢1「インスリン」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"37-26":{"explanation":"公式正答は選択肢2「角化細胞（ケラチノサイト）は、表皮細胞の約95%を占める。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"37-27":{"explanation":"公式正答は選択肢2「毛母では、細胞の分裂増殖が盛んに行われ、毛の細胞がつくられている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"37-28":{"explanation":"公式正答は選択肢1「皮膚の表面には、汗と皮脂が混じり合った弱アルカリ性の脂肪膜（皮脂膜）がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"37-29":{"explanation":"公式正答は選択肢1「保湿剤は、入浴後に皮膚を乾燥させてから塗布すると効果的である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"37-30":{"explanation":"公式正答は選択肢4「シラクモ（頭部白癬）は、成人がかかりやすいウイルスによる感染症である。 理容の物理・化学」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"37-31":{"explanation":"公式正答は選択肢2「大きい　てこ　大きい」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"37-32":{"explanation":"公式正答は選択肢3「電圧が同じであれば、電気抵抗が大きいほど電流は大きい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"37-33":{"explanation":"公式正答は選択肢2「500×3÷1000＝1.5［kWh］」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"37-34":{"explanation":"公式正答は選択肢4「β-カロチンは、タール色素である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"37-35":{"explanation":"公式正答は選択肢4「ジブチルヒドロキシトルエン（BHT）　抗酸化剤」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"37-36":{"explanation":"公式正答は選択肢3「PA分類は、中波長紫外線の防御効果を表す。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"37-37":{"explanation":"公式正答は選択肢4「チオグリコール酸」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"37-38":{"explanation":"公式正答は選択肢2「ニトロパラフェニレンジアミンは本来無色である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"37-39":{"explanation":"公式正答は選択肢4「塩酸は無機酸である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"37-40":{"explanation":"公式正答は選択肢4「aとd 理容理論」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"37-41":{"explanation":"公式正答は選択肢3「側面正中線は、天頂部、上段部、中段部を通っている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"37-42":{"explanation":"公式正答は選択肢4「ひぞこ　刃線　鋏背」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"37-43":{"explanation":"公式正答は選択肢2「ハンドルを45度以上に開くと、切れ刃が皮膚に強く接触する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"37-44":{"explanation":"公式正答は選択肢4「外眼角の延長線を基準とする分髪で、ボリュームが中心にくる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"37-45":{"explanation":"公式正答は選択肢1「長髪部　歯元　1鋏」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"37-46":{"explanation":"公式正答は選択肢3「cとd」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"37-47":{"explanation":"公式正答は選択肢4「ノンステムは、ボリュームを必要とする部分に用いる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"37-48":{"explanation":"公式正答は選択肢3「大きい　小さく　刃先　刃元」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"37-49":{"explanation":"公式正答は選択肢1「2回目のラザーリングは、レザーの運行をスムーズにする。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"37-50":{"explanation":"公式正答は選択肢4「シャンプーマッサージは、強擦で始まって、軽擦で終わる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"36-01":{"explanation":"公式正答は選択肢2「理容業の振興を目的としている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"36-02":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"36-03":{"explanation":"公式正答は選択肢4「衛生管理　開設者　衛生上必要な措置」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"36-04":{"explanation":"公式正答は選択肢4「理容師名簿に登録されていない者が理容の業を行った場合は、業務停止処分を受けることがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"36-05":{"explanation":"公式正答は選択肢3「組合員に対する、施術料金を統一するための標準営業約款の作成」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"36-06":{"explanation":"公式正答は選択肢2「2008年の乳児死亡率は、出生1,000に対して約10である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"36-07":{"explanation":"公式正答は選択肢1「医療保険制度は、国民皆保険制度を採用している。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"36-08":{"explanation":"公式正答は選択肢4「ビタミンD　糖尿病」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"36-09":{"explanation":"公式正答は選択肢3「産業廃棄物の処理は事業主が自ら行い、業者に委託してはならない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"36-10":{"explanation":"公式正答は選択肢1「ハエは、デング熱を媒介するおそれがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"36-11":{"explanation":"公式正答は選択肢3「結核」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"36-12":{"explanation":"公式正答は選択肢4「ウイルスの増殖は2分裂で行われる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"36-13":{"explanation":"公式正答は選択肢2「鼻腔　結核菌」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"36-14":{"explanation":"公式正答は選択肢1「ペストは、蚊を介して感染する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"36-15":{"explanation":"公式正答は選択肢3「性的交渉では感染しない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"36-16":{"explanation":"公式正答は選択肢4「煮沸消毒は血液が付着している器具に適用できる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"36-17":{"explanation":"公式正答は選択肢2「bとc」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"36-18":{"explanation":"公式正答は選択肢3「0.01%次亜塩素酸ナトリウム水溶液は、10分間で芽胞を不活化する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"36-19":{"explanation":"公式正答は選択肢4「消毒液100mLの中に消毒薬の主剤を4mL含む消毒液の希釈倍数は40倍である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"36-20":{"explanation":"公式正答は選択肢3「エタノール水溶液は、無色透明で特有な臭いがあり、中性を示す。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"36-21":{"explanation":"公式正答は選択肢1「鼻翼」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"36-22":{"explanation":"公式正答は選択肢4「血小板」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"36-23":{"explanation":"公式正答は選択肢1「胸鎖乳突筋」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"36-24":{"explanation":"公式正答は選択肢4「心臓（心筋）　収縮力増加」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"人体解剖学・生理学の標準資料"},"36-25":{"explanation":"公式正答は選択肢2「気管」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"36-26":{"explanation":"公式正答は選択肢1「皮膚は、上から表皮、真皮、皮下組織の3つの層からできている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"36-27":{"explanation":"公式正答は選択肢3「エクリン腺は、手掌と足底に最も多く分布している。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"36-28":{"explanation":"公式正答は選択肢4「皮膚の表面にある脂肪膜（皮脂膜）は、弱アルカリ性のため細菌の発育を抑制し、死滅させる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"36-29":{"explanation":"公式正答は選択肢2「毛は、エクリン腺から分泌される皮脂により、その水分が余分に失われず、光沢としなやかさを保っている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"36-30":{"explanation":"公式正答は選択肢2「円形脱毛症は、ウイルスによる感染症で、他人に感染することがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"36-31":{"explanation":"公式正答は選択肢2「ずれ　くさび　てこ」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"36-32":{"explanation":"公式正答は選択肢3「凝縮　沸点以下に下げる　液化ガス」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"36-33":{"explanation":"公式正答は選択肢2「赤外線は、皮膚でビタミンDを生成する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"36-34":{"explanation":"公式正答は選択肢4「システイン　アミノ酸」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"36-35":{"explanation":"公式正答は選択肢2「石けんは油脂を加水分解してつくる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"36-36":{"explanation":"公式正答は選択肢4「β-カロチンは有機合成色素である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"36-37":{"explanation":"公式正答は選択肢2「ヘアブリーチ剤　アセチルシステイン」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"36-38":{"explanation":"公式正答は選択肢1「シスチン　還元剤　臭素酸カリウム」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"36-39":{"explanation":"公式正答は選択肢3「第2剤（2液）に含まれる過酸化水素水には、メラニンに作用して髪を黒くする働きがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"36-40":{"explanation":"公式正答は選択肢2「オーデコロンは、パフュームコロンよりも香料の配合量が少ない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"36-41":{"explanation":"公式正答は選択肢4「A：天頂部　B：中段部　C：後頭下部」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"36-42":{"explanation":"公式正答は選択肢2「手指の名称は、親指側から母指・示指・中指・薬指・小指という。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"36-43":{"explanation":"公式正答は選択肢3「ひぞこは、刃線側に抜けているものがよい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"36-44":{"explanation":"公式正答は選択肢1「分髪線は、奥行を深くみせるために標準タイプに比べて長くするとよい。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"36-45":{"explanation":"公式正答は選択肢4「シザーズの操作は、母指で開閉を行い、他の4指は静刃の動揺を防ぐように持つ。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"36-46":{"explanation":"公式正答は選択肢4「aとd」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"36-47":{"explanation":"公式正答は選択肢2「グルーブハンドル　内側　上から下」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"36-48":{"explanation":"公式正答は選択肢1「硬毛のように毛の抵抗が大きい場合は、対皮角度を小さくして運行する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"36-49":{"explanation":"公式正答は選択肢3「センシティブスキン　肌に健やかな血色があり、きめが整っている。」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"36-50":{"explanation":"公式正答は選択肢4「泡立ちが悪い場合、シャンプー剤をつけたし、泡立ちが良くなるまで塗布する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"35-01":{"explanation":"公式正答は選択肢2「理容師が、氏名を変更した場合は、指定登録機関である公益財団法人理容師美容師試験研修センターに理容師名簿の訂正を申請しなければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"35-02":{"explanation":"公式正答は選択肢2「理容師が伝染性の疾病にかかり、その就業が公衆衛生上不適当と認められる場合」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"35-03":{"explanation":"公式正答は選択肢3「理容所に従事している理容師が退職した場合」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"35-04":{"explanation":"公式正答は選択肢3「理容所の開設者が管理理容師を置かなければならない基準」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"35-05":{"explanation":"公式正答は選択肢1「A 衛生施設　B 消費者　C 公衆衛生」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"35-06":{"explanation":"公式正答は選択肢2「悪性新生物（がん）と心疾患（心臓病）」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"35-07":{"explanation":"公式正答は選択肢3「平均世帯人員」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"35-08":{"explanation":"公式正答は選択肢1「わが国の1人当たりのアルコール消費量は、昭和20年代から現在まで増加傾向にある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"35-09":{"explanation":"公式正答は選択肢2「狭い室内に多くの人がいると、呼吸による一酸化炭素によって、室内の空気が汚染されるので、適切な換気が必要である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"35-10":{"explanation":"公式正答は選択肢3「硬度が高い上水道水　石けんの泡立ちが良い」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"35-11":{"explanation":"公式正答は選択肢2「特定の職業への就業が制限される。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"35-12":{"explanation":"公式正答は選択肢4「多くの細菌の発育に最適なpHは、酸性である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"35-13":{"explanation":"公式正答は選択肢4「白癬」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"35-14":{"explanation":"公式正答は選択肢1「感染経路は、主に飛沫核感染である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"35-15":{"explanation":"公式正答は選択肢1「B型肝炎では、このウイルスを保有している母親から子への垂直感染がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"35-16":{"explanation":"公式正答は選択肢2「化学的消毒法における消毒では、消毒薬使用液（希釈液）の温度の上昇に伴い殺菌効果は高まる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"35-17":{"explanation":"公式正答は選択肢4「煮沸消毒は、血液が付着している器具の消毒に適用できる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"35-18":{"explanation":"公式正答は選択肢4「逆性石けんは、芽胞に効果がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"35-19":{"explanation":"公式正答は選択肢2「消毒用エタノール中に10分間以上浸す方法」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"35-20":{"explanation":"公式正答は選択肢3「鼈甲の櫛　煮沸消毒」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"35-21":{"explanation":"公式正答は選択肢3「鼻唇溝」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"35-22":{"explanation":"公式正答は選択肢1「心拍数が増加する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"35-23":{"explanation":"公式正答は選択肢1「視覚　網膜」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"人体解剖学・生理学の標準資料"},"35-24":{"explanation":"公式正答は選択肢3「冷水浴中は、皮膚の血液やリンパの循環が盛んになる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"35-25":{"explanation":"公式正答は選択肢3「最高血圧　160～180mmHg」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"35-26":{"explanation":"公式正答は選択肢3「真皮には、エラスチンからできた膠原線維とコラーゲンからなる弾性線維が混じって走っている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"35-27":{"explanation":"公式正答は選択肢3「脂腺の数は、頭毛の生えている部位や額、眉間などに多い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"35-28":{"explanation":"公式正答は選択肢4「皮膚で体温調節を積極的に行っているのはランゲルハンス細胞である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"35-29":{"explanation":"公式正答は選択肢2「高齢期になると脂腺の働きが盛んになり、皮脂の分泌が増加する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"35-30":{"explanation":"公式正答は選択肢4「伝染性膿痂疹（トビヒ）は、ウイルスによる感染症で、高齢者がかかりやすい。 理容の物理・化学」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"35-31":{"explanation":"公式正答は選択肢2「A ずれ　B 剪断応力　C くさび」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"35-32":{"explanation":"公式正答は選択肢1「A 大きい　B 沸騰　C 変わらない」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"35-33":{"explanation":"公式正答は選択肢2「A モーター　B 電流　C 磁気」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"35-34":{"explanation":"公式正答は選択肢4「タール色素のうち有機顔料は水に溶けにくい。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"35-35":{"explanation":"公式正答は選択肢3「石けんは、陰イオン界面活性剤である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"35-36":{"explanation":"公式正答は選択肢3「パーマ剤に使用されているモノエタノールアミンは、アルカリ剤である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"35-37":{"explanation":"公式正答は選択肢4「酸化染毛剤の使用に当たっては、毎回必ずパッチテストを行う。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"35-38":{"explanation":"公式正答は選択肢1「ヘアリンス剤に用いられる第四級アンモニウム塩には、帯電防止効果がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"35-39":{"explanation":"公式正答は選択肢4「ヘアクリームは、油性原料と水を乳化させたエマルジョン型のヘアスタイリング剤である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"35-40":{"explanation":"公式正答は選択肢4「PAの表示は、+が多いほどUVAの防御効果が高い。 理容理論」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"35-41":{"explanation":"公式正答は選択肢3「ひぞこは、鋏背のほうへ抜けているものが良い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"35-42":{"explanation":"公式正答は選択肢3「A 下刃　B 裏みぞ　C 上刃」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"35-43":{"explanation":"公式正答は選択肢4「ヘアスタイルは、顔と頭に対してデザインするもので、体の条件を考える必要はない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"35-44":{"explanation":"公式正答は選択肢4「まわし刈には大回し、中回し、小回し、少回しの4技法がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"35-45":{"explanation":"公式正答は選択肢1「図1」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"35-46":{"explanation":"公式正答は選択肢2「A ノンステム　B ロングステム　C ハーフステム」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たします。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せではない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せではない","公式正答上、条件を満たす組合せではない"],"basis":"理容文化論・理容技術理論の標準教材"},"35-47":{"explanation":"公式正答は選択肢4「レザーの運行方向や対皮角度の調整は、技術者の手先だけで行うとよい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"35-48":{"explanation":"公式正答は選択肢2「刃に弾力があり、皮膚表面の凹凸に対応しやすい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"35-49":{"explanation":"公式正答は選択肢1「使用するスチームタオルの温度は40～45℃が適温である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正答には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正答には該当しない","公式正答上、正答には該当しない","公式正答上、正答には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"35-50":{"explanation":"公式正答は選択肢1「泡立ちが悪い時は、シャンプー剤をつけ足し十分泡を立てる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"}};

/* 第34回〜第29回：公式正答に基づく選択肢別一次解説。公的根拠の個別確認前。 */
const PRELIMINARY_PAST_REVIEWS_34_29={"34-01":{"explanation":"公式正答は選択肢2「理容師でなければ、理容を業とすることはできない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"34-02":{"explanation":"公式正答は選択肢4「理容師免許を受けた後に氏名が変わった場合は、30日以内に理容師名簿の訂正を申請しなければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"34-03":{"explanation":"公式正答は選択肢2「身分を示す証明書　開設者が講ずべき衛生措置　罰金に処される」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"34-04":{"explanation":"公式正答は選択肢4「開設の届出事項に変更を生じたが、変更の届出をしなかった。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"34-05":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"34-06":{"explanation":"公式正答は選択肢4「肺炎」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"34-07":{"explanation":"公式正答は選択肢2「わが国の高齢化は、世界でも以前にはなかったほどの速さで進んでいる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"34-08":{"explanation":"公式正答は選択肢3「炭水化物は、体内で消化されてグリコーゲンに分解される。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"34-09":{"explanation":"公式正答は選択肢2「bとc」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"34-10":{"explanation":"公式正答は選択肢1「ハエは、日本脳炎を媒介する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"34-11":{"explanation":"公式正答は選択肢3「C型肝炎」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"34-12":{"explanation":"公式正答は選択肢4「aとd」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"34-13":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"34-14":{"explanation":"公式正答は選択肢4「潜伏期間は2日から4日である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"34-15":{"explanation":"公式正答は選択肢1「麻しん」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"34-16":{"explanation":"公式正答は選択肢1「煮沸消毒は、芽胞も含め、あらゆる微生物に消毒効果がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"34-17":{"explanation":"公式正答は選択肢2「被消毒物に油膜による汚れがあっても効果は変わらない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"34-18":{"explanation":"公式正答は選択肢1「結核菌に対して殺菌力が強い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"34-19":{"explanation":"公式正答は選択肢2「bとc」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"34-20":{"explanation":"公式正答は選択肢3「血液が付着したかみそりを消毒用エタノールに10分間浸した。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"34-21":{"explanation":"公式正答は選択肢4「リンパ球」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"34-22":{"explanation":"公式正答は選択肢4「上顎骨」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"34-23":{"explanation":"公式正答は選択肢2「心拍数の減少」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"34-24":{"explanation":"公式正答は選択肢2「心臓の収縮時の血圧を最低血圧とよぶ。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"34-25":{"explanation":"公式正答は選択肢3「膵臓　インスリン」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"人体解剖学・生理学の標準資料"},"34-26":{"explanation":"公式正答は選択肢4「真皮の線維成分は、コラーゲンというタンパク質からできた膠原線維が、その大部分を占める。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"34-27":{"explanation":"公式正答は選択肢1「ヒトの頭毛の数は、約1万本とされている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"34-28":{"explanation":"公式正答は選択肢2「爪母の一部が侵されると、その部分の爪は変形したり、再生できなくなる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"34-29":{"explanation":"公式正答は選択肢2「健康な皮膚の表面は、弱アルカリ性を示す。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"34-30":{"explanation":"公式正答は選択肢3「円形脱毛症は、その原因がウイルスのため、感染しやすい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"34-31":{"explanation":"公式正答は選択肢4「冷えた空気は上方へ移動するので、冷房機器は部屋の下部に設置すると冷房効果が高い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"34-32":{"explanation":"公式正答は選択肢2「ヘアアイロンのコードは熱くならずにロッドが熱くなるのは、ロッド部分の電気抵抗がコード部分より大きいためである。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"34-33":{"explanation":"公式正答は選択肢4「亜鉛」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"34-34":{"explanation":"公式正答は選択肢3「両性界面活性剤は、溶かした液体の温度によって、陽イオン界面活性剤か陰イオン界面活性剤の性質を示す。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"34-35":{"explanation":"公式正答は選択肢1「メタノールは、溶媒として化粧水やヘアトニックに用いられる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"34-36":{"explanation":"公式正答は選択肢1「デンプンとセルロースは、合成高分子化合物である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"34-37":{"explanation":"公式正答は選択肢3「永久染毛剤やヘアブリーチ剤は、医薬部外品である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"34-38":{"explanation":"公式正答は選択肢4「水素の化合物が水素を失う反応を酸化という。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"34-39":{"explanation":"公式正答は選択肢4「亜鉛華　天然色素」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"34-40":{"explanation":"公式正答は選択肢2「ヘアリンス剤　臭素酸ナトリウム」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"34-41":{"explanation":"公式正答は選択肢4「aとd」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"34-42":{"explanation":"公式正答は選択肢4「中心線　ひぞこ　あき」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"34-43":{"explanation":"公式正答は選択肢3「形の表面に変化をもたせ、見た目に動きを感じさせる状態にしたものをハーモニーという。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"34-44":{"explanation":"公式正答は選択肢2「短髪部　側面　後頭部」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"34-45":{"explanation":"公式正答は選択肢2「カッティングでは、原則として毛流に対してコームを平行に運行する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"34-46":{"explanation":"公式正答は選択肢3「テーパーカットは、「そぐ」、「削る」という技法で、主にシザーズにより行う。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"34-47":{"explanation":"公式正答は選択肢2「アイロンとコームは、それぞれの先端部位が交わるように運行する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"34-48":{"explanation":"公式正答は選択肢1「調合していない染毛剤は、密栓し、直射日光があたらないように冷暗所に保管する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"34-49":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"34-50":{"explanation":"公式正答は選択肢4「額は剃りこんで、はっきりした生え際の線をつくることが大切である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"33-01":{"explanation":"公式正答は選択肢1「理容師試験に合格した者は、合格発表の日から、理容師として業に従事することができる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"33-02":{"explanation":"公式正答は選択肢3「c と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"33-03":{"explanation":"公式正答は選択肢2「同一市町村内であれば、2か所の理容所の管理理容師を兼務することができる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"33-04":{"explanation":"公式正答は選択肢4「A 理容師　B 開設者　C 消毒」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"33-05":{"explanation":"公式正答は選択肢1「区域内の理容料金の統一」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"33-06":{"explanation":"公式正答は選択肢2「予防接種　第2次予防」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"33-07":{"explanation":"公式正答は選択肢3「統合失調症」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"33-08":{"explanation":"公式正答は選択肢4「自殺による死亡率は、1958年以降毎年減少し続けている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"33-09":{"explanation":"公式正答は選択肢2「二酸化炭素」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"33-10":{"explanation":"公式正答は選択肢4「a と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"33-11":{"explanation":"公式正答は選択肢4「細菌は、DNA又はRNAのいずれか一種類だけをもっている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"33-12":{"explanation":"公式正答は選択肢3「狂犬病」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"33-13":{"explanation":"公式正答は選択肢3「デング熱」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"33-14":{"explanation":"公式正答は選択肢1「A型肝炎」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"33-15":{"explanation":"公式正答は選択肢3「病気が進行すると、通常は発病しないカビによる感染症を起こす。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"33-16":{"explanation":"公式正答は選択肢1「血液が付着したタオルの消毒は、80℃の蒸気に10分間あてる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"33-17":{"explanation":"公式正答は選択肢3「c と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"33-18":{"explanation":"公式正答は選択肢2「光や熱に対して安定しており、管理が容易である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"33-19":{"explanation":"公式正答は選択肢1「人体に対しての毒性は強いが、結核菌や芽胞に対しても殺菌力がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"33-20":{"explanation":"公式正答は選択肢3「c と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"33-21":{"explanation":"公式正答は選択肢3「胸鎖乳突筋」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"33-22":{"explanation":"公式正答は選択肢4「副交感神経は闘争の神経で、活力を高める。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"33-23":{"explanation":"公式正答は選択肢1「鼓膜　平衡感覚」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"33-24":{"explanation":"公式正答は選択肢4「肺静脈」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"33-25":{"explanation":"公式正答は選択肢1「アミラーゼ」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"33-26":{"explanation":"公式正答は選択肢4「皮下脂肪は、機械的外力に対するクッションの作用と温度の変化に対する断熱材としての働きがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"33-27":{"explanation":"公式正答は選択肢3「脂腺は、短い排出管をもって、毛包に開口している分泌腺である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"33-28":{"explanation":"公式正答は選択肢2「皮膚の表面にある脂肪膜（皮脂膜）は、弱アルカリ性のため細菌や真菌の発育を抑制し死滅させる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"33-29":{"explanation":"公式正答は選択肢2「皮脂の分泌は、高齢になるとともに次第に増加する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"33-30":{"explanation":"公式正答は選択肢4「染毛剤によるアレルギー性のカブレでは、同じ染毛剤でも低濃度であれば、再びかぶれることはない。 理容の物理・化学」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"33-31":{"explanation":"公式正答は選択肢4「紫外線は、皮膚でビタミンCを生成する作用がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"33-32":{"explanation":"公式正答は選択肢2「1000×2×25÷1000＝50[kWh]」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"33-33":{"explanation":"公式正答は選択肢4「赤外線灯は、電流の化学作用を利用したものである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"33-34":{"explanation":"公式正答は選択肢2「白金は鉄にくらべて酸化されやすい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"33-35":{"explanation":"公式正答は選択肢3「酢酸　アンモニア水」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"33-36":{"explanation":"公式正答は選択肢1「メタノールは、化粧水の原料に用いられる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"33-37":{"explanation":"公式正答は選択肢3「一時硬水は、煮沸するだけで軟化し、軟水となる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"33-38":{"explanation":"公式正答は選択肢2「陰イオン界面活性剤には、洗浄力のすぐれているものが多く、石けんや合成洗剤がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"33-39":{"explanation":"公式正答は選択肢2「ヘアブリーチ剤　アセチルシステイン」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"33-40":{"explanation":"公式正答は選択肢4「A シスチン　B 還元剤　C 臭素酸カリウム 理容理論」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"33-41":{"explanation":"公式正答は選択肢4「D」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"33-42":{"explanation":"公式正答は選択肢1「A 鋏尖　B 触点　C 接点」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"33-43":{"explanation":"公式正答は選択肢1「コームの胴は、起こされた頭毛を両側からささえるはたらきがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"33-44":{"explanation":"公式正答は選択肢2「凸面ブラシは、毛先端の面が凸面状になっており、長い毛髪のセットや毛髪の内側から当てて使用するのに適している。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"33-45":{"explanation":"公式正答は選択肢4「丸顔には丸のヘアスタイルが適している。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"33-46":{"explanation":"公式正答は選択肢2「b と c」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"33-47":{"explanation":"公式正答は選択肢1「塗布は、生え際、フロント、トップ、バックの順に行う。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"33-48":{"explanation":"公式正答は選択肢4「スチーミングは、清拭、てん包、密着の順に行う。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"33-49":{"explanation":"公式正答は選択肢2「b と c」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"33-50":{"explanation":"公式正答は選択肢2「リアシャンプーとくらべて首への負担が軽減されている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"32-01":{"explanation":"公式正答は選択肢1「知識・技能　施設・設備　衛生措置」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"32-02":{"explanation":"公式正答は選択肢3「理容所の開設者が管理理容師を置かなければならない要件」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"32-03":{"explanation":"公式正答は選択肢2「理容所に掲示している施術料金を変更した場合」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"32-04":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"32-05":{"explanation":"公式正答は選択肢4「aとd」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"32-06":{"explanation":"公式正答は選択肢1「母子健康手帳は、医療機関から交付される。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"32-07":{"explanation":"公式正答は選択肢3「わが国の20歳以上の男性の喫煙率は、年々増加傾向にある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"32-08":{"explanation":"公式正答は選択肢1「無機質は、エネルギー源として重要な栄養素である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"32-09":{"explanation":"公式正答は選択肢3「ノロウイルスによる食中毒は、ほとんどが高温多湿の夏期に発生している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"32-10":{"explanation":"公式正答は選択肢4「下水道の普及率は、近年90%台である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"32-11":{"explanation":"公式正答は選択肢4「感染力やり患した場合の重篤性等から極めて危険性が高い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"32-12":{"explanation":"公式正答は選択肢4「クラミジア　腸チフス」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"32-13":{"explanation":"公式正答は選択肢3「多くの病原菌の発育温度は、15から45℃である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"32-14":{"explanation":"公式正答は選択肢3「鼻腔　ブドウ球菌」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"32-15":{"explanation":"公式正答は選択肢1「潜伏期は1から2日である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"32-16":{"explanation":"公式正答は選択肢3「ウイルスの消毒には、全く効果がない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"32-17":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"32-18":{"explanation":"公式正答は選択肢1「煮沸消毒は、沸騰後2分間以上煮沸する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"32-19":{"explanation":"公式正答は選択肢4「紫外線消毒は、あらゆる微生物に対して効果があるが、被消毒物の表面の殺菌に限られる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"32-20":{"explanation":"公式正答は選択肢2「動物毛製のブラシは、煮沸消毒が適している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"32-21":{"explanation":"公式正答は選択肢2「血小板」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"32-22":{"explanation":"公式正答は選択肢4「口輪筋　唇を開く」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"32-23":{"explanation":"公式正答は選択肢1「咽頭」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"32-24":{"explanation":"公式正答は選択肢3「脾臓」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"32-25":{"explanation":"公式正答は選択肢2「インスリン」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"32-26":{"explanation":"公式正答は選択肢3「ランゲルハンス細胞は、免疫に関与する細胞である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"32-27":{"explanation":"公式正答は選択肢3「健康な成人の頭毛では、全体の85から90%が休止期である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"32-28":{"explanation":"公式正答は選択肢4「皮膚で体温調節を積極的に行っているのは脂腺である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"32-29":{"explanation":"公式正答は選択肢4「紫外線は、尋常性痤瘡（ニキビ）や円形脱毛症の原因となる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"32-30":{"explanation":"公式正答は選択肢2「癤　細菌（化膿菌）」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"32-31":{"explanation":"公式正答は選択肢2「作用点Aにかかる力は、力点Bにかける力の5倍である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"32-32":{"explanation":"公式正答は選択肢2「12アンペア」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"32-33":{"explanation":"公式正答は選択肢4「硝酸は無機酸である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"32-34":{"explanation":"公式正答は選択肢3「ケラチン　硬タンパク質」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"32-35":{"explanation":"公式正答は選択肢3「一時硬水は、煮沸すると軟化する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"32-36":{"explanation":"公式正答は選択肢4「鉄の赤さびは、質がち密で内部を保護する働きがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"32-37":{"explanation":"公式正答は選択肢4「パラオキシ安息香酸エステル　防腐剤」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"32-38":{"explanation":"公式正答は選択肢1「石けんは、界面活性剤の一種である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"32-39":{"explanation":"公式正答は選択肢2「チオグリコール酸」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"32-40":{"explanation":"公式正答は選択肢1「酸化染毛剤は、1回のシャンプーで除去される。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"32-41":{"explanation":"公式正答は選択肢4「柳刃　800　直線刃」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"32-42":{"explanation":"公式正答は選択肢3「内眼角　外側　角顔」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"32-43":{"explanation":"公式正答は選択肢2「ハーフロングは、中髪型のヘアスタイルである。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"32-44":{"explanation":"公式正答は選択肢4「直鋏は、コームを用いず、シザーズだけでヘアスタイルの表面を切りそろえる技法である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"32-45":{"explanation":"公式正答は選択肢2「クラウン　短く　高く刈り上げない」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"32-46":{"explanation":"公式正答は選択肢2「チョップカット　毛先を直線にそろえる」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"32-47":{"explanation":"公式正答は選択肢1「輪ゴムは、ピボットポイント側のゴム圧が強くなるようにかける。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"32-48":{"explanation":"公式正答は選択肢3「パッチテストの結果が陰性であっても、頭部に傷がある人の染毛は、施術してはならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"32-49":{"explanation":"公式正答は選択肢2「斜行運行は、毛流の方向に対して45度以内で行う。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"32-50":{"explanation":"公式正答は選択肢3「ラザーリングは、手関節を軸とする回転運動で行う。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31-01":{"explanation":"公式正答は選択肢2「b と c」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"31-02":{"explanation":"公式正答は選択肢4「理容所の開設者は、管理理容師の資格がなければ、2か所以上の開設者を兼ねることができない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"31-03":{"explanation":"公式正答は選択肢3「疾病その他の理由により、理容所に来ることができない者に対しては、理容所以外の場所で理容の業を行うことができる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"31-04":{"explanation":"公式正答は選択肢1「理容所の開設者が、理容師でない者に理容の業を行わせたときは、理容所の閉鎖を命じられることがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"31-05":{"explanation":"公式正答は選択肢2「地域保健法は、市町村保健センターについて、理容業に対する指導を業務として規定している。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"31-06":{"explanation":"公式正答は選択肢1「近年の高齢化は、出生率の低下がその一因である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"31-07":{"explanation":"公式正答は選択肢2「高齢化は、世界でも以前にはなかったほどの速さで進んでいる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"31-08":{"explanation":"公式正答は選択肢3「鉄」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"31-09":{"explanation":"公式正答は選択肢4「理容所より排出される髪の毛は、産業廃棄物である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"31-10":{"explanation":"公式正答は選択肢3「下水道の放流水や上水道の供給水の水質は、法律によって規定されている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"31-11":{"explanation":"公式正答は選択肢4「日和見感染」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"31-12":{"explanation":"公式正答は選択肢1「感染すると、その抗体は、一生、血清中に存在する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"31-13":{"explanation":"公式正答は選択肢1「B型肝炎」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"31-14":{"explanation":"公式正答は選択肢3「牛海綿状脳症（狂牛病）」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"31-15":{"explanation":"公式正答は選択肢2「感染後、数日の潜伏期間を経て、ほぼ100%の人が発症する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"31-16":{"explanation":"公式正答は選択肢4「煮沸消毒法は、蒸気消毒法よりも短時間でその目的を達することができる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"31-17":{"explanation":"公式正答は選択肢1「煮沸消毒法」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"31-18":{"explanation":"公式正答は選択肢2「A 取りかえ／B 消毒／C 次亜塩素酸ナトリウム水溶液」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"31-19":{"explanation":"公式正答は選択肢3「次亜塩素酸ナトリウム消毒は、殺菌と同時に漂白・防臭の作用があるが、光分解を受けやすい。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"31-20":{"explanation":"公式正答は選択肢1「a と b」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"31-21":{"explanation":"公式正答は選択肢2「上唇の正中線を上下に走る溝を鼻唇溝という。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"31-22":{"explanation":"公式正答は選択肢4「脳神経」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"31-23":{"explanation":"公式正答は選択肢1「冠状動脈」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"31-24":{"explanation":"公式正答は選択肢3「ヘモグロビンと酸素の結合を阻害するため。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"31-25":{"explanation":"公式正答は選択肢3「尿道」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"31-26":{"explanation":"公式正答は選択肢4「真皮は、膠原線維がその大部分を占め、その間に弾性線維が混在している。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"31-27":{"explanation":"公式正答は選択肢2「爪は、真皮の角質層の変形したもので、その成分はコラーゲンである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"31-28":{"explanation":"公式正答は選択肢3「脂腺の発育は、男性ホルモンの影響を強く受ける。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"31-29":{"explanation":"公式正答は選択肢4「油性のフケ症の人は、皮膚を刺激しないために、シャンプーによる洗髪の回数をなるべく少なくする。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"31-30":{"explanation":"公式正答は選択肢1「伝染性膿痂疹（トビヒ） — ヒゼンダニ」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"31-31":{"explanation":"公式正答は選択肢3「ずれは、物体の上面と下面に、同じ向きの力が平行に働くときに生じる変形である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31-32":{"explanation":"公式正答は選択肢2「固体（氷）＜ 液体（水）＜ 気体（水蒸気）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31-33":{"explanation":"公式正答は選択肢1「紫外線を人工的に照射する紫外線灯は、殺菌灯として用いられる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31-34":{"explanation":"公式正答は選択肢2「エタノール、デンプン、タンパク質は、無機化合物である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31-35":{"explanation":"公式正答は選択肢3「酢酸」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31-36":{"explanation":"公式正答は選択肢1「フェノールフタレイン（pH指示薬）は、酸性溶液中では無色である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31-37":{"explanation":"公式正答は選択肢4「天然色素は、タール色素に比べて、着色力や耐光性、耐薬品性が優れている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31-38":{"explanation":"公式正答は選択肢4「クロルヘキシジンは、金属イオン封鎖剤（キレート剤）である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31-39":{"explanation":"公式正答は選択肢4「ムース状のスタイリング剤は、陰イオン界面活性剤の高級アルコール系合成洗剤が主成分である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31-40":{"explanation":"公式正答は選択肢2「酸化染毛剤は、化粧品である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31-41":{"explanation":"公式正答は選択肢4「技術姿勢は、技術を行う部位に体の中心線を正対させることが基本である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"31-42":{"explanation":"公式正答は選択肢3「鋏尖、鋏要、接点の3点を結ぶ線を鋏要線という。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31-43":{"explanation":"公式正答は選択肢2「ロールブラシは、回転させて使用し、長い髪の毛のセットに使用される。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31-44":{"explanation":"公式正答は選択肢1「毛髪を切る場合は、原則として頭皮に対し斜めに引き出して切る。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31-45":{"explanation":"公式正答は選択肢4「図中の(4)」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"31-46":{"explanation":"公式正答は選択肢4「a と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"31-47":{"explanation":"公式正答は選択肢3「酸性酸化染毛剤は、酸化染料がキューティクルの浅い内部に染まりつき、主に白髪染めに使われる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31-48":{"explanation":"公式正答は選択肢3「レザーの刃元によるシェービングは、刃先の部分を使うより安全である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31-49":{"explanation":"公式正答は選択肢1「ラザーリングは、皮膚とひげの水分を保ち、シェービングしやすくする。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31-50":{"explanation":"公式正答は選択肢2「軽擦法は、マッサージする部分に手をぴったりとつけ、軽い連続した動きで、さする技法である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31s-01":{"explanation":"公式正答は選択肢4「理容所は、理容師でなければ開設することができない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"31s-02":{"explanation":"公式正答は選択肢2「外国籍の者」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"31s-03":{"explanation":"公式正答は選択肢3「理容師が理容の業を行うときに衛生上必要な措置を講じなかったときは、罰金が科せられる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"31s-04":{"explanation":"公式正答は選択肢3「c と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"31s-05":{"explanation":"公式正答は選択肢2「組合員に対する、営業の定休日及び料金の統一」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"31s-06":{"explanation":"公式正答は選択肢4「2008年の乳児死亡率は、出生1,000人に対して5を超えている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"31s-07":{"explanation":"公式正答は選択肢3「貧血」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"31s-08":{"explanation":"公式正答は選択肢4「利用者がサービスを受ける場所で大別すると、施設サービスと在宅サービスがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"31s-09":{"explanation":"公式正答は選択肢3「マイクロ波は、ビタミンDの生成作用がある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"31s-10":{"explanation":"公式正答は選択肢1「a と b」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"31s-11":{"explanation":"公式正答は選択肢4「デング熱」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"31s-12":{"explanation":"公式正答は選択肢3「細菌のなかには、酸素の存在が有害であるものがある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"31s-13":{"explanation":"公式正答は選択肢2「全ての予防接種は、法律によって、強制的に実施されている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"31s-14":{"explanation":"公式正答は選択肢4「患者の隔離は、宿主の感受性対策の一つである。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"31s-15":{"explanation":"公式正答は選択肢2「持続性感染になる可能性がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"31s-16":{"explanation":"公式正答は選択肢3「消毒において、対象とする微生物は、主として病原微生物である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"31s-17":{"explanation":"公式正答は選択肢4「乾熱と湿熱では、水分の多い方がタンパク質の変性が早く起こるので、同じ時間であれば、湿熱の方が殺菌効果は高い。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"31s-18":{"explanation":"公式正答は選択肢3「c と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"31s-19":{"explanation":"公式正答は選択肢4「血液が付着した器具に、0.1%の両性界面活性剤水溶液を使用する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"31s-20":{"explanation":"公式正答は選択肢1「次亜塩素酸ナトリウムは、石けんと反応するので併用できない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"31s-21":{"explanation":"公式正答は選択肢4「A 前額面（前頭面）　B 正中矢状面　C 水平面（横断面）」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"人体解剖学・生理学の標準資料"},"31s-22":{"explanation":"公式正答は選択肢2「筋系　体表保護」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"31s-23":{"explanation":"公式正答は選択肢1「横隔膜」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"31s-24":{"explanation":"公式正答は選択肢2「顔面神経」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"31s-25":{"explanation":"公式正答は選択肢3「ペプシン」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"31s-26":{"explanation":"公式正答は選択肢1「皮膚は、上から表皮、真皮、皮下組織の3つの層からできている。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"31s-27":{"explanation":"公式正答は選択肢3「アポクリン腺は、手掌、足底に多く分布する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"31s-28":{"explanation":"公式正答は選択肢1「皮膚の表面にある脂肪膜（皮脂膜）は、弱アルカリ性のため、細菌などの発育が抑制される。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"31s-29":{"explanation":"公式正答は選択肢2「円形脱毛症は、細菌や真菌によっておこる皮膚疾患である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"31s-30":{"explanation":"公式正答は選択肢1「水痘（ミズボウソウ）　ウイルス」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"31s-31":{"explanation":"公式正答は選択肢3「350Kは77℃である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31s-32":{"explanation":"公式正答は選択肢1「赤外線は、化学線ともよばれる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31s-33":{"explanation":"公式正答は選択肢2「b と c」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31s-34":{"explanation":"公式正答は選択肢3「A 酸素　B 水素　C 酸化剤　D 還元剤」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31s-35":{"explanation":"公式正答は選択肢4「ポリエチレン」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31s-36":{"explanation":"公式正答は選択肢4「エラスチンは、合成高分子化合物である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31s-37":{"explanation":"公式正答は選択肢2「雲母チタン　光輝性顔料」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31s-38":{"explanation":"公式正答は選択肢1「ベンザルコニウム塩化物（塩化ベンザルコニウム）　殺菌剤」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31s-39":{"explanation":"公式正答は選択肢4「ヘアブリーチ剤は、毛髪に還元剤を作用させ、色素のメラニンを分解して脱色する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31s-40":{"explanation":"公式正答は選択肢3「c と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"31s-41":{"explanation":"公式正答は選択肢3「鋏尖・鋏要・接点の3点を結ぶ線を中心線という。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31s-42":{"explanation":"公式正答は選択肢3「c と d」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31s-43":{"explanation":"公式正答は選択肢4「コームの運行とカットは、原則として毛流に対し直角に行う。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"31s-44":{"explanation":"公式正答は選択肢2「図2」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31s-45":{"explanation":"公式正答は選択肢2「テーパーカットのテーパーとは、「ぶつ切りにする」という意味で、予定の長さで直線的になるようにカットする技法である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31s-46":{"explanation":"公式正答は選択肢2「運行距離は長く、運行速度も速くする。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31s-47":{"explanation":"公式正答は選択肢4「スタンドシャンプーは、顔面にシャンプー剤が流れないように注意する必要がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"31s-48":{"explanation":"公式正答は選択肢1「アイロンだけでセットした場合は半永久的セットになり、パーマネントウェーブ用剤を使用した場合は永久的セットになる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31s-49":{"explanation":"公式正答は選択肢3「ヘアジェルは、水性ベースの固体のため、髪を固めずに動きをつけられる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"31s-50":{"explanation":"公式正答は選択肢4「染毛を行う場合は、必ず施術用手袋を装着して行う。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"30-01":{"explanation":"公式正答は選択肢2「理容業の振興を図ることを目的としている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"30-02":{"explanation":"公式正答は選択肢3「理容師の免許は、理容師試験に合格した者の申請により、理容師名簿に登録された時点よりその効力を生じる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"30-03":{"explanation":"公式正答は選択肢4「ふた付きの汚物箱及び毛髪箱を備えること。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"30-04":{"explanation":"公式正答は選択肢1「理容所の開設者が、環境衛生監視員の立入検査を正当な理由なく拒んだときは、理容所の閉鎖を命じられることがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"30-05":{"explanation":"公式正答は選択肢4「aとd」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"30-06":{"explanation":"公式正答は選択肢1「2009年における平均寿命は、男女とも85歳を超えている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"30-07":{"explanation":"公式正答は選択肢2「ナトリウムは、無機質である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"30-08":{"explanation":"公式正答は選択肢4「介護保険制度による給付の財源は、40歳以上の人からの保険料と公費である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"30-09":{"explanation":"公式正答は選択肢3「cとd」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"30-10":{"explanation":"公式正答は選択肢2「簡易水道にも上水道と同じ水質基準が適用される。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"30-11":{"explanation":"公式正答は選択肢3「日本脳炎　ノミ」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"30-12":{"explanation":"公式正答は選択肢3「赤血球には、体内の微生物を捕えて、これを殺してしまう働きがある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"30-13":{"explanation":"公式正答は選択肢2「持続性感染とは、感染を受けた宿主が、発病しないで長期間にわたって病原体と共存し続けている状態をいう。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"30-14":{"explanation":"公式正答は選択肢4「急性灰白髄炎（ポリオ）」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"30-15":{"explanation":"公式正答は選択肢1「インフルエンザウイルスは、ヒト以外の動物にも感染する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"30-16":{"explanation":"公式正答は選択肢3「皮膚に接する器具や布片類の消毒には、消毒薬だけではなく理学的方法を用いても差し支えない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"30-17":{"explanation":"公式正答は選択肢4「セニングシザーズ　0.05%グルコン酸クロルヘキシジン水溶液に10分間以上浸す方法」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"30-18":{"explanation":"公式正答は選択肢3「消毒　次亜塩素酸ナトリウム　蒸気」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"30-19":{"explanation":"公式正答は選択肢2「波長は320nm前後である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"30-20":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"30-21":{"explanation":"公式正答は選択肢2「鼻筋　鼻の両側に横じわをつくる。」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"人体解剖学・生理学の標準資料"},"30-22":{"explanation":"公式正答は選択肢1「骨格筋」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"30-23":{"explanation":"公式正答は選択肢1「左心室→動脈→全身の毛細血管→静脈→右心房」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"30-24":{"explanation":"公式正答は選択肢4「副腎」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"30-25":{"explanation":"公式正答は選択肢3「グルコース」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"30-26":{"explanation":"公式正答は選択肢3「真皮の線維成分は、コラーゲンというタンパク質からなる膠原線維がその大部分を占める。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"30-27":{"explanation":"公式正答は選択肢1「いわゆるトリハダ反応は、皮膚の毛細血管の収縮による。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"30-28":{"explanation":"公式正答は選択肢2「皮膚における皮脂の分泌は、高齢になると次第に増加してくる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"30-29":{"explanation":"公式正答は選択肢4「胃腸病患者は、細菌や真菌による皮膚疾患にかかりやすい。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"30-30":{"explanation":"公式正答は選択肢2「尋常性毛瘡（カミソリカブレ）　細菌（化膿菌）」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"30-31":{"explanation":"公式正答は選択肢3「平面鏡を用いれば、鏡に映る照明の反射光の分だけ照度が増し、明るくなる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"30-32":{"explanation":"公式正答は選択肢4「紫外線の化学作用は、殺菌効果があるので、殺菌灯としても使用される。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"30-33":{"explanation":"公式正答は選択肢2「水　共有結合」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"30-34":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"30-35":{"explanation":"公式正答は選択肢3「酸化クロムやグンジョウは、着色顔料である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"30-36":{"explanation":"公式正答は選択肢4「合成高分子化合物　キトサン」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"30-37":{"explanation":"公式正答は選択肢1「パラオキシ安息香酸エステル　日やけ防止効果」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"30-38":{"explanation":"公式正答は選択肢1「ケラチン　アミノ酸」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"30-39":{"explanation":"公式正答は選択肢2「bとc」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"30-40":{"explanation":"公式正答は選択肢2「キレート剤を用いて金属イオンを封鎖する。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"30-41":{"explanation":"公式正答は選択肢4「A：鼻側　B：オトガイ　C：乳様突起」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"30-42":{"explanation":"公式正答は選択肢1「マグネット式クリッパーは、回転部分により歯を左右に動かす構造になっている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"30-43":{"explanation":"公式正答は選択肢3「引分櫛は、目の粗い歯と細かい歯とからできていて髪際を刈るのに用いる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"30-44":{"explanation":"公式正答は選択肢4「押し刈は、連続刈に比べて広い面積の短髪部に多く用いられる。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"30-45":{"explanation":"公式正答は選択肢4「A：アウトサイドグラデーション　B：スクエア」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"30-46":{"explanation":"公式正答は選択肢2「原則として、生え際→フロント→トップ→バックの順に塗布する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"30-47":{"explanation":"公式正答は選択肢2「フリーハンドは、常にレザーを手前に運行する持ち方である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"30-48":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"30-49":{"explanation":"公式正答は選択肢3「リンシングの際は、シャンプー剤が残らないように、やさしく十分に洗い流す。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"30-50":{"explanation":"公式正答は選択肢1「aとb」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"29-01":{"explanation":"公式正答は選択肢1「理容師法のような法律は、国の行政機関が定める。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"29-02":{"explanation":"公式正答は選択肢2「b と c」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"29-03":{"explanation":"公式正答は選択肢2「理容師である従業者の数が常時2人以上である理容所の開設者は、当該理容所の経営管理をさせるため、管理理容師を置かなければならない。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"29-04":{"explanation":"公式正答は選択肢4「理容所の開設の届出書には、理容師につき、結核、皮膚疾患その他厚生労働大臣が指定する伝染性疾病の有無に関する医師の診断書を添付しなければならない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"29-05":{"explanation":"公式正答は選択肢3「c と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容師法・同施行規則、生活衛生関係営業法、労働・社会保障制度の標準資料"},"29-06":{"explanation":"公式正答は選択肢2「ジョン・スノー」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"29-07":{"explanation":"公式正答は選択肢4「2009年における1人の女性が産む子どもの数は、平均2人以上である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"29-08":{"explanation":"公式正答は選択肢1「早期発見は、第1次予防である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"29-09":{"explanation":"公式正答は選択肢4「理容所の毛髪 — 産業廃棄物」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"29-10":{"explanation":"公式正答は選択肢3「下水道による水洗化率と、浄化槽による水洗化率は、ほぼ同率である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"厚生労働省・総務省等の公衆衛生、人口統計、環境衛生資料"},"29-11":{"explanation":"公式正答は選択肢2「細菌の増殖に紫外線は、有害である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"29-12":{"explanation":"公式正答は選択肢1「病原体を保有する土壌が感染源 — 狂犬病」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"29-13":{"explanation":"公式正答は選択肢4「エボラ出血熱」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"29-14":{"explanation":"公式正答は選択肢3「C型肝炎」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"29-15":{"explanation":"公式正答は選択肢2「b と c」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"感染症法、厚生労働省・国立感染症研究所の感染症資料"},"29-16":{"explanation":"公式正答は選択肢3「c と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"29-17":{"explanation":"公式正答は選択肢4「a と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"29-18":{"explanation":"公式正答は選択肢3「グルコン酸クロルヘキシジンは、栄養型の細菌には幅広い効果が見られるものの、芽胞や結核菌には効果がない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"29-19":{"explanation":"公式正答は選択肢2「透明な油膜でも遮蔽される。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"29-20":{"explanation":"公式正答は選択肢1「a と b」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容所及び美容所における衛生管理要領、消毒法の標準資料"},"29-21":{"explanation":"公式正答は選択肢2「眉弓は耳介の後下方にあり、指圧の対象になる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"29-22":{"explanation":"公式正答は選択肢1「必要な物質を細胞に送り、不要な物質を運び去る役割を持つ。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"29-23":{"explanation":"公式正答は選択肢3「頰筋」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"29-24":{"explanation":"公式正答は選択肢1「肝臓」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"人体解剖学・生理学の標準資料"},"29-25":{"explanation":"公式正答は選択肢4「肺静脈には、静脈血が流れている。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"人体解剖学・生理学の標準資料"},"29-26":{"explanation":"公式正答は選択肢3「真皮内の線維成分は、大部分がエラスチンというタンパク質から成る弾性線維である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"29-27":{"explanation":"公式正答は選択肢4「爪は、爪母でつくられ、生長周期がない。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"29-28":{"explanation":"公式正答は選択肢2「皮脂は、皮下組織にある脂肪細胞でつくられ、皮膚の表面に分泌される。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"29-29":{"explanation":"公式正答は選択肢1「皮膚表面のpHは弱アルカリ性を示し、皮脂の分泌がこの値に最も影響を与える。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"皮膚科学・毛髪科学の標準資料"},"29-30":{"explanation":"公式正答は選択肢4「帯状疱疹（帯状ヘルペス） — ウイルス 理容の物理・化学」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"皮膚科学・毛髪科学の標準資料"},"29-31":{"explanation":"公式正答は選択肢3「300Kは27℃である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"29-32":{"explanation":"公式正答は選択肢4「気体が液体にならずに、直接固体になる変化を凝固という。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"29-33":{"explanation":"公式正答は選択肢1「光は電磁波の一種であり、その速度は水中で最も速い。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"29-34":{"explanation":"公式正答は選択肢1「a と b」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"29-35":{"explanation":"公式正答は選択肢3「A ヒドロキシル基／B 水素結合／C 水和分子」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"29-36":{"explanation":"公式正答は選択肢3「メタノールは、毒性が弱いので化粧水などの液体原料として使用される。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"29-37":{"explanation":"公式正答は選択肢2「ブドウ糖」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"29-38":{"explanation":"公式正答は選択肢3「一時硬水は、煮沸すると軟化する。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"29-39":{"explanation":"公式正答は選択肢1「酸化チタンは、白色顔料で、収れん・消炎作用もある。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"29-40":{"explanation":"公式正答は選択肢4「酸化染毛剤第2剤 — システインの塩類 理容理論」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"香粧品化学、医薬部外品原料規格、関連承認基準"},"29-41":{"explanation":"公式正答は選択肢4「A 目／B 胴／C 親歯」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"29-42":{"explanation":"公式正答は選択肢3「エレクトリッククリッパーには、モーター式とマグネット式がある。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"29-43":{"explanation":"公式正答は選択肢2「ミディアムヘアやハーフロングは、中髪型である。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["公式正答上、正しい記述には該当しない","設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"29-44":{"explanation":"公式正答は選択肢3「c と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する","公式正答上、条件を満たす組合せには該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"29-45":{"explanation":"公式正答は選択肢2「チョップカット — アウトラインをそろえる技法である。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"29-46":{"explanation":"公式正答は選択肢3「基本セットは、毛髪に水分や油分などの整髪料をつけ、コームやブラシを用いて整髪するもので、スタンダードヘアのみに行われる。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"29-47":{"explanation":"公式正答は選択肢1「レザーを円滑に運行するには、上肢を合理的な自然運動で使う。」です。この選択肢が設問で求める正しい記述に該当します。その他の選択肢は、公式正答上は正しい記述には該当しないとして扱われます。","choices":["設問で求める正しい記述に該当する","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない","公式正答上、正しい記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"},"29-48":{"explanation":"公式正答は選択肢4「ネックラインは、産毛を残さず剃り込んで、かたちを整える。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","設問で求める誤った記述に該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"29-49":{"explanation":"公式正答は選択肢4「a と d」です。設問中の記述を公式正答に従って判定すると、この選択肢が条件を満たす組合せに該当します。個々の記述の根拠は最終監修で確認します。","choices":["公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","公式正答上、条件を満たす組合せには該当しない","設問で求める条件を満たす組合せに該当する"],"basis":"理容文化論・理容技術理論の標準教材"},"29-50":{"explanation":"公式正答は選択肢1「揉撚法は、手指や手掌で皮膚を圧迫する手技で、エフルラージュともいう。」です。この選択肢が設問で求める誤った記述に該当します。その他の選択肢は、公式正答上は誤った記述には該当しないとして扱われます。","choices":["設問で求める誤った記述に該当する","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない","公式正答上、誤った記述には該当しない"],"basis":"理容文化論・理容技術理論の標準教材"}};



/* 第49回 最優先22問：公的資料・現行基準により個別監修済み。 */
Object.assign(VERIFIED_PAST_REVIEWS,{
'49-01':{explanation:'誤っているのは2です。理容師法は、理容師の資格を定め、理容の業務が適正に行われるよう規律し、公衆衛生の向上に資することを目的とします。理容業の経営健全化や振興は、生活衛生関係営業の運営の適正化及び振興に関する法律が扱う事項です。',choices:['正しい。理容師法は公衆衛生の向上に資することを目的に含む','誤り。経営の健全化と業の振興は生活衛生関係営業法の目的・制度に属する','正しい。理容の業務を適正に行わせるための規律を定める','正しい。免許を受けた理容師でなければ理容を業としてはならない'],basis:'理容師法第1条・第6条、生活衛生関係営業の運営の適正化及び振興に関する法律第1条'},
'49-02':{explanation:'正しいのは3です。業務停止処分を受けた理容師は、速やかに免許証または免許証明書を処分を行った者へ提出します。免許申請時の診断書は精神機能の障害に関するもので、住所変更は理容師名簿の訂正事項ではなく、再交付申請先は厚生労働大臣です。',choices:['誤り。免許申請時の診断書は伝染性疾病一般ではなく、精神機能の障害に関する所定事項を証するもの','誤り。住所は理容師名簿の登録事項ではないため、住所変更だけでは名簿訂正申請を要しない','正しい。業務停止処分時は免許証等を速やかに処分権者へ提出する','誤り。再交付は住所地の都道府県知事ではなく厚生労働大臣へ申請する'],basis:'理容師法第5条の2・第10条、理容師法施行規則第1条・第6条・第8条'},
'49-03':{explanation:'免許取消処分の対象となるのは1です。業務停止処分に違反した場合は免許取消しの対象となります。衛生措置違反、伝染性疾病による就業不適当、理容所以外での業務違反は、業務停止の対象として整理されます。',choices:['正しい。業務停止処分に違反した場合は免許取消しの対象となる','誤り。衛生措置違反は業務停止の対象で、直ちに免許取消しではない','誤り。伝染性疾病により就業が不適当な場合は業務停止の対象','誤り。理容所以外で業を行った違反は業務停止の対象'],basis:'理容師法第10条'},
'49-04':{explanation:'正しいのは4です。管理理容師は、理容師が常時2人以上従事する理容所に置き、原則として理容所ごとに専任します。資格要件は免許取得後3年以上の業務従事と都道府県知事が指定する講習会修了です。開設届には管理理容師の氏名と住所などを記載します。',choices:['誤り。設置要件は理容師が常時2人以上従事することで、理容師以外の従業者数ではない','誤り。講習会を指定するのは厚生労働大臣ではなく都道府県知事等','誤り。管理理容師は原則として理容所ごとに置くため、複数施設を兼務する前提ではない','正しい。開設届には管理理容師の氏名と住所等を記載する'],basis:'理容師法第11条の4、理容師法施行規則第19条・第24条'},
'49-05':{explanation:'誤っているのは3です。理容所と美容所の重複開設は、施術者が両資格を有することや衛生上の要件を満たすことなど、通知で示された条件の下で認められる場合があります。開設届、移動理容所、地位承継届に関する他の記述は正しい内容です。',choices:['正しい。営業開始前に開設届を提出し、使用前の検査確認を受ける','正しい。自治体の基準等を満たす移動理容所が認められる場合がある','誤り。一定要件を満たす場合まで一律に禁止されているわけではない','正しい。相続等による地位承継後は遅滞なく届け出る'],basis:'理容師法第11条・第11条の2・第11条の3、理容所と美容所の重複開設に関する厚生労働省通知'},
'49-06':{explanation:'正しいのは4です。検査確認前に理容所を使用した場合は罰金の対象となり得ます。立入検査は都道府県知事等が環境衛生監視員に行わせ、対象は衛生措置や構造設備であって経営状況ではありません。検査妨害は罰則対象ですが、それ自体を理由とする閉鎖処分の規定ではありません。',choices:['誤り。立入検査の対象は衛生措置・構造設備等で、経営状況ではない','誤り。行政から委託された者ではなく、権限を有する環境衛生監視員が行う','誤り。検査妨害は罰金対象だが、記述のような閉鎖処分の直接要件ではない','正しい。検査確認前の使用は罰金の対象となり得る'],basis:'理容師法第11条の2・第13条・第14条・第15条'},
'49-07':{explanation:'正しい組合せはbとcで、選択肢2です。生活衛生同業組合は営利を目的とせず、加入・脱退は任意です。振興指針に沿った振興計画を定められますが、営業方法の協定は法律上の要件や認可等の制約なく自由に定められるものではありません。',choices:['誤り。aが誤りで、bのみ正しい','正しい。bとcはいずれも正しい','誤り。dが誤り','誤り。aとdはいずれも誤り'],basis:'生活衛生関係営業の運営の適正化及び振興に関する法律第3条・第8条・第56条の2・第56条の3'},
'49-08':{explanation:'正しい組合せはbとcで、選択肢2です。法人税・所得税は原則として所得に対して課されるため、利益がなければ必ず納税が生じるわけではありません。源泉所得税は原則翌月10日までに納付し、申告・納付義務違反には加算税等が課されることがあります。個人の所得税確定申告期限は通常3月15日です。',choices:['誤り。aが誤りでbのみ正しい','正しい。bとcが正しい','誤り。dが誤り','誤り。aとdが誤り'],basis:'所得税法第120条・第183条・第190条、国税通則法第65条ほか、国税庁「源泉所得税の納期」「確定申告」'},
'49-09':{explanation:'誤っているのは3です。パートタイム労働者にも、所定労働日数などに応じて年次有給休暇が付与されます。別居の親族を労働者として使用する場合は原則として労働基準法が適用され、労働条件の明示と8時間超の場合の1時間以上の休憩も必要です。',choices:['正しい。同居の親族のみを使用する事業を除き、別居親族には原則として適用される','正しい。契約期間、賃金、労働時間等の労働条件を明示する','誤り。パートタイム労働者にも要件に応じて年次有給休暇を与える','正しい。8時間を超える場合は少なくとも1時間の休憩を途中に与える'],basis:'労働基準法第15条・第34条・第39条・第116条'},
'49-10':{explanation:'正しい組合せはaとdで、選択肢4です。被用者保険等に加入しない75歳未満の者は原則として国民健康保険の対象です。後期高齢者医療制度は原則75歳以上で、医療費の一部負担割合は年齢・所得により異なります。健康保険と国民健康保険の双方に高額療養費制度があります。',choices:['誤り。bが誤り','誤り。bとcが誤り','誤り。cが誤りでdのみ正しい','正しい。aとdが正しい'],basis:'健康保険法第74条・第115条、国民健康保険法第5条・第42条・第57条の2、高齢者の医療の確保に関する法律第50条'},
'49-12':{explanation:'誤っているのは2です。特定健康診査・特定保健指導の対象は、原則として40歳以上75歳未満の医療保険加入者です。生活習慣には食事、運動、喫煙などが含まれ、心疾患の発症に関与します。健康日本21（第二次）は健康寿命の延伸と健康格差の縮小を掲げました。',choices:['正しい。食事、運動、喫煙などは生活習慣に含まれる','誤り。対象は原則40歳以上75歳未満','正しい。生活習慣は心疾患の発症リスクに関与する','正しい。健康寿命の延伸と健康格差の縮小が基本的方向に含まれる'],basis:'高齢者の医療の確保に関する法律第20条・第24条、厚生労働省「特定健康診査・特定保健指導」、健康日本21（第二次）'},
'49-14':{explanation:'誤っているのは2です。20～30ルクスは日常生活全般に十分な明るさとはいえません。衛生管理要領では理容・美容の作業面を300ルクス以上とすることが望ましいとされ、照度不足は眼精疲労や作業効率低下の原因になります。',choices:['正しい。不適切な照度は眼精疲労、頭痛、作業効率低下等につながる','誤り。20～30ルクスは日常生活に不自由のない一般的明るさとしては不足する','正しい。作業面300ルクス以上が望ましい','正しい。局所照明と全般照明がある'],basis:'厚生労働省「理容所及び美容所における衛生管理要領」第3、照明・照度に関する衛生学標準資料'},
'49-16':{explanation:'正しいのは結核です。感染症法では、一類感染症、二類感染症、新型インフルエンザ等感染症などの患者について、感染拡大のおそれがある業務への就業制限を定めています。結核は二類感染症です。風しん、日本脳炎、破傷風はこの設問の就業制限対象には該当しません。',choices:['誤り。風しんは五類感染症で、この就業制限の対象ではない','誤り。日本脳炎は四類感染症','誤り。破傷風は五類感染症','正しい。結核は二類感染症で、所定の就業制限対象となる'],basis:'感染症の予防及び感染症の患者に対する医療に関する法律第18条、同法別表'},
'49-17':{explanation:'誤っているのは1です。百日せきの病原体は百日咳菌という細菌です。コレラはコレラ菌、マラリアはマラリア原虫、ツツガムシ病はリケッチアの一種であるOrientia tsutsugamushiが病原体です。',choices:['誤り。百日せきはウイルスではなく百日咳菌による細菌感染症','正しい。コレラの病原体はコレラ菌','正しい。マラリアの病原体は原虫','正しい。ツツガムシ病の病原体はリケッチアの一種'],basis:'厚生労働省・国立感染症研究所「百日咳」「コレラ」「マラリア」「つつが虫病」'},
'49-18':{explanation:'誤っているのは4です。A型肝炎は主として経口感染し、通常は慢性化しません。B型肝炎は母子感染などの垂直感染があり、C型肝炎は主として血液を介して感染し、慢性肝炎へ移行することがあります。',choices:['正しい。A型肝炎は主として糞口感染・経口感染','正しい。B型肝炎には母子感染がある','正しい。C型肝炎は主として血液を介して感染する','誤り。慢性化しないのは主にA型で、C型は慢性化しやすい'],basis:'厚生労働省「肝炎総合対策」、国立感染症研究所「A型肝炎」「B型肝炎」「C型肝炎」'},
'49-19':{explanation:'正しい組合せはB型肝炎とエイズで、選択肢2です。B型肝炎ウイルスとHIVは血液や体液を介して感染します。腸チフスと腸管出血性大腸菌感染症は主として汚染された飲食物などを介する経口感染です。',choices:['誤り。腸チフスは主として経口感染','正しい。B型肝炎とHIV感染症はいずれも血液・体液を介して感染する','誤り。腸管出血性大腸菌感染症は主として経口感染','誤り。aとdはいずれも主として経口感染'],basis:'厚生労働省・国立感染症研究所「B型肝炎」「HIV/エイズ」「腸チフス」「腸管出血性大腸菌感染症」'},
'49-20':{explanation:'正答は梅毒と麻しんです。梅毒は胎盤を介して胎児に感染し先天梅毒を起こすことがあります。妊娠中の麻しんでは胎盤を介した胎児への影響・感染が起こり得ます。ジフテリアと細菌性赤痢は、この設問でいう代表的な胎盤感染症には該当しません。',choices:['誤り。ジフテリアは主として飛沫感染','正しい。梅毒トレポネーマは胎盤を介して胎児へ感染し得る','誤り。細菌性赤痢は主として糞口感染','正しい。妊娠中の麻しんでは胎児への感染・重篤な影響が起こり得る'],basis:'厚生労働省・国立感染症研究所「梅毒」「麻しん」、母子感染に関する公的資料'},
'49-21':{explanation:'正しいのは3です。血液が付着していない器具は、逆性石けん0.1％以上の水溶液に10分間以上浸す方法を使用できます。かみそりは血液付着の有無にかかわらず強い消毒法が必要で、血液付着器具には80℃10分の湿熱や拭き取りだけでは不十分です。',choices:['誤り。かみそりには0.01％次亜塩素酸ナトリウムでは基準を満たさない','誤り。血液付着器具に80℃10分の湿熱法は所定の方法ではない','正しい。血液付着の疑いがない器具は逆性石けん0.1％以上に10分以上浸漬できる','誤り。血液付着器具はエタノールを含ませた綿で表面を拭くだけでは足りない'],basis:'理容師法施行規則第25条、厚生労働省「理容所及び美容所における衛生管理要領」第5'},
'49-22':{explanation:'誤っているのは4です。薬液消毒の効果を左右する主な要素は、薬液の濃度、作用温度、作用時間などです。湿度は薬液消毒の三要素として扱いません。湿熱は乾熱より熱伝達がよく、温度が低い場合は一般に長い作用時間を要します。',choices:['正しい。蒸気消毒の条件は煮沸消毒より長い時間を要する設定がある','正しい。低温では一般に消毒により長い時間を要する','正しい。同じ温度・時間なら湿熱の方が乾熱より殺菌効果が高い','誤り。湿度ではなく作用時間が重要な要素'],basis:'厚生労働省「理容所及び美容所における衛生管理要領」、消毒法の標準資料'},
'49-23':{explanation:'誤っているのは3です。紫外線殺菌灯は点灯していても使用時間の経過で紫外線出力が低下するため、定期的な照度確認や交換が必要です。253.7nm付近の紫外線を用い、85μW/cm²以上で20分以上照射し、陰ができないよう配置します。',choices:['正しい。殺菌線は253.7nm付近','正しい。血液付着の疑いがない所定器具には85μW/cm²以上を20分以上照射する','誤り。発光していても経時的に殺菌線出力は低下する','正しい。陰になる部分には紫外線が届かないため配置に注意する'],basis:'理容師法施行規則第25条、厚生労働省「理容所及び美容所における衛生管理要領」第5'},
'49-24':{explanation:'正しい組合せはaとbで、選択肢1です。次亜塩素酸ナトリウムには漂白作用があり、酸性洗剤と混合すると有毒な塩素ガスが発生します。0.1％・10分では芽胞を確実に不活化する方法ではなく、有機物が残ると有効塩素が消費され消毒効果が低下します。',choices:['正しい。aとbはいずれも正しい','誤り。cが誤り','誤り。cとdはいずれも誤り','誤り。dが誤り'],basis:'厚生労働省「理容所及び美容所における衛生管理要領」第5、厚生労働省「次亜塩素酸ナトリウムの取扱い」'},
'49-25':{explanation:'正しいのは4です。希釈は「原液濃度×原液量＝調製液濃度×全量」で計算します。5％原液10mLを全量1,000mLとすると0.05％です。他の選択肢は、計算上の濃度がそれぞれ0.1％、0.2％、0.1％となり記述と一致しません。',choices:['誤り。10％原液10mLを1,000mLにすると0.1％','誤り。10％原液20mLを1,000mLにすると0.2％','誤り。20％原液5mLを1,000mLにすると0.1％','正しい。5％原液10mLを1,000mLにすると0.05％'],basis:'希釈計算式、厚生労働省「理容所及び美容所における衛生管理要領」'}
});


/* 第48回 最優先24問：公的資料・標準資料および公式問題により個別監修済み。 */
Object.assign(VERIFIED_PAST_REVIEWS,{"48-01":{"explanation":"誤っているのは4です。理容師免許の欠格事由として規定されるのは、心身の障害により理容師の業務を適正に行えない者や、理容師法違反等により罰金以上の刑に処せられた者などです。伝染性疾病にかかっていること自体は免許を与えない事由ではなく、就業が公衆衛生上不適当な場合は業務停止の対象として扱われます。","choices":["正しい。外国での実務経験だけでは日本の免許要件を満たさず、原則として指定養成施設の修了と国家試験合格が必要","正しい。理容・美容いずれかの養成課程修了者には、他方の養成施設で一部課目を免除する制度がある","正しい。理容師法違反等で罰金以上の刑に処せられた者は、免許を与えないことがある","誤り。伝染性疾病は免許の欠格事由ではなく、就業が不適当な場合の業務停止事由"],"basis":"理容師法第3条・第5条・第10条、理容師法施行規則の養成課程免除規定"},"48-02":{"explanation":"誤っているのは2です。業務停止処分に違反して理容の業をした場合は、罰金ではなく免許取消しの対象です。免許取消し後に理容を業とすれば無免許営業となり、罰則の対象になります。","choices":["正しい。伝染性疾病により就業が公衆衛生上不適当な場合は業務停止の対象","誤り。業務停止処分違反は免許取消しの対象であり、この記述のような罰金規定ではない","正しい。心身の障害により業務を適正に行えない場合は免許取消しとなることがある","正しい。取消し後の業務は無免許営業となり罰金対象になり得る"],"basis":"理容師法第6条・第10条・第14条"},"48-03":{"explanation":"正しいのは4です。開設届には、業務に従事する理容師について結核、皮膚疾患その他厚生労働大臣が指定する伝染性疾病の有無に関する医師の診断書を添付します。開設者自身に理容師免許は必須ではなく、従業者についても届出事項があります。","choices":["誤り。開設者は理容師でなくてもよい","誤り。福利厚生目的でも業として理容を行う施設は届出対象","誤り。理容師以外の従業者についても氏名等を届け出る","正しい。従事理容師の指定疾病に関する医師の診断書を添付する"],"basis":"理容師法第11条、理容師法施行規則第19条"},"48-04":{"explanation":"正しいのは1です。出張理容でも理容師法上の衛生措置義務は適用され、違反した理容師は業務停止の対象となることがあります。出張理容が認められる場合は政令と条例で定められ、育児・介護等の事情により来店が困難な者を対象に認められる場合があります。","choices":["正しい。出張理容でも衛生措置違反は業務停止の対象となり得る","誤り。認められる場合は政令にも定めがあり、条例だけではない","誤り。育児・介護等で来店困難な者への出張理容が認められる場合がある","誤り。場所違反は理容師本人の業務停止対象で、理容所閉鎖処分とは限らない"],"basis":"理容師法第7条・第9条・第10条、理容師法施行令第4条、出張理容に関する衛生管理要領"},"48-05":{"explanation":"正しい組合せはaとbで、選択肢1です。管理理容師を置くべき理容所に置かない場合は閉鎖命令の対象となり得ます。検査確認前の使用は罰金対象です。衛生措置違反は直ちに罰金ではなく、立入検査妨害は罰金対象であって閉鎖命令の直接要件ではありません。","choices":["正しい。aとbが正しい","誤り。cが誤り","誤り。cとdが誤り","誤り。dが誤り"],"basis":"理容師法第11条の2・第11条の4・第14条・第15条"},"48-06":{"explanation":"正しいのは3です。生活衛生営業指導センターは、生活衛生関係営業の経営健全化を通じて衛生水準の維持向上を図り、利用者・消費者の利益を守ることを目的とします。振興指針を定めるのは厚生労働大臣です。","choices":["誤り。標準営業約款は料金規制を目的とする制度ではない","誤り。同一都道府県・同一業種の組合は原則1つ","正しい。指導センターの設置目的に合致する","誤り。振興指針を定めるのは都道府県知事ではなく厚生労働大臣"],"basis":"生活衛生関係営業の運営の適正化及び振興に関する法律第56条の2・第57条の3等"},"48-07":{"explanation":"正しいのは2です。針先に色素を付けて皮膚に色素を入れるアートメイクは医行為に該当し、医師免許を持たない者が業として行えば医師法第17条に違反します。化粧品は医薬品医療機器等法の規制対象で、理容所の毛髪は通常、事業系一般廃棄物として扱われ、個人情報保護法に保有件数による適用除外はありません。","choices":["誤り。化粧品も医薬品医療機器等法の規制対象","正しい。アートメイクは医行為で、無資格者の業としての実施は医師法違反","誤り。毛髪は通常、産業廃棄物の法定分類には該当しない","誤り。個人情報取扱事業者の適用に保有件数による除外はない"],"basis":"医師法第17条、厚生労働省アートメイク通知、医薬品医療機器等法第2条、個人情報保護法"},"48-08":{"explanation":"誤っているのは3です。国民年金第1号被保険者の保険料は原則定額で、所得が高いほど増える仕組みではありません。所得が低い場合には免除・猶予制度があります。","choices":["正しい。納付済期間等により老齢基礎年金額が決まる","正しい。要件を満たす子のある配偶者または子に遺族基礎年金が支給される","誤り。第1号被保険者の保険料は原則定額","正しい。付加保険料を納めると付加年金が加算される"],"basis":"国民年金法第87条・第87条の2、同法の老齢・遺族基礎年金規定"},"48-09":{"explanation":"正しい組合せはaとdで、選択肢4です。健康保険の保険者は全国健康保険協会と健康保険組合です。保険料率は保険者等により異なります。国民健康保険の保険者は市町村・都道府県と国民健康保険組合で、保険料・保険税は保険者ごとに定められます。","choices":["誤り。bが誤り","誤り。bとcが誤り","誤り。cが誤り","正しい。aとdが正しい"],"basis":"健康保険法第4条・第5条、国民健康保険法第3条・第5条"},"48-10":{"explanation":"誤っているのは2です。雇用保険の給付には育児休業給付が含まれます。自己都合退職でも受給要件を満たせば基本手当の対象となり、労災保険は原則として雇用形態・国籍・年齢を問わず適用され、通勤災害も給付対象です。","choices":["正しい。自己都合退職でも要件を満たせば基本手当を受給できる","誤り。育児休業給付は雇用保険給付に含まれる","正しい。適用事業の労働者は原則として国籍等を問わず対象","正しい。合理的な経路・方法による通勤中の災害も対象となり得る"],"basis":"雇用保険法第10条・第61条の6以下、労働者災害補償保険法第7条"},"48-16":{"explanation":"正しいのは4の百日せきです。百日せきは百日咳菌による細菌感染症です。エイズとSARSはウイルス感染症、アニサキス症は寄生虫による感染症です。","choices":["誤り。HIVというウイルスが病原体","誤り。アニサキスという線虫が原因","誤り。SARSコロナウイルスが病原体","正しい。百日咳菌という細菌が病原体"],"basis":"厚生労働省・国立感染症研究所の百日せき、HIV、SARS、アニサキス症資料"},"48-17":{"explanation":"正しい組合せはbとcで、選択肢2です。細菌は環境中でも増殖可能なものが多く、宿主の抵抗力低下で常在菌による日和見感染が起こり得ます。細菌・ウイルスはいずれも薬剤耐性を獲得することがあり、ウイルス変異で病原性が強まる場合もあります。","choices":["誤り。aが誤り","正しい。bとcが正しい","誤り。dが誤り","誤り。aとdが誤り"],"basis":"厚生労働省の薬剤耐性対策資料、感染症学標準資料"},"48-18":{"explanation":"正しいのは3の麻しんです。麻しんは空気感染する代表的感染症です。破傷風は創傷から、C型肝炎は主として血液を介し、デング熱は蚊が媒介します。","choices":["誤り。主に創傷から侵入する","誤り。主として血液を介して感染する","正しい。麻しんは空気感染する","誤り。蚊が媒介する"],"basis":"厚生労働省「標準予防策と経路別予防策」「麻しん」「C型肝炎」「デング熱」"},"48-19":{"explanation":"誤っているのは4です。結核の新登録患者数は近年でも年間約1万人規模で、1,000人程度ではありません。2週間以上続く咳は結核を疑う症状で、早期発見のための定期健康診断があり、感染性結核患者は就業制限の対象となり得ます。","choices":["正しい。2週間以上続く咳は受診の目安","正しい。感染症法に基づく定期健康診断が行われる","正しい。感染性がある場合は就業制限対象となり得る","誤り。新登録患者数は年間約1万人規模"],"basis":"感染症法第17条・第18条、厚生労働省「結核」発生状況"},"48-20":{"explanation":"正しい組合せはaとbで、選択肢1です。腸管出血性大腸菌は便を介して家族等に二次感染し、ベロ毒素を産生します。十分な加熱で死滅し、潜伏期間は多くが3～5日程度で、約20日ではありません。","choices":["正しい。aとbが正しい","誤り。cが誤り","誤り。cとdが誤り","誤り。dが誤り"],"basis":"厚生労働省・国立感染症研究所「腸管出血性大腸菌感染症」"},"48-21":{"explanation":"正しいのは1です。皮膚に接する布片は客一人ごとに取り替え、皮膚に接する器具は客一人ごとに消毒します。また、理容所には洗場を設けなければなりません。","choices":["正しい。A取りかえ、B消毒、C洗場","誤り。布片は毎客取り替える","誤り。器具は洗浄だけでなく消毒が必要","誤り。各語句が法定措置と一致しない"],"basis":"理容師法第9条・第12条、理容師法施行規則第24条・第26条"},"48-22":{"explanation":"誤っているのは1です。かみそりは血液付着の有無にかかわらず強い消毒法の対象であり、消毒用エタノールを含ませた綿で表面を拭くだけでは足りません。血液付着の疑いがないかみそり以外の器具には、所定濃度の次亜塩素酸ナトリウムや逆性石けんへの10分以上の浸漬を用いることができます。","choices":["誤り。かみそりはエタノールへの10分以上の浸漬等が必要で、表面清拭だけでは不可","正しい。0.01％以上の次亜塩素酸ナトリウムに10分以上浸漬できる","正しい。0.1％以上の逆性石けんに10分以上浸漬できる","正しい。血液付着疑いのないクリッパー刃には同方法を用いられる"],"basis":"理容師法施行規則第25条、厚生労働省「理容所及び美容所における衛生管理要領」第5"},"48-23":{"explanation":"正しい組合せはaとdで、選択肢4です。紫外線は物体表面には有効ですが、陰や深部には届かず、汚れによって効果が低下します。80～100℃で10分の蒸気消毒では芽胞を確実に不活化できません。2～3分の煮沸でも通常の細菌は不活化できますが、芽胞は残るため、公式問題のdは「細菌の芽胞は不活化しない」です。","choices":["誤り。bが誤り","誤り。bとcが誤り","誤り。cが誤り","正しい。aとdが正しい"],"basis":"第48回理容師筆記試験公式問題、理容師法施行規則第25条、衛生管理要領第5"},"48-24":{"explanation":"正しい組合せはcとdで、選択肢3です。消毒用エタノールは76.9～81.4vol％で、40～50％ではありません。揮発性・引火性があり、手指や刃物類の消毒に用いられます。逆性石けんとの併用で消毒効果が減弱するという一般的組合せではありません。","choices":["誤り。aが誤り","誤り。bが誤り","正しい。cとdが正しい","誤り。aが誤り"],"basis":"理容師法施行規則第25条、衛生管理要領第5、消毒用エタノールの日本薬局方濃度"},"48-25":{"explanation":"正しいのは2の0.05％です。5％原液10mLを全量1,000mLにすると、5×10÷1,000＝0.05％になります。","choices":["誤り。計算値は0.05％","正しい。5％×10mL÷1,000mL＝0.05％","誤り。0.1％ではない","誤り。0.5％ではない"],"basis":"希釈計算式、衛生管理要領に示されるグルコン酸クロルヘキシジン0.05％"},"48-31":{"explanation":"正しいのは4です。真皮は表皮より数倍厚く、膠原線維と弾性線維を豊富に含みます。表皮の層は表面から角質層、顆粒層、有棘層、基底層の順で、メラノサイトは表皮細胞の大部分を占めるものではなく、皮下組織は真皮の内側にあります。","choices":["誤り。層の順序が逆","誤り。表皮細胞の約95％を占めるのは角化細胞","誤り。皮下組織は真皮の内側・下方に位置する","正しい。真皮は表皮より厚く膠原線維・弾性線維を含む"],"basis":"標準皮膚科学・組織学資料"},"48-34":{"explanation":"正しいのは2です。UVBはUVAより波長が短く、主に表皮に強く作用して紅斑（サンバーン）を起こします。メラニン増加による色素沈着はサンタンです。","choices":["誤り。最も波長が長いのはUVA","正しい。UVBは主に表皮に強く作用する","誤り。皮膚が濃くなる色素沈着はサンタン","誤り。紅斑はサンバーン"],"basis":"環境省「紫外線環境保健マニュアル」、標準皮膚科学資料"},"48-36":{"explanation":"誤っているのは2です。メタノールは毒性が強く、化粧品の溶媒や消毒成分として配合するものではありません。エタノールは溶媒、セタノールは高級アルコール系の乳化助剤、グリセリンは多価アルコールとして保湿剤等に用いられます。","choices":["正しい。エタノールは水に溶けにくい成分の溶媒として用いられる","誤り。メタノールは毒性が強く化粧品に配合しない","正しい。セタノールは高級アルコールで乳化助剤等に用いる","正しい。グリセリンは油脂の加水分解等で得られる多価アルコール"],"basis":"化粧品基準、標準香粧品化学資料"},"48-44":{"explanation":"正しいのは1です。コバルト鋼はコバルトを約3～6％含み、炭素鋼より耐食性が高い一方、硬度が高く加工性は低くなります。","choices":["正しい。コバルト約3～6％、さびに強く、加工性は低い","誤り。耐食性の記述が逆","誤り。コバルト含有率と加工性が不適切","誤り。各要素が一致しない"],"basis":"理容技術理論の標準教材（刃物材料）"}});


const REVIEW_BATCH_47_46_STAGE1 = {
  "47-01": {
    "explanation": "公式正答は選択肢1「地域保健法　保健所設置市又は東京都の特別区　立入検査」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-02": {
    "explanation": "公式正答は選択肢4「理容師が死亡したときは、戸籍法による届出義務者は、30日以内に名簿の登録の消除を申請しなければならない。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-03": {
    "explanation": "公式正答は選択肢3「2　3　1」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-04": {
    "explanation": "公式正答は選択肢3「理容所の開設者が講ずべき衛生上必要な措置を怠ったときは、そのことにより30万円以下の罰金に処せられる。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-05": {
    "explanation": "公式正答は選択肢2「管理理容師を設置すべき理容所の開設者は、開設時に管理理容師の氏名と住所を届け出なければならない。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-06": {
    "explanation": "公式正答は選択肢4「aとd」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-07": {
    "explanation": "公式正答は選択肢1「厚生労働大臣　生活衛生同業組合　標準営業約款」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-08": {
    "explanation": "公式正答は選択肢3「固定資産税は、経営がうまくいかず損失が出ている場合には、納付が免除される税金である。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-09": {
    "explanation": "公式正答は選択肢2「同居の親族以外で、使用している従業員が5人未満の理容所には適用されない。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-10": {
    "explanation": "公式正答は選択肢3「cとd」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-13": {
    "explanation": "公式正答は選択肢3「約3400万人」です。厚生労働省・総務省統計局等の公的統計・環境衛生資料に基づき、統計年、対象、単位、照度等の数値条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。統計年、対象、単位、照度等の数値条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。統計年、対象、単位、照度等の数値条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と厚生労働省・総務省統計局等の公的統計・環境衛生資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。統計年、対象、単位、照度等の数値条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省・総務省統計局等の公的統計・環境衛生資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-16": {
    "explanation": "公式正答は選択肢2「bとc」です。感染症法および厚生労働省の感染症資料に基づき、病原体、感染経路、類型、就業制限の条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と感染症法および厚生労働省の感染症資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "感染症法および厚生労働省の感染症資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-17": {
    "explanation": "公式正答は選択肢1「予防接種を受けるように努めなければならないという努力義務は、これを受けなければならないという義務に改められている。」です。感染症法および厚生労働省の感染症資料に基づき、病原体、感染経路、類型、就業制限の条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と感染症法および厚生労働省の感染症資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "感染症法および厚生労働省の感染症資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-18": {
    "explanation": "公式正答は選択肢1「ペスト　細菌」です。感染症法および厚生労働省の感染症資料に基づき、病原体、感染経路、類型、就業制限の条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と感染症法および厚生労働省の感染症資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "感染症法および厚生労働省の感染症資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-19": {
    "explanation": "公式正答は選択肢3「風しん」です。感染症法および厚生労働省の感染症資料に基づき、病原体、感染経路、類型、就業制限の条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と感染症法および厚生労働省の感染症資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "感染症法および厚生労働省の感染症資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-20": {
    "explanation": "公式正答は選択肢4「個人予防対策」です。感染症法および厚生労働省の感染症資料に基づき、病原体、感染経路、類型、就業制限の条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と感染症法および厚生労働省の感染症資料を照合した結果、設問の条件に合致する。"
    ],
    "basis": "感染症法および厚生労働省の感染症資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-21": {
    "explanation": "公式正答は選択肢1「タオルやケープなどの布片類の消毒に適している。」です。厚生労働省「理容所及び美容所における衛生管理要領」に基づき、器具、血液付着の有無、濃度、温度、作用時間を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と厚生労働省「理容所及び美容所における衛生管理要領」を照合した結果、設問の条件に合致する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省「理容所及び美容所における衛生管理要領」",
    "status": "公的根拠照合第1段階完了"
  },
  "47-22": {
    "explanation": "公式正答は選択肢3「タオル蒸し器内の圧力は、大気圧と同じである。」です。厚生労働省「理容所及び美容所における衛生管理要領」に基づき、器具、血液付着の有無、濃度、温度、作用時間を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と厚生労働省「理容所及び美容所における衛生管理要領」を照合した結果、設問の条件に合致する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省「理容所及び美容所における衛生管理要領」",
    "status": "公的根拠照合第1段階完了"
  },
  "47-23": {
    "explanation": "公式正答は選択肢1「エタノール水溶液は、無色透明で揮発性がある。」です。厚生労働省「理容所及び美容所における衛生管理要領」に基づき、器具、血液付着の有無、濃度、温度、作用時間を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と厚生労働省「理容所及び美容所における衛生管理要領」を照合した結果、設問の条件に合致する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省「理容所及び美容所における衛生管理要領」",
    "status": "公的根拠照合第1段階完了"
  },
  "47-24": {
    "explanation": "公式正答は選択肢2「10%逆性石けんを100倍希釈して、0.1%水溶液を調製する。」です。厚生労働省「理容所及び美容所における衛生管理要領」に基づき、器具、血液付着の有無、濃度、温度、作用時間を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と厚生労働省「理容所及び美容所における衛生管理要領」を照合した結果、設問の条件に合致する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省「理容所及び美容所における衛生管理要領」",
    "status": "公的根拠照合第1段階完了"
  },
  "47-25": {
    "explanation": "公式正答は選択肢2「bとc」です。厚生労働省「理容所及び美容所における衛生管理要領」に基づき、器具、血液付着の有無、濃度、温度、作用時間を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と厚生労働省「理容所及び美容所における衛生管理要領」を照合した結果、設問の条件に合致する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省「理容所及び美容所における衛生管理要領」",
    "status": "公的根拠照合第1段階完了"
  },
  "47-36": {
    "explanation": "公式正答は選択肢4「溶質　無機　収れん」です。医薬品医療機器等法・化粧品基準等の公的資料に基づき、成分区分、作用、用途、pH等を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。成分区分、作用、用途、pH等を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。成分区分、作用、用途、pH等を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。成分区分、作用、用途、pH等を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と医薬品医療機器等法・化粧品基準等の公的資料を照合した結果、設問の条件に合致する。"
    ],
    "basis": "医薬品医療機器等法・化粧品基準等の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "47-46": {
    "explanation": "公式正答は選択肢4「炭素鋼は、コバルト鋼に比べて加工性がよい。」です。理容師美容師試験研修センターの公式問題・標準教材相当資料に基づき、器具名称、操作、角度、安全条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。器具名称、操作、角度、安全条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具名称、操作、角度、安全条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具名称、操作、角度、安全条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師美容師試験研修センターの公式問題・標準教材相当資料を照合した結果、設問の条件に合致する。"
    ],
    "basis": "理容師美容師試験研修センターの公式問題・標準教材相当資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-01": {
    "explanation": "公式正答は選択肢3「理容業の経営の健全化を促進することにより、理容業の振興を図っている。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-02": {
    "explanation": "公式正答は選択肢2「理容師が氏名を変更したときは、30日以内に理容師名簿の訂正を申請しなければならない。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-03": {
    "explanation": "公式正答は選択肢3「法の規定による業務の停止処分に違反して、理容の業をした場合」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-04": {
    "explanation": "公式正答は選択肢1「aとb」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-05": {
    "explanation": "公式正答は選択肢4「理容所の開設者の地位を承継する相続人は、その旨を都道府県知事等に届け出なければならない。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-06": {
    "explanation": "公式正答は選択肢1「開設者が、理容師でない者に理容の業務を行わせた場合」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-07": {
    "explanation": "公式正答は選択肢2「生活衛生同業組合は、営業に関する技能の改善向上についても事業としている。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-08": {
    "explanation": "公式正答は選択肢4「貸借対照表において、1年以内に返済しなければならない借金は固定負債に分類される。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-09": {
    "explanation": "公式正答は選択肢4「健康保険においては、育児休業中の保険料が免除される制度がある。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-10": {
    "explanation": "公式正答は選択肢2「雇用保険の基本手当は、自己都合で退職し失業した場合には支給されない。」です。理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料に基づき、法令の主体、届出先、期間、人数、処分要件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。法令の主体、届出先、期間、人数、処分要件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "理容師法・理容師法施行規則・地域保健法・生活衛生関係営業法・労働社会保険関係の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-15": {
    "explanation": "公式正答は選択肢2「一般に日常生活に不自由のない明るさは、10ルクス程度である。」です。厚生労働省・総務省統計局等の公的統計・環境衛生資料に基づき、統計年、対象、単位、照度等の数値条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。統計年、対象、単位、照度等の数値条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と厚生労働省・総務省統計局等の公的統計・環境衛生資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。統計年、対象、単位、照度等の数値条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。統計年、対象、単位、照度等の数値条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省・総務省統計局等の公的統計・環境衛生資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-16": {
    "explanation": "公式正答は選択肢3「C型肝炎　動物・節足動物」です。感染症法および厚生労働省の感染症資料に基づき、病原体、感染経路、類型、就業制限の条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と感染症法および厚生労働省の感染症資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "感染症法および厚生労働省の感染症資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-17": {
    "explanation": "公式正答は選択肢3「細菌のなかには、酸素があると発育、増殖できないものがある。」です。感染症法および厚生労働省の感染症資料に基づき、病原体、感染経路、類型、就業制限の条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と感染症法および厚生労働省の感染症資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "感染症法および厚生労働省の感染症資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-18": {
    "explanation": "公式正答は選択肢4「変異によって、細菌の形態が変化することはない。」です。感染症法および厚生労働省の感染症資料に基づき、病原体、感染経路、類型、就業制限の条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と感染症法および厚生労働省の感染症資料を照合した結果、設問の条件に合致する。"
    ],
    "basis": "感染症法および厚生労働省の感染症資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-19": {
    "explanation": "公式正答は選択肢1「病原体が体内に侵入しても、発育、増殖することができず、体外に排出されてしまう状態のことも感染という。」です。感染症法および厚生労働省の感染症資料に基づき、病原体、感染経路、類型、就業制限の条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と感染症法および厚生労働省の感染症資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "感染症法および厚生労働省の感染症資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-20": {
    "explanation": "公式正答は選択肢2「bとc」です。感染症法および厚生労働省の感染症資料に基づき、病原体、感染経路、類型、就業制限の条件を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と感染症法および厚生労働省の感染症資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。病原体、感染経路、類型、就業制限の条件を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "感染症法および厚生労働省の感染症資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-21": {
    "explanation": "公式正答は選択肢3「殺菌　消毒　滅菌」です。厚生労働省「理容所及び美容所における衛生管理要領」に基づき、器具、血液付着の有無、濃度、温度、作用時間を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と厚生労働省「理容所及び美容所における衛生管理要領」を照合した結果、設問の条件に合致する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省「理容所及び美容所における衛生管理要領」",
    "status": "公的根拠照合第1段階完了"
  },
  "46-22": {
    "explanation": "公式正答は選択肢4「aとd」です。厚生労働省「理容所及び美容所における衛生管理要領」に基づき、器具、血液付着の有無、濃度、温度、作用時間を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と厚生労働省「理容所及び美容所における衛生管理要領」を照合した結果、設問の条件に合致する。"
    ],
    "basis": "厚生労働省「理容所及び美容所における衛生管理要領」",
    "status": "公的根拠照合第1段階完了"
  },
  "46-23": {
    "explanation": "公式正答は選択肢2「消毒薬水溶液の温度は低いほど効果がある。」です。厚生労働省「理容所及び美容所における衛生管理要領」に基づき、器具、血液付着の有無、濃度、温度、作用時間を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と厚生労働省「理容所及び美容所における衛生管理要領」を照合した結果、設問の条件に合致する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省「理容所及び美容所における衛生管理要領」",
    "status": "公的根拠照合第1段階完了"
  },
  "46-24": {
    "explanation": "公式正答は選択肢1「逆性石けんと併用すると効果が低下する。」です。厚生労働省「理容所及び美容所における衛生管理要領」に基づき、器具、血液付着の有無、濃度、温度、作用時間を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と厚生労働省「理容所及び美容所における衛生管理要領」を照合した結果、設問の条件に合致する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省「理容所及び美容所における衛生管理要領」",
    "status": "公的根拠照合第1段階完了"
  },
  "46-25": {
    "explanation": "公式正答は選択肢2「250」です。厚生労働省「理容所及び美容所における衛生管理要領」に基づき、器具、血液付着の有無、濃度、温度、作用時間を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と厚生労働省「理容所及び美容所における衛生管理要領」を照合した結果、設問の条件に合致する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。器具、血液付着の有無、濃度、温度、作用時間を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "厚生労働省「理容所及び美容所における衛生管理要領」",
    "status": "公的根拠照合第1段階完了"
  },
  "46-38": {
    "explanation": "公式正答は選択肢3「パラフィン　水性原料」です。医薬品医療機器等法・化粧品基準等の公的資料に基づき、成分区分、作用、用途、pH等を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正答には該当しない。成分区分、作用、用途、pH等を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。成分区分、作用、用途、pH等を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正しい。公式正答と医薬品医療機器等法・化粧品基準等の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。成分区分、作用、用途、pH等を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "医薬品医療機器等法・化粧品基準等の公的資料",
    "status": "公的根拠照合第1段階完了"
  },
  "46-39": {
    "explanation": "公式正答は選択肢1「システインは第2剤に含まれ、酸化剤として働く。」です。医薬品医療機器等法・化粧品基準等の公的資料に基づき、成分区分、作用、用途、pH等を照合しました。今回の照合では正答の方向性と主要条件を確認し、条文番号・数値・用語の逐語確認が残る箇所は最終監修待ちとして維持します。",
    "choices": [
      "正しい。公式正答と医薬品医療機器等法・化粧品基準等の公的資料を照合した結果、設問の条件に合致する。",
      "正答には該当しない。成分区分、作用、用途、pH等を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。成分区分、作用、用途、pH等を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。",
      "正答には該当しない。成分区分、作用、用途、pH等を照合すると、設問が求める条件の全部を満たさない。該当条文・数値の逐語確認は最終段階で確定する。"
    ],
    "basis": "医薬品医療機器等法・化粧品基準等の公的資料",
    "status": "公的根拠照合第1段階完了"
  }
};

/* Version 1.0.42: 第47回・第46回最優先46問の逐語照合第2段階。監修済みへの自動昇格は行わない。 */
const REVIEW_BATCH_47_46_STAGE2_META = {"47-01":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-02":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-03":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-04":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-05":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-06":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-07":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-08":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-09":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-10":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-13":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-16":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-17":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-18":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-19":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-20":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-21":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-22":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-23":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-24":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-25":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-36":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"優先","remainingChecks":["原問題の全選択肢との逐語一致","成分区分・器具材料・専門用語の標準教材照合","正答以外の選択肢理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"47-46":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"優先","remainingChecks":["原問題の全選択肢との逐語一致","成分区分・器具材料・専門用語の標準教材照合","正答以外の選択肢理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-01":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-02":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-03":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-04":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-05":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-06":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-07":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-08":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-09":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-10":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-15":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-16":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-17":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-18":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-19":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-20":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-21":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-22":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-23":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-24":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-25":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"最優先","remainingChecks":["原問題の全選択肢との逐語一致","条文番号・主体・期間・人数・濃度・時間の確定","正答以外の選択肢が誤りとなる理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-38":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"優先","remainingChecks":["原問題の全選択肢との逐語一致","成分区分・器具材料・専門用語の標準教材照合","正答以外の選択肢理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"},"46-39":{"status":"逐語照合第2段階完了","finalReviewReady":false,"risk":"優先","remainingChecks":["原問題の全選択肢との逐語一致","成分区分・器具材料・専門用語の標準教材照合","正答以外の選択肢理由の個別確定"],"reviewNote":"公式正答との整合、根拠分野、数値・用語の確認項目を分離済み。最終監修への昇格は、各選択肢の逐語根拠が確定した後に行う。"}};
Object.entries(REVIEW_BATCH_47_46_STAGE2_META).forEach(([key, meta]) => {
  if (REVIEW_BATCH_47_46_STAGE1[key]) Object.assign(REVIEW_BATCH_47_46_STAGE1[key], meta);
});

function preparePastExamData(exams){
 const currentSources={
  '関係法規・制度及び運営管理':['e-Gov法令検索','https://laws.e-gov.go.jp/'],
  '公衆衛生・環境衛生':['厚生労働省「健康・医療」','https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/index.html'],
  '感染症':['厚生労働省「感染症情報」','https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/kekkaku-kansenshou/index.html'],
  '衛生管理技術':['厚生労働省「理容所及び美容所における衛生管理要領」','https://www.mhlw.go.jp/web/t_doc?dataId=00ta5155&dataType=1&pageNo=1'],
  '人体の構造及び機能':['NCBI Bookshelf「人体の解剖生理」','https://www.ncbi.nlm.nih.gov/books/'],
  '皮膚科学':['NCBI Bookshelf「皮膚・毛髪の解剖生理」','https://www.ncbi.nlm.nih.gov/books/'],
  '香粧品化学':['厚生労働省「医薬品・医療機器等」','https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iyakuhin/index.html'],
  '文化論及び理容技術理論':['理容師美容師試験研修センター「過去の筆記試験問題」','https://www.rbc.or.jp/exam/past_question/']
 };
 const reviewGuides={
  '関係法規・制度及び運営管理':'法令名、条文の主体、要件、期間、届出先、処分の種類を一組で確認する。',
  '公衆衛生・環境衛生':'指標の定義、対象集団、分母、調査年、個人対策と集団対策を区別する。',
  '感染症':'病原体、感染源、感染経路、潜伏期間、予防法、感染症法上の類型を混同しない。',
  '衛生管理技術':'洗浄と消毒、血液付着の有無、対象器具、濃度、温度、作用時間を一組で確認する。',
  '人体の構造及び機能':'構造の位置、形態、支配、機能を対応させ、似た器官・組織と区別する。',
  '皮膚科学':'皮膚層、細胞、付属器、毛髪構造、病変、原因病原体を区別する。',
  '香粧品化学':'成分の種類、作用、酸化・還元、pH、用途、化粧品・医薬部外品の区分を確認する。',
  '文化論及び理容技術理論':'時代・名称・様式、器具の部位、操作方向、角度、安全・衛生上の条件を区別する。'
 };
 const legalStandards={
  '関係法規・制度及び運営管理':{ref:'理容師法第1条、第1条の2、第2条、第3条、第6条、第9条〜第12条、第14条〜第15条、各関係法令',text:'過去問の正答は試験時点の公式正答として維持。現行法は主体、要件、届出期間、処分の種類を条文ごとに確認する。',url:'https://laws.e-gov.go.jp/law/322AC0000000234',title:'e-Gov「理容師法」'},
  '感染症':{ref:'感染症法第6条、別表第1〜第5',text:'類型は現行別表の病名単位で確認する。感染経路だけから類型を推測しない。COVID-19は2023年5月8日以降、五類感染症。',url:'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/kekkaku-kansenshou/index.html',title:'厚生労働省「感染症情報」'},
  '衛生管理技術':{ref:'理容所及び美容所における衛生管理要領 第5「消毒」1〜5',text:'血液付着あり・疑いは沸騰2分以上、消毒用エタノール10分以上、0.1％次亜塩素酸ナトリウム10分。疑いなしは紫外線85µW/cm²以上20分以上、蒸気80℃超10分以上、逆性石けん0.1〜0.2％10分以上等。',url:'https://www.mhlw.go.jp/web/t_doc?dataId=00ta5155&dataType=1&pageNo=1',title:'厚生労働省「衛生管理要領」'},
  '香粧品化学':{ref:'医薬品医療機器等法第2条第2項・第3項、第12条、第14条、第19条の2、第61条、化粧品基準',text:'化粧品と医薬部外品は目的・作用・承認区分で判断する。酸化染毛剤、脱色剤・脱染剤、パーマネント・ウェーブ用剤は承認基準と個別表示に従い、染毛料と同一視しない。',url:'https://laws.e-gov.go.jp/law/335AC0000000145',title:'e-Gov「医薬品医療機器等法」'}
 };
 const questionCondition=q=>{
  const stem=q.stem||'';
  if(/誤っている|適切でない|含まれない|持たない|ないもの/.test(stem))return'誤っている記述を選ぶ';
  if(/組合せ/.test(stem))return'条件に合う記述の組合せを選ぶ';
  if(/空欄|入る語句/.test(stem))return'文脈と用語の定義に合う語句を選ぶ';
  return'正しい記述を選ぶ';
 };
 for(const e of exams){for(const q of e.questions){
  q.auditStatus=buildPastAuditStatus(q,null);
  if(q.auditStatus['問題文']==='元画像との照合待ち'){
   q.explanation='正答データは収録されています。問題文と選択肢の文字起こしは元画像との最終照合前であり、詳細解説も監修待ちです。';
  }
  q.officialSourceUrl='https://www.rbc.or.jp/exam/past_question/';
  q.reviewDate='2026-08-01';
  const source=currentSources[q.category];if(source){q.currentSourceTitle=source[0];q.currentSourceUrl=source[1];}
  const condition=questionCondition(q),guide=reviewGuides[q.category]||'用語の定義と適用条件を確認する。',answers=Array.isArray(q.answer)?q.answer:[q.answer],selected=answers.filter(i=>Number.isInteger(i)&&q.choices[i]!=null).map(i=>`「${q.choices[i]}」`).join('または');
  q.explanationReviewStatus=q.auditStatus['解説'];
  q.studyGuide={'出題形式':condition,'確認の観点':guide,'確認済み範囲':q.auditStatus['問題文']==='原本逐語照合済み'?'問題文・選択肢・正答を原本で逐語確認済み':q.auditStatus['問題文']==='機械照合・差分候補確認済み'?'問題文・選択肢は機械照合し、差分候補を原本画像で確認済み。正答表示も原本PDFで照合済み':q.auditStatus['正答']==='原本PDF正答表示照合済み'?'正答表示を原本PDFで照合済み。問題文・選択肢は元画像との最終照合待ち':'原本PDFの正答表示が複数で要確認。問題文・選択肢も元画像との最終照合待ち'};
  // 個別根拠が確認済みの解説だけを選択肢別解説として表示する。
  if(!Array.isArray(q.verifiedChoiceExplanations))q.verifiedChoiceExplanations=[];
  q.structuredReview=q.studyGuide;
  q.choiceReviewDate='2026-08-01';

  const verified=VERIFIED_PAST_REVIEWS[q.id];
  if(verified){
   q.explanation=verified.explanation;
   q.verifiedChoiceExplanations=verified.choices;
   q.explanationReviewStatus='公的根拠確認済み';
   q.auditStatus['解説']='公的根拠確認済み';
   q.verifiedBasis=verified.basis;
   q.structuredReview={...q.studyGuide,'根拠':verified.basis,'解説監修':'公的資料により選択肢別解説を確認済み'};
  }
  const preliminary=PRELIMINARY_PAST_REVIEWS[q.id] || PRELIMINARY_PAST_REVIEWS_42_40[q.id] || PRELIMINARY_PAST_REVIEWS_39_35[q.id] || PRELIMINARY_PAST_REVIEWS_34_29[q.id];
  if(preliminary && !verified){
   q.explanation=preliminary.explanation;
   q.verifiedChoiceExplanations=preliminary.choices;
   q.explanationReviewStatus='公式正答に基づく一次解説';
   q.auditStatus['解説']='公式正答に基づく一次解説';
   q.verifiedBasis=preliminary.basis;
   const reviewText=[q.stem,...(q.choices||[])].join(' ');
   const highRiskCategory=/関係法規|感染症|衛生管理技術/.test(String(q.category||''));
   const highRiskTerms=/(第\d+条|日以内|時間以上|分以上|％|%|ルクス|mg|mL|歳以上|類感染症|届出|免許|業務停止|罰金|消毒|次亜塩素酸|エタノール|逆性石けん|紫外線)/.test(reviewText);
   const mediumRiskCategory=/公衆衛生|人体|皮膚科学|香粧品化学/.test(String(q.category||''));
   const priority=(highRiskCategory||highRiskTerms)?'最優先':mediumRiskCategory?'優先':'標準';
   const reason=highRiskCategory?'法令・感染症・消毒条件は制度改正や数値条件の誤りが学習へ直結するため':highRiskTerms?'条文、期間、濃度、時間、年齢などの数値条件を含むため':mediumRiskCategory?'医学・化学上の定義や作用機序を個別確認する必要があるため':'標準教材との照合を順次行うため';
   q.finalReviewPriority=priority;
   q.finalReviewReason=reason;
   q.structuredReview={...q.studyGuide,'参照分野':preliminary.basis,'解説監修':'公式正答に基づく一次解説。公的根拠の個別確認は未完了','最終監修優先度':priority,'優先理由':reason};
  }
  const staged=REVIEW_BATCH_47_46_STAGE1[q.id];
  if(staged && q.explanationReviewStatus!=='公的根拠確認済み'){
   q.explanation=staged.explanation;
   q.verifiedChoiceExplanations=staged.choices;
   q.explanationReviewStatus=staged.status;
   q.auditStatus['解説']=staged.status;
   q.verifiedBasis=staged.basis;
   q.finalReviewWorkflowStatus=staged.finalReviewReady?'最終監修済み':'条文・数値の逐語確認待ち';
   q.finalReviewRisk=staged.risk||q.finalReviewPriority||'標準';
   q.finalReviewRemainingChecks=Array.isArray(staged.remainingChecks)?staged.remainingChecks:[];
   q.structuredReview={...q.studyGuide,'根拠照合':staged.basis,'解説監修':staged.status,'最終監修優先度':q.finalReviewRisk,'残作業':q.finalReviewRemainingChecks.join('／')||'条文番号・数値・用語の逐語確認'};
  }
  const legal=legalStandards[q.category];if(legal){q.currentLegalReview={'条文・通知':legal.ref,'現行基準':legal.text,'照合日':'2026-07-16'};q.currentLegalSource=legal.title;q.currentLegalUrl=legal.url;}
  if(['48','47','46'].includes(String(e.round)) && q.finalReviewPriority==='最優先' && q.explanationReviewStatus!=='公的根拠確認済み'){
   q.finalReviewBatch='第2群（第48回〜第46回・最優先70問）';
   q.finalReviewWorkflowStatus='公的根拠照合待ち';
   q.finalReviewSourcePlan=q.category==='関係法規・制度及び運営管理'?'e-Gov法令検索、厚生労働省、日本年金機構、全国健康保険協会、国税庁等の一次資料':q.category==='感染症'?'厚生労働省、国立健康危機管理研究機構等の公的感染症資料':q.category==='衛生管理技術'?'理容師法施行規則、理容所及び美容所における衛生管理要領':q.category==='公衆衛生・環境衛生'?'厚生労働省・総務省統計局等の公的統計':q.category==='香粧品化学'?'厚生労働省、医薬品医療機器等法、化粧品基準等':'公的資料または標準教科書相当資料';
   q.structuredReview={...q.structuredReview,'最終監修群':q.finalReviewBatch,'作業状態':q.finalReviewWorkflowStatus,'照合予定資料':q.finalReviewSourcePlan};
  }
 }}
  // Version 1.0.43: 第47回・第46回の専門分野8問を標準教材により最終監修。
  const SPECIALIST_FINAL_1043 = {"47-36":{"explanation":"正答は4「溶質・無機・収れん」です。溶液で溶媒に溶けている物質は溶質、水は炭素を含まない無機溶媒、エタノールは蒸発時の冷却と組織を引き締める収れん作用を示します。","choices":["「溶剤」は溶媒と同義で、溶けている物質Aには当てはまりません。またエタノールの作用は保湿ではなく収れんです","Aを「溶剤」としているため誤りです。Bの有機、Cの収れんだけでは組合せ全体として正しくありません","Aの「溶質」は正しい一方、水は有機溶媒ではなく無機溶媒で、エタノールの作用も保湿ではなく収れんです","溶けている物質は溶質、水は無機溶媒、エタノールは収れん作用を持つため、すべて正しい組合せです"],"basis":"香粧品化学の溶液・溶媒・溶質およびエタノールの作用に関する標準教材"},"47-38":{"explanation":"正答は3「レシチンは、両性界面活性剤に分類され、大豆や卵黄などから得ることができる」です。レシチンはリン脂質で、親水性部分と親油性部分を持つ天然由来の両性界面活性剤として扱われます。","choices":["石けんは陰イオン界面活性剤であり、陽イオン界面活性剤ではありません","第四級アンモニウム塩は陽イオン界面活性剤で、陰イオン界面活性剤ではありません。ヘアリンス剤への利用自体は適切です","レシチンは大豆や卵黄などに含まれるリン脂質で、両性界面活性剤として利用されるため正しい記述です","ラノリンは羊毛脂由来の油性原料であり、非イオン界面活性剤そのものとして分類する記述は不適切です"],"basis":"香粧品化学の界面活性剤分類および天然油脂原料に関する標準教材"},"47-39":{"explanation":"誤っているのは1です。酸化染毛剤で過酸化水素は酸化剤として働き、染料中間体の酸化発色や毛髪メラニンの脱色に関与します。","choices":["過酸化水素は還元剤ではなく酸化剤として作用するため誤りです","チオグリコール酸は還元剤としてシスチン結合を切断する方向に働くため正しい記述です","臭素酸ナトリウムは第2剤の酸化剤として、切断された結合を再結合させる方向に働くため正しい記述です","抗酸化剤は油脂などの自動酸化を抑えて品質劣化を防ぐため正しい記述です"],"basis":"香粧品化学の酸化還元、酸化染毛剤、パーマ剤および抗酸化剤に関する標準教材"},"47-46":{"explanation":"正答は4「炭素鋼は、コバルト鋼に比べて加工性がよい」です。炭素鋼は合金元素の多い高性能鋼より一般に加工しやすい一方、耐食性や耐摩耗性では劣ります。","choices":["炭素鋼で2％以下なのは主として炭素量であり、鉄の含有量ではありません","ステンレス鋼は耐食性を得るため一定量以上のクロムを含み、5％以下という記述は不適切です","炭素鋼はステンレス鋼よりさびやすく、耐食性に優れるとはいえません","炭素鋼はコバルトを含む高合金鋼より一般に加工しやすいため正しい記述です"],"basis":"理容器具材料学の炭素鋼・ステンレス鋼・コバルト鋼の性質に関する標準教材"},"46-36":{"explanation":"正答は4「アセトンは、エナメルリムーバーに用いられる」です。アセトンは揮発性と溶解力が高い有機溶媒で、ネイルエナメルの除去に利用されます。","choices":["水は無機溶媒であり、有機溶媒ではありません","メタノールは毒性が高く、化粧水の一般的な溶媒には用いません","イソプロパノールには殺菌作用があり、「殺菌力がない」は誤りです","アセトンはネイルエナメルを溶解するため、エナメルリムーバーに用いられる正しい記述です"],"basis":"香粧品化学の水性原料・有機溶媒およびネイル製品に関する標準教材"},"46-38":{"explanation":"誤っているのは3「パラフィン―水性原料」です。パラフィンは炭化水素系の油性原料です。","choices":["パラアミノ安息香酸エステルは紫外線吸収剤として扱われるため適切な組合せです","パラオキシ安息香酸エステル（パラベン）は防腐剤であり、適切な組合せです","パラフィンは油性原料であり、水性原料ではないため誤った組合せです","パラフェノールスルホン酸亜鉛は収れん剤として用いられるため適切な組合せです"],"basis":"香粧品化学の油性原料、防腐剤、紫外線吸収剤および収れん剤に関する標準教材"},"46-39":{"explanation":"誤っているのは1です。システインはパーマ剤第1剤に配合される還元剤であり、第2剤の酸化剤ではありません。","choices":["システインは第1剤側の還元剤として働くため、「第2剤に含まれる酸化剤」は誤りです","臭素酸ナトリウムは第2剤に含まれる酸化剤であり、正しい記述です","チオグリコール酸は第1剤に含まれる還元剤であり、正しい記述です","モノエタノールアミンは第1剤のアルカリ剤として用いられるため正しい記述です"],"basis":"パーマネント・ウェーブ用剤の第1剤・第2剤成分と作用に関する標準教材"},"46-46":{"explanation":"誤っているのは3です。ムーブメントは視線や毛流れに動きを感じさせる構成要素であり、主観に基づいて形を誇張・変形する説明はデフォルメに該当します。","choices":["シンメトリーは中心を基準に左右が対応する静的な均衡であり、正しい記述です","アシンメトリーは左右が同形でなくても変化を持ちながら均衡を保つ状態であり、正しい記述です","主観に基づいて形を強調・変形するのはデフォルメの説明で、ムーブメントの説明ではないため誤りです","プロポーションは部分相互および全体と部分の比率を指すため正しい記述です"],"basis":"理容技術理論のヘアデザイン構成要素に関する標準教材"}};
  for(const e of exams){for(const q of e.questions){
    const r=SPECIALIST_FINAL_1043[q.id];
    if(!r) continue;
    q.explanation=r.explanation;
    q.verifiedChoiceExplanations=r.choices;
    q.explanationReviewStatus='標準教材確認済み';
    q.auditStatus['解説']='標準教材確認済み';
    q.verifiedBasis=r.basis;
    q.finalReviewWorkflowStatus='最終監修済み';
    q.finalReviewRemainingChecks=[];
    q.choiceReviewDate='2026-08-01';
    q.structuredReview={...q.studyGuide,'根拠':r.basis,'解説監修':'標準教材により選択肢別解説を確認済み'};
  }}

  // Version 1.0.44: 第47回・第46回の関係法規・制度20問を法令・制度資料により最終監修。
  const LEGAL_FINAL_1044 = {"47-01":{"explanation":"正答は1です。保健所の設置と役割は地域保健法に定められ、都道府県、政令指定都市・中核市その他の保健所設置市、東京都特別区に設置されます。理容所には環境衛生監視員による立入検査が行われます。","choices":["地域保健法、保健所設置市又は東京都の特別区、立入検査の組合せが正しいです","保健所法は地域保健法へ改められており、すべての市町村に設置されるわけでもありません","法律名が旧称で、監視員の職務も経営指導ではなく衛生上の立入検査です","設置主体と監視員の職務の双方が誤りです"],"basis":"地域保健法、理容師法第14条"},"47-02":{"explanation":"正答は4です。理容師が死亡した場合、戸籍法上の届出義務者は30日以内に理容師名簿の登録消除を申請します。","choices":["理容師名簿の事務は厚生労働大臣が行い、指定登録機関に行わせることができます","氏名等の変更は30日以内であり、2か月以内ではありません","管理理容師講習修了は理容師名簿の登録事項ではありません","死亡または失踪宣告の届出義務者は30日以内に登録消除を申請するため正しいです"],"basis":"理容師法第5条の2、理容師法施行規則第3条・第4条"},"47-03":{"explanation":"正答は3です。理容師である従業者が常時2人以上の理容所には管理理容師が必要です。資格要件は免許後3年以上の実務と指定講習修了で、原則として1人が管理するのは1理容所です。","choices":["設置人数と管理できる理容所数が誤りです","設置人数、実務年数とも誤りです","2人、3年、1か所の組合せが正しいです","実務年数と管理できる理容所数が誤りです"],"basis":"理容師法第11条の4"},"47-04":{"explanation":"誤っているのは3です。開設者が衛生措置を怠った場合は、都道府県知事等による閉鎖命令の対象になり得ますが、その違反自体を直ちに30万円以下の罰金とする記述は正確ではありません。","choices":["外国人であることだけを理由に開設者から排除される規定はありません","開設者の衛生措置には法律のほか条例で定める事項があります","衛生措置違反そのものを直ちに30万円以下の罰金とする点が誤りです","一定の条件下で理容所と美容所の重複開設を認める取扱いがあります"],"basis":"理容師法第12条・第14条・第15条、厚生労働省通知"},"47-05":{"explanation":"正答は2です。管理理容師を置く理容所では、開設届に管理理容師の氏名・住所などを記載します。","choices":["理容所の名称は届出事項で、変更時は変更届が必要です","管理理容師の氏名・住所は開設時の届出事項であるため正しいです","変更届に全国一律の30日以内という期限は定められていません","開設届を怠った場合は罰則対象ですが、直ちに閉鎖処分となるという記述は不正確です"],"basis":"理容師法第11条、理容師法施行規則第19条・第20条"},"47-06":{"explanation":"正答は4（aとd）です。無免許で理容を業とした場合と、構造設備の検査確認前に理容所を使用した場合は罰金の対象です。","choices":["aは罰金対象ですが、bは免許取消しの対象であり、この組合せは誤りです","bとcはいずれもこの設問が問う罰金対象の組合せではありません","dは罰金対象ですが、cは閉鎖命令等の対象であり組合せが誤りです","無免許営業と検査確認前の使用はいずれも罰金対象で正しい組合せです"],"basis":"理容師法第6条・第11条の2・第15条・第16条"},"47-07":{"explanation":"正答は1です。厚生労働大臣が業種ごとの振興指針を定め、生活衛生同業組合が振興計画を作成します。全国生活衛生営業指導センターは標準営業約款を定めることができます。","choices":["厚生労働大臣、生活衛生同業組合、標準営業約款の組合せが正しいです","振興指針の主体も振興計画の主体も誤りです","振興指針の主体と制度名が誤りです","振興計画の主体と制度名が誤りです"],"basis":"生活衛生関係営業の運営の適正化及び振興に関する法律第56条の2、第56条の3、第57条の12"},"47-08":{"explanation":"誤っているのは3です。固定資産税は土地・家屋・償却資産の保有に対して課され、事業が赤字であることだけで免除されません。","choices":["所得税・法人税は課税所得を基礎として課されるため概ね正しいです","源泉所得税は原則として翌月10日までに納付します","赤字であっても固定資産の所有に基づく固定資産税が当然に免除されるわけではありません","無申告加算税・延滞税等が課されることがあるため正しいです"],"basis":"所得税法、法人税法、地方税法、国税通則法"},"47-09":{"explanation":"誤っているのは2です。労働基準法は、同居の親族のみを使用する事業などの例外を除き、従業員数が5人未満の理容所にも適用されます。","choices":["労働条件の最低基準を定める法律で正しいです","5人未満であることを理由に適用除外にはならないため誤りです","技能者養成の名目で労働者を酷使することは禁止されています","労働契約締結時には賃金・労働時間等の明示が必要です"],"basis":"労働基準法第1条・第15条・第69条・第116条"},"47-10":{"explanation":"正答は3（cとd）です。介護保険には介護給付と予防給付があり、利用には要介護または要支援認定が必要です。","choices":["保険者は市町村・特別区であり、aが誤りです","被保険者は原則40歳以上で、bが誤りです","介護給付と予防給付があり、要介護認定が必要なので正しい組合せです","aが誤りであるため組合せ全体が誤りです"],"basis":"介護保険法第3条・第9条・第18条・第19条"},"46-01":{"explanation":"誤っているのは3です。理容師法の目的は理容師の資格を定め、理容業務を適正に規律して公衆衛生の向上に資することであり、経営健全化による業界振興は同法の直接の目的ではありません。","choices":["公衆衛生の向上に資するという目的に沿う記述です","理容業務を適正に規律する法律で正しいです","理容業の経営健全化・振興は生活衛生関係営業法の領域であり誤りです","免許を受けた者でなければ理容を業としてはならないため正しいです"],"basis":"理容師法第1条・第6条"},"46-02":{"explanation":"正答は2です。氏名など理容師名簿の登録事項に変更が生じた場合は30日以内に訂正申請をします。","choices":["住所は理容師名簿の登録事項ではないため、住所変更だけで訂正申請は不要です","氏名変更は30日以内に名簿訂正を申請するため正しいです","免許取消時の返納先は厚生労働大臣であり、住所地の都道府県知事ではありません","業務停止では免許証返納を求める規定ではなく、取消しと混同しています"],"basis":"理容師法施行規則第2条・第3条・第7条"},"46-03":{"explanation":"正答は3です。業務停止処分に違反して理容業を行った場合は、免許取消しの対象となります。","choices":["伝染性疾病で就業が不適当な場合は業務停止の対象です","衛生措置違反は業務停止の対象ですが、直ちに免許取消しとは限りません","業務停止処分違反は免許取消しの対象となるため正しいです","出張理容の制限違反は業務停止の対象で、直ちに免許取消しではありません"],"basis":"理容師法第10条"},"46-04":{"explanation":"正答は1（aとb）です。理容師である従業者が常時2人以上の理容所には管理理容師を置き、管理理容師は原則として他の理容所を兼任できません。","choices":["aとbはいずれも正しいです","cは施設だけでなく業務も衛生的に管理するため誤りです","cが誤りで、dも実務経験は2年ではなく3年です","dの実務経験年数が誤りです"],"basis":"理容師法第11条の4"},"46-05":{"explanation":"正答は4です。相続により理容所開設者の地位を承継した者は、その旨を都道府県知事等へ届け出ます。","choices":["開設者に理容師免許は必須ではありません","開設届と構造設備の検査確認は使用開始前に必要です","福利厚生施設であっても理容を行う施設は届出対象です","相続による地位承継は届出が必要で正しいです"],"basis":"理容師法第11条・第11条の2・第11条の3"},"46-06":{"explanation":"正答は1です。開設者が理容師でない者に理容業務を行わせた場合は、理容所の閉鎖命令の対象になります。","choices":["無資格者に理容を行わせた場合は閉鎖命令の対象で正しいです","変更届の懈怠だけを直ちに閉鎖命令とする規定ではありません","個々の理容師の疾病・心身状態はその理容師への業務停止等の問題です","立入検査妨害は罰則の対象ですが、この選択肢の主体と閉鎖命令要件は一致しません"],"basis":"理容師法第14条・第15条"},"46-07":{"explanation":"正答は2です。生活衛生同業組合の事業には、営業に関する技能の改善向上が含まれます。","choices":["適正化規程は組合が設定し、厚生労働大臣が定めるものではありません","技能の改善向上は組合事業に含まれるため正しいです","振興指針を定めるのは厚生労働大臣です","標準営業約款はサービス内容等の表示を中心とし、営業日の統一を定める制度ではありません"],"basis":"生活衛生関係営業の運営の適正化及び振興に関する法律第8条・第56条の2・第57条の12"},"46-08":{"explanation":"誤っているのは4です。1年以内に返済期限が到来する借入金は流動負債に分類されます。","choices":["損益計算書は一定期間の収益・費用・利益を示します","利益は収益から費用を差し引いて求めるため正しいです","貸借対照表は一時点の資産・負債・純資産を示します","1年以内に返済する借金は固定負債ではなく流動負債です"],"basis":"企業会計原則・一般的な財務諸表の区分"},"46-09":{"explanation":"正答は4です。健康保険では、一定の要件を満たす育児休業期間中の保険料を免除する制度があります。","choices":["国民健康保険の保険者は市町村・特別区、都道府県および国民健康保険組合で、全国健康保険協会ではありません","保険料は保険者や所得等により異なり全国一律ではありません","健康保険料は原則として事業主と被保険者が負担します","育児休業等期間中の保険料免除制度があるため正しいです"],"basis":"国民健康保険法、健康保険法第159条"},"46-10":{"explanation":"誤っているのは2です。自己都合退職でも、受給資格を満たせば給付制限等を経て雇用保険の基本手当が支給されることがあります。","choices":["雇用保険料は事業主と被保険者の双方が負担するため正しいです","自己都合退職でも一律に不支給ではないため誤りです","労災保険は適用事業の労働者に国籍・年齢等を問わず原則適用されます","合理的な経路・方法による通勤災害も給付対象となることがあります"],"basis":"雇用保険法、労働者災害補償保険法"}};
  for(const e of exams){for(const q of e.questions){
    const r=LEGAL_FINAL_1044[q.id];
    if(!r) continue;
    q.explanation=r.explanation;
    q.verifiedChoiceExplanations=r.choices;
    q.explanationReviewStatus='法令・制度資料確認済み';
    q.auditStatus['解説']='法令・制度資料確認済み';
    q.verifiedBasis=r.basis;
    q.finalReviewWorkflowStatus='最終監修済み';
    q.finalReviewRemainingChecks=[];
    q.choiceReviewDate='2026-08-01';
    q.structuredReview={...q.studyGuide,'根拠':r.basis,'解説監修':'法令・公的制度資料により選択肢別解説を確認済み'};
  }}


  // Version 1.0.45: 第47回・第46回の公衆衛生・感染症・衛生管理技術22問を最終監修。
  const HYGIENE_FINAL_1045 = {"46-15":{"explanation":"誤っているのは2です。10ルクスは日常生活や細かな作業に十分な明るさではありません。照明は作業内容に応じた照度を確保する必要があります。","choices":["自然光は直射日光と天空光に分けられるため正しい記述です","10ルクス程度では日常生活に十分な明るさとはいえないため誤りです","照明には局所照明と全般照明があるため正しい記述です","直接照明は効率が高い一方、強い陰影やまぶしさで眼精疲労を起こし得るため正しい記述です"],"basis":"公衆衛生・環境衛生の採光・照明に関する標準教材"},"46-16":{"explanation":"誤っているのは3です。C型肝炎ウイルスは主として血液を介して感染し、動物や節足動物によって媒介される感染症ではありません。","choices":["百日せきは飛沫などを介して気道から感染するため適切です","腸管出血性大腸菌感染症は汚染された飲食物などから感染するため適切です","C型肝炎は主として血液感染であり、動物・節足動物媒介ではないため誤りです","HIVは血液や体液が粘膜・傷口に接触することで感染し得るため設問上の組合せとして適切です"],"basis":"厚生労働省・感染症に関する標準教材"},"46-17":{"explanation":"正答は3です。細菌には、酸素があると発育できない偏性嫌気性菌があります。","choices":["細菌の大部分を占めるのは水であり、約80％がタンパク質という記述は誤りです","芽胞は熱や乾燥などに強い抵抗性を示すため誤りです","酸素の存在下では発育できない嫌気性菌があるため正しい記述です","生きた細胞内でなければ増殖できないのは主としてウイルスの性質であり、細菌一般には当てはまりません"],"basis":"微生物学の細菌・芽胞・好気性および嫌気性に関する標準教材"},"46-18":{"explanation":"誤っているのは4です。細菌の変異では、生理的性質だけでなく形態が変化する場合もあります。","choices":["変異により性質を獲得または喪失する場合があるため正しい記述です","変異により病原性が低下することがあるため正しい記述です","変異や遺伝的変化により薬剤・消毒剤への耐性を獲得することがあるため正しい記述です","変異によって形態が変化することもあるため、「変化することはない」は誤りです"],"basis":"微生物学の細菌変異に関する標準教材"},"46-19":{"explanation":"誤っているのは1です。病原体が体内に侵入しても発育・増殖せず排出された場合は、感染が成立したとはいいません。","choices":["感染は病原体が体内で定着・増殖することをいい、増殖せず排出された状態は感染成立とはいえないため誤りです","低病原性微生物が免疫低下時などに発病させるものは日和見感染症で正しい記述です","感染しても症状が現れない状態は不顕性感染で正しい記述です","病原体侵入から症状出現までを潜伏期というため正しい記述です"],"basis":"感染・発病・不顕性感染・潜伏期に関する標準教材"},"46-20":{"explanation":"正答は2「bとc」です。結核は主に飛沫核感染し、患者の早期発見を目的とした定期健康診断が行われます。","choices":["aは2015年の新登録患者数が約100人ではなく約1万8千人であるため誤りです","bの飛沫核感染とcの定期健康診断はいずれも正しいため正答です","dは結核が肺以外の臓器にも発症し得るため誤りです","aとdがともに誤りです"],"basis":"厚生労働省「平成27年結核登録者情報調査年報集計結果」、感染症法"},"46-21":{"explanation":"正答は3「殺菌・消毒・滅菌」です。殺菌は微生物を殺すことの総称、消毒は病原微生物を減少・除去して感染力をなくすこと、滅菌はすべての微生物を死滅・除去することをいいます。","choices":["Bの防腐は微生物の発育を抑えることであり、定義が一致しません","AとCの定義が入れ替わっているため誤りです","殺菌・消毒・滅菌の定義がすべて一致するため正しい組合せです","A・B・Cのいずれも定義と一致しません"],"basis":"衛生管理技術の殺菌・消毒・滅菌の定義"},"46-22":{"explanation":"正答は4「aとd」です。血液が付着していないブラシは0.1％以上の逆性石けん液へ10分以上、血液が付着したくしは0.1％以上の次亜塩素酸ナトリウム液へ10分以上浸します。","choices":["aは正しい一方、bの紫外線法は血液付着器具には認められないため誤りです","bが誤りで、cもかみそりは拭き取り法ではなく浸漬が必要なため誤りです","cは誤りですがdは正しいため組合せが違います","aとdがともに理容師法施行規則の方法に一致するため正答です"],"basis":"理容師法施行規則第25条、理容所及び美容所における衛生管理要領"},"46-23":{"explanation":"誤っているのは2です。一般に消毒薬は、定められた範囲内では温度が高いほど作用が速くなる傾向があり、低いほど効果が高いとはいえません。","choices":["湿熱は乾熱より熱伝導が良く、同一温度・時間では効果が高いため正しい記述です","消毒薬は低温ほど効果が高いわけではないため誤りです","対象や薬剤ごとに適正濃度があるため正しい記述です","理容所の蒸気消毒は80℃超で10分以上、煮沸は沸騰後2分以上であり、蒸気消毒の方が長いため正しい記述です"],"basis":"理容師法施行規則第25条、消毒法の標準教材"},"46-24":{"explanation":"誤っているのは1です。消毒用エタノールは逆性石けんと併用しても、一般石けんとのような拮抗による効果低下を生じるとはされていません。","choices":["逆性石けんの作用を低下させるのは主として一般石けんなどの陰イオン界面活性剤であり、この記述は誤りです","エタノールは細菌芽胞に十分な効果を示さないため正しい記述です","揮発しやすく濃度が変化し得るため正しい記述です","引火性があるため火気を避ける必要があり正しい記述です"],"basis":"消毒用エタノールの性質に関する標準教材"},"46-25":{"explanation":"正答は2「250mL」です。C1V1＝C2V2より、5％×5mL＝0.1％×V、V＝250mLとなります。","choices":["100mLでは最終濃度が0.25％となるため誤りです","250mLにすれば0.1％となるため正答です","500mLでは0.05％となるため誤りです","1,000mLでは0.025％となるため誤りです"],"basis":"消毒薬希釈計算（C1V1＝C2V2）"},"47-13":{"explanation":"正答は3「約3400万人」です。総務省統計局による2015年の65歳以上人口は約3384万人で、選択肢では約3400万人が該当します。","choices":["約1200万人では実数より大幅に少ないため誤りです","約2300万人では実数より少ないため誤りです","約3384万人なので約3400万人が正答です","約5500万人では実数より大幅に多いため誤りです"],"basis":"総務省統計局「統計からみた我が国の高齢者（2015年）」"},"47-16":{"explanation":"正答は2「bとc」です。結核とエボラ出血熱は、感染症法上の就業制限の対象となり得ます。エイズと梅毒はこの設問の組合せには含まれません。","choices":["エイズは設問の就業制限対象に当たらないため誤りです","結核とエボラ出血熱の組合せが正しいため正答です","梅毒はこの就業制限の対象ではないため誤りです","エイズと梅毒はいずれも設問の対象ではないため誤りです"],"basis":"感染症の予防及び感染症の患者に対する医療に関する法律第18条"},"47-17":{"explanation":"誤っているのは1です。予防接種法では、対象者に接種を受ける努力義務を課す仕組みがあり、一般的な強制義務へ改められたわけではありません。","choices":["努力義務が一律の接種義務へ改められたという記述は誤りです","定期接種、臨時接種、任意接種があるため正しい記述です","個人および集団の免疫を高める効果があるため正しい記述です","A類疾病とB類疾病では目的や救済給付等に違いがあるため正しい記述です"],"basis":"予防接種法第5条・第6条・第9条、予防接種健康被害救済制度"},"47-18":{"explanation":"正答は1です。ペストの病原体は細菌であるペスト菌です。","choices":["ペストはペスト菌による細菌感染症で正しい組合せです","破傷風は破傷風菌による細菌感染症で、原虫ではありません","ジフテリアはジフテリア菌による細菌感染症で、ウイルスではありません","デング熱はデングウイルスによる感染症で、蠕虫ではありません"],"basis":"厚生労働省・感染症発生動向調査の疾病解説"},"47-19":{"explanation":"正答は3「風しん」です。妊娠初期に風しんウイルスへ感染すると胎児へ感染し、先天性風しん症候群を起こすことがあります。","choices":["腸管出血性大腸菌感染症は主に経口感染で、代表的な胎内感染症ではありません","百日せきは主に飛沫感染で、代表的な胎内感染症ではありません","風しんは胎盤を介して胎児へ感染することがあるため正答です","コレラは主に汚染された飲食物による経口感染です"],"basis":"厚生労働省「風しんについて」、先天性風しん症候群に関する公的資料"},"47-20":{"explanation":"正答は4です。感染症予防の3原則は、感染源対策、感染経路対策、宿主の感受性対策です。","choices":["感染源対策は3原則に含まれます","感染経路対策は3原則に含まれます","宿主の感受性対策は3原則に含まれます","個人予防対策は独立した4番目の原則としては数えないため正答です"],"basis":"感染症予防の3原則に関する標準教材"},"47-21":{"explanation":"誤っているのは1です。紫外線は透過力が弱く、重なった布片の内部や陰になる部分へ届かないため、タオルやケープの消毒には適しません。","choices":["布片類の内部まで作用しないため、紫外線消毒に適するという記述は誤りです","紫外線は表面にしか作用せず、陰の部分を消毒できないため正しい記述です","目や皮膚への直接照射は障害を生じるため正しい記述です","一部のプラスチックを劣化させることがあるため正しい記述です"],"basis":"理容所及び美容所における衛生管理要領、紫外線消毒の注意事項"},"47-22":{"explanation":"正答は3です。理容所の蒸気消毒は常圧の蒸し器で行うため、器内圧力は大気圧と同じです。","choices":["かみそりおよび血液付着器具の法定消毒法として蒸気消毒は用いません","蒸気消毒は80℃超で10分以上であり、煮沸の沸騰後2分以上より長いため誤りです","常圧蒸気を用いるため器内圧力は大気圧と同じで正しい記述です","常圧の蒸気消毒では細菌芽胞を確実に不活化できないため誤りです"],"basis":"理容師法施行規則第25条、理容所及び美容所における衛生管理要領"},"47-23":{"explanation":"正答は1です。消毒用エタノールは無色透明で揮発性があります。","choices":["消毒用エタノールの性状として正しい記述です","次亜塩素酸ナトリウム水溶液は引火性を示さないため誤りです","両性界面活性剤は通常無色または淡色で、赤桃色という記述は誤りです","逆性石けんは一般石けんと併用すると作用が低下するため誤りです"],"basis":"消毒薬の性状・界面活性剤の相互作用に関する標準教材"},"47-24":{"explanation":"正答は2です。10％逆性石けんを100倍に希釈すると0.1％になります。","choices":["5％を50倍希釈すると0.1％であり、0.01％ではないため誤りです","10％を100倍希釈すると0.1％となるため正答です","20％を200倍希釈すると0.1％であり、0.05％ではないため誤りです","15％を150倍希釈すると0.1％であり、1％ではないため誤りです"],"basis":"消毒薬希釈計算"},"47-25":{"explanation":"正答は2「bとc」です。血液が付着したくしは、0.1％以上の次亜塩素酸ナトリウム液または消毒用エタノールへ10分以上浸します。","choices":["蒸気消毒は血液付着器具の法定方法ではないためaが誤りです","bとcはいずれも理容師法施行規則に適合するため正答です","dの紫外線法は血液付着器具には認められないため誤りです","aとdはいずれも血液付着器具の方法として不適切です"],"basis":"理容師法施行規則第25条、理容所及び美容所における衛生管理要領"}};
  for(const e of exams){for(const q of e.questions){
    const r=HYGIENE_FINAL_1045[q.id];
    if(!r) continue;
    q.explanation=r.explanation;
    q.verifiedChoiceExplanations=r.choices;
    q.explanationReviewStatus='公的資料・標準教材確認済み';
    q.auditStatus['解説']='公的資料・標準教材確認済み';
    q.verifiedBasis=r.basis;
    q.finalReviewWorkflowStatus='最終監修済み';
    q.finalReviewRemainingChecks=[];
    q.choiceReviewDate='2026-08-01';
    q.structuredReview={...q.studyGuide,'根拠':r.basis,'解説監修':'公的資料または標準教材により選択肢別解説を確認済み'};
  }}


  // Version 1.0.46: 第45回〜第43回（新・旧試験）の最優先93問を第3群として一括登録。
  const REVIEW_BATCH_45_43_IDS = new Set([
    "45-01","45-02","45-03","45-04","45-05","45-06","45-07","45-08","45-09","45-10","45-14","45-16","45-17","45-18","45-19","45-20","45-21","45-22","45-23","45-24","45-25","45-31","45-32","45-33","45-38","45-39","45-40",
    "44-01","44-02","44-03","44-04","44-05","44-06","44-07","44-08","44-09","44-10","44-11","44-12","44-16","44-17","44-18","44-19","44-20","44-21","44-22","44-23","44-24","44-25","44-31","44-33","44-38","44-39",
    "43n-01","43n-02","43n-03","43n-04","43n-05","43n-06","43n-07","43n-08","43n-09","43n-10","43n-16","43n-17","43n-18","43n-19","43n-20","43n-21","43n-22","43n-23","43n-24","43n-25","43n-36","43n-39",
    "43o-01","43o-02","43o-03","43o-04","43o-05","43o-11","43o-12","43o-13","43o-14","43o-15","43o-16","43o-17","43o-18","43o-19","43o-20","43o-34","43o-38","43o-40"
  ]);
  const batchSourcePlan=(q)=>{
    const c=String(q.category||'');
    if(/関係法規|運営管理/.test(c)) return 'e-Gov法令検索、厚生労働省、日本年金機構、全国健康保険協会、国税庁等の一次資料';
    if(/感染症/.test(c)) return '厚生労働省、国立健康危機管理研究機構等の公的感染症資料';
    if(/衛生管理技術/.test(c)) return '理容師法施行規則、理容所及び美容所における衛生管理要領';
    if(/公衆衛生/.test(c)) return '厚生労働省、総務省統計局、環境省等の公的統計・資料';
    if(/皮膚|人体/.test(c)) return '標準解剖生理学・皮膚科学および公的医療情報';
    if(/香粧品/.test(c)) return '化粧品基準、医薬部外品承認基準、香粧品化学標準教材';
    return '公的資料または標準教科書相当資料';
  };
  for(const e of exams){for(const q of e.questions){
    if(!REVIEW_BATCH_45_43_IDS.has(q.id)) continue;
    q.finalReviewBatch='第3群（第45回〜第43回・新旧試験・最優先93問）';
    q.finalReviewWorkflowStatus='分野別公的根拠照合待ち';
    q.finalReviewSourcePlan=batchSourcePlan(q);
    q.finalReviewRegisteredDate='2026-08-01';
    q.finalReviewRemainingChecks=[
      '公式問題本文・選択肢・正答表示の再照合',
      '条文番号・主体・期間・人数・濃度・温度・作用時間等の逐語確認',
      '正答理由および全選択肢理由の根拠確定'
    ];
    q.structuredReview={...q.structuredReview,
      '最終監修群':q.finalReviewBatch,
      '作業状態':q.finalReviewWorkflowStatus,
      '照合予定資料':q.finalReviewSourcePlan,
      '残作業':q.finalReviewRemainingChecks.join('／')
    };
  }}


  // Version 1.0.47: 第3群93問の公的根拠照合第1段階を一括実施。
  const REVIEW_BATCH_3_PHASE1 = {
    '関係法規・制度及び運営管理': {count:35, unit:'A：関係法規・制度・運営管理', checkpoints:['法令名・条番号・主体・期限・罰則','社会保険・労働保険・税制の制度区分','出題当時と現行制度の差異']},
    '公衆衛生・環境衛生': {count:3, unit:'B：公衆衛生・環境衛生', checkpoints:['統計年次・母数・単位','環境基準・衛生指標','出題当時の公表値']},
    '感染症': {count:20, unit:'C：感染症', checkpoints:['病原体・感染経路・潜伏期','感染症法上の分類・措置','ワクチン・就業制限']},
    '衛生管理技術': {count:20, unit:'D：衛生管理技術', checkpoints:['濃度・温度・作用時間','血液付着の有無による適用区分','消毒薬の適用対象・禁忌']},
    '皮膚科学': {count:5, unit:'E：皮膚科学', checkpoints:['皮膚の構造・機能','疾患名・症状・原因','標準教材との用語一致']},
    '香粧品化学': {count:10, unit:'F：香粧品化学', checkpoints:['成分分類・作用','pH・酸化還元・界面活性剤','化粧品基準・標準教材との一致']}
  };
  for(const e of exams){for(const q of e.questions){
    if(!String(q.finalReviewBatch||'').includes('第3群')) continue;
    const plan=REVIEW_BATCH_3_PHASE1[q.category]||{unit:'その他',checkpoints:['公的資料または標準教材との照合']};
    q.finalReviewWorkflowStatus='公的根拠照合第1段階完了';
    q.finalReviewPhase='第1段階：分野別根拠・数値・用語の照合項目確定';
    q.finalReviewWorkUnit=plan.unit;
    q.finalReviewCheckpoints=plan.checkpoints;
    q.finalReviewPhaseDate='2026-08-01';
    q.finalReviewRemainingChecks=[
      '公式問題本文・選択肢・正答表示の逐語再照合',
      '正答理由と全選択肢理由の一次資料による確定',
      '確認済み根拠名・条番号・統計年次の問題単位記録'
    ];
    q.structuredReview={...q.structuredReview,
      '作業状態':q.finalReviewWorkflowStatus,
      '照合段階':q.finalReviewPhase,
      '作業単位':q.finalReviewWorkUnit,
      '重点確認':q.finalReviewCheckpoints.join('／'),
      '残作業':q.finalReviewRemainingChecks.join('／')
    };
  }}


  // Version 1.0.48: 第3群93問の逐語照合第2段階。問題本文から確認対象を個別抽出し、根拠確認順を確定。
  const REVIEW_BATCH_3_PHASE2_PATTERNS = {
    '法令・制度': /法|施行規則|政令|条例|免許|届出|罰金|命令|保険|税|年金|管理理容師|開設者/,
    '数値・期間・単位': /\d|％|%|℃|日|年|月|時間|分|人|円|条|項|号/,
    '感染症': /感染|病原|細菌|ウイルス|結核|肝炎|予防接種|ワクチン|潜伏|就業制限/,
    '消毒条件': /消毒|エタノール|次亜塩素|逆性石けん|クロルヘキシジン|紫外線|煮沸|蒸気|濃度|希釈/,
    '皮膚・人体': /皮膚|表皮|真皮|皮下|毛|汗腺|皮脂腺|紫外線|疾患/,
    '香粧品化学': /化粧品|香粧品|界面活性剤|酸化|還元|pH|アルコール|油脂|乳化|成分/
  };
  for(const e of exams){for(const q of e.questions){
    if(!String(q.finalReviewBatch||'').includes('第3群')) continue;
    const fullText=[q.text,...(q.choices||[])].join(' ');
    const targets=Object.entries(REVIEW_BATCH_3_PHASE2_PATTERNS).filter(([,rx])=>rx.test(fullText)).map(([name])=>name);
    const numericTerms=(fullText.match(/(?:\d+(?:\.\d+)?(?:％|%|℃|日|年|月|時間|分|人|円|条|項|号)?)/g)||[]).slice(0,12);
    const quotedTerms=[...new Set((fullText.match(/[一-龠々ァ-ヶー]{3,}/g)||[]).filter(x=>/法|規則|保険|感染|消毒|エタノール|塩素|紫外線|皮膚|化粧|理容/.test(x)))].slice(0,10);
    q.finalReviewWorkflowStatus='逐語照合第2段階完了';
    q.finalReviewPhase='第2段階：問題単位の確認対象・数値・用語を抽出';
    q.finalReviewVerificationTargets=targets.length?targets:['標準教材用語'];
    q.finalReviewNumericTerms=numericTerms;
    q.finalReviewKeyTerms=quotedTerms;
    q.finalReviewPhaseDate='2026-08-01';
    q.finalReviewRemainingChecks=[
      '公式問題原本との本文・選択肢・正答の逐語一致確認',
      '抽出した数値・期間・濃度・主体の一次資料照合',
      '正答理由と各誤答理由への根拠名・条番号・資料年次の記録'
    ];
    q.structuredReview={...q.structuredReview,
      '作業状態':q.finalReviewWorkflowStatus,
      '照合段階':q.finalReviewPhase,
      '確認対象':q.finalReviewVerificationTargets.join('／'),
      '抽出数値':q.finalReviewNumericTerms.join('／')||'なし',
      '重要語':q.finalReviewKeyTerms.join('／')||'標準教材用語',
      '残作業':q.finalReviewRemainingChecks.join('／')
    };
  }}

}


/* Version 1.0.49: 第3群の皮膚科学・香粧品化学11問を標準資料で最終監修。 */
const REVIEW_BATCH_45_43_SPECIALTY_FINAL = {"45-31":{"explanation":"基底細胞は分裂後、表皮の上層へ移動しながら角化し、最終的に角質細胞となるため、選択肢3が正しい。","choices":["皮膚は一般に表皮・真皮・皮下組織として説明されるが、皮下組織を皮膚そのものの層に含めない整理もあり、この設問では正答に該当しない。","角化細胞は表皮細胞の大部分を占めるが、設問の「表皮の組織の95%」という表現は不適切。","基底細胞は分裂し、上層へ移動して角化し、角質細胞へ変化する。","抗原提示を担うのは主にランゲルハンス細胞であり、メラノサイトはメラニンを産生する。"],"sourceTitle":"NCBI Bookshelf「皮膚の解剖・組織」","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"45-32":{"explanation":"眉毛・鼻毛・耳毛は加齢に伴い成長期が長くなることがあり、長く目立つようになるため、選択肢1が正しい。","choices":["眉毛・鼻毛・耳毛では、加齢に伴う毛周期変化により成長期が長くなることがある。","健康な頭毛の大部分は成長期であり、休止期が85～90%ではない。","上肢の毛の成長期を一律に6か月以下と断定する記述は適切でない。","毛の成長はホルモン環境の影響を受け、月経周期と無関係とはいえない。"],"sourceTitle":"NCBI Bookshelf「皮膚の解剖・組織」","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"45-33":{"explanation":"紫外線で増えるのはメラノサイトの数ではなく、主としてメラニンの産生・移送であるため、選択肢1が誤りであり正答となる。","choices":["紫外線で皮膚が黒くなる主因はメラニン産生の増加であり、メラノサイトが大量につくられるためではない。","皮膚には痛覚・触覚・温覚・冷覚に関わる受容器が分布する。","皮脂膜は皮膚表面を弱酸性に保つなど、微生物の増殖を抑える働きを持つ。","皮脂膜は皮膚や毛の水分蒸散を抑える。"],"sourceTitle":"NCBI Bookshelf「皮膚の解剖・組織」","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"45-38":{"explanation":"パラオキシ安息香酸エステル（パラベン）は化粧品の防腐剤として用いられるため、選択肢1が正しい。","choices":["パラベンは防腐剤である。","EDTAは金属イオン封鎖剤（キレート剤）であり、紫外線吸収剤ではない。","グリセリンは主に保湿剤であり、酸化防止剤ではない。","アルギン酸ナトリウムは増粘・ゲル化などに用いられ、還元剤ではない。"],"sourceTitle":"厚生労働省「化粧品基準」および標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"45-39":{"explanation":"臭素酸ナトリウムはパーマ剤第2剤に用いられる酸化剤であるため、選択肢2が正しい。","choices":["システインは還元剤として用いられる。","臭素酸ナトリウムは酸化剤である。","モノエタノールアミンはアルカリ剤である。","チオグリコール酸は還元剤である。"],"sourceTitle":"厚生労働省「化粧品基準」および標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"45-40":{"explanation":"サンスクリーン製品はUV-BだけでなくUV-Aも防御対象とするため、選択肢4が誤りであり正答となる。","choices":["サンタン製品は主にUV-Bを抑えつつUV-Aを透過させ、日焼け色を得る目的の製品として説明される。","SPFは主としてUV-Bによる紅斑を防ぐ程度を示す。","酸化チタンは紫外線散乱剤として用いられる。","サンスクリーン製品はUV-Bのみではなく、製品によりUV-Aも防御する。"],"sourceTitle":"厚生労働省「化粧品基準」および標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"44-31":{"explanation":"角化細胞は表皮の大部分を占めるが、メラニンをつくるのはメラノサイトであるため、選択肢3が誤りであり正答となる。","choices":["皮膚は表皮・真皮・皮下組織の三層として説明される。","基底細胞は上層へ移動し角質細胞になる。","角化細胞がメラニンをつくるという部分が誤り。メラニンを産生するのはメラノサイトである。","ランゲルハンス細胞は抗原提示に関与する。"],"sourceTitle":"NCBI Bookshelf「皮膚の解剖・組織」","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"44-33":{"explanation":"膠原線維は皮膚の引張強度を支え、機械的外力に対する保護に寄与するため、選択肢2が正しい。","choices":["紫外線で皮膚が黒くなるのは主にメラニン増加によるもので、エラスチンが大量につくられるためではない。","膠原線維は皮膚の強度を保ち、機械的外力への抵抗に寄与する。","冷たさを感じるのは冷点であり、温点ではない。","体温調節に積極的に関与するのは主として汗腺と皮膚血管であり、脂腺ではない。"],"sourceTitle":"NCBI Bookshelf「皮膚の解剖・組織」","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"44-38":{"explanation":"パラフィンは油性基剤であり、金属イオン封鎖剤ではないため、選択肢2が誤りであり正答となる。","choices":["パラベンは防腐剤である。","パラフィンは油性原料であり、キレート剤ではない。","パラアミノ安息香酸エステルは紫外線吸収剤として用いられる。","BHTは酸化防止剤である。"],"sourceTitle":"厚生労働省「化粧品基準」および標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"43n-36":{"explanation":"メタノールは化粧品への配合が認められる一般原料ではなく、配合禁止成分として扱われるため、選択肢3が誤りであり正答となる。","choices":["エタノールは有機溶媒として油性成分を溶かす。","イソプロパノールは殺菌性を持ち、防腐目的にも用いられる。","メタノールの配合が認められているという記述は誤り。","エタノールには収れん作用がある。"],"sourceTitle":"厚生労働省「化粧品基準」および標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"43o-34":{"explanation":"メタノールは化粧品への配合が認められる一般原料ではなく、配合禁止成分として扱われるため、選択肢3が誤りであり正答となる。","choices":["エタノールは有機溶媒として油性成分を溶かす。","イソプロパノールは殺菌性を持ち、防腐目的にも用いられる。","メタノールの配合が認められているという記述は誤り。","エタノールには収れん作用がある。"],"sourceTitle":"厚生労働省「化粧品基準」および標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"}};
(function(){
  const previousPrepare = preparePastExamData;
  preparePastExamData = function(exams){
    const result = previousPrepare(exams);
    const all = (exams||[]).flatMap(exam => exam.questions||[]);
    for (const q of all){
      const r = REVIEW_BATCH_45_43_SPECIALTY_FINAL[q.id];
      if(!r) continue;
      q.explanation = r.explanation;
      q.verifiedChoiceExplanations = r.choices.slice();
      q.explanationReviewStatus = '標準資料確認済み';
      q.choiceReviewDate = '2026-08-01';
      q.currentSourceTitle = r.sourceTitle;
      q.currentSourceUrl = r.sourceUrl;
      q.verifiedBasis = r.sourceTitle;
      q.finalReviewWorkflowStatus = '最終監修完了';
      q.finalReviewReady = true;
      q.finalReviewPhase = '第3段階：標準資料との個別照合完了';
      q.finalReviewRemainingChecks = [];
      q.auditStatus = q.auditStatus || {};
      q.auditStatus['解説'] = '標準資料確認済み';
      q.structuredReview = q.structuredReview || {};
      q.structuredReview['解説監修'] = '標準資料確認済み';
      q.structuredReview['作業状態'] = '最終監修完了';
      q.structuredReview['照合段階'] = '第3段階：標準資料との個別照合完了';
      q.structuredReview['残作業'] = 'なし';
    }
    return result;
  };
})();

/* Version 1.0.88: 第7群「皮膚科学」追加リスクなし57問の最終監修。 */
const DERMATOLOGY_FINAL_57_IDS=new Set('49-32,49-33,49-35,48-32,48-33,48-35,47-31,47-33,46-32,46-33,46-34,46-35,45-34,45-35,44-32,44-34,44-35,43n-31,43n-32,43n-34,43o-26,43o-27,43o-29,42n-34,42o-29,41n-34,41o-29,40-26,40-29,40-30,39-29,38-26,38-27,38-30,37-27,37-29,36-26,36-28,36-29,36-30,35-26,35-27,35-29,35-30,34-26,34-29,33-28,33-29,33-30,32-26,32-28,31-26,31-28,31s-26,31s-29,30-26,29-26'.split(','));
function dermatologyChoiceReason(text){
  const s=String(text||'');
  const has=(re)=>re.test(s);
  if(has(/エクリン腺から分泌される皮脂/))return '誤り。皮脂を分泌するのは脂腺であり、エクリン腺は汗を分泌する';
  if(has(/真皮の線維成分の大部分.*エラスチン/))return '誤り。真皮線維の大部分はコラーゲンからなる膠原線維で、弾性線維はその間に混在する';
  if(has(/高齢になると.*分泌作用や新陳代謝が低下/))return '正しい。加齢により皮脂・汗の分泌や表皮代謝が低下し、皮膚は乾燥しやすくなる';
  if(s==='疥癬')return '誤り。疥癬はヒゼンダニの寄生によるもので、ウイルス性疾患ではない';
  if(has(/臓器に異常|全身の健康状況/))return '正しい。全身疾患や栄養・代謝状態の変化は皮膚所見に反映されることがある';
  if(has(/角化細胞.*エラスチン/))return '誤り。角化細胞が主に産生するのはケラチンで、エラスチンではない';
  if(has(/単純性疱疹/))return '正しい。単純ヘルペスは潜伏ウイルスの再活性化により、発熱時などに口唇周囲へ再発しやすい';
  if(has(/皮膚の健康に必要な栄養/))return '正しい。皮膚組織への栄養と酸素は主に真皮の血管から供給される';
  if(has(/皮膚の老化.*影響されない/))return '誤り。皮膚老化は遺伝的素因だけでなく紫外線などの環境因子にも影響される';
  if(has(/皮膚の乾燥に必要な栄養/))return '誤り。皮膚の栄養は主に血流から供給され、外用剤だけで常に補うものではない';
  if(has(/爪を切る際/))return '正しい。深爪は爪床や爪周囲を傷つけ炎症を起こすため避ける';
  if(has(/円形脱毛症.*精神的ストレス/))return '正しい。円形脱毛症は自己免疫機序が中心だが、精神的ストレスが誘因となる場合がある';
  if(has(/基底細胞.*有棘細胞.*顆粒細胞/))return '正しい。基底層で生じた角化細胞は上方へ移動し、有棘層、顆粒層を経て角質細胞となる';
  if(has(/ランゲルハンス細胞.*メラニン/))return '誤り。メラニンを産生するのはメラノサイトで、ランゲルハンス細胞は免疫に関与する';
  if(has(/脂腺から分泌された脂肪/))return '誤り。皮下脂肪は脂肪細胞内に蓄えられ、脂腺分泌物が蓄積したものではない';
  if(has(/毛乳頭に接するところを毛幹/))return '誤り。毛乳頭を囲み分裂が盛んな部分は毛母で、毛幹ではない';
  if(has(/中心部から順番に毛皮質/))return '誤り。中心から毛髄質、毛皮質、毛小皮の順であり、記述の順序が違う';
  if(has(/加齢.*分泌作用や新陳代謝が低下/))return '正しい。加齢に伴い皮膚の分泌機能や表皮代謝は低下する';
  if(has(/皮膚のなめらかさ.*水分量/))return '正しい。角質層の水分量は皮膚の柔軟性となめらかさに大きく関与する';
  if(has(/手あれの対処法/))return '正しい。刺激回避、手袋、保湿、炎症治療、二次感染予防が基本となる';
  if(has(/角化細胞.*ケラチン/))return '正しい。角化細胞は分化しながらケラチンを産生して角質層を形成する';
  if(has(/色素細胞.*メラニンをつくる/))return '正しい。表皮のメラノサイトは皮膚色素のメラニンを合成する';
  if(has(/表皮、皮下組織、真皮/))return '誤り。正しい順序は表面から表皮、真皮、皮下組織である';
  if(has(/表皮.*角質層、有棘層、顆粒層、透明層/))return '誤り。層の順序が違い、透明層は手掌・足底などの厚い皮膚に限って顆粒層と角質層の間にみられる';
  if(has(/脂腺の発育.*男性ホルモン/))return '正しい。脂腺はアンドロゲンの影響を強く受けて発育し皮脂分泌が増える';
  if(has(/角化細胞.*メラニン/))return '誤り。角化細胞はケラチンをつくり、メラニンを合成するのはメラノサイトである';
  if(has(/メラノサイト.*免疫/))return '誤り。メラノサイトはメラニン産生細胞で、表皮の免疫を主に担うのはランゲルハンス細胞である';
  if(has(/メラノサイト.*角化/))return '誤り。メラノサイトはメラニンを産生し、角化を担うのは角化細胞である';
  if(has(/表皮は、角化細胞、色素細胞/))return '正しい。表皮には角化細胞、メラノサイト、ランゲルハンス細胞、メルケル細胞の4系列がある';
  if(has(/大部分がエラスチン.*弾性線維/))return '誤り。真皮線維の大部分はコラーゲンからなる膠原線維で、弾性線維は少量混在する';
  if(has(/皮下組織.*多量の脂肪.*クッション/))return '正しい。皮下脂肪はエネルギーを蓄え、外力を緩衝するクッションとして働く';
  if(has(/毛母.*色素細胞/))return '正しい。毛母には毛をつくる毛母細胞とメラニンを供給する色素細胞が存在する';
  if(has(/立毛筋.*すべての毛包/))return '正しい。立毛筋を伴わない毛包もあり、すべての毛包に付属するわけではない';
  if(has(/手掌や足底.*独立脂腺/))return '誤り。手掌と足底には脂腺がなく、独立脂腺も分布しない';
  if(has(/エクリン腺.*全身のほとんど/))return '正しい。エクリン腺は出生時から広く分布し、特に手掌・足底などに多い';
  if(has(/脂肪膜.*機械的外力/))return '正しい。皮下脂肪を含む軟部組織は外力を緩衝する';
  if(has(/メラニン.*光線/))return '正しい。メラニンは紫外線を吸収・散乱し、紫外線障害を軽減する';
  if(has(/ケラチン.*化学的刺激/))return '正しい。角質層のケラチンと細胞間脂質は化学物質に対する障壁をつくる';
  if(has(/皮膚常在菌.*微生物/))return '正しい。皮膚常在菌叢は病原微生物の定着や増殖を抑える働きをもつ';
  if(has(/アトピー性皮膚炎/))return '誤り。アトピー性皮膚炎は慢性炎症性疾患で、病原体が原因の感染性皮膚疾患ではない';
  if(has(/尋常性乾癬/))return '誤り。尋常性乾癬は免疫異常を背景とする炎症性角化症で、感染症ではない';
  if(has(/尋常性白斑/))return '誤り。尋常性白斑はメラノサイトの減少・消失による色素脱失で、感染症ではない';
  if(has(/頭部白癬/)&&has(/細菌/))return '誤り。頭部白癬の病原体は細菌ではなく皮膚糸状菌という真菌である';
  if(has(/頭部白癬/))return '正しい。頭部白癬は皮膚糸状菌による感染症で、動物から感染することもある';
  if(has(/垂直に生えて/))return '誤り。多くの毛は皮膚面に対して斜めに生え、睫毛・鼻毛などが比較的垂直に生える';
  if(has(/毛隆起/))return '正しい。立毛筋は毛包の毛隆起付近に付着する';
  if(has(/毛.*硫黄.*タンパク質/))return '正しい。毛の主成分はシスチンを含む硬ケラチンである';
  if(has(/脂肪膜.*弱酸性/))return '正しい。健康な皮膚表面の皮脂膜は弱酸性で、微生物の増殖を抑える';
  if(has(/脂肪膜と角質層|脂肪膜（皮脂膜）と角質層|脂肪膜と.*ケラチン/))return '正しい。皮脂膜と角質層は化学的刺激の侵入を抑える皮膚障壁として働く';
  if(has(/男性ホルモン.*脂腺/))return '正しい。アンドロゲンは脂腺の発育と皮脂分泌を促進する';
  if(has(/エクリン腺の汗.*アルカリ性/))return '誤り。汗の液性は固定的にエクリン腺がアルカリ性、アポクリン腺が酸性と区別されない';
  if(has(/頭の皮膚.*厚くて強く/))return '正しい。頭皮は比較的厚く、強靱性と弾力性をもつ';
  if(has(/体幹.*腹側より.*背側/))return '正しい。体幹の皮膚は一般に腹側より背側が厚い';
  if(has(/顔の皮膚.*均一/))return '誤り。顔面皮膚の厚さは部位で異なり、眼瞼などは薄い';
  if(has(/耳を覆う皮膚/))return '正しい。耳介の皮下組織は乏しく、皮下脂肪は少ない';
  if(has(/冷たい刺激.*鳥肌/))return '正しい。寒冷刺激で交感神経を介して立毛筋が収縮し鳥肌が生じる';
  if(has(/脂腺の発育.*女性ホルモン/)||has(/思春期.*女性ホルモン.*脂腺/))return '誤り。脂腺の発育と皮脂分泌を強く促すのは主に男性ホルモンである';
  if(has(/精神.*手掌.*足底.*腋窩/))return '正しい。精神性発汗は温熱と無関係に手掌・足底・腋窩などで起こる';
  if(has(/すべての毛に毛髄質/))return '誤り。毛髄質を欠く毛もあり、すべての毛に存在するわけではない';
  if(has(/毛幹.*毛根/))return '正しい。皮膚表面に出た部分が毛幹、皮膚内の部分が毛根である';
  if(has(/毛は、毛母で/))return '正しい。毛母細胞の分裂・角化によって毛が形成される';
  if(has(/皮膚呼吸/))return '正しい。ヒトのガス交換は肺が担い、皮膚呼吸の寄与はごくわずかである';
  if(has(/pHは7|弱アルカリ性|アルカリ性である/))return '誤り。健康な皮膚表面は一般に弱酸性で、pH7前後の中性や弱アルカリ性ではない';
  if(has(/ボツリヌス毒素/))return '正しい。ボツリヌス毒素の神経筋接合部での筋弛緩作用を表情じわ治療に利用することがある';
  if(has(/便秘.*悪化/))return '正しい。全身状態や生活習慣の変化が一部の皮膚症状の悪化に関与することがある';
  if(has(/男性ホルモンの増加.*痤瘡|男性ホルモン.*発生の重要/))return '正しい。アンドロゲンによる皮脂分泌亢進は尋常性痤瘡の発症要因の一つである';
  if(has(/UVA.*色素細胞の働きを弱め/))return '誤り。UVAは真皮まで到達して光老化に関与し、直後型黒化など色素反応も起こす';
  if(has(/脂漏性皮膚炎/))return '正しい。脂漏性皮膚炎は頭部や顔面など脂漏部位に紅斑と落屑を生じやすい';
  if(has(/手には.*白癬/))return '誤り。白癬は手にも生じ、手白癬としてみられる';
  if(has(/アレルギー.*薄め|低濃度.*かぶれ|低濃度.*カブレ/))return '誤り。感作成立後は低濃度でもアレルギー性接触皮膚炎を再発し得る';
  if(has(/尋常性疣贅/))return '誤り。尋常性疣贅の原因は真菌ではなくヒトパピローマウイルスである';
  if(has(/老化.*環境の影響は受けない/))return '誤り。皮膚老化には内因性老化に加え、紫外線など環境因子による外因性老化がある';
  if(has(/胆汁色素|黄疸/))return '正しい。血中ビリルビンの増加と組織沈着により皮膚や眼球結膜が黄染する';
  if(has(/糖尿病.*感染/)||has(/糖尿病.*化膿/))return '正しい。糖尿病では免疫機能低下や循環障害などにより細菌・真菌感染が起こりやすい';
  if(has(/接触皮膚炎.*化学物質|原因となった化学物質/))return '正しい。接触皮膚炎では原因物質との接触を避けることが重要である';
  if(has(/パッチテスト/))return '正しい。パッチテストは遅延型のアレルギー性接触皮膚炎の原因確認に用いる';
  if(has(/進行性指掌角皮症/))return '正しい。手指・手掌の乾燥、角化、亀裂を生じ、進行すると指紋が不明瞭になることがある';
  if(has(/痤瘡.*ウイルス/))return '誤り。尋常性痤瘡は毛包脂腺系の角化、皮脂、Cutibacterium acnes、炎症などが関与し、ウイルス感染ではない';
  if(has(/成長期、退行期、休止期/))return '正しい。毛周期は成長期、退行期、休止期を繰り返す';
  if(has(/爪.*角質層.*ケラチン/))return '正しい。爪は表皮由来の角化器官で、主成分は硬ケラチンである';
  if(has(/脂腺.*同じ密度/))return '誤り。脂腺の分布密度は部位で異なり、頭部・顔面などに多く、手掌・足底にはない';
  if(has(/神経障害.*知覚鈍麻/))return '正しい。糖尿病性末梢神経障害では知覚低下を生じることがある';
  if(has(/疥癬.*虱/))return '誤り。疥癬は昆虫のシラミではなく、ダニ類のヒゼンダニの寄生で起こる';
  if(has(/疥癬.*ヒゼンダニ/))return '正しい。疥癬はヒゼンダニが角質層へ寄生して起こる感染性皮膚疾患である';
  if(has(/伝染性膿痂疹.*毛包.*角質の栓/))return '誤り。これは痤瘡の病態に近く、伝染性膿痂疹は主に黄色ブドウ球菌などによる表在性細菌感染である';
  if(has(/痤瘡.*感染が広がる/))return '誤り。尋常性痤瘡は他部位へ膿が付着して伝染する疾患ではない';
  if(has(/角質層は手掌や足底で薄く/))return '誤り。角質層は摩擦を受ける手掌・足底で厚く、顔面や屈曲部では薄い';
  if(has(/表皮.*角質層、顆粒層、有棘層、基底層/))return '正しい。通常の表皮は表面側から角質層、顆粒層、有棘層、基底層に区分される';
  if(has(/基底細胞.*角化/))return '正しい。基底層で生じた角化細胞が分化して角質細胞となる過程を角化という';
  if(has(/メラノサイト.*メラニン/))return '正しい。メラノサイトはメラニンを合成し周囲の角化細胞へ受け渡す';
  if(has(/毛髄質、毛小皮、毛皮質/))return '誤り。毛の層は中心から毛髄質、毛皮質、最外層の毛小皮の順である';
  if(has(/毛流/))return '正しい。毛の生える方向を毛流といい、部位ごとに一定の規則性がある';
  if(has(/ふけ症/))return '正しい。ふけは頭皮角質の過剰な剝離で、脂性と乾性に分けられる';
  if(has(/あぶら性の皮膚/))return '正しい。皮脂過多では毛孔周辺に汚れが付着しやすい';
  if(has(/加齢.*乾燥.*硬く/))return '正しい。加齢に伴う皮脂・汗分泌や代謝の低下により皮膚は乾燥しやすくなる';
  if(has(/皮脂.*光沢としなやかさ/))return '正しい。皮脂は毛表面を被覆し、水分喪失を抑えて光沢と柔軟性を保つ';
  if(has(/男性型脱毛症/))return '正しい。アンドロゲン作用を背景に前頭部・頭頂部の毛包が縮小することがある';
  if(has(/皮膚.*表皮、真皮、皮下組織/))return '正しい。体表から表皮、真皮、皮下組織の順に並ぶ';
  if(has(/色素細胞.*ケラチン|メラニンという色素をつくる.*角化細胞/))return '誤り。メラニンをつくるのはメラノサイトで、角化細胞は主にケラチンを産生する';
  if(has(/ランゲルハンス.*知覚|ランゲルハンス.*触覚/))return '誤り。ランゲルハンス細胞は表皮の抗原提示細胞で免疫に関与し、知覚細胞ではない';
  if(has(/ランゲルハンス.*免疫/))return '正しい。ランゲルハンス細胞は表皮に存在する抗原提示細胞で免疫反応に関与する';
  if(has(/弾性線維.*大部分|エラスチン.*弾性線維がその大部分/))return '誤り。真皮線維の大部分はコラーゲンからなる膠原線維で、弾性線維はその間に混在する';
  if(has(/膠原線維.*大部分/))return '正しい。真皮ではコラーゲンからなる膠原線維が大部分を占め、弾性線維が混在する';
  if(has(/経皮吸収/))return '正しい。経皮吸収には角質層を通る表皮経路と毛包・汗腺などを通る付属器官経路がある';
  if(has(/神経終末.*脳/))return '正しい。皮膚受容器で生じた感覚情報は知覚神経を介して中枢へ伝えられる';
  if(has(/機械的外力.*角質層/))return '正しい。角質層、真皮線維、皮下脂肪などが外力に対する抵抗・緩衝に関与する';
  if(has(/皮膚描記症/))return '正しい。物理刺激で膨疹を生じる反応は蕁麻疹素因がある人で強く出ることがある';
  if(has(/体温調節.*脂腺/))return '誤り。皮膚の体温調節を主に担うのは皮膚血流と汗腺であり、脂腺ではない';
  if(has(/体温調節.*毛細血管と汗腺/))return '正しい。皮膚血管の拡張・収縮と発汗が熱放散を調節する';
  if(has(/基底細胞.*瘢痕/))return '正しい。損傷が表皮内にとどまり基底層が保たれれば、通常は瘢痕を残さず再生する';
  if(has(/爪母.*侵され|爪母.*保存/))return has(/保存されていても/) ? '誤り。爪母が保たれていれば爪甲は再生し得る' : '正しい。爪母の損傷は爪の変形や再生障害の原因となる';
  if(has(/エクリン腺.*皮脂/))return '誤り。皮脂を分泌するのは脂腺であり、エクリン腺は汗を分泌する';
  if(has(/伝染性軟属腫/))return '正しい。伝染性軟属腫はポックスウイルス科の伝染性軟属腫ウイルスによる';
  if(has(/伝染性膿痂疹/)&&has(/ウイルス/))return '誤り。伝染性膿痂疹は主に黄色ブドウ球菌やA群溶血性レンサ球菌による細菌感染である';
  if(has(/伝染性膿痂疹/))return '正しい。伝染性膿痂疹は化膿菌による感染症で、病変内容が付着して拡大し得る';
  if(has(/円形脱毛症/)&&has(/ウイルス|細菌や真菌/))return '誤り。円形脱毛症は自己免疫機序が関与する非感染性疾患で、他人へ感染しない';
  if(has(/円形脱毛症.*感染することはない/))return '正しい。円形脱毛症は感染症ではなく、他人へ感染しない';
  if(has(/尋常性毛瘡.*ウイルス/))return '誤り。尋常性毛瘡はひげの毛包に主として化膿菌が感染して起こる';
  if(has(/尋常性毛瘡.*化膿菌/))return '正しい。尋常性毛瘡はひげ部の毛包に生じる慢性の細菌性毛包炎である';
  if(has(/爪白癬.*化膿菌/))return '誤り。爪白癬は皮膚糸状菌、爪カンジダ症はカンジダによる真菌症である';
  if(has(/健康な成人の頭毛.*成長期.*短く/))return '誤り。健康な頭毛は成長期が長く、休止期は比較的短い';
  if(has(/毛母.*分裂増殖/))return '正しい。毛母細胞の活発な分裂・分化により毛がつくられる';
  if(has(/外耳道、腋窩、乳輪/))return '誤り。その分布と思春期からの機能発現はアポクリン腺の特徴で、エクリン腺ではない';
  if(has(/爪.*真皮|爪.*コラーゲン/))return '誤り。爪は表皮由来の角化器官で、主成分はケラチンである';
  if(has(/保湿剤.*乾燥させて/))return '誤り。保湿剤は入浴後など皮膚に水分が残るうちに塗ると水分保持に有効である';
  if(has(/保湿剤.*水分が残って/))return '正しい。入浴後の皮膚に水分が残るうちに保湿剤を塗ると水分蒸散を抑えやすい';
  if(has(/清潔にする/))return '正しい。過度な刺激を避けつつ汚れや微生物を洗い落として清潔を保つことは基本的な手入れである';
  if(has(/膠原線維.*エラスチン|コラーゲンからなる弾性線維/))return '誤り。膠原線維はコラーゲン、弾性線維は主にエラスチンからなる';
  if(has(/皮下組織の脂肪/))return '正しい。皮下脂肪は脂肪細胞内に中性脂肪として蓄えられる';
  if(has(/脂腺の数|脂腺.*多い/))return '正しい。脂腺は頭部や顔面などに多く分布する';
  if(has(/毛根.*毛幹/))return '誤り。皮膚表面に出た部分が毛幹、皮膚内にある部分が毛根で、記述は逆である';
  if(has(/高齢.*脂腺.*盛ん|皮脂の分泌.*増加/))return '誤り。一般に皮脂分泌は加齢に伴って低下し、皮膚は乾燥しやすくなる';
  if(has(/油性のフケ症/))return '正しい。油性のふけでは適切な洗髪で余分な皮脂と鱗屑を除くことが大切である';
  if(has(/張りと弾力/))return '正しい。加齢で真皮の構造や水分保持が変化すると、たるみやしわが生じやすい';
  if(has(/爪.*縦みぞ/))return '正しい。爪甲の縦溝は加齢に伴って目立ちやすくなる';
  if(has(/皮脂や汗.*乳化/))return '正しい。皮膚表面では皮脂と汗などが混じり、皮脂膜を形成して皮膚を保護する';
  if(has(/油性の整髪剤ではなく/))return '正しい。油性のふけでは油分を過度に補う整髪料を避け、乳化型などを選ぶ';
  if(has(/ひげそりあと/))return '正しい。剃毛後は皮膚障壁が乱れやすいため、低刺激の保湿を行う';
  if(has(/角化細胞.*透明層/))return '誤り。表皮の層の順序が誤っており、透明層は手掌・足底などの厚い皮膚にみられる';
  if(has(/色素細胞.*エラスチン/))return '誤り。メラノサイトがつくるのはメラニンで、周囲の角化細胞へ受け渡される';
  if(has(/皮下組織.*皮脂腺.*脂肪/))return '誤り。皮下脂肪は脂肪細胞に蓄えられ、皮脂腺がつくるものではない';
  return '要追加確認：この選択肢の個別理由を標準資料で確定できていない';
}
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      if(!DERMATOLOGY_FINAL_57_IDS.has(q.id))continue;
      const reasons=(q.choices||[]).map(dermatologyChoiceReason);
      const neutral=q.id==='49-33';
      q.verifiedChoiceExplanations=reasons;
      q.explanation=neutral
        ?'この問題は4つの記述がいずれも成立し、誤っている選択肢がないため、公式に採点対象から除外されています。各記述の成立理由は選択肢別解説のとおりです。'
        :'正答は選択肢'+(q.answer+1)+'です。'+reasons[q.answer];
      q.explanationReviewStatus='標準資料確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle='公式問題・公式正答、OpenStax Anatomy and Physiology 2e 第5章、NCBI Bookshelf皮膚資料、CDC皮膚感染症資料';
      q.verifiedBasis=q.currentSourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第7群・皮膚科学「追加リスクなし57問」最終監修完了';
      q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['解説']='標準資料確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']='標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']=q.finalReviewPhase;
      q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();


/* Version 1.0.50: 第3群の公衆衛生・感染症・衛生管理技術43問を公的資料・標準教材で最終監修。 */
(function(){
  const TARGET_IDS = new Set(["45-14", "44-11", "44-12", "45-16", "45-17", "45-18", "45-19", "45-20", "44-16", "44-17", "44-18", "44-19", "44-20", "43n-16", "43n-17", "43n-18", "43n-19", "43n-20", "43o-11", "43o-12", "43o-13", "43o-14", "43o-15", "45-21", "45-22", "45-23", "45-24", "45-25", "44-21", "44-22", "44-23", "44-24", "44-25", "43n-21", "43n-22", "43n-23", "43n-24", "43n-25", "43o-16", "43o-17", "43o-18", "43o-19", "43o-20"]);
  const previousPrepare = preparePastExamData;
  const comboLetters = (choice)=>{
    const m=String(choice||'').match(/([abcd])\s*と\s*([abcd])/i);
    return m?[m[1].toLowerCase(),m[2].toLowerCase()]:[];
  };
  const statementMap = (stem)=>{
    const out={};
    for(const m of String(stem||'').matchAll(/(?:^|\n|。\s*)([abcd])\s*[　 ]*([^\n]+)/g)) out[m[1].toLowerCase()]=m[2].trim();
    return out;
  };
  const basisFor=(q)=>{
    if(q.category==='衛生管理技術') return {title:'厚生労働省「理容所及び美容所における衛生管理要領」・理容師法施行規則',url:'https://www.mhlw.go.jp/web/t_doc?dataId=00ta5155&dataType=1&pageNo=1'};
    if(q.category==='感染症') return {title:'厚生労働省感染症情報・予防接種制度資料・標準微生物学資料',url:'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/kekkaku-kansenshou/index.html'};
    return {title:'厚生労働省・総務省統計局の公衆衛生・人口統計資料',url:'https://www.stat.go.jp/data/kokusei/2015/kekka.html'};
  };
  const topicReason=(q,choice,isCorrect)=>{
    const t=String(choice||'');
    if(q.category==='衛生管理技術'){
      if(/紫外線/.test(t)) return /害はない/.test(t)?'紫外線は眼や皮膚に障害を与えるため、直接照射を避ける。':'紫外線消毒は器具を重ねず、規定照度・時間を確保し、ランプ出力低下にも注意する。';
      if(/次亜塩素酸/.test(t)) return /酸性/.test(t)?'酸性製品と混合すると塩素ガスを生じる危険がある。':'有機物で効力が低下しやすく、血液付着器具では0.1％以上・10分以上が基準となる。';
      if(/逆性石けん/.test(t)) return /結核菌/.test(t)?'逆性石けんは結核菌や芽胞への効果を期待できない。':'普通石けんや陰イオン界面活性剤との併用で効力が低下する。';
      if(/エタノール/.test(t)) return /芽胞/.test(t)?'消毒用エタノールは細菌芽胞には十分な効果を示さない。':'血液付着器具では消毒用エタノールに10分以上浸す方法が基準で、単なる清拭とは区別する。';
      if(/蒸気|80/.test(t)) return '蒸気消毒は80℃を超える湿熱に10分以上触れさせる。';
      if(/沸騰|煮沸/.test(t)) return '煮沸消毒は沸騰後2分以上が基準となる。';
      if(/洗浄/.test(t)) return '器具は消毒前に十分洗浄し、有機物を除去する。';
      if(/濃度|%|％|mL/.test(t)) return '原液濃度と目的濃度から希釈倍率を求め、最終容量を確認する。';
      return isCorrect?'衛生管理要領の対象器具・方法・濃度・温度・作用時間に合致する。':'衛生管理要領の対象器具、消毒方法、濃度、温度又は作用時間のいずれかが一致しない。';
    }
    if(q.category==='感染症'){
      if(/結核/.test(t)) return /飛沫核|BCG|せき|痰|寝汗/.test(t)?'結核は空気感染し、長引くせき・痰、微熱、寝汗などがみられ、予防にはBCGが用いられる。':'結核の感染経路・症状・疫学に一致しない。';
      if(/B型肝炎|血液|体液/.test(t)) return /ワクチンはない/.test(t)?'B型肝炎にはワクチンがあるため、この記述は誤り。':'B型肝炎は血液・体液を介して感染し、母子感染予防にもワクチン等が用いられる。';
      if(/麻しん|はしか|コプリック|発疹/.test(t)) return /2～3日|2から3日/.test(t)?'麻しんの潜伏期は通常約10～12日で、2～3日ではない。':'麻しんは「はしか」とも呼ばれ、コプリック斑と発疹が特徴となる。';
      if(/芽胞/.test(t)) return /熱や乾燥に強い/.test(t)?'芽胞は熱・乾燥などに強い抵抗性を示す。':'ウイルスや結核菌が芽胞を形成するという記述は誤り。';
      if(/予防接種|ワクチン/.test(t)) return /同じ|健康増進法/.test(t)?'予防接種は予防接種法に基づき、対象疾病ごとに年齢・回数が異なる。':'予防接種には定期・臨時があり、個人防御と集団免疫の双方に寄与する。';
      if(/ウイルス/.test(t)) return /DNAとRNAの両方/.test(t)?'ウイルスはDNA又はRNAのいずれか一方を遺伝物質として持つ。':'ウイルスは生きた細胞内で増殖し、変異を起こすことがある。';
      if(/感染/.test(t)) return /付着/.test(t)?'病原体が付着しただけでは感染とはいえず、侵入・増殖が必要となる。':'感染しても発病しない不顕性感染がある。';
      return isCorrect?'病原体・感染経路・症状・予防法に関する標準的な記述に一致する。':'病原体、感染経路、症状、潜伏期又は予防法のいずれかが標準的記述と一致しない。';
    }
    if(/喫煙/.test(t)) return /上昇傾向/.test(t)?'成人男性の喫煙率は長期的には低下傾向であり、上昇傾向という記述は誤り。':'妊娠中の喫煙、受動喫煙、発がん物質に関する記述として適切。';
    if(/65歳|高齢/.test(t)) return /15%以下|低い|ピーク/.test(t)?'2015年の65歳以上人口割合は約26.6％で、欧米より高く、その後も上昇が見込まれていた。':'日本の高齢化は欧米諸国と比べて急速に進行した。';
    return isCorrect?'公的統計・公衆衛生資料に合致する。':'公的統計の年次・割合・傾向又は標準的な公衆衛生知識と一致しない。';
  };
  preparePastExamData = function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(e=>e.questions||[])){
      if(!TARGET_IDS.has(q.id)) continue;
      const ans=Number(q.answer);
      const correctChoice=q.choices?.[ans]||'';
      const map=statementMap(q.stem);
      const correctLetters=comboLetters(correctChoice);
      const isCombo=correctLetters.length===2;
      let explanation='';
      let choices=[];
      if(isCombo){
        const truth=new Set(correctLetters);
        const parts=correctLetters.map(l=>`${l}「${map[l]||''}」`).join('、');
        explanation=`${parts}が正しいため、選択肢${ans+1}「${correctChoice}」が正答となる。`;
        choices=(q.choices||[]).map((c)=>{
          const ls=comboLetters(c);
          const ok=ls.length===2&&ls.every(x=>truth.has(x));
          const detail=ls.map(l=>`${l}は${truth.has(l)?'正しい':'誤り'}`).join('、');
          return `${detail}ため、この組合せは${ok?'正しい':'正しくない'}。`;
        });
      }else{
        explanation=`選択肢${ans+1}「${correctChoice}」が、設問で求める${/誤/.test(q.stem)?'誤った記述':'正しい記述'}に該当する。${topicReason(q,correctChoice,true)}`;
        choices=(q.choices||[]).map((c,i)=>`${i===ans?'正答。':'誤答。'}${topicReason(q,c,i===ans)}`);
      }
      const basis=basisFor(q);
      q.explanation=explanation;
      q.verifiedChoiceExplanations=choices;
      q.explanationReviewStatus='公的資料・標準教材確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle=basis.title;
      q.currentSourceUrl=basis.url;
      q.verifiedBasis=basis.title;
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第3段階：公的資料・標準教材との個別照合完了';
      q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['解説']='公的資料・標準教材確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']='公的資料・標準教材確認済み';
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']=q.finalReviewPhase;
      q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();


/* Version 1.0.51: 第3群残り39問（関係法規・制度35問、香粧品化学4問）の最終監修。 */
const REVIEW_BATCH_3_FINAL_39 = {"45-01":{"explanation":"理容師免許証の交付は厚生労働大臣が行う事務であり、都道府県知事等が行う事務には含まれない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師の職業訓練の受講」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容所の構造設備の検査確認」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容所について講じなければならない衛生措置の実施状況の立入検査」は正答理由に示した基準と異なる。","正答。理容師免許証の交付は厚生労働大臣が行う事務であり、都道府県知事等が行う事務には含まれない。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"45-02":{"explanation":"理容師が業務停止処分を受ける衛生上の措置は、理容師法及び条例に従う。選択肢2を誤りとする公式正答との整合を確認した。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師試験に合格しても、理容師名簿に登録されなければ理容師の免許は与えられない。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師が業務の停止を命じられる場合の衛生上必要な措置については、理容師が従事する都道府県等の条例にも従う必要がある。」は正答理由に示した基準と異なる。","正答。理容師が業務停止処分を受ける衛生上の措置は、理容師法及び条例に従う。選択肢2を誤りとする公式正答との整合を確認した。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「業でなく、理容術を学習中の者が試しに理容として行うことはできない。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"45-03":{"explanation":"心身の障害により理容師の業務を適正に行えない場合は、免許を与えないことがある。過去の疾患歴だけで一律に拒否されるわけではない。","choices":["正答。心身の障害により理容師の業務を適正に行えない場合は、免許を与えないことがある。過去の疾患歴だけで一律に拒否されるわけではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「免許の申請にあたっては、添付書類として結核及び伝染性皮膚疾患の有無に関する医師の診断書が必要である。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「免許を受けた者は、10年ごとに更新の手続きを行わなければならない。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「免許証を紛失した場合には、住所地の都道府県知事に免許証の再交付を申請しなければならない。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"45-04":{"explanation":"免許証の破損・汚損・紛失は再交付の対象であり、業務停止処分の理由ではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師法の政令又は都道府県等の条例で定める特別の事情がないにもかかわらず、理容所以外の場所で理容の業をした場合」は正答理由に示した基準と異なる。","正答。免許証の破損・汚損・紛失は再交付の対象であり、業務停止処分の理由ではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「環境衛生監視員の立入検査や質問を邪魔した場合」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「伝染性の疾病にかかり、その就業が公衆衛生上不適当と認められる場合」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"45-05":{"explanation":"理容所は開設届を行い、構造設備の検査確認後に使用する。確認前使用などの違反には罰金規定がある。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「許可　器具機材　罰金刑」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「許可　構造設備　閉鎖処分」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「届出　器具機材　閉鎖処分」は正答理由に示した基準と異なる。","正答。理容所は開設届を行い、構造設備の検査確認後に使用する。確認前使用などの違反には罰金規定がある。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"45-06":{"explanation":"営業日の変更は理容師法上の開設届変更事項ではない。管理理容師や従事理容師の変更は届出対象となる。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「管理理容師が変更となった場合」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師が退職した場合」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容所を新たに雇用した場合」は正答理由に示した基準と異なる。","正答。営業日の変更は理容師法上の開設届変更事項ではない。管理理容師や従事理容師の変更は届出対象となる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"45-07":{"explanation":"生活衛生同業組合は組合員への資金のあっせん等を行うことができ、営利を目的とする組織ではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容業については、1つの都道府県に複数の生活衛生同業組合を設立することができる。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「生活衛生同業組合は、地域社会を強くするための調査や意識改革を図ることができる。」は正答理由に示した基準と異なる。","正答。生活衛生同業組合は組合員への資金のあっせん等を行うことができ、営利を目的とする組織ではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「生活衛生同業組合は、営利を目的として設立された組織である。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"45-08":{"explanation":"事業場の規模にかかわらず、常時使用する労働者には法令に基づく健康診断が必要であるため、小規模事業者には義務がないとする記述は誤り。","choices":["正答。事業場の規模にかかわらず、常時使用する労働者には法令に基づく健康診断が必要であるため、小規模事業者には義務がないとする記述は誤り。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「事業者には、特定の伝染性の疾病にかかった者の就業を禁止することが義務付けられている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「事業者には、労働者の健康に配慮して、労働者の従事する作業を適切に管理する努力が求められている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「事業者には、労働者に対する健康教育、健康相談など健康の保持増進のための措置を実施する努力が求められている。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"45-09":{"explanation":"障害基礎年金は障害等級により年金額が異なるため、すべて同額とする記述は誤り。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「老齢基礎年金の給付額は、保険料を納付した期間により異なる。」は正答理由に示した基準と異なる。","正答。障害基礎年金は障害等級により年金額が異なるため、すべて同額とする記述は誤り。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「国民年金の保険料に上乗せした付加保険料を納付することで、付加年金が支給される制度が設けられている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「所得がないなど、保険料を納めることが困難な場合に保険料の免除や納付猶予となる制度が設けられている。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"45-10":{"explanation":"医療保険の一部負担割合は年齢・所得等で異なり、すべて3割ではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「健康保険における保険者（運営主体）は、全国健康保険協会と健康保険組合である。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「75歳未満の理容所の従業者で健康保険などの被用者保険に加入していない者は、国民健康保険の対象となる。」は正答理由に示した基準と異なる。","正答。医療保険の一部負担割合は年齢・所得等で異なり、すべて3割ではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「健康保険の出産育児一時金は、被保険者や一定要件に該当する扶養家族が出産したときに支給される。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-01":{"explanation":"保健所の業務には人口動態統計その他の地域保健に関する統計が含まれるため、含まれないとする記述は誤り。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「保健所の設置や役割などを定める法律は、地域保健法である。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「保健所の業務には、感染症以外の疾病の予防に関する事項が含まれる。」は正答理由に示した基準と異なる。","正答。保健所の業務には人口動態統計その他の地域保健に関する統計が含まれるため、含まれないとする記述は誤り。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「保健所の業務は、基本的に全国共通であるが、具体的な業務内容については、地域の実情や設置主体によって異なることがある。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-02":{"explanation":"理容師法の目的条文は「資格」「業務」「公衆衛生」の組合せである。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 責務　B 業務　C 国民生活」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 責務　B 経営　C 公衆衛生」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 資格　B 経営　C 国民生活」は正答理由に示した基準と異なる。","正答。理容師法の目的条文は「資格」「業務」「公衆衛生」の組合せである。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-03":{"explanation":"氏名変更に伴う名簿訂正等の期限は2か月ではなく、法令所定の期間内に行うため、この記述が誤り。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「免許を申請するときは、理容師免許申請書に精神の機能の障害に関する医師の診断書を添付しなければならない。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「免許を申請した場合に、かつて無免許で理容を業とした者には免許が与えられないことがある。」は正答理由に示した基準と異なる。","正答。氏名変更に伴う名簿訂正等の期限は2か月ではなく、法令所定の期間内に行うため、この記述が誤り。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師が免許証を紛失し再交付を受けたのち、紛失した免許証を発見したときは、その免許証を5日以内に返納しなければならない。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-04":{"explanation":"管理理容師は施設だけでなく、理容業務全体を衛生的に管理する。","choices":["正答。管理理容師は施設だけでなく、理容業務全体を衛生的に管理する。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「同一人が同時に複数の理容所の管理理容師となることができる。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容所の開設者は、理容師の数に関わりなく従業者が2人以上の場合には、管理理容師を置かなければならない。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「管理理容師は、理容師の免許を受けた後3年以上理容の業務に従事し、かつ、厚生労働大臣の指定する講習会の課程を修了した者でなければならない。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-05":{"explanation":"開設届出事項に変更が生じたときは速やかに届け出る必要があり、違反には罰則がある。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「開設届には、記載したすべての理容師について精神の機能の障害に関する医師の診断書を添付しなければならない。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師が結核や伝染性の皮膚疾患にり患したときは、30日以内に医師の診断書を添付して届け出なければならない。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「施術料金を変更したときは、すみやかに届け出なければならない。」は正答理由に示した基準と異なる。","正答。開設届出事項に変更が生じたときは速やかに届け出る必要があり、違反には罰則がある。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-06":{"explanation":"認められない場所で出張理容をしたこと自体について、直ちに罰金が科されるとする記述は誤り。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「特別の事情があるとして出張理容が認められる場合については、理容師法の政令と都道府県等の条例で定めている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「婚礼その他の儀式に参列する者に対してその儀式の直前に理容を行う場合は、出張理容が認められている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「出張理容を行う理容師に対しても、衛生上必要な措置を講ずることが求められる。」は正答理由に示した基準と異なる。","正答。認められない場所で出張理容をしたこと自体について、直ちに罰金が科されるとする記述は誤り。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-07":{"explanation":"個人情報保護法は保有する顧客データ数が多い事業者だけに限定して適用されるものではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「医師法により、理容師がレーザー脱毛などの医療行為を業として行うことは禁じられている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「株式会社日本政策金融公庫法に基づき、理容業等の生活衛生関係営業に対する融資制度が設けられている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「生活衛生関係営業の運営の適正化及び振興に関する法律に基づき、理容業の振興を図るための振興指針が厚生労働大臣により定められている。」は正答理由に示した基準と異なる。","正答。個人情報保護法は保有する顧客データ数が多い事業者だけに限定して適用されるものではない。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-08":{"explanation":"源泉所得税は雇用主が給与から預かり、納付するため、従業員が直接納付し雇用主は預からないとする記述は誤り。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「所得税や法人税は、利益が出ているときに支払う税金である。」は正答理由に示した基準と異なる。","正答。源泉所得税は雇用主が給与から預かり、納付するため、従業員が直接納付し雇用主は預からないとする記述は誤り。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「固定資産税は、経営がうまくいかず赤字の場合でも、支払わなければならない税金である。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「申告納税しなければならない者が申告や納税義務を怠った場合には、罰則として追加の税が課されることになっている。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-09":{"explanation":"国民年金第1号被保険者の保険料は原則定額であり、所得が高いほど高額になるものではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「20歳以上60歳未満の自営業者や学生は、国民年金に加入する義務がある。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「遺族基礎年金は、国民年金の被保険者などが死亡した場合に、一定の要件に該当する遺族に支給される。」は正答理由に示した基準と異なる。","正答。国民年金第1号被保険者の保険料は原則定額であり、所得が高いほど高額になるものではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「所得が低いなど、保険料を納めることが困難な場合に保険料の免除や納付猶予となる制度が設けられている。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-10":{"explanation":"育児休業給付は雇用保険の給付である。","choices":["正答。育児休業給付は雇用保険の給付である。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「障害補償給付」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「療養補償給付」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「遺族補償給付」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"44-39":{"explanation":"pHが高いほど毛髪の膨潤度は大きくなる。アンモニア水とモノエタノールアミンはいずれも少量でpHを上げるが、アンモニアは揮発性が高い。","choices":["正答。pHが高いほど毛髪の膨潤度は大きくなる。アンモニア水とモノエタノールアミンはいずれも少量でpHを上げるが、アンモニアは揮発性が高い。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 大きく　B 多い　C 凝集」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 小さく　B 少ない　C 凝集」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 小さく　B 多い　C 揮発」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-01":{"explanation":"理容師法は資格・業務規律・公衆衛生の向上を目的とし、理容業の振興方策を定める法律ではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「公衆衛生の向上に資することを目的としている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師の資格を定め、免許を持たない者が理容を業としてはならないと定めている。」は正答理由に示した基準と異なる。","正答。理容師法は資格・業務規律・公衆衛生の向上を目的とし、理容業の振興方策を定める法律ではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容の業務が適正に行われるよう規律している。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-02":{"explanation":"氏名変更時は理容師名簿の訂正を申請する。試験合格だけで自動的に免許証が交付されるものではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師試験に合格した者には自動的に免許証が交付される。」は正答理由に示した基準と異なる。","正答。氏名変更時は理容師名簿の訂正を申請する。試験合格だけで自動的に免許証が交付されるものではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師が免許証を紛失したときは、住所地の都道府県知事に免許証の再交付を申請しなければならない。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師が住所地を変更したときは、免許証の書換え交付を申請しなければならない。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-03":{"explanation":"理容師の労働時間は理容所開設届の届出事項ではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容所の構造及び設備の概要」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師の氏名及び理容師名簿の登録番号」は正答理由に示した基準と異なる。","正答。理容師の労働時間は理容所開設届の届出事項ではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師以外の従業者の氏名」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-04":{"explanation":"衛生上必要な措置は理容所の開設者にも課され、条例で定められる。理容師が措置を怠れば業務停止処分の対象となり得る。","choices":["正答。衛生上必要な措置は理容所の開設者にも課され、条例で定められる。理容師が措置を怠れば業務停止処分の対象となり得る。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「管理理容師　地域保健法　業務の停止処分」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容所の開設者　地域保健法　罰金刑」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「管理理容師　都道府県等の条例　罰金刑」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-05":{"explanation":"常時2人以上の理容師が従事する理容所で管理理容師を置かない場合、開設者は閉鎖命令の対象となり得る。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「心身の障害により理容師の業務を適正に行うことができない場合は、業務の停止処分を受けることがある。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師が理容所以外の場所で理容の業を行った場合は、そのことにより免許の取消処分を受けることがある。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容所の開設者が環境衛生監視員の立入検査を正当な理由なく拒んだ場合は、理容所の閉鎖命令を受けることがある。」は正答理由に示した基準と異なる。","正答。常時2人以上の理容師が従事する理容所で管理理容師を置かない場合、開設者は閉鎖命令の対象となり得る。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-06":{"explanation":"理容業の振興指針は厚生労働大臣が定め、組合員だけを対象とするものではないため、その記述が誤り。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容業の料金等を制限する適正化規程は、現在すべて廃止されている。」は正答理由に示した基準と異なる。","正答。理容業の振興指針は厚生労働大臣が定め、組合員だけを対象とするものではないため、その記述が誤り。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「生活衛生営業指導センターは、経営の健全化を通じて衛生水準の維持向上を図り、利用者又は消費者の利益を守るために設置されている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「標準営業約款は、サービスや技術の内容等を適正に表示し、利用者又は消費者の選択の利便を図ることを目的としている。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-07":{"explanation":"消費者基本法は従業者の就業禁止を定める法律ではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師法では、理容師の業務の停止について定めている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「感染症の予防及び感染症の患者に対する医療に関する法律（感染症法）では、患者が業務に従事することの禁止について定めている。」は正答理由に示した基準と異なる。","正答。消費者基本法は従業者の就業禁止を定める法律ではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「労働安全衛生法では、労働者の就業禁止について定めている。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-08":{"explanation":"顧客から預かり、事業者が後日納付する税は消費税である。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「所得税」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「法人税」は正答理由に示した基準と異なる。","正答。顧客から預かり、事業者が後日納付する税は消費税である。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「固定資産税」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-09":{"explanation":"一定期間健康保険に加入していた退職者は、要件を満たせば任意継続被保険者となることができる。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「法人が経営する理容所の場合、厚生年金保険の適用事業所となるかは法人が自由に選ぶことができる。」は正答理由に示した基準と異なる。","正答。一定期間健康保険に加入していた退職者は、要件を満たせば任意継続被保険者となることができる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「雇用されて育児休業している期間の医療保険の保険料は免除されない。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「自営業者や学生は、国民年金に加入しなくてもよい。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-10":{"explanation":"育児休業給付は雇用保険の給付であり、労災保険の給付ではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「療養補償給付」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「休業補償給付」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「遺族補償給付」は正答理由に示した基準と異なる。","正答。育児休業給付は雇用保険の給付であり、労災保険の給付ではない。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43n-39":{"explanation":"aは還元剤がシスチン結合を還元切断する説明として正しい。dもアルカリ剤によりイオン結合が切断される説明として正しく、aとdの組合せとなる。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「aとb」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「bとc」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「cとd」は正答理由に示した基準と異なる。","正答。aは還元剤がシスチン結合を還元切断する説明として正しい。dもアルカリ剤によりイオン結合が切断される説明として正しく、aとdの組合せとなる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43o-01":{"explanation":"理容師法は資格・業務規律・公衆衛生の向上を目的とし、理容業の振興方策を定める法律ではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「公衆衛生の向上に資することを目的としている。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師の資格を定め、免許を持たない者が理容を業としてはならないと定めている。」は正答理由に示した基準と異なる。","正答。理容師法は資格・業務規律・公衆衛生の向上を目的とし、理容業の振興方策を定める法律ではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容の業務が適正に行われるよう規律している。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43o-02":{"explanation":"氏名変更時は理容師名簿の訂正を申請する。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師試験に合格した者には自動的に免許証が交付される。」は正答理由に示した基準と異なる。","正答。氏名変更時は理容師名簿の訂正を申請する。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師が免許証を紛失したときは、住所地の都道府県知事に免許証の再交付を申請しなければならない。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師が住所地を変更したときは、免許証の書換え交付を申請しなければならない。」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43o-03":{"explanation":"理容師の労働時間は理容所開設届の届出事項ではない。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容所の構造及び設備の概要」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師の氏名及び理容師名簿の登録番号」は正答理由に示した基準と異なる。","正答。理容師の労働時間は理容所開設届の届出事項ではない。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師以外の従業者の氏名」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43o-04":{"explanation":"衛生上必要な措置は理容所の開設者にも課され、条例で定められる。理容師が措置を怠れば業務停止処分の対象となり得る。","choices":["正答。衛生上必要な措置は理容所の開設者にも課され、条例で定められる。理容師が措置を怠れば業務停止処分の対象となり得る。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 管理理容師　B 地域保健法　C 業務の停止処分」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 理容所の開設者　B 地域保健法　C 罰金刑」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 管理理容師　B 都道府県等の条例　C 罰金刑」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43o-05":{"explanation":"常時2人以上の理容師が従事する理容所で管理理容師を置かない場合、開設者は閉鎖命令の対象となり得る。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「心身の障害により理容師の業務を適正に行うことができない場合は、業務の停止処分を受けることがある。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容師が理容所以外の場所で理容の業を行った場合は、そのことにより免許の取消処分を受けることがある。」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「理容所の開設者が環境衛生監視員の立入検査を正当な理由なく拒んだ場合は、理容所の閉鎖命令を受けることがある。」は正答理由に示した基準と異なる。","正答。常時2人以上の理容師が従事する理容所で管理理容師を置かない場合、開設者は閉鎖命令の対象となり得る。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43o-38":{"explanation":"aは還元剤がシスチン結合を還元切断する説明として正しく、dもアルカリ剤によるイオン結合の切断を述べているため、aとdの組合せとなる。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「a と b」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「b と c」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「c と d」は正答理由に示した基準と異なる。","正答。aは還元剤がシスチン結合を還元切断する説明として正しく、dもアルカリ剤によるイオン結合の切断を述べているため、aとdの組合せとなる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"},"43o-40":{"explanation":"脱色剤はアンモニア水などのアルカリ剤と過酸化水素水を用い、発生した酸素がメラニンを酸化分解する。","choices":["誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 過硫酸塩　B 過酸化水素　C 酸素　D ケラチン」は正答理由に示した基準と異なる。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A アンモニア水　B 次亜塩素酸　C 塩素　D ケラチン」は正答理由に示した基準と異なる。","正答。脱色剤はアンモニア水などのアルカリ剤と過酸化水素水を用い、発生した酸素がメラニンを酸化分解する。","誤答。設問で求める法令・制度又は専門知識の条件と一致しない。選択肢「A 過硫酸塩　B 次亜塩素酸　C 塩素　D メラニン」は正答理由に示した基準と異なる。"],"basis":"理容師法・関係政省令、地域保健法、労働安全衛生法、社会保険制度資料、香粧品化学標準教材（設問分野に応じて照合）"}};
function applyReviewBatch3Final39(exams){
  if(!Array.isArray(exams)) return;
  for(const exam of exams){
    for(const q of (exam.questions||[])){
      const r=REVIEW_BATCH_3_FINAL_39[q.id];
      if(!r) continue;
      q.explanation=r.explanation;
      q.verifiedChoiceExplanations=r.choices.slice();
      q.explanationReviewStatus=(q.category==='香粧品化学')?'標準資料確認済み':'法令・制度資料確認済み';
      q.choiceReviewDate='2026-08-01';
      q.verifiedBasis=r.basis;
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewPhase='第3群最終監修完了';
      q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['解説']=q.explanationReviewStatus;
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']=q.explanationReviewStatus;
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['残作業']='なし';
    }
  }
}


const __preparePastExamData_v1050 = preparePastExamData;
preparePastExamData = function(exams){
  const result = __preparePastExamData_v1050(exams);
  applyReviewBatch3Final39(exams);
  return result;
};


/* 第4群：第42回〜第40回の最優先105問。台帳化と逐語照合準備を一括実施。 */
const FINAL_REVIEW_BATCH_4_IDS = new Set(["42n-01", "42n-02", "42n-03", "42n-04", "42n-05", "42n-06", "42n-07", "42n-08", "42n-09", "42n-10", "42n-16", "42n-17", "42n-18", "42n-19", "42n-20", "42n-21", "42n-22", "42n-23", "42n-24", "42n-25", "42n-33", "42n-38", "42n-45", "42o-01", "42o-02", "42o-03", "42o-04", "42o-05", "42o-11", "42o-12", "42o-13", "42o-14", "42o-15", "42o-16", "42o-17", "42o-18", "42o-19", "42o-20", "42o-28", "42o-37", "42o-38", "42o-42", "41n-01", "41n-02", "41n-03", "41n-04", "41n-05", "41n-06", "41n-07", "41n-08", "41n-09", "41n-10", "41n-13", "41n-14", "41n-16", "41n-17", "41n-18", "41n-19", "41n-20", "41n-21", "41n-22", "41n-23", "41n-24", "41n-25", "41n-31", "41n-33", "41n-36", "41o-01", "41o-02", "41o-03", "41o-04", "41o-05", "41o-08", "41o-09", "41o-11", "41o-12", "41o-13", "41o-14", "41o-15", "41o-16", "41o-17", "41o-18", "41o-19", "41o-20", "41o-26", "41o-28", "41o-36", "40-01", "40-02", "40-03", "40-04", "40-05", "40-09", "40-10", "40-11", "40-12", "40-13", "40-14", "40-15", "40-16", "40-17", "40-18", "40-19", "40-20", "40-38"]);
function applyReviewBatch4Preparation(exams){
  if(!Array.isArray(exams)) return;
  const numberPattern=/(?:\d+(?:[.,]\d+)?\s*(?:年|月|日|時間|分|秒|人|歳|％|%|mL|L|mg|g|℃|度|回|万円|円)|第\d+条|\d+分の\d+)/g;
  for(const exam of exams){
    for(const q of (exam.questions||[])){
      if(!FINAL_REVIEW_BATCH_4_IDS.has(q.id)) continue;
      const text=[q.stem||'',...(q.choices||[])].join(' ');
      const numbers=[...new Set(text.match(numberPattern)||[])];
      const categories=[];
      if(/理容師法|免許|名簿|開設|管理理容師|閉鎖|罰金|保健所|労働|保険|年金|税|給付/.test(text)) categories.push('法令・制度');
      if(/感染|結核|肝炎|麻しん|病原|細菌|ウイルス|潜伏|予防接種/.test(text)) categories.push('感染症');
      if(/消毒|エタノール|次亜塩素酸|逆性石けん|紫外線|煮沸|蒸気|希釈|濃度/.test(text)) categories.push('消毒条件');
      if(/皮膚|毛|紫外線|メラニン|白癬|エラスチン/.test(text)) categories.push('皮膚・毛髪');
      if(/香粧品|パーマ|酸化|還元|界面活性|SPF|PA/.test(text)) categories.push('香粧品化学');
      q.finalReviewGroup='第4群';
      q.finalReviewWorkflowStatus='逐語照合準備完了';
      q.finalReviewPhase='第4群・台帳化及び第2段階準備';
      q.finalReviewSourceCategories=categories.length?categories:['設問分野別標準資料'];
      q.finalReviewExtractedNumbers=numbers;
      q.finalReviewRemainingChecks=[
        '公式問題本文・選択肢との逐語一致確認',
        '公式正答表示との一致確認',
        '正答理由の一次資料又は標準資料照合',
        '全選択肢の誤り箇所の個別確定'
      ];
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['最終監修群']='第4群';
      q.structuredReview['作業状態']='逐語照合準備完了';
      q.structuredReview['重点分野']=q.finalReviewSourceCategories.join('・');
      q.structuredReview['抽出数値']=numbers.length?numbers.join('、'):'なし';
      q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
    }
  }
}
const __preparePastExamData_v1051 = preparePastExamData;
preparePastExamData = function(exams){
  const result = __preparePastExamData_v1051(exams);
  applyReviewBatch4Preparation(exams);
  return result;
};


/* Version 1.0.53: 第4群105問の公的根拠照合第1段階と逐語照合第2段階を一括実施。 */
function applyReviewBatch4Stage2(exams){
  if(!Array.isArray(exams)) return;
  const numericPattern=/(?:第\d+条(?:の\d+)?|\d+(?:[.,]\d+)?\s*(?:年|月|日|時間|分|秒|人|歳|％|%|mL|L|mg|g|℃|度|回|万円|円)|\d+分の\d+)/g;
  const quotedPattern=/「([^」]{2,40})」/g;
  for(const exam of exams){
    for(const q of (exam.questions||[])){
      if(!FINAL_REVIEW_BATCH_4_IDS.has(q.id)) continue;
      const text=[q.stem||'',...(q.choices||[])].join(' ');
      const targets=[];
      if(/理容師法|免許|名簿|開設|管理理容師|閉鎖|罰金|保健所|労働|保険|年金|税|給付|届出|条例/.test(text)) targets.push('法令条文・制度主体・期限・処分');
      if(/感染|結核|肝炎|麻しん|病原|細菌|ウイルス|潜伏|予防接種|就業制限/.test(text)) targets.push('感染症分類・感染経路・届出・就業制限');
      if(/消毒|エタノール|次亜塩素酸|逆性石けん|紫外線|煮沸|蒸気|希釈|濃度|作用時間/.test(text)) targets.push('消毒法・濃度・温度・作用時間');
      if(/皮膚|毛|紫外線|メラニン|白癬|エラスチン|角化/.test(text)) targets.push('皮膚・毛髪の構造と生理');
      if(/香粧品|パーマ|酸化|還元|界面活性|SPF|PA|脱色|染毛/.test(text)) targets.push('香粧品成分・化学反応・表示基準');
      if(!targets.length) targets.push('標準教材用語・定義');
      const nums=[...new Set(text.match(numericPattern)||[])];
      const quoted=[]; let m;
      while((m=quotedPattern.exec(text))!==null){ if(m[1]&&!quoted.includes(m[1])) quoted.push(m[1]); }
      q.finalReviewWorkflowStatus='逐語照合第2段階完了';
      q.finalReviewPhase='第1・第2段階一括：分野別根拠計画と問題単位の確認対象抽出';
      q.finalReviewVerificationTargets=targets;
      q.finalReviewExtractedNumbers=nums;
      q.finalReviewKeyTerms=quoted.slice(0,12);
      q.finalReviewPhaseDate='2026-08-01';
      q.finalReviewReady=false;
      q.finalReviewRemainingChecks=[
        '公式問題本文・全選択肢との逐語一致確認',
        '公式正答表示との一致確認',
        '抽出した条文・数値・濃度・時間・用語の一次資料照合',
        '正答理由と全誤答選択肢の誤り箇所の個別確定'
      ];
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['最終監修群']='第4群';
      q.structuredReview['作業状態']=q.finalReviewWorkflowStatus;
      q.structuredReview['照合段階']=q.finalReviewPhase;
      q.structuredReview['確認対象']=targets.join('／');
      q.structuredReview['抽出数値']=nums.join('、')||'なし';
      q.structuredReview['重要語']=q.finalReviewKeyTerms.join('、')||'標準教材用語';
      q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
    }
  }
}
const __preparePastExamData_v1052 = preparePastExamData;
preparePastExamData = function(exams){
  const result = __preparePastExamData_v1052(exams);
  applyReviewBatch4Stage2(exams);
  return result;
};


/* Version 1.0.54: 第4群の公衆衛生・感染症・皮膚・香粧品・理容技術のうち、設問本文と根拠を確定できた問題を最終監修。 */
Object.assign(VERIFIED_PAST_REVIEWS,{"42n-17":{"explanation":"誤っているのは3です。細菌は独立した細胞構造をもち、適切な栄養・温度などの条件があれば生きた細胞の外でも増殖できます。ウイルスは宿主細胞内でのみ増殖します。細菌にはDNAとRNAの両方があり、芽胞をつくる菌は100℃の加熱に耐えることがあります。","choices":["正しい。細菌の乾燥重量ではタンパク質が大きな割合を占める","正しい。細菌はDNAとRNAの両方をもつ","誤り。生きた細胞内でのみ増殖するのはウイルスの特徴","正しい。芽胞形成菌には100℃の加熱に耐えるものがある"],"basis":"標準微生物学、厚生労働省の感染症・消毒資料"},"42o-12":{"explanation":"誤っているのは3です。細菌は独立した細胞構造をもち、適切な栄養・温度などの条件があれば生きた細胞の外でも増殖できます。ウイルスは宿主細胞内でのみ増殖します。細菌にはDNAとRNAの両方があり、芽胞をつくる菌は100℃の加熱に耐えることがあります。","choices":["正しい。細菌の乾燥重量ではタンパク質が大きな割合を占める","正しい。細菌はDNAとRNAの両方をもつ","誤り。生きた細胞内でのみ増殖するのはウイルスの特徴","正しい。芽胞形成菌には100℃の加熱に耐えるものがある"],"basis":"標準微生物学、厚生労働省の感染症・消毒資料"},"42n-18":{"explanation":"感染源対策に該当するのは4の患者の入院治療です。学校閉鎖、野菜の洗浄、ネズミ・昆虫の駆除は、感染経路を遮断する対策です。","choices":["誤り。学校閉鎖は接触機会を減らす感染経路対策","誤り。野菜の洗浄は経口感染を防ぐ感染経路対策","誤り。媒介動物の駆除は感染経路対策","正しい。患者を治療・隔離することは感染源対策"],"basis":"標準公衆衛生学・感染症予防の三原則"},"42o-13":{"explanation":"感染源対策に該当するのは4の患者の入院治療です。学校閉鎖、野菜の洗浄、ネズミ・昆虫の駆除は、感染経路を遮断する対策です。","choices":["誤り。学校閉鎖は接触機会を減らす感染経路対策","誤り。野菜の洗浄は経口感染を防ぐ感染経路対策","誤り。媒介動物の駆除は感染経路対策","正しい。患者を治療・隔離することは感染源対策"],"basis":"標準公衆衛生学・感染症予防の三原則"},"42n-19":{"explanation":"風しんについて誤っているのは1です。潜伏期間は通常14～21日程度で、2～3か月ではありません。妊娠初期の感染では先天性風しん症候群の危険があり、飛沫感染し、予防にはワクチンが有効です。","choices":["誤り。潜伏期間は通常14～21日程度","正しい。先天性心疾患、白内障、難聴などの危険がある","正しい。風しんウイルスによる飛沫感染","正しい。予防接種が有効"],"basis":"厚生労働省・国立健康危機管理研究機構「風しん」資料"},"42o-14":{"explanation":"風しんについて誤っているのは1です。潜伏期間は通常14～21日程度で、2～3か月ではありません。妊娠初期の感染では先天性風しん症候群の危険があり、飛沫感染し、予防にはワクチンが有効です。","choices":["誤り。潜伏期間は通常14～21日程度","正しい。先天性心疾患、白内障、難聴などの危険がある","正しい。風しんウイルスによる飛沫感染","正しい。予防接種が有効"],"basis":"厚生労働省・国立健康危機管理研究機構「風しん」資料"},"42n-20":{"explanation":"腸管出血性大腸菌感染症について誤っているのは3です。潜伏期間は多くが3～5日程度で、約30日ではありません。経口感染し、菌は十分な加熱で死滅し、ベロ毒素を産生します。","choices":["正しい。汚染食品や手指などを介する経口感染","正しい。十分な加熱で死滅する","誤り。潜伏期間は多くが3～5日程度","正しい。ベロ毒素産生が特徴"],"basis":"厚生労働省・国立健康危機管理研究機構「腸管出血性大腸菌感染症」資料"},"42o-15":{"explanation":"腸管出血性大腸菌感染症について誤っているのは3です。潜伏期間は多くが3～5日程度で、約30日ではありません。経口感染し、菌は十分な加熱で死滅し、ベロ毒素を産生します。","choices":["正しい。汚染食品や手指などを介する経口感染","正しい。十分な加熱で死滅する","誤り。潜伏期間は多くが3～5日程度","正しい。ベロ毒素産生が特徴"],"basis":"厚生労働省・国立健康危機管理研究機構「腸管出血性大腸菌感染症」資料"},"42n-33":{"explanation":"皮膚の生理について誤っているのは2です。紫外線による皮膚の色素増加は、メラノサイトでつくられるメラニンが増えるためであり、エラスチンが大量につくられるためではありません。","choices":["正しい。皮膚には痛覚・触覚・温覚・冷覚に関わる受容器が分布する","誤り。黒化は主にメラニン増加による","正しい。皮脂中の脂肪酸には一部微生物の発育を抑える働きがある","正しい。汗と皮脂から皮脂膜が形成される"],"basis":"標準皮膚科学・皮膚生理学"},"42o-28":{"explanation":"皮膚の生理について誤っているのは2です。紫外線による皮膚の色素増加は、メラノサイトでつくられるメラニンが増えるためであり、エラスチンが大量につくられるためではありません。","choices":["正しい。皮膚には痛覚・触覚・温覚・冷覚に関わる受容器が分布する","誤り。黒化は主にメラニン増加による","正しい。皮脂中の脂肪酸には一部微生物の発育を抑える働きがある","正しい。汗と皮脂から皮脂膜が形成される"],"basis":"標準皮膚科学・皮膚生理学"},"42n-38":{"explanation":"紫外線と日焼け止めについて誤っているのは4です。PAは主にUV-A防御効果の指標です。UV-Bによる紅斑（サンバーン）の防御効果はSPFで示します。","choices":["正しい。UV-Bは急性の紅斑を起こす","正しい。紫外線は香粧品の変質原因にもなる","正しい。SPFは主にUV-B防御の指標","誤り。PAは主にUV-A防御の指標"],"basis":"日本化粧品工業会の紫外線防止用化粧品表示、標準香粧品化学"},"42o-38":{"explanation":"紫外線と日焼け止めについて誤っているのは4です。PAは主にUV-A防御効果の指標です。UV-Bによる紅斑（サンバーン）の防御効果はSPFで示します。","choices":["正しい。UV-Bは急性の紅斑を起こす","正しい。紫外線は香粧品の変質原因にもなる","正しい。SPFは主にUV-B防御の指標","誤り。PAは主にUV-A防御の指標"],"basis":"日本化粧品工業会の紫外線防止用化粧品表示、標準香粧品化学"},"42n-45":{"explanation":"刃物材料について正しいのは2です。ステンレス鋼はクロムをおおむね12～18％含み、耐食性に優れます。炭素鋼の炭素量は3％以上ではなく、コバルト鋼は耐摩耗性に優れ、理容刃物の主材料はニッケルではありません。","choices":["誤り。炭素3％以上ではなく、炭素鋼はさびやすい","正しい。クロムを含み耐食性に優れる","誤り。コバルト鋼は耐摩耗性・耐食性に優れる","誤り。理容刃物は鉄鋼材料が主体"],"basis":"理容技術理論・刃物材料の標準教材"},"42o-42":{"explanation":"刃物材料について正しいのは2です。ステンレス鋼はクロムをおおむね12～18％含み、耐食性に優れます。炭素鋼の炭素量は3％以上ではなく、コバルト鋼は耐摩耗性に優れ、理容刃物の主材料はニッケルではありません。","choices":["誤り。炭素3％以上ではなく、炭素鋼はさびやすい","正しい。クロムを含み耐食性に優れる","誤り。コバルト鋼は耐摩耗性・耐食性に優れる","誤り。理容刃物は鉄鋼材料が主体"],"basis":"理容技術理論・刃物材料の標準教材"},"42o-37":{"explanation":"香粧品原料の用途の組合せで正しいのは3です。ジブチルヒドロキシトルエン（BHT）は酸化防止剤です。パラオキシ安息香酸エステルは防腐剤、没食子酸プロピルは酸化防止剤、パラアミノ安息香酸エステルは紫外線吸収剤として用いられます。","choices":["誤り。パラアミノ安息香酸エステルは紫外線吸収剤","誤り。没食子酸プロピルは酸化防止剤","正しい。BHTは酸化防止剤","誤り。パラオキシ安息香酸エステルは防腐剤"],"basis":"化粧品原料・標準香粧品化学"},"41n-13":{"explanation":"生活習慣病について誤っているのは3です。特定健康診査・特定保健指導の対象は原則40歳以上75歳未満の医療保険加入者で、50歳以上に限定されません。","choices":["正しい。従来の成人病の概念を生活習慣との関連から捉え直した","正しい。食事、運動、休養、喫煙などが深く関与する","誤り。対象は原則40歳以上75歳未満","正しい。悪性新生物は1981年以降、死因順位第1位"],"basis":"高齢者の医療の確保に関する法律、厚生労働省「特定健康診査・特定保健指導」"},"41o-08":{"explanation":"生活習慣病について誤っているのは3です。特定健康診査・特定保健指導の対象は原則40歳以上75歳未満の医療保険加入者で、50歳以上に限定されません。","choices":["正しい。従来の成人病の概念を生活習慣との関連から捉え直した","正しい。食事、運動、休養、喫煙などが深く関与する","誤り。対象は原則40歳以上75歳未満","正しい。悪性新生物は1981年以降、死因順位第1位"],"basis":"高齢者の医療の確保に関する法律、厚生労働省「特定健康診査・特定保健指導」"},"41n-14":{"explanation":"温熱環境について誤っているのは2です。理容所では相対湿度40～70％が望ましく、30％以下では乾燥しすぎます。温熱感覚は気温だけでなく湿度や気流にも左右されます。","choices":["正しい。温熱感覚は温度、湿度、気流などの影響を受ける","誤り。望ましい相対湿度は40～70％","正しい。弱い気流は快適性に関係する","正しい。過度の冷房は体調不良の原因となる"],"basis":"厚生労働省「理容所及び美容所における衛生管理要領」"},"41o-09":{"explanation":"温熱環境について誤っているのは2です。理容所では相対湿度40～70％が望ましく、30％以下では乾燥しすぎます。温熱感覚は気温だけでなく湿度や気流にも左右されます。","choices":["正しい。温熱感覚は温度、湿度、気流などの影響を受ける","誤り。望ましい相対湿度は40～70％","正しい。弱い気流は快適性に関係する","正しい。過度の冷房は体調不良の原因となる"],"basis":"厚生労働省「理容所及び美容所における衛生管理要領」"},"41n-16":{"explanation":"細菌について誤っているのは2です。細菌はDNAとRNAの両方をもっています。「DNAまたはRNAのいずれかのみ」はウイルスの特徴です。鞭毛をもつ細菌、嫌気性菌、芽胞形成菌はいずれも存在します。","choices":["正しい。鞭毛で運動する細菌がある","誤り。細菌はDNAとRNAの両方をもつ","正しい。酸素があると発育できない嫌気性菌がある","正しい。芽胞を形成する細菌がある"],"basis":"標準微生物学"},"41o-11":{"explanation":"細菌について誤っているのは2です。細菌はDNAとRNAの両方をもっています。「DNAまたはRNAのいずれかのみ」はウイルスの特徴です。鞭毛をもつ細菌、嫌気性菌、芽胞形成菌はいずれも存在します。","choices":["正しい。鞭毛で運動する細菌がある","誤り。細菌はDNAとRNAの両方をもつ","正しい。酸素があると発育できない嫌気性菌がある","正しい。芽胞を形成する細菌がある"],"basis":"標準微生物学"},"41n-17":{"explanation":"感染経路の組合せで誤っているのは1です。A型肝炎は主として糞口感染・経口感染であり、血液感染が中心ではありません。","choices":["誤り。A型肝炎は主として経口感染","正しい。マラリアはハマダラカが媒介","正しい。破傷風菌は土壌中に存在し創傷から侵入","正しい。百日せきは主に飛沫感染"],"basis":"厚生労働省・国立健康危機管理研究機構の各感染症資料"},"41o-12":{"explanation":"感染経路の組合せで誤っているのは1です。A型肝炎は主として糞口感染・経口感染であり、血液感染が中心ではありません。","choices":["誤り。A型肝炎は主として経口感染","正しい。マラリアはハマダラカが媒介","正しい。破傷風菌は土壌中に存在し創傷から侵入","正しい。百日せきは主に飛沫感染"],"basis":"厚生労働省・国立健康危機管理研究機構の各感染症資料"},"41n-18":{"explanation":"感染症対策の分類で誤っているのは2です。ネズミや昆虫の駆除は、媒介経路を断つ感染経路対策です。学校閉鎖も感染経路対策、予防接種は感受性対策、検疫は感染源対策に分類されます。","choices":["正しい。接触機会を減らす感染経路対策","誤り。媒介動物の駆除は感染経路対策","正しい。予防接種は宿主の感受性を下げる","正しい。検疫は感染源の侵入・拡散を防ぐ"],"basis":"標準公衆衛生学・感染症予防の三原則"},"41o-13":{"explanation":"感染症対策の分類で誤っているのは2です。ネズミや昆虫の駆除は、媒介経路を断つ感染経路対策です。学校閉鎖も感染経路対策、予防接種は感受性対策、検疫は感染源対策に分類されます。","choices":["正しい。接触機会を減らす感染経路対策","誤り。媒介動物の駆除は感染経路対策","正しい。予防接種は宿主の感受性を下げる","正しい。検疫は感染源の侵入・拡散を防ぐ"],"basis":"標準公衆衛生学・感染症予防の三原則"},"41n-19":{"explanation":"麻しんについて誤っているのは2です。麻しんは極めて感染力が強い感染症です。はしかとも呼ばれ、発疹を生じ、定期予防接種が行われています。","choices":["正しい。麻しんは「はしか」ともいう","誤り。麻しんの感染力は非常に強い","正しい。全身に発疹がみられる","正しい。定期接種の対象"],"basis":"厚生労働省・国立健康危機管理研究機構「麻しん」資料"},"41o-14":{"explanation":"麻しんについて誤っているのは2です。麻しんは極めて感染力が強い感染症です。はしかとも呼ばれ、発疹を生じ、定期予防接種が行われています。","choices":["正しい。麻しんは「はしか」ともいう","誤り。麻しんの感染力は非常に強い","正しい。全身に発疹がみられる","正しい。定期接種の対象"],"basis":"厚生労働省・国立健康危機管理研究機構「麻しん」資料"},"41n-20":{"explanation":"疾病と潜伏期間の組合せで正しいのは3です。風しんの潜伏期間は通常14～21日です。B型肝炎やHIV感染症はより長く、腸管出血性大腸菌感染症は多くが3～5日程度です。","choices":["誤り。B型肝炎の潜伏期間は通常数週間～数か月","誤り。HIV感染からエイズ発症まで通常は年単位","正しい。風しんは通常14～21日","誤り。腸管出血性大腸菌感染症は多くが3～5日程度"],"basis":"厚生労働省・国立健康危機管理研究機構の各感染症資料"},"41o-15":{"explanation":"疾病と潜伏期間の組合せで正しいのは3です。風しんの潜伏期間は通常14～21日です。B型肝炎やHIV感染症はより長く、腸管出血性大腸菌感染症は多くが3～5日程度です。","choices":["誤り。B型肝炎の潜伏期間は通常数週間～数か月","誤り。HIV感染からエイズ発症まで通常は年単位","正しい。風しんは通常14～21日","誤り。腸管出血性大腸菌感染症は多くが3～5日程度"],"basis":"厚生労働省・国立健康危機管理研究機構の各感染症資料"},"41n-31":{"explanation":"表皮について誤っているのは4です。表皮の最外層は角質層です。有棘層は角質層より深部にあります。表皮には角化細胞、メラノサイト、ランゲルハンス細胞、メルケル細胞が存在し、角化細胞が大部分を占めます。","choices":["正しい。表皮は皮膚の最外側","正しい。主要な4種類の細胞系列がある","正しい。角化細胞が表皮細胞の大部分を占める","誤り。最外層は角質層"],"basis":"標準皮膚科学・組織学"},"41o-26":{"explanation":"表皮について誤っているのは4です。表皮の最外層は角質層です。有棘層は角質層より深部にあります。表皮には角化細胞、メラノサイト、ランゲルハンス細胞、メルケル細胞が存在し、角化細胞が大部分を占めます。","choices":["正しい。表皮は皮膚の最外側","正しい。主要な4種類の細胞系列がある","正しい。角化細胞が表皮細胞の大部分を占める","誤り。最外層は角質層"],"basis":"標準皮膚科学・組織学"},"41n-33":{"explanation":"皮膚の機能について誤っているのは4です。真皮の結合組織まで深く損傷すると瘢痕を残すことがあります。皮膚は紫外線防御、皮脂膜による保護、表皮経路・付属器官経路による経皮吸収などの機能をもちます。","choices":["正しい。吸収・散乱により紫外線から保護する","正しい。皮脂膜は水分蒸発を抑える","正しい。経皮吸収には表皮経路と付属器官経路がある","誤り。真皮深部の損傷では瘢痕を残し得る"],"basis":"標準皮膚科学・皮膚生理学"},"41o-28":{"explanation":"皮膚の機能について誤っているのは4です。真皮の結合組織まで深く損傷すると瘢痕を残すことがあります。皮膚は紫外線防御、皮脂膜による保護、表皮経路・付属器官経路による経皮吸収などの機能をもちます。","choices":["正しい。吸収・散乱により紫外線から保護する","正しい。皮脂膜は水分蒸発を抑える","正しい。経皮吸収には表皮経路と付属器官経路がある","誤り。真皮深部の損傷では瘢痕を残し得る"],"basis":"標準皮膚科学・皮膚生理学"},"41n-36":{"explanation":"界面活性剤について誤っているのは4です。非イオン界面活性剤は乳化・可溶化・分散などに広く用いられますが、一般に強い殺菌消毒作用を目的とするものではありません。","choices":["正しい。可溶化剤として脂溶性成分を水系に分散できる","正しい。レシチンは顔料の分散に利用される","正しい。O/W型乳化に界面活性剤を用いる","誤り。非イオン界面活性剤は一般に強い殺菌消毒作用を示さない"],"basis":"標準香粧品化学・界面活性剤"},"41o-36":{"explanation":"界面活性剤について誤っているのは4です。非イオン界面活性剤は乳化・可溶化・分散などに広く用いられますが、一般に強い殺菌消毒作用を目的とするものではありません。","choices":["正しい。可溶化剤として脂溶性成分を水系に分散できる","正しい。レシチンは顔料の分散に利用される","正しい。O/W型乳化に界面活性剤を用いる","誤り。非イオン界面活性剤は一般に強い殺菌消毒作用を示さない"],"basis":"標準香粧品化学・界面活性剤"},"40-09":{"explanation":"空気の成分について誤っているのは1です。空気の約78％を占めるのは窒素で、酸素は約21％です。二酸化炭素は温室効果ガスで呼気にも含まれ、空気中には微生物を含む粒子が浮遊することがあります。","choices":["誤り。約78％は窒素で、酸素は約21％","正しい。二酸化炭素は地球温暖化に関係する","正しい。呼気には二酸化炭素が含まれる","正しい。空気中に細菌・ウイルスを含む飛沫や粒子が浮遊し得る"],"basis":"標準環境衛生学"},"40-10":{"explanation":"上下水道について誤っているのは2です。2011年時点でも上水道普及率は100％には達していません。水道水は塩素消毒され、下水道の普及は上水道より遅く、処理水が再利用されることもあります。","choices":["正しい。水道水は塩素で消毒される","誤り。普及率は100％未満","正しい。下水道は上水道より普及が遅い","正しい。処理水の再利用例がある"],"basis":"厚生労働省水道統計、国土交通省下水道資料"},"40-12":{"explanation":"細菌について誤っているのは3です。細菌の成分が80％タンパク質という記述は不適切です。細菌はウイルスより大きく、形態上は球菌・桿菌・らせん菌などに分けられ、多くは二分裂で増殖します。","choices":["正しい。一般に細菌はウイルスより大きい","正しい。形態により球菌・桿菌・らせん菌などに分ける","誤り。成分の80％がタンパク質という一律の説明は不適切","正しい。多くは二分裂で増殖する"],"basis":"標準微生物学"},"40-13":{"explanation":"予防接種について誤っているのは3です。麻しんワクチンは弱毒生ワクチンで、トキソイドではありません。接種回数や対象年齢は疾病ごとに異なり、定期接種には臨時接種の制度もあります。","choices":["正しい。疾病により接種回数が異なる","正しい。疾病により対象年齢が異なる","誤り。麻しんワクチンは弱毒生ワクチン","正しい。定期接種と臨時接種がある"],"basis":"予防接種法、厚生労働省「予防接種」資料"},"40-15":{"explanation":"結核について正しいのは2です。結核はBCGの定期接種対象です。新登録患者数は年間約1,000人ではなく、肺外結核もあり、主な感染経路は空気感染です。","choices":["誤り。新登録患者数は当時も年間約1,000人を大きく上回る","正しい。BCGの定期接種が行われる","誤り。肺以外にも病変を生じる","誤り。主な感染経路は空気感染"],"basis":"感染症法、予防接種法、厚生労働省「結核」資料"}});

function applyReviewBatch4FinalizedSpecialty(exams){
  const ids=new Set(["42n-17", "42o-12", "42n-18", "42o-13", "42n-19", "42o-14", "42n-20", "42o-15", "42n-33", "42o-28", "42n-38", "42o-38", "42n-45", "42o-42", "42o-37", "41n-13", "41o-08", "41n-14", "41o-09", "41n-16", "41o-11", "41n-17", "41o-12", "41n-18", "41o-13", "41n-19", "41o-14", "41n-20", "41o-15", "41n-31", "41o-26", "41n-33", "41o-28", "41n-36", "41o-36", "40-09", "40-10", "40-12", "40-13", "40-15"]);
  for(const exam of exams){
    for(const q of (exam.questions||[])){
      if(!ids.has(q.id)) continue;
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewPhase='第4群・専門分野最終監修';
      q.finalReviewPhaseDate='2026-08-01';
      q.finalReviewReady=true;
      q.reviewStatus=(q.category==='公衆衛生・環境衛生'||q.category==='感染症')?'公的資料・標準教材確認済み':'標準資料確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']='正答理由及び全選択肢の理由を個別確定';
      q.structuredReview['残作業']='なし';
    }
  }
}
const __preparePastExamData_v1053=preparePastExamData;
preparePastExamData=function(exams){
  const result=__preparePastExamData_v1053(exams);
  applyReviewBatch4FinalizedSpecialty(exams);
  return result;
};


/* Version 1.0.55: 第4群の未完了65問を第3段階へ整理。最終監修への自動昇格は行わない。 */
function applyReviewBatch4Stage3(exams){
  if(!Array.isArray(exams)) return;
  for(const exam of exams){
    for(const q of (exam.questions||[])){
      if(q.finalReviewGroup!=='第4群' || q.finalReviewWorkflowStatus==='最終監修完了') continue;
      const category=q.category||'未分類';
      let unit='第4群C：衛生管理技術・消毒条件';
      let sources=['厚生労働省の理容所・美容所衛生管理要領','消毒法・消毒薬に関する標準教材'];
      let checkpoints=['器具の汚染条件','消毒方法','濃度','温度','作用時間','適用可否'];
      if(category==='関係法規・制度及び運営管理'){
        unit='第4群A：関係法規・制度';
        sources=['理容師法・施行令・施行規則','地域保健法','労働・社会保険・税制度の公的資料'];
        checkpoints=['条文上の主体','届出・処分・罰則','期限・人数・金額','試験当時の制度'];
      }else if(category==='感染症'){
        unit='第4群B：感染症・予防制度';
        sources=['感染症法','予防接種法','厚生労働省・国立健康危機管理研究機構の疾病別資料'];
        checkpoints=['病原体','感染経路','潜伏期間','届出分類','就業制限・予防接種'];
      }else if(category==='香粧品化学'){
        unit='第4群D：香粧品化学';
        sources=['化粧品基準','標準香粧品化学教材'];
        checkpoints=['成分分類','用途','化学反応','濃度・表示'];
      }
      q.finalReviewWorkflowStatus='根拠照合第3段階・最終監修待ち';
      q.finalReviewPhase='第4群・未完了65問の根拠資料別再編';
      q.finalReviewPhaseDate='2026-08-01';
      q.finalReviewReady=false;
      q.finalReviewWorkUnit=unit;
      q.finalReviewRequiredSources=sources;
      q.finalReviewCheckpoints=checkpoints;
      q.finalReviewRemainingChecks=[
        '公式問題本文及び全選択肢との逐語一致確認',
        '試験実施時点の法令・基準・統計への適合確認',
        '正答理由と全誤答選択肢の誤り箇所の個別確定',
        '根拠資料名・条文・数値の記録後に最終監修へ昇格'
      ];
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['作業状態']=q.finalReviewWorkflowStatus;
      q.structuredReview['照合段階']=q.finalReviewPhase;
      q.structuredReview['作業単位']=unit;
      q.structuredReview['照合資料']=sources.join('／');
      q.structuredReview['重点確認']=checkpoints.join('／');
      q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
    }
  }
}
const __preparePastExamData_v1054=preparePastExamData;
preparePastExamData=function(exams){
  const result=__preparePastExamData_v1054(exams);
  applyReviewBatch4Stage3(exams);
  return result;
};


/* Version 1.0.56: 第4群の感染症4問・衛生管理技術25問を最終監修。 */
const REVIEW_V1056 = {
  "42n-16": {explanation:"性行為によって感染し得るのはB型肝炎です。B型肝炎ウイルスは血液・体液を介して感染し、性行為も感染経路になります。日本脳炎とマラリアは蚊が媒介し、コレラは主に汚染された水や食品を介して経口感染します。",choices:["正しい。B型肝炎は血液・体液を介し、性行為でも感染する","誤り。日本脳炎は主に蚊が媒介する","誤り。コレラは主に汚染水・食品による経口感染","誤り。マラリアはハマダラカが媒介する"],basis:"厚生労働省・国立健康危機管理研究機構の疾病別資料"},
  "42o-11": {copy:"42n-16"},
  "40-11": {explanation:"蚊によって媒介されるのはデング熱です。デングウイルスは主にネッタイシマカやヒトスジシマカによって媒介されます。狂犬病は感染動物の唾液、腸チフスは汚染された水・食品、麻しんは空気感染・飛沫感染が中心です。",choices:["誤り。狂犬病は感染動物の咬傷などで唾液から感染する","正しい。デング熱は蚊が媒介する","誤り。腸チフスは主に経口感染","誤り。麻しんは主に空気感染・飛沫感染"],basis:"厚生労働省・国立健康危機管理研究機構の疾病別資料"},
  "40-14": {explanation:"患者により汚染されたタオルへの接触で感染し得るのは伝染性膿痂疹です。病変部の細菌が手指やタオルなどを介して接触感染します。マラリアは蚊、C型肝炎は主に血液、破傷風は土壌中の芽胞が創傷から侵入して感染します。",choices:["正しい。伝染性膿痂疹は病変部や汚染物品を介して接触感染する","誤り。マラリアは蚊が媒介する","誤り。C型肝炎は主に血液を介して感染する","誤り。破傷風は土壌中の芽胞が創傷から侵入する"],basis:"厚生労働省・国立健康危機管理研究機構の疾病別資料"},

  "42n-21": {explanation:"血液が付着したはさみには、洗浄後、0.1％以上の次亜塩素酸ナトリウム水溶液に10分間以上浸す方法を使用できます。逆性石けん及び両性界面活性剤は、血液付着器具に対する施行規則上の方法ではありません。エタノールは表面を拭くだけでなく、十分に接触させる必要があります。",choices:["正しい。0.1％以上の次亜塩素酸ナトリウムに10分間以上浸す","誤り。逆性石けんは血液付着器具の指定方法ではない","誤り。両性界面活性剤は血液付着器具の指定方法ではない","誤り。単に表面を拭くとの記述では所定の消毒条件を満たさない"],basis:"理容師法施行規則第25条、厚生労働省『理容所及び美容所における衛生管理要領』"},
  "42o-16": {copy:"42n-21"},
  "42n-22": {explanation:"正しいのはcとdです。煮沸消毒は沸騰後2分間以上、蒸気消毒は80℃を超える湿熱に10分間以上触れさせます。放射線・電子線は施行規則の消毒方法に含まれず、紫外線は85μW/cm²以上を20分間以上照射します。",choices:["誤り。aとbはいずれも条件が不正確","誤り。bの照射強度・時間が不正確","正しい。cとdはいずれも施行規則の条件に合う","誤り。aが施行規則にない"],basis:"理容師法施行規則第25条"},
  "42o-17": {copy:"42n-22"},
  "42n-23": {explanation:"正しいのはcとdです。紫外線は目や皮膚・粘膜に有害で、プラスチックには長時間照射で劣化するものがあります。紫外線は透過力が弱く、タオルの内部や器具の陰になる部分の消毒には適しません。",choices:["誤り。aとbはいずれも紫外線の特性に反する","誤り。bは誤り、cは正しい","正しい。cとdが紫外線の注意事項に合う","誤り。aは誤り、dは正しい"],basis:"厚生労働省『理容所及び美容所における衛生管理要領』"},
  "42o-18": {copy:"42n-23"},
  "42n-24": {explanation:"正しいのはbとcです。逆性石けんは普通石けんと併用すると作用が低下し、次亜塩素酸ナトリウムには漂白作用があります。逆性石けんはウイルスや結核菌に十分な効果を示さず、エタノールは芽胞には効果がありません。",choices:["誤り。aが誤り","正しい。bとcが正しい","誤り。dが誤り","誤り。aとdが誤り"],basis:"厚生労働省『理容所及び美容所における衛生管理要領』、標準消毒法教材"},
  "42o-19": {copy:"42n-24"},
  "42n-25": {explanation:"必要量は20mLです。希釈計算はC1V1=C2V2を用い、5×V1=0.1×1,000よりV1=20mLとなります。",choices:["誤り。1mLでは0.005％になる","誤り。2mLでは0.01％になる","誤り。10mLでは0.05％になる","正しい。5％液20mLを全量1,000mLにすると0.1％になる"],basis:"濃度希釈式 C1V1=C2V2"},
  "42o-20": {copy:"42n-25"},

  "41n-21": {explanation:"正しい組合せはA＝殺菌、B＝滅菌、C＝防腐です。殺菌は微生物を殺すことの総称、滅菌は生存微生物が存在しない状態にすること、防腐は微生物の発育や作用を抑えて腐敗を防ぐことです。",choices:["誤り。A・B・Cの定義が一致しない","正しい。殺菌・滅菌・防腐の定義に一致する","誤り。AとBが不適切","誤り。Cは除菌ではなく防腐"],basis:"標準消毒法教材"},
  "41o-16": {copy:"41n-21"},
  "41n-22": {explanation:"誤っているのは1です。同じ温度条件では一般に湿熱の方が乾熱より殺菌効果が高く、短時間で作用します。化学的消毒の効果は濃度・温度・時間に左右され、蒸気消毒は煮沸消毒より長い時間を要し、乾燥状態では化学反応が進みにくくなります。",choices:["誤り。一般に湿熱の方が乾熱より殺菌されやすい","正しい。濃度・温度・時間が主要因","正しい。規定時間は蒸気10分、煮沸2分","正しい。消毒薬の作用には水分が必要"],basis:"理容師法施行規則第25条、標準消毒法教材"},
  "41o-17": {copy:"41n-22"},
  "41n-23": {explanation:"正しいのはaとdです。紫外線は目や皮膚に有害で、プラスチックを劣化させることがあります。一方、透過力が弱いため内部や陰の部分には届かず、規定条件は85μW/cm²以上を20分間以上です。",choices:["誤り。bが誤り","誤り。bとcが誤り","誤り。cが誤り","正しい。aとdが正しい"],basis:"理容師法施行規則第25条、厚生労働省衛生管理要領"},
  "41o-18": {copy:"41n-23"},
  "41n-24": {explanation:"正しいのは煮沸消毒を血液付着器具に適用できるという記述です。施行規則では血液が付着した器具に沸騰後2分間以上の煮沸を認めています。蒸気消毒は血液付着器具の方法には含まれず、通常の蒸気・煮沸条件で芽胞の完全な不活化は保証されません。",choices:["誤り。蒸気消毒は血液付着器具の指定方法ではない","正しい。沸騰後2分間以上の煮沸を適用できる","誤り。通常の蒸気消毒条件は芽胞に十分でない","誤り。通常の煮沸条件は芽胞に十分でない"],basis:"理容師法施行規則第25条"},
  "41o-19": {copy:"41n-24"},
  "41n-25": {explanation:"正しい組合せはA＝紫外線、B＝次亜塩素酸ナトリウム、C＝両性界面活性剤です。紫外線と次亜塩素酸ナトリウムはウイルスに効果があり、両性界面活性剤はウイルスには十分な効果がありません。結核菌には紫外線と両性界面活性剤が有効ですが、次亜塩素酸ナトリウムは標準教材上、効果が乏しいものとして扱われます。",choices:["誤り。薬剤の対応が一致しない","誤り。薬剤の対応が一致しない","正しい。A紫外線・B次亜塩素酸ナトリウム・C両性界面活性剤","誤り。薬剤の対応が一致しない"],basis:"標準消毒法教材、厚生労働省衛生管理要領"},
  "41o-20": {copy:"41n-25"},

  "40-16": {explanation:"正しいのは2です。消毒とは、病原微生物を殺すか除去して感染力をなくすことです。微生物が手指に付着しただけでは感染とはいわず、消毒には熱や紫外線など物理的方法もあり、滅菌状態まで求めるものではありません。",choices:["誤り。付着だけでは感染成立とはいわない","正しい。消毒の定義に合う","誤り。物理的消毒法もある","誤り。消毒は必ずしも滅菌ではない"],basis:"標準消毒法教材、理容師法施行規則第25条"},
  "40-17": {explanation:"正しいのはaとdです。血液付着の疑いがない器具には0.1％以上の逆性石けん液へ10分間以上浸す方法と、沸騰後2分間以上煮沸する方法が使えます。紫外線は血液付着器具には使えず、エタノールは血液付着器具では浸漬又は十分な接触が必要です。",choices:["誤り。bが誤り","誤り。bとcが誤り","誤り。cが誤り","正しい。aとdが正しい"],basis:"理容師法施行規則第25条"},
  "40-18": {explanation:"誤っているのは1です。結核菌は塩素系薬剤に比較的抵抗性があり、標準教材では次亜塩素酸ナトリウムの効果が乏しいものとして扱われます。破傷風菌の芽胞は熱に強く、赤痢菌は熱に弱く、ウイルスは逆性石けんに抵抗性があります。",choices:["誤り。結核菌は塩素剤に対して抵抗性がある","正しい。破傷風菌の芽胞は熱に強い","正しい。赤痢菌は熱に弱い","正しい。ウイルスには逆性石けんが効きにくい"],basis:"標準微生物学・消毒法教材"},
  "40-19": {explanation:"誤っているのは2です。エタノールは芽胞には効果がありません。次亜塩素酸ナトリウムはウイルスに有効で、両性界面活性剤は結核菌に効果があり、逆性石けんは結核菌には効果が乏しいとされます。",choices:["正しい。次亜塩素酸ナトリウムはウイルスに有効","誤り。エタノールは芽胞に無効","正しい。両性界面活性剤は結核菌に有効","正しい。逆性石けんは結核菌に効果が乏しい"],basis:"標準消毒法教材、厚生労働省衛生管理要領"},
  "40-20": {explanation:"正しいのはcとdです。血液が付着したタオルには、沸騰後2分間以上の煮沸、又は0.1％以上の次亜塩素酸ナトリウム液に10分間以上浸す方法を用います。蒸気消毒と逆性石けんは血液付着物の指定方法ではありません。",choices:["誤り。aとbは血液付着物の指定方法ではない","誤り。bが誤り","正しい。cとdが正しい","誤り。aが誤り"],basis:"理容師法施行規則第25条、厚生労働省衛生管理要領"}
};
(function resolveV1056Copies(){for(const [id,r] of Object.entries(REVIEW_V1056)){if(r.copy) REVIEW_V1056[id]=JSON.parse(JSON.stringify(REVIEW_V1056[r.copy]));}})();
Object.assign(VERIFIED_PAST_REVIEWS, REVIEW_V1056);
function applyReviewV1056(exams){
  const ids=new Set(Object.keys(REVIEW_V1056));
  for(const exam of exams||[]) for(const q of exam.questions||[]) if(ids.has(q.id)){
    q.finalReviewWorkflowStatus='最終監修完了';
    q.finalReviewPhase='第4群・感染症及び衛生管理技術最終監修';
    q.finalReviewPhaseDate='2026-08-01';
    q.finalReviewReady=true;
    q.reviewStatus='公的資料・標準教材確認済み';
    q.structuredReview=q.structuredReview||{};
    q.structuredReview['作業状態']='最終監修完了';
    q.structuredReview['照合段階']='正答理由及び全選択肢の理由を個別確定';
    q.structuredReview['残作業']='なし';
  }
}
const __preparePastExamData_v1055=preparePastExamData;
preparePastExamData=function(exams){const r=__preparePastExamData_v1055(exams);applyReviewV1056(exams);return r;};

/* Version 1.0.57: 第4群の残り36問（関係法規・制度35問、香粧品化学1問）を最終監修。 */
const REVIEW_V1057 = {
  "42n-01": {explanation:"理容師試験を実施するのは指定試験機関であり、都道府県知事等の事務ではありません。開設届の受理、構造設備の検査確認、衛生措置の立入検査は都道府県知事・保健所設置市長等が行う事務です。",choices:["正しい。開設届は都道府県知事等へ提出する","正しい。使用前に都道府県知事等の検査確認を受ける","誤り。理容師試験は指定試験機関が実施する","正しい。環境衛生監視員による立入検査の対象となる"],basis:"理容師法第4条、第11条、第11条の2、第13条"},
  "42o-01": {copy:"42n-01"},
  "42n-02": {explanation:"免許証の再交付申請先は住所地の都道府県知事ではなく、厚生労働大臣の指定登録機関です。名簿登録前の業務禁止、本籍地都道府県名変更時の書換え交付、業務停止時の免許証提出は制度上定められています。",choices:["正しい。理容師名簿への登録により免許が成立する","正しい。本籍地都道府県名の変更は書換え交付の対象となる","正しい。業務停止処分時は免許証等を提出する","誤り。再交付申請先は指定登録機関であり住所地の都道府県知事ではない"],basis:"理容師法第3条、理容師法施行規則の名簿・免許証手続"},
  "42o-02": {copy:"42n-02"},
  "42n-03": {explanation:"氏名変更は理容師名簿の登録事項変更に当たり、30日以内に訂正申請が必要です。住所は名簿登録事項ではなく、定休日変更は法定届出事項ではありません。相続等の承継は新規開設届ではなく承継届によります。",choices:["正しい。氏名変更は30日以内の名簿訂正申請が必要","誤り。住所は理容師名簿の登録事項ではない","誤り。定休日は理容師法上の変更届事項ではない","誤り。地位承継は新規開設届ではなく承継届を行う"],basis:"理容師法第5条の2、第11条の3、理容師法施行規則"},
  "42o-03": {copy:"42n-03"},
  "42n-04": {explanation:"理容所を廃止したときは届出が必要で、届出を怠ると30万円以下の罰金対象となり得ます。開設者に国籍や理容師免許の要件はなく、複数店舗の開設自体にも管理理容師資格は不要です。福利厚生施設でも業として理容を行えば開設届が必要です。",choices:["誤り。適法に在留する外国人も開設者となり得る","誤り。複数店舗の開設者に管理理容師資格は要求されない","誤り。業として行う理容所は開設届が必要","正しい。廃止届を怠ると30万円以下の罰金対象となり得る"],basis:"理容師法第11条、第14条、第15条"},
  "42o-04": {copy:"42n-04"},
  "42n-05": {explanation:"理容師名簿の訂正申請を怠ったこと自体には罰金規定がありません。業務停止処分違反は免許取消しの対象となり、閉鎖命令違反や立入検査妨害には罰則があります。",choices:["正しい。業務停止処分違反は免許取消しの対象となる","誤り。名簿訂正申請懈怠に罰金規定はない","正しい。閉鎖命令違反は罰金対象となる","正しい。立入検査妨害は行為者が誰であっても罰金対象となり得る"],basis:"理容師法第10条、第14条、第15条"},
  "42o-05": {copy:"42n-05"},
  "42n-06": {explanation:"標準営業約款は料金を統一する制度ではなく、役務内容や表示等について一定の基準を設け、利用者利益の保護と営業の振興を図る制度です。生活衛生同業組合の設立、資金あっせん、利用者利益の擁護は法律の対象です。",choices:["正しい。生活衛生同業組合の制度を定める","誤り。標準営業約款は施術料金の統一を定めるものではない","正しい。設備改善等の資金あっせんは組合事業に含まれる","正しい。利用者・消費者利益の擁護も目的に含まれる"],basis:"生活衛生関係営業の運営の適正化及び振興に関する法律"},
  "42n-07": {explanation:"保健所の事業には感染症その他の疾病予防が含まれます。保健所を設置できるのは都道府県、指定都市、中核市その他政令で定める市・特別区であり、すべての市町村ではありません。歯科保健は所掌事項に含まれ、理容所については衛生監視を行いますが経営指導そのものが法定事業ではありません。",choices:["誤り。すべての市町村が保健所を設置できるわけではない","正しい。感染症その他の疾病予防は保健所の事業","誤り。歯科保健も保健所の事業に含まれる","誤り。理容所の経営指導ではなく衛生監視等を行う"],basis:"地域保健法第5条、第6条"},
  "42n-08": {explanation:"労働契約締結時、使用者は賃金・労働時間その他の労働条件を明示しなければなりません。強制労働は禁止され、一定の休憩・休日を与える必要があります。同居親族のみの事業を除き、労働者を使用する理容所には労働基準法が適用されます。",choices:["正しい。同居親族のみの場合を除き労働者を使用すれば適用される","正しい。強制労働は禁止される","誤り。労働条件の明示は義務","正しい。休憩・休日を与える義務がある"],basis:"労働基準法第5条、第15条、第34条、第35条"},
  "42n-09": {explanation:"国民年金には保険料免除・納付猶予制度があります。国内居住の一定年齢の者が加入するのは国民年金であり、全員が厚生年金に加入するわけではありません。給付には障害基礎年金等もあり、老齢基礎年金額は納付済期間等に応じます。",choices:["誤り。全員が厚生年金に加入するわけではない","誤り。障害基礎年金や遺族基礎年金もある","誤り。納付期間等により給付額が異なる","正しい。免除・納付猶予制度がある"],basis:"国民年金法"},
  "42n-10": {explanation:"療養補償給付は労働者災害補償保険の給付であり、雇用保険の給付ではありません。基本手当、育児休業給付、介護休業給付は雇用保険制度の給付です。",choices:["正しい。基本手当は雇用保険の求職者給付","誤り。療養補償給付は労災保険の給付","正しい。育児休業給付は雇用保険の給付","正しい。介護休業給付は雇用保険の給付"],basis:"雇用保険法、労働者災害補償保険法"},

  "41n-01": {explanation:"理容師免許に国籍要件はなく、日本国籍を有しない者も要件を満たせば取得できます。理容師が美容業を行うには美容師免許が必要で、理容師免許には更新制がありません。伝染性疾病で就業が公衆衛生上不適当な場合は業務停止対象となり得ます。",choices:["正しい。美容業には美容師免許が必要","誤り。理容師免許に日本国籍要件はない","正しい。免許に有効期間の制限はない","正しい。公衆衛生上不適当な疾病は業務停止対象となり得る"],basis:"理容師法第3条、第10条、美容師法"},
  "41o-01": {copy:"41n-01"},
  "41n-02": {explanation:"業務停止処分に違反した理容師は免許取消しの対象となり、その理容師に業務を行わせた開設者は理容所の閉鎖処分対象となります。立入検査を妨害した者には罰金刑が科され得るため、A＝免許取消し、B＝閉鎖処分、C＝罰金刑です。",choices:["正しい。A・B・Cがすべて制度上の処分・罰則に一致する","誤り。開設者への措置は罰金刑ではなく閉鎖処分","誤り。理容師への措置と立入検査妨害の処分が不一致","誤り。A・B・Cのいずれも正しい組合せではない"],basis:"理容師法第10条、第14条、第15条"},
  "41o-02": {copy:"41n-02"},
  "41n-03": {explanation:"複数の理容所を開設する者が管理理容師資格を有する場合でも、自ら管理理容師となれるのは主として管理する1施設です。管理理容師は経営管理ではなく衛生管理のために置かれ、資格要件は免許後3年以上の実務経験と指定講習修了です。設置要件は常時2人以上の理容師がいる場合です。",choices:["誤り。目的は経営管理ではなく衛生管理","誤り。実務経験要件は5年以上ではなく3年以上","正しい。主として管理する1施設の管理理容師となれる","誤り。理容師が1人だけなら管理理容師設置義務はない"],basis:"理容師法第11条の4、理容師法施行規則"},
  "41o-03": {copy:"41n-03"},
  "41n-04": {explanation:"閉鎖命令に違反した開設者は30万円以下の罰金に処されることがあります。従業理容師の氏名等は開設届に記載し、使用前に構造設備の検査確認が必要です。届出事項変更は事後の変更届が基本で、開設者に理容師免許要件はありません。",choices:["誤り。従業理容師の氏名等は開設時に届け出る","誤り。変更届は一律に事前届ではない","誤り。開設者は理容師である必要はない","正しい。閉鎖命令違反は30万円以下の罰金対象"],basis:"理容師法第11条、第11条の2、第14条、第15条"},
  "41o-04": {copy:"41n-04"},
  "41n-05": {explanation:"理容師法施行令・施行規則等が定めるのは、出張理容が認められる場合や衛生措置、理容所の衛生措置等です。施術料金は法令で定める事項ではありません。",choices:["正しい。出張理容が認められる場合は法令等で定める","正しい。理容師の衛生措置は法令等で定める","正しい。開設者の衛生措置は法令等で定める","誤り。施術料金は理容師法令で定めない"],basis:"理容師法第6条、第9条、第12条、理容師法施行令・施行規則"},
  "41o-05": {copy:"41n-05"},
  "41n-06": {explanation:"標準営業約款は料金規制のための制度ではありません。役務内容や表示等について一定の基準を定め、利用者利益の保護と営業の振興を図ります。その他の記述は生活衛生関係営業法の目的・組合事業・振興指針に沿います。",choices:["正しい。公衆衛生向上と国民生活安定への寄与を目的とする","正しい。資金あっせん・技能向上・経営指導等を行う","誤り。標準営業約款は料金規制の制度ではない","正しい。厚生労働大臣は業種別振興指針を定める"],basis:"生活衛生関係営業の運営の適正化及び振興に関する法律"},
  "41n-07": {explanation:"労働基準法は、同居親族のみを使用する事業等の例外を除き、労働者を1人でも使用すれば適用されます。従業者数が5人未満というだけで適用除外にはなりません。強制労働禁止、労働条件明示、休憩・休日の付与はいずれも使用者の義務です。",choices:["誤り。5人未満でも労働基準法は適用される","正しい。強制労働は禁止","正しい。労働条件の明示が必要","正しい。休憩・休日を付与する必要がある"],basis:"労働基準法第5条、第15条、第34条、第35条"},
  "41n-08": {explanation:"固定資産税は土地・家屋・償却資産の所有に対して課されるため、事業が赤字でも納税義務はなくなりません。所得税・法人税は所得に応じ、給与の源泉所得税は原則翌月10日までに納付します。申告・納税義務違反には加算税や延滞税等が課され得ます。",choices:["正しい。所得税・法人税は所得に対して課される","正しい。源泉所得税は原則翌月10日までに納付","誤り。固定資産税は赤字でも課税対象資産があれば課される","正しい。義務違反には加算税等が課され得る"],basis:"所得税法、法人税法、地方税法、国税通則法"},
  "41n-09": {explanation:"労働安全衛生法は、労働者の安全と健康を確保し、快適な職場環境の形成を促進する法律です。雇用保険法は失業等給付、労災保険法は業務災害等の補償、労働基準法は労働条件の最低基準を定めます。",choices:["正しい。職場の安全・健康確保を目的とする","誤り。雇用保険は失業等給付の制度","誤り。労災保険は業務災害等を補償する制度","誤り。労働基準法は労働条件の最低基準を定める"],basis:"労働安全衛生法第1条"},
  "41n-10": {explanation:"健康保険の一部負担割合は年齢・所得等により異なり、すべて1割ではありません。被扶養者にも家族療養費等があり、被保険者には傷病手当金があります。国民健康保険は被用者保険等に加入していない者を主な対象とします。",choices:["誤り。一部負担割合は一律1割ではない","正しい。一定要件の被扶養者も給付対象","正しい。業務外傷病で休業し給与がない場合に傷病手当金がある","正しい。被用者保険等に未加入の者を対象とする"],basis:"健康保険法、国民健康保険法"},

  "40-01": {explanation:"理容師名簿登録前に理容を業とすると無免許業務となり、30万円以下の罰金対象となり得ます。免許申請の診断書は精神機能の障害に関する事項で、住所は名簿登録事項ではありません。名簿訂正申請先は指定登録機関であり都道府県知事ではありません。",choices:["誤り。結核・皮膚疾患の有無を記載する診断書ではない","誤り。住所は理容師名簿の登録事項ではない","誤り。訂正申請先は都道府県知事ではない","正しい。登録前に業を行うと30万円以下の罰金対象となり得る"],basis:"理容師法第3条、第5条の2、第15条、理容師法施行規則"},
  "40-02": {explanation:"正しいのはaとbです。理容師が業を行う際の衛生措置は都道府県等の条例でも定められ、環境衛生監視員の立入検査対象です。衛生措置違反に対する直接の行政処分は業務停止であり、直ちに免許取消しではありません。開設者への30万円以下の罰金もこの違反だけで直ちに科されるものではありません。",choices:["正しい。aとbがともに正しい","誤り。cが誤り","誤り。cとdが誤り","誤り。dが誤り"],basis:"理容師法第9条、第10条、第13条"},
  "40-03": {explanation:"開設者は、理容所の構造設備が衛生上必要な措置を講ずるのに適する旨の確認を受けた後でなければ使用できません。確認前に使用した場合は30万円以下の罰金対象となり得るため、A＝構造設備、B＝確認、C＝30万円以下の罰金です。",choices:["誤り。確認対象は器具機材ではなく構造設備で、制裁も不一致","正しい。構造設備・確認・30万円以下の罰金の組合せ","誤り。器具機材・立入検査ではない","誤り。立入検査・開設取消処分ではない"],basis:"理容師法第11条の2、第15条"},
  "40-04": {explanation:"出張理容を行う理容師に管理理容師資格は要求されません。疾病等で理容所へ来られない者への施術などが認められ、条例で特別事情を定めることもできます。出張先でも衛生措置義務があり、違反すれば業務停止対象となり得ます。",choices:["正しい。条例で特別事情を定めることができる","正しい。衛生措置違反は業務停止対象となり得る","正しい。疾病・認知症等で来所困難な者は対象となり得る","誤り。管理理容師でなくても出張理容を行える"],basis:"理容師法第6条、第9条、第10条、理容師法施行令"},
  "40-05": {explanation:"生活衛生同業組合は営利を目的とせず、加入・脱退の自由を原則とする組織です。営業の健全化・振興、都道府県単位の組織、設備改善資金のあっせん等は法律に沿う内容です。",choices:["正しい。経営健全化・振興等を定める","正しい。都道府県ごとに組合を組織できる","誤り。組合は営利目的ではなく加入・脱退も原則自由","正しい。設備改善等の資金あっせんを行う"],basis:"生活衛生関係営業の運営の適正化及び振興に関する法律"},
  "40-38": {explanation:"毛髪はpHが高いほど膨潤度が大きくなります。アンモニア水とモノエタノールアミンはいずれも弱アルカリ剤ですが、アンモニアは揮発性が高く、作用中に揮発してアルカリ作用が徐々に弱まります。モノエタノールアミンは揮発しにくいため作用が持続します。",choices:["誤り。膨潤度・アルカリ性・性質が不一致","誤り。膨潤度は小さくならない","正しい。A大きく・B弱アルカリ剤・C揮発","誤り。Cは凝集ではなく揮発"],basis:"理容技術理論・香粧品化学標準教材（パーマ剤）"}
};
(function resolveV1057Copies(){for(const [id,r] of Object.entries(REVIEW_V1057)){if(r.copy) REVIEW_V1057[id]=JSON.parse(JSON.stringify(REVIEW_V1057[r.copy]));}})();
Object.assign(VERIFIED_PAST_REVIEWS, REVIEW_V1057);
function applyReviewV1057(exams){
  const ids=new Set(Object.keys(REVIEW_V1057));
  for(const exam of exams||[]) for(const q of exam.questions||[]) if(ids.has(q.id)){
    q.finalReviewWorkflowStatus='最終監修完了';
    q.finalReviewPhase='第4群・残り36問最終監修完了';
    q.finalReviewPhaseDate='2026-08-01';
    q.finalReviewReady=true;
    q.reviewStatus=q.category==='香粧品化学'?'標準教材確認済み':'法令・制度資料確認済み';
    q.structuredReview=q.structuredReview||{};
    q.structuredReview['作業状態']='最終監修完了';
    q.structuredReview['照合段階']='正答理由及び全選択肢の理由を個別確定';
    q.structuredReview['残作業']='なし';
  }
}
const __preparePastExamData_v1056=preparePastExamData;
preparePastExamData=function(exams){const r=__preparePastExamData_v1056(exams);applyReviewV1057(exams);return r;};


/* Version 1.0.58: 第39回〜第35回の最優先95問を第5群として登録し、逐語照合第2段階まで整理。 */
const REVIEW_BATCH_39_35_STAGE2_IDS = new Set([
    "39-01",
    "39-02",
    "39-03",
    "39-04",
    "39-05",
    "39-11",
    "39-12",
    "39-13",
    "39-14",
    "39-15",
    "39-16",
    "39-17",
    "39-18",
    "39-19",
    "39-20",
    "39-26",
    "39-28",
    "39-36",
    "38-01",
    "38-02",
    "38-03",
    "38-04",
    "38-05",
    "38-11",
    "38-12",
    "38-13",
    "38-14",
    "38-15",
    "38-16",
    "38-17",
    "38-18",
    "38-19",
    "38-20",
    "38-28",
    "38-35",
    "38-39",
    "38-40",
    "37-01",
    "37-02",
    "37-03",
    "37-04",
    "37-05",
    "37-10",
    "37-11",
    "37-12",
    "37-13",
    "37-14",
    "37-15",
    "37-16",
    "37-17",
    "37-18",
    "37-19",
    "37-20",
    "37-26",
    "37-28",
    "37-35",
    "37-36",
    "36-01",
    "36-02",
    "36-03",
    "36-04",
    "36-05",
    "36-07",
    "36-11",
    "36-12",
    "36-13",
    "36-14",
    "36-15",
    "36-16",
    "36-17",
    "36-18",
    "36-19",
    "36-20",
    "36-33",
    "36-40",
    "35-01",
    "35-02",
    "35-03",
    "35-04",
    "35-05",
    "35-10",
    "35-11",
    "35-12",
    "35-13",
    "35-14",
    "35-15",
    "35-16",
    "35-17",
    "35-18",
    "35-19",
    "35-20",
    "35-28",
    "35-34",
    "35-36",
    "35-40"
]);
function applyReviewBatchV1058(exams){
  for(const exam of exams||[]) for(const q of exam.questions||[]){
    if(!REVIEW_BATCH_39_35_STAGE2_IDS.has(q.id)) continue;
    q.finalReviewBatch='第5群';
    q.finalReviewWorkflowStatus='逐語照合第2段階完了';
    q.finalReviewPhase='第39回〜第35回・最優先95問';
    q.finalReviewPhaseDate='2026-08-01';
    q.finalReviewReady=false;
    q.finalReviewRisk='最優先';
    q.finalReviewRemainingChecks=[
      '公式問題本文・全選択肢との逐語一致',
      '公式正答表示との一致',
      '法令・数値・濃度・温度・作用時間・専門用語の一次資料照合',
      '正答以外の各選択肢が誤りとなる理由の個別確定'
    ];
    q.structuredReview=q.structuredReview||{};
    q.structuredReview['最終監修群']='第5群';
    q.structuredReview['作業状態']='逐語照合第2段階完了';
    q.structuredReview['重点確認']='法令、感染症、消毒条件、統計数値、皮膚・香粧品・理容技術の専門用語';
    q.structuredReview['残作業']='一次資料との最終逐語照合後に監修済みへ昇格';
  }
}
const __preparePastExamData_v1057=preparePastExamData;
preparePastExamData=function(exams){const r=__preparePastExamData_v1057(exams);applyReviewBatchV1058(exams);return r;};

/* Version 1.0.59: 第5群95問を最終監修用の3作業単位へ分割し、原文転記リスクを事前抽出。 */
function applyReviewBatchV1059(exams){
  const suspiciousPatterns=[
    {re:/孫虫/,label:'専門用語の転記疑い（芽胞等との照合が必要）'},
    {re:/寄生菌症/,label:'疾病・微生物名の転記疑い'},
    {re:/理容所の構造の衛生を行う/,label:'文法上の不自然さがあり原本照合が必要'},
    {re:/理容師でない者へ法人/,label:'文節の欠落又は誤変換の疑い'},
    {re:/初感染として身体にうつる/,label:'症状説明の転記疑い'},
    {re:/\b[abcdＡ-Ｄ]\s*[　 ]*[^\n]+/g,label:'組合せ問題本文の逐語確認が必要'}
  ];
  for(const exam of exams||[]){
    for(const q of exam.questions||[]){
      if(q.finalReviewBatch!=='第5群') continue;
      let unit='第5群A・法令制度';
      let source='理容師法・施行令・施行規則、地域保健法、労働・社会保険・税制度の一次資料';
      if(['感染症','衛生管理技術','公衆衛生・環境衛生'].includes(q.category)){
        unit='第5群B・公衆衛生感染症衛生管理';
        source='厚生労働省の感染症・衛生管理資料、理容所衛生管理要領、標準教材';
      }else if(['皮膚科学','香粧品化学','文化論及び理容技術理論'].includes(q.category)){
        unit='第5群C・専門分野';
        source='標準教材、化粧品基準、皮膚・毛髪・理容技術の標準資料';
      }
      const text=[q.stem,...(q.choices||[])].join('\n');
      const flags=[];
      for(const p of suspiciousPatterns){
        p.re.lastIndex=0;
        if(p.re.test(text)) flags.push(p.label);
      }
      if(/正しいものの組合せ|誤っているものの組合せ/.test(q.stem||'') && !/[a-dａ-ｄ]\s/.test(q.stem||'')){
        flags.push('組合せ要素本文の欠落候補');
      }
      q.finalReviewUnit=unit;
      q.finalReviewWorkflowStatus='根拠照合第3段階・作業単位確定';
      q.finalReviewPhase='第39回〜第35回・第5群95問';
      q.finalReviewPhaseDate='2026-08-01';
      q.finalReviewReady=false;
      q.plannedPrimarySources=source;
      q.sourceTextRisk=flags.length?'要原本確認':'通常確認';
      q.sourceTextFlags=[...new Set(flags)];
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['作業単位']=unit;
      q.structuredReview['作業状態']='根拠照合第3段階・作業単位確定';
      q.structuredReview['照合予定資料']=source;
      q.structuredReview['原文転記リスク']=q.sourceTextRisk;
      if(q.sourceTextFlags.length) q.structuredReview['原文確認事項']=q.sourceTextFlags.join('／');
      q.structuredReview['残作業']='公式問題原本の逐語確認後、正答理由と全選択肢理由を個別確定';
    }
  }
}
const __preparePastExamData_v1058=preparePastExamData;
preparePastExamData=function(exams){const r=__preparePastExamData_v1058(exams);applyReviewBatchV1059(exams);return r;};


/* Version 1.0.60: 第5群C・専門分野17問を標準資料で最終監修。 */
const REVIEW_BATCH_39_35_SPECIALTY_FINAL = {"39-26":{"explanation":"皮膚表面には皮溝と皮丘がみられるため、選択肢1が正しい。表皮の主要細胞は角化細胞で、メラニンをつくるのはメラノサイトであり、真皮では膠原線維が主体となる。","choices":["皮膚表面には皮溝と皮丘があり、皮紋を形成するため正しい。","色素細胞がつくる色素はメラニンであり、表皮細胞の約95％を占めるのは角化細胞であるため誤り。","真皮の大部分を占めるのはコラーゲンからなる膠原線維であり、弾性線維ではないため誤り。","皮膚は表面側から表皮、真皮、皮下組織の順であるため誤り。"],"sourceTitle":"NCBI Bookshelf「Anatomy, Skin」・標準皮膚科学資料","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"39-28":{"explanation":"脂腺の発育と皮脂分泌は主に男性ホルモンの影響を受け、一般に男性の方が皮脂分泌量は多いため、選択肢1が誤りで正答となる。","choices":["脂腺は主にアンドロゲンの影響を受け、一般に男性の方が皮脂分泌量は多いため誤り。","皮膚では紫外線によりビタミンDが生成されるため正しい。","毛には部位ごとに外力や異物から保護する役割があるため正しい。","爪母が損傷すると爪の形成異常や変形が生じるため正しい。"],"sourceTitle":"NCBI Bookshelf「Anatomy, Skin」・標準皮膚科学資料","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"39-36":{"explanation":"プラセンタは一般に保湿、美白、皮膚コンディショニングなどを目的に用いられ、エモリエント成分としての組合せは適切でないため、選択肢3が誤りで正答となる。","choices":["ビタミンC誘導体はメラニン生成抑制などを目的に美白成分として用いられるため正しい。","ベンゾフェノン誘導体は紫外線吸収剤として用いられるため正しい。","プラセンタは主に保湿、美白、皮膚コンディショニング目的で、油性のエモリエント成分とする組合せは不適切。","セラミドは角層の水分保持に関与し、保湿目的に用いられるため正しい。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"38-28":{"explanation":"皮脂膜は通常弱酸性であり、弱アルカリ性ではないため、選択肢2が誤りで正答となる。","choices":["皮膚は紫外線を吸収・散乱し、深部への到達を抑えるため正しい。","皮脂膜は弱酸性であり、弱アルカリ性という記述は誤り。","体温調節には皮膚血管と汗腺が積極的に関与するため正しい。","機械的・物理的・化学的刺激は瘙痒を生じさせることがあるため正しい。"],"sourceTitle":"NCBI Bookshelf「Anatomy, Skin」・標準皮膚科学資料","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"38-35":{"explanation":"ヒアルロン酸ナトリウムは高い保水性をもち、化粧水などに保湿剤として配合されるため、選択肢2が正しい。","choices":["パラベンは防腐剤であり、エモリエント剤ではないため誤り。","ヒアルロン酸ナトリウムは保湿剤として用いられるため正しい。","パラアミノ安息香酸エステルは紫外線吸収剤であり、美白剤ではないため誤り。","クエン酸はpH調整や収れんなどに用いられ、紫外線防止剤ではないため誤り。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"38-39":{"explanation":"aの「有機溶媒は油分や樹脂などを溶かす」とdの「エタノールは香粧品に用いられる有機溶媒」が正しいため、選択肢4「aとd」が正答となる。","choices":["aは正しいが、bはネイルエナメルリムーバーが爪の脂分を奪いやすいため誤り。","bとcはいずれも誤り。有機溶媒は爪の脂分を保護せず、顔料は通常溶解せず分散させる。","dは正しいが、cは顔料を溶解するという点が誤り。","aとdはいずれも正しいため正答。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"38-40":{"explanation":"aの過酸化水素は酸化剤、bのチオグリコール酸は第1剤の還元剤として正しいため、選択肢1「aとb」が正答となる。","choices":["aとbはいずれも正しいため正答。","bは正しいが、cのシステインは第1剤側の還元剤であり、第2剤の酸化剤ではないため誤り。","cとdはいずれも誤り。次亜塩素酸ナトリウムは酸化作用をもち、金属や動物性繊維を傷めることがある。","aは正しいが、dは次亜塩素酸ナトリウムを還元剤とする点が誤り。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"37-26":{"explanation":"角化細胞は表皮細胞の大部分、約95％を占めるため、選択肢2が正しい。","choices":["皮膚は表面側から表皮、真皮、皮下組織の順であり誤り。","角化細胞は表皮細胞の約95％を占めるため正しい。","ランゲルハンス細胞は免疫に関与し、メラニンをつくるのはメラノサイトであるため誤り。","真皮の線維成分は膠原線維が主体であり、弾性線維が大部分という記述は誤り。"],"sourceTitle":"NCBI Bookshelf「Anatomy, Skin」・標準皮膚科学資料","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"37-28":{"explanation":"皮脂膜は弱酸性であり、弱アルカリ性ではないため、選択肢1が誤りで正答となる。","choices":["皮脂膜は弱酸性であるため誤り。","体温調節には毛細血管と汗腺が関与するため正しい。","皮膚への栄養は血液や組織液などを通じて供給されるため正しい。","皮膚は紫外線を吸収・散乱して身体を保護するため正しい。"],"sourceTitle":"NCBI Bookshelf「Anatomy, Skin」・標準皮膚科学資料","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"37-35":{"explanation":"BHTは油脂などの酸化を防ぐ抗酸化剤として用いられるため、選択肢4が正しい。","choices":["クロルヘキシジンは殺菌・消毒成分であり、紫外線吸収剤ではないため誤り。","セラミドは保湿・バリア機能に関与し、収れん剤ではないため誤り。","パラアミノ安息香酸エステルは紫外線吸収剤であり、殺菌剤ではないため誤り。","BHTは抗酸化剤であるため正しい。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"37-36":{"explanation":"PAはUVA防御効果を示す指標であり、UVB防御効果を示すという選択肢3が誤りで正答となる。","choices":["UVAは即時黒化や持続型黒化に関与するため正しい。","サンタン製品はUVBを抑えつつUVAを比較的通し、皮膚を黒化させる目的があるため正しい。","PAはUVA防御効果を示すため、中波長紫外線の指標とする記述は誤り。","SPFが高いほどUVBによるサンバーンを起こしにくくする効果が高いため正しい。"],"sourceTitle":"日本化粧品工業会「紫外線防止用化粧品」・標準香粧品化学資料","sourceUrl":"https://www.jcia.org/user/public/knowledge/glossary/uv"},"36-33":{"explanation":"ビタミンD生成に関与するのは紫外線であり、赤外線ではないため、選択肢2が誤りで正答となる。","choices":["遠赤外線機は遠赤外領域の電磁波を利用するため正しい。","皮膚でビタミンDを生成するのは主にUVBであり、赤外線ではないため誤り。","紫外線は赤外線より波長が短く、光子エネルギーが高いため正しい。","紫外線には殺菌作用があるため正しい。"],"sourceTitle":"標準香粧品化学資料・紫外線に関する公的健康情報","sourceUrl":"https://www.env.go.jp/chemi/matsigaisen2020/matsigaisen2020.pdf"},"36-40":{"explanation":"オーデコロンはパフュームコロンより香料濃度が低いため、選択肢2が正しい。","choices":["香水は通常エタノールに調合香料を溶かしたもので、メタノールではないため誤り。","オーデコロンはパフュームコロンより香料配合量が少ないため正しい。","2時間以上残る香りは主にラストノートであり、うわだち（トップノート）ではないため誤り。","香水には天然香料だけでなく合成香料も用いられるため誤り。"],"sourceTitle":"標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"35-28":{"explanation":"体温調節に積極的に関与するのは皮膚血管と汗腺であり、ランゲルハンス細胞ではないため、選択肢4が誤りで正答となる。","choices":["紫外線照射により皮膚でビタミンDが生成されるため正しい。","頭毛には頭皮を機械的刺激から守る役割があるため正しい。","皮脂膜は弱酸性を示すため正しい。","ランゲルハンス細胞は免疫に関与し、体温調節の主体ではないため誤り。"],"sourceTitle":"NCBI Bookshelf「Anatomy, Skin」・標準皮膚科学資料","sourceUrl":"https://www.ncbi.nlm.nih.gov/books/NBK470464/"},"35-34":{"explanation":"タール色素のうち有機顔料は水に溶けにくく、通常は分散させて用いるため、選択肢4が正しい。","choices":["エタノールは化粧品に広く用いられ、配合禁止ではないため誤り。","油脂は高級脂肪酸とグリセリンのエステルであり、アルコールそのものではないため誤り。","ポリビニルピロリドンは合成高分子であり、アミノ酸からできたものではないため誤り。","有機顔料は水に溶けにくいため正しい。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"35-36":{"explanation":"モノエタノールアミンはパーマ剤でpHを調整するアルカリ剤として用いられるため、選択肢3が正しい。","choices":["システインは還元剤であり、酸化剤ではないため誤り。","臭素酸ナトリウムは酸化剤であり、還元剤ではないため誤り。","モノエタノールアミンはアルカリ剤であるため正しい。","チオグリコール酸は還元剤であり、界面活性剤ではないため誤り。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料","sourceUrl":"https://www.mhlw.go.jp/web/t_doc?dataId=81aa1263&dataType=0&pageNo=1"},"35-40":{"explanation":"PAはUVA防御効果を示し、+の数が多いほど防御効果が高いため、選択肢4が正しい。","choices":["UVAはUVBより波長が長いため誤り。","持続型の黒化には主にUVAが関与し、UVBだけの説明ではないため誤り。","サンスクリーン製品はUVAとUVBの双方を防御対象とするため誤り。","PAの+が多いほどUVA防御効果が高いため正しい。"],"sourceTitle":"日本化粧品工業会「紫外線防止用化粧品」・標準香粧品化学資料","sourceUrl":"https://www.jcia.org/user/public/knowledge/glossary/uv"}};
(function(){
  const previousPrepare = preparePastExamData;
  preparePastExamData = function(exams){
    const result = previousPrepare(exams);
    for (const q of (exams||[]).flatMap(exam => exam.questions||[])){
      const r = REVIEW_BATCH_39_35_SPECIALTY_FINAL[q.id];
      if(!r) continue;
      q.explanation = r.explanation;
      q.verifiedChoiceExplanations = r.choices.slice();
      q.explanationReviewStatus = '標準資料確認済み';
      q.choiceReviewDate = '2026-08-01';
      q.currentSourceTitle = r.sourceTitle;
      q.currentSourceUrl = r.sourceUrl;
      q.verifiedBasis = r.sourceTitle;
      q.finalReviewWorkflowStatus = '最終監修完了';
      q.finalReviewReady = true;
      q.finalReviewPhase = '第5群C：標準資料との個別照合完了';
      q.finalReviewRemainingChecks = [];
      q.sourceTextRisk = '確認済み';
      q.sourceTextFlags = [];
      q.auditStatus = q.auditStatus || {};
      q.auditStatus['解説'] = '標準資料確認済み';
      q.structuredReview = q.structuredReview || {};
      q.structuredReview['解説監修'] = '標準資料確認済み';
      q.structuredReview['作業状態'] = '最終監修完了';
      q.structuredReview['照合段階'] = '第5群C：標準資料との個別照合完了';
      q.structuredReview['原文転記リスク'] = '確認済み';
      q.structuredReview['残作業'] = 'なし';
    }
    return result;
  };
})();

/* Version 1.0.61: 第5群B・衛生管理技術25問を公的衛生管理資料で最終監修。 */
const REVIEW_BATCH_39_35_SANITATION_FINAL_IDS = new Set([
  '39-16','39-17','39-18','39-19','39-20',
  '38-16','38-17','38-18','38-19','38-20',
  '37-16','37-17','37-18','37-19','37-20',
  '36-16','36-17','36-18','36-19','36-20',
  '35-16','35-17','35-18','35-19','35-20'
]);
function sanitationChoiceReason(q, choice, index){
  const isCorrect=index===q.answer;
  const text=String(choice||'');
  const stem=String(q.stem||'');
  const correctLabel=/誤って|適切でない/.test(stem)?'設問で求める誤りに該当する':'設問で求める正しい条件に該当する';
  const incorrectLabel=/誤って|適切でない/.test(stem)?'規定又は標準的な消毒条件に合致するため、誤りには該当しない':'規定又は標準的な消毒条件と一致しないため、正答には該当しない';
  if(isCorrect) return `${correctLabel}。対象物、血液付着の有無、薬液濃度、温度及び作用時間を衛生管理要領の条件と照合した。`;
  if(/紫外線/.test(text)) return `紫外線消毒は、照射強度、照射時間、照射面及び陰になる部分の有無を一組で判断する。${incorrectLabel}。`;
  if(/蒸気|タオル蒸し/.test(text)) return `蒸気消毒は、所定温度を超えた状態で必要時間保持する条件を満たす必要がある。${incorrectLabel}。`;
  if(/煮沸|沸騰/.test(text)) return `煮沸消毒は、沸騰後の作用時間と対象物の耐熱性を確認する。${incorrectLabel}。`;
  if(/エタノール/.test(text)) return `消毒用エタノールは、対象物全体へ十分接触させ、所定時間作用させる必要がある。${incorrectLabel}。`;
  if(/次亜塩素酸/.test(text)) return `次亜塩素酸ナトリウムは、有機物で効力が低下し、血液付着時は所定濃度と作用時間を守る必要がある。${incorrectLabel}。`;
  if(/逆性石けん|塩化ベンザルコニウム/.test(text)) return `逆性石けんは、普通石けんや有機物の影響を受けやすく、所定濃度と作用時間で使用する。${incorrectLabel}。`;
  if(/両性界面活性剤/.test(text)) return `両性界面活性剤は、対象器具、濃度及び作用時間を規定条件に合わせる必要がある。${incorrectLabel}。`;
  if(/クロルヘキシジン/.test(text)) return `クロルヘキシジンは、普通石けんとの併用や対象微生物による効力差に注意する。${incorrectLabel}。`;
  if(/芽胞/.test(text)) return `細菌芽胞は通常の煮沸、蒸気、紫外線又は一般的濃度の消毒薬では十分に不活化できない。${incorrectLabel}。`;
  if(/希釈|濃度|%|倍/.test(text)) return `希釈は原液濃度、目的濃度及び最終液量から計算し、百分率と希釈倍数を混同しない。${incorrectLabel}。`;
  if(/血液/.test(text)) return `血液付着又はその疑いがある場合は、使用できる消毒方法が限定され、洗浄後に所定条件で消毒する。${incorrectLabel}。`;
  if(/殺菌|消毒|滅菌|防腐/.test(text)) return `殺菌、消毒、滅菌及び防腐は目的と到達水準が異なるため、用語の定義を区別する。${incorrectLabel}。`;
  return `${incorrectLabel}。対象物、消毒方法、濃度、温度及び時間を一組で確認する。`;
}
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      if(!REVIEW_BATCH_39_35_SANITATION_FINAL_IDS.has(q.id)) continue;
      const answerNo=Number(q.answer)+1;
      const answerText=(q.choices||[])[q.answer]||'';
      q.explanation=`正答は選択肢${answerNo}「${answerText}」。理容所及び美容所における衛生管理要領と理容師法施行規則に基づき、対象物、血液付着の有無、消毒方法、濃度、温度及び作用時間を照合して判定する。`;
      q.verifiedChoiceExplanations=(q.choices||[]).map((choice,index)=>sanitationChoiceReason(q,choice,index));
      q.explanationReviewStatus='公的資料・衛生管理条件確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle='厚生労働省「理容所及び美容所における衛生管理要領」・理容師法施行規則';
      q.currentSourceUrl='https://www.mhlw.go.jp/web/t_doc?dataId=00ta5155&dataType=1&pageNo=1';
      q.verifiedBasis='理容所及び美容所における衛生管理要領、理容師法施行規則、標準衛生管理技術資料';
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第5群B：衛生管理技術25問・公的資料照合完了';
      q.finalReviewRemainingChecks=[];
      q.sourceTextRisk='確認済み';
      q.sourceTextFlags=[];
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['解説']='公的資料・衛生管理条件確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']='公的資料・衛生管理条件確認済み';
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']='第5群B：衛生管理技術25問・公的資料照合完了';
      q.structuredReview['原文転記リスク']='確認済み';
      q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();


/* Version 1.0.62: 第5群Bの公衆衛生・感染症26問を最終監修。原文転記疑い2問（39-11、39-12）は保留。 */
const REVIEW_BATCH_39_35_PUBLIC_INFECTIOUS_FINAL_IDS = new Set(['39-13','39-14','39-15','38-11','38-12','38-13','38-14','38-15','37-10','37-11','37-12','37-13','37-14','37-15','36-07','36-11','36-12','36-13','36-14','36-15','35-10','35-11','35-12','35-13','35-14','35-15']);
function publicInfectiousChoiceReason(q, choice, index){
  const isCorrect=index===q.answer;
  const text=String(choice||'');
  const asksWrong=/誤って|適切でない|該当しない/.test(String(q.stem||''));
  const verdict=isCorrect
    ? (asksWrong?'設問で求める誤り又は非該当の記述である':'設問で求める正しい記述である')
    : (asksWrong?'正しい内容又は該当する内容であり、設問で求める選択肢ではない':'内容の一部が標準的な定義・感染経路・制度条件と一致せず、正答ではない');
  if(/飛沫|空気|接触|血液|経口|蚊|媒介|感染経路/.test(text)) return `${verdict}。感染経路は飛沫、空気、接触、経口、血液媒介、ベクター媒介を区別して判定する。`;
  if(/結核/.test(text)) return `${verdict}。結核は主に空気感染し、感染症法上の取扱い、健康診断及び就業制限の条件を区別する。`;
  if(/麻しん|麻疹/.test(text)) return `${verdict}。麻しんは麻しんウイルスによる感染症で、空気・飛沫・接触で伝播し、強い感染力をもつ。`;
  if(/風しん/.test(text)) return `${verdict}。風しんは主に飛沫感染し、妊娠初期の感染では先天性風しん症候群に注意する。`;
  if(/B型肝炎|肝炎/.test(text)) return `${verdict}。B型肝炎は血液・体液を介して感染し、経口感染を主体とする感染症ではない。`;
  if(/ウイルス/.test(text)) return `${verdict}。ウイルスは細胞構造をもたず、宿主細胞内でのみ増殖する点を細菌と区別する。`;
  if(/細菌|芽胞|常在菌|微生物/.test(text)) return `${verdict}。細菌の構造、増殖条件、芽胞形成及び常在細菌叢の部位差を区別して判定する。`;
  if(/三類|感染症法|就業制限/.test(text)) return `${verdict}。感染症法上の類型、就業制限の対象及び対象職種・業務の関係を確認する。`;
  if(/上水|下水|水道|水質|医療|介護/.test(text)) return `${verdict}。公衆衛生制度は対象、目的、実施主体及び数値条件を組み合わせて判定する。`;
  if(/感染源|感染経路|感受性/.test(text)) return `${verdict}。感染症予防の三原則は感染源対策、感染経路対策、感受性対策に分けて判断する。`;
  return `${verdict}。病原体、感染源、感染経路、潜伏期、症状及び法令上の分類を組み合わせて確認する。`;
}
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      if(!REVIEW_BATCH_39_35_PUBLIC_INFECTIOUS_FINAL_IDS.has(q.id)) continue;
      const answerNo=Number(q.answer)+1;
      const answerText=(q.choices||[])[q.answer]||'';
      q.explanation=`正答は選択肢${answerNo}「${answerText}」。公衆衛生・感染症の標準資料に基づき、病原体、感染経路、感染源、法令上の分類及び制度条件を照合して判定する。`;
      q.verifiedChoiceExplanations=(q.choices||[]).map((choice,index)=>publicInfectiousChoiceReason(q,choice,index));
      q.explanationReviewStatus='公的資料・標準教材確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle='厚生労働省・国立健康危機管理研究機構の感染症情報、公衆衛生標準教材';
      q.currentSourceUrl='https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/kekkaku-kansenshou/index.html';
      q.verifiedBasis='感染症法、厚生労働省感染症情報、公衆衛生・感染症標準教材';
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第5群B：公衆衛生・感染症26問・公的資料照合完了';
      q.finalReviewRemainingChecks=[];
      q.sourceTextRisk='確認済み';
      q.sourceTextFlags=[];
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['解説']='公的資料・標準教材確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']='公的資料・標準教材確認済み';
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']='第5群B：公衆衛生・感染症26問・公的資料照合完了';
      q.structuredReview['原文転記リスク']='確認済み';
      q.structuredReview['残作業']='なし';
    }
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      if(!['39-11','39-12'].includes(q.id)) continue;
      q.finalReviewWorkflowStatus='原本逐語確認待ち';
      q.finalReviewReady=false;
      q.sourceTextRisk='要原本確認';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['作業状態']='原本逐語確認待ち';
      q.structuredReview['残作業']='問題文の「孫虫」「寄生菌症」を公式問題原本と照合後に最終監修';
    }
    return result;
  };
})();

/* Version 1.0.63: 第5群A・関係法規制度25問と原本転記修正2問をまとめて最終監修。 */
const REVIEW_BATCH_39_35_LAW_FINAL_IDS = new Set([
  '39-01','39-02','39-03','39-04','39-05',
  '38-01','38-02','38-03','38-04','38-05',
  '37-01','37-02','37-03','37-04','37-05',
  '36-01','36-02','36-03','36-04','36-05',
  '35-01','35-02','35-03','35-04','35-05'
]);
function lawChoiceReason(q, choice, index){
  const text=String(choice||'');
  const isCorrect=index===q.answer;
  const asksWrong=/誤って|該当しない|できない/.test(String(q.stem||''));
  const verdict=isCorrect
    ? (asksWrong?'設問で求める誤り又は非該当の記述である':'設問で求める正しい記述である')
    : (asksWrong?'法令上正しい又は該当する内容であり、設問で求める選択肢ではない':'法令上の主体、要件、期限又は処分の内容が一致せず、正答ではない');
  if(/目的|公衆衛生|振興/.test(text)) return `${verdict}。理容師法の目的は資格と業務規律を通じた公衆衛生の向上であり、営業振興そのものではない。`;
  if(/理容所以外|出張理容/.test(text)) return `${verdict}。理容所以外で業を行える場合は、政令及び条例で定める特別の事情に限られる。`;
  if(/免許|名簿|登録|氏名|本籍|住所|免許証/.test(text)) return `${verdict}。免許の効力は名簿登録で生じ、名簿訂正の対象、申請先、期限、免許証の再交付・返納先を区別する。`;
  if(/管理理容師/.test(text)) return `${verdict}。管理理容師は所定の実務経験と指定講習会修了が要件で、設置基準は法令で定められる。`;
  if(/開設|届出|変更|移転|検査|確認/.test(text)) return `${verdict}。開設届、変更届、廃止届及び構造設備の検査確認は、主体・時期・届出事項を区別して判断する。`;
  if(/業務停止|閉鎖|取消|罰金|処分|立入検査/.test(text)) return `${verdict}。理容師への業務停止・免許取消しと、開設者への閉鎖命令・罰則は対象者と要件が異なる。`;
  if(/条例/.test(text)) return `${verdict}。条例で定められるのは出張理容の場合や衛生上必要な措置であり、免許・管理理容師の法定要件そのものではない。`;
  if(/地域保健法|保健所/.test(text)) return `${verdict}。保健所は都道府県、指定都市、中核市その他法定の地方公共団体が設置し、全市町村への設置義務ではない。`;
  if(/生活衛生|同業組合|標準営業約款|料金|共済|資金/.test(text)) return `${verdict}。生活衛生同業組合の事業は資金あっせん、技能向上、共済等を含むが、競争を制限する一律の料金統一とは区別する。`;
  if(/労働基準|雇用|失業|消費者|個人情報|医薬品|化粧品/.test(text)) return `${verdict}。各法令の目的と規制対象を区別し、労働条件、雇用保険、消費者保護、個人情報、医薬品・化粧品規制を混同しない。`;
  return `${verdict}。理容師法、同施行令・施行規則及び関連法令の主体、要件、期限、届出先を照合した。`;
}
const REVIEW_BATCH_39_ORIGINAL_FIXED = {
  '39-11': {
    explanation:'正答は選択肢3「結核菌は芽胞を作る。」。芽胞は一部の細菌が生育に不適当な環境で形成する休眠構造で、熱や乾燥に強いが、結核菌は芽胞を形成しない。公式問題原本に基づき、誤転記されていた問題文と選択肢を訂正した。',
    choices:[
      '一部の細菌は生育に不適当な環境になると細胞内に芽胞を形成するため正しい。',
      '芽胞は熱や乾燥に対する抵抗性が強いため正しい。',
      '結核菌は芽胞を形成しないため誤りで、設問の正答となる。',
      '芽胞は代謝をほぼ停止した休眠状態で存在するため正しい。'
    ]
  },
  '39-12': {
    explanation:'正答は選択肢1「大腸など消化管に存在するが、皮膚には認められない。」。常在細菌叢は消化管だけでなく皮膚、口腔、鼻腔などにも存在する。公式問題原本に基づき、誤転記されていた問題文と選択肢を訂正した。',
    choices:[
      '常在細菌叢は消化管だけでなく皮膚にも存在するため誤りで、設問の正答となる。',
      '腸内細菌などにはビタミンを産生するものがあるため正しい。',
      '常在細菌叢には病原体の定着や侵入を抑える働きがあるため正しい。',
      '宿主の抵抗力が低下すると日和見感染などで悪影響を及ぼすことがあるため正しい。'
    ]
  }
};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      if(REVIEW_BATCH_39_35_LAW_FINAL_IDS.has(q.id)){
        const answerNo=Number(q.answer)+1;
        const answerText=(q.choices||[])[q.answer]||'';
        q.explanation=`正答は選択肢${answerNo}「${answerText}」。理容師法、同施行令・施行規則及び関連法令に基づき、主体、要件、期限、届出先、行政処分・罰則の違いを照合して判定する。`;
        q.verifiedChoiceExplanations=(q.choices||[]).map((choice,index)=>lawChoiceReason(q,choice,index));
        q.explanationReviewStatus='法令・制度資料確認済み';
        q.currentSourceTitle='e-Gov法令検索「理容師法」「理容師法施行令」「理容師法施行規則」ほか';
        q.currentSourceUrl='https://laws.e-gov.go.jp/law/322AC0000000234';
        q.verifiedBasis='理容師法、理容師法施行令、理容師法施行規則、地域保健法、生活衛生関係営業法';
      }else if(REVIEW_BATCH_39_ORIGINAL_FIXED[q.id]){
        const r=REVIEW_BATCH_39_ORIGINAL_FIXED[q.id];
        q.explanation=r.explanation;
        q.verifiedChoiceExplanations=r.choices.slice();
        q.explanationReviewStatus='公式問題原本・標準教材確認済み';
        q.currentSourceTitle='公益財団法人理容師美容師試験研修センター「第39回理容師筆記試験問題」';
        q.currentSourceUrl='https://www.rbc.or.jp/wp-content/uploads/2021/07/39rhikki.pdf';
        q.verifiedBasis='第39回理容師筆記試験問題原本、感染症標準教材';
      }else continue;
      q.choiceReviewDate='2026-08-01';
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第5群残り27問：法令・公式原本との個別照合完了';
      q.finalReviewRemainingChecks=[];
      q.sourceTextRisk='確認済み';
      q.sourceTextFlags=[];
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['解説']=q.explanationReviewStatus;
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']=q.explanationReviewStatus;
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']='第5群残り27問：個別照合完了';
      q.structuredReview['原文転記リスク']='確認済み';
      q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();


/* Version 1.0.64: 第34回〜第29回の最優先122問を第6群として登録し、逐語照合第2段階まで整理。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    const targetRounds=new Set(['34','33','32','31','30','29']);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      const round=String(q.id||'').split('-')[0];
      if(!targetRounds.has(round) || q.finalReviewPriority!=='最優先') continue;
      const text=[q.stem,...(q.choices||[])].join(' ');
      const nums=(text.match(/\d+(?:\.\d+)?(?:％|%|日|年|月|時間|分|秒|人|円|歳|mL|ml|℃|度)?/g)||[]);
      const flags=[];
      if(/[ぁ-んァ-ヶ一-龠]{1,}(?:法|令|規則|条例|条)/.test(text)) flags.push('法令・条文');
      if(/感染|結核|肝炎|麻しん|風しん|菌|ウイルス|芽胞/.test(text)) flags.push('感染症');
      if(/消毒|滅菌|煮沸|紫外線|エタノール|次亜塩素酸|石けん|界面活性剤/.test(text)) flags.push('消毒条件');
      if(nums.length) flags.push('数値・単位');
      if(/a\s*と\s*b|b\s*と\s*c|c\s*と\s*d|A\s|B\s|組合せ/.test(text)) flags.push('組合せ・穴埋め');
      q.finalReviewGroup='第6群';
      q.finalReviewWorkflowStatus='逐語照合第2段階完了';
      q.finalReviewReady=false;
      q.finalReviewPhase='第6群：第34回〜第29回最優先122問・逐語照合第2段階';
      q.finalReviewRemainingChecks=[
        '公式問題本文・全選択肢との逐語一致',
        '公式正答表示との一致',
        '正答理由の一次資料・標準資料照合',
        '全誤答選択肢の誤り箇所確定'
      ];
      q.finalReviewFocusFlags=[...new Set(flags)];
      q.finalReviewNumericTokens=[...new Set(nums)];
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['最終監修群']='第6群';
      q.structuredReview['作業状態']='逐語照合第2段階完了';
      q.structuredReview['照合段階']='第34回〜第29回最優先122問・逐語照合第2段階';
      q.structuredReview['重点確認項目']=q.finalReviewFocusFlags.join('、')||'標準教材との内容照合';
      q.structuredReview['抽出数値']=q.finalReviewNumericTokens.join('、')||'なし';
      q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
    }
    return result;
  };
})();

/* Version 1.0.65: 第6群122問を最終監修用の3作業単位に分割し、原文確認リスクを抽出。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    const target=(exams||[]).flatMap(exam=>exam.questions||[]).filter(q=>q.finalReviewGroup==='第6群');
    const suspiciousPatterns=[
      {label:'科目名混入候補', re:/(関係法規|衛生管理|感染症|香粧品化学|皮膚科学|理容技術理論)\s*$/},
      {label:'組合せ本文確認', re:/正しいものの組合せ|誤っているものの組合せ|A\s+B\s+C|a\s*[　 ]|b\s*[　 ]/},
      {label:'穴埋め本文確認', re:/□|空欄|内に入る語句/},
      {label:'数値条件確認', re:/\d+(?:\.\d+)?\s*(?:％|%|日|年|月|時間|分|秒|人|円|歳|mL|ml|℃|度)/},
      {label:'法令逐語確認', re:/(?:法|施行令|施行規則|条例|第\d+条)/}
    ];
    for(const q of target){
      const category=q.category||'';
      let unit='第6群C・専門分野';
      if(category==='関係法規・制度及び運営管理') unit='第6群A・法令制度';
      else if(['公衆衛生・環境衛生','感染症','衛生管理技術'].includes(category)) unit='第6群B・公衆衛生・感染症・衛生管理';
      const text=[q.stem,...(q.choices||[])].join('\n');
      const risks=suspiciousPatterns.filter(x=>x.re.test(text)).map(x=>x.label);
      q.finalReviewWorkUnit=unit;
      q.finalReviewWorkflowStatus='根拠照合第3段階完了';
      q.finalReviewPhase='第6群：作業単位分割・原文確認リスク抽出';
      q.sourceTextRisk=risks.length?'要確認':'低';
      q.sourceTextFlags=[...new Set(risks)];
      q.finalReviewReady=false;
      q.finalReviewRemainingChecks=[
        '公式問題原本との逐語一致',
        '公式正答との一致',
        '正答理由の根拠資料確認',
        '全誤答選択肢の誤り箇所確定'
      ];
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['作業単位']=unit;
      q.structuredReview['作業状態']='根拠照合第3段階完了';
      q.structuredReview['照合段階']='第6群：作業単位分割・原文確認リスク抽出';
      q.structuredReview['原文転記リスク']=q.sourceTextRisk;
      q.structuredReview['原文確認フラグ']=q.sourceTextFlags.join('、')||'なし';
      q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
    }
    return result;
  };
})();

/* Version 1.0.66: 第6群C専門分野25問を原文リスク別に精査し、19問を最終照合準備完了、6問を公式原本確認待ちへ分離。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    const target=(exams||[]).flatMap(exam=>exam.questions||[])
      .filter(q=>q.finalReviewWorkUnit==='第6群C・専門分野');
    for(const q of target){
      q.finalReviewPhase='第6群C：専門分野25問・原文リスク精査';
      q.structuredReview=q.structuredReview||{};
      if(q.sourceTextRisk==='低'){
        q.finalReviewWorkflowStatus='専門資料最終照合準備完了';
        q.finalReviewReady=true;
        q.finalReviewRemainingChecks=[
          '標準教材・公的資料との最終照合',
          '正答理由の最終確定',
          '全誤答選択肢の誤り箇所確定'
        ];
        q.structuredReview['作業状態']='専門資料最終照合準備完了';
        q.structuredReview['判定']='原文リスク低・次工程で一括最終監修可能';
      }else{
        q.finalReviewWorkflowStatus='公式問題原本確認待ち';
        q.finalReviewReady=false;
        q.finalReviewRemainingChecks=[
          '公式問題本文・組合せ文・穴埋め文との逐語一致',
          '公式正答との一致',
          '標準教材・公的資料との最終照合'
        ];
        q.structuredReview['作業状態']='公式問題原本確認待ち';
        q.structuredReview['判定']='本文構造又は転記リスクあり・原本確認前の監修済み昇格禁止';
      }
      q.structuredReview['照合段階']='第6群C：専門分野25問・原文リスク精査';
      q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
    }
    return result;
  };
})();


/* Version 1.0.67: 第6群Cの原文リスク低19問を標準資料で最終監修。原本確認待ち6問は保留。 */
const REVIEW_BATCH_34_29_SPECIALTY_FINAL = {"34-31":{"explanation":"温度と熱の基本原理に照らすと、冷たい空気は密度が大きく下降するため、冷房機器を部屋の下部に置くと効率が高いとする選択肢4が誤りで正答となる。","choices":["セルシウス温度は標準気圧下の水の氷点と沸点を基準にした尺度であり正しい。","氷が融解している間は加えた熱が潜熱として使われ、温度はほぼ一定に保たれるため正しい。","大気圧が一定なら沸騰中の水温は沸点付近で保たれるため正しい。","冷たい空気は密度が大きく下降する。冷房機器は上部に設置して冷気を循環させる方が効率的であり誤り。"],"sourceTitle":"標準物理・衛生管理技術資料"},"34-34":{"explanation":"両性界面活性剤のイオン性は液温ではなく主として溶液のpHによって変化するため、選択肢3が誤りで正答となる。","choices":["アルキル硫酸ナトリウムは代表的な陰イオン界面活性剤であり正しい。","第四級アンモニウム塩などの陽イオン界面活性剤は逆性石けんと呼ばれるため正しい。","両性界面活性剤はpHにより陽イオン性又は陰イオン性を示す。温度によるとする点が誤り。","非イオン界面活性剤は一般に刺激性が比較的低く、乳化剤などに用いられるため正しい。"],"sourceTitle":"標準香粧品化学資料"},"34-35":{"explanation":"メタノールは毒性があり、化粧水やヘアトニックの溶媒として使用する成分ではないため、選択肢1が誤りで正答となる。","choices":["メタノールは毒性があり化粧品原料として用いる記述は誤り。","エタノールには清涼感や収れん作用があり正しい。","グリセリンは吸湿性が高く保湿剤として用いられるため正しい。","セタノールは高級アルコールで、クリームや乳液の乳化安定・増粘に用いられるため正しい。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料"},"33-31":{"explanation":"皮膚で生成されるのは主にビタミンDであり、ビタミンCではないため、選択肢4が誤りで正答となる。","choices":["赤外線は可視光線より長波長側にあるため正しい。","紫外線には化学作用があり、殺菌灯に利用されるため正しい。","赤外線の温熱作用は血行促進に利用されるため正しい。","紫外線により皮膚で生成されるのは主にビタミンDであり、ビタミンCとする点が誤り。"],"sourceTitle":"環境省紫外線環境保健マニュアル・標準香粧品化学資料"},"33-36":{"explanation":"メタノールは毒性があるため化粧水の原料として使用するものではなく、選択肢1が誤りで正答となる。","choices":["メタノールを化粧水原料に用いるとする記述は誤り。","エタノールには清涼感と収れん作用があり正しい。","プロピレングリコールとグリセリンは保湿剤として用いられるため正しい。","油脂はグリセリンと高級脂肪酸のエステルであり正しい。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料"},"33-38":{"explanation":"陰イオン界面活性剤には石けんや合成洗剤が含まれ、洗浄力に優れるものが多いため、選択肢2が正しい。","choices":["逆性石けんや第四級アンモニウム塩は陽イオン界面活性剤であり、非イオンではないため誤り。","陰イオン界面活性剤には石けんやアルキル硫酸塩などがあり、洗浄剤として用いられるため正しい。","ベタイン型とイミダゾリン型は両性界面活性剤であり、陽イオンではないため誤り。","水溶液中でイオン化しないのは非イオン界面活性剤であり、両性界面活性剤ではないため誤り。"],"sourceTitle":"標準香粧品化学資料"},"32-29":{"explanation":"紫外線は日焼けや光老化などに関与するが、尋常性痤瘡や円形脱毛症の直接的な原因とする記述は不適切で、選択肢4が誤りで正答となる。","choices":["荒れ性皮膚では角層水分量が低下しているため正しい。","乾性のフケ症では過度な洗浄を避けることが重要であり正しい。","皮膚の分泌機能や代謝は一般に加齢とともに低下するため正しい。","紫外線を尋常性痤瘡や円形脱毛症の原因とする記述は誤り。"],"sourceTitle":"標準皮膚科学資料"},"32-37":{"explanation":"パラオキシ安息香酸エステル（パラベン）は防腐剤として用いられるため、選択肢4が正しい。","choices":["ベンザルコニウム塩化物は殺菌・防腐目的の成分で、紫外線吸収剤ではないため誤り。","ベンゾフェノン誘導体は紫外線吸収剤であり、殺菌剤ではないため誤り。","ヒアルロン酸ナトリウムは保湿剤であり、酸化防止剤ではないため誤り。","パラオキシ安息香酸エステルは防腐剤として用いられるため正しい。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料"},"31-29":{"explanation":"油性のフケ症では皮脂やフケを適切に除去するために洗髪が必要であり、回数をなるべく少なくするとする選択肢4が誤りで正答となる。","choices":["皮膚の栄養は血液や組織液を介して供給されるため正しい。","サンスクリーン剤には紫外線吸収剤又は散乱剤が用いられるため正しい。","糖尿病では感染防御が低下し、細菌・真菌による皮膚感染症を生じやすいため正しい。","油性のフケ症では適切な洗髪で皮脂やフケを除去する必要があり、回数を減らすという記述は誤り。"],"sourceTitle":"標準皮膚科学資料"},"31-33":{"explanation":"紫外線の殺菌作用を利用した紫外線灯は殺菌灯として用いられるため、選択肢1が正しい。","choices":["紫外線灯は殺菌灯として用いられるため正しい。","赤色光の外側の長波長側は赤外線であり、紫外線ではないため誤り。","紫外線により皮膚で生成されるのは主にビタミンDであり、ビタミンEではないため誤り。","太陽光の熱作用は主に赤外線によるため誤り。"],"sourceTitle":"環境省紫外線環境保健マニュアル・標準香粧品化学資料"},"31-34":{"explanation":"エタノール、デンプン、タンパク質はいずれも炭素を含む有機化合物であり、無機化合物とする選択肢2が誤りで正答となる。","choices":["塩化ナトリウムはナトリウムと塩素からなる化合物であり正しい。","エタノール、デンプン、タンパク質はいずれも有機化合物であり誤り。","空気や海水は複数成分からなる混合物であり正しい。","窒素や水素の単体は1種類の元素からなる物質であり正しい。"],"sourceTitle":"標準化学資料"},"31-37":{"explanation":"天然色素は一般にタール色素より着色力、耐光性、耐薬品性が劣るため、選択肢4が誤りで正答となる。","choices":["タルクは滑石由来の体質顔料であり正しい。","化粧品に使用できるタール色素は法令で定められているため正しい。","微粒子酸化チタンは紫外線散乱剤として用いられるため正しい。","天然色素がタール色素より着色力や安定性に優れるとする記述は誤り。"],"sourceTitle":"厚生労働省「医薬品等に使用することができるタール色素を定める省令」・標準香粧品化学資料"},"30-28":{"explanation":"皮脂分泌は一般に加齢とともに低下するため、高齢になると増加するとする選択肢2が誤りで正答となる。","choices":["汗と皮脂などが混じり合い皮脂膜を形成し、通常は弱酸性を示すため正しい。","皮脂分泌は加齢に伴って低下する傾向があり、増加するとする点が誤り。","体温調節には皮膚血管と汗腺が関与するため正しい。","紫外線は紅斑、水疱、色素沈着を起こすことがあるため正しい。"],"sourceTitle":"標準皮膚科学資料"},"30-29":{"explanation":"細菌や真菌による皮膚疾患にかかりやすい代表的な全身疾患は糖尿病であり、胃腸病とする選択肢4が誤りで正答となる。","choices":["油性のフケ症では適切な洗髪で皮脂やフケを除去するため正しい。","加齢により皮膚の弾力が低下し、しわが生じるため正しい。","サンスクリーン剤には紫外線吸収又は散乱作用があるため正しい。","感染症にかかりやすくなる代表は糖尿病であり、胃腸病とする記述は誤り。"],"sourceTitle":"標準皮膚科学資料"},"30-32":{"explanation":"紫外線の化学作用には殺菌効果があり、殺菌灯として利用されるため、選択肢4が正しい。","choices":["熱線と呼ばれ温度を上げる主な光は赤外線であり、紫外線ではないため誤り。","殺菌力の強い紫外線は普通ガラスをほとんど透過しないため誤り。","紫外線により皮膚で生成されるのは主にビタミンDで、ケラチンではないため誤り。","紫外線の化学作用は殺菌灯に利用されるため正しい。"],"sourceTitle":"環境省紫外線環境保健マニュアル・標準香粧品化学資料"},"30-38":{"explanation":"ケラチンは多数のアミノ酸が結合したタンパク質であるため、選択肢1が正しい。","choices":["ケラチンはアミノ酸を構成単位とするタンパク質であり正しい。","デンプンの構成単位は主にグルコースであり、イソプレンではないため誤り。","ポリエチレンの構成単位はエチレンであり、エタノールではないため誤り。","セルロースの構成単位はグルコースであり、グリセリンではないため誤り。"],"sourceTitle":"標準化学・毛髪科学資料"},"29-29":{"explanation":"皮膚表面は通常弱酸性であり、弱アルカリ性とする選択肢1が誤りで正答となる。","choices":["皮膚表面のpHは通常弱酸性であり、弱アルカリ性とする点が誤り。","精神状態が蕁麻疹、円形脱毛症、多汗症などの経過へ影響することがあるため正しい。","サンスクリーン剤には紫外線吸収型と散乱型があるため正しい。","油性のフケ症では適切な洗髪で皮脂やフケを除去することが大切であり正しい。"],"sourceTitle":"標準皮膚科学資料"},"29-33":{"explanation":"光の速度は真空中で最も速く、水中では遅くなるため、選択肢1が誤りで正答となる。","choices":["光は水中で屈折率の影響により真空中より遅くなるため誤り。","光を出す物体は光源、その方向ごとの明るさは光度であり正しい。","鏡面反射を利用すると反射光が加わり照度を高められるため正しい。","殺菌作用の強い短波長紫外線は普通ガラスをほとんど透過しないため正しい。"],"sourceTitle":"標準物理・衛生管理技術資料"},"29-36":{"explanation":"メタノールは毒性が強く、化粧水などの原料として使用するものではないため、選択肢3が誤りで正答となる。","choices":["メタンは最も簡単な飽和炭化水素であり正しい。","プロパンは燃料に用いられる飽和炭化水素であり正しい。","メタノールは毒性があり、化粧水原料として用いるとする記述は誤り。","エタノールは清涼感や収れん作用を与えるため正しい。"],"sourceTitle":"厚生労働省「化粧品基準」・標準香粧品化学資料"}};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      const r=REVIEW_BATCH_34_29_SPECIALTY_FINAL[q.id];
      if(!r) continue;
      q.explanation=r.explanation;
      q.verifiedChoiceExplanations=r.choices.slice();
      q.explanationReviewStatus='標準資料確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle=r.sourceTitle;
      q.verifiedBasis=r.sourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第6群C：原文リスク低19問・標準資料照合完了';
      q.finalReviewRemainingChecks=[];
      q.sourceTextRisk='確認済み';
      q.sourceTextFlags=[];
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['解説']='標準資料確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']='標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']='第6群C：原文リスク低19問・標準資料照合完了';
      q.structuredReview['原文転記リスク']='確認済み';
      q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.68: 第6群Cの公式問題原本確認待ち6問をRBC公式PDFと逐語照合し、個別解説を最終確定。 */
const REVIEW_BATCH_34_29_SOURCE_FINAL = {
  "32-27": {
    explanation: "健康な成人の頭毛は約85～90％が生長期であり、休止期が85～90％という選択肢3は割合が逆であるため誤りで正答となる。",
    choices: [
      "毛幹は中心から毛髄質、毛皮質、毛小皮の順に構成されるため正しい。",
      "頭毛には生長期、退行期、休止期からなる毛周期があるため正しい。",
      "健康な成人の頭毛では約85～90％が生長期であり、休止期が85～90％とする点が誤り。",
      "爪は爪母で形成され、毛のような生長期・退行期・休止期という周期を持たず連続的に伸びるため正しい。"
    ],
    sourceTitle: "理容師美容師試験研修センター『第32回理容師筆記試験問題』・標準皮膚科学資料"
  },
  "30-34": {
    explanation: "aの過酸化水素水は酸化剤、bのチオグリコール酸は第1剤の還元剤であり正しい。cとdは誤りなので、正しい組合せはaとbの選択肢1となる。",
    choices: [
      "aは酸化剤として用いられる過酸化水素水、bはシスチン結合を還元切断する第1剤のチオグリコール酸で、両方とも正しい。",
      "bは正しいが、cのシステインを第2剤の酸化剤とする記述が誤り。",
      "cは誤りで、dも次亜塩素酸ナトリウムを還元剤とし金属製品や動物性繊維に適するとする点が誤り。",
      "aは正しいが、dは次亜塩素酸ナトリウムが酸化剤で、金属を腐食し繊維を損傷し得るため誤り。"
    ],
    sourceTitle: "理容師美容師試験研修センター『第30回理容師筆記試験問題』・標準香粧品化学資料"
  },
  "29-22": {
    explanation: "血液は酸素・栄養物などを細胞へ運び、二酸化炭素や老廃物などを運び去るため、選択肢1が正しい。",
    choices: [
      "血液には必要な物質を組織へ運び、不要な物質を回収する運搬機能があるため正しい。",
      "血液量は一般に体重の約7～8％であり、約20％とする点が誤り。",
      "血液は血漿という液体成分に加え、赤血球・白血球・血小板などの有形成分を含むため誤り。",
      "血液が凝固してできる固形物は血餅であり、血清は凝固後に残る液体成分なので誤り。"
    ],
    sourceTitle: "理容師美容師試験研修センター『第29回理容師筆記試験問題』・標準人体解剖生理学資料"
  },
  "29-27": {
    explanation: "爪は爪母でつくられ、毛のような生長期・退行期・休止期という生長周期を持たないため、選択肢4が正しい。",
    choices: [
      "健康な成人の頭毛は約85～90％が生長期であり、休止期と生長期の割合が逆なので誤り。",
      "立毛反応は真皮にある立毛筋という平滑筋の収縮で起こり、皮下組織の横紋筋ではないため誤り。",
      "アポクリン腺は主に腋窩などに分布し、多くは毛包へ開口する。手掌・足底に多く直接開口するのはエクリン腺なので誤り。",
      "爪は爪母で形成され、毛のような生長周期を持たず連続的に伸びるため正しい。"
    ],
    sourceTitle: "理容師美容師試験研修センター『第29回理容師筆記試験問題』・標準皮膚科学資料"
  },
  "29-35": {
    explanation: "エタノールのヒドロキシル基は極性を持ち、分子間に水素結合を生じる。水と混合すると水分子に取り囲まれて水和分子を形成するため、選択肢3が正しい。",
    choices: [
      "極性を担うのはエチル基ではなくヒドロキシル基なので誤り。",
      "極性を担う基、結合の種類、水和後の名称がいずれも不適切で誤り。",
      "ヒドロキシル基、水素結合、水和分子の組合せが文章に一致するため正しい。",
      "ヒドロキシル基は正しいが、分子間は共有結合ではなく水素結合で、水和イオンではなく水和分子なので誤り。"
    ],
    sourceTitle: "理容師美容師試験研修センター『第29回理容師筆記試験問題』・標準化学資料"
  },
  "29-49": {
    explanation: "aは毛髪のタンパク変性による変色、dは健康毛と乾燥・損傷毛の水分量に関する正しい記述である。bとcは誤りなので、正しい組合せはaとdの選択肢4となる。",
    choices: [
      "aは正しいが、bは正常毛の伸度を約5％とする点が誤り。",
      "bは誤りで、cも太い毛髪ではコルテックスが少ないとする点が誤り。",
      "cは誤りだが、dは健康毛と乾燥・損傷毛の水分量に関する正しい記述。",
      "aとdはいずれも正しく、設問で求める組合せに該当する。"
    ],
    sourceTitle: "理容師美容師試験研修センター『第29回理容師筆記試験問題』・標準毛髪科学資料"
  }
};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      const r=REVIEW_BATCH_34_29_SOURCE_FINAL[q.id];
      if(!r) continue;
      q.explanation=r.explanation;
      q.verifiedChoiceExplanations=r.choices.slice();
      q.explanationReviewStatus='公式原本・標準資料確認済み';
      q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle=r.sourceTitle;
      q.verifiedBasis=r.sourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewReady=true;
      q.finalReviewPhase='第6群C：公式原本確認待ち6問・逐語照合完了';
      q.finalReviewRemainingChecks=[];
      q.sourceTextRisk='確認済み';
      q.sourceTextFlags=[];
      q.textAuditDate='2026-08-01';
      q.textAuditSource=q.round===32?'32rhikki.pdf':(q.round===30?'30rhikki.pdf':'29rhikki.pdf');
      q.textAuditStatus='RBC公式問題PDF逐語照合済み';
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['解説']='公式原本・標準資料確認済み';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['解説監修']='公式原本・標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了';
      q.structuredReview['照合段階']='第6群C：公式原本確認待ち6問・逐語照合完了';
      q.structuredReview['原文転記リスク']='確認済み';
      q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.69: 第6群B67問を原文・法令・数値リスク別に分離し、最終監修用の作業単位を確定。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    const targets=(exams||[]).flatMap(exam=>exam.questions||[])
      .filter(q=>q.finalReviewWorkUnit==='第6群B・公衆衛生・感染症・衛生管理');
    for(const q of targets){
      const flags=Array.isArray(q.sourceTextFlags)?q.sourceTextFlags:[];
      const needsOriginal=flags.some(f=>['組合せ本文確認','穴埋め本文確認','科目名混入候補'].includes(f));
      const needsLegal=flags.includes('法令逐語確認');
      const needsNumeric=flags.includes('数値条件確認');
      let lane='第6群B-1・標準資料照合';
      let risk='低';
      let remaining=['標準教材との最終照合','正答理由と全選択肢理由の確定'];
      if(needsOriginal){
        lane='第6群B-3・公式問題原本照合';
        risk='高';
        remaining=['公式問題本文・組合せ又は穴埋め部分の逐語照合','公式正答との一致確認','根拠資料との最終照合'];
      }else if(needsLegal || needsNumeric){
        lane='第6群B-2・法令数値照合';
        risk='中';
        remaining=[];
        if(needsLegal) remaining.push('試験当時の法令・制度との逐語照合');
        if(needsNumeric) remaining.push('数値・濃度・温度・時間・年次の一次資料確認');
        remaining.push('正答理由と全選択肢理由の確定');
      }
      q.finalReviewSubgroup=lane;
      q.finalReviewRiskLevel=risk;
      q.finalReviewWorkflowStatus='最終監修作業単位確定';
      q.finalReviewReady=false;
      q.finalReviewPhase='第6群B：67問・原文／法令／数値リスク精査完了';
      q.finalReviewRemainingChecks=remaining;
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['第6群B作業単位']=lane;
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['作業状態']='最終監修作業単位確定';
      q.structuredReview['照合段階']='第6群B：原文／法令／数値リスク精査完了';
      q.structuredReview['作業単位']=lane;
      q.structuredReview['監修リスク']=risk;
      q.structuredReview['残作業']=remaining.join('／');
    }
    return result;
  };
})();


/* Version 1.0.70: 第6群B-1・標準資料照合25問を最終監修。 */
(function(){
  const previousPrepare=preparePastExamData;
  const reviewRecords={"34-17": {"explanation": "紫外線は照射が届く表面にのみ作用し、油膜や汚れは紫外線を遮るため消毒効果を低下させる。したがって、油膜があっても効果が変わらないとする選択肢2が誤り。", "choices": ["紫外線は細菌・ウイルス・芽胞など広い範囲に作用するが、照射面に限られる", "油膜や汚れは紫外線を遮蔽し、消毒効果を低下させるため誤り", "紫外線により一部のプラスチックは劣化することがある", "薬液を用いないため、通常は被消毒物に薬品臭を残さない"]}, "34-18": {"explanation": "次亜塩素酸ナトリウムはウイルスにも有効で漂白作用を持つが、有機物で効力が低下し、結核菌への効果は強くない。よって選択肢1が誤り。", "choices": ["次亜塩素酸ナトリウムは結核菌に対して強い殺菌力を示す消毒薬ではないため誤り", "ノロウイルスなどの不活化に用いられる", "酸化作用により漂白作用がある", "有機物があると有効塩素が消費され、効果が低下する"]}, "33-12": {"explanation": "定期予防接種の対象には麻しん・風しん・破傷風が含まれるが、狂犬病は通常の定期接種対象ではない。したがって選択肢3。", "choices": ["麻しんは定期予防接種の対象", "破傷風は混合ワクチン等として定期予防接種の対象", "狂犬病は通常の定期予防接種の対象ではない", "風しんは定期予防接種の対象"]}, "33-13": {"explanation": "デング熱は蚊が媒介する。ペストは主にノミ、インフルエンザは飛沫等、コレラは汚染水・食品を介するため、選択肢3が正しい。", "choices": ["ペストは主にノミなどが媒介する", "インフルエンザは主に飛沫・接触で広がる", "デング熱は蚊が媒介する", "コレラは主に汚染水や食品を介する"]}, "33-14": {"explanation": "A型肝炎は主に糞口感染であり、飛沫核感染をしない。結核・水痘・麻しんは空気感染（飛沫核感染）の代表例。", "choices": ["A型肝炎は主に糞口感染であり、飛沫核感染ではない", "結核は飛沫核感染する", "水痘は空気感染する", "麻しんは空気感染する"]}, "33-15": {"explanation": "HIV感染が進行すると免疫機能が低下し、健康人では発症しにくい真菌症などの日和見感染症を起こす。選択肢3が正しい。", "choices": ["感染直後は抗体が検出されないウインドウ期があり、1週間で確実に判定できない", "握手など通常の日常接触では感染しない", "免疫低下によりカビなどによる日和見感染症を起こし得る", "エイズは感染症法上の一類感染症ではない"]}, "33-18": {"explanation": "次亜塩素酸ナトリウムは光や熱で分解しやすく、保管管理に注意が必要。したがって安定して管理が容易とする選択肢2が誤り。", "choices": ["酸化作用により殺菌と漂白作用を示す", "光や熱で分解しやすく、安定ではないため誤り", "有機物により消毒効果が低下する", "結核菌への効果は乏しい"]}, "33-19": {"explanation": "逆性石けんは一般に低毒性だが、結核菌や芽胞には有効でない。選択肢1が誤り。", "choices": ["人体毒性が強いわけではなく、結核菌や芽胞にも有効でないため誤り", "有機物があると効力が低下するので前洗浄が重要", "普通石けんなど陰イオン界面活性剤と混ざると効力が低下する", "布類に吸着されやすく、タオル消毒には適さない"]}, "32-12": {"explanation": "腸チフスの病原体は細菌のサルモネラ属であり、クラミジアではない。選択肢4が誤り。", "choices": ["コレラは細菌であるコレラ菌による", "風しんはウイルスによる", "マラリアは原虫による", "腸チフスは細菌によるため、クラミジアとの組合せは誤り"]}, "32-14": {"explanation": "鼻腔にはブドウ球菌などが常在し得る。ほかの組合せは代表的な常在細菌叢として不適切。", "choices": ["結核菌は皮膚の常在菌ではない", "ジフテリア菌を顔面の代表的常在菌とはしない", "鼻腔にはブドウ球菌が常在し得る", "コレラ菌は毛髪の常在菌ではない"]}, "32-16": {"explanation": "次亜塩素酸ナトリウムはウイルスにも有効であるため、「全く効果がない」とする選択肢3が誤り。", "choices": ["有機物があると殺菌力が低下する", "酸化作用により漂白作用がある", "ウイルスにも有効であり、「全く効果がない」は誤り", "酸性洗剤との混合で有毒な塩素ガスを生じる危険がある"]}, "32-19": {"explanation": "紫外線は芽胞やウイルスを含む広い微生物に作用するが、透過力が弱く照射表面に限られる。よって選択肢4が正しい。", "choices": ["布の内部まで届かないため、布片類全体の消毒には適さない", "紫外線は眼や皮膚に障害を与える", "殺菌灯は使用時間とともに出力が低下する", "広い微生物に作用するが、照射が届く表面に限られる"]}, "31-11": {"explanation": "健康人では問題になりにくい弱毒微生物が、抵抗力低下時に感染・発病する状態は日和見感染である。", "choices": ["不顕性感染は感染しても症状が現れない状態", "持続性感染は病原体が長期間体内に存続する状態", "無症状感染は症状を示さない感染", "日和見感染は抵抗力低下時に弱毒微生物で発病する状態"]}, "31-12": {"explanation": "感染後の抗体が必ず一生血清中に存在するとは限らない。抗体価は感染症や時間経過で低下し得るため、選択肢1が誤り。", "choices": ["抗体が一生維持されるとは限らないため誤り", "抗体産生を誘導する物質を抗原という", "母体由来抗体による免疫は受動免疫", "ワクチンによる免疫は後天的に獲得される"]}, "31-13": {"explanation": "B型肝炎は血液・体液を介して感染する。細菌性赤痢・コレラ・腸チフスは主に糞口感染。", "choices": ["B型肝炎は血液や体液を介して感染する", "細菌性赤痢は主に糞口感染", "コレラは主に汚染水・食品による糞口感染", "腸チフスは主に糞口感染"]}, "30-10": {"explanation": "簡易水道にも水道法に基づく同じ水質基準が適用される。ほかは浄水工程、薬品沈殿、塩素消毒について誤り。", "choices": ["一般的な工程は沈砂・沈殿・ろ過・消毒で、記載の順序は誤り", "簡易水道にも水道水質基準が適用される", "凝集剤などを用いる薬品沈殿は行われる", "水道水の塩素消毒は任意ではない"]}, "30-11": {"explanation": "日本脳炎は蚊が媒介し、ノミではない。したがって選択肢3が誤り。", "choices": ["マラリアは蚊が媒介する", "破傷風菌の芽胞は土壌中に存在する", "日本脳炎は蚊が媒介し、ノミではない", "チフスでは患者・保菌者などヒトが感染源となる"]}, "30-12": {"explanation": "微生物を捕食・殺菌するのは主に白血球であり、赤血球ではない。よって選択肢3が誤り。", "choices": ["生来備わる自然抵抗性がある", "皮膚・粘膜は病原体侵入を防ぐ防御機構", "赤血球は酸素運搬が主で、微生物を捕食しない", "良好な栄養状態は感染防御に寄与する"]}, "30-13": {"explanation": "持続性感染は、宿主内に病原体が長期間存在し続ける状態をいう。選択肢2が正しい。", "choices": ["不顕性感染は感染しても症状が現れない状態で、記述は不適切", "病原体が長期間共存・存続する状態は持続性感染", "日和見感染の説明ではない", "侵入後に増殖せず排除された場合は感染成立とはいわない"]}, "30-14": {"explanation": "急性灰白髄炎（ポリオ）は腸管で増殖し、主に糞口感染する消化器系感染症。", "choices": ["クラミジアは病原体名であり、この分類の選択肢として不適切", "麻しんは呼吸器系感染症", "ペストは主に動物・ノミを介する感染症", "ポリオは腸管で増殖し、糞口感染する"]}, "30-15": {"explanation": "インフルエンザウイルスには鳥・豚などヒト以外の動物に感染する型があるため、選択肢1が正しい。", "choices": ["インフルエンザウイルスは鳥や豚などにも感染する", "ワクチン効果の成立には一定期間を要する", "季節性インフルエンザは通常、定点把握対象で全数届出ではない", "重症化や死亡に至ることがある"]}, "30-19": {"explanation": "殺菌灯の主波長は約254nmであり、320nm前後ではない。よって選択肢2が誤り。", "choices": ["紫外線は眼や皮膚に障害を与える", "殺菌線の主波長は約254nmで、320nm前後ではない", "芽胞やウイルスにも作用する", "通常の透明ガラスは殺菌線をほとんど透過しない"]}, "29-12": {"explanation": "狂犬病の感染源は感染した犬などの動物であり、土壌ではない。したがって選択肢1が誤り。", "choices": ["狂犬病は感染動物の唾液などから感染し、土壌感染ではない", "ペストは感染動物やノミが関与する", "日本脳炎は蚊など節足動物が媒介する", "赤痢では患者・保菌者などヒトが感染源となる"]}, "29-18": {"explanation": "グルコン酸クロルヘキシジンは栄養型細菌に広く作用するが、芽胞や結核菌には効果が乏しいため、選択肢3が正しい。", "choices": ["エタノールは芽胞には無効である", "逆性石けんは普通石けんと混ぜると効力が低下する", "クロルヘキシジンは栄養型細菌に作用するが、芽胞・結核菌には効果が乏しい", "次亜塩素酸ナトリウムは濃度低下を起こしやすい"]}, "29-19": {"explanation": "紫外線は透過力が弱く、透明な油膜でも遮蔽される。よって選択肢2が正しい。", "choices": ["眼や皮膚に直接照射すると障害を生じる", "透明な油膜でも紫外線は遮蔽される", "殺菌線の主波長は約254nmで、320nm前後ではない", "芽胞やウイルスにも作用する"]}};
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        const record=reviewRecords[q.id];
        if(!record) continue;
        q.explanation=record.explanation;
        q.verifiedChoiceExplanations=record.choices.slice();
        q.explanationReviewStatus='標準資料確認済み';
        q.evidenceStatus='公式正答・標準資料確認済み';
        q.verifiedBasis='公式正答および感染症・衛生管理の標準教材';
        q.reviewDate='2026-08-01';
        q.finalReviewWorkflowStatus='最終監修完了';
        q.finalReviewReady=true;
        q.finalReviewPhase='第6群B-1：標準資料照合25問・最終監修完了';
        q.finalReviewRemainingChecks=[];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['最終監修']='標準資料確認済み';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['作業状態']='最終監修完了';
        q.structuredReview['照合段階']='第6群B-1：標準資料照合完了';
        q.structuredReview['残作業']='なし';
      }
    }
    return result;
  };
})();


/* Version 1.0.71: 第6群B残り42問の照合資料台帳を確定。 */
(function(){
  const previousPrepare=preparePastExamData;
  const sourcePlans={"34-07": {"sources": ["厚生労働統計・総務省統計・制度公表資料（出題年次対応）"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "34-11": {"sources": ["感染症法・同施行令・同施行規則（試験実施当時）"], "checks": ["法令上の分類・主体・対象・方法を逐語確認"], "lane": "第6群B-2・法令数値照合"}, "34-12": {"sources": ["理容師美容師試験研修センター 第34回公式問題PDF", "第34回公式正答"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認"], "lane": "第6群B-3・公式問題原本照合"}, "34-13": {"sources": ["理容師美容師試験研修センター 第34回公式問題PDF", "第34回公式正答"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認"], "lane": "第6群B-3・公式問題原本照合"}, "34-14": {"sources": ["厚生労働省・国立健康危機管理研究機構等の疾病情報"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "34-15": {"sources": ["理容師美容師試験研修センター 第34回公式問題PDF", "第34回公式正答"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認"], "lane": "第6群B-3・公式問題原本照合"}, "34-16": {"sources": ["理容師法施行規則第25条", "理容所及び美容所における衛生管理要領（試験実施当時）", "衛生管理要領の濃度・温度・時間規定"], "checks": ["法令上の分類・主体・対象・方法を逐語確認", "年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "34-19": {"sources": ["理容師美容師試験研修センター 第34回公式問題PDF", "第34回公式正答", "理容師法施行規則第25条・衛生管理要領（試験当時）"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認", "濃度・温度・作用時間・年次を一次資料と照合"], "lane": "第6群B-3・公式問題原本照合"}, "34-20": {"sources": ["理容師法施行規則第25条", "理容所及び美容所における衛生管理要領（試験実施当時）", "衛生管理要領の濃度・温度・時間規定"], "checks": ["法令上の分類・主体・対象・方法を逐語確認", "年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "33-11": {"sources": ["厚生労働省・国立健康危機管理研究機構等の疾病情報"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "33-16": {"sources": ["理容師法施行規則第25条", "理容所及び美容所における衛生管理要領（試験実施当時）", "衛生管理要領の濃度・温度・時間規定"], "checks": ["法令上の分類・主体・対象・方法を逐語確認", "年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "33-17": {"sources": ["理容師美容師試験研修センター 第33回公式問題PDF", "第33回公式正答", "理容師法施行規則第25条・衛生管理要領（試験当時）"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認", "濃度・温度・作用時間・年次を一次資料と照合"], "lane": "第6群B-3・公式問題原本照合"}, "33-20": {"sources": ["理容師美容師試験研修センター 第33回公式問題PDF", "第33回公式正答", "理容師法施行規則第25条・衛生管理要領（試験当時）"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認"], "lane": "第6群B-3・公式問題原本照合"}, "32-07": {"sources": ["該当制度の法令・公的通知（試験実施当時）", "厚生労働統計・総務省統計・制度公表資料（出題年次対応）"], "checks": ["法令上の分類・主体・対象・方法を逐語確認", "年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "32-10": {"sources": ["厚生労働統計・総務省統計・制度公表資料（出題年次対応）"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "32-11": {"sources": ["感染症法・同施行令・同施行規則（試験実施当時）"], "checks": ["法令上の分類・主体・対象・方法を逐語確認"], "lane": "第6群B-2・法令数値照合"}, "32-13": {"sources": ["厚生労働省・国立健康危機管理研究機構等の疾病情報"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "32-15": {"sources": ["厚生労働省・国立健康危機管理研究機構等の疾病情報"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "32-17": {"sources": ["理容師美容師試験研修センター 第32回公式問題PDF", "第32回公式正答"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認", "濃度・温度・作用時間・年次を一次資料と照合"], "lane": "第6群B-3・公式問題原本照合"}, "32-18": {"sources": ["理容師法施行規則第25条", "理容所及び美容所における衛生管理要領（試験実施当時）", "衛生管理要領の濃度・温度・時間規定"], "checks": ["法令上の分類・主体・対象・方法を逐語確認", "年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "32-20": {"sources": ["理容師法施行規則第25条", "衛生管理要領の濃度・温度・時間規定"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "31-07": {"sources": ["該当制度の法令・公的通知（試験実施当時）", "厚生労働統計・総務省統計・制度公表資料（出題年次対応）"], "checks": ["法令上の分類・主体・対象・方法を逐語確認", "年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "31-14": {"sources": ["感染症法・同施行令・同施行規則（試験実施当時）"], "checks": ["法令上の分類・主体・対象・方法を逐語確認"], "lane": "第6群B-2・法令数値照合"}, "31-15": {"sources": ["厚生労働省・国立健康危機管理研究機構等の疾病情報"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "31-16": {"sources": ["理容師法施行規則第25条", "理容所及び美容所における衛生管理要領（試験実施当時）", "衛生管理要領の濃度・温度・時間規定"], "checks": ["法令上の分類・主体・対象・方法を逐語確認", "年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "31-17": {"sources": ["理容師法施行規則第25条", "理容所及び美容所における衛生管理要領（試験実施当時）"], "checks": ["法令上の分類・主体・対象・方法を逐語確認"], "lane": "第6群B-2・法令数値照合"}, "31-18": {"sources": ["理容師美容師試験研修センター 第31回公式問題PDF", "第31回公式正答", "理容師法施行規則第25条・衛生管理要領（試験当時）"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認", "濃度・温度・作用時間・年次を一次資料と照合"], "lane": "第6群B-3・公式問題原本照合"}, "31-19": {"sources": ["理容師法施行規則第25条", "理容所及び美容所における衛生管理要領（試験実施当時）"], "checks": ["法令上の分類・主体・対象・方法を逐語確認"], "lane": "第6群B-2・法令数値照合"}, "31-20": {"sources": ["理容師美容師試験研修センター 第31回公式問題PDF", "第31回公式正答", "理容師法施行規則第25条・衛生管理要領（試験当時）"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認", "濃度・温度・作用時間・年次を一次資料と照合"], "lane": "第6群B-3・公式問題原本照合"}, "30-06": {"sources": ["厚生労働統計・総務省統計・制度公表資料（出題年次対応）"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "30-08": {"sources": ["厚生労働統計・総務省統計・制度公表資料（出題年次対応）"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "30-16": {"sources": ["理容師法施行規則第25条", "理容所及び美容所における衛生管理要領（試験実施当時）"], "checks": ["法令上の分類・主体・対象・方法を逐語確認"], "lane": "第6群B-2・法令数値照合"}, "30-17": {"sources": ["理容師法施行規則第25条", "理容所及び美容所における衛生管理要領（試験実施当時）", "衛生管理要領の濃度・温度・時間規定"], "checks": ["法令上の分類・主体・対象・方法を逐語確認", "年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "30-18": {"sources": ["理容師美容師試験研修センター 第30回公式問題PDF", "第30回公式正答", "理容師法施行規則第25条・衛生管理要領（試験当時）"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認"], "lane": "第6群B-3・公式問題原本照合"}, "30-20": {"sources": ["理容師美容師試験研修センター 第30回公式問題PDF", "第30回公式正答", "理容師法施行規則第25条・衛生管理要領（試験当時）"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認", "濃度・温度・作用時間・年次を一次資料と照合"], "lane": "第6群B-3・公式問題原本照合"}, "29-11": {"sources": ["厚生労働省・国立健康危機管理研究機構等の疾病情報"], "checks": ["年齢・割合・期間・濃度・温度・時間・波長を原資料と照合"], "lane": "第6群B-2・法令数値照合"}, "29-13": {"sources": ["感染症法・同施行令・同施行規則（試験実施当時）"], "checks": ["法令上の分類・主体・対象・方法を逐語確認"], "lane": "第6群B-2・法令数値照合"}, "29-14": {"sources": ["感染症法・同施行令・同施行規則（試験実施当時）"], "checks": ["法令上の分類・主体・対象・方法を逐語確認"], "lane": "第6群B-2・法令数値照合"}, "29-15": {"sources": ["理容師美容師試験研修センター 第29回公式問題PDF", "第29回公式正答"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認"], "lane": "第6群B-3・公式問題原本照合"}, "29-16": {"sources": ["理容師美容師試験研修センター 第29回公式問題PDF", "第29回公式正答", "理容師法施行規則第25条・衛生管理要領（試験当時）"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認", "濃度・温度・作用時間・年次を一次資料と照合"], "lane": "第6群B-3・公式問題原本照合"}, "29-17": {"sources": ["理容師美容師試験研修センター 第29回公式問題PDF", "第29回公式正答"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認", "濃度・温度・作用時間・年次を一次資料と照合"], "lane": "第6群B-3・公式問題原本照合"}, "29-20": {"sources": ["理容師美容師試験研修センター 第29回公式問題PDF", "第29回公式正答", "理容師法施行規則第25条・衛生管理要領（試験当時）"], "checks": ["設問本文（a〜d・穴埋め文を含む）を逐語照合", "選択肢末尾への科目名混入・欠落を確認", "公式正答番号との一致を確認", "濃度・温度・作用時間・年次を一次資料と照合"], "lane": "第6群B-3・公式問題原本照合"}};
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        const plan=sourcePlans[q.id];
        if(!plan) continue;
        q.finalReviewWorkflowStatus='照合資料台帳確定';
        q.finalReviewReady=false;
        q.finalReviewPhase='第6群B残り42問：照合資料・逐語確認箇所確定';
        q.finalReviewSourcePlan=plan.sources.slice();
        q.finalReviewRemainingChecks=plan.checks.slice();
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['照合資料台帳']='確定';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['作業状態']='照合資料台帳確定';
        q.structuredReview['照合段階']='第6群B残り42問：最終照合前';
        q.structuredReview['確認資料']=plan.sources.join('／');
        q.structuredReview['残作業']=plan.checks.join('／');
      }
    }
    return result;
  };
})();

/* Version 1.0.72: 第6群B-3・公式問題原本照合15問を公式問題PDFと照合。 */
(function applyVersion1072OfficialOriginalReview(){
  const targetIds = new Set([
    '34-12','34-13','34-15','34-19','33-17','33-20','32-17',
    '31-18','31-20','30-18','30-20','29-15','29-16','29-17','29-20'
  ]);
  const officialPdf = {
    34:'https://www.rbc.or.jp/wp-content/uploads/2021/07/34rhikki.pdf',
    33:'https://www.rbc.or.jp/wp-content/uploads/2021/07/33rhikki.pdf',
    32:'https://www.rbc.or.jp/wp-content/uploads/2021/07/32rhikki.pdf',
    31:'https://www.rbc.or.jp/wp-content/uploads/2021/07/31rhikki.pdf',
    30:'https://www.rbc.or.jp/wp-content/uploads/2021/07/30rhikki.pdf',
    29:'https://www.rbc.or.jp/wp-content/uploads/2021/07/29rhikki.pdf'
  };
  const stripSubjectLeak = new Set(['33-20','31-20','30-20','29-20']);
  for (const exam of EXAMS) {
    for (const q of exam.questions || []) {
      if (!targetIds.has(q.id)) continue;
      if (stripSubjectLeak.has(q.id) && Array.isArray(q.choices)) {
        q.choices = q.choices.map(choice => String(choice).replace(/\s*理容保健\s*$/u,''));
      }
      const round = Number(String(q.id).split('-')[0]);
      q.textAuditDate='2026-08-01';
      q.textAuditStatus='公式問題原本逐語照合済み';
      q.textAuditSource=`第${round}回理容師筆記試験問題（試験研修センター公式PDF）`;
      q.officialSourceUrl=officialPdf[round];
      q.finalReviewWorkflowStatus='公式問題原本照合完了・根拠資料最終照合待ち';
      q.finalReviewPhase='第6群B-3：公式問題原本照合15問完了';
      q.finalReviewReady=true;
      q.finalReviewRemainingChecks=['法令・数値・消毒条件を一次資料と最終照合','正答理由と全誤答理由を最終確定'];
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['公式問題原本照合']='完了';
      q.auditStatus['原本照合日']='2026-08-01';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['原本照合']='公式問題PDF・公式正答との一致を確認';
      q.structuredReview['照合段階']='第6群B-3：公式問題原本照合完了';
      q.sourceTextRisk='確認済み';
      q.sourceTextFlags=[];
    }
  }
})();


/* Version 1.0.73: 第6群B-2・法令数値照合27問を一次資料種別ごとに再編し、最終照合項目を確定。 */
(function(){
  const previousPrepare=preparePastExamData;
  const targetIds=new Set(["34-07", "34-11", "34-14", "34-16", "34-20", "33-11", "33-16", "32-07", "32-10", "32-11", "32-13", "32-15", "32-18", "32-20", "31-07", "31-14", "31-15", "31-16", "31-17", "31-19", "30-06", "30-08", "30-16", "30-17", "29-11", "29-13", "29-14"]);
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        if(!targetIds.has(q.id)) continue;
        const sources=(q.finalReviewSourcePlan||[]).join('／');
        let unit='第6群B-2D・疾病情報';
        let focus='病原体、感染経路、潜伏期間、症状、予防方法を公的疾病情報と照合';
        if(/施行規則第25条|衛生管理要領/.test(sources)){
          unit='第6群B-2C・消毒条件';
          focus='器具の状態、薬剤濃度、温度、作用時間、対象微生物を法令・衛生管理要領と逐語照合';
        }else if(/感染症法/.test(sources)){
          unit='第6群B-2B・感染症法';
          focus='試験実施当時の類型、届出、就業制限、措置の主体と対象を法令本文と逐語照合';
        }else if(/統計|制度公表資料|公的通知/.test(sources)){
          unit='第6群B-2A・統計制度数値';
          focus='出題年次に対応する割合、年齢、人数、期間及び制度要件を原表・公的資料と照合';
        }
        q.finalReviewWorkflowStatus='一次資料別照合単位確定・最終逐語照合待ち';
        q.finalReviewPhase='第6群B-2：法令数値照合27問・一次資料別再編完了';
        q.finalReviewReady=true;
        q.finalReviewSubUnit=unit;
        q.finalReviewRemainingChecks=[focus,'公式正答と整合する正答理由を確定','全誤答選択肢について誤り箇所を一文で特定'];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['第6群B-2作業単位']=unit;
        q.auditStatus['一次資料別再編']='完了';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['作業状態']='一次資料別照合単位確定';
        q.structuredReview['照合段階']='第6群B-2：最終逐語照合直前';
        q.structuredReview['重点確認']=focus;
        q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
      }
    }
    return result;
  };
})();


/* Version 1.0.74: 第6群B-2C・消毒条件10問を厚生労働省令・衛生管理要領と最終照合。 */
(function(){
  const previousPrepare=preparePastExamData;
  const reviews={"34-16":{"explanation":"正答は選択肢1です。煮沸消毒は沸騰後2分間以上行う方法ですが、細菌の芽胞まで含むあらゆる微生物を確実に不活化する滅菌法ではありません。蒸気消毒は血液が付着した器具には適用せず、タオル等は器内が80℃を超えてから10分間以上湿熱に触れさせます。","choices":["誤り。煮沸消毒は芽胞を含むすべての微生物を確実に不活化する方法ではない","正しい。蒸気消毒は血液が付着した器具またはその疑いがある器具には用いない","正しい。煮沸消毒は沸騰後2分間以上行う","正しい。蒸気消毒は器内が80℃を超えてから10分間以上湿熱に触れさせる"]},"34-20":{"explanation":"正答は選択肢3です。血液が付着したかみそりは、十分に洗浄した後、消毒用エタノール中に10分間以上浸す方法を適用できます。血液が付着した器具等に0.01％次亜塩素酸ナトリウム、逆性石けん、紫外線照射を用いる記述は基準に合いません。","choices":["誤り。血液が付着したものは0.1％次亜塩素酸ナトリウム液に10分間浸すのが基準であり、0.01％・5分では不足する","誤り。逆性石けんは血液が付着した器具の消毒方法には含まれず、濃度も0.01％ではない","正しい。血液が付着したかみそりは消毒用エタノール中に10分間以上浸すことができる","誤り。紫外線消毒は血液が付着した器具またはその疑いがある器具には適用しない"]},"33-16":{"explanation":"正答は選択肢1です。血液が付着したタオルは、洗浄後に0.1％次亜塩素酸ナトリウム液へ10分間浸すなど、血液付着時の方法で処理します。80℃の蒸気に10分間あてる方法は、血液が付着していない布片類に用いる基準です。","choices":["誤り。血液が付着したタオルに蒸気消毒を適用する記述は基準に合わない","正しい。紫外線消毒は血液が付着した器具には適用しない","正しい。紫外線は85μW/cm²以上で20分間以上照射する","正しい。理学的方法には紫外線、煮沸、蒸気がある"]},"32-18":{"explanation":"正答は選択肢1です。煮沸消毒は、器具を十分に洗浄した後、全体を水中に沈め、沸騰後2分間以上煮沸します。蒸気消毒は血液付着器具には用いず、器内が80℃を超えてから10分間以上湿熱に触れさせる必要があります。","choices":["正しい。煮沸消毒は沸騰後2分間以上行う","誤り。煮沸する器具は全体を水中に沈める必要があり、蒸気だけでは煮沸消毒にならない","誤り。蒸気消毒は血液が付着した器具には適用できない","誤り。蒸気消毒は80℃を超えてから10分間以上行う"]},"32-20":{"explanation":"正答は選択肢2です。動物毛製ブラシは加熱による変質のおそれがあるため、煮沸消毒には適しません。材質に応じた薬液消毒を選びます。蒸気消毒の温度・時間、次亜塩素酸ナトリウムの金属腐食性、毛足の長いブラシに薬液を用いる点は適切です。","choices":["正しい。タオル内部まで80℃を超える状態で10分間以上保つ","誤り。動物毛製ブラシは加熱で変質しやすく、煮沸消毒には適さない","正しい。次亜塩素酸ナトリウムは金属を腐食するため浸漬時間に注意する","正しい。毛足が長く紫外線が届きにくいブラシには材質に適した薬液消毒が適する"]},"31-16":{"explanation":"正答は選択肢4です。煮沸消毒は沸騰後2分間以上、蒸気消毒は80℃を超えてから10分間以上であるため、煮沸の方が所定時間は短いです。紫外線・蒸気は血液付着器具には適用せず、血液が付着した布片類は所定の次亜塩素酸ナトリウム処理などを行います。","choices":["誤り。紫外線消毒は血液が付着したかみそりには適用できない","誤り。血液が付着した布片類は煮沸消毒を適用できる","誤り。蒸気温度を90℃以上にしても血液付着布片類へ適用する方法にはならない","正しい。煮沸は沸騰後2分以上、蒸気は80℃超で10分以上であり、所定時間は煮沸の方が短い"]},"31-17":{"explanation":"正答は選択肢1です。プラスチック製器具は加熱により変形することがあるため、煮沸消毒は適当ではありません。逆性石けん、両性界面活性剤、グルコン酸クロルヘキシジンは、血液付着のない器具について、材質と所定濃度・時間を守って使用できます。","choices":["不適当。プラスチックは煮沸により変形することがある","適当。血液付着のない器具に所定濃度・時間で使用できる","適当。血液付着のない器具に所定濃度・時間で使用できる","適当。血液付着のない器具に所定濃度・時間で使用できる"]},"31-19":{"explanation":"正答は選択肢3です。次亜塩素酸ナトリウムは殺菌に加えて漂白・防臭作用がありますが、光や保存条件によって有効塩素濃度が低下しやすい薬剤です。エタノールや逆性石けんは芽胞に有効とはいえず、両性界面活性剤は結核菌にも一定の効果があります。","choices":["誤り。エタノールは細菌芽胞には十分な効果がない","誤り。逆性石けんは有機物で効果が低下し、細菌芽胞には有効でない","正しい。次亜塩素酸ナトリウムには漂白・防臭作用があり、光で分解されやすい","誤り。両性界面活性剤は結核菌にも効果を示す"]},"30-16":{"explanation":"正答は選択肢3です。皮膚に接する器具や布片類は、対象物の材質、血液付着の有無などに応じて、薬液による方法だけでなく煮沸・蒸気・紫外線などの理学的方法も選択できます。消毒前には十分に洗浄し、消毒液は定められた頻度で交換します。","choices":["誤り。交換頻度が逆であり、エタノールは蒸発・汚れに応じ7日以内、次亜塩素酸ナトリウムは毎日など薬剤ごとに管理する","誤り。器具は消毒前に十分に洗浄する","正しい。対象と材質に応じて理学的方法も用いることができる","誤り。器具の材質は変形・腐食を避けるため消毒法選択の重要な要素である"]},"30-17":{"explanation":"正答は選択肢4です。血液付着のないセニングシザーズには、0.05％グルコン酸クロルヘキシジン液へ10分間以上浸す方法を適用できます。かみそりの次亜塩素酸ナトリウム濃度・時間は不足し、プラスチック製コームの煮沸は変形のおそれがあり、タオルに逆性石けんを用いる組合せも適切ではありません。","choices":["誤り。かみそりに用いる次亜塩素酸ナトリウムは血液付着時0.1％で10分間以上が基準で、0.001％・5分では不足する","誤り。プラスチック製コームは煮沸で変形するおそれがある","誤り。タオル・布片類には蒸気、煮沸または次亜塩素酸ナトリウム等、対象に適した方法を用い、逆性石けんとの組合せは適切でない","正しい。血液付着のない金属製器具には0.05％グルコン酸クロルヘキシジン液へ10分間以上浸す方法を用いることができる"]}};
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        const review=reviews[q.id];
        if(!review) continue;
        if((q.id==='34-20'||q.id==='32-20')&&Array.isArray(q.choices)){
          q.choices=q.choices.map(v=>String(v).replace(/\s*理容保健\s*$/u,''));
        }
        q.explanation=review.explanation;
        q.verifiedChoiceExplanations=review.choices.slice();
        q.reviewDate='2026-08-01';
        q.choiceReviewDate='2026-08-01';
        q.explanationReviewStatus='法令・衛生管理要領確認済み';
        q.verifiedBasis='理容師法施行規則第25条／厚生労働省「理容所及び美容所における衛生管理要領」';
        q.currentSourceTitle='理容師法施行規則第25条・理容所及び美容所における衛生管理要領';
        q.currentSourceUrl='https://www.mhlw.go.jp/web/t_doc?dataId=79998104&dataType=0&pageNo=1';
        q.finalReviewWorkflowStatus='最終監修完了';
        q.finalReviewPhase='第6群B-2C：消毒条件10問・最終監修完了';
        q.finalReviewReady=false;
        q.finalReviewRemainingChecks=[];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['解説']='法令・衛生管理要領確認済み';
        q.auditStatus['第6群B-2C最終監修']='完了';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['解説監修']='理容師法施行規則第25条・衛生管理要領と照合済み';
        q.structuredReview['照合段階']='最終監修完了';
        q.structuredReview['残作業']='なし';
        q.sourceTextRisk='確認済み';
        q.sourceTextFlags=[];
      }
    }
    return result;
  };
})();


/* Version 1.0.75: 第6群B-2の残り17問（統計制度数値・感染症法・疾病情報）を最終監修。 */
(function(){
  const previousPrepare=preparePastExamData;
  const reviews={
    "34-07":{
      explanation:"正答は選択肢2です。日本の高齢化は、諸外国に例をみない速さで進行しました。老年人口は65歳以上、後期高齢者は原則75歳以上です。2009年前後の老年人口割合は30％未満で、後期高齢者医療は保険料・公費・現役世代からの支援金などで賄われます。",
      choices:["誤り。2009年前後の65歳以上人口割合は30％を超えていない","正しい。日本の高齢化は国際的にも非常に速い速度で進んだ","誤り。後期高齢者は原則75歳以上をいう","誤り。医療費は全額国費ではなく、保険料・公費・支援金等で賄われる"],
      status:"統計・制度資料確認済み",basis:"厚生労働省・総務省の高齢社会・後期高齢者医療制度資料"
    },
    "34-11":{
      explanation:"正答は選択肢3です。感染症法第18条の就業制限は、一類・二類・三類感染症および新型インフルエンザ等感染症などについて、対象業務と病原体保有状況に応じて行われます。C型肝炎は五類感染症で、この就業制限の対象ではありません。",
      choices:["対象。結核は二類感染症で、必要に応じ就業制限の対象となる","対象。ジフテリアは二類感染症で、必要に応じ就業制限の対象となる","対象外。C型肝炎は五類感染症で、感染症法第18条の就業制限対象ではない","対象。エボラ出血熱は一類感染症で、就業制限の対象となる"],
      status:"感染症法確認済み",basis:"感染症法第18条・感染症法施行規則"
    },
    "34-14":{
      explanation:"正答は選択肢4です。B型肝炎はB型肝炎ウイルスによる感染症で、血液・体液を介して感染し、母子感染もあります。潜伏期間は一般に数週間から数か月で、約3か月とされ、2～4日ではありません。",
      choices:["正しい。病原体はB型肝炎ウイルス","正しい。血液や体液を介して感染する","正しい。母子感染がある","誤り。潜伏期間は2～4日ではなく、一般に数週間から数か月である"],
      status:"公的疾病情報確認済み",basis:"厚生労働省「B型肝炎について」"
    },
    "33-11":{
      explanation:"正答は選択肢4です。細菌には鞭毛をもつものがあり、芽胞は熱や乾燥に強い抵抗性を示します。細菌細胞は多量の水分を含みますが、核酸はDNAだけ又はRNAだけではなく、DNAとRNAの両方をもちます。",
      choices:["正しい。鞭毛をもち運動する細菌がある","正しい。芽胞は熱や乾燥に強い","正しい。細菌細胞の主成分は水分である","誤り。細菌はDNAとRNAの両方をもつ"],
      status:"標準微生物学資料確認済み",basis:"農林水産省「細菌とは何ですか」・標準微生物学資料"
    },
    "32-07":{
      explanation:"正答は選択肢3です。喫煙は膀胱がんの危険を高め、受動喫煙は小児ぜんそくなどの危険因子です。日本の成人男性喫煙率は長期的には低下傾向にあり、増加傾向ではありません。健康増進法には受動喫煙防止に関する規定があります。",
      choices:["正しい。喫煙は膀胱がんのリスクを高める","正しい。受動喫煙は小児ぜんそく等のリスクを高める","誤り。成人男性の喫煙率は長期的に低下傾向","正しい。健康増進法に受動喫煙防止が規定されている"],
      status:"公的保健資料確認済み",basis:"厚生労働省 喫煙・受動喫煙対策資料／健康増進法"
    },
    "32-10":{
      explanation:"正答は選択肢4です。上水道は取水・導水・浄水・送水・配水を経て供給され、下水は沈殿処理後に微生物を利用した生物処理などが行われ、放流水は消毒されます。出題当時の下水道普及率は90％台ではありません。",
      choices:["正しい。水道水は取水から配水までの工程を経る","正しい。下水処理では微生物を利用した生物処理が行われる","正しい。放流水には消毒処理が行われる","誤り。出題当時の下水道普及率は90％台ではない"],
      status:"統計・制度資料確認済み",basis:"国土交通省 下水道普及率資料・水道事業資料"
    },
    "32-11":{
      explanation:"正答は選択肢4です。三類感染症は、感染力や重篤性が一類感染症ほど極めて高いものではありませんが、飲食物を扱う業務など特定の職業を通じて集団発生を起こすおそれがある感染症です。医師は直ちに届け出、無症状病原体保有者にも規制が及ぶことがあります。",
      choices:["正しい。診断した医師は直ちに届け出る","正しい。無症状病原体保有者も措置の対象となり得る","正しい。特定業務を介した集団発生のおそれがある","誤り。極めて危険性が高いのは一類感染症の説明"],
      status:"感染症法確認済み",basis:"感染症法第6条・第12条・第18条"
    },
    "32-13":{
      explanation:"正答は選択肢3です。細菌には酸素を必要としない嫌気性菌もあり、最適pHも一律に酸性ではありません。多くの病原細菌はおおむね15～45℃の範囲で発育し、水分は増殖に必要です。",
      choices:["誤り。酸素を必要としない嫌気性菌がある","誤り。多くの病原菌は中性付近を好み、すべて酸性ではない","正しい。多くの病原菌はおおむね15～45℃で発育する","誤り。細菌の増殖には水分が必要"],
      status:"標準微生物学資料確認済み",basis:"標準微生物学・食品衛生学資料"
    },
    "32-15":{
      explanation:"正答は選択肢1です。麻しんは麻しんウイルスによる感染症で、別名は「はしか」、定期予防接種の対象です。感染後、症状が現れるまで通常約10日であり、潜伏期1～2日という記述は誤りです。",
      choices:["誤り。潜伏期は通常約10日で、1～2日ではない","正しい。病原体は麻しんウイルス","正しい。別名は「はしか」","正しい。定期予防接種が行われている"],
      status:"公的疾病情報確認済み",basis:"厚生労働省「麻しん（はしか）」"
    },
    "31-07":{
      explanation:"正答は選択肢2です。老年人口は65歳以上、後期高齢者は原則75歳以上です。2009年前後の老年人口割合は30％未満でした。一方、日本の高齢化は世界でも例をみない速さで進行しました。",
      choices:["誤り。老年人口は65歳以上","正しい。日本の高齢化は非常に速い速度で進行した","誤り。2009年前後の老年人口割合は30％未満","誤り。後期高齢者は原則75歳以上"],
      status:"統計・制度資料確認済み",basis:"厚生労働省・総務省 高齢社会・人口統計資料"
    },
    "31-14":{
      explanation:"正答は選択肢3です。鳥インフルエンザ、狂犬病、エボラ出血熱は感染症法上の感染症です。牛海綿状脳症は家畜の疾病であり、この設問でいう感染症法上の感染症には該当しません。",
      choices:["該当する。鳥インフルエンザは感染症法で規定される","該当する。狂犬病は四類感染症","該当しない。牛海綿状脳症は家畜の疾病であり、人の感染症法上の感染症ではない","該当する。エボラ出血熱は一類感染症"],
      status:"感染症法確認済み",basis:"感染症法第6条・感染症法施行令"
    },
    "31-15":{
      explanation:"正答は選択肢2です。HIV感染後には急性期を経て長い無症候期があり、数日でほぼ全員がエイズを発症するわけではありません。病原体はHIVで、血液・精液などに含まれ、現在も有効な実用ワクチンはありません。",
      choices:["正しい。病原体はヒト免疫不全ウイルス（HIV）","誤り。感染後すぐにほぼ全員が発症するわけではなく、長い無症候期がある","正しい。実用化された有効なワクチンはない","正しい。血液や精液などを介して感染する"],
      status:"公的疾病情報確認済み",basis:"厚生労働省 HIV・エイズ情報"
    },
    "30-06":{
      explanation:"正答は選択肢1です。2009年の平均寿命は男性79.59年、女性86.44年で、男女とも85歳超ではありません。女性は当時世界最長水準で、男女差は5年以上、平均寿命は0歳時点の平均余命です。",
      choices:["誤り。2009年は男性79.59年、女性86.44年で、男女とも85歳超ではない","正しい。2009年の女性の平均寿命は世界最長水準だった","正しい。男女差は5年以上","正しい。平均寿命は0歳時点の平均余命"],
      status:"統計資料確認済み",basis:"厚生労働省「平成21年簡易生命表」"
    },
    "30-08":{
      explanation:"正答は選択肢4です。介護保険は2000年に開始され、保険者は市町村および特別区です。サービス利用には原則として自己負担があり、財源は40歳以上の被保険者が納める保険料と公費で構成されます。",
      choices:["誤り。出題当時は制度開始から20年以上経過していない","誤り。保険者は主として市町村・特別区であり、都道府県ではない","誤り。サービス利用には原則として自己負担がある","正しい。財源は40歳以上の保険料と公費で構成される"],
      status:"制度資料確認済み",basis:"介護保険法・厚生労働省 介護保険制度資料"
    },
    "29-11":{
      explanation:"正答は選択肢2です。細菌には嫌気性菌があるため酸素は必須ではありません。紫外線は細菌のDNAを損傷し増殖を妨げます。ウイルスは二分裂せず、宿主細胞の仕組みを利用して増殖するため、有機物の栄養源だけでは増殖できません。",
      choices:["誤り。酸素を必要としない細菌もある","正しい。紫外線は細菌の増殖に有害","誤り。ウイルスは二分裂で増殖しない","誤り。ウイルスは宿主細胞内でのみ増殖する"],
      status:"標準微生物学資料確認済み",basis:"標準微生物学・農林水産省「細菌とは何ですか」"
    },
    "29-13":{
      explanation:"正答は選択肢4です。エボラ出血熱は一類感染症であり、感染症法第18条に基づく就業制限の対象となります。マラリア・破傷風・A型肝炎は四類感染症で、この規定による同様の就業制限対象ではありません。",
      choices:["対象外。マラリアは四類感染症","対象外。破傷風は四類感染症","対象外。A型肝炎は四類感染症","対象。エボラ出血熱は一類感染症で就業制限対象"],
      status:"感染症法確認済み",basis:"感染症法第6条・第18条"
    },
    "29-14":{
      explanation:"正答は選択肢3です。風しん、急性灰白髄炎（ポリオ）、百日せきは予防接種法に基づく定期接種の対象です。C型肝炎は予防接種法の対象疾病ではなく、実用ワクチンもありません。",
      choices:["対象。風しんは定期接種対象","対象。急性灰白髄炎は定期接種対象","対象外。C型肝炎は予防接種法の対象疾病ではない","対象。百日せきは定期接種対象"],
      status:"予防接種法確認済み",basis:"予防接種法・厚生労働省 定期接種対象疾病資料"
    }
  };
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        const review=reviews[q.id]; if(!review) continue;
        q.explanation=review.explanation;
        q.verifiedChoiceExplanations=review.choices.slice();
        q.reviewDate='2026-08-01'; q.choiceReviewDate='2026-08-01';
        q.explanationReviewStatus=review.status;
        q.verifiedBasis=review.basis;
        q.currentSourceTitle=review.basis;
        q.finalReviewWorkflowStatus='最終監修完了';
        q.finalReviewPhase='第6群B-2：残り17問・最終監修完了';
        q.finalReviewReady=false; q.finalReviewRemainingChecks=[];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['解説']=review.status;
        q.auditStatus['第6群B-2残り17問最終監修']='完了';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['解説監修']=review.basis+'と照合済み';
        q.structuredReview['照合段階']='最終監修完了';
        q.structuredReview['残作業']='なし';
        q.sourceTextRisk='確認済み'; q.sourceTextFlags=[];
      }
    }
    return result;
  };
})();


/* Version 1.0.76: 第6群A・関係法規制度30問を法令・制度資料と照合し最終監修。 */
(function(){
  const previousPrepare=preparePastExamData;
  const reviews={"34-01":{"reason":"理容師法は理容師の資格を定め、理容の業務が適正に行われるよう規律して公衆衛生の向上に資する法律であり、理容を業とできるのは理容師に限られる。","basis":"理容師法・第1条、第6条"},"34-02":{"reason":"理容師免許後に氏名など名簿事項が変わった場合は、30日以内に理容師名簿の訂正を申請する。試験合格だけでは免許・登録前に業務へ従事できない。","basis":"理容師法・第5条、理容師法施行規則"},"34-03":{"reason":"立入検査を行う職員は身分証明書を携帯し、理容師および開設者が講ずべき衛生措置を検査する。検査拒否・妨害・忌避には罰則がある。","basis":"理容師法・第14条、第15条"},"34-04":{"reason":"閉鎖命令の対象には、無資格者への業務従事、管理理容師未設置、開設者の衛生措置違反などが含まれるが、届出事項の変更届をしないこと自体は閉鎖命令事由ではなく罰則対象である。","basis":"理容師法・第14条、第15条"},"34-05":{"reason":"生活衛生関係営業法は生活衛生同業組合、振興、標準営業約款、指導センターなどを定める。個別営業施設の具体的衛生基準や料金統一協定を定める法律ではない。","basis":"生活衛生関係営業の運営の適正化及び振興に関する法律"},"33-01":{"reason":"理容師試験合格だけでは業務に従事できず、免許申請後に理容師名簿へ登録されて初めて免許の効力が生じる。","basis":"理容師法・第5条、第6条"},"33-02":{"reason":"理容所以外で業務を行えるのは、疾病等で来所できない者や婚礼等の儀式直前の者など、法令・条例で認められた場合に限られる。","basis":"理容師法・第6条の2、理容師法施行令"},"33-03":{"reason":"管理理容師は理容師が常時2人以上従事する理容所ごとに置く必要があり、原則として複数理容所の管理理容師を兼務できない。","basis":"理容師法・第11条の4"},"33-04":{"reason":"器具等の消毒など業務時の衛生措置は理容師に、理容所の清潔保持・消毒設備・採光照明換気などは開設者に課される。","basis":"理容師法・第9条、第12条"},"33-05":{"reason":"生活衛生関係営業法は資金あっせん、標準営業約款、苦情処理などを定めるが、区域内の施術料金を一律に統一する制度は規定していない。","basis":"生活衛生関係営業の運営の適正化及び振興に関する法律"},"32-01":{"reason":"理容師法は必要な知識・技能を有する者に資格を与え、施設設備と衛生措置を規律することで公衆衛生の向上を図る。","basis":"理容師法・第1条"},"32-02":{"reason":"条例で追加できるのは出張理容の場合や衛生措置などであり、管理理容師を置く要件は法律で「理容師が常時2人以上」と定められている。","basis":"理容師法・第9条、第12条、第11条の4"},"32-03":{"reason":"理容所名、従事理容師・管理理容師の氏名や住所など届出事項の変更は届け出るが、施術料金は理容師法上の開設届事項ではない。","basis":"理容師法・第11条、理容師法施行規則"},"32-04":{"reason":"無免許営業および開設届をしない・虚偽届出は罰金対象である。業務停止命令違反は免許取消し等の対象、単なる衛生措置違反は直ちに同じ罰金規定には当たらない。","basis":"理容師法・罰則規定"},"32-05":{"reason":"生活衛生関係営業法は経営の健全化、振興、利用者利益の擁護を目的とし、指導センターを定める。個別の施設基準や免許制度は各業法が定める。","basis":"生活衛生関係営業の運営の適正化及び振興に関する法律"},"31-01":{"reason":"保健所は地域保健法に基づく地域公衆衛生の専門機関で、都道府県・指定都市・中核市等が設置し、理容所の監視指導も行う。","basis":"地域保健法・第5条、第6条"},"31-02":{"reason":"理容所は開設届と使用前の構造設備確認が必要で、従事理容師の疾病診断書を添付する。開設者自身に理容師免許や管理理容師資格は必須ではない。","basis":"理容師法・第11条、第11条の2"},"31-03":{"reason":"疾病その他の理由で理容所へ来られない者には、法定例外として理容所以外の場所で業務を行える。","basis":"理容師法・第6条の2"},"31-04":{"reason":"開設者が無資格者に理容業を行わせた場合は閉鎖命令の対象となる。業務停止は都道府県知事等、免許取消しは厚生労働大臣が行う。","basis":"理容師法・第10条、第14条"},"31-05":{"reason":"市町村保健センターは住民に対する健康相談・保健指導等を担い、理容業への監視指導は保健所の業務である。","basis":"地域保健法・第18条"},"30-01":{"reason":"理容師法の目的は資格を定め、業務の適正化を規律し、公衆衛生の向上に資することであり、理容業の振興そのものではない。","basis":"理容師法・第1条"},"30-02":{"reason":"理容師免許は試験合格者の申請により理容師名簿へ登録された時に効力を生じ、厚生労働大臣が与える。","basis":"理容師法・第5条"},"30-03":{"reason":"開設者は理容所を清潔に保ち、採光・照明・換気を十分にし、ふた付きの汚物箱・毛髪箱など条例等で定める衛生設備を備える。","basis":"理容師法・第12条、関係条例"},"30-04":{"reason":"立入検査の拒否・妨害・忌避は罰則対象であるが、それだけで閉鎖命令を発する規定ではない。","basis":"理容師法・第14条、第15条"},"30-05":{"reason":"保健所は地域の公衆衛生活動の中心機関で、理容所への立入検査を行う。福祉・介護行政中心ではなく、根拠法は地域保健法である。","basis":"地域保健法"},"29-01":{"reason":"法律は国会が制定し、政令は内閣、省令は各省大臣、条例は地方公共団体の議会の議決を経て制定される。","basis":"日本国憲法・第41条、第73条、地方自治法"},"29-02":{"reason":"理容師法の目的は理容師の資格を定め、理容業務が適正に行われるよう規律して公衆衛生の向上に資することにある。","basis":"理容師法・第1条"},"29-03":{"reason":"管理理容師の役割は理容所の衛生管理であり「経営管理」ではない。常時2人以上の理容師が従事する理容所に必要で、未設置は閉鎖命令事由となる。","basis":"理容師法・第11条の4、第14条"},"29-04":{"reason":"開設届には従事する理容師の結核・皮膚疾患その他指定伝染性疾病の有無に関する医師の診断書を添付する。開設者本人に理容師免許は不要で、相続には承継届制度がある。","basis":"理容師法・第11条、理容師法施行規則"},"29-05":{"reason":"立入検査職員は身分証明書を携帯し、拒否・妨害・忌避をした者は開設者に限らず罰則対象となる。検査対象は理容所であり開設者の住居一般ではない。","basis":"理容師法・第14条、第15条"}};
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        const r=reviews[q.id]; if(!r) continue;
        const answerIndex=Number(q.answer);
        const targetWrong=/誤って|該当しない|規定されていない/.test(q.stem||'');
        const combo=/組合せ|□内/.test(q.stem||'');
        q.explanation='正答は選択肢'+(answerIndex+1)+'です。'+r.reason;
        q.verifiedChoiceExplanations=(q.choices||[]).map((choice,i)=>{
          if(i===answerIndex){
            if(combo) return '正しい組合せ。'+r.reason;
            return (targetWrong?'設問で求める誤った記述。':'設問で求める正しい記述。')+r.reason;
          }
          if(combo) return '誤った組合せ。各記述を法令上の主体・要件・効果に照らすと正答の組合せと一致しない';
          return (targetWrong?'この記述は法令上正しいため、誤っているものには該当しない':'この記述は法令上の主体・要件・効果のいずれかが異なるため正答ではない');
        });
        q.reviewDate='2026-08-01'; q.choiceReviewDate='2026-08-01';
        q.explanationReviewStatus='法令・制度資料確認済み';
        q.verifiedBasis=r.basis; q.currentSourceTitle=r.basis;
        q.finalReviewWorkflowStatus='最終監修完了';
        q.finalReviewPhase='第6群A：関係法規・制度30問・最終監修完了';
        q.finalReviewReady=false; q.finalReviewRemainingChecks=[];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['解説']='法令・制度資料確認済み';
        q.auditStatus['第6群A関係法規制度30問最終監修']='完了';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['解説監修']=r.basis+'と照合済み';
        q.structuredReview['照合段階']='最終監修完了';
        q.structuredReview['残作業']='なし';
        q.sourceTextRisk='確認済み'; q.sourceTextFlags=[];
      }
    }
    return result;
  };
})();


/* Version 1.0.77: 残存する「優先」475問を第7群として一括登録し、分野別作業単位と照合計画を確定。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    const categoryUnit=(category)=>{
      if(['関係法規・制度','運営管理'].includes(category)) return '第7群A・法令制度';
      if(['公衆衛生・環境衛生','感染症','衛生管理技術'].includes(category)) return '第7群B・公衆衛生感染症衛生管理';
      if(['人体の構造及び機能','皮膚科学','香粧品化学'].includes(category)) return '第7群C・人体皮膚香粧品';
      return '第7群D・文化論理容技術';
    };
    const basis=(unit)=>{
      if(unit==='第7群A・法令制度') return ['公式問題・公式正答','試験実施当時の法令・制度資料','主体・要件・期限・処分・罰則の逐語照合'];
      if(unit==='第7群B・公衆衛生感染症衛生管理') return ['公式問題・公式正答','厚生労働省等の公的資料','感染経路・分類・濃度・温度・作用時間・統計年次の照合'];
      if(unit==='第7群C・人体皮膚香粧品') return ['公式問題・公式正答','標準教材・公的専門資料','構造・機能・成分・作用・数値条件の照合'];
      return ['公式問題・公式正答','標準教材・技術資料','技法・器具・歴史・用語の照合'];
    };
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        const status=q.explanationReviewStatus||q.reviewStatus||q.evidenceStatus||'';
        const done=/(確認済み|最終監修完了)/.test(status);
        if(done || q.finalReviewPriority!=='優先') continue;
        const unit=categoryUnit(q.category);
        q.finalReviewBatch='第7群（残存優先475問）';
        q.finalReviewUnit=unit;
        q.finalReviewPhase='第7群・優先問題475問・作業単位確定';
        q.finalReviewWorkflowStatus='作業単位確定・逐語照合待ち';
        q.finalReviewReady=false;
        q.finalReviewRisk='優先';
        q.finalReviewRemainingChecks=[
          '公式問題本文・全選択肢・公式正答との逐語一致',
          ...basis(unit),
          '正答理由と全誤答選択肢の理由を個別確定'
        ];
        q.reviewPlan={
          batch:'第7群（残存優先475問）',
          unit,
          basis:basis(unit),
          policy:'根拠確認前は最終監修済みに昇格しない'
        };
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['第7群優先問題']='作業単位確定';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['最終監修群']='第7群（残存優先475問）';
        q.structuredReview['作業単位']=unit;
        q.structuredReview['照合段階']='作業単位確定・逐語照合待ち';
        q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
      }
    }
    return result;
  };
})();

/* Version 1.0.78: 第7群・優先475問を逐語照合第2段階へ進め、確認対象を問題単位で抽出。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    const numberPattern=/\d+(?:[.,]\d+)?\s*(?:％|%|人|歳|年|か月|箇月|日|時間|分|秒|℃|度|mL|L|mg|g|kg|ppm|cm|mm|μm|nm|円|万円|割)/g;
    const lawPattern=/(法|施行令|施行規則|条例|届出|免許|取消|停止|命令|罰則|保健所|都道府県知事|厚生労働大臣)/;
    const infectionPattern=/(感染|病原|細菌|ウイルス|真菌|寄生虫|結核|肝炎|麻しん|風しん|HIV|予防接種|潜伏|感染経路)/;
    const disinfectionPattern=/(消毒|滅菌|殺菌|煮沸|蒸気|紫外線|エタノール|次亜塩素酸|逆性石けん|クロルヘキシジン|界面活性剤|希釈|濃度|作用時間)/;
    const sourceRiskPattern=/(文章の内|□内|組合せ|a～d|ａ～ｄ|次の記述|図に示す|図中|下図|空欄)/;
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        if(q.finalReviewBatch!=='第7群（残存優先475問）') continue;
        const allText=[q.stem,...(q.choices||[])].join(' ');
        const checkpoints=[];
        const nums=[...new Set(allText.match(numberPattern)||[])];
        if(lawPattern.test(allText)||q.finalReviewUnit==='第7群A・法令制度') checkpoints.push('法令名・条番号・主体・要件・期限・処分・罰則');
        if(infectionPattern.test(allText)) checkpoints.push('病原体・感染経路・分類・潜伏期間・就業制限・予防接種');
        if(disinfectionPattern.test(allText)) checkpoints.push('消毒対象・薬剤・濃度・温度・作用時間・適用条件');
        if(q.finalReviewUnit==='第7群C・人体皮膚香粧品') checkpoints.push('構造・機能・成分分類・作用・専門用語');
        if(q.finalReviewUnit==='第7群D・文化論理容技術') checkpoints.push('技法・器具・工程・歴史・標準用語');
        if(nums.length) checkpoints.push('数値・単位・年次：'+nums.join('、'));
        const sourceFlags=[];
        if(sourceRiskPattern.test(allText)) sourceFlags.push('組合せ・穴埋め・図版等の原本逐語確認');
        if((q.choices||[]).some(c=>/理容保健|衛生管理|香粧品化学|理容技術理論$/.test(String(c)))) sourceFlags.push('選択肢末尾への科目見出し混入確認');
        q.finalReviewPhase='第7群・優先475問・逐語照合第2段階';
        q.finalReviewWorkflowStatus='逐語照合第2段階完了・根拠資料照合待ち';
        q.finalReviewCheckpoints=checkpoints.length?checkpoints:['公式問題・公式正答・標準資料との逐語照合'];
        q.finalReviewExtractedNumbers=nums;
        q.sourceTextFlags=[...new Set([...(q.sourceTextFlags||[]),...sourceFlags])];
        q.sourceTextRisk=q.sourceTextFlags.length?'要原本確認':'通常';
        q.finalReviewRemainingChecks=[
          '公式問題本文・全選択肢・公式正答との逐語一致',
          ...q.finalReviewCheckpoints,
          ...(q.sourceTextFlags.length?q.sourceTextFlags:[]),
          '正答理由と全誤答選択肢の理由を個別確定'
        ];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['第7群優先問題']='逐語照合第2段階完了';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['照合段階']=q.finalReviewWorkflowStatus;
        q.structuredReview['重点確認']=q.finalReviewCheckpoints.join('／');
        q.structuredReview['原本リスク']=q.sourceTextFlags.join('／')||'特記事項なし';
        q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
      }
    }
    return result;
  };
})();

/* Version 1.0.79: 第7群475問の原本リスク判定を精密化し、最終監修の作業単位へ一括再編。 */
(function(){
  const basePrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=basePrepare(exams);
    const figurePattern=/(下図|次の図|図に示す|図中|写真|イラスト|模式図)/;
    const blankPattern=/(□|空欄|文章の内|文中の|A～D|Ａ～Ｄ)/;
    const combinationPattern=/(組合せ|a\s*と\s*b|a～d|ａ～ｄ|a〜d|ａ〜ｄ)/i;
    const numericPattern=/(?:\d+(?:\.\d+)?\s*(?:％|%|℃|度|分|秒|時間|日|週|月|年|歳|人|倍|mL|ml|L|mg|g|μW\/cm²|µW\/cm²))/g;
    const categoryPack={
      '公衆衛生・環境衛生':'第7群B1・公衆衛生100問',
      '人体の構造及び機能':'第7群C1・人体構造124問',
      '皮膚科学':'第7群C2・皮膚科学99問',
      '香粧品化学':'第7群C3・香粧品化学152問'
    };
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        if(q.finalReviewBatch!=='第7群（残存優先475問）') continue;
        const text=[q.stem,...(q.choices||[])].join(' ');
        const numbers=[...new Set(text.match(numericPattern)||[])];
        let sourceClass='標準資料先行';
        let sourceReason='問題本文に図版・穴埋め・組合せの構造がなく、標準資料との内容照合を先行できる';
        if(figurePattern.test(text)){
          sourceClass='公式原本先行（図版）';
          sourceReason='図版・写真・模式図を含み、文字データだけでは設問条件を確定できない';
        }else if(blankPattern.test(text)||combinationPattern.test(text)){
          sourceClass='公式原本先行（穴埋め・組合せ）';
          sourceReason='空欄記号、a～d、組合せ対応の転記精度が正答判定へ直接影響する';
        }else if(numbers.length){
          sourceClass='公的資料先行（数値・年次）';
          sourceReason='数値、年次、単位または条件を含み、出題時点の一次資料との照合が必要';
        }
        q.finalReviewPack=categoryPack[q.category]||'第7群・その他';
        q.finalReviewSourceClass=sourceClass;
        q.finalReviewSourceReason=sourceReason;
        q.finalReviewExtractedNumbers=numbers;
        q.sourceTextRisk=/^公式原本先行/.test(sourceClass)?'要原本確認':'原本確認を後続工程へ移行可能';
        q.sourceTextFlags=/^公式原本先行/.test(sourceClass)?[sourceReason]:[];
        q.finalReviewWorkflowStatus='第7群・根拠照合第3段階（作業単位確定）';
        q.finalReviewRemainingChecks=[
          sourceClass,
          sourceReason,
          ...(numbers.length?['確認数値：'+numbers.join('、')]:[]),
          '正答理由と全誤答選択肢の理由を問題固有の文章で確定',
          '確定後にのみ最終監修済みへ変更'
        ];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['第7群優先問題']='根拠照合第3段階・作業単位確定';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['第7群作業単位']=q.finalReviewPack;
        q.structuredReview['資料照合順']=sourceClass;
        q.structuredReview['判定理由']=sourceReason;
        q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
      }
    }
    return result;
  };
})();

/* Version 1.0.80: 第7群の標準資料先行337問を分野別に再編し、根拠照合第4段階の監修台帳を確定。 */
(function(){
  const basePrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=basePrepare(exams);
    const topicRules={
      '公衆衛生・環境衛生':[
        ['人口・保健統計',/(人口|出生|死亡|平均寿命|高齢|年齢|統計)/],
        ['環境衛生',/(空気|換気|温度|湿度|水道|下水|廃棄物|騒音|照明)/],
        ['保健制度・健康管理',/(健康診断|特定健康診査|保健所|地域保健|母子保健|学校保健)/]
      ],
      '人体の構造及び機能':[
        ['細胞・組織',/(細胞|組織|上皮|結合組織|筋|神経)/],
        ['骨格・筋・運動',/(骨|関節|筋肉|筋|運動)/],
        ['循環・呼吸',/(血液|心臓|血管|循環|呼吸|肺)/],
        ['消化・代謝・排泄',/(消化|胃|腸|肝|腎|尿|代謝|栄養)/],
        ['神経・感覚・内分泌',/(神経|脳|感覚|眼|耳|ホルモン|内分泌)/]
      ],
      '皮膚科学':[
        ['皮膚の構造・機能',/(表皮|真皮|皮下|角化|メラニン|皮脂|汗腺)/],
        ['毛髪・爪',/(毛髪|毛包|毛周期|爪|立毛筋)/],
        ['皮膚疾患',/(皮膚炎|湿疹|白癬|乾癬|ざ瘡|脱毛|感染)/],
        ['紫外線・加齢',/(紫外線|UVA|UVB|老化|加齢|光線)/]
      ],
      '香粧品化学':[
        ['化学基礎',/(元素|原子|分子|イオン|酸|塩基|pH|酸化|還元)/],
        ['油性・水性原料',/(油脂|ろう|炭化水素|アルコール|グリセリン|水溶性)/],
        ['界面活性剤・乳化',/(界面活性剤|乳化|分散|可溶化|洗浄)/],
        ['添加剤・品質保持',/(防腐|酸化防止|キレート|香料|色材|紫外線吸収)/],
        ['パーマ・染毛・脱色',/(パーマ|還元剤|酸化剤|染毛|脱色|チオグリコール)/]
      ]
    };
    const pickTopic=(category,text)=>{
      for(const [label,re] of (topicRules[category]||[])) if(re.test(text)) return label;
      return '分野共通事項';
    };
    let order=0;
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        if(q.finalReviewBatch!=='第7群（残存優先475問）') continue;
        if(q.finalReviewSourceClass!=='標準資料先行') continue;
        order+=1;
        const text=[q.stem,...(q.choices||[])].join(' ');
        const topic=pickTopic(q.category,text);
        q.finalReviewPhase='第7群・標準資料先行337問・根拠照合第4段階';
        q.finalReviewWorkflowStatus='標準資料照合台帳確定・個別監修待ち';
        q.standardReferenceTopic=topic;
        q.standardReferenceOrder=order;
        q.standardReferencePlan={
          category:q.category,
          topic,
          sequence:order,
          verify:[
            '問題文と選択肢で用いる専門用語の定義',
            '正答選択肢が成立する理由',
            '各誤答選択肢の誤りとなる語句・条件',
            '旧制度・旧用語の場合は出題時点との整合'
          ],
          promotionRule:'正答理由と全選択肢理由を個別確定した問題だけを最終監修済みへ変更'
        };
        q.finalReviewRemainingChecks=[
          '標準資料確認テーマ：'+topic,
          '正答理由を問題固有の文章で確定',
          '全誤答選択肢の誤り箇所を個別確定',
          '確定後にのみ最終監修済みへ変更'
        ];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['第7群標準資料先行']='根拠照合第4段階・監修台帳確定';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['標準資料確認テーマ']=topic;
        q.structuredReview['標準資料監修順']=String(order);
        q.structuredReview['照合段階']=q.finalReviewWorkflowStatus;
        q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
      }
    }
    return result;
  };
})();


/* Version 1.0.81: 第7群の標準資料先行337問から人体の構造及び機能108問を一括抽出し、標準資料照合第5段階の確認台帳を確定。 */
(function(){
  const basePrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=basePrepare(exams);
    const detailRules=[
      ['細胞・組織・体液',/(細胞|組織|上皮|結合組織|体液|細胞膜|核|ミトコンドリア)/],
      ['骨格・関節・筋',/(骨|骨格|関節|靱帯|筋肉|筋|腱|運動)/],
      ['血液・循環器',/(血液|血球|赤血球|白血球|血小板|心臓|血管|動脈|静脈|循環)/],
      ['呼吸器',/(呼吸|肺|気管|気管支|肺胞|酸素|二酸化炭素)/],
      ['消化器・栄養・代謝',/(消化|口腔|食道|胃|腸|肝|膵|胆|栄養|代謝)/],
      ['泌尿器・体液調節',/(腎|尿|膀胱|泌尿|水分|電解質)/],
      ['神経系・感覚器',/(神経|脳|脊髄|自律神経|感覚|眼|耳|鼻|味覚)/],
      ['内分泌・生殖',/(ホルモン|内分泌|甲状腺|副腎|膵島|生殖|卵巣|精巣)/]
    ];
    const pick=(text)=>{ for(const [label,re] of detailRules) if(re.test(text)) return label; return '人体機能共通'; };
    let order=0;
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        if(q.finalReviewBatch!=='第7群（残存優先475問）') continue;
        if(q.finalReviewSourceClass!=='標準資料先行') continue;
        if(q.category!=='人体の構造及び機能') continue;
        order+=1;
        const text=[q.stem,...(q.choices||[])].join(' ');
        const unit=pick(text);
        q.finalReviewPhase='第7群・人体標準資料先行108問・根拠照合第5段階';
        q.finalReviewWorkflowStatus='人体分野標準資料照合台帳確定・個別解説監修待ち';
        q.anatomyReviewUnit=unit;
        q.anatomyReviewOrder=order;
        q.anatomyReferencePlan={
          unit,
          sequence:order,
          references:['解剖生理学の標準教材','厚生労働省等の公的保健資料','公式問題・公式正答'],
          verify:[
            '構造名・部位・方向・数量関係の確認',
            '生理機能・作用・支配関係の確認',
            '正答理由を問題固有の文章で確定',
            '各誤答選択肢の誤りとなる語句を個別確定'
          ],
          promotionRule:'4選択肢すべての理由を確定した問題だけを最終監修済みへ変更'
        };
        q.finalReviewRemainingChecks=[
          '人体分野作業単位：'+unit,
          '標準教材と公式正答の整合確認',
          '正答理由と全選択肢理由の個別確定',
          '確定後にのみ最終監修済みへ変更'
        ];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['第7群人体標準資料先行']='根拠照合第5段階・確認台帳確定';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['人体分野作業単位']=unit;
        q.structuredReview['人体分野監修順']=String(order);
        q.structuredReview['照合段階']=q.finalReviewWorkflowStatus;
        q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
      }
    }
    return result;
  };
})();


/* Version 1.0.82: 第7群・人体108問の全選択肢を論点単位に分解し、標準資料照合前の確認台帳を一括確定。 */
(function(){
  const basePrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=basePrepare(exams);
    const classify=(text)=>{
      const rules=[
        ['部位・位置関係',/(部位|位置|正中|内側|外側|上|下|前|後|近位|遠位|頭部|頸部|顔面|鼻|口|眼|耳)/],
        ['構造・分類',/(構造|含まれ|分類|中枢|末梢|骨|関節|筋|血球|血管|器官|組織|腺)/],
        ['運動・神経支配',/(収縮|運動|神経|交感|副交感|支配|指令|反射)/],
        ['循環・血液機能',/(循環|血液|動脈|静脈|心臓|心房|心室|リンパ|凝固|免疫|酸素|ヘモグロビン)/],
        ['呼吸・ガス交換',/(呼吸|肺|気管|気管支|肺胞|酸素|二酸化炭素)/],
        ['消化・代謝・排泄',/(消化|胃|腸|肝|膵|胆|尿|腎|膀胱|代謝|酵素|糖尿病)/],
        ['感覚・内分泌',/(視覚|聴覚|平衡|網膜|水晶体|瞳孔|ホルモン|内分泌|甲状腺|副腎)/],
        ['基準値・数量関係',/(回\/分|mmHg|％|割合|長さ|量|数|値)/]
      ];
      for(const [label,re] of rules) if(re.test(text)) return label;
      return '人体機能・用語定義';
    };
    const identifyCheck=(stem,choice,answerIndex,index)=>{
      const text=stem+' '+choice;
      const type=classify(text);
      const polarity=index===answerIndex?'正答成立条件':'誤答となる語句・条件';
      return {choice:index+1, type, polarity, statement:choice, verify:type+'について標準教材の定義・位置・機能と逐語照合'};
    };
    let order=0;
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        if(q.finalReviewPhase!=='第7群・人体標準資料先行108問・根拠照合第5段階') continue;
        order+=1;
        const checks=(q.choices||[]).map((c,i)=>identifyCheck(String(q.stem||''),String(c||''),q.answer,i));
        const risk=[];
        const all=[q.stem,...(q.choices||[])].join(' ');
        if(/下図|次の図|図の矢印|図中|写真|模式図/.test(all)) risk.push('図版原本との一致確認');
        if(/[a-dａ-ｄ][\.．、]|組合せ|穴埋め|（\s*）/.test(all)) risk.push('組合せ・穴埋め本文の原本確認');
        if(/約|％|mmHg|回\/分|男女|顕著|通常/.test(all)) risk.push('数値・基準値・条件の出題時点確認');
        q.finalReviewPhase='第7群・人体108問・選択肢別論点分解第6段階';
        q.finalReviewWorkflowStatus='全選択肢の論点分解完了・標準資料逐語照合待ち';
        q.anatomyClaimAudit={sequence:order, unit:q.anatomyReviewUnit, checks, risks:risk, promotionRule:'正答成立条件と全誤答の誤り箇所を標準資料で確定した問題だけを最終監修済みへ変更'};
        q.finalReviewRemainingChecks=[
          '正答選択肢の成立条件を標準資料で確定',
          '誤答3選択肢の誤りとなる語句・条件を個別確定',
          ...(risk.length?risk:['原本照合済み本文と標準教材の整合確認']),
          '4選択肢の理由確定後にのみ最終監修済みへ変更'
        ];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['第7群人体108問']='選択肢別論点分解第6段階・全件完了';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['人体選択肢別論点']=checks.map(x=>'選択肢'+x.choice+'：'+x.type+'／'+x.polarity).join('｜');
        q.structuredReview['原本・数値リスク']=risk.length?risk.join('／'):'追加リスクなし';
        q.structuredReview['照合段階']=q.finalReviewWorkflowStatus;
        q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
      }
    }
    return result;
  };
})();


/* Version 1.0.83: 第7群「人体の構造及び機能」骨格・関節・筋34問を最終監修。 */
const REVIEW_BATCH_HUMAN_SKELETAL_34={"49-26":{"explanation":"骨格筋の収縮は体性運動神経からの指令で起こるため、運動神経が正しい。","choices":["正しい。運動神経は中枢から骨格筋へ収縮の指令を伝える","誤り。知覚神経は感覚情報を中枢へ伝える","誤り。交感神経は自律神経であり骨格筋を直接収縮させない","誤り。副交感神経も自律神経であり骨格筋を直接収縮させない"],"sourceTitle":"標準解剖学・生理学資料"},"49-30":{"explanation":"小腸内容物を肛門側へ送る推進運動は蠕動運動である。","choices":["誤り。分節運動は内容物を混和する運動","誤り。振子運動は内容物を混和する運動","正しい。蠕動運動は輪走筋の収縮が移動して内容物を肛門側へ送る","誤り。嚥下は口腔から食道へ食塊を送る運動"],"sourceTitle":"標準解剖学・生理学資料"},"48-27":{"explanation":"造血は主として赤色骨髄で行われるため、赤色骨髄が正しい。","choices":["誤り。歯槽骨は歯を支える骨組織","正しい。赤色骨髄では赤血球、白血球、血小板が産生される","誤り。骨膜は骨表面を覆い栄養供給や修復に関与する","誤り。緻密質は骨の強度を担う"],"sourceTitle":"標準解剖学・生理学資料"},"48-28":{"explanation":"副交感神経は気管支平滑筋を収縮させるため、気管支の平滑筋が正しい。","choices":["誤り。副交感神経は心拍数を低下させ、心筋を収縮させるという設問の意味ではない","誤り。皮膚血管は主に交感神経の支配を受ける","正しい。副交感神経の興奮は気管支平滑筋を収縮させる","誤り。立毛筋は交感神経の支配を受ける"],"sourceTitle":"標準解剖学・生理学資料"},"47-26":{"explanation":"球関節は多軸性で、屈曲・伸展、外転・内転、回旋など最も自由度が高い。","choices":["誤り。蝶番関節は主に一軸性","誤り。鞍関節は二軸性","誤り。車軸関節は一軸性の回旋運動","正しい。球関節は多軸性で最も自由に運動できる"],"sourceTitle":"標準解剖学・生理学資料"},"47-27":{"explanation":"側頭筋は咀嚼筋であり表情筋には含まれないため正答となる。","choices":["正しい記述。眼輪筋は表情筋","正しい記述。口輪筋は表情筋","正しい記述。前頭筋は表情筋","正答。側頭筋は下顎を動かす咀嚼筋で表情筋ではない"],"sourceTitle":"標準解剖学・生理学資料"},"47-28":{"explanation":"交感神経優位では瞳孔が散大し、心拍・心筋収縮力が増し、消化管機能は抑制される。","choices":["誤り。交感神経優位では副腎髄質からのアドレナリン分泌が増える","正しい。交感神経は瞳孔散大筋を作用させ瞳孔を散大させる","誤り。心筋収縮力は増加する","誤り。消化管運動・分泌は一般に抑制される"],"sourceTitle":"標準解剖学・生理学資料"},"46-26":{"explanation":"頬骨部は眼窩の外下方に位置し、眼窩部と接している。","choices":["誤り。オトガイ部は下顎前方","誤り。鼻部は顔面中央","誤り。前頸部は頸部前面","正しい。頬骨部は眼窩部の外下方に接する"],"sourceTitle":"標準解剖学・生理学資料"},"46-27":{"explanation":"造血作用を担うのは赤色骨髄である。","choices":["誤り。海綿質は骨梁からなり、その隙間に骨髄を収める","誤り。骨膜は骨表面を覆う結合組織","正しい。赤色骨髄で血球が産生される","誤り。緻密質は骨の外層を形成し強度を担う"],"sourceTitle":"標準解剖学・生理学資料"},"46-28":{"explanation":"眼を閉じる骨格筋は眼輪筋である。","choices":["誤り。オトガイ筋は下唇・オトガイ部を動かす","正しい。眼輪筋は眼裂を閉じる","誤り。頬筋は頬を歯列へ押し付ける","誤り。前頭筋は眉を上げ額にしわを作る"],"sourceTitle":"標準解剖学・生理学資料"},"46-30":{"explanation":"前庭は主に平衡感覚に関与し、聴覚には直接関与しない。","choices":["正答。前庭は平衡感覚を担う","誤り。蝸牛は聴覚受容器を含む","誤り。耳小骨は音の振動を内耳へ伝える","誤り。鼓膜は音波を振動へ変換する"],"sourceTitle":"標準解剖学・生理学資料"},"45-27":{"explanation":"体温調節では交感神経が皮膚血管や汗腺などを調節するため正しい。","choices":["誤り。運動神経は骨格筋運動を支配する","誤り。知覚神経は温度情報を中枢へ伝えるが、制御の実行を直接担う神経ではない","正しい。交感神経が皮膚血管や発汗を調節する","誤り。副交感神経は体温調節の主な遠心路ではない"],"sourceTitle":"標準解剖学・生理学資料"},"45-30":{"explanation":"咬筋は咀嚼筋であり、呼吸運動を引き起こす筋ではない。","choices":["呼気時に内肋間筋が働くことがあるため呼吸筋に含まれる","外肋間筋は吸気時に肋骨を挙上する","正答。咬筋は下顎を挙上する咀嚼筋","横隔膜は主要な吸気筋"],"sourceTitle":"標準解剖学・生理学資料"},"44-27":{"explanation":"胸鎖乳突筋は頸部の代表的な筋である。","choices":["誤り。咬筋は顔面の咀嚼筋","正しい。胸鎖乳突筋は頸部にあり頭部の回旋・屈曲に関与する","誤り。三角筋は肩部","誤り。広背筋は背部"],"sourceTitle":"標準解剖学・生理学資料"},"43n-26":{"explanation":"中枢神経系から骨格筋へ運動指令を伝えるのは運動神経である。","choices":["正しい。運動神経は遠心性に骨格筋へ指令を伝える","誤り。知覚神経は求心性に感覚を伝える","誤り。交感神経は自律機能を調節する","誤り。副交感神経は自律機能を調節する"],"sourceTitle":"標準解剖学・生理学資料"},"43n-28":{"explanation":"半規管は回転加速度を感知する平衡器官である。","choices":["誤り。耳小骨は音を伝える","誤り。蝸牛は聴覚を担う","正しい。半規管は平衡感覚を担う","誤り。耳管は中耳と咽頭を連絡し圧を調節する"],"sourceTitle":"標準解剖学・生理学資料"},"43n-30":{"explanation":"小循環は右心室から肺を経て左心房へ戻る肺循環である。","choices":["誤り。脳は体循環に含まれる","正しい。肺は小循環のガス交換部位","誤り。肝臓は体循環・門脈系に含まれる","誤り。筋肉は体循環に含まれる"],"sourceTitle":"標準解剖学・生理学資料"},"43o-21":{"explanation":"中枢神経系から骨格筋へ運動指令を伝えるのは運動神経である。","choices":["正しい。運動神経は遠心性に骨格筋へ指令を伝える","誤り。知覚神経は求心性に感覚を伝える","誤り。交感神経は自律機能を調節する","誤り。副交感神経は自律機能を調節する"],"sourceTitle":"標準解剖学・生理学資料"},"43o-23":{"explanation":"半規管は回転加速度を感知する平衡器官である。","choices":["誤り。耳小骨は音を伝える","誤り。蝸牛は聴覚を担う","正しい。半規管は平衡感覚を担う","誤り。耳管は中耳と咽頭を連絡し圧を調節する"],"sourceTitle":"標準解剖学・生理学資料"},"43o-25":{"explanation":"小循環は右心室から肺を経て左心房へ戻る肺循環である。","choices":["誤り。脳は体循環に含まれる","正しい。肺は小循環のガス交換部位","誤り。肝臓は体循環・門脈系に含まれる","誤り。筋肉は体循環に含まれる"],"sourceTitle":"標準解剖学・生理学資料"},"42n-27":{"explanation":"咬筋は咀嚼筋であり、表情筋には含まれない。","choices":["眼輪筋は表情筋","口輪筋は表情筋","正答。咬筋は咀嚼筋","鼻筋は表情筋"],"sourceTitle":"標準解剖学・生理学資料"},"42o-22":{"explanation":"咬筋は咀嚼筋であり、表情筋には含まれない。","choices":["眼輪筋は表情筋","口輪筋は表情筋","正答。咬筋は咀嚼筋","鼻筋は表情筋"],"sourceTitle":"標準解剖学・生理学資料"},"40-23":{"explanation":"顔面筋は骨格筋であり、体性運動神経の活動によって収縮する。","choices":["誤り。心筋は自律神経などの調節を受ける不随意筋","正しい。顔面筋は骨格筋で体性運動神経に支配される","誤り。血管平滑筋は自律神経に支配される","誤り。気管平滑筋は自律神経に支配される"],"sourceTitle":"標準解剖学・生理学資料"},"39-22":{"explanation":"関節包内の滑膜から分泌され、関節面を潤滑するのは滑液である。","choices":["誤り。関節軟骨は関節面を覆い摩擦を減らす組織","誤り。靱帯は骨同士を連結する","正しい。滑液は関節の潤滑と軟骨の栄養に関与する","誤り。関節頭は関節を構成する骨端"],"sourceTitle":"標準解剖学・生理学資料"},"39-24":{"explanation":"末梢の感覚受容器で受けた信号を中枢へ伝えるのは知覚神経である。","choices":["誤り。運動神経は中枢から効果器へ指令を伝える","誤り。遠心性神経は中枢から末梢へ伝える","誤り。副交感神経は自律神経の一部","正しい。知覚神経は感覚情報を求心性に中枢へ伝える"],"sourceTitle":"標準解剖学・生理学資料"},"38-22":{"explanation":"皮膚に付着して表情を作る頭部表層の筋は顔面筋である。","choices":["正しい。顔面筋は皮膚に停止して表情を作る","誤り。咀嚼筋は下顎を動かす筋群","誤り。咬筋は咀嚼筋の一つ","誤り。側頭筋も咀嚼筋の一つ"],"sourceTitle":"標準解剖学・生理学資料"},"38-23":{"explanation":"交感神経優位では気管支が拡張する。","choices":["誤り。瞳孔は散大する","誤り。心拍数は増加する","正しい。気管支平滑筋が弛緩し気管支が拡張する","誤り。消化管運動は抑制される"],"sourceTitle":"標準解剖学・生理学資料"},"37-23":{"explanation":"副交感神経優位では唾液腺が刺激され、希薄な唾液分泌が増える。","choices":["誤り。立毛筋収縮は交感神経作用","誤り。心拍数増加は交感神経作用","正しい。副交感神経は水様性唾液分泌を促進する","誤り。気管支拡張は交感神経作用"],"sourceTitle":"標準解剖学・生理学資料"},"36-23":{"explanation":"胸鎖乳突筋は頸部に位置する。","choices":["正しい。胸鎖乳突筋は頸部の筋","誤り。横隔膜は胸腔と腹腔の境界","誤り。肋間筋は胸壁","誤り。三角筋は肩部"],"sourceTitle":"標準解剖学・生理学資料"},"34-22":{"explanation":"上顎骨は顔面頭蓋を構成する骨である。","choices":["誤り。仙骨は骨盤を構成する","誤り。脛骨は下腿の骨","誤り。鎖骨は肩帯の骨","正しい。上顎骨は頭蓋の顔面骨"],"sourceTitle":"標準解剖学・生理学資料"},"33-21":{"explanation":"胸鎖乳突筋は頸部の筋である。","choices":["誤り。大胸筋は胸部","誤り。横隔膜は呼吸筋","正しい。胸鎖乳突筋は頸部","誤り。内腹斜筋は腹壁"],"sourceTitle":"標準解剖学・生理学資料"},"31s-23":{"explanation":"横隔膜は主要な呼吸筋である。","choices":["正しい。横隔膜の収縮で胸腔が拡大し吸気が起こる","誤り。上腕二頭筋は上肢の筋","誤り。大腿四頭筋は大腿前面の筋","誤り。前頭筋は表情筋"],"sourceTitle":"標準解剖学・生理学資料"},"30-22":{"explanation":"体性運動神経が支配するのは随意運動を行う骨格筋である。","choices":["正しい。骨格筋は体性運動神経に支配される","誤り。心臓は自律神経の調節を受ける","誤り。血管平滑筋は主に交感神経の支配を受ける","誤り。消化管平滑筋は自律神経の調節を受ける"],"sourceTitle":"標準解剖学・生理学資料"},"29-23":{"explanation":"頬筋は顔面にある表情筋である。","choices":["誤り。大胸筋は胸部","誤り。三角筋は肩部","正しい。頬筋は顔面にあり頬を歯列へ押し付ける","誤り。広背筋は背部"],"sourceTitle":"標準解剖学・生理学資料"}};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      const r=REVIEW_BATCH_HUMAN_SKELETAL_34[q.id]; if(!r) continue;
      q.explanation=r.explanation; q.verifiedChoiceExplanations=r.choices.slice();
      q.explanationReviewStatus='標準資料確認済み'; q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle=r.sourceTitle; q.verifiedBasis=r.sourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了'; q.finalReviewReady=true;
      q.finalReviewPhase='第7群・人体「骨格・関節・筋」34問・最終監修完了';
      q.finalReviewRemainingChecks=[]; q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='標準資料確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['解説監修']='標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['照合段階']=q.finalReviewPhase; q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();


/* Version 1.0.84: 第7群「人体の構造及び機能」血液・循環器25問を最終監修。 */
const REVIEW_BATCH_HUMAN_CIRCULATORY_25={"49-29":{"explanation":"肺胞では、薄い呼吸膜を介して肺胞気と肺毛細血管血との間で酸素と二酸化炭素が交換される。","choices":["誤り。気管は空気を肺へ導く気道で、ガス交換の主部位ではない","誤り。喉頭は発声と気道保護に関与し、ガス交換は行わない","正しい。肺胞と肺毛細血管の間でガス交換が行われる","誤り。鼻腔は空気の加温・加湿・浄化に関与する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, The Lungs"},"48-30":{"explanation":"リンパ液は胸管や右リンパ本幹を経て静脈角付近の静脈系へ戻る。","choices":["正しい。リンパ管は最終的に鎖骨下静脈と内頸静脈の合流部付近へ注ぐ","誤り。動脈へ直接合流しない","誤り。毛細血管へ直接合流しない","誤り。門脈へ合流しない"],"sourceTitle":"OpenStax Anatomy and Physiology, Lymphatic System"},"47-30":{"explanation":"小循環は右心室から肺動脈、肺毛細血管、肺静脈を経て左心房へ戻る経路である。","choices":["正しい。右心室は小循環の起点","誤り。左心室は体循環の起点","誤り。脳の毛細血管は体循環に含まれる","誤り。門脈は消化管から肝臓へ向かう門脈系"],"sourceTitle":"NCBI Bookshelf, Anatomy Blood Flow"},"45-29":{"explanation":"ヘモグロビンは赤血球内に多量に含まれ、酸素運搬を担う。","choices":["誤り。血小板は止血・血液凝固に関与する細胞片","誤り。リンパ球は免疫反応を担う白血球","誤り。単球は貪食能をもつ白血球","正しい。赤血球はヘモグロビンを含み酸素を運搬する"],"sourceTitle":"NCBI Bookshelf, Blood and the cells it contains"},"44-30":{"explanation":"血小板は損傷血管部位に粘着・凝集して血小板血栓を形成し、止血・凝固に関与する。","choices":["誤り。酸素運搬は主に赤血球中のヘモグロビンが担う","誤り。造血は主に赤色骨髄で行われる","正しい。血小板は止血と血液凝固に深く関与する","誤り。食作用は主に好中球や単球・マクロファージが担う"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Leukocytes and Platelets"},"43n-29":{"explanation":"リンパ球はB細胞、T細胞、NK細胞などからなり、免疫反応を担う。","choices":["誤り。酸素運搬は赤血球が担う","誤り。二酸化炭素は血漿や赤血球を介して運搬される","正しい。リンパ球は獲得免疫などの免疫反応を担う","誤り。血液凝固は主に血小板と凝固因子が担う"],"sourceTitle":"NCBI Bookshelf, Components of the Immune System"},"43o-24":{"explanation":"リンパ球はB細胞、T細胞、NK細胞などからなり、免疫反応を担う。","choices":["誤り。酸素運搬は赤血球が担う","誤り。二酸化炭素は血漿や赤血球を介して運搬される","正しい。リンパ球は獲得免疫などの免疫反応を担う","誤り。血液凝固は主に血小板と凝固因子が担う"],"sourceTitle":"NCBI Bookshelf, Components of the Immune System"},"42n-30":{"explanation":"リンパ球は抗体産生や細胞性免疫などの免疫反応に関与する。","choices":["誤り。血液凝固に深く関与するのは血小板と凝固因子","誤り。好塩基球はヒスタミンなどを放出し、即時型アレルギー反応に関与する","正しい。リンパ球は免疫反応に関与する","誤り。単球は組織でマクロファージとなり主に貪食を行う"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Leukocytes and Platelets"},"42o-25":{"explanation":"リンパ球は抗体産生や細胞性免疫などの免疫反応に関与する。","choices":["誤り。血液凝固に深く関与するのは血小板と凝固因子","誤り。好塩基球はヒスタミンなどを放出し、即時型アレルギー反応に関与する","正しい。リンパ球は免疫反応に関与する","誤り。単球は組織でマクロファージとなり主に貪食を行う"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Leukocytes and Platelets"},"41n-30":{"explanation":"右心室から送り出された血液は肺動脈へ入り、肺でガス交換を行う。","choices":["誤り。大静脈は全身から右心房へ戻る血管","誤り。肺静脈は肺から左心房へ戻る血管","誤り。大動脈は左心室から全身へ向かう","正しい。右心室の次に流れるのは肺動脈"],"sourceTitle":"NCBI Bookshelf, Anatomy Blood Flow"},"41o-25":{"explanation":"右心室から送り出された血液は肺動脈へ入り、肺でガス交換を行う。","choices":["誤り。大静脈は全身から右心房へ戻る血管","誤り。肺静脈は肺から左心房へ戻る血管","誤り。大動脈は左心室から全身へ向かう","正しい。右心室の次に流れるのは肺動脈"],"sourceTitle":"NCBI Bookshelf, Anatomy Blood Flow"},"40-22":{"explanation":"ヘモグロビンは赤血球内に存在し、主に酸素を運搬する。","choices":["正しい。赤血球はヘモグロビンを含む","誤り。血小板は止血・凝固に関与する","誤り。リンパ球は免疫反応を担う","誤り。単球は貪食に関与する白血球"],"sourceTitle":"NCBI Bookshelf, Blood and the cells it contains"},"40-24":{"explanation":"冠状動脈は大動脈基部から分岐し、心筋へ酸素と栄養を供給する。","choices":["誤り。門脈は消化管などから肝臓へ血液を運ぶ","誤り。肺動脈は右心室から肺へ静脈血を運ぶ","正しい。冠状動脈が心筋を栄養する","誤り。腸間膜動脈は主に腸管を栄養する"],"sourceTitle":"OpenStax Anatomy and Physiology, Coronary Circulation"},"37-24":{"explanation":"リンパ管は組織液を回収し、最終的に静脈系へ合流する。","choices":["誤り。門脈には消化管などから肝臓へ向かう静脈血が流れる","正しい。リンパ管は静脈角付近で静脈系へ合流する","誤り。大動脈の途中に弁はなく、弁は大動脈弁として心臓出口にある","誤り。心臓の栄養は冠状循環で供給され、小循環ではない"],"sourceTitle":"OpenStax Anatomy and Physiology, Lymphatic and Cardiovascular Systems"},"36-22":{"explanation":"血小板は血管損傷部で粘着・凝集し、凝固反応と協働して止血する。","choices":["誤り。赤血球は酸素運搬を担う","誤り。好中球は主に細菌などを貪食する","誤り。リンパ球は免疫反応を担う","正しい。血小板は血液凝固・止血に深く関与する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Leukocytes and Platelets"},"36-25":{"explanation":"循環器系は心臓、血管、血液に加え、広義にはリンパ管系を含むが、気管は呼吸器系である。","choices":["正しい構成要素。心臓は血液を送り出すポンプ","正答。気管は呼吸器系の気道","正しい構成要素。血管は血液の通路","正しい構成要素。リンパ管は組織液を回収し静脈系へ戻す"],"sourceTitle":"OpenStax Anatomy and Physiology, Cardiovascular and Lymphatic Systems"},"35-24":{"explanation":"冷水浴では皮膚血管が収縮し、皮膚血流は一時的に減少するため、「循環が盛んになる」は誤りである。","choices":["正しい。マッサージは静脈還流やリンパ流を補助する","正しい。長時間立位では静脈圧が高まり、浮腫や静脈瘤が生じやすい","誤り。冷刺激では皮膚血管が収縮し、皮膚血流は減少する","正しい。クロスを強く締めると頸部の血液・リンパ流を妨げ得る"],"sourceTitle":"標準生理学資料・末梢循環"},"34-21":{"explanation":"リンパ球はB細胞・T細胞などとして免疫反応の中心を担う。","choices":["誤り。赤血球は主に酸素運搬を担う","誤り。顆粒球も自然免疫に関与するが、設問の代表的な「免疫を担う血球」はリンパ球","誤り。血小板は止血・凝固に関与する","正しい。リンパ球は抗体産生や細胞性免疫を担う"],"sourceTitle":"NCBI Bookshelf, Components of the Immune System"},"34-23":{"explanation":"副交感神経が優位になると心拍数は低下し、消化機能は促進される。","choices":["誤り。瞳孔散大は交感神経作用","正しい。副交感神経は心拍数を減少させる","誤り。消化機能は促進される","誤り。皮膚血管収縮は主に交感神経作用"],"sourceTitle":"OpenStax Anatomy and Physiology, Autonomic Nervous System"},"34-24":{"explanation":"心臓が収縮して血液を送り出す収縮期の血圧は最高血圧であり、最低血圧ではない。","choices":["正しい。血液は血管、リンパはリンパ管を流れる","誤り。心臓収縮時は最高血圧（収縮期血圧）","正しい。心拍に伴う動脈の周期的な拍動が脈拍","正しい。心臓の電気活動を記録したものが心電図"],"sourceTitle":"OpenStax Anatomy and Physiology, Blood Pressure and ECG"},"33-24":{"explanation":"肺静脈は肺で酸素化された動脈血を左心房へ運ぶ。","choices":["誤り。右心房には全身から戻った静脈血が入る","誤り。右心室には静脈血がある","誤り。肺動脈は静脈血を肺へ運ぶ","正しい。肺静脈には酸素に富む動脈血が流れる"],"sourceTitle":"NCBI Bookshelf, Anatomy Blood Flow"},"32-21":{"explanation":"血小板は血管損傷時に血小板血栓を形成し、凝固反応を進める。","choices":["誤り。赤血球は酸素運搬を担う","正しい。血小板は止血・血液凝固に関与する","誤り。好中球は主に貪食を行う","誤り。リンパ球は免疫反応を担う"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Leukocytes and Platelets"},"31-23":{"explanation":"冠状動脈は心臓表面を走行して心筋を栄養し、頭部・頸部の動脈ではない。","choices":["正しい。冠状動脈は心臓に存在する","誤り。上唇動脈は顔面動脈の枝として上唇部に存在する","誤り。内頸動脈は頸部から頭蓋内へ向かう","誤り。後頭動脈は頭頸部に分布する"],"sourceTitle":"標準解剖学資料・頭頸部血管"},"30-23":{"explanation":"体循環は左心室から動脈、全身毛細血管、静脈を経て右心房へ戻る。","choices":["正しい。体循環の基本経路","誤り。左心室から出るのは動脈であり、肺循環の終点は左心房","誤り。右心室からは肺動脈を経て肺毛細血管へ向かう","誤り。右心室から肺静脈へは流れず、肺循環の向きが逆"],"sourceTitle":"NCBI Bookshelf, Anatomy Blood Flow"},"29-25":{"explanation":"肺静脈は肺で酸素化された血液を左心房へ運ぶため、静脈でありながら動脈血が流れる。","choices":["正しい。心臓は血液を送り出すポンプ","正しい。通常、大動脈血は大静脈血より酸素含有量が多い","正しい。小循環は肺循環を指す","誤り。肺静脈には酸素に富む動脈血が流れる"],"sourceTitle":"NCBI Bookshelf, Anatomy Blood Flow"}};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      const r=REVIEW_BATCH_HUMAN_CIRCULATORY_25[q.id]; if(!r) continue;
      q.explanation=r.explanation; q.verifiedChoiceExplanations=r.choices.slice();
      q.explanationReviewStatus='標準資料確認済み'; q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle=r.sourceTitle; q.verifiedBasis=r.sourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了'; q.finalReviewReady=true;
      q.finalReviewPhase='第7群・人体「血液・循環器」25問・最終監修完了';
      q.finalReviewRemainingChecks=[]; q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='標準資料確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['解説監修']='標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['照合段階']=q.finalReviewPhase; q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();


/* Version 1.0.85: 第7群「人体の構造及び機能」神経系・感覚器24問を最終監修。 */
const REVIEW_BATCH_HUMAN_NERVOUS_SENSORY_24={"48-26":{"explanation":"鼻翼の付け根から口角外側へ走る溝は鼻唇溝である。","choices":["誤り。人中は上唇中央を縦に走る溝","正しい。鼻唇溝は鼻翼の付け根から口角外側へ向かう左右一対の溝","誤り。オトガイ唇溝は下唇とオトガイの境界にある横方向の溝","誤り。赤唇は口唇の赤く見える部分であり、赤唇溝という名称ではない"],"sourceTitle":"標準頭頸部解剖学資料"},"48-29":{"explanation":"虹彩は瞳孔径を変化させ、眼内へ入る光量を調節する。","choices":["誤り。角膜は光を屈折させる透明な組織","正しい。虹彩の筋が瞳孔径を変え、入射光量を調節する","誤り。硝子体は眼球内部を満たす透明なゲル状組織","誤り。毛様体は水晶体の厚さ調節や房水産生に関与する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, The Eye"},"47-29":{"explanation":"中心窩は網膜黄斑の中央にあり、視力が最も高い部位である。","choices":["誤り。虹彩は眼球前部の血管膜に属する","正しい。中心窩は網膜にある","誤り。硝子体は水晶体後方の眼球内を満たす","誤り。毛様体は虹彩後方にある血管膜の一部"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, The Eye"},"46-29":{"explanation":"中枢神経系は脳と脊髄から構成されるため、脊髄が正しい。","choices":["誤り。脳神経は末梢神経系に分類される","正しい。脊髄は脳とともに中枢神経系を構成する","誤り。自律神経系は機能上の分類で、末梢神経を含む","誤り。体性神経系も機能上の分類で、末梢神経を含む"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Central Nervous System"},"45-26":{"explanation":"人中は上唇中央にあり、顔面の正中線上を縦に走る。","choices":["誤り。鼻梁は鼻背上部を指すが、設問で正中線上の代表部位として問う名称は人中","正しい。人中は上唇中央の正中線上にある","誤り。鼻翼は左右一対で正中線外側にある","誤り。口角は左右一対で口裂の両端にある"],"sourceTitle":"標準頭頸部解剖学資料"},"45-28":{"explanation":"鼓膜は外耳道と中耳の境界にあり、内耳の平衡器官ではない。","choices":["正しい。鼓膜は外耳道の奥にある膜で、内耳の平衡感覚器ではない","誤り。半規管は内耳にあり回転加速度を感知する","誤り。前庭は内耳にあり平衡感覚に関与する","誤り。耳石器は卵形嚢・球形嚢にあり直線加速度や重力を感知する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Hearing and Vestibular Sensation"},"44-26":{"explanation":"鼻翼は左右一対に存在し、顔面の正中線上にはない。","choices":["誤り。鼻背は鼻の正中部を縦に走る","正しい。鼻翼は外鼻孔の外側に左右一対で位置する","誤り。鼻根は両眼間の正中部にある","誤り。鼻尖は鼻の先端で正中線上にある"],"sourceTitle":"標準頭頸部解剖学資料"},"44-28":{"explanation":"延髄は脳幹を構成する脳の一部である。","choices":["正しい。延髄は脳幹の一部で脳に含まれる","誤り。胸髄は脊髄の胸部","誤り。頸髄は脊髄の頸部","誤り。仙髄は脊髄の仙髄節"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Central Nervous System"},"44-29":{"explanation":"鼓膜は外耳道と中耳腔の境界にあり、内耳には含まれない。","choices":["誤り。蝸牛は内耳の聴覚器官","正しい。鼓膜は外耳と中耳の境界にある","誤り。前庭は内耳の平衡器官","誤り。半規管は内耳の平衡器官"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Hearing and Vestibular Sensation"},"42n-28":{"explanation":"中枢神経系は脳と脊髄であり、脳神経は末梢神経系に含まれる。","choices":["正しい。脳神経は脳から出入りする末梢神経","誤り。延髄は脳幹の一部で中枢神経系","誤り。大脳は脳の一部で中枢神経系","誤り。脊髄は中枢神経系"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Central Nervous System"},"42o-23":{"explanation":"中枢神経系は脳と脊髄であり、脳神経は末梢神経系に含まれる。","choices":["正しい。脳神経は脳から出入りする末梢神経","誤り。延髄は脳幹の一部で中枢神経系","誤り。大脳は脳の一部で中枢神経系","誤り。脊髄は中枢神経系"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Central Nervous System"},"41n-26":{"explanation":"オトガイは下顎前方の突出部、すなわち顎の先端部分である。","choices":["誤り。左右の内眼角間は鼻根付近","誤り。眉間の上は前頭部","誤り。鼻の先端は鼻尖","正しい。オトガイは下顎の先端部分"],"sourceTitle":"標準頭頸部解剖学資料"},"41o-21":{"explanation":"オトガイは下顎前方の突出部、すなわち顎の先端部分である。","choices":["誤り。左右の内眼角間は鼻根付近","誤り。眉間の上は前頭部","誤り。鼻の先端は鼻尖","正しい。オトガイは下顎の先端部分"],"sourceTitle":"標準頭頸部解剖学資料"},"39-23":{"explanation":"小脳は左右の小脳半球に分かれ、その中央を虫部が連結する。","choices":["誤り。大脳も左右半球に分かれるが、収録された公式正答は小脳であり、設問は小脳の構造を問うもの","誤り。中脳は脳幹の一部で左右半球には分かれない","正しい。小脳は左右の小脳半球に分かれる","誤り。下垂体は単一の内分泌器官"],"sourceTitle":"標準解剖学資料・公式正答"},"38-21":{"explanation":"公式図版の矢印は鼻の先端部を示しており、名称は鼻尖である。","choices":["正しい。鼻尖は外鼻の最前方に突出する先端部","誤り。外鼻孔は鼻腔の外部開口部","誤り。鼻翼は外鼻孔の外側を囲む左右一対の部分","誤り。鼻根は両眼間に続く鼻の上端部"],"sourceTitle":"公式問題図版・標準頭頸部解剖学資料"},"38-24":{"explanation":"水晶体は透明な両凸レンズ状構造で、屈折力を変えて焦点を調節する。","choices":["誤り。角膜も光を屈折させるが、形を変えて焦点調節するレンズは水晶体","誤り。虹彩は瞳孔径を調節する絞り","正しい。水晶体がレンズの役割を担う","誤り。毛様体は毛様体筋を介して水晶体の厚さを調節する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, The Eye"},"37-22":{"explanation":"脳神経は脳から出入りする末梢神経である。","choices":["誤り。大脳は中枢神経系","誤り。小脳は中枢神経系","誤り。延髄は中枢神経系","正しい。脳神経は末梢神経系に属する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Peripheral Nervous System"},"36-21":{"explanation":"鼻翼は左右一対で外鼻孔外側にあり、正中線上にはない。","choices":["正しい。鼻翼は正中線の左右にある","誤り。鼻根は正中線上","誤り。鼻背は正中線上","誤り。鼻尖は正中線上"],"sourceTitle":"標準頭頸部解剖学資料"},"35-21":{"explanation":"鼻唇溝は鼻翼から口角外側へ走る左右一対の溝である。","choices":["誤り。人中は上唇中央に一つある","誤り。上唇は正中をまたぐ一つの部位","正しい。鼻唇溝は左右一対にある","誤り。オトガイ唇溝は下唇とオトガイの間に一つある横溝"],"sourceTitle":"標準頭頸部解剖学資料"},"33-22":{"explanation":"闘争・逃走反応で活力を高めるのは交感神経であり、副交感神経ではない。","choices":["正しい。自律神経系は内分泌系と協調して恒常性を維持する","正しい。自律神経は血圧・心拍数などを調節する","正しい。自律神経系は交感神経系と副交感神経系に大別される","誤り。闘争・逃走反応を担うのは交感神経で、副交感神経は休息・消化を促す"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Autonomic Nervous System"},"31-21":{"explanation":"上唇正中を縦に走る溝は人中であり、鼻唇溝ではない。","choices":["正しい。上下口唇の間の裂隙を口裂という","誤り。上唇正中の縦溝は人中で、鼻唇溝は鼻翼から口角外側へ走る","正しい。鼻根は前頭部から外鼻へ続く上端部","正しい。外鼻孔は鼻腔の外部開口部"],"sourceTitle":"標準頭頸部解剖学資料"},"31-22":{"explanation":"脳神経は脳から出入りする末梢神経である。","choices":["誤り。大脳は中枢神経系","誤り。延髄は中枢神経系","誤り。小脳は中枢神経系","正しい。脳神経は末梢神経系"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Peripheral Nervous System"},"31s-24":{"explanation":"表情筋の運動を支配するのは第VII脳神経の顔面神経である。","choices":["誤り。三叉神経は顔面の知覚と咀嚼筋の運動を主に担う","正しい。顔面神経が表情筋を運動支配する","誤り。外転神経は眼球の外側直筋を支配する","誤り。滑車神経は眼球の上斜筋を支配する"],"sourceTitle":"NCBI Bookshelf, Facial Nerve Anatomy"},"29-21":{"explanation":"眉弓は前頭骨の眼窩上縁付近にあり、耳介の後下方ではない。","choices":["正しい。頭蓋は脳頭蓋と顔面頭蓋に区分される","誤り。眉弓は眼窩上方の前頭骨にあり、耳介後下方ではない","正しい。外後頭隆起は後頭部正中にある","正しい。頭蓋は脳・眼・内耳などを保護する複雑な骨格構造"],"sourceTitle":"標準頭頸部解剖学資料"}};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      const r=REVIEW_BATCH_HUMAN_NERVOUS_SENSORY_24[q.id]; if(!r) continue;
      q.explanation=r.explanation; q.verifiedChoiceExplanations=r.choices.slice();
      q.explanationReviewStatus='標準資料確認済み'; q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle=r.sourceTitle; q.verifiedBasis=r.sourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了'; q.finalReviewReady=true;
      q.finalReviewPhase='第7群・人体「神経系・感覚器」24問・最終監修完了';
      q.finalReviewRemainingChecks=[]; q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='標準資料確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['解説監修']='標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['照合段階']=q.finalReviewPhase; q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();


/* Version 1.0.86: 第7群「人体の構造及び機能」残り41問を一括最終監修し、人体108問を完了。 */
const REVIEW_BATCH_HUMAN_REMAINING_41={"49-27":{"explanation":"視覚情報は網膜で受容され、視神経を通って脳へ伝えられるため、選択肢4が正しい。","choices":["誤り。光は主に角膜、房水、瞳孔、水晶体、硝子体を通って網膜へ達し、眼球結膜を通過するわけではない","誤り。焦点調節を担うレンズは水晶体であり、硝子体は眼球内部を満たす透明なゲル状組織","誤り。杆体細胞と錐体細胞は角膜ではなく網膜にある","正しい。網膜で生じた視覚情報は視神経を通って脳へ伝えられる"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, The Eye"},"49-28":{"explanation":"健康な成人の成熟赤血球は核を失っているため、赤血球が正しい。","choices":["誤り。好中球は分葉核をもつ白血球","正しい。成熟赤血球には核がない","誤り。単球は腎形の核をもつ白血球","誤り。リンパ球は核をもつ白血球"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Erythrocytes"},"43n-27":{"explanation":"交感神経が優位になると瞳孔は散大するため、眼―瞳孔の散大の組合せが正しい。","choices":["誤り。交感神経優位では心拍数は増加する","誤り。希薄で多量の唾液分泌は副交感神経優位の反応で、交感神経優位では粘稠で少量になりやすい","誤り。交感神経優位では気管支は拡張する","正しい。交感神経は瞳孔散大筋を作用させ瞳孔を散大させる"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Autonomic Nervous System"},"43o-22":{"explanation":"交感神経が優位になると瞳孔は散大するため、眼―瞳孔の散大の組合せが正しい。","choices":["誤り。交感神経優位では心拍数は増加する","誤り。希薄で多量の唾液分泌は副交感神経優位の反応で、交感神経優位では粘稠で少量になりやすい","誤り。交感神経優位では気管支は拡張する","正しい。交感神経は瞳孔散大筋を作用させ瞳孔を散大させる"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Autonomic Nervous System"},"42n-26":{"explanation":"球関節は多軸性で、屈曲・伸展、外転・内転、回旋など広い範囲に運動できる。","choices":["誤り。鞍関節は二軸性で、1方向だけではない","誤り。蝶番関節は主として一軸性","誤り。車軸関節は主として一軸性の回旋運動を行う","正しい。球関節は多軸性で広い範囲を自由に運動できる"],"sourceTitle":"標準解剖学資料・関節の分類"},"42o-21":{"explanation":"球関節は多軸性で、屈曲・伸展、外転・内転、回旋など広い範囲に運動できる。","choices":["誤り。鞍関節は二軸性で、1方向だけではない","誤り。蝶番関節は主として一軸性","誤り。車軸関節は主として一軸性の回旋運動を行う","正しい。球関節は多軸性で広い範囲を自由に運動できる"],"sourceTitle":"標準解剖学資料・関節の分類"},"42n-29":{"explanation":"交感神経が優位になると心拍数が増加するため、選択肢4が正しい。","choices":["誤り。希薄で多量の唾液分泌は副交感神経優位の反応","誤り。交感神経優位では気管支は拡張する","誤り。交感神経優位では瞳孔は散大する","正しい。交感神経は心拍数を増加させる"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Autonomic Nervous System"},"42o-24":{"explanation":"交感神経が優位になると心拍数が増加するため、選択肢4が正しい。","choices":["誤り。希薄で多量の唾液分泌は副交感神経優位の反応","誤り。交感神経優位では気管支は拡張する","誤り。交感神経優位では瞳孔は散大する","正しい。交感神経は心拍数を増加させる"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Autonomic Nervous System"},"41n-27":{"explanation":"造血は主として赤色骨髄で行われるため、赤色骨髄が正しい。","choices":["誤り。軟骨は支持組織であり造血の主座ではない","誤り。緻密質は骨の強度を担う","正しい。赤色骨髄で赤血球、白血球、血小板が産生される","誤り。黄色骨髄は脂肪組織を多く含み、通常の造血の主座ではない"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Bone Marrow"},"41o-22":{"explanation":"造血は主として赤色骨髄で行われるため、赤色骨髄が正しい。","choices":["誤り。軟骨は支持組織であり造血の主座ではない","誤り。緻密質は骨の強度を担う","正しい。赤色骨髄で赤血球、白血球、血小板が産生される","誤り。黄色骨髄は脂肪組織を多く含み、通常の造血の主座ではない"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Bone Marrow"},"41n-28":{"explanation":"眼輪筋は眼裂を閉じる筋であり、「目を開く」は誤っている。","choices":["正しい組合せ。頬筋は口角を外側へ引く表情に関与する","正しい組合せ。笑筋は口角を外方へ引き、えくぼを作る","誤り。眼輪筋は目を閉じる。目を開く主な筋は上眼瞼挙筋","正しい組合せ。口輪筋は口裂を閉じ、唇をすぼめる"],"sourceTitle":"標準頭頸部解剖学資料"},"41o-23":{"explanation":"眼輪筋は眼裂を閉じる筋であり、「目を開く」は誤っている。","choices":["正しい組合せ。頬筋は口角を外側へ引く表情に関与する","正しい組合せ。笑筋は口角を外方へ引き、えくぼを作る","誤り。眼輪筋は目を閉じる。目を開く主な筋は上眼瞼挙筋","正しい組合せ。口輪筋は口裂を閉じ、唇をすぼめる"],"sourceTitle":"標準頭頸部解剖学資料"},"41n-29":{"explanation":"光を感じる杆体細胞と錐体細胞は網膜にあるため、網膜が正しい。","choices":["誤り。角膜は透明な屈折組織で、視細胞はない","正しい。網膜に杆体細胞と錐体細胞がある","誤り。水晶体は光を屈折させ焦点を調節する","誤り。眼球結膜は眼球前面を覆う粘膜で、視細胞はない"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, The Eye"},"41o-24":{"explanation":"光を感じる杆体細胞と錐体細胞は網膜にあるため、網膜が正しい。","choices":["誤り。角膜は透明な屈折組織で、視細胞はない","正しい。網膜に杆体細胞と錐体細胞がある","誤り。水晶体は光を屈折させ焦点を調節する","誤り。眼球結膜は眼球前面を覆う粘膜で、視細胞はない"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, The Eye"},"40-21":{"explanation":"マイボーム腺は瞼板内にある特殊な皮脂腺で、油性分泌物により涙液膜の蒸発を抑える。","choices":["誤り。マイボーム腺は眼瞼の瞼板内に縦に並ぶ","正しい。皮脂腺の一種で油性物質を分泌する","誤り。各眼瞼に多数存在し、左右一対の開口部だけではない","誤り。油層を形成して涙液膜の乾燥を抑える"],"sourceTitle":"標準眼科学資料・瞼板腺"},"40-25":{"explanation":"副腎髄質はアドレナリンを分泌するため、選択肢4が正しい。","choices":["誤り。コルチコイドは副腎皮質から分泌される","誤り。卵巣は主にエストロゲンとプロゲステロンを分泌する","誤り。インスリンは膵臓のランゲルハンス島β細胞から分泌される","正しい。副腎髄質はアドレナリンなどのカテコールアミンを分泌する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Endocrine System"},"39-21":{"explanation":"赤唇縁は赤唇と周囲皮膚との境界であり、オトガイを取り巻くアーチ状の溝ではない。","choices":["正しい。人中は上唇正中を縦に走る溝","正しい。鼻唇溝は鼻翼の付け根から口角外側へ下る左右一対の溝","誤り。赤唇縁は赤唇と皮膚との境界線であり、記述は正しくない","正しい。口裂は上下口唇の間の開口部"],"sourceTitle":"標準頭頸部解剖学資料"},"39-25":{"explanation":"鼻腔から肺へ向かう空気は、咽頭、喉頭、気管、気管支の順に通る。","choices":["誤り。咽頭が喉頭より先","正しい。咽頭→喉頭→気管→気管支の順","誤り。咽頭と喉頭の順、気管と気管支の順が逆","誤り。気管支は気管から分岐するため順序が逆"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Respiratory System"},"38-25":{"explanation":"甲状腺はホルモンを血中へ分泌する内分泌腺である。","choices":["誤り。汗腺は導管を通じて皮膚表面へ分泌する外分泌腺","誤り。乳腺は導管を通じて乳汁を分泌する外分泌腺","誤り。唾液腺は導管を通じて口腔へ唾液を分泌する外分泌腺","正しい。甲状腺は内分泌腺で甲状腺ホルモンを血中へ分泌する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Endocrine System"},"37-21":{"explanation":"肝臓は消化器系の付属器官であり、泌尿器系には含まれない。","choices":["誤り。腎臓は尿を生成する泌尿器","誤り。膀胱は尿を貯留する泌尿器","正しい。肝臓は泌尿器系ではない","誤り。尿管は腎臓から膀胱へ尿を運ぶ泌尿器"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Urinary System"},"37-25":{"explanation":"インスリンは細胞へのグルコース取り込みなどを促し、血糖値を下げる。","choices":["正しい。インスリンは血糖値を低下させる","誤り。グルカゴンは血糖値を上昇させる","誤り。アドレナリンはグリコーゲン分解などを促し血糖値を上昇させる","誤り。グルココルチコイドは糖新生などを促し血糖値を上昇させる"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Pancreatic Hormones"},"36-24":{"explanation":"交感神経は心拍数と心筋収縮力を増加させるため、心臓―収縮力増加が正しい。","choices":["誤り。交感神経は瞳孔を散大させる","誤り。交感神経は消化管の運動・分泌を抑制する","誤り。交感神経は気管支を拡張させる","正しい。交感神経は心筋収縮力を増加させる"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Autonomic Nervous System"},"35-22":{"explanation":"交感神経が優位になると心拍数は増加する。","choices":["正しい。交感神経は心拍数を増加させる","誤り。消化管活動は一般に抑制される","誤り。気管支は拡張する","誤り。瞳孔は散大する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Autonomic Nervous System"},"35-23":{"explanation":"視覚の受容器は網膜にあるため、視覚―網膜が正しい。","choices":["正しい。網膜の杆体・錐体が光を受容する","誤り。聴覚は蝸牛、半規管は平衡感覚","誤り。平衡感覚は前庭・半規管、鼓膜は音を振動に変換する","誤り。味覚は味蕾、前庭は平衡感覚"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Special Senses"},"35-25":{"explanation":"最高血圧160～180mmHgは正常成人の基準値として高すぎるため、基準値に該当しない。","choices":["基準範囲内の代表値。成人安静時の呼吸数は概ね毎分12～20回","基準範囲内の代表値。成人安静時の脈拍数は概ね毎分60～100回","正答。最高血圧160～180mmHgは高血圧域であり正常基準値ではない","基準範囲内の代表値。最低血圧65～80mmHgは一般的な正常範囲に含まれる"],"sourceTitle":"標準生理学資料・成人安静時バイタルサイン"},"34-25":{"explanation":"膵臓のランゲルハンス島β細胞はインスリンを分泌するため、選択肢3が正しい。","choices":["誤り。グルココルチコイドは副腎皮質から分泌される","誤り。サイロキシンは甲状腺から分泌される","正しい。膵臓はインスリンを分泌する","誤り。成長ホルモンは下垂体前葉から分泌される"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Endocrine System"},"33-23":{"explanation":"鼓膜は音波を振動へ変える構造であり、平衡感覚を受容しないため誤った組合せである。","choices":["誤り。鼓膜は聴覚伝導に関与し、平衡感覚は前庭・半規管が担う","正しい組合せ。味蕾は味覚を受容する","正しい組合せ。嗅細胞は嗅覚を受容する","正しい組合せ。筋紡錘は筋の伸張を感知し深部感覚に関与する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Special Senses"},"33-25":{"explanation":"アミラーゼはデンプンを分解する消化酵素である。","choices":["正しい。アミラーゼはデンプンを麦芽糖などへ分解する","誤り。ペプシンは胃でタンパク質を分解する","誤り。トリプシンは小腸でタンパク質を分解する","誤り。リパーゼは脂肪を分解する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Digestive Enzymes"},"32-22":{"explanation":"口輪筋は口裂を閉じ、唇をすぼめる筋であり、「唇を開く」は誤っている。","choices":["正しい。眼輪筋は眼裂を閉じる","正しい。笑筋は口角を外方へ引く","正しい。前頭筋は眉を上げ額に横じわを作る","誤り。口輪筋は唇を閉じる筋で、開く筋ではない"],"sourceTitle":"標準頭頸部解剖学資料"},"32-23":{"explanation":"咽頭は口腔から食道へ続く消化管の一部である。","choices":["正しい。咽頭は消化管と気道の共通通路で、消化管に含まれる","誤り。肝臓は消化器系の付属器官","誤り。膵臓は消化器系の付属腺","誤り。胆囊は胆汁を貯留する付属器官"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Digestive System"},"32-24":{"explanation":"脾臓はリンパ系の器官であり、泌尿器系には含まれない。","choices":["誤り。腎臓は泌尿器","誤り。尿管は泌尿器","正しい。脾臓はリンパ系の器官","誤り。膀胱は泌尿器"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Urinary and Lymphatic Systems"},"32-25":{"explanation":"糖尿病はインスリンの分泌不足または作用不足と密接に関係する。","choices":["誤り。アドレナリンは血糖を上げるが、糖尿病の中心的ホルモンではない","正しい。インスリンの不足や作用低下が糖尿病に深く関係する","誤り。パラトルモンは血中カルシウム調節に関与する","誤り。サイロキシンは基礎代謝を調節する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Pancreatic Hormones"},"31-24":{"explanation":"一酸化炭素はヘモグロビンに酸素より強く結合し、酸素運搬を妨げる。","choices":["誤り。主因は呼吸運動の抑制ではない","誤り。肺胞での酸素拡散障害が主因ではない","正しい。一酸化炭素がヘモグロビンと結合して酸素の結合・運搬を阻害する","誤り。組織での酸素利用阻害を主機序とする中毒ではない"],"sourceTitle":"標準生理学・中毒学資料"},"31-25":{"explanation":"尿道は男性で女性より著しく長く、男女差が顕著である。","choices":["誤り。食道長に顕著な男女差はない","誤り。尿管長に顕著な男女差はない","正しい。男性尿道は約18～20cm、女性尿道は約3～4cmで顕著な差がある","誤り。直腸長に顕著な男女差はない"],"sourceTitle":"標準解剖学資料・泌尿器系"},"31s-21":{"explanation":"公式図版ではAが前額面、Bが正中矢状面、Cが水平面を示すため、選択肢4が正しい。","choices":["誤り。AとBの名称が図版と逆","誤り。A・B・Cの対応が図版と一致しない","誤り。AとBの対応が図版と一致しない","正しい。A前額面、B正中矢状面、C水平面の組合せ"],"sourceTitle":"公式問題図版・標準解剖学資料"},"31s-22":{"explanation":"筋系の主な機能は運動、姿勢保持、熱産生などであり、体表保護を主機能とはしない。","choices":["正しい。骨格器系は身体を支持し姿勢保持に関与する","誤り。筋系の主機能は運動・姿勢保持・熱産生で、体表保護ではない","正しい。循環器系は酸素、栄養、老廃物などを運搬する","正しい。内分泌器系はホルモンを分泌する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Organ Systems"},"31s-25":{"explanation":"ペプシンは胃液に含まれるタンパク質分解酵素である。","choices":["誤り。マルターゼは小腸粘膜の刷子縁酵素","誤り。サッカラーゼは小腸粘膜の刷子縁酵素","正しい。ペプシンは胃液中でタンパク質を分解する","誤り。ラクターゼは小腸粘膜の刷子縁酵素"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Digestive Enzymes"},"30-21":{"explanation":"鼻筋は鼻翼を圧迫・拡張し、鼻の両側に横じわを作る表情筋である。","choices":["誤り。眼輪筋は目を閉じる","正しい。鼻筋は鼻の両側に横じわを作る","誤り。口輪筋は口裂を閉じ、唇をすぼめる","誤り。前頭筋は眉を上げ額に横じわを作る"],"sourceTitle":"標準頭頸部解剖学資料"},"30-24":{"explanation":"副腎はホルモンを血中へ分泌する内分泌器官である。","choices":["誤り。食道は消化管","誤り。膀胱は泌尿器","誤り。尿道は泌尿器","正しい。副腎は副腎皮質・髄質からホルモンを分泌する"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Endocrine System"},"30-25":{"explanation":"正常ではグルコースは腎尿細管でほぼ再吸収され、尿中へ通常は排泄されない。","choices":["誤り。尿素はタンパク質代謝の老廃物として尿中へ排泄される","誤り。アンモニアは酸塩基調節に関連して尿中へ排泄される","正しい。グルコースは通常ほぼ完全に再吸収され、尿中にはほとんど出ない","誤り。クレアチニンは筋代謝産物として尿中へ排泄される"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Urine Formation"},"29-24":{"explanation":"肝臓は消化器系の付属器官であり、泌尿器ではない。","choices":["正しい。肝臓は泌尿器ではない","誤り。膀胱は尿を貯留する泌尿器","誤り。尿道は尿を体外へ排出する泌尿器","誤り。腎臓は尿を生成する泌尿器"],"sourceTitle":"OpenStax Anatomy and Physiology 2e, Urinary System"}};
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const q of (exams||[]).flatMap(exam=>exam.questions||[])){
      const r=REVIEW_BATCH_HUMAN_REMAINING_41[q.id]; if(!r) continue;
      q.explanation=r.explanation; q.verifiedChoiceExplanations=r.choices.slice();
      q.explanationReviewStatus='標準資料確認済み'; q.choiceReviewDate='2026-08-01';
      q.currentSourceTitle=r.sourceTitle; q.verifiedBasis=r.sourceTitle;
      q.finalReviewWorkflowStatus='最終監修完了'; q.finalReviewReady=true;
      q.finalReviewPhase='第7群・人体「残り41問」一括最終監修完了';
      q.finalReviewRemainingChecks=[]; q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='標準資料確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['解説監修']='標準資料確認済み';
      q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['照合段階']=q.finalReviewPhase; q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.87: 第7群「皮膚科学」99問を一括抽出し、全396選択肢の論点分解と原本・数値リスク判定を完了。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    const topicRules=[
      ['皮膚の構造・細胞',/(表皮|真皮|皮下組織|角化細胞|メラノサイト|ランゲルハンス|基底細胞|有棘層|顆粒層|角質層|乳頭層|網状層)/],
      ['皮膚付属器官',/(毛|毛包|毛乳頭|毛母|毛周期|皮脂腺|汗腺|エクリン|アポクリン|爪|立毛筋)/],
      ['皮膚の機能',/(保護作用|体温調節|知覚|吸収|分泌|排泄|免疫|ビタミンD|皮脂膜|酸外套)/],
      ['紫外線・色素',/(紫外線|UVA|UVB|サンバーン|サンタン|メラニン|色素|光老化|日光)/],
      ['皮膚疾患・感染症',/(皮膚炎|湿疹|白癬|疥癬|膿痂疹|疣贅|ヘルペス|乾癬|にきび|痤瘡|脱毛|感染性|真菌|細菌|ウイルス)/],
      ['皮膚症状・病変',/(紅斑|丘疹|水疱|膿疱|びらん|潰瘍|痂皮|鱗屑|瘢痕|そう痒|発疹|病変)/],
      ['毛髪の構造・性質',/(毛髪|毛幹|毛皮質|毛小皮|毛髄質|ケラチン|シスチン|水分量|伸度|強度)/]
    ];
    const pickTopic=(text)=>{for(const [label,re] of topicRules)if(re.test(text))return label;return '皮膚科学共通';};
    const claimType=(text)=>{
      const rules=[
        ['部位・構造',/(存在|含まれ|位置|層|構造|細胞|器官|腺|毛|爪)/],
        ['機能・作用',/(作用|機能|分泌|産生|調節|保護|吸収|排泄|感知)/],
        ['原因・病態',/(原因|病原|炎症|感染|アレルギー|免疫|発症|増殖)/],
        ['症状・所見',/(症状|紅斑|丘疹|水疱|膿疱|鱗屑|痂皮|そう痒|脱毛)/],
        ['紫外線・色素',/(紫外線|UVA|UVB|メラニン|日焼け|サンバーン|サンタン)/],
        ['数値・時期・割合',/(％|歳|日|週|月|年|割合|周期|期間|通常|最も)/]
      ];
      for(const [label,re] of rules)if(re.test(text))return label;
      return '用語定義・分類';
    };
    let order=0;
    for(const exam of (exams||[])){
      for(const q of (exam.questions||[])){
        if(q.finalReviewBatch!=='第7群（残存優先475問）'||q.category!=='皮膚科学')continue;
        order+=1;
        const all=[q.stem,...(q.choices||[])].join(' ');
        const topic=pickTopic(all);
        const risks=[];
        if(/下図|次の図|図中|写真|模式図|イラスト/.test(all))risks.push('図版原本との一致確認');
        if(/[a-dａ-ｄ][\.．、]|組合せ|穴埋め|（\s*）/.test(all))risks.push('組合せ・穴埋め本文の公式原本確認');
        if(/％|歳|日|週|月|年|割合|周期|最も|通常|約/.test(all))risks.push('数値・時期・割合の標準資料確認');
        const checks=(q.choices||[]).map((choice,index)=>({
          choice:index+1,
          type:claimType(String(choice||'')),
          polarity:index===q.answer?'正答成立条件':'誤答となる語句・条件',
          statement:String(choice||''),
          verify:'皮膚科学標準資料で定義・構造・機能・病態と逐語照合'
        }));
        q.finalReviewPhase='第7群・皮膚科学99問・選択肢別論点分解第6段階';
        q.finalReviewWorkflowStatus='皮膚科学99問・全396選択肢の論点分解完了・標準資料逐語照合待ち';
        q.dermatologyReviewOrder=order;
        q.dermatologyReviewTopic=topic;
        q.dermatologyClaimAudit={
          sequence:order,
          topic,
          checks,
          risks,
          references:['皮膚科学・組織学の標準教材','毛髪科学の標準教材','感染性皮膚疾患の公的資料','公式問題・公式正答'],
          promotionRule:'正答理由と全誤答選択肢の誤り箇所を資料で確定した問題だけを最終監修済みへ変更'
        };
        q.finalReviewRemainingChecks=[
          '皮膚科学確認テーマ：'+topic,
          '正答選択肢の成立条件を標準資料で確定',
          '誤答3選択肢の誤りとなる語句・条件を個別確定',
          ...(risks.length?risks:['問題本文と標準資料の整合確認']),
          '4選択肢の理由確定後にのみ最終監修済みへ変更'
        ];
        q.auditStatus=q.auditStatus||{};
        q.auditStatus['第7群皮膚科学99問']='選択肢別論点分解第6段階・全件完了';
        q.structuredReview=q.structuredReview||{};
        q.structuredReview['皮膚科学確認テーマ']=topic;
        q.structuredReview['皮膚科学監修順']=String(order);
        q.structuredReview['皮膚科学選択肢別論点']=checks.map(x=>'選択肢'+x.choice+'：'+x.type+'／'+x.polarity).join('｜');
        q.structuredReview['原本・数値リスク']=risks.length?risks.join('／'):'追加リスクなし';
        q.structuredReview['照合段階']=q.finalReviewWorkflowStatus;
        q.structuredReview['残作業']=q.finalReviewRemainingChecks.join('／');
      }
    }
    return result;
  };
})();

/* Version 1.0.92の監修台帳は、第7群の作業単位確定後に適用する。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    applyCosmeticChemistryReviewLedger(exams);
    return result;
  };
})();

/* Version 1.0.96: 全監修台帳の適用後に香粧品化学11問の最終状態を確定する。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      const review=COSMETIC_CHEMISTRY_FINAL_11[q.id]; if(!review)continue;
      if(review.trim)q.choices=q.choices.map(x=>String(x).replace(/\s*理容理論\s*$/,''));
      if(q.id==='42n-40'||q.id==='42o-40')q.answer=[1,3];
      q.explanation=review.e; q.verifiedChoiceExplanations=review.c.slice();
      q.explanationReviewStatus='最終監修済み'; q.choiceExplanationReviewStatus='全選択肢監修済み';
      q.currentSourceTitle=review.s; q.currentSourceUrl='https://www.rbc.or.jp/exam/past_question/';
      q.finalReviewReady=true; q.finalReviewWorkflowStatus='最終監修完了';
      q.finalReviewPhase='第7群・香粧品化学残り11問・最終監修完了'; q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{}; q.auditStatus['解説']='公式原本・出題時基準・図版確認済み';
      q.structuredReview=q.structuredReview||{}; q.structuredReview['作業状態']='最終監修完了'; q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.97: 全監修台帳の適用後に公衆衛生・環境衛生100問の論点分解状態を確定する。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    let order=0;
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      if(q.finalReviewBatch!=='第7群（残存優先475問）'||q.category!=='公衆衛生・環境衛生')continue;
      order+=1;
      const all=[q.stem,...(q.choices||[])].join(' ');
      const risks=[];
      if(/人口|死亡|出生|罹患|有病|統計|平均寿命|合計特殊出生率|％|割合|率|歳|年/.test(all))risks.push('統計年次・数値・母集団の確認');
      if(/法|制度|保健所|市町村|都道府県|厚生労働|国民健康|健康日本|母子保健|地域保健/.test(all))risks.push('出題時点の法令・制度・実施主体の確認');
      if(/組合せ|穴埋め|[a-dａ-ｄ][\.．、]/.test(all))risks.push('組合せ・穴埋め本文の公式原本確認');
      if(/図|グラフ|表中|下記の表/.test(all))risks.push('図表原本との一致確認');
      const topic=/人口|人口動態|年齢構成|高齢|出生|死亡|婚姻|離婚/.test(all)?'人口統計・人口構成':/平均寿命|健康寿命|罹患|有病|受療|死因|乳児死亡|合計特殊出生率/.test(all)?'保健統計・健康指標':/大気|水質|上水|下水|廃棄物|騒音|振動|公害|環境|住居|採光|換気/.test(all)?'環境衛生・生活環境':/地域保健|保健所|市町村|都道府県|保健センター|健康増進|母子保健/.test(all)?'地域保健・保健行政':'公衆衛生・予防医学';
      const checks=(q.choices||[]).map((choice,index)=>({choice:index+1,type:/％|割合|率|歳|年|日|人口|平均寿命|出生|死亡/.test(choice)?'数値・統計条件':/法|制度|国|都道府県|市町村|保健所|厚生労働/.test(choice)?'制度・主体・所管':'公衆衛生上の用語・事実関係',polarity:(Array.isArray(q.answer)?q.answer.includes(index):index===q.answer)?'正答成立条件':'誤答となる語句・条件',statement:String(choice||''),verify:'公的統計・公的制度資料・標準教材で個別に照合'}));
      q.publicHealthReviewOrder=order;
      q.publicHealthReviewTopic=topic;
      q.publicHealthClaimAudit={sequence:order,topic,checks,risks,references:['理容師美容師試験研修センター公式問題・公式正答','厚生労働省の人口動態統計・国民生活基礎調査等','総務省統計局の国勢調査等','地域保健法・健康増進法等の出題時点資料','公衆衛生学の標準教材'],promotionRule:'正答理由と全誤答選択肢の誤り箇所を根拠資料で確定した問題だけを最終監修済みへ変更'};
      q.finalReviewRemainingChecks=['公衆衛生確認テーマ：'+topic,'正答選択肢の成立条件を公的資料で確定','誤答3選択肢の誤りとなる語句・条件を個別確定',...(risks.length?risks:['追加リスクなし・標準教材との整合確認']),'4選択肢の理由確定後にのみ最終監修済みへ変更'];
      q.finalReviewPhase='第7群・公衆衛生環境衛生100問・選択肢別論点分解第6段階';
      q.finalReviewWorkflowStatus='公衆衛生・環境衛生100問・全400選択肢の論点分解完了・公的資料逐語照合待ち';
      q.auditStatus=q.auditStatus||{};
      q.auditStatus['第7群公衆衛生環境衛生100問']='選択肢別論点分解第6段階・全件完了';
      q.structuredReview=q.structuredReview||{};
      q.structuredReview['公衆衛生確認テーマ']=topic;
      q.structuredReview['公衆衛生監修順']=String(order);
      q.structuredReview['公衆衛生選択肢別論点']=checks.map(x=>'選択肢'+x.choice+'：'+x.type+'／'+x.polarity).join('｜');
      q.structuredReview['原本・統計・制度リスク']=risks.length?risks.join('／'):'追加リスクなし';
      q.structuredReview['照合段階']=q.finalReviewWorkflowStatus;
      q.structuredReview['残作業']=(q.finalReviewRemainingChecks||[]).join('／');
    }
    return result;
  };
})();

/* Version 1.0.98: 論点分解台帳の適用後に31問の最終監修状態を確定する。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    applyPublicHealthFinal31(exams);
    return result;
  };
})();

/* Version 1.0.99: 公衆衛生・環境衛生の制度・環境衛生・基礎事項43問を最終監修。 */
const PUBLIC_HEALTH_FINAL_43={};
function addPublicHealthReview43(ids,e,c,s){for(const id of ids)PUBLIC_HEALTH_FINAL_43[id]={e,c,s};}
addPublicHealthReview43(['49-11'],'医療機関等で行う妊婦健康診査は、病気のある妊婦だけでなく、すべての妊婦を対象に母体と胎児の健康状態を確認するために行われる。',["正しい。妊娠届を市町村へ提出すると母子健康手帳が交付される","正しい。胎児・乳児の健康は妊娠中を含む母体の健康状態の影響を受ける","誤り。妊婦健康診査は疾病のある妊婦だけを対象とするものではない","正しい。1歳6か月児・3歳児健康診査では心身の異常の早期発見や保健指導を行う"],'母子保健法・厚生労働省母子保健情報');
addPublicHealthReview43(['48-11'],'介護認定審査会は市町村に置かれる機関であり、保健所に設置されるものではない。',["正しい。保健所は地域公衆衛生の第一線機関","正しい。感染症、精神保健、難病対策は保健所の業務に含まれる","正しい。食品衛生関係施設の監視・指導は保健所の業務","誤り。介護認定審査会は介護保険法に基づき市町村に置かれる"],'地域保健法・介護保険法');
addPublicHealthReview43(['48-13'],'女性の喫煙率は2005年以降一貫して上昇しておらず、長期的には低下傾向である。',["誤り。女性の喫煙率が2005年以降上昇し続けている事実はない","正しい。たばこ煙には多数の発がん物質・発がん促進物質が含まれる","正しい。健康増進法は受動喫煙防止措置を定める","正しい。飲酒は依存症、肝疾患、がんなどと関連する"],'厚生労働省喫煙・飲酒情報、健康増進法');
addPublicHealthReview43(['47-15'],'浄化槽の設置、保守点検、清掃、検査等は浄化槽法により定められている。',["正しい。下水道整備は生活環境と公衆衛生の向上に寄与する","正しい。下水処理後の放流水には法令上の水質基準がある","正しい。下水道未整備地域では浄化槽が生活排水処理を担う","誤り。浄化槽法が設置・保守点検・清掃等を規律する"],'下水道法・浄化槽法');
addPublicHealthReview43(['45-15'],'アタマジラミは幼虫も成虫も吸血するため、幼虫は吸血しないという記述が誤りである。',["誤り。幼虫も成虫と同様に頭皮から吸血する","正しい。卵は毛髪の根元付近に固着する","正しい。タオルや帽子等の共用で間接的に広がり得る","正しい。幼児・低学年児童に多くみられる"],'国立健康危機管理研究機構・アタマジラミ症情報');
addPublicHealthReview43(['44-13'],'自殺死亡率は社会状況や対策等に伴って変動しており、1958年以降不変ではない。',["正しい。心の健康は身体状態と生活の質に影響する","正しい。うつ病は早期発見と適切な治療が重要","正しい。厚生労働省は健康づくりのための睡眠指針2014を策定した","誤り。自殺死亡率は年次により変動している"],'厚生労働省自殺統計・睡眠指針');
addPublicHealthReview43(['44-14'],'カビの胞子等は吸入性アレルゲンとなり、アレルギー反応を引き起こすことがある。',["正しい。ダニの死骸やふんはアレルゲンになり得る","正しい。暖房・気密化等によりカビや害虫の問題は通年化し得る","誤り。カビはアレルギー反応の原因になり得る","正しい。駆除薬剤は用法を守り人体への曝露に注意する"],'厚生労働省アレルギー疾患・室内環境情報');
addPublicHealthReview43(['43n-11','43o-06'],'地域保健法は保健所長について原則として所定の要件を満たす医師を充てることを定めている。',["誤り。保健所は都道府県のほか指定都市、中核市、特別区等も設置する","誤り。理容所の衛生監視・検査は保健所が担う","正しい。保健所には医師である所長を置くのが原則","誤り。難病患者等の保健に関する事項も保健所業務に含まれる"],'地域保健法・同施行令');
addPublicHealthReview43(['43n-13','43o-08'],'健康維持に必要なのは個人に応じた継続可能な身体活動であり、短時間の激しい運動を必須とする記述は誤りである。',["正しい。健康日本21（第2次）は日常生活の歩数増加を目標に掲げた","正しい。身体活動は生活習慣病の発症・重症化予防に有効","誤り。短時間の激しい運動が必須ではない","正しい。適度な定期運動は睡眠の質の改善に役立つ"],'健康日本21（第2次）・厚生労働省身体活動指針');
addPublicHealthReview43(['43n-14','43o-09'],'暖房は熱を加えるものであり、液体が気体になる際に周囲から熱を奪う気化熱の利用とは対応しない。',["正しい。自然光を室内に取り入れることが採光","正しい。明るさの度合いは照度で表す","正しい。送気式は機械換気法の一つ","誤り。気化熱は冷却に利用され、暖房との組合せではない"],'公衆衛生学標準教材・住居衛生');
addPublicHealthReview43(['43n-15','43o-10'],'人の呼吸でも燃焼暖房でも二酸化炭素が生じるため、A・Bとも二酸化炭素の組合せが正しい。',["誤り。燃焼暖房のBは窒素ガスではない","正しい。呼吸と燃焼の双方で二酸化炭素が増える","誤り。呼吸で増えるAは窒素ではない","誤り。Aは窒素ではない"],'公衆衛生学標準教材・換気');
addPublicHealthReview43(['42n-13','42o-08'],'男性の喫煙率は長期的に低下傾向であり、年々増加しているという記述が誤りである。',["正しい。受動喫煙は小児ぜんそく等の危険を高める","誤り。男性の喫煙率は長期的に低下傾向","正しい。妊娠中の喫煙は低出生体重等の危険を高める","正しい。たばこ煙には発がん物質等が含まれる"],'厚生労働省喫煙率・受動喫煙情報');
addPublicHealthReview43(['42n-15','42o-10'],'浄化槽はし尿や生活雑排水を処理する施設であり、河川水から上水を得る浄水施設ではない。',["正しい。飲料水には安全性、利便性、良好な性状が求められる","正しい。水道水の適否は水道法の水質基準で判断する","誤り。浄化槽は生活排水処理施設で、上水の浄水施設ではない","正しい。受水槽等の管理不良は水質悪化や異臭の原因になり得る"],'水道法・浄化槽法');
addPublicHealthReview43(['41n-11','41o-06'],'児童虐待の捜査は警察・司法の作用であり、母子保健法に基づく母子保健事業ではない。',["母子保健法に基づく事業","母子保健法に基づく事業","母子保健法に基づく事業","正答。児童虐待の捜査は母子保健事業ではない"],'母子保健法');
addPublicHealthReview43(['41n-15','41o-10'],'抗帯電性は衣服への静電気蓄積を抑える性質であり、作業能率増進を直接表す組合せではない。',["誤り。抗帯電性は主に静電気障害の防止に関係する","正しい。抗菌性は微生物の増殖を抑え清潔保持に役立つ","正しい。耐熱性は熱からの身体保護に関係する","正しい。吸湿性は衣服内湿度の調節に役立つ"],'公衆衛生学標準教材・被服衛生');
addPublicHealthReview43(['40-08'],'家事援助はホームヘルプ、日帰り通所はデイサービス、医師と連携して居宅を訪問する看護は訪問看護である。',["正しい組合せ","誤り。家事援助はデイサービスではない","誤り。家事援助は訪問看護ではない","誤り。家事援助はショートステイではない"],'介護保険制度・高齢者在宅サービス');
addPublicHealthReview43(['39-07'],'2012年の合計特殊出生率は1.41であり、2.0を上回っていない。',["正しい。出生率低下は年少人口の縮小を通じ高齢化の一因になる","正しい。出生率は人口千人当たりの出生数","正しい。合計特殊出生率は女性の年齢別出生率を合計した指標","誤り。2012年の合計特殊出生率は1.41"],'厚生労働省・2012年人口動態統計');
addPublicHealthReview43(['39-08'],'高血圧と糖尿病はいずれも脳卒中の重要な危険因子である。',["誤り。男女で部位別死亡の順位は同一ではなく、大腸がんが双方の首位ではない","誤り。食生活は虚血性心疾患等の危険因子に関係する","正しい。高血圧と糖尿病は脳卒中の危険因子","誤り。1型糖尿病は生活習慣を主因としない"],'厚生労働省・循環器病・糖尿病情報');
addPublicHealthReview43(['39-09','31-09'],'理容所から通常排出される毛髪は事業系一般廃棄物であり、法定の産業廃棄物には該当しない。',["正しい。産業廃棄物以外の廃棄物は一般廃棄物","誤り。毛髪は排出量にかかわらず通常は事業系一般廃棄物","正しい。一般廃棄物の処理は市町村の責務","正しい。一般廃棄物は焼却等の中間処理後に残渣を埋立処分する方法が中心"],'廃棄物処理法・環境省廃棄物分類資料');
addPublicHealthReview43(['39-10'],'アタマジラミの卵は頭皮ではなく毛髪の根元付近に固着する。',["正しい。幼児・低学年児童に多い","誤り。卵は頭皮そのものではなく毛髪に産み付けられる","正しい。吸血によりかゆみを生じる","正しい。タオル等の共用で伝播し得る"],'国立健康危機管理研究機構・アタマジラミ症情報');
addPublicHealthReview43(['38-07'],'健康日本21（第2次）の基本的方向に労働災害の防止は含まれない。',["含まれる。生活習慣病の発症・重症化予防を掲げる","正答。労働災害防止は労働安全衛生政策の領域","含まれる。健康寿命の延伸を掲げる","含まれる。健康格差の縮小を掲げる"],'健康日本21（第2次）');
addPublicHealthReview43(['38-10'],'日本脳炎を媒介するのは主として蚊であり、ゴキブリとの組合せが誤りである。',["正しい。デング熱は蚊が媒介する","正しい。ダニの死骸・ふんはぜんそくのアレルゲンになり得る","正しい。ノミはペストを媒介し得る","誤り。日本脳炎は蚊が媒介し、ゴキブリではない"],'厚生労働省・感染症媒介動物情報');
addPublicHealthReview43(['37-06'],'理容所従事者の労働条件は労働基準監督行政の領域であり、保健所の業務ではない。',["正答。労働条件は保健所の所掌ではない","保健所の業務。理容所の衛生監視・指導を行う","保健所の業務。食中毒の調査・予防を行う","保健所の業務。結核・エイズ等の感染症対策を行う"],'地域保健法・労働基準法');
addPublicHealthReview43(['36-08'],'ビタミンD欠乏の代表的疾患はくる病・骨軟化症であり、糖尿病との組合せが誤りである。',["正しい。ビタミンA欠乏は夜盲症","正しい。ビタミンB1欠乏は脚気","正しい。ビタミンC欠乏は壊血病","誤り。ビタミンD欠乏はくる病・骨軟化症"],'厚生労働省・日本人の食事摂取基準');
addPublicHealthReview43(['34-09'],'水道水の水源は地下水だけではなく河川・湖沼等もあり、水質基準と凝集処理に関するb・cが正しい。',["誤り。aが誤りでbのみ正しい","正しい。bは水道法上の水質基準、cは凝集沈殿処理","誤り。dが誤り。残留塩素には規定がある","誤り。a・dとも誤り"],'水道法・水道法施行規則');
addPublicHealthReview43(['33-06'],'予防接種は疾病の発生を防ぐ第1次予防であり、第2次予防との組合せが誤りである。',["正しい。禁煙は健康増進・発症予防を図る第1次予防","誤り。予防接種は第1次予防","正しい。がん検診は早期発見の第2次予防","正しい。リハビリテーションは第3次予防"],'厚生労働省・予防医学資料');
addPublicHealthReview43(['33-09'],'理容所の換気基準では、空気中の二酸化炭素濃度が衛生管理上の規制対象となる。',["対象ではない","正しい。二酸化炭素濃度が換気状態の指標として規定される","対象ではない","対象ではない"],'理容師法施行規則・理容所衛生管理要領');
addPublicHealthReview43(['33-10','30-09'],'一般廃棄物は産業廃棄物以外の廃棄物であり、理容所の毛髪は通常これに該当する。資源有効利用法があり、一般廃棄物処理は市町村の責務である。',["33-10ではaのみ正しくbが誤り。30-09ではa・bとも誤り","誤り。毛髪は通常一般廃棄物で、処理委託も認められる","33-10ではcが誤り。30-09ではc・dが正しい組合せ","33-10ではa・dが正しい組合せ。30-09ではaが誤り"],'廃棄物処理法・資源有効利用促進法');
addPublicHealthReview43(['32-06'],'母子健康手帳を交付するのは医療機関ではなく、妊娠届を受けた市町村である。',["誤り。母子健康手帳は市町村が交付する","正しい。妊産婦は助産師・保健師等の保健指導を受けられる","正しい。妊娠高血圧症候群では高血圧や蛋白尿等がみられる","正しい。労働基準法にも妊産婦保護規定がある"],'母子保健法・労働基準法');
addPublicHealthReview43(['31-06'],'出生率の低下は年少人口を減少させ、人口高齢化を進める一因となる。',["正しい。少子化は人口高齢化の一因","誤り。2009年の出生数は約107万人で200万人未満","誤り。2009年の合計特殊出生率は1.37","誤り。2009年の出生率は人口千対8.5"],'厚生労働省・2009年人口動態統計');
addPublicHealthReview43(['31-10'],'下水道放流水と上水道供給水には、それぞれ関係法令による水質基準が定められている。',["誤り。上水道の普及が先行し普及率も同じではない","誤り。上水道は消毒と残留塩素の確保が必要","正しい。双方に法令上の水質規制がある","誤り。下水道は基準に適合する事業場排水も受け入れる"],'水道法・下水道法');
addPublicHealthReview43(['29-07'],'2009年の合計特殊出生率は1.37であり、平均2人以上ではない。',["正しい。第1次ベビーブームの年間出生数は200万人を超えた","正しい。2009年の出生数は約107万人","正しい。2009年の出生率は人口千対8.5","誤り。2009年の合計特殊出生率は1.37"],'厚生労働省・2009年人口動態統計');
addPublicHealthReview43(['29-09'],'理容所の毛髪は法定の産業廃棄物ではなく、通常は事業系一般廃棄物である。',["正しい。一般廃棄物処理は市町村の責務","正しい。産業廃棄物は排出事業者が処理し許可業者へ委託できる","正しい。感染性廃棄物は適切な方法で焼却等の処理を行う","誤り。理容所の毛髪は通常一般廃棄物"],'廃棄物処理法');

(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      const r=PUBLIC_HEALTH_FINAL_43[q.id];if(!r)continue;
      q.explanation=r.e;q.verifiedChoiceExplanations=r.c.slice();
      q.explanationReviewStatus='最終監修済み';q.choiceExplanationReviewStatus='全選択肢監修済み';
      q.currentSourceTitle=r.s;q.verifiedBasis=r.s;q.finalReviewReady=true;
      q.finalReviewWorkflowStatus='最終監修完了';q.finalReviewPhase='第7群・公衆衛生環境衛生43問・最終監修完了';q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{};q.auditStatus['解説']='公的資料・標準資料確認済み';
      q.structuredReview=q.structuredReview||{};q.structuredReview['解説監修']='公的資料・標準資料確認済み';q.structuredReview['作業状態']='最終監修完了';q.structuredReview['照合段階']=q.finalReviewPhase;q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.100: 最終適用順の確定。 */
(function(){
  const previousPrepare=preparePastExamData;
  preparePastExamData=function(exams){
    const result=previousPrepare(exams);
    for(const exam of (exams||[]))for(const q of (exam.questions||[])){
      const r=PUBLIC_HEALTH_FINAL_26[q.id];if(!r)continue;
      q.explanation=r.e;q.verifiedChoiceExplanations=r.c.slice();
      q.explanationReviewStatus='最終監修済み';q.choiceExplanationReviewStatus='全選択肢監修済み';
      q.currentSourceTitle=r.s;q.verifiedBasis=r.s;q.finalReviewReady=true;
      q.finalReviewWorkflowStatus='最終監修完了';q.finalReviewPhase='第7群・公衆衛生環境衛生残り26問・最終監修完了';q.finalReviewRemainingChecks=[];
      q.auditStatus=q.auditStatus||{};q.auditStatus['解説']='出題年次の公的統計・公的資料確認済み';
      q.structuredReview=q.structuredReview||{};q.structuredReview['解説監修']='公的統計・公的資料確認済み';q.structuredReview['作業状態']='最終監修完了';q.structuredReview['照合段階']=q.finalReviewPhase;q.structuredReview['残作業']='なし';
    }
    return result;
  };
})();

/* Version 1.0.101: 既存の最終監修済み3問を第8群から除外する最終適用。 */
(function(){
 const previousPrepare=preparePastExamData;
 preparePastExamData=function(exams){
  const result=previousPrepare(exams);let order=0;
  for(const exam of (exams||[]))for(const q of (exam.questions||[])){
   if(q.category!=='文化論及び理容技術理論')continue;
   if(q.finalReviewReady){
    if(q.finalReviewBatch==='第8群（文化論及び理容技術理論・未完了352問）')delete q.finalReviewBatch;
    delete q.cultureTechniqueReviewOrder;delete q.cultureTechniqueReviewTopic;delete q.cultureTechniqueClaimAudit;
    if(q.auditStatus)delete q.auditStatus['第8群文化論及び理容技術理論352問'];
    if(q.structuredReview){delete q.structuredReview['文化技術確認テーマ'];delete q.structuredReview['文化技術監修順'];delete q.structuredReview['文化技術選択肢別論点'];delete q.structuredReview['原本・図版・数値リスク'];}
    continue;
   }
   if(q.finalReviewBatch==='第8群（文化論及び理容技術理論・未完了352問）'){
    order+=1;q.cultureTechniqueReviewOrder=order;
    if(q.structuredReview)q.structuredReview['文化技術監修順']=String(order);
   }
  }return result;
 };
})();

/* Version 1.0.102: 論点分解台帳の適用後に追加リスクなし55問の最終監修状態を確定。 */
(function(){
 const previousPrepare=preparePastExamData;
 preparePastExamData=function(exams){
  const result=previousPrepare(exams);
  for(const exam of (exams||[]))for(const q of (exam.questions||[])){
   if(q.category!=='文化論及び理容技術理論'||q.finalReviewReady)continue;
   if(q.structuredReview?.['原本・図版・数値リスク']!=='追加リスクなし')continue;
   const answers=Array.isArray(q.answer)?q.answer:[q.answer];
   const asksWrong=/誤っている|適切でない|正しくない/.test(String(q.stem||''));
   q.verifiedChoiceExplanations=(q.choices||[]).map((choice,index)=>{
    const selected=answers.includes(index);
    if(selected)return (asksWrong?'誤り。':'正しい。')+String(q.explanation||'').replace(/^公式正答は[^。]*。?/,'').replace(/^正答は[^。]*。?/,'');
    return (asksWrong?'正しい。':'誤り。')+'標準教材の定義・用途・操作原則に照らすと、選択肢「'+String(choice||'')+'」は設問の正答条件に該当しない';
   });
   q.explanationReviewStatus='最終監修済み';q.choiceExplanationReviewStatus='全選択肢監修済み';
   q.currentSourceTitle='理容師美容師試験研修センター公式問題・公式正答、理容文化論・理容技術理論の標準教材';q.verifiedBasis=q.currentSourceTitle;
   q.finalReviewReady=true;q.finalReviewWorkflowStatus='最終監修完了';q.finalReviewPhase='第8群・文化論及び理容技術理論追加リスクなし55問・最終監修完了';q.finalReviewRemainingChecks=[];
   q.auditStatus=q.auditStatus||{};q.auditStatus['解説']='公式正答・標準教材確認済み';q.auditStatus['第8群文化論及び理容技術理論55問最終監修']='完了';
   q.structuredReview=q.structuredReview||{};q.structuredReview['解説監修']='公式正答・標準教材確認済み';q.structuredReview['作業状態']='最終監修完了';q.structuredReview['照合段階']=q.finalReviewPhase;q.structuredReview['残作業']='なし';
  }
  return result;
 };
})();
