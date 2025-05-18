
import { useState } from "react";
import { toast } from "sonner";

type UseFetchReturn<T, Args extends any[]> = [
  data: T | null,
  loading: boolean,
  error: any,
  fetchData: (...args: Args) => Promise<void>
];

/**
 * useFetch is a custom hook for async data fetching.
 * @param cb - An async callback function that returns data of type T.
 * @returns [data, loading, error, fetchData]
 */
function useFetch<T, Args extends any[]>(
  cb: (...args: Args) => Promise<T>
): UseFetchReturn<T, Args> {
  const [data, setData] = useState<T | any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = async (...args: Args): Promise<void> => {
    setLoading(true);
    try {
      const res = await cb(...args);
      setData(res);
      setError(null);
    } catch (error) {
      setError(error);
       console.log("error",error)
        // toast.error(error?.message as string ||"something went wrong" );
      
    } finally {
      setLoading(false);
    }
  };

  return [data, loading, error, fetchData];
}

export default useFetch;
