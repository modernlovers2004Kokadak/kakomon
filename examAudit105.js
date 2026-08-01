/* Version 1.0.105: 監修状態の判定を統一し、関係法規・制度及び運営管理の未完了150問を論点整理。 */
(function(){
 const previousPrepare=preparePastExamData;
 const classify=q=>{
  const text=[q.stem,...(q.choices||[])].join(' ');
  if(/理容師法|管理理容師|理容所|出張理容|免許|名簿|衛生措置|閉鎖/.test(text))return '理容師法・関係政省令';
  if(/労働基準|労働安全衛生|雇用|労災|最低賃金|育児介護|パワーハラスメント|年次有給/.test(text))return '労働関係法令';
  if(/健康保険|国民健康保険|年金|社会保険|介護保険/.test(text))return '社会保険制度';
  if(/所得税|法人税|消費税|固定資産税|税務|確定申告|源泉/.test(text))return '税務・会計';
  if(/消費者|個人情報|特定商取引|標準営業約款|生活衛生同業組合|振興指針/.test(text))return '営業・消費者制度';
  return '経営・運営管理';
 };
 const risk=q=>{
  const text=[q.stem,...(q.choices||[])].join(' ');
  const checks=[];
  if(/\d|[０-９]|年|月|日|時間|分|歳|円|割|％|パーセント|期間|期限/.test(text))checks.push('数値・期間');
  if(/現在|当時|改正|施行|経過措置|令和|平成|昭和/.test(text))checks.push('出題時制度');
  if(/条例|都道府県|市町村|自治体/.test(text))checks.push('地域差');
  if(/組合せ|aとb|aとd|bとc|cとd|Ａ|Ｂ|Ｃ|Ｄ/.test(text))checks.push('組合せ');
  return checks.length?checks.join('・'):'追加リスクなし';
 };
 preparePastExamData=function(exams){
  const result=previousPrepare(exams);let order=0;
  for(const exam of (exams||[]))for(const q of (exam.questions||[])){
   const choices=q.verifiedChoiceExplanations||[];
   const reviewText=String(q.explanationReviewStatus||q.auditStatus?.['解説']||'');
   const complete=q.finalReviewReady===true&&choices.length===4&&!/待ち/.test(reviewText);
   q.canonicalReviewStatus=complete?'最終監修完了':'最終監修待ち';
   q.canonicalReviewBasis=complete?'最終監修完了・選択肢別理由4件・監修待ち表記なし':'3条件のいずれかが未充足';
   if(q.category!=='関係法規・制度及び運営管理'||complete)continue;
   order+=1;
   q.finalReviewBatch='第9群（関係法規・制度及び運営管理・未完了150問）';
   q.legalManagementReviewOrder=order;
   q.legalManagementReviewTopic=classify(q);
   q.legalManagementReviewRisk=risk(q);
   q.structuredReview=q.structuredReview||{};
   q.structuredReview['関係法規・運営管理監修順']=String(order);
   q.structuredReview['確認テーマ']=q.legalManagementReviewTopic;
   q.structuredReview['追加確認区分']=q.legalManagementReviewRisk;
   q.structuredReview['作業状態']='選択肢別論点整理済み・最終監修待ち';
   q.structuredReview['残作業']='出題時点と現行制度の公的根拠を選択肢ごとに最終照合';
  }
  return result;
 };
})();
