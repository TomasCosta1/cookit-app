import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL;

export const useRating = (recipe_id, user_id = null) => {
    const [ratingMean, setRatingMean] = useState(0)
    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchMean = async (recipe_id) => {
        if (isFetching) return

        setIsFetching(true)
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE}/ratings/${recipe_id}`)
            const data = await response.json()
            setRatingMean(data);
            
        }catch (error) {
            setError(error.message)
        }finally {
            setIsFetching(false)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMean(recipe_id)
    }, [recipe_id])

  return {
    rating: ratingMean,
    refetch: () => fetchMean(recipe_id),
    loading,
    error
  }
}