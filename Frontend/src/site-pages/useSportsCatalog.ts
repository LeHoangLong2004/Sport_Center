import { useEffect, useState } from "react"
import { imgHeroBg } from "./sportsPageData"

export type SportCatalogItem = {
  id: string
  name: string
  imageUrl?: string | null
  description?: string | null
}

export type CoachCatalogItem = {
  id: string
  name: string
  img: string
  spec: string
  desc: string
}

export function useSportsCatalog() {
  const [sports, setSports] = useState<SportCatalogItem[]>([])
  const [coaches, setCoaches] = useState<CoachCatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      try {
        const [sportsResponse, coachesResponse] = await Promise.all([
          fetch("/api/sports"),
          fetch("/api/coaches"),
        ])

        if (!sportsResponse.ok) {
          throw new Error("Không thể tải danh sách bộ môn")
        }

        const sportsData = (await sportsResponse.json()) as SportCatalogItem[]
        const coachesData = coachesResponse.ok
          ? ((await coachesResponse.json()) as Array<{
              id: string
              fullName?: string | null
              avatarUrl?: string | null
              specialty?: string | null
              bio?: string | null
            }>)
          : []

        if (cancelled) return

        setSports(Array.isArray(sportsData) ? sportsData : [])
        setCoaches(
          Array.isArray(coachesData)
            ? coachesData.map((coach) => ({
                id: coach.id,
                name: coach.fullName || "Huấn luyện viên",
                img: coach.avatarUrl || imgHeroBg,
                spec: coach.specialty || "Huấn luyện viên SportCenter",
                desc:
                  coach.bio || "Huấn luyện viên chuyên nghiệp tại SportCenter.",
              }))
            : [],
        )
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Không thể tải dữ liệu danh mục",
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadCatalog()
    return () => {
      cancelled = true
    }
  }, [])

  return { sports, coaches, isLoading, loadError }
}
