import React from "react";
import { MemberSidebar } from "../../components/MemberSidebar";
import { NewMemberPage, Navigate } from "./types";

const roots: Record<NewMemberPage, string> = {
  schedule: "/assets/member-schedule",
  success: "/assets/member-success",
  workout: "/assets/member-workout",
  ai: "/assets/member-ai",
}

const pageAssets = {
  schedule: {
    avatar: "33848.png",
    account: "2a759.png",
    nav: ["a6906.svg", "c502a.svg", "c502a.svg", "2e78e.svg", "2b3e0.svg", "01d29.svg", "f1047.svg"],
    search: "ce4a8.svg",
    bell: "a9acc.svg",
  },
  success: {
    avatar: "0507f.png",
    account: "6fd1f.png",
    nav: ["198ea.svg", "a6ac8.svg", "a6ac8.svg", "c37d3.svg", "3ecbb.svg", "4b8d6.svg", "e7464.svg"],
    search: "c7e83.svg",
    bell: "a3af3.svg",
  },
  workout: {
    avatar: "13619.png",
    account: "0733d.png",
    nav: ["198ea.svg", "a6ac8.svg", "a6ac8.svg", "c37d3.svg", "3ecbb.svg", "4b8d6.svg", "e7464.svg"],
    search: "c7e83.svg",
    bell: "a3af3.svg",
  },
  ai: {
    avatar: "29d1d.png",
    account: "fdb14.png",
    nav: ["198ea.svg", "a6ac8.svg", "a6ac8.svg", "b486a.svg", "3ecbb.svg", "4b8d6.svg", "987d8.svg"],
    search: "c7e83.svg",
    bell: "a3af3.svg",
  },
}

export function src(page: NewMemberPage, file: string) {
  return `${roots[page]}/${file}`
}

export function Shell({
  page,
  onNavigate,
  children,
}: {
  page: NewMemberPage
  onNavigate: Navigate
  children: React.ReactNode
}) {
  const assets = pageAssets[page]
  const titles = {
    schedule: ["Member Portal / Lớp & Lịch", "Lịch cá nhân của Member"],
    success: ["Member Portal / Lớp & Lịch / Đăng ký", "Đặt chỗ lớp học"],
    workout: ["Member Portal / Lịch sử / Chi tiết", "Chi tiết buổi tập & Kết quả"],
    ai: ["Member Portal / Trợ lý AI", "Move AI - Trợ lý thông minh"],
  }

  return (
    <main className={`m2-shell m2-${page}`}>
      <MemberSidebar page={page as any} onNavigate={onNavigate as any} />
      <div className="m2-workspace">
        <header className="m2-topbar">
          <div>
            <span>{titles[page][0]}</span>
            <strong>{titles[page][1]}</strong>
          </div>
          <div className="m2-tools">
            <label>
              <img src={src(page, assets.search)} alt="" />
              <input
                aria-label="Tìm kiếm"
                placeholder={page === "schedule" ? "Tìm nhanh..." : "Tìm kiếm bài tập, lịch..."}
              />
            </label>
            <button aria-label="Thông báo" type="button">
              <img src={src(page, assets.bell)} alt="" />
            </button>
            <button aria-label="Tài khoản" type="button">
              <img src={src(page, assets.account)} alt="" />
            </button>
          </div>
        </header>
        {children}
      </div>
    </main>
  )
}
