import { useEffect, useState } from "react"

export type AboutFacility = {
  id: string
  img: string
  label: string
}

export type AboutCoach = {
  id: string
  img: string
  name: string
  title: string
  desc: string
}

type ApiFacility = {
  id: string
  name: string
  imageUrl?: string | null
}

type ApiCoach = {
  id: string
  fullName?: string | null
  avatarUrl?: string | null
  specialty?: string | null
  bio?: string | null
}

type ApiClass = {
  id: string
  availableSpots?: number
}

const fallbackImage = "/assets/images/hero_bg.jpg"

function resolveImageUrl(value?: string | null) {
  const imageUrl = value?.trim()
  if (!imageUrl) return fallbackImage

  if (/^(https?:|data:|blob:)/i.test(imageUrl) || imageUrl.startsWith("/")) {
    return imageUrl
  }

  return `/${imageUrl}`
}

export function useAboutData() {
  const [facilities, setFacilities] = useState<AboutFacility[]>([])
  const [team, setTeam] = useState<AboutCoach[]>([])
  const [classCount, setClassCount] = useState(0)
  const [availableSpots, setAvailableSpots] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadAboutData() {
      try {
        const [facilitiesResponse, coachesResponse, classesResponse] = await Promise.all([
          fetch("/api/facilities"),
          fetch("/api/coaches"),
          fetch("/api/classes/available"),
        ])

        if (!facilitiesResponse.ok || !coachesResponse.ok || !classesResponse.ok) {
          throw new Error("Không thể tải dữ liệu giới thiệu trung tâm")
        }

        const facilityData = (await facilitiesResponse.json()) as ApiFacility[]
        const coachData = (await coachesResponse.json()) as ApiCoach[]
        const classData = (await classesResponse.json()) as ApiClass[]
        if (cancelled) return

        setFacilities(
          Array.isArray(facilityData)
            ? facilityData.map((facility) => ({
                id: facility.id,
                img: resolveImageUrl(facility.imageUrl),
                label: facility.name,
              }))
            : [],
        )
        setTeam(
          Array.isArray(coachData)
            ? coachData.map((coach) => ({
                id: coach.id,
                img: resolveImageUrl(coach.avatarUrl),
                name: coach.fullName || "Huấn luyện viên",
                title: coach.specialty || "Huấn luyện viên SportCenter",
                desc: coach.bio || "Thông tin huấn luyện viên được cập nhật từ hệ thống.",
              }))
            : [],
        )
        setClassCount(Array.isArray(classData) ? classData.length : 0)
        setAvailableSpots(
          Array.isArray(classData)
            ? classData.reduce((total, item) => total + (item.availableSpots || 0), 0)
            : 0,
        )
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải dữ liệu giới thiệu trung tâm",
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadAboutData()
    return () => {
      cancelled = true
    }
  }, [])

  return { facilities, team, classCount, availableSpots, isLoading, error }
}
