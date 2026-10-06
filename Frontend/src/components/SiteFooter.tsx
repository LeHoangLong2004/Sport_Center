import React from 'react';

const imgZapFooter = "/assets/site/4642/4e22a.svg";
const imgSmartphone = "/assets/site/4642/f8c94.svg";
const imgFacebook = "/assets/site/4642/ac914.svg";
const imgInstagram = "/assets/site/4642/530d2.svg";
const imgYoutube = "/assets/site/4642/89fdc.svg";
const imgLinkedin = "/assets/site/4642/8582f.svg";

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 flex flex-col gap-10 items-start pb-12 pt-16 px-6 lg:px-[80px] w-full shrink-0 border-t border-slate-800">
      <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-10 lg:gap-0">
        
        {/* Logo + tagline */}
        <div className="flex flex-col gap-6 items-start lg:w-[360px] shrink-0" data-name="logo-group-footer">
          <div className="flex gap-[10px] items-center cursor-pointer" data-name="menu-item-Trang chủ">
            <div className="bg-teal-500 flex items-center justify-center rounded-[8px] size-[40px] shrink-0 shadow-lg shadow-teal-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="font-extrabold text-white text-[20px] leading-none tracking-tight">SPORTCENTER</p>
              <p className="font-semibold text-teal-500 text-[10px] uppercase tracking-widest">Energy Platform</p>
            </div>
          </div>
          <p className="text-[14px] leading-relaxed">
            Hệ thống phòng tập thể thao tiêu chuẩn quốc tế mang lại nguồn năng lượng bứt phá mỗi ngày. 
            Môi trường luyện tập chuyên nghiệp, thiết bị hiện đại.
          </p>
          <div className="flex gap-3 items-center mt-2">
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hotline hỗ trợ 24/7</span>
              <p className="font-bold text-white text-[16px]">1900 6868</p>
            </div>
          </div>
        </div>

        {/* Dịch vụ */}
        <div className="flex flex-col gap-4 items-start lg:w-[200px] text-[14px]">
          <p className="font-bold text-white uppercase tracking-wider text-sm mb-2">Dịch vụ nổi bật</p>
          {["Bơi lội Aqua", "Yoga trị liệu", "HIIT & Strength", "Boxing Kickfit", "Bóng rổ đội nhóm"].map((item) => (
            <p key={item} className="cursor-pointer hover:text-teal-400 transition-colors">{item}</p>
          ))}
        </div>

        {/* SportCenter */}
        <div className="flex flex-col gap-4 items-start lg:w-[200px] text-[14px]">
          <p className="font-bold text-white uppercase tracking-wider text-sm mb-2">SportCenter</p>
          {["Hệ thống chi nhánh", "Đội ngũ chuyên gia", "Bảng giá gói tập", "Tin tức sự kiện", "Tuyển dụng"].map((item) => (
            <p key={item} className="cursor-pointer hover:text-teal-400 transition-colors">{item}</p>
          ))}
        </div>

        {/* Newsletter & Social */}
        <div className="flex flex-col gap-4 items-start lg:w-[320px] shrink-0">
          <p className="font-bold text-white uppercase tracking-wider text-sm mb-2">Đăng ký nhận tin</p>
          <p className="text-[14px] leading-relaxed mb-1">
            Nhận ưu đãi mới nhất và tin tức về sức khỏe hàng tuần.
          </p>
          <div className="flex w-full mb-2">
            <input 
              type="email" 
              placeholder="Email của bạn..." 
              className="bg-slate-800 border-y border-l border-slate-700 text-white text-sm rounded-l-xl px-4 py-2.5 w-full focus:outline-none focus:border-teal-500"
            />
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-r-xl transition-colors font-bold text-sm shrink-0 shadow-lg shadow-teal-500/20">
              Gửi
            </button>
          </div>
          
          <div className="flex gap-3 items-center pt-4 w-full border-t border-slate-800">
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, name: "Facebook" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>, name: "Instagram" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>, name: "Youtube" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>, name: "Linkedin" }
            ].map((social, i) => (
              <button 
                key={i} 
                aria-label={social.name}
                className="bg-slate-800 text-slate-400 flex items-center justify-center rounded-[10px] size-[38px] hover:bg-teal-500 hover:text-white transition-all transform hover:-translate-y-1"
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 flex flex-col md:flex-row items-center justify-between pt-6 w-full" data-name="policy-links">
        <p className="text-[13px] mb-4 md:mb-0 text-slate-500">
          © 2026 SportCenter. All rights reserved.
        </p>
        <div className="flex gap-6 items-center">
          {["Chính sách bảo mật", "Điều khoản sử dụng", "Cookie"].map((item) => (
            <button key={item} className="text-[13px] text-slate-500 hover:text-white transition-colors cursor-pointer">{item}</button>
          ))}
        </div>
      </div>
    </footer>
  );
}
