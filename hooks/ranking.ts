import useSWR from "swr";

import { useApi } from "@/hooks/api";
import { Rank } from "@/types/Rank";
import { Result } from "@/types/_api";

type AnswerResult = {
  ranking: Rank[];
};

export const useRanking = () => {
  const { apiClient } = useApi();

  const fetcher = (url: string) =>
    apiClient.get(url).json<Result<AnswerResult>>();

  const { data, isLoading } = useSWR(`ranking`, fetcher);

  return {
    ranking: data?.data?.ranking ?? null,
    loading: isLoading,
  };
};
