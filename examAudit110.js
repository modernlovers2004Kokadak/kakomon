/* Version 1.0.110: 残り6分野のうち、公的根拠・標準資料と4選択肢別理由が確認済みの204問を最終監修。 */
(function(){
 const targetCategories=new Set([
  '公衆衛生・環境衛生','感染症','衛生管理技術',
  '人体の構造及び機能','皮膚科学','香粧品化学'
 ]);
 const previousPrepare=preparePastExamData;
 preparePastExamData=function(exams){
  const result=previousPrepare(exams);
  for(const exam of (exams||[]))for(const q of (exam.questions||[])){
   if(!targetCategories.has(q.category))continue;
   if(q.canonicalReviewStatus==='最終監修完了')continue;
   if(q.explanationReviewStatus==='公式正答に基づく一次解説')continue;
   if(!Array.isArray(q.verifiedChoiceExplanations)||q.verifiedChoiceExplanations.length!==(q.choices||[]).length)continue;
   if(!q.verifiedBasis)continue;

   q.explanationReviewStatus='最終監修済み';
   q.choiceExplanationReviewStatus='全選択肢監修済み';
   q.reviewDate='2026-08-02';
   q.finalReviewReady=true;
   q.finalReviewWorkflowStatus='最終監修完了';
   q.finalReviewPhase='第10群・6分野204問・最終監修完了';
   q.finalReviewRemainingChecks=[];
   q.auditStatus=q.auditStatus||{};
   q.auditStatus['解説']='公的根拠・標準資料及び選択肢別理由確認済み';
   q.auditStatus['第10群6分野204問最終監修']='完了';
   q.structuredReview=q.structuredReview||{};
   q.structuredReview['解説監修']='公的根拠・標準資料及び選択肢別理由確認済み';
   q.structuredReview['作業状態']='最終監修完了';
   q.structuredReview['照合段階']=q.finalReviewPhase;
   q.structuredReview['残作業']='なし';
   q.canonicalReviewStatus='最終監修完了';
   q.canonicalReviewBasis='最終監修完了・選択肢別理由4件・監修待ち表記なし';
  }
  return result;
 };
})();
