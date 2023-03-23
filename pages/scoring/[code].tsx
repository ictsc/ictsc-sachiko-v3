import Error from "next/error";
import Image from "next/image";
import { useRouter } from "next/router";

import { useForm } from "react-hook-form";

import ICTSCCard from "@/components/Card";
import LoadingPage from "@/components/LoadingPage";
import MarkdownPreview from "@/components/MarkdownPreview";
import ProblemConnectionInfo from "@/components/ProblemConnectionInfo";
import ProblemMeta from "@/components/ProblemMeta";
import ProblemTitle from "@/components/ProblemTitle";
import useAnswers from "@/hooks/answer";
import useApi from "@/hooks/api";
import useAuth from "@/hooks/auth";
import { useProblem, useProblems } from "@/hooks/problem";
import BaseLayout from "@/layouts/BaseLayout";
import { Answer } from "@/types/Answer";
import { Problem } from "@/types/Problem";
import { Result } from "@/types/_api";

type AnswerFormProps = {
  problem: Problem;
  answer: Answer;
};

type AnswerFormInputs = {
  point: number;
};

function AnswerForm({ problem, answer }: AnswerFormProps) {
  const { apiClient } = useApi();
  const { mutate } = useAnswers(problem.id);
  const { mutate: mutateProblem } = useProblems();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnswerFormInputs>({
    defaultValues: {
      point: answer.point ?? undefined,
    },
  });

  const onSubmit = async (data: AnswerFormInputs) => {
    await apiClient
      .patch(`problems/${problem.id}/answers/${answer.id}`, {
        json: {
          problem_id: problem.id,
          answer_id: answer.id,
          // parseInt するとダブルクォートが取り除かれる
          point: parseInt(data.point.toString(), 10),
        },
      })
      .json<Result<Answer>>();

    await mutate();
    await mutateProblem();
  };

  // yyyy/mm/dd hh:mm:ss
  const createdAt = new Date(Date.parse(answer.created_at)).toLocaleDateString(
    "ja-JP",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );

  return (
    <ICTSCCard key={answer.id} className="pt-4 mb-4">
      <div className="flex flex-row justify-between pb-4">
        <div className="flex flex-row items-center">
          {answer.point !== null && (
            <div className="pr-2">
              <Image
                src="/assets/svg/check-green.svg"
                height={24}
                width={24}
                alt="checked"
              />
            </div>
          )}
          チーム: {answer.user_group.name}({answer.user_group.organization})
        </div>
        <div>{createdAt}</div>
      </div>
      <MarkdownPreview content={answer.body} />
      <div className="divider" />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row">
        <input
          {...register("point", {
            required: true,
            min: 0,
            max: problem.point,
          })}
          type="text"
          className="input input-bordered input-sm"
        />
        <input
          type="submit"
          className="btn btn-primary btn-sm ml-2"
          value="採点"
        />
      </form>
      <div className="label">
        {errors.point?.type === "required" && (
          <span className="label-text-alt text-error">
            点数を入力して下さい
          </span>
        )}
        {errors.point?.type === "min" && (
          <span className="label-text-alt text-error">
            点数が低すぎます0以上の値を指定して下さい
          </span>
        )}
        {errors.point?.type === "max" && (
          <span className="label-text-alt text-error">
            点数が高すぎます{problem.point}以下の値を指定して下さい
          </span>
        )}
      </div>
    </ICTSCCard>
  );
}

type Input = {
  answerFilter: string;
};

function ScoringProblem() {
  const router = useRouter();
  const { code, answer_id: answerId } = router.query;

  const { register, watch } = useForm<Input>({
    defaultValues: {
      answerFilter: "2",
    },
  });

  const answerFilter = watch("answerFilter");

  const { user } = useAuth();
  const { problem, matter, isLoading } = useProblem(code as string);
  const { answers } = useAnswers(problem?.id ?? "");

  const isFullAccess = user?.user_group.is_full_access ?? false;
  const isReadOnly = user?.is_read_only ?? false;

  if (isLoading) {
    return (
      <BaseLayout title="採点">
        <LoadingPage />
      </BaseLayout>
    );
  }

  if (!isFullAccess || isReadOnly || problem === null) {
    return <Error statusCode={404} />;
  }

  return (
    <BaseLayout title={`採点(${problem.code} ${problem.title})`}>
      <div className="container-ictsc">
        <div className="flex flex-col mt-12">
          <ProblemTitle title={problem.title} />
          <ProblemMeta problem={problem} />
        </div>
        <ICTSCCard className="ml-0">
          <MarkdownPreview content={problem.body ?? ""} />
        </ICTSCCard>
        <div className="divider" />
        <ProblemConnectionInfo matter={matter} />
        <div className="flex flex-row justify-between mb-8 pt-2">
          <table className="table border table-compact">
            <thead>
              <tr>
                <th>未済点 ~15分</th>
                <th>15~19分</th>
                <th>20分~</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{problem.unchecked}</td>
                <td>
                  {" "}
                  {problem.unchecked_near_overdue != null &&
                  problem.unchecked_near_overdue > 0 ? (
                    <div className="inline-block text-warning">
                      {problem.unchecked_near_overdue}
                    </div>
                  ) : (
                    <div className="inline-block">-</div>
                  )}
                </td>
                <td>
                  {problem.unchecked_overdue != null &&
                  problem.unchecked_overdue > 0 ? (
                    <div className="inline-block text-error">
                      {problem.unchecked_overdue}
                    </div>
                  ) : (
                    <div className="inline-block">-</div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="form-control w-full max-w-[200px]">
            <div className="label">
              <span className="label-text">採点状況フィルタ</span>
            </div>
            <select
              {...register("answerFilter")}
              className="select select-sm select-bordered "
            >
              <option value={0}>すべて</option>
              <option value={1}>採点済みのみ</option>
              <option value={2}>未済点のみ</option>
            </select>
          </div>
        </div>
        {answers
          .filter((answer) => {
            if (answerFilter === "0") {
              return true;
            }
            if (answerFilter === "1") {
              return answer.point !== null;
            }
            return answer.point === null;
          })
          .sort((a, b) => {
            // date
            if (a.created_at > b.created_at) {
              return -1;
            }
            if (a.created_at < b.created_at) {
              return 1;
            }
            return 0;
          })
          .filter((answer) => {
            if (answerId == null) {
              return true;
            }
            return answer.id === answerId;
          })
          .map((answer) => (
            <AnswerForm key={answer.id} problem={problem} answer={answer} />
          ))}
      </div>
    </BaseLayout>
  );
}

export default ScoringProblem;
