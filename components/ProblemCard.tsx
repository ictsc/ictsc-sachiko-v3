import {Problem} from "../types/Problem";
import Link from "next/link";

type Props = {
  index: number
  problem: Problem
}

const ProblemCard = ({index, problem}: Props) => {
  return (
      <Link href={`/problems/${problem.code}`}
            className={'border p-4 hover:bg-base-200 hover:cursor-pointer rounded-md shadow-sm min-h-[212px] justify-between flex flex-col'}>
        <div>
          <span className={'font-bold text-2xl text-primary pr-2'}>{index}</span>
          <span className={'text-xl font-bold'}>{problem.title}</span>
        </div>
        <div>
          <div className={'text-right'}>100/{problem.point}pt</div>
          <div className={'font-bold text-primary'}>問題文へ→</div>
        </div>
      </Link>
  )
}

export default ProblemCard