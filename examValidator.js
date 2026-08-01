/* 過去問データの自動検査。表示や採点を変更せず、検査結果だけを開発者向けに保持する。 */
(function(){
  const REQUIRED_AUDIT_FIELDS=['問題文','選択肢','正答','図表','解説'];
  const normalize=v=>String(v??'').replace(/\s+/g,' ').trim();

  function createReport(){
    return {
      checkedAt:new Date().toISOString(),
      examCount:0,
      questionCount:0,
      errors:[],
      warnings:[],
      duplicateGroups:[],
      pendingImages:[],
      missingImages:[]
    };
  }

  function add(list,code,message,detail){
    list.push({code,message,detail:detail??null});
  }

  function validateAnswer(q,context,report){
    if(q.neutral){
      if(q.answer!==null)add(report.errors,'NEUTRAL_ANSWER','採点除外問題の正答は null である必要があります。',context);
      return;
    }
    const answers=Array.isArray(q.answer)?q.answer:[q.answer];
    if(!answers.length){
      add(report.errors,'ANSWER_EMPTY','正答が設定されていません。',context);
      return;
    }
    const seen=new Set();
    answers.forEach(answer=>{
      if(!Number.isInteger(answer)||answer<0||answer>=q.choices.length){
        add(report.errors,'ANSWER_RANGE','正答番号が選択肢の範囲外です。',{...context,answer,choiceCount:q.choices.length});
      }
      if(seen.has(answer))add(report.warnings,'ANSWER_DUPLICATE','複数正答配列に同じ番号が重複しています。',{...context,answer});
      seen.add(answer);
    });
  }

  function verifyImage(path,report){
    return new Promise(resolve=>{
      const image=new Image();
      image.onload=()=>resolve();
      image.onerror=()=>{
        report.missingImages.push(path);
        add(report.errors,'IMAGE_MISSING','参照画像を読み込めません。',{path});
        resolve();
      };
      image.src=path;
    });
  }

  function runPastExamValidation(exams,options={}){
    const report=createReport();
    if(!Array.isArray(exams)){
      add(report.errors,'EXAMS_INVALID','試験データが配列ではありません。');
      window.PAST_EXAM_VALIDATION_REPORT=report;
      return Promise.resolve(report);
    }

    report.examCount=exams.length;
    const examKeys=new Set(),questionIds=new Set(),fingerprints=new Map(),images=new Set();

    exams.forEach((exam,examIndex)=>{
      const key=String(exam.examKey??exam.round??'');
      const examContext={examIndex,examKey:key,title:exam.title||''};
      if(!key)add(report.errors,'EXAM_KEY_EMPTY','試験識別子がありません。',examContext);
      if(examKeys.has(key))add(report.errors,'EXAM_KEY_DUPLICATE','試験識別子が重複しています。',examContext);
      examKeys.add(key);
      if(!normalize(exam.title))add(report.errors,'EXAM_TITLE_EMPTY','試験名がありません。',examContext);
      if(!Array.isArray(exam.questions)){
        add(report.errors,'QUESTIONS_INVALID','問題一覧が配列ではありません。',examContext);
        return;
      }
      if(Number(exam.count)!==exam.questions.length){
        add(report.errors,'QUESTION_COUNT_MISMATCH','公称問題数と実データ件数が一致しません。',{...examContext,declared:exam.count,actual:exam.questions.length});
      }
      report.questionCount+=exam.questions.length;
      const numbers=new Set();

      exam.questions.forEach((q,index)=>{
        const context={examKey:key,questionIndex:index,number:q.number,id:q.id};
        const id=String(q.id??'');
        if(!id)add(report.errors,'QUESTION_ID_EMPTY','問題IDがありません。',context);
        if(questionIds.has(id))add(report.errors,'QUESTION_ID_DUPLICATE','問題IDが重複しています。',context);
        questionIds.add(id);

        if(!Number.isInteger(q.number)||q.number<1)add(report.errors,'QUESTION_NUMBER_INVALID','問題番号が正の整数ではありません。',context);
        if(numbers.has(q.number))add(report.errors,'QUESTION_NUMBER_DUPLICATE','同じ試験内で問題番号が重複しています。',context);
        numbers.add(q.number);

        if(!normalize(q.stem))add(report.errors,'STEM_EMPTY','問題文がありません。',context);
        if(!Array.isArray(q.choices)||q.choices.length<2){
          add(report.errors,'CHOICES_INVALID','選択肢が2件以上ありません。',context);
        }else{
          q.choices.forEach((choice,choiceIndex)=>{
            if(!normalize(choice))add(report.errors,'CHOICE_EMPTY','空の選択肢があります。',{...context,choiceIndex});
          });
          validateAnswer(q,context,report);
        }
        if(!normalize(q.category))add(report.errors,'CATEGORY_EMPTY','科目・分野が設定されていません。',context);

        if(!q.auditStatus||typeof q.auditStatus!=='object'){
          add(report.warnings,'AUDIT_STATUS_MISSING','監査状態が設定されていません。',context);
        }else{
          REQUIRED_AUDIT_FIELDS.forEach(field=>{
            if(!normalize(q.auditStatus[field]))add(report.warnings,'AUDIT_FIELD_MISSING','監査状態の項目が不足しています。',{...context,field});
          });
        }

        if(q.image){
          const path=String(q.image);
          images.add(path);
          if(!/\.(?:png|jpe?g|webp|gif|svg)$/i.test(path))add(report.warnings,'IMAGE_EXTENSION','画像参照の拡張子を確認してください。',{...context,path});
        }

        const fingerprint=[normalize(q.stem),...(Array.isArray(q.choices)?q.choices.map(normalize):[])].join('\u241f');
        if(fingerprint){
          const rows=fingerprints.get(fingerprint)||[];
          rows.push({examKey:key,number:q.number,id});
          fingerprints.set(fingerprint,rows);
        }
      });

      for(let expected=1;expected<=exam.questions.length;expected++){
        if(!numbers.has(expected))add(report.warnings,'QUESTION_NUMBER_GAP','問題番号に欠番があります。',{...examContext,expected});
      }
    });

    fingerprints.forEach(rows=>{if(rows.length>1)report.duplicateGroups.push(rows)});
    if(report.duplicateGroups.length)add(report.warnings,'DUPLICATE_CONTENT','完全一致する問題文・選択肢の組があります。',{groups:report.duplicateGroups.length});

    report.pendingImages=[...images];
    const imageChecks=options.verifyImages===false?Promise.resolve():Promise.all([...images].map(path=>verifyImage(path,report)));
    return imageChecks.then(()=>{
      report.pendingImages=[];
      window.PAST_EXAM_VALIDATION_REPORT=report;
      const method=report.errors.length?'error':report.warnings.length?'warn':'info';
      console[method](`[過去問自動検査] ${report.examCount}試験・${report.questionCount}問／エラー${report.errors.length}件・注意${report.warnings.length}件`,report);
      window.dispatchEvent(new CustomEvent('pastExamValidationComplete',{detail:report}));
      return report;
    });
  }

  window.runPastExamValidation=runPastExamValidation;
  if(typeof EXAMS!=='undefined')runPastExamValidation(EXAMS);
})();
