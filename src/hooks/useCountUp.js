// src/hooks/useCountUp.js
import { useState, useEffect, useRef } from 'react'

export function useCountUp(endValue, duration = 800) {
  const [count, setCount] = useState(0)
  const startTimeRef = useRef(null)
  const startValueRef = useRef(0)
  const endValueRef = useRef(endValue)

  useEffect(() => {
    startValueRef.current = count
    endValueRef.current = endValue
    startTimeRef.current = null

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min(1, (timestamp - startTimeRef.current) / duration)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const newValue = startValueRef.current + (endValueRef.current - startValueRef.current) * easeOutCubic
      setCount(Math.round(newValue))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [endValue, duration])

  return count
}