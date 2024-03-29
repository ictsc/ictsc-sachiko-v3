import { useState } from "react";

import { useRouter } from "next/router";

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { ICTSCErrorAlert, ICTSCSuccessAlert } from "@/components/Alerts";
import ICTSCCard from "@/components/Card";
import MarkdownPreview from "@/components/MarkdownPreview";
import { answerLimit } from "@/components/_const";
import useAnswers from "@/hooks/answer";
import useApi from "@/hooks/api";
import useAuth from "@/hooks/auth";
import useProblem from "@/hooks/problem";

type Inputs = {
  answer: string;
};

function AnswerForm() {
  const router = useRouter();
  const { problemId: tmpProblemId } = router.query;
  const code = tmpProblemId as string | null;

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  // answer のフォームを監視
  const watchField = watch(["answer"]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const { client } = useApi();
  const { user } = useAuth();
  const { problem } = useProblem(code);
  const { mutate } = useAnswers(problem?.id ?? null);

  const successNotify = () =>
    toast.custom((t) => (
      <ICTSCSuccessAlert
        className={`mt-2 ${t.visible ? "animate-enter" : "animate-leave"}`}
        message="投稿に成功しました"
      />
    ));

  const errorNotify = () =>
    toast.custom((t) => (
      <ICTSCErrorAlert
        className={`mt-2 ${t.visible ? "animate-enter" : "animate-leave"}`}
        message="投稿に失敗しました"
        subMessage={
          answerLimit === undefined
            ? undefined
            : `回答は${answerLimit}分に1度のみです`
        }
      />
    ));

  const onSubmit: SubmitHandler<Inputs> = async ({ answer }) => {
    const response = await client.post(`problems/${problem?.id}/answers`, {
      user_group_id: user?.user_group_id,
      problem_id: problem?.id,
      body: answer,
    });

    if (response.code === 200) {
      successNotify();

      await mutate();
    } else {
      errorNotify();
    }
  };

  // モーダルを表示しバリデーションを行う
  const onModal: SubmitHandler<Inputs> = async () => {
    setIsModalOpen(true);
  };

  return (
    <ICTSCCard className="mt-8 pt-4">
      <div className={`modal ${isModalOpen && "modal-open"}`}>
        <div className="modal-box container-ictsc">
          <h3 className="title-ictsc pt-4 pb-8">回答内容確認</h3>
          <ICTSCCard>
            <MarkdownPreview content={watchField[0]} />
          </ICTSCCard>
          {answerLimit && (
            <div className="text-sm pt-2">
              ※ 回答は{answerLimit}分に1度のみです
            </div>
          )}
          <div className="modal-action">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-link"
            >
              閉じる
            </button>
            <button
              type="button"
              onClick={() => {
                handleSubmit(onSubmit)();
                setIsModalOpen(false);
              }}
              className="btn btn-primary"
            >
              この内容で提出
            </button>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onModal)} className="flex flex-col">
        <div className="tabs">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`tab tab-lifted ${!isPreview && "tab-active"}`}
          >
            Markdown
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`tab tab-lifted ${isPreview && "tab-active"}`}
          >
            Preview
          </button>
        </div>
        {isPreview ? (
          <>
            <MarkdownPreview className="pt-4" content={watchField[0]} />
            <div className="divider mt-0" />
          </>
        ) : (
          <Controller
            name="answer"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <textarea
                {...field}
                className="textarea textarea-bordered mt-4 px-2 min-h-[300px]"
                placeholder={`お世話になっております。チーム○○です。
この問題ではxxxxxが原因でトラブルが発生したと考えられました。
そのため、以下のように設定を変更し、○○が正しく動くことを確認いたしました。
確認のほどよろしくお願いします。

### 手順
1. /etc/hoge/hoo.bar の編集`}
              />
            )}
          />
        )}
        <div className="label max-w-xs min-w-[312px]">
          {errors.answer && (
            <span className="label-text-alt text-error">
              回答を入力して下さい
            </span>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            onClick={handleSubmit(onModal)}
            className="btn btn-primary max-w-[312px]"
          >
            提出確認
          </button>
        </div>
      </form>
    </ICTSCCard>
  );
}

export default AnswerForm;
