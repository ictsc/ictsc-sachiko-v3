import 'zenn-content-css';
import {useState} from "react";
import {useRouter} from "next/router";
import Error from "next/error";

import {useForm, Controller, SubmitHandler} from "react-hook-form";
import {DateTime} from "luxon";

import ICTSCNavBar from "../../components/Navbar";
import ICTSCCard from "../../components/Card";
import {ICTSCErrorAlert, ICTSCSuccessAlert} from "../../components/Alerts";
import MarkdownPreview from "../../components/MarkdownPreview";
import LoadingPage from "../../components/LoadingPage";
import {useApi} from "../../hooks/api";
import {useAuth} from "../../hooks/auth";
import {useProblems} from "../../hooks/problem";
import {useAnswers} from "../../hooks/answer";

type Inputs = {
  answer: string;
}

const ProblemPage = () => {
  const router = useRouter();
  const {problemId} = router.query;

  const {handleSubmit, control, watch, formState: {errors}} = useForm<Inputs>()
  // answer のフォームを監視
  const watchField = watch(['answer'])

  const {apiClient} = useApi()
  const {user} = useAuth()
  const {getProblem, isLoading} = useProblems();
  const [isPreview, setIsPreview] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const problem = getProblem(problemId as string);

  const {answers, mutate} = useAnswers(problem?.id as string);

  // モーダルを表示しバリデーションを行う
  const onModal: SubmitHandler<Inputs> = async () => {
    setIsModalOpen(true)
  }

  const onSubmit: SubmitHandler<Inputs> = async ({answer}) => {
    const response = await apiClient.post(`problems/${problem?.id}/answers`, {
      json: {
        user_group_id: user?.user_group_id,
        problem_id: problem?.id,
        body: answer,
      }
    })

    setStatus(response.status)

    if (response.ok) {
      await mutate()
    }
  }


  if (problem === null) {
    return <Error statusCode={404}/>;
  }


  if (isLoading) {
    return (
        <>
          <ICTSCNavBar/>
          <LoadingPage/>
        </>
    );
  }

  console.log(answers)


  return (
      <>
        <input type="checkbox" id="my-modal-5" className="modal-toggle"/>
        <div className={`modal ${isModalOpen && 'modal-open'}`}>
          <div className="modal-box container-ictsc">
            <h3 className="title-ictsc pt-4 pb-8">回答内容確認</h3>
            <ICTSCCard>
              <MarkdownPreview content={watchField[0]}/>
            </ICTSCCard>
            <div className={'text-sm pt-2'}>※ 回答は20分に1度のみです</div>
            <div className="modal-action">
              <label onClick={() => setIsModalOpen(false)} className="btn btn-link">閉じる</label>
              <label onClick={() => {
                handleSubmit(onSubmit)()
                setIsModalOpen(false)
              }} className="btn btn-primary">この内容で提出</label>
            </div>
          </div>
        </div>

        <ICTSCNavBar/>
        <div className={'container-ictsc'}>
          <div className={'flex flex-row items-end pt-12 pb-4'}>
            <h1 className={'title-ictsc pr-4'}>{problem.title}</h1>
            満点
            {problem.point} pt
            採点基準
            {problem.solved_criterion} pt
          </div>
          {status === 201 && (
              <ICTSCSuccessAlert className={'mt-2'} message={'投稿に成功しました'}/>)}
          {status != null && status !== 201 && (
              <ICTSCErrorAlert className={'mt-2'} message={'投稿に失敗しました'}/>)}
          <ICTSCCard className={'mt-8'}>
            <MarkdownPreview content={problem.body}/>
          </ICTSCCard>
          <ICTSCCard className={'mt-8 pt-4'}>
            <form onSubmit={handleSubmit(onModal)} className={'flex flex-col'}>
              <div className="tabs">
                <a onClick={() => setIsPreview(false)}
                   className={`tab tab-lifted ${!isPreview && 'tab-active'}`}>Write</a>
                <a onClick={() => setIsPreview(true)}
                   className={`tab tab-lifted ${isPreview && 'tab-active'}`}>Preview</a>
              </div>
              {isPreview
                  ? (
                      <>
                        <MarkdownPreview className={'pt-4'} content={watchField[0]}/>
                        <div className="divider mt-0"/>
                      </>
                  )
                  : (
                      <Controller name={'answer'} control={control}
                                  rules={{required: true}}
                                  render={({field}) => {
                                    return (<textarea {...field}
                                                      className="textarea textarea-bordered mt-4 px-2 min-h-[300px]"
                                                      placeholder={`お世話になっております。チーム○○です。
この問題ではxxxxxが原因でトラブルが発生したと考えられました。
そのため、以下のように設定を変更し、○○が正しく動くことを確認いたしました。
確認のほどよろしくお願いします。

### 手順
1. /etc/hoge/hoo.bar の編集`}/>)
                                  }}/>
                  )}
              <label className="label max-w-xs min-w-[312px]">
                {errors.answer && <span className="label-text-alt text-error">回答を入力して下さい</span>}
              </label>
              <div className={'flex justify-end mt-4'}>
                <label onClick={handleSubmit(onModal)} className="btn btn-primary max-w-[312px]">提出確認</label>
              </div>
            </form>
          </ICTSCCard>
          <div className={'text-sm pt-2'}>※ 回答は20分に1度のみです</div>
          <div className={'divider'}/>
          <div className={'pb-2'}>
            定期的に自動更新されます
          </div>
          <div className={'overflow-x-auto'}>
            <table className="table border table-compact w-full">
              <thead>
              <tr>
                <th className={'w-[196px]'}>提出日時</th>
                <th className={'w-[100px]'}>問題コード</th>
                <th>問題</th>
                <th className={'w-[100px]'}>得点</th>
                <th className={'w-[100px]'}>チェック済み</th>
                <th className={'w-[50px]'}></th>
              </tr>
              </thead>
              <tbody>
              {answers
                  .sort((a, b) => {
                    if (a.created_at < b.created_at) {
                      return 1;
                    }
                    if (a.created_at > b.created_at) {
                      return -1;
                    }
                    return 0;
                  })
                  .map((answer) => {
                    const createdAt = DateTime.fromISO(answer.created_at)

                    return (
                        <tr key={answer.id}>
                          <td>{createdAt.toFormat('yyyy-MM-dd HH:mm:ss')}</td>
                          <td>{problem?.code}</td>
                          <td>{problem?.title}</td>
                          <td className={'text-right'}>{answer?.point ?? '--'} pt</td>
                          <td className={'text-center'}>{answer.point != null ? '○' : '採点中'}</td>
                          <td>
                            <div className={'link'}>投稿内容</div>
                          </td>
                        </tr>
                    );
                  })}
              <tr>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </>
  )
}

export default ProblemPage
