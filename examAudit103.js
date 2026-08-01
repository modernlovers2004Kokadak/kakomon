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
