import { MouseEvent, useEffect, useMemo, useState } from "react"
import HomePage from "./site-pages/HomePage"
import BoMonPage from "./site-pages/SportsPage"
import ChiTietBoMonPage from "./site-pages/SportsDetailPage"
import CoachPage from "./site-pages/CoachListPage"
import PricingPage from "./site-pages/PricingPage"
import AboutPage from "./site-pages/AboutPage"
import ContactPage from "./site-pages/ContactPage"
import NewsPage from "./site-pages/NewsPage"
import ArticlePage from "./site-pages/NewsDetailPage"
import OffersPage from "./site-pages/PromotionsPage"
import GalleryPage from "./site-pages/GalleryPage"
import FaqPage from "./site-pages/FaqPage"
import PolicyPage from "./site-pages/TermsPage"
import ClassListPage from "./site-pages/ClassListPage"
import ClassDetailPage from "./site-pages/ClassDetailPage"
import { SiteHeader } from "./components/SiteHeader"
import { SiteFooter } from "./components/SiteFooter"

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
  onOpenPayment?: (planId?: string) => void
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
      'button, a, [data-name^="menu-item"], [data-name^="btn-"], [data-name="logo-group"], [data-name="logo-group-footer"], [data-name="policy-links"]',
    )
    
    const isLayoutContainer = ["SECTION", "MAIN", "NAV", "HEADER", "FOOTER", "BODY", "HTML"].includes(target.tagName);
    if (!clickable && isLayoutContainer) return;

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

    if (clickable?.dataset.name === "btn-register") {
      if (onOpenRegister) onOpenRegister()
      return
    }

    if (clickable?.dataset.name === "btn-login") {
      if (onOpenAdmin) onOpenAdmin()
      return
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
      label.includes("Đăng ký ngay") ||
      label.includes("Đăng ký Fitness") ||
      label.includes("Đăng ký Premium")
    ) {
      let planId: string | undefined = undefined;
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes("starter") || lowerLabel.includes("swim")) planId = "swim";
      else if (lowerLabel.includes("fitness")) planId = "fitness";
      else if (lowerLabel.includes("premium") || lowerLabel.includes("vip")) planId = "premium";

      if (onOpenPayment) onOpenPayment(planId)
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
      className="site-canvas relative font-sans"
      onClick={handleClick}
      data-current-route={route}
    >
      <SiteHeader currentRoute={route} />
      
      <div className="min-h-screen">
        <Page />
      </div>

      <SiteFooter />

      {notice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl shadow-slate-900/20 flex items-center gap-3 z-50 animate-[fadeUp_0.3s_ease-out]">
          <span className="bg-teal-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
          <span className="text-sm font-medium">{notice}</span>
        </div>
      )}
    </div>
  )
}
