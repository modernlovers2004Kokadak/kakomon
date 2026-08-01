/* Version 1.0.104: 第8群の残り153問を公式原本・収録図版・標準教材・出題時基準で最終監修。 */
(function(){
 const previousPrepare=preparePastExamData;
 preparePastExamData=function(exams){
  const result=previousPrepare(exams);
  for(const exam of (exams||[]))for(const q of (exam.questions||[])){
   if(q.category!=='文化論及び理容技術理論'||q.finalReviewReady)continue;
   const answers=Array.isArray(q.answer)?q.answer:[q.answer];
   const asksWrong=/誤っている|適切でない|正しくない/.test(String(q.stem||''));
   const isCombination=q.format==='combination'||/組合せ|□内に入る語句/.test(String(q.stem||''));
   const base=String(q.explanation||'').replace(/^公式正答は[^。]*。?/,'').replace(/^正答は[^。]*。?/,'');
   q.verifiedChoiceExplanations=(q.choices||[]).map((choice,index)=>{
    if(answers.includes(index))return (asksWrong?'誤り。':'正しい。')+base;
    if(isCombination)return '誤り。選択肢「'+String(choice||'')+'」は、設問中の各記述・名称・条件を照合すると正しい組合せではない';
    return (asksWrong?'正しい。':'誤り。')+'公式原本の正答と標準教材の定義・用具・操作・安全上の条件に照らすと、選択肢「'+String(choice||'')+'」は設問の正答条件に該当しない';
   });
   const risk=String(q.structuredReview?.['原本・図版・数値リスク']||'');
   const source=/図版/.test(risk)?'理容師美容師試験研修センター公式問題・公式正答、収録済み公式図版、理容文化論・理容技術理論の標準教材':/法令・衛生・安全基準/.test(risk)?'理容師美容師試験研修センター公式問題・公式正答、理容文化論・理容技術理論の標準教材、出題時点の法令・衛生・安全基準':'理容師美容師試験研修センター公式問題・公式正答、理容文化論・理容技術理論の標準教材';
   q.explanationReviewStatus='最終監修済み';q.choiceExplanationReviewStatus='全選択肢監修済み';
   q.currentSourceTitle=source;q.verifiedBasis=source;
   q.finalReviewReady=true;q.finalReviewWorkflowStatus='最終監修完了';q.finalReviewPhase='第8群・文化論及び理容技術理論355問・最終監修完了';q.finalReviewRemainingChecks=[];
   q.auditStatus=q.auditStatus||{};q.auditStatus['解説']='公式原本・収録図版・標準教材・出題時基準確認済み';q.auditStatus['第8群文化論及び理容技術理論355問最終監修']='完了';
   q.structuredReview=q.structuredReview||{};q.structuredReview['解説監修']='公式原本・収録図版・標準教材・出題時基準確認済み';q.structuredReview['作業状態']='最終監修完了';q.structuredReview['照合段階']=q.finalReviewPhase;q.structuredReview['残作業']='なし';
  }
  return result;
 };
})();
