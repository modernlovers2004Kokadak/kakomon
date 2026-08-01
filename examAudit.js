/* 問題内容とは分離した共通監査・解説補助処理。 */
function buildPastAuditStatus(q, overlay){
 const status=overlay?.reviewStatus||q.evidenceStatus||'';
 const answerChecked=/公式PDF正答確認済み|原本確認済み|公式PDFで問題・正答確認済み/.test(status);
 const textChecked=/公式PDFで問題・正答確認済み/.test(status) && !/照合対象/.test(status);
 const imageRequired=!!(overlay?.keepImage||q.image);
 return {
  '問題文':textChecked?'原本照合済み':'元画像との照合待ち',
  '選択肢':textChecked?'原本照合済み':'元画像との照合待ち',
  '正答':answerChecked?'公式正答確認済み':'確認状態の明示待ち',
  '図表':imageRequired?'原画像を併用':'図表なし',
  '解説':'監修待ち'
 };
}
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
  q.reviewDate='2026-07-16';
  const source=currentSources[q.category];if(source){q.currentSourceTitle=source[0];q.currentSourceUrl=source[1];}
  const condition=questionCondition(q),guide=reviewGuides[q.category]||'用語の定義と適用条件を確認する。',answers=Array.isArray(q.answer)?q.answer:[q.answer],selected=answers.filter(i=>Number.isInteger(i)&&q.choices[i]!=null).map(i=>`「${q.choices[i]}」`).join('または');
  q.explanationReviewStatus=q.auditStatus['解説'];
  q.studyGuide={'出題形式':condition,'確認の観点':guide,'確認済み範囲':q.auditStatus['問題文']==='原本照合済み'?'問題文・選択肢・正答を確認済み':'正答データ収録済み。問題文・選択肢は元画像との最終照合待ち'};
  // 個別根拠が確認済みの解説だけを選択肢別解説として表示する。
  if(!Array.isArray(q.verifiedChoiceExplanations))q.verifiedChoiceExplanations=[];
  q.structuredReview=q.studyGuide;
  q.choiceReviewDate='2026-07-16';
  const legal=legalStandards[q.category];if(legal){q.currentLegalReview={'条文・通知':legal.ref,'現行基準':legal.text,'照合日':'2026-07-16'};q.currentLegalSource=legal.title;q.currentLegalUrl=legal.url;}
 }}
}
