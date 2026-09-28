import { MouseEvent, useEffect, useMemo, useState } from "react"
import HomePage from "./site-pages/HomePage"
import BoMonPage from "./site-pages/BoMonPage"
import ChiTietBoMonPage from "./site-pages/ChiTietBoMonPage"
import CoachPage from "./site-pages/Page3992"
import PricingPage from "./site-pages/Page4302"
import AboutPage from "./site-pages/Page4642"
import ContactPage from "./site-pages/Page4836"
import NewsPage from "./site-pages/Page5015"
import ArticlePage from "./site-pages/Page5218"
import OffersPage from "./site-pages/Page5391"
import GalleryPage from "./site-pages/Page5634"
import FaqPage from "./site-pages/Page5793"
import PolicyPage from "./site-pages/Page6069"
import ClassListPage from "./site-pages/ClassListPage"
import ClassDetailPage from "./site-pages/ClassDetailPage"

export type SiteRoute =
  | "home"
  | "bomon"
  | "chitietbomon"
  | "coach"
  | "pricing"
  | "about"
  | "contact"
  | "news"
  | "article"
  | "offers"
  | "gallery"
  | "faq"
  | "policy"
  | "lophoc"
  | "chitietlophoc"

const pages: Record<SiteRoute, () => React.JSX.Element> = {
  home: HomePage,
  bomon: BoMonPage,
  chitietbomon: ChiTietBoMonPage,
  coach: CoachPage,
  pricing: PricingPage,
  about: AboutPage,
  contact: ContactPage,
  news: NewsPage,
  article: ArticlePage,
  offers: OffersPage,
  gallery: GalleryPage,
  faq: FaqPage,
  policy: PolicyPage,
  lophoc: ClassListPage,
  chitietlophoc: ClassDetailPage,
}

const labelRoutes: Record<string, SiteRoute | "admin" | "register"> = {
  "Trang chủ": "home",
  "Bộ môn": "bomon",
  "Lớp học": "lophoc",
  "Huấn luyện viên": "coach",
  "Gói tập": "pricing",
  "Về chúng tôi": "about",
  "Liên hệ": "contact",
  "Hỗ trợ": "faq",
  "Chính sách": "policy",
  "Ưu đãi": "offers",
  "Thư viện": "gallery",
  "Tin tức": "news",
  "Đăng nhập": "admin",
  "Đăng ký thành viên": "register",
}

function routeFromHash(): SiteRoute {
  const hash = window.location.hash.replace(/^#\/?/, "")
  return (hash in pages ? hash : "home") as SiteRoute
}

export default function SiteApp({
  onOpenAdmin,
  onOpenRegister,
  onOpenPayment,
}: {
  onOpenAdmin: () => void
  onOpenRegister: () => void
  onOpenPayment?: () => void
}) {
  const [route, setRoute] = useState<SiteRoute>(routeFromHash)
  const [notice, setNotice] = useState("")
  const Page = useMemo(() => pages[route], [route])

  useEffect(() => {
    const updateRoute = () => {
      setRoute(routeFromHash())
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    window.addEventListener("hashchange", updateRoute)
    return () => window.removeEventListener("hashchange", updateRoute)
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(""), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  function navigate(nextRoute: SiteRoute) {
    if (route === nextRoute) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    window.location.hash = nextRoute
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement
    const clickable = target.closest<HTMLElement>(
      '[data-name^="menu-item"], [data-name^="btn-"], [data-name="logo-group"], [data-name="logo-group-footer"], [data-name="policy-links"]',
    )
    const label = (clickable ?? target).textContent?.trim() ?? ""

    for (const [text, destination] of Object.entries(labelRoutes)) {
      if (label === text || label.startsWith(text)) {
        if (destination === "admin") {
          onOpenAdmin()
        } else if (destination === "register") {
          onOpenRegister()
        } else {
          navigate(destination)
        }
        return
      }
    }

    if (
      label.includes("Đọc bài viết") ||
      label.includes("Xem chi tiết") ||
      label.includes("SỰ KIỆN NỔI BẬT")
    ) {
      navigate("article")
      return
    }

    if (label.includes("Xem lịch tập & Chi tiết môn") || label.includes("Xem lịch tập")) {
      navigate("chitietbomon")
      return
    }

    if (
      clickable?.dataset.name === "btn-detail" ||
      clickable?.dataset.name === "class-card" ||
      clickable?.dataset.name === "similar-class-card" ||
      (label.includes("Chi tiết") && label.includes("Đăng ký"))
    ) {
      navigate("chitietlophoc")
      return
    }

    if (
      clickable?.dataset.name === "breadcrumb-lophoc" ||
      (clickable?.dataset.name?.startsWith("menu-item") && label === "Lớp học")
    ) {
      navigate("lophoc")
      return
    }

    if (
      label.includes("Mua ngay") ||
      label.includes("Chọn gói") ||
      label.includes("Đăng ký ngay")
    ) {
      if (onOpenPayment) onOpenPayment()
      return
    }

    if (
      clickable?.dataset.name?.startsWith("btn-") ||
      label.includes("Đăng ký") ||
      label.includes("Đặt lịch") ||
      label.includes("Nhận ưu đãi") ||
      label.includes("Gửi tin nhắn")
    ) {
      setNotice(
        "Cảm ơn bạn! SportCenter đã ghi nhận yêu cầu và sẽ liên hệ sớm.",
      )
    }
  }

  return (
    <div
      className="site-canvas"
      onClick={handleClick}
      data-current-route={route}
    >
      <Page />
      {notice && (
        <div className="site-notice" role="status">
          <span className="site-notice-mark">✓</span>
          <span>{notice}</span>
        </div>
      )}
    </div>
  )
}
