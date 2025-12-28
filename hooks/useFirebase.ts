import { useEffect, useState, useCallback } from "react"
import { QueryConstraint, Unsubscribe } from "firebase/firestore"

/**
 * Hook to fetch a single document
 */
export const useDocument = <T,>(
  fetchFn: () => Promise<T | null>,
  dependencies: any[] = [],
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await fetchFn()
        if (isMounted) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  return { data, loading, error }
}

/**
 * Hook to fetch multiple documents
 */
export const useCollection = <T,>(
  fetchFn: (constraints?: QueryConstraint[]) => Promise<T[]>,
  constraints?: QueryConstraint[],
) => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await fetchFn(constraints)
        if (isMounted) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [constraints])

  return { data, loading, error }
}

/**
 * Hook to subscribe to real-time document updates
 */
export const useDocumentSubscription = <T,>(
  subscribeFn: (
    callback: (data: T | null) => void,
    onError?: (error: Error) => void,
  ) => Unsubscribe,
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeFn(
      (newData) => {
        setData(newData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [subscribeFn])

  return { data, loading, error }
}

/**
 * Hook to subscribe to real-time collection updates
 */
export const useCollectionSubscription = <T,>(
  subscribeFn: (
    callback: (data: T[]) => void,
    constraints?: QueryConstraint[],
    onError?: (error: Error) => void,
  ) => Unsubscribe,
  constraints?: QueryConstraint[],
) => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeFn(
      (newData) => {
        setData(newData)
        setLoading(false)
        setError(null)
      },
      constraints,
      (err) => {
        setError(err)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [subscribeFn, constraints])

  return { data, loading, error }
}

/**
 * Hook for performing mutations (create, update, delete)
 */
export const useMutation = <TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [success, setSuccess] = useState(false)

  const mutate = useCallback(
    async (input: TInput) => {
      try {
        setLoading(true)
        setError(null)
        setSuccess(false)
        const result = await mutationFn(input)
        setSuccess(true)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [mutationFn],
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setSuccess(false)
  }, [])

  return { mutate, loading, error, success, reset }
}
