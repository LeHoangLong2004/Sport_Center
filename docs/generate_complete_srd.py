    # -*- coding: utf-8 -*-
"""
Full generation script for SWP391 Template 2 Software Requirement Document (SRD/SRS)
Produces a comprehensive, professional, 100% complete submission-ready document.
"""
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import os

def set_cell_properties(cell, fill_hex=None):
    tcPr = cell._tc.get_or_add_tcPr()
    if fill_hex:
        shd = OxmlElement('w:shd')
        shd.set(qn('w:val'), 'clear')
        shd.set(qn('w:color'), 'auto')
        shd.set(qn('w:fill'), fill_hex)
        tcPr.append(shd)

def set_cell_content(cell, text, bold=False, italic=False, font_size=9.5, font_name="Calibri", align=WD_ALIGN_PARAGRAPH.LEFT, color_rgb=None):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.bold = bold
    run.italic = italic
    if color_rgb:
        run.font.color.rgb = color_rgb

def set_table_borders(table):
    tblPr = table._tbl.tblPr
    tblBorders = tblPr.find(qn('w:tblBorders'))
    if tblBorders is None:
        tblBorders = OxmlElement('w:tblBorders')
        tblPr.append(tblBorders)
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), '4')
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), 'D3D3D3')
        tblBorders.append(border)

def update_table_data(table, header_list, rows_list, col_alignments=None, header_fill='F2F2F2'):
    while len(table.rows) > 1:
        tr = table.rows[-1]._tr
        table._tbl.remove(tr)
    
    if len(table.rows) == 0:
        table.add_row()
        
    header_row = table.rows[0]
    while len(header_row.cells) < len(header_list):
        new_tc = OxmlElement('w:tc')
        header_row._tr.append(new_tc)
    while len(header_row.cells) > len(header_list):
        tc = header_row.cells[-1]._tc
        header_row._tr.remove(tc)
    
    for c_idx, h_text in enumerate(header_list):
        set_cell_content(header_row.cells[c_idx], h_text, bold=True, font_size=10, align=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_properties(header_row.cells[c_idx], fill_hex=header_fill)
            
    set_table_borders(table)
    
    for r_idx, r_data in enumerate(rows_list):
        row = table.add_row()
        while len(row.cells) < len(header_list):
            new_tc = OxmlElement('w:tc')
            row._tr.append(new_tc)
        while len(row.cells) > len(header_list):
            tc = row.cells[-1]._tc
            row._tr.remove(tc)
            
        for c_idx, val in enumerate(r_data):
            align = WD_ALIGN_PARAGRAPH.LEFT
            if col_alignments and c_idx < len(col_alignments):
                align = col_alignments[c_idx]
            set_cell_content(row.cells[c_idx], str(val), bold=False, font_size=9.5, align=align)
            if r_idx % 2 == 1:
                set_cell_properties(row.cells[c_idx], fill_hex='FAFAFA')

def set_para(p, text, font_name="Calibri", font_size=11, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=3, space_after=3):
    p.text = ""
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.bold = bold
    run.italic = italic
    return run

def add_styled_table_after(doc, after_element, header_list, rows_list, col_alignments=None, header_fill='F2F2F2'):
    new_tbl = doc.add_table(rows=1, cols=len(header_list))
    after_element.addnext(new_tbl._tbl)
    
    header_row = new_tbl.rows[0]
    for c_idx, h_text in enumerate(header_list):
        set_cell_content(header_row.cells[c_idx], h_text, bold=True, font_size=10, align=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_properties(header_row.cells[c_idx], fill_hex=header_fill)
    set_table_borders(new_tbl)
    
    for r_idx, r_data in enumerate(rows_list):
        row = new_tbl.add_row()
        for c_idx, val in enumerate(r_data):
            align = WD_ALIGN_PARAGRAPH.LEFT
            if col_alignments and c_idx < len(col_alignments):
                align = col_alignments[c_idx]
            set_cell_content(row.cells[c_idx], str(val), bold=False, font_size=9.5, align=align)
            if r_idx % 2 == 1:
                set_cell_properties(row.cells[c_idx], fill_hex='FAFAFA')
    return new_tbl

def add_para_after(after_element, text, font_name="Calibri", font_size=11, bold=False, italic=False, space_before=4, space_after=3):
    p = OxmlElement('w:p')
    after_element.addnext(p)
    new_p = docx.text.paragraph.Paragraph(p, None)
    set_para(new_p, text, font_name=font_name, font_size=font_size, bold=bold, italic=italic, space_before=space_before, space_after=space_after)
    return p, new_p

print("Loading baseline template docx...")
template_path = r'c:\Users\ADMIN\Downloads\Template2_SRD Document_SWP391_Group04.docx.bak'
doc = docx.Document(template_path)

# 1. COVER PAGE & METADATA
set_para(doc.paragraphs[10], "SPORT CENTER MANAGEMENT SYSTEM (SMARTGYM OS)", font_name="Calibri", font_size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=6)
set_para(doc.paragraphs[11], "Software Requirement Document", font_name="Calibri", font_size=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12)
set_para(doc.paragraphs[21], "– HCM, October 2026 –", font_name="Calibri", font_size=12, bold=False, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=6, space_after=6)

# 2. TABLE 0: RECORD OF CHANGES
header_t0 = ['Date', 'A*, M, D', 'In charge', 'Change Description']
rows_t0 = [
    ['10/Sep/2026', 'A', 'PhuongPDT', 'Khởi tạo tài liệu SRS theo Template 2; hoàn thiện Phần I.1 (Introduction, Scope, Context Diagram).'],
    ['18/Sep/2026', 'A', 'LongLH', 'Bổ sung khảo sát Existing Systems (GymMaster, Mindbody) và vẽ sơ đồ Swimlane luồng đặt lớp & điểm danh (I.3).'],
    ['28/Sep/2026', 'A', 'NamHXA', 'Thiết kế sơ đồ Screen Flow tổng thể (I.4.a), bảng Screen Details (I.4.b) và Ma trận Phân quyền User Authorization (I.4.c).'],
    ['08/Oct/2026', 'M', 'ThuanBN', 'Khởi tạo luồng thanh toán số hóa, tích hợp hóa đơn điện tử và cơ chế nạp tiền Ví hội viên (Flow 3).'],
    ['18/Oct/2026', 'A', 'PhuongPDT', 'Thêm đặc tả Flow 5: Tích hợp Google Gemini 1.5 Flash gợi ý giáo án tập luyện thông minh cho Huấn luyện viên.'],
    ['25/Oct/2026', 'M', 'ThuanBN', 'Tích hợp cổng thanh toán SePay Webhook và VietQR Napas 247 auto-checkout vào quy trình thanh toán.'],
    ['31/Oct/2026', 'M', 'NamHXA, LongLH', 'Bổ sung hoàn chỉnh ERD (I.5), State Transition Diagrams (I.6), Functional Requirements chi tiết (II) và Database Table Details (III) theo Template 2.']
]
update_table_data(doc.tables[0], header_t0, rows_t0, [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT])

# 3. SECTION I.1: INTRODUCTION
intro_overview = (
    "1.1. High-Level Product Overview\n"
    "• Tên sản phẩm: Hệ thống Quản trị Trung tâm Thể thao Đa bộ môn (SmartGym OS / Sport Center Management System).\n"
    "• Môi trường hoạt động (Environment): Ứng dụng Web đa nền tảng (Desktop, Laptop, Tablet, Mobile) tương thích với các trình duyệt hiện đại (Chrome, Edge, Safari, Firefox). Backend phát triển trên nền tảng .NET 10 (C#) Minimal API theo kiến trúc Clean Architecture, cơ sở dữ liệu PostgreSQL lưu trữ trên Supabase Cloud. Frontend xây dựng bằng React 19, TypeScript và Tailwind CSS 4.\n"
    "• Đối tượng người dùng (Users): Gồm 5 nhóm người dùng chính: Guest (Khách vãng lai), Member (Hội viên), Coach (Huấn luyện viên), Receptionist (Nhân viên lễ tân), và Center Manager / Admin (Quản lý trung tâm và quản trị viên hệ thống).\n"
    "• Ràng buộc và Phụ thuộc (Constraints & Dependencies): Yêu cầu kết nối Internet liên tục để đồng bộ dữ liệu thời gian thực. Phụ thuộc vào các dịch vụ bên thứ ba: Cổng thanh toán SePay Webhook (Sacombank / Napas 24/7), API tạo ảnh mã chuẩn VietQR NAPAS 247, Cloudinary CDN lưu trữ đa phương tiện, và Google Gemini 1.5 Flash AI hỗ trợ tạo giáo án."
)
set_para(doc.paragraphs[30], intro_overview, font_size=10.5, space_after=6)

intro_context = (
    "1.2. Product Context Diagram (Sơ đồ Ngữ cảnh Hệ thống)\n"
    "Sơ đồ ngữ cảnh dưới đây thể hiện ranh giới (system boundary) của SmartGym OS và mối quan hệ tương tác với 5 tác nhân người dùng bên ngoài (Guest, Member, Coach, Receptionist, Center Manager) cùng các hệ sinh thái dịch vụ bên ngoài (Cổng thanh toán tự động SePay Webhook & VietQR NAPAS 247 Sacombank, Trí tuệ nhân tạo Google Gemini 1.5 Flash, và Media CDN Cloudinary):"
)
set_para(doc.paragraphs[31], intro_context, font_size=10.5, space_after=4)
doc.paragraphs[32].text = ""

# 4. SECTION I.2: EXISTING SYSTEMS
doc.paragraphs[35].text = ""
set_para(doc.paragraphs[36], "2.1 System 1: GymMaster Vietnam", font_size=12, bold=True, space_before=6, space_after=3)
gymmaster_desc = (
    "• Mô tả ngắn gọn: Phần mềm quản lý phòng gym, yoga, fitness nội địa phổ biến tại Việt Nam (gymmaster.vn).\n"
    "• Tác nhân chính: Chủ phòng gym, Nhân viên lễ tân, Hội viên.\n"
    "• Tính năng tiêu biểu: Quản lý thông tin hội viên, kiểm soát cổng quay bằng vân tay/thẻ từ, bán gói tập và in hóa đơn nhiệt tại quầy.\n"
    "• Ưu điểm: Khả năng tích hợp phần cứng kiểm soát ra vào tốt, quen thuộc với các phòng gym truyền thống tại Việt Nam.\n"
    "• Nhược điểm: Giao diện desktop kiểu cũ (WinForms), thiếu tính năng đặt lịch lớp nhóm linh hoạt trên web, không có AI cá nhân hóa bài tập, quy trình chuyển ca dạy của huấn luyện viên còn thủ công.\n"
    "• Điểm học hỏi & cải tiến của SmartGym OS: Xây dựng nền tảng Web-based hiện đại 100%, hỗ trợ tra cứu và điểm danh hội viên nhanh chóng tại quầy lễ tân qua SĐT/Mã hội viên, bổ sung thanh toán tự động VietQR Napas 24/7 và trợ lý HLV bằng AI Gemini."
)
set_para(doc.paragraphs[37], gymmaster_desc, font_size=10.5, space_after=6)

set_para(doc.paragraphs[38], "2.2 System 2: Mindbody Online (Global)", font_size=12, bold=True, space_before=6, space_after=3)
mindbody_desc = (
    "• Mô tả ngắn gọn: Nền tảng điện toán đám mây quản lý trung tâm thể hình, yoga và wellness hàng đầu thế giới (mindbodyonline.com).\n"
    "• Tác nhân chính: Business Owner, Fitness Instructor, Client/Member, Front-desk Staff.\n"
    "• Tính năng tiêu biểu: Đặt lịch lớp học trực tuyến, quản lý lịch giảng dạy đa bộ môn, thanh toán thẻ tín dụng quốc tế (Stripe).\n"
    "• Ưu điểm: Trải nghiệm người dùng mượt mà, phân hệ đặt chỗ thông minh, hệ thống báo cáo và phân tích chỉ số kinh doanh trực quan.\n"
    "• Nhược điểm: Chi phí bản quyền rất cao, chưa tối ưu cho các phương thức thanh toán phổ biến tại Việt Nam (như chuyển khoản ngân hàng quét mã QR 24/7).\n"
    "• Điểm học hỏi & cải tiến của SmartGym OS: Kế thừa trải nghiệm đặt chỗ trực quan và hệ thống báo cáo KPI chuyên nghiệp, đồng thời bản địa hóa hoàn toàn với cổng thanh toán SePay VietQR Napas 247 tự động và tích hợp AI hỗ trợ HLV."
)
set_para(doc.paragraphs[39], mindbody_desc, font_size=10.5, space_after=6)

# 5. SECTION I.3: BUSINESS PROCESS HEADINGS
doc.paragraphs[55].text = ""
set_para(doc.paragraphs[56], "3.5 Flow 3a: Payment & Service Activation", font_size=13, bold=True, space_before=8, space_after=4)
set_para(doc.paragraphs[61], "3.6 Flow 3b: Reports & Analytics", font_size=13, bold=True, space_before=8, space_after=4)
set_para(doc.paragraphs[65], "3.7 Flow 4: Training & Attendance Management", font_size=13, bold=True, space_before=8, space_after=4)

# 6. SECTION I.4: SYSTEM FUNCTIONS
screen_flow_desc = (
    "Sơ đồ Luồng Màn hình (Screen Flow Diagram) thể hiện mối liên kết và luồng điều hướng giữa các phân hệ giao diện trong hệ thống SmartGym OS:\n"
    "• Phân hệ Công khai (Guest): Bắt đầu từ Trang chủ (Landing Page) ➔ Xem Bộ môn (Facilities) ➔ Xem Bảng giá Gói tập (Packages) ➔ Đăng ký / Đăng nhập (Auth).\n"
    "• Phân hệ Hội viên (Member Portal): Sau khi đăng nhập, hội viên truy cập Dashboard cá nhân ➔ Đặt lớp học nhóm (Class Booking) ➔ Đặt lịch PT 1-1 ➔ Thanh toán giỏ hàng (OnePageCheckout) ➔ Quản lý thẻ hội viên điện tử & Lịch sử tập luyện ➔ Trò chuyện Trợ lý AI (Flow 6).\n"
    "• Phân hệ Huấn luyện viên (Coach Portal): Xem lịch dạy tuần (Coach Schedule) ➔ Mở danh sách lớp & Điểm danh học viên (Attendance) ➔ Nhập chỉ số thể hình InBody ➔ Trợ lý AI gợi ý giáo án bài tập (AI Workout Plan Flow 5) ➔ Báo bận / Đổi ca.\n"
    "• Phân hệ Lễ tân (Receptionist Portal): Màn hình tra cứu & điểm danh hội viên vào trung tâm ➔ Quản lý khách chờ ➔ Thu ngân tại quầy (Counter POS) ➔ Bán gói tập trực tiếp.\n"
    "• Phân hệ Quản trị (Admin / Manager Dashboard): Tổng quan KPI doanh thu & Hội viên ➔ Quản lý người dùng & Phân quyền ➔ Quản lý danh mục gói cước & Phòng tập ➔ Báo cáo phân tích chuyên sâu (Reports & Analytics) ➔ Xuất file Excel (.xlsx)."
)
set_para(doc.paragraphs[71], screen_flow_desc, font_size=10.5, space_after=4)

set_para(doc.paragraphs[74], "Bảng dưới đây mô tả chi tiết danh mục 12 màn hình giao diện chính trong hệ thống SmartGym OS, tương ứng với các phân hệ chức năng:", font_size=10.5, space_after=4)

# TABLE 8: SCREEN DETAILS
header_t8 = ['#', 'Feature (Phân hệ)', 'Screen Name', 'Screen Description (Mô tả chức năng màn hình)']
rows_t8 = [
    ['1', 'Auth', 'Login.tsx / Registration.tsx', 'Màn hình đăng nhập, đăng ký tài khoản, phục hồi mật khẩu và chọn vai trò.'],
    ['2', 'Member - Home', 'MemberDashboard.tsx', 'Bảng điều khiển hội viên: hiển thị thông tin thẻ hội viên, thông tin gói cước, số buổi tập còn lại, chuỗi ngày tập liên tục (Streak).'],
    ['3', 'Member - Pricing', 'PackagesPage.tsx / OnePageCheckout.tsx', 'Xem bảng giá gói tập (Gym, Yoga, Bơi...), chọn chu kỳ thanh toán (1, 6, 12 tháng) và thanh toán tự động VietQR Napas 247 / Ví hội viên.'],
    ['4', 'Member - Classes', 'MemberBooking.tsx', 'Lưới lịch tuần lớp học nhóm Group-X; xem phòng, HLV và đặt chỗ (Atomic booking).'],
    ['5', 'Coach - Schedule', 'CoachSchedulePage.tsx', 'Xem thời khóa biểu giảng dạy tuần, thông tin lớp, sĩ số học viên và nút báo vắng/đổi ca.'],
    ['6', 'Coach - Attendance', 'ClassAttendancePage.tsx', 'Điểm danh học viên theo buổi (Present/Late/Absent), lưu nháp (Draft) hoặc chốt sổ (Finalize) kèm audit reason.'],
    ['7', 'Coach - Workout AI', 'CoachAI.tsx', 'Nhập chỉ số thể hình InBody của học viên và sử dụng Google Gemini AI sinh giáo án bài tập chuẩn cơ sinh học 3 pha.'],
    ['8', 'Receptionist - Gate', 'CheckInPage.tsx', 'Giao diện tra cứu hội viên theo Số điện thoại hoặc Mã thẻ để xác nhận quyền vào tập và điểm danh.'],
    ['9', 'Receptionist - POS', 'CounterPaymentsPage.tsx', 'Thu ngân tại quầy; tiếp nhận đơn hàng chờ, thu tiền mặt/quẹt thẻ và kích hoạt gói tập trực tiếp.'],
    ['10', 'Admin - Analytics', 'ReportsPage.tsx', 'Báo cáo doanh thu, tỷ lệ duy trì hội viên 90 ngày, tỷ lệ lấp đầy lớp học và xuất báo cáo Excel (.xlsx).'],
    ['11', 'Admin - Facilities', 'FacilitiesPage.tsx', 'Quản lý bộ môn thể thao, phòng tập, cơ sở vật chất và hình ảnh chi nhánh.'],
    ['12', 'Admin - Users', 'MembersPage.tsx', 'Quản lý tài khoản toàn hệ thống, cấp quyền, đổi vai trò và khóa/mở tài khoản.']
]
update_table_data(doc.tables[8], header_t8, rows_t8, [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT])

# USER AUTHORIZATION
set_para(doc.paragraphs[77], "Hệ thống SmartGym OS áp dụng cơ chế Phân quyền Truy cập Dựa trên Vai trò (Role-Based Access Control - RBAC) nghiêm ngặt nhằm đảm bảo tính bảo mật và phân định rõ trách nhiệm giữa các tác nhân:", font_size=10.5, space_after=4)

role_desc = (
    "• Role 1 - Guest (Khách vãng lai): Người dùng chưa đăng nhập. Có quyền xem thông tin giới thiệu trung tâm, danh sách bộ môn, bảng giá gói tập, lịch học mẫu và thực hiện đăng ký tài khoản mới.\n"
    "• Role 2 - Member (Hội viên): Người dùng đã đăng ký và kích hoạt tài khoản. Có quyền đăng ký/gia hạn gói tập, đặt chỗ lớp học nhóm (Class Booking), thanh toán qua VietQR Napas 24/7 hoặc Ví hội viên, xem thông tin thẻ hội viên và nhận bài tập về nhà.\n"
    "• Role 3 - Coach (Huấn luyện viên): Nhân sự chuyên môn. Có quyền xem lịch giảng dạy cá nhân, điểm danh học viên từng buổi học (Present/Late/Absent), ghi nhận chỉ số InBody, giao bài tập AI và gửi đơn báo vắng/đổi ca dạy.\n"
    "• Role 4 - Receptionist (Nhân viên Lễ tân): Nhân sự vận hành quầy tiếp tân. Có quyền tra cứu hồ sơ hội viên theo SĐT, điểm danh vào trung tâm, tiếp nhận yêu cầu hỗ trợ, bán gói tập tại quầy (POS) và thu tiền mặt/quẹt thẻ.\n"
    "• Role 5 - Center Manager / Admin (Quản lý Trung tâm & Quản trị viên): Cấp quản lý cao nhất. Có quyền quản trị toàn bộ hệ thống: cấu hình bộ môn, phòng tập, gói cước, phân quyền nhân sự, duyệt bảng lương và theo dõi báo cáo doanh thu kèm quyền xuất file Excel."
)
doc.paragraphs[78].text = "Định nghĩa chi tiết các vai trò người dùng trong hệ thống:"
set_para(doc.paragraphs[79], role_desc, font_size=10, space_after=6)
doc.paragraphs[80].text = ""
doc.paragraphs[81].text = ""

# TABLE 9: USER AUTHORIZATION MATRIX
header_t9 = ['Screen / Feature Area', 'Guest', 'Member', 'Coach', 'Receptionist', 'Manager (Admin)']
rows_t9 = [
    ['Xem Trang chủ, Bộ môn, Bảng giá gói', 'X', 'X', 'X', 'X', 'X'],
    ['Đăng ký tài khoản, Đăng nhập hệ thống', 'X', 'X', 'X', 'X', 'X'],
    ['Mua gói tập, Nạp tiền ví, Thanh toán VietQR', '—', 'X', '—', '—', '—'],
    ['Đặt chỗ lớp học nhóm, Đặt slot PT 1-1', '—', 'X', '—', '—', '—'],
    ['Quản lý thông tin thẻ hội viên, Lịch sử tập luyện', '—', 'X', '—', '—', '—'],
    ['Xem lịch dạy cá nhân, Báo vắng / Đổi ca', '—', '—', 'X', '—', '—'],
    ['Điểm danh lớp học, Nhập chỉ số InBody, AI Giáo án', '—', '—', 'X', '—', '—'],
    ['Tra cứu & Điểm danh hội viên, Thu ngân POS quầy', '—', '—', '—', 'X', '—'],
    ['Cấu hình Bộ môn, Phòng tập, Gói cước, Phân quyền', '—', '—', '—', '—', 'X'],
    ['Báo cáo Doanh thu, Tỷ lệ Retention, Xuất Excel', '—', '—', '—', '—', 'X']
]
update_table_data(doc.tables[9], header_t9, rows_t9, [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER])

# 7. SECTION I.5: ENTITY RELATIONSHIP DIAGRAM
set_para(doc.paragraphs[84], "Sơ đồ Thực thể Quan hệ Mức Khái niệm (Conceptual ERD) thể hiện cấu trúc các thực thể dữ liệu nghiệp vụ trọng tâm trong SmartGym OS và mối liên kết logic giữa chúng. Dữ liệu được thiết kế chuẩn hóa mức 3NF, đảm bảo tính toàn vẹn và tối ưu hóa hiệu năng truy vấn.", font_size=10.5, space_after=4)
doc.paragraphs[86].text = "Entities Description (Bảng Mô tả Thực thể Dữ liệu):"

# TABLE 10: ENTITIES DESCRIPTION
header_t10 = ['#', 'Entity', 'Description (Mô tả thực thể)']
rows_t10 = [
    ['1', 'User', 'Đại diện cho tài khoản người dùng trong hệ thống (Hội viên, HLV, Lễ tân, Quản lý).'],
    ['2', 'Role', 'Định nghĩa các quyền hạn và vai trò truy cập (admin, manager, coach, receptionist, member).'],
    ['3', 'Package', 'Danh mục gói tập (Gói môn độc lập sport hoặc Gói nâng cấp hội viên membership Plus/VIP).'],
    ['4', 'Subscription', 'Hợp đồng đăng ký gói tập của hội viên, lưu trữ thời hạn bắt đầu, kết thúc và trạng thái kích hoạt.'],
    ['5', 'GroupClass', 'Lớp học nhóm theo lịch (Yoga, Boxing, Bơi...), lưu thông tin giờ học, HLV, phòng tập và sĩ số.'],
    ['6', 'ClassBooking', 'Giao dịch giữ chỗ tham gia lớp học nhóm của hội viên.'],
    ['7', 'Invoice', 'Chứng từ hóa đơn thanh toán cho gói cước, vé học hoặc sản phẩm bán lẻ.'],
    ['8', 'CheckInLog', 'Nhật ký ghi nhận lịch sử vào tập và điểm danh của hội viên tại chi nhánh.'],
    ['9', 'CoachProfile', 'Hồ sơ năng lực của huấn luyện viên: chuyên môn, số năm kinh nghiệm, đánh giá sao.'],
    ['10', 'WorkoutPlan', 'Giáo án kế hoạch bài tập (tự tạo hoặc do trợ lý AI Gemini gợi ý).']
]
update_table_data(doc.tables[10], header_t10, rows_t10, [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT])

# 8. SECTION I.6: STATE TRANSITION DIAGRAMS
set_para(doc.paragraphs[89], "Phần này mô tả sơ đồ chuyển đổi trạng thái (State Transition Diagrams) của 3 thực thể nghiệp vụ quan trọng nhất trong hệ thống: Hợp đồng gói tập (Subscription), Lịch đặt chỗ lớp học (Class Booking), và Hóa đơn thanh toán (Invoice):", font_size=10.5, space_after=4)

state_desc = (
    "6.1. Subscription State Transition (Trạng thái Hợp đồng Gói tập):\n"
    "• Pending: Khởi tạo đơn mua gói tập, chờ thanh toán thành công qua VietQR Napas 247 hoặc Ví hội viên.\n"
    "• Active: Thanh toán thành công; gói tập được kích hoạt sử dụng để check-in và đặt lớp.\n"
    "• Expired: Hết thời hạn gói (current_date > end_date) hoặc quá thời hạn thanh toán 24h.\n"
    "• Suspended: Quản lý tạm khóa do hội viên vi phạm nội quy trung tâm hoặc có đơn xin bảo lưu.\n"
    "• Cancelled: Đơn mua bị hủy hoặc được hoàn tiền theo chính sách trung tâm.\n\n"
    "6.2. Class Booking State Transition (Trạng thái Đặt chỗ Lớp học):\n"
    "• Confirmed: Hội viên đặt chỗ thành công; hệ thống giữ slot và trừ capacity khả dụng của lớp.\n"
    "• Attended: HLV hoặc Lễ tân điểm danh xác nhận hội viên Có mặt tại buổi học.\n"
    "• NoShow: Buổi học kết thúc nhưng hội viên vắng mặt không phép; hệ thống ghi nhận vi phạm.\n"
    "• Cancelled: Hội viên tự hủy chỗ trước giờ học ít nhất 2 tiếng; hoàn lại slot trống cho học viên khác.\n"
    "• ClassCancelled: Quản lý hoặc HLV hủy buổi học đột xuất do sự cố; hệ thống gửi thông báo tự động.\n\n"
    "6.3. Invoice State Transition (Trạng thái Hóa đơn Thanh toán):\n"
    "• Pending: Hóa đơn được khởi tạo, chờ tín hiệu thanh toán từ cổng thanh toán hoặc quầy thu ngân.\n"
    "• Completed: Giao dịch thành công; SePay Webhook hoặc nhân viên xác nhận đã nhận đủ tiền.\n"
    "• Expired: Quá thời hạn thanh toán (15 phút đối với giao dịch VietQR động) mà chưa nhận được tiền.\n"
    "• Refunded: Hóa đơn đã hoàn tiền cho khách hàng theo phê duyệt của Quản lý."
)
set_para(doc.paragraphs[90], state_desc, font_size=10, space_after=6)
doc.paragraphs[92].text = ""

# 9. SECTION II: FUNCTIONAL REQUIREMENTS (ALL 6 FEATURES EXPANDED)
set_para(doc.paragraphs[96], "1. Feature 1: Quản lý Gói tập & Mua gói (Package & Subscription)", font_size=13, bold=True, space_before=8, space_after=4)
set_para(doc.paragraphs[97], "a. Function 1.1: Xem Bảng giá & Đăng ký Gói tập (Pricing & Package Selection)", font_size=12, bold=True, space_before=4, space_after=3)

f1_desc = (
    "• Function trigger: Người dùng nhấn vào menu \"Gói tập\" (/packages) hoặc nút \"Mua ngay\" trên trang chủ.\n"
    "• Function description:\n"
    "  - Actor: Member, Guest.\n"
    "  - Mục đích: Xem danh mục các gói môn (Bơi, Yoga, Gym...) và gói nâng cấp hội viên (Plus, VIP) theo chu kỳ 1 tháng, 6 tháng (giảm 10%), 12 tháng (giảm 20%).\n"
    "  - Xử lý dữ liệu: Truy vấn API GET /api/packages, tính toán giá cước tự động theo chu kỳ được chọn.\n"
    "• Screen layout (Mockup Prototype):\n"
    "  +-------------------------------------------------------------------------------+\n"
    "  | SMARTGYM OS - GÓI TẬP THÀNH VIÊN                                              |\n"
    "  | Chọn chu kỳ: [ 1 Tháng ]  [ 6 Tháng (-10%) ]  [ (X) 12 Tháng (-20%) ]         |\n"
    "  +-------------------------------------------------------------------------------+\n"
    "  |  [ Gói Bơi Lội ]          |  [ Gói Fitness Plus ]     |  [ Gói Toàn Diện VIP ]|\n"
    "  |  500.000 đ / tháng        |  800.000 đ / tháng        |  1.500.000 đ / tháng  |\n"
    "  |  - Hồ bơi 4 mùa Olympic   |  - Full máy tập gym       |  - Tập full tất cả môn|\n"
    "  |  - Huấn luyện viên bơi    |  - Tham gia lớp Group-X   |  - Tặng 5 buổi PT 1-1 |\n"
    "  |  - Tủ đồ locker           |  - Xông hơi Sauna         |  - Khách đi cùng free |\n"
    "  |  [ ĐĂNG KÝ NGAY ]         |  [ (X) ĐĂNG KÝ NGAY ]     |  [ ĐĂNG KÝ NGAY ]     |\n"
    "  +-------------------------------------------------------------------------------+\n"
    "• Function Details:\n"
    "  - Normal flow: Khách chọn chu kỳ ➔ chọn gói ➔ nếu chưa đăng nhập thì chuyển hướng sang màn hình Đăng ký/Đăng nhập ➔ nếu đã đăng nhập thì điều hướng sang OnePageCheckout.tsx.\n"
    "  - Validation & Business Logic: Kiểm tra hội viên đã có gói này chưa; nếu đang có gói còn hạn thì hệ thống tính cộng dồn ngày kết thúc (end_date = old_end_date + durationMonths)."
)
set_para(doc.paragraphs[98], f1_desc, font_size=10, space_after=6)

# Clear old template paragraphs 99-104
for p_i in range(99, 105):
    doc.paragraphs[p_i].text = ""

set_para(doc.paragraphs[105], "2. Feature 2: Quản lý Lớp học nhóm & Đặt chỗ Atomic (Class & Booking)", font_size=13, bold=True, space_before=8, space_after=4)
doc.paragraphs[106].text = ""
set_para(doc.paragraphs[107], "a. Function 2.1: Hội viên Đặt chỗ Lớp học (Pay & Book Class)", font_size=12, bold=True, space_before=4, space_after=3)

f2_desc = (
    "• Function trigger: Hội viên chọn một lớp trên lưới lịch tuần và bấm nút \"Đăng ký tham gia\" tại MemberBooking.tsx.\n"
    "• Function description:\n"
    "  - Actor: Member.\n"
    "  - Mục đích: Giữ chỗ trong lớp học nhóm có giới hạn sức chứa, tránh quá tải phòng tập.\n"
    "  - Xử lý dữ liệu: Gọi API POST /api/classes/{id}/pay-and-book.\n"
    "• Screen layout (Mockup Prototype):\n"
    "  +-------------------------------------------------------------------------------+\n"
    "  | CHI TIẾT LỚP HỌC: YOGA CƠ BẢN BUỔI SÁNG                                       |\n"
    "  | Thời gian: 06:30 - 07:30 (Thứ 2, 4, 6) | Phòng: Studio Yoga 02                |\n"
    "  | Huấn luyện viên: Nguyễn Văn A (Master Yoga 8 năm kinh nghiệm)                 |\n"
    "  | Sĩ số hiện tại: 18 / 20 chỗ (Còn 2 chỗ trống)                                 |\n"
    "  | [ HỦY BỎ ]                                            [ XÁC NHẬN ĐẶT CHỖ ]   |\n"
    "  +-------------------------------------------------------------------------------+\n"
    "• Function Details:\n"
    "  - Normal flow: Hội viên xác nhận đặt chỗ ➔ Hệ thống kiểm tra điều kiện gói tập ➔ Giữ chỗ thành công ➔ Hiển thị trên lịch cá nhân và gửi thông báo xác nhận.\n"
    "  - Concurrency Logic: Áp dụng khóa bi quan (SELECT ... FOR UPDATE) trên bản ghi lớp học trong PostgreSQL để đảm bảo không bị tình trạng Overbooking khi nhiều hội viên cùng đặt slot cuối cùng tại một thời điểm."
)
set_para(doc.paragraphs[108], f2_desc, font_size=10, space_after=6)

# NOW WE INJECT FEATURES 3, 4, 5, 6 RIGHT AFTER PARAGRAPH 108
feat_insertion_point = doc.paragraphs[108]._p

f3_title = "3. Feature 3: Thanh toán Tự động VietQR Napas 24/7 & Cổng SePay Webhook (Flow 3)"
f3_f1_title = "a. Function 3.1: Thanh toán Tự động bằng VietQR Napas 247 & Webhook SePay"
f3_desc = (
    "• Function trigger: Tại màn hình thanh toán hoặc nạp ví, người dùng chọn hình thức \"Mã VietQR\" và nhập số tiền.\n"
    "• Function description:\n"
    "  - Actor: Member, Guest.\n"
    "  - Mục đích: Thanh toán tức thì qua chuyển khoản ngân hàng không dùng tiền mặt, tự động nhận tiền trong 2 giây mà không cần nhân viên duyệt tay.\n"
    "  - Xử lý dữ liệu: Gọi API POST /api/member/wallet/top-up hoặc POST /api/payments/create-invoice, đồng thời mở cổng Webhook POST /api/webhooks/sepay để tiếp nhận biến động số dư.\n"
    "• Screen layout (Mockup Prototype):\n"
    "  +-------------------------------------------------------------------------------+\n"
    "  | VÍ & SỐ DƯ TÀI KHOẢN - NẠP TIỀN VIETQR NAPAS 24/7                             |\n"
    "  | Số tiền nạp: [ 20.000 đ ]                                                     |\n"
    "  | Ngân hàng: Sacombank | STK: 0979977428 | Chủ TK: PHAM DUC THANH PHUONG        |\n"
    "  | Nội dung CK: NAPVI 3955 (Bắt buộc ghi đúng để hệ thống khớp tiền tự động)     |\n"
    "  |                  [ MÃ QR CODE NAPAS 247 ]                                     |\n"
    "  | [ Tôi đã chuyển tiền • Xác nhận nạp ví ]                                      |\n"
    "  | [ ⚡ Mô phỏng Webhook Vietcombank báo tiền về (Demo Test) ]                    |\n"
    "  +-------------------------------------------------------------------------------+\n"
    "• Function Details:\n"
    "  - Normal flow: Người dùng quét QR trên ứng dụng ngân hàng ➔ Tiền vào tài khoản trung tâm ➔ SePay gửi Webhook JSON chứa số tiền và nội dung chuyển khoản ➔ Backend regex bóc tách mã hóa đơn/User ID ➔ Tăng số dư ví và cập nhật trạng thái hóa đơn completed ➔ Bắn sự kiện Webhook thành công về Frontend cập nhật số dư tức thì.\n"
    "  - Demo Test Simulation: Cung cấp endpoint POST /api/member/wallet/simulate-webhook để giả lập ngân hàng gửi tín hiệu tiền về phục vụ buổi bảo vệ đồ án mà không cần chuyển tiền thật."
)

f4_title = "4. Feature 4: Trợ lý Huấn luyện viên AI Copilot Sinh Giáo án (Flow 5)"
f4_f1_title = "a. Function 4.1: Sinh Giáo án Tập luyện Chuẩn Cơ sinh học bằng Google Gemini AI"
f4_desc = (
    "• Function trigger: Huấn luyện viên truy cập Coach Portal ➔ chọn menu \"Coach AI\" (/coach/ai).\n"
    "• Function description:\n"
    "  - Actor: Coach.\n"
    "  - Mục đích: Hỗ trợ Huấn luyện viên soạn thảo giáo án tập luyện chuyên nghiệp chỉ trong 3 giây, tuân thủ nguyên tắc cơ sinh học và an toàn vận động.\n"
    "  - Xử lý dữ liệu: Gọi API POST /api/workout-plans/ai-recommendation tích hợp Gemini 1.5 Flash thông qua Backend Proxy bảo mật.\n"
    "• Screen layout (Mockup Prototype):\n"
    "  +-------------------------------------------------------------------------------+\n"
    "  | COACH AI COPILOT - BỘ THIẾT LẬP GIÁO ÁN THÔNG MINH                            |\n"
    "  | Đối tượng: [ (X) Học viên cụ thể ]  [ Lớp học ]                               |\n"
    "  | Bộ môn: [ Gym v ] | Trình độ: [ Intermediate v ] | Mục tiêu: [ Tăng cơ v ]    |\n"
    "  | Thời lượng: [ 45 phút ] | Dụng cụ có sẵn: [ Tạ đơn, Đòn tạ, Máy kéo cáp ]     |\n"
    "  | [ ✨ Sinh Giáo án AI bằng Gemini ]                     [ Dùng Giáo án mẫu ]   |\n"
    "  +-------------------------------------------------------------------------------+\n"
    "  | BẢN THẢO BÀI TẬP (AI DRAFT):                                                  |\n"
    "  | • Pha 1 - Khởi động (Warm-up): Xoay khớp, Dynamic Stretch (7 phút)           |\n"
    "  | • Pha 2 - Khối bài chính: Barbell Squat (4x8), Leg Press (3x12)              |\n"
    "  | • Pha 3 - Hạ nhiệt & Giãn cơ (Cooldown): Foam Roller, Static Stretch (5 phút)|\n"
    "  | Cảnh báo chấn thương: Học viên có tiền sử đau khớp gối nhẹ - Tránh khóa khớp.|\n"
    "  | [ Lưu bản nháp ]      [ Yêu cầu AI tinh chỉnh ]      [ (X) Phê duyệt & Gán ]  |\n"
    "  +-------------------------------------------------------------------------------+\n"
    "• Function Details:\n"
    "  - Coach in the loop: Mô hình AI chỉ đóng vai trò trợ lý đề xuất bản nháp (Draft). HLV có toàn quyền sửa đổi số Set, số Rep, thời gian nghỉ trước khi bấm Phê duyệt (Approve) và Gán (Assign) cho học viên.\n"
    "  - Fallback Engine: Nếu mất kết nối Internet hoặc vượt hạn mức API Gemini, hệ thống tự động kích hoạt bộ sinh bài tập dựa trên tập luật (Rule-based Fallback) để không làm gián đoạn buổi dạy của HLV."
)

f5_title = "5. Feature 5: Điểm danh Hội viên & Vận hành Quầy Lễ tân (Flow 4)"
f5_f1_title = "a. Function 5.1: Tra cứu & Điểm danh Hội viên tại Quầy Lễ tân"
f5_desc = (
    "• Function trigger: Hội viên đến trung tâm và đọc Số điện thoại hoặc Mã hội viên; Lễ tân mở màn hình CheckInPage.tsx để tra cứu.\n"
    "• Function description:\n"
    "  - Actor: Receptionist.\n"
    "  - Mục đích: Xác nhận quyền vào tập hợp lệ của hội viên dựa trên dữ liệu phần mềm thuần túy (không sử dụng thiết bị phần cứng IoT/cổng xoay), tự động tính toán chuỗi ngày tập liên tục (Streak).\n"
    "  - Xử lý dữ liệu: Gọi API POST /api/checkin (truyền memberId và thời gian hiện tại).\n"
    "• Screen layout (Mockup Prototype):\n"
    "  +-------------------------------------------------------------------------------+\n"
    "  | LỄ TÂN - ĐIỂM DANH HỘI VIÊN VÀO TRUNG TÂM (CHECK-IN)                          |\n"
    "  | Tra cứu SĐT / Họ tên / Mã hội viên: [ 0979977428          ] [ TÌM KIẾM ]       |\n"
    "  +-------------------------------------------------------------------------------+\n"
    "  | THÔNG TIN HỘI VIÊN:                                                           |\n"
    "  | Họ tên: Bùi Nam Thuận | Hạng: VIP Pro | Mã số: MB1002                         |\n"
    "  | Gói môn còn hạn: Gói Gym 12 Tháng (Hạn đến: 31/12/2026 - Còn 53 ngày)        |\n"
    "  | Trạng thái gói: HỢP LỆ ✓                                                      |\n"
    "  | [ HỦY BỎ ]                                          [ (X) XÁC NHẬN VÀO TẬP ]  |\n"
    "  +-------------------------------------------------------------------------------+\n"
    "• Function Details:\n"
    "  - Xử lý nghiệp vụ: Lễ tân tra cứu hội viên ➔ Hệ thống kiểm tra trong bảng subscriptions gói cước còn hạn hay không ➔ Nếu hợp lệ, bấm 'Xác nhận vào tập' để ghi nhận bản ghi check_in_logs và tính toán Streak theo múi giờ GMT+7.\n"
    "  - Từ chối tự động: Nếu gói tập đã hết hạn hoặc chưa đăng ký bộ môn, hệ thống hiển thị cảnh báo đỏ và gợi ý Lễ tân bán/gia hạn gói tập ngay tại quầy."
)

f6_title = "6. Feature 6: Trợ lý Hội viên Thông minh (Member AI Assistant - Flow 6)"
f6_f1_title = "a. Function 6.1: Trợ lý Hỏi đáp Nhận thức Ngữ cảnh & Điều hướng 1 Chạm"
f6_desc = (
    "• Function trigger: Hội viên bấm vào biểu tượng Trợ lý AI ở góc màn hình Member Portal.\n"
    "• Function description:\n"
    "  - Actor: Member.\n"
    "  - Mục đích: Đồng hành giải đáp 24/7 mọi thắc mắc về nội quy, gói cước, lịch tập cá nhân và điều hướng nhanh tới màn hình chức năng liên quan.\n"
    "  - Xử lý dữ liệu: Gọi API POST /api/member/ai-ask tích hợp Gemini AI kết hợp dữ liệu ngữ cảnh thời gian thực của hội viên.\n"
    "• Screen layout (Mockup Prototype):\n"
    "  +-------------------------------------------------------------------------------+\n"
    "  | SMARTGYM AI COPILOT - TRỢ LÝ HỘI VIÊN 24/7                                    |\n"
    "  | Hội viên: \"Gói tập Yoga của tôi còn hạn đến khi nào vậy?\"                     |\n"
    "  | AI: \"Chào bạn Thuận, gói Yoga Vinyasa của bạn còn hạn đến ngày 15/12/2026     |\n"
    "  |      (còn 37 ngày). Hôm nay bạn có 1 lịch học Yoga lúc 18h00 tại Studio 02.\" |\n"
    "  | [ 📅 Xem lịch tập của tôi ]              [ 💳 Gia hạn gói tập ngay ]          |\n"
    "  +-------------------------------------------------------------------------------+\n"
    "• Function Details:\n"
    "  - Context Injection: Backend tự động trích xuất User ID của hội viên từ JWT token, nạp thông tin gói tập hiện tại, lịch học sắp tới vào prompt của Gemini AI.\n"
    "  - Smart Actions: Phản hồi của AI luôn đính kèm nút bấm điều hướng (Action Pill) tương ứng (schedule, booking, packages, workouts), người dùng bấm 1 chạm để chuyển ngay đến trang đích mà không cần tìm kiếm."
)

cur_elem = feat_insertion_point
for heading, subhead, body in [
    (f3_title, f3_f1_title, f3_desc),
    (f4_title, f4_f1_title, f4_desc),
    (f5_title, f5_f1_title, f5_desc),
    (f6_title, f6_f1_title, f6_desc)
]:
    cur_elem, _ = add_para_after(cur_elem, heading, font_size=13, bold=True, space_before=8, space_after=4)
    cur_elem, _ = add_para_after(cur_elem, subhead, font_size=12, bold=True, space_before=4, space_after=3)
    cur_elem, _ = add_para_after(cur_elem, body, font_size=10, space_before=2, space_after=6)

# 10. SECTION III: DATABASE DESIGN (COMPLETE 15 TABLES)
set_para(doc.paragraphs[112], "Cơ sở dữ liệu SmartGym OS được xây dựng trên hệ quản trị quan hệ PostgreSQL lưu trữ trên nền tảng Supabase Cloud. CSDL gồm 15 bảng quan hệ cốt lõi tuân thủ chuẩn 3NF, áp dụng khóa ngoại, chỉ mục (Index B-Tree) trên các cột tra cứu thường xuyên (phone_number, email, start_time) và ràng buộc toàn vẹn dữ liệu.", font_size=10.5, space_after=4)
doc.paragraphs[114].text = "Table Description (Bảng Tổng mục 15 Bảng Quan hệ Trọng tâm của Hệ thống):"

# TABLE 11: DATABASE SCHEMA TABLE DESCRIPTION
header_t11 = ['No', 'Table Name', 'Description (Mô tả chức năng bảng)', 'Người phụ trách']
rows_t11 = [
    ['1', 'roles', 'Bảng danh mục phân quyền truy cập 5 vai trò hệ thống.', 'Cả nhóm'],
    ['2', 'users', 'Bảng người dùng toàn hệ thống (Hội viên, HLV, Lễ tân, Quản lý).', 'Cả nhóm'],
    ['3', 'facilities', 'Danh sách cơ sở / chi nhánh trung tâm thể thao.', 'Cả nhóm'],
    ['4', 'sports', 'Danh mục các bộ môn thể thao (Gym, Yoga, Boxing, Bơi lội...).', 'Cả nhóm'],
    ['5', 'packages', 'Bảng quản lý gói cước (Gói môn độc lập và Gói thành viên VIP).', 'Phương'],
    ['6', 'package_sports', 'Bảng liên kết nhiều-nhiều giữa gói tập và các bộ môn được phép tập.', 'Phương'],
    ['7', 'subscriptions', 'Bản ghi hợp đồng hội viên, lưu trữ thời hạn bắt đầu và ngày hết hạn.', 'Phương'],
    ['8', 'classes', 'Lịch lớp học nhóm (Group-X), giờ học, phòng tập, HLV và sức chứa.', 'Long'],
    ['9', 'class_bookings', 'Bảng đặt chỗ tham gia lớp học nhóm của hội viên.', 'Long'],
    ['10', 'check_in_logs', 'Nhật ký điểm danh vào tập của hội viên tại trung tâm.', 'Long'],
    ['11', 'invoices', 'Bảng hóa đơn chứng từ toàn bộ các giao dịch thanh toán.', 'Thuận'],
    ['12', 'invoice_items', 'Chi tiết từng sản phẩm hoặc dịch vụ trong hóa đơn.', 'Thuận'],
    ['13', 'coaches', 'Hồ sơ năng lực huấn luyện viên (kinh nghiệm, chuyên môn, rating).', 'Nam'],
    ['14', 'workout_plans', 'Kế hoạch bài tập giáo án (HLV tự tạo hoặc do AI gợi ý).', 'Nam'],
    ['15', 'workout_plan_exercises', 'Chi tiết danh sách bài tập, số hiệp (sets), số lần (reps), nghỉ.', 'Nam']
]
update_table_data(doc.tables[11], header_t11, rows_t11, [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER])

# SECTION III.2: TABLE DETAIL DYNAMIC CLEANUP
for p in doc.paragraphs:
    txt = p.text.strip()
    if '[Give some lines about the table here>>' in txt or '[Table fields' in txt:
        if '[Give some lines about the table here>>' in txt:
            set_para(p, "Bảng dưới đây đặc tả chi tiết cấu trúc các trường dữ liệu, kiểu dữ liệu, kích thước, ràng buộc khóa chính/khóa ngoại và ghi chú nghiệp vụ cho toàn bộ 15 bảng cơ sở dữ liệu của hệ thống:", font_size=10.5, space_after=4)
        else:
            p.text = ""
    elif '<< Table Name 1 >>' in txt:
        set_para(p, "2.1. Table: roles (Bảng Vai trò Phân quyền)", font_size=12, bold=True, space_before=6, space_after=3)
    elif '<< Table Name 2 >>' in txt:
        set_para(p, "2.2. Table: users (Bảng Tài khoản Người dùng)", font_size=12, bold=True, space_before=6, space_after=3)

# TABLE 12: ROLES
header_td = ['#', 'Field name', 'Type', 'Size', 'Unique', 'Not Null', 'PK/FK', 'Notes']
rows_roles = [
    ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính tự sinh (gen_random_uuid())'],
    ['2', 'name', 'VARCHAR', '50', 'Yes', 'Yes', '—', 'Tên vai trò (admin, manager, coach, receptionist, member)'],
    ['3', 'description', 'TEXT', '—', 'No', 'No', '—', 'Mô tả chi tiết quyền hạn']
]
update_table_data(doc.tables[12], header_td, rows_roles, [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT])

# TABLE 13: USERS
rows_users = [
    ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính tài khoản'],
    ['2', 'role_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết roles.id'],
    ['3', 'full_name', 'VARCHAR', '100', 'No', 'Yes', '—', 'Họ và tên người dùng'],
    ['4', 'email', 'VARCHAR', '150', 'Yes', 'Yes', '—', 'Địa chỉ email đăng nhập'],
    ['5', 'phone_number', 'VARCHAR', '20', 'Yes', 'No', '—', 'Số điện thoại liên hệ'],
    ['6', 'password_hash', 'VARCHAR', '255', 'No', 'Yes', '—', 'Mật khẩu mã hóa BCrypt'],
    ['7', 'avatar_url', 'TEXT', '—', 'No', 'No', '—', 'URL ảnh đại diện trên Cloudinary'],
    ['8', 'is_active', 'BOOLEAN', '—', 'No', 'Yes', '—', 'Trạng thái hoạt động (mặc định true)'],
    ['9', 'created_at', 'TIMESTAMPTZ', '—', 'No', 'Yes', '—', 'Thời điểm tạo tài khoản'],
    ['10', 'updated_at', 'TIMESTAMPTZ', '—', 'No', 'No', '—', 'Thời điểm cập nhật gần nhất']
]
update_table_data(doc.tables[13], header_td, rows_users, [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT])

# ALL REMAINING TABLES APPENDED CLEANLY AFTER TABLE 13
last_element = doc.tables[13]._tbl

full_tables_spec = [
    ("2.3. Table: sports (Bảng Danh mục Bộ môn Thể thao)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính bộ môn'],
        ['2', 'name', 'VARCHAR', '100', 'Yes', 'Yes', '—', 'Tên bộ môn (Gym, Yoga, Boxing, Bơi lội...)'],
        ['3', 'description', 'TEXT', '—', 'No', 'No', '—', 'Mô tả chi tiết bộ môn'],
        ['4', 'icon_url', 'TEXT', '—', 'No', 'No', '—', 'Icon đại diện bộ môn']
    ]),
    ("2.4. Table: facilities (Bảng Phòng tập & Cơ sở vật chất)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính phòng tập'],
        ['2', 'name', 'VARCHAR', '100', 'Yes', 'Yes', '—', 'Tên phòng (Studio Yoga 01, Bể bơi Olympic...)'],
        ['3', 'room_type', 'VARCHAR', '50', 'No', 'Yes', '—', 'Loại phòng: studio, pool, gym_floor'],
        ['4', 'capacity', 'INT', '—', 'No', 'Yes', '—', 'Sức chứa tối đa'],
        ['5', 'status', 'VARCHAR', '30', 'No', 'Yes', '—', 'available, maintenance']
    ]),
    ("2.5. Table: packages (Bảng Danh mục Gói cước)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính gói cước'],
        ['2', 'name', 'VARCHAR', '100', 'Yes', 'Yes', '—', 'Tên gói tập (Bơi lội, Gym, VIP...)'],
        ['3', 'type', 'VARCHAR', '50', 'No', 'Yes', '—', 'Phân loại: sport hoặc membership'],
        ['4', 'price_monthly', 'DECIMAL', '12,2', 'No', 'Yes', '—', 'Đơn giá gói theo tháng'],
        ['5', 'benefits', 'TEXT[]', '—', 'No', 'No', '—', 'Mảng danh sách quyền lợi gói'],
        ['6', 'is_active', 'BOOLEAN', '—', 'No', 'Yes', '—', 'Trạng thái mở bán (mặc định true)']
    ]),
    ("2.6. Table: package_sports (Bảng Phân quyền Gói tập - Bộ môn)", [
        ['1', 'package_id', 'UUID', '—', 'No', 'Yes', 'PK, FK', 'Liên kết packages.id'],
        ['2', 'sport_id', 'UUID', '—', 'No', 'Yes', 'PK, FK', 'Liên kết sports.id'],
        ['3', 'daily_entry_limit', 'INT', '—', 'No', 'No', '—', 'Giới hạn số lượt vào/ngày (NULL = không giới hạn)']
    ]),
    ("2.7. Table: subscriptions (Bảng Hợp đồng Gói tập Hội viên)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính hợp đồng'],
        ['2', 'user_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết users.id (Hội viên)'],
        ['3', 'package_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết packages.id'],
        ['4', 'start_date', 'DATE', '—', 'No', 'Yes', '—', 'Ngày bắt đầu có hiệu lực'],
        ['5', 'end_date', 'DATE', '—', 'No', 'Yes', '—', 'Ngày hết hạn gói cước'],
        ['6', 'status', 'VARCHAR', '30', 'No', 'Yes', '—', 'active, expired, suspended, cancelled'],
        ['7', 'price_paid', 'DECIMAL', '12,2', 'No', 'Yes', '—', 'Số tiền thực tế đã thanh toán'],
        ['8', 'sessions_left', 'INT', '—', 'No', 'No', '—', 'Số buổi tập PT/lớp còn lại'],
        ['9', 'created_at', 'TIMESTAMPTZ', '—', 'No', 'Yes', '—', 'Thời điểm đăng ký']
    ]),
    ("2.8. Table: classes (Bảng Lớp học nhóm Group-X)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính lớp học'],
        ['2', 'sport_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết sports.id'],
        ['3', 'coach_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết users.id (Huấn luyện viên)'],
        ['4', 'title', 'VARCHAR', '150', 'No', 'Yes', '—', 'Tên buổi học (Yoga Vinyasa, Boxing...)'],
        ['5', 'start_time', 'TIMESTAMPTZ', '—', 'No', 'Yes', '—', 'Thời gian bắt đầu'],
        ['6', 'end_time', 'TIMESTAMPTZ', '—', 'No', 'Yes', '—', 'Thời gian kết thúc'],
        ['7', 'room', 'VARCHAR', '50', 'No', 'Yes', '—', 'Phòng tập tổ chức'],
        ['8', 'capacity', 'INT', '—', 'No', 'Yes', '—', 'Sức chứa tối đa (mặc định 20)'],
        ['9', 'status', 'VARCHAR', '30', 'No', 'Yes', '—', 'scheduled, in_progress, completed, cancelled']
    ]),
    ("2.9. Table: class_bookings (Bảng Đặt chỗ Tham gia Lớp)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính đặt chỗ'],
        ['2', 'class_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết classes.id'],
        ['3', 'user_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết users.id (Hội viên)'],
        ['4', 'status', 'VARCHAR', '30', 'No', 'Yes', '—', 'confirmed, attended, no_show, cancelled'],
        ['5', 'created_at', 'TIMESTAMPTZ', '—', 'No', 'Yes', '—', 'Thời điểm đặt chỗ thành công']
    ]),
    ("2.10. Table: check_in_logs (Bảng Nhật ký Điểm danh Vào tập)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính lượt điểm danh'],
        ['2', 'user_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết users.id (Hội viên)'],
        ['3', 'check_in_time', 'TIMESTAMPTZ', '—', 'No', 'Yes', '—', 'Thời gian vào tập (chuẩn GMT+7)'],
        ['4', 'check_out_time', 'TIMESTAMPTZ', '—', 'No', 'No', '—', 'Thời gian ra về'],
        ['5', 'facility_id', 'UUID', '—', 'No', 'No', 'FK', 'Liên kết facilities.id']
    ]),
    ("2.11. Table: invoices (Bảng Hóa đơn Thanh toán)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính hóa đơn'],
        ['2', 'user_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết users.id (Khách mua)'],
        ['3', 'amount', 'DECIMAL', '12,2', 'No', 'Yes', '—', 'Tổng số tiền thanh toán'],
        ['4', 'payment_method', 'VARCHAR', '50', 'No', 'Yes', '—', 'sepay_vietqr, member_wallet, counter_cash, counter_pos'],
        ['5', 'status', 'VARCHAR', '30', 'No', 'Yes', '—', 'pending, completed, expired, refunded'],
        ['6', 'paid_at', 'TIMESTAMPTZ', '—', 'No', 'No', '—', 'Thời điểm nhận tiền thành công'],
        ['7', 'created_at', 'TIMESTAMPTZ', '—', 'No', 'Yes', '—', 'Thời điểm khởi tạo hóa đơn']
    ]),
    ("2.12. Table: invoice_items (Bảng Chi tiết Hóa đơn)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính dòng chi tiết'],
        ['2', 'invoice_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết invoices.id'],
        ['3', 'item_type', 'VARCHAR', '50', 'No', 'Yes', '—', 'package, class_ticket, product'],
        ['4', 'item_id', 'VARCHAR', '100', 'No', 'Yes', '—', 'Mã gói tập hoặc sản phẩm'],
        ['5', 'unit_price', 'DECIMAL', '12,2', 'No', 'Yes', '—', 'Đơn giá'],
        ['6', 'quantity', 'INT', '—', 'No', 'Yes', '—', 'Số lượng']
    ]),
    ("2.13. Table: coaches (Bảng Hồ sơ Năng lực Huấn luyện viên)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính HLV'],
        ['2', 'user_id', 'UUID', '—', 'Yes', 'Yes', 'FK', 'Liên kết users.id'],
        ['3', 'specialties', 'TEXT[]', '—', 'No', 'Yes', '—', 'Danh sách chuyên môn (Gym, Yoga, Boxing...)'],
        ['4', 'years_experience', 'INT', '—', 'No', 'Yes', '—', 'Số năm kinh nghiệm giảng dạy'],
        ['5', 'rating', 'DECIMAL', '2,1', 'No', 'No', '—', 'Điểm đánh giá trung bình từ học viên (1.0 - 5.0)']
    ]),
    ("2.14. Table: workout_plans (Bảng Kế hoạch Giáo án Tập luyện)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính giáo án'],
        ['2', 'coach_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết coaches.id (Người tạo)'],
        ['3', 'member_id', 'UUID', '—', 'No', 'No', 'FK', 'Liên kết users.id (Học viên được gán)'],
        ['4', 'title', 'VARCHAR', '150', 'No', 'Yes', '—', 'Tên giáo án'],
        ['5', 'goal', 'VARCHAR', '100', 'No', 'Yes', '—', 'Mục tiêu: hyper_trophy, fat_loss, endurance'],
        ['6', 'status', 'VARCHAR', '30', 'No', 'Yes', '—', 'draft, approved, active, completed'],
        ['7', 'ai_generated', 'BOOLEAN', '—', 'No', 'Yes', '—', 'true nếu do Gemini AI sinh']
    ]),
    ("2.15. Table: workout_plan_exercises (Bảng Chi tiết Bài tập trong Giáo án)", [
        ['1', 'id', 'UUID', '—', 'Yes', 'Yes', 'PK', 'Khóa chính bài tập'],
        ['2', 'plan_id', 'UUID', '—', 'No', 'Yes', 'FK', 'Liên kết workout_plans.id'],
        ['3', 'exercise_name', 'VARCHAR', '150', 'No', 'Yes', '—', 'Tên động tác (Squat, Bench Press...)'],
        ['4', 'phase', 'VARCHAR', '30', 'No', 'Yes', '—', 'warmup, main, cooldown'],
        ['5', 'sets', 'INT', '—', 'No', 'Yes', '—', 'Số hiệp tập'],
        ['6', 'reps', 'INT', '—', 'No', 'Yes', '—', 'Số lần lặp mỗi hiệp'],
        ['7', 'rest_seconds', 'INT', '—', 'No', 'Yes', '—', 'Thời gian nghỉ giữa các hiệp (giây)']
    ])
]

for title, rows in full_tables_spec:
    p_elem, _ = add_para_after(last_element, title, font_name="Calibri", font_size=12, bold=True, space_before=8, space_after=3)
    new_table = add_styled_table_after(doc, p_elem, header_td, rows, [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT])
    last_element = new_table._tbl

# SAVE TO TARGETS
target1 = r'c:\Users\ADMIN\Sport_Center\docs\Template2_SRD_Document_SWP391_Group04.docx'
doc.save(target1)
print("Saved complete document to:", target1)

target2 = r'c:\Users\ADMIN\Downloads\Template2_SRD_Document_SWP391_Group04_Final_NoVNPay.docx'
doc.save(target2)
print("Saved complete document copy to:", target2)

try:
    target_dl = r'c:\Users\ADMIN\Downloads\Template2_SRD_Document_SWP391_Group04_Complete.docx'
    doc.save(target_dl)
    print("Saved to:", target_dl)
except Exception as e:
    print("Note: Template2_SRD_Document_SWP391_Group04_Complete.docx is currently open in Word. Saved as Final_NoVNPay instead.")
