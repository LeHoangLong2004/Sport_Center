import { useEffect, useState } from "react"
import { imgHero } from "./sportsDetailData"

type ApiSport = {
  id: string
  name: string
  imageUrl?: string | null
  description?: string | null
}

type ApiFacility = {
  id: string
  name: string
  imageUrl?: string | null
  address?: string | null
}

type ApiClass = {
  id: string
  sportId?: string
  sportName?: string
  facilityId?: string
  facilityName?: string
  coachId?: string
  coachName?: string
  coachAvatar?: string | null
  coachSpecialty?: string | null
  coachBio?: string | null
  className: string
  scheduleTime: string
  durationMinutes: number
  capacity: number
  availableSpots: number
}

export type SportDetailSession = {
  time: string
  name: string
  coach: string
  room: string
  slots: string
  full: boolean
}

export type SportDetailCoach = {
  id: string
  name: string
  img: string
  spec: string
  desc: string
}

export type SportDetail = {
  id: string
  name: string
  tagline: string
  heroImg: string
  facilityImg: string
  facilityTitle: string
  facilityDesc: string
  schedule: SportDetailSession[]
  coaches: SportDetailCoach[]
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function requestedSportKey() {
  const query = window.location.hash.split("?")[1] || ""
  return new URLSearchParams(query).get("sport") || ""
}

function formatSessionTime(value: string, durationMinutes: number) {
  const start = new Date(value)
  const end = new Date(start.getTime() + durationMinutes * 60_000)
  const date = start.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  })
  const time = `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
  return `${date} • ${time}`
}

export function useSportDetail() {
  const [sport, setSport] = useState<SportDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadDetail() {
      setIsLoading(true)
      setError("")

      try {
        const [sportsResponse, facilitiesResponse, classesResponse] =
          await Promise.all([
            fetch("/api/sports"),
            fetch("/api/facilities"),
            fetch("/api/classes/available"),
          ])

        if (!sportsResponse.ok || !classesResponse.ok) {
          throw new Error("Không thể tải dữ liệu chi tiết bộ môn")
        }

        const sports = (await sportsResponse.json()) as ApiSport[]
        const facilities = facilitiesResponse.ok
          ? ((await facilitiesResponse.json()) as ApiFacility[])
          : []
        const classes = (await classesResponse.json()) as ApiClass[]
        const key = requestedSportKey()
        const selected = sports.find(
          (item) => item.id === key || slugify(item.name) === key,
        )

        if (!selected) throw new Error("Không tìm thấy bộ môn trong cơ sở dữ liệu")

        const sportClasses = classes.filter(
          (item) =>
            item.sportId === selected.id ||
            slugify(item.sportName || "") === slugify(selected.name),
        )
        const firstClass = sportClasses[0]
        const facility = facilities.find(
          (item) => item.id === firstClass?.facilityId,
        )
        const coaches = Array.from(
          new Map(
            sportClasses
              .filter((item) => item.coachId)
              .map((item) => [item.coachId, item]),
          ).values(),
        ).map((item) => ({
          id: item.coachId as string,
          name: item.coachName || "Huấn luyện viên",
          img: item.coachAvatar || selected.imageUrl || imgHero,
          spec: item.coachSpecialty || "Huấn luyện viên SportCenter",
          desc: item.coachBio || "Huấn luyện viên phụ trách lớp học.",
        }))

        const detail: SportDetail = {
          id: selected.id,
          name: selected.name,
          tagline: selected.description || "Thông tin bộ môn được cập nhật từ hệ thống.",
          heroImg: selected.imageUrl || imgHero,
          facilityImg: facility?.imageUrl || selected.imageUrl || imgHero,
          facilityTitle: facility?.name || firstClass?.facilityName || "Chưa cập nhật phòng tập",
          facilityDesc: facility?.address || "Thông tin phòng tập được cập nhật từ hệ thống.",
          schedule: sportClasses.map((item) => ({
            time: formatSessionTime(item.scheduleTime, item.durationMinutes),
            name: item.className,
            coach: item.coachName || "Chưa phân công",
            room: item.facilityName || "Chưa cập nhật",
            slots: item.availableSpots > 0 ? `Còn ${item.availableSpots} chỗ trống` : "Lớp đã đầy",
            full: item.availableSpots <= 0,
          })),
          coaches,
        }

        if (!cancelled) setSport(detail)
      } catch (loadError) {
        if (!cancelled) {
          setSport(null)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải dữ liệu chi tiết bộ môn",
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadDetail()
    const handleHashChange = () => loadDetail()
    window.addEventListener("hashchange", handleHashChange)
    return () => {
      cancelled = true
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  return { sport, isLoading, error }
}
