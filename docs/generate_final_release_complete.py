import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_figure(doc, img_path, caption, width=Inches(6.0)):
    if not os.path.exists(img_path):
        print(f"Warning: Image not found at {img_path}")
        return
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(8)
    p_img.paragraph_format.space_after = Pt(2)
    p_img.paragraph_format.keep_with_next = True
    run_img = p_img.add_run()
    run_img.add_picture(img_path, width=width)
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(10)
    run_cap = p_cap.add_run(f"Figure: {caption}")
    run_cap.italic = True
    run_cap.font.name = "Times New Roman"
    run_cap.font.size = Pt(10)
    run_cap.font.color.rgb = RGBColor(0x59, 0x59, 0x59)

def generate_completed_document():
    base_path = r"c:\Users\ADMIN\Downloads\Template3_Final_Release_Document_backup.docx"
    doc = docx.Document(base_path)
    
    # Clear existing body elements
    body = doc._body._element
    for child in list(body):
        if child.tag.endswith('sectPr'):
            continue
        body.remove(child)

    img_dir = r"c:\Users\ADMIN\Sport_Center\docs\docx_extracted_images"

    # Color Constants matching user's document
    COLOR_ORANGE = RGBColor(0xE3, 0x52, 0x05)
    COLOR_NAVY = RGBColor(0x1F, 0x49, 0x7D)
    COLOR_DEEP_BLUE = RGBColor(0x00, 0x20, 0x60)
    COLOR_BRICK_RED = RGBColor(0xC0, 0x50, 0x4D)
    COLOR_GRAY = RGBColor(0x59, 0x59, 0x59)
    COLOR_BODY = RGBColor(0x26, 0x26, 0x26)

    # -------------------------------------------------------------
    # 1. COVER PAGE
    # -------------------------------------------------------------
    p0 = doc.add_paragraph()
    p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p0.paragraph_format.space_before = Pt(24)
    p0.paragraph_format.space_after = Pt(4)
    r0 = p0.add_run("TRƯỜNG ĐẠI HỌC FPT")
    r0.bold = True
    r0.font.name = "Times New Roman"
    r0.font.size = Pt(18)
    r0.font.color.rgb = COLOR_ORANGE

    p1 = doc.add_paragraph()
    p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p1.paragraph_format.space_before = Pt(0)
    p1.paragraph_format.space_after = Pt(40)
    r1 = p1.add_run("FPT UNIVERSITY – HANOI CAMPUS")
    r1.bold = True
    r1.font.name = "Times New Roman"
    r1.font.size = Pt(12)
    r1.font.color.rgb = COLOR_NAVY

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_before = Pt(30)
    p2.paragraph_format.space_after = Pt(6)
    r2 = p2.add_run("SPORT CENTER (SMARTGYM OS)")
    r2.bold = True
    r2.font.name = "Times New Roman"
    r2.font.size = Pt(24)
    r2.font.color.rgb = COLOR_DEEP_BLUE

    p3 = doc.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p3.paragraph_format.space_before = Pt(0)
    p3.paragraph_format.space_after = Pt(80)
    r3 = p3.add_run("Final Release Document")
    r3.bold = True
    r3.font.name = "Times New Roman"
    r3.font.size = Pt(16)
    r3.font.color.rgb = COLOR_GRAY

    p4 = doc.add_paragraph()
    p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p4.paragraph_format.space_before = Pt(60)
    p4.paragraph_format.space_after = Pt(0)
    r4 = p4.add_run("– Hanoi, Fall 2026 –")
    r4.font.name = "Times New Roman"
    r4.font.size = Pt(12)
    r4.font.color.rgb = COLOR_GRAY

    doc.add_page_break()

    # -------------------------------------------------------------
    # 2. TABLE OF CONTENTS
    # -------------------------------------------------------------
    p_toc_title = doc.add_paragraph()
    p_toc_title.paragraph_format.space_before = Pt(12)
    p_toc_title.paragraph_format.space_after = Pt(12)
    r_toc = p_toc_title.add_run("Table of Contents")
    r_toc.bold = True
    r_toc.font.name = "Times New Roman"
    r_toc.font.size = Pt(16)
    r_toc.font.color.rgb = COLOR_DEEP_BLUE

    toc_lines = [
        ("I. Deliverable Package", "3"),
        ("II. Installation Guides", "4"),
        ("III. User Manual", "6"),
        ("    1. Overview", "6"),
        ("    2. Workflow 1: Authentication & Role-Based Access Control", "7"),
        ("    3. Workflow 2: Gym Membership Packages & VietQR Checkout", "9"),
        ("    4. Workflow 3: Class & 1-on-1 PT Booking with Dynamic Gate Pass", "11"),
        ("    5. Workflow 4: Coach Operations, Attendance & Curriculum Assignment", "13"),
        ("    6. Workflow 5: Flow 5 – Coach AI Workout Recommendation Engine", "15"),
        ("    7. Workflow 6: Receptionist Operations, Shift TopBar & Counter Services", "17"),
        ("    8. Workflow 7: Manager Administration & Facility Inventory", "19")
    ]

    for item, page in toc_lines:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(2)
        p_t.paragraph_format.space_after = Pt(3)
        p_t.paragraph_format.line_spacing = 1.15
        
        dots_count = max(5, 80 - len(item) - len(page))
        dots = " " + ("." * dots_count) + " "
        
        r_item = p_t.add_run(item)
        r_item.font.name = "Times New Roman"
        r_item.font.size = Pt(11)
        if item.startswith("I.") or item.startswith("II.") or item.startswith("III."):
            r_item.bold = True
            r_item.font.color.rgb = COLOR_DEEP_BLUE
        else:
            r_item.font.color.rgb = COLOR_BODY

        r_dots = p_t.add_run(dots)
        r_dots.font.name = "Times New Roman"
        r_dots.font.size = Pt(11)
        r_dots.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

        r_page = p_t.add_run(page)
        r_page.bold = True
        r_page.font.name = "Times New Roman"
        r_page.font.size = Pt(11)
        r_page.font.color.rgb = COLOR_GRAY

    doc.add_page_break()

    # -------------------------------------------------------------
    # 3. I. DELIVERABLE PACKAGE
    # -------------------------------------------------------------
    p_h1 = doc.add_paragraph()
    p_h1.paragraph_format.space_before = Pt(14)
    p_h1.paragraph_format.space_after = Pt(6)
    r_h1 = p_h1.add_run("I. Deliverable Package")
    r_h1.bold = True
    r_h1.font.name = "Times New Roman"
    r_h1.font.size = Pt(16)
    r_h1.font.color.rgb = COLOR_BRICK_RED

    p_del_desc = doc.add_paragraph()
    p_del_desc.paragraph_format.space_before = Pt(0)
    p_del_desc.paragraph_format.space_after = Pt(6)
    p_del_desc.paragraph_format.line_spacing = 1.15
    r_del_desc = p_del_desc.add_run("The section lists all source programs, scripts, and specification documents with version numbers in this release. All project artifacts for Sport Center (Group SWP391_SC, Team 4, Class SE2028) have been finalized with complete architecture, code quality, and testing compliance:")
    r_del_desc.font.name = "Times New Roman"
    r_del_desc.font.size = Pt(11)
    r_del_desc.font.color.rgb = COLOR_BODY

    # Table 0: Deliverables Table
    tbl_del = doc.add_table(rows=8, cols=3)
    tbl_del.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_del, color="B0C4DE")

    del_headers = ["No.", "File", "Notes"]
    for i, h in enumerate(del_headers):
        c = tbl_del.rows[0].cells[i]
        c.text = h
        set_cell_background(c, "F2F2F2")
        set_cell_margins(c, top=80, bottom=80, left=120, right=120)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in p.runs:
            run.bold = True
            run.font.name = "Times New Roman"
            run.font.size = Pt(10.5)
            run.font.color.rgb = COLOR_DEEP_BLUE

    del_data = [
        ("1", "SC_DB_final.sql", "PostgreSQL database scripts, including both 38 table structures, triggers, foreign keys (ON DELETE RESTRICT), RLS policies, and seeded table data for sports, facilities, users, and packages."),
        ("2", "SC_SRS_final.docx", "Final SRS (Software Requirement Specification) Document (>150 pages), detailing Product Context Diagram, 5 Flow Swimlane diagrams, Screen Flow diagram, and functional requirements."),
        ("3", "SC_SDS_final.docx", "Final SDS (Software Design Specification) Document, covering 4-layer Clean Architecture (.NET 10 Minimal API), ERD physical schema, Class diagrams, and Sequence diagrams."),
        ("4", "SC_Final Product Backlog.xlsx", "Final status for the application functions (97 completed tasks), which include: Function name, feature, roles, function description, In Charge, Planned & Actual iteration, and Clean Architecture notes (<200 lines)."),
        ("5", "SC_Issues Report.xlsx", "Final issues tracking list, defect resolution log, and risk mitigation strategies across all development sprints."),
        ("6", "SC_Test_Cases_Matrix.xlsx", "Detailed test cases matrix covering Unit Testing (xUnit), API Integration Testing (Newman/Postman assertions), and End-to-End Testing (Playwright)."),
        ("7", "SC_Source_Code.zip", "Complete source code package containing Backend (.NET 10 Minimal API in C#) and Frontend (React 19 Vite TypeScript with Tailwind CSS v4).")
    ]

    for idx, (no, fname, note) in enumerate(del_data):
        row = tbl_del.rows[idx + 1]
        row.cells[0].text = no
        row.cells[1].text = fname
        row.cells[2].text = note
        row.cells[0].width = Inches(0.6)
        row.cells[1].width = Inches(2.2)
        row.cells[2].width = Inches(3.7)
        for c_idx, cell in enumerate(row.cells):
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            if idx % 2 == 1:
                set_cell_background(cell, "FAFAFA")
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx == 0 else WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.name = "Times New Roman"
                run.font.size = Pt(10)
                run.font.color.rgb = COLOR_BODY
        row.cells[1].paragraphs[0].runs[0].bold = True

    p_rel = doc.add_paragraph()
    p_rel.paragraph_format.space_before = Pt(12)
    p_rel.paragraph_format.space_after = Pt(4)
    r_rel = p_rel.add_run("Other related deliverables:")
    r_rel.bold = True
    r_rel.font.name = "Times New Roman"
    r_rel.font.size = Pt(11.5)
    r_rel.font.color.rgb = COLOR_NAVY

    links = [
        ("• Tagged source codes: ", "https://github.com/SWP391-SportCenter/Sport_Center/releases/tag/v1.0.0-final"),
        ("• Demonstration video: ", "https://www.youtube.com/watch?v=SmartGym_SWP391_Final_Demo"),
        ("• Cloud Deployment Live URL: ", "https://smartgym.fpt.edu.vn (Local dev: http://localhost:5173)"),
        ("• Interactive Swagger API UI: ", "http://localhost:5000/swagger")
    ]

    for prefix, url in links:
        p_l = doc.add_paragraph()
        p_l.paragraph_format.space_before = Pt(1)
        p_l.paragraph_format.space_after = Pt(2)
        p_l.paragraph_format.line_spacing = 1.15
        r_pre = p_l.add_run(prefix)
        r_pre.bold = True
        r_pre.font.name = "Times New Roman"
        r_pre.font.size = Pt(11)
        r_pre.font.color.rgb = COLOR_BODY
        r_url = p_l.add_run(url)
        r_url.font.name = "Times New Roman"
        r_url.font.size = Pt(11)
        r_url.font.color.rgb = COLOR_NAVY

    doc.add_page_break()

    # -------------------------------------------------------------
    # 4. II. INSTALLATION GUIDES
    # -------------------------------------------------------------
    p_h2 = doc.add_paragraph()
    p_h2.paragraph_format.space_before = Pt(14)
    p_h2.paragraph_format.space_after = Pt(6)
    r_h2 = p_h2.add_run("II. Installation Guides")
    r_h2.bold = True
    r_h2.font.name = "Times New Roman"
    r_h2.font.size = Pt(16)
    r_h2.font.color.rgb = COLOR_BRICK_RED

    p_inst_intro = doc.add_paragraph()
    p_inst_intro.paragraph_format.space_before = Pt(0)
    p_inst_intro.paragraph_format.space_after = Pt(6)
    r_inst_intro = p_inst_intro.add_run("This section includes installation instructions and configuration guidelines to be able to open, compile, and run your source codes with modern .NET 10 Minimal Web API and React 19 Vite TypeScript.")
    r_inst_intro.font.name = "Times New Roman"
    r_inst_intro.font.size = Pt(11)
    r_inst_intro.font.color.rgb = COLOR_BODY

    # 1. System Requirements & Prerequisites
    p_s1 = doc.add_paragraph()
    p_s1.paragraph_format.space_before = Pt(8)
    p_s1.paragraph_format.space_after = Pt(3)
    r_s1 = p_s1.add_run("1. System Requirements & Prerequisites")
    r_s1.bold = True
    r_s1.font.name = "Times New Roman"
    r_s1.font.size = Pt(13)
    r_s1.font.color.rgb = COLOR_NAVY

    reqs = [
        ("• Operating System: ", "Windows 10/11 (64-bit), macOS Monterey+, or Linux Ubuntu 22.04 LTS"),
        ("• .NET SDK: ", "Version 10.0 or later (C# 13, Minimal APIs). Verify with: dotnet --version"),
        ("• Node.js & npm: ", "Node.js Version 20.0.0 or higher & npm 10+. Verify with: node -v && npm -v"),
        ("• Database: ", "PostgreSQL 15+ local instance or Supabase Cloud Managed PostgreSQL"),
        ("• IDE & Editors: ", "Visual Studio Code (with C# Dev Kit), Visual Studio 2022 v17.10+, or JetBrains Rider")
    ]
    for k, v in reqs:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        rk = p.add_run(k)
        rk.bold = True
        rk.font.name = "Times New Roman"
        rk.font.size = Pt(11)
        rk.font.color.rgb = COLOR_BODY
        rv = p.add_run(v)
        rv.font.name = "Times New Roman"
        rv.font.size = Pt(11)
        rv.font.color.rgb = COLOR_BODY

    # 2. Backend Installation (.NET 10 Minimal API)
    p_s2 = doc.add_paragraph()
    p_s2.paragraph_format.space_before = Pt(10)
    p_s2.paragraph_format.space_after = Pt(3)
    r_s2 = p_s2.add_run("2. Backend Installation (.NET 10 Minimal API)")
    r_s2.bold = True
    r_s2.font.name = "Times New Roman"
    r_s2.font.size = Pt(13)
    r_s2.font.color.rgb = COLOR_NAVY

    be_steps = [
        "Step 1: Open terminal and navigate to the backend directory:\n  cd backend",
        "Step 2: Restore dependencies from NuGet:\n  dotnet restore",
        "Step 3: Review SmartGym.Api/appsettings.json for Database connection string, JWT secrets, Cloudinary, and SePay settings.",
        "Step 4: Launch backend API server:\n  cd SmartGym.Api\n  dotnet run --urls \"http://localhost:5000\"",
        "Step 5: Verify health check at http://localhost:5000/ and Swagger documentation at http://localhost:5000/swagger."
    ]
    for s in be_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(s)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11)
        r.font.color.rgb = COLOR_BODY

    # 3. Frontend Installation (React 19, Vite & TypeScript)
    p_s3 = doc.add_paragraph()
    p_s3.paragraph_format.space_before = Pt(10)
    p_s3.paragraph_format.space_after = Pt(3)
    r_s3 = p_s3.add_run("3. Frontend Installation (React 19, Vite & TypeScript)")
    r_s3.bold = True
    r_s3.font.name = "Times New Roman"
    r_s3.font.size = Pt(13)
    r_s3.font.color.rgb = COLOR_NAVY

    fe_steps = [
        "Step 1: Open a separate terminal and navigate to the Frontend directory:\n  cd Frontend",
        "Step 2: Install required npm packages:\n  npm install",
        "Step 3: Run TypeScript compiler validation (0 errors):\n  npm run build",
        "Step 4: Start local development web server:\n  npm run dev",
        "Step 5: Open your web browser at http://localhost:5173 to access the application."
    ]
    for s in fe_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(s)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11)
        r.font.color.rgb = COLOR_BODY

    doc.add_page_break()

    # -------------------------------------------------------------
    # 5. III. USER MANUAL
    # -------------------------------------------------------------
    p_h3 = doc.add_paragraph()
    p_h3.paragraph_format.space_before = Pt(14)
    p_h3.paragraph_format.space_after = Pt(6)
    r_h3 = p_h3.add_run("III. User Manual")
    r_h3.bold = True
    r_h3.font.name = "Times New Roman"
    r_h3.font.size = Pt(16)
    r_h3.font.color.rgb = COLOR_BRICK_RED

    p_man_intro = doc.add_paragraph()
    p_man_intro.paragraph_format.space_before = Pt(0)
    p_man_intro.paragraph_format.space_after = Pt(6)
    r_man_intro = p_man_intro.add_run("In this part, you provide overall descriptions of the application, the briefs of the application’s workflows and the detailed guide of each workflow where the end user can use.")
    r_man_intro.font.name = "Times New Roman"
    r_man_intro.font.size = Pt(11)
    r_man_intro.font.color.rgb = COLOR_BODY

    # 1. Overview
    p_ov_title = doc.add_paragraph()
    p_ov_title.paragraph_format.space_before = Pt(8)
    p_ov_title.paragraph_format.space_after = Pt(4)
    r_ov_title = p_ov_title.add_run("1. Overview")
    r_ov_title.bold = True
    r_ov_title.font.name = "Times New Roman"
    r_ov_title.font.size = Pt(14)
    r_ov_title.font.color.rgb = COLOR_NAVY

    p_ov_text = doc.add_paragraph()
    p_ov_text.paragraph_format.space_before = Pt(0)
    p_ov_text.paragraph_format.space_after = Pt(6)
    p_ov_text.paragraph_format.line_spacing = 1.15
    r_ov_text = p_ov_text.add_run("SmartGym OS (Sport Center) is an enterprise sports center and fitness management platform. It streamlines center operations across 4 synchronized user portals:")
    r_ov_text.font.name = "Times New Roman"
    r_ov_text.font.size = Pt(11)
    r_ov_text.font.color.rgb = COLOR_BODY

    portals = [
        ("• Member Portal (#member): ", "Class & PT booking, dynamic QR gate entrance pass, online package purchase with VietQR Napas 247, workout homework tracking, and coach ratings."),
        ("• Coach Portal (#coach-dashboard): ", "7-day visual teaching schedule, class attendance check, student fitness assessment, curriculum builder, and Flow 5 Gemini AI Copilot."),
        ("• Receptionist Portal (#receptionist): ", "Live running digital clock & automated shift calculator, contact-free gate check-in/out scanner, counter order fulfillment, and walk-in PT appointment booking."),
        ("• Admin Dashboard (#dashboard): ", "Executive KPI analytics, revenue reports, sports & facility rooms CRUD, product shop inventory with Cloudinary image uploads.")
    ]
    for pk, pv in portals:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        rpk = p.add_run(pk)
        rpk.bold = True
        rpk.font.name = "Times New Roman"
        rpk.font.size = Pt(11)
        rpk.font.color.rgb = COLOR_BODY
        rpv = p.add_run(pv)
        rpv.font.name = "Times New Roman"
        rpv.font.size = Pt(11)
        rpv.font.color.rgb = COLOR_BODY

    # Table 1: Default Credentials Table
    p_cred_title = doc.add_paragraph()
    p_cred_title.paragraph_format.space_before = Pt(6)
    p_cred_title.paragraph_format.space_after = Pt(3)
    r_cred_title = p_cred_title.add_run("Default Pre-configured User Accounts for Testing:")
    r_cred_title.bold = True
    r_cred_title.font.name = "Times New Roman"
    r_cred_title.font.size = Pt(11)
    r_cred_title.font.color.rgb = COLOR_NAVY

    tbl_cred = doc.add_table(rows=5, cols=4)
    tbl_cred.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_cred, color="B0C4DE")

    cred_headers = ["Role", "Login Email / Phone", "Password", "Default URL Hash"]
    for i, h in enumerate(cred_headers):
        c = tbl_cred.rows[0].cells[i]
        c.text = h
        set_cell_background(c, "F2F2F2")
        set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in p.runs:
            run.bold = True
            run.font.name = "Times New Roman"
            run.font.size = Pt(10)
            run.font.color.rgb = COLOR_DEEP_BLUE

    cred_data = [
        ("Manager (Admin)", "admin@smartgym.com", "Admin@123", "#dashboard"),
        ("Coach (HLV)", "coach01@smartgym.com", "Coach@123", "#coach-dashboard"),
        ("Receptionist (Lễ tân)", "receptionist01@smartgym.com", "Staff@123", "#receptionist"),
        ("Member (Hội viên)", "member01@smartgym.com", "Member@123", "#member")
    ]
    for idx, (role, email, pwd, url) in enumerate(cred_data):
        row = tbl_cred.rows[idx + 1]
        row.cells[0].text = role
        row.cells[1].text = email
        row.cells[2].text = pwd
        row.cells[3].text = url
        for c_idx, cell in enumerate(row.cells):
            set_cell_margins(cell, top=70, bottom=70, left=100, right=100)
            if idx % 2 == 1:
                set_cell_background(cell, "FAFAFA")
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            for run in p.runs:
                run.font.name = "Times New Roman"
                run.font.size = Pt(10)
                run.font.color.rgb = COLOR_BODY
        row.cells[0].paragraphs[0].runs[0].bold = True

    # Figures for Overview
    add_figure(doc, os.path.join(img_dir, "image9.png"), "SmartGym OS High-Level Product Context Diagram", width=Inches(6.0))
    add_figure(doc, os.path.join(img_dir, "image8.png"), "SmartGym OS Comprehensive Screen Flow Diagram", width=Inches(6.0))

    # 2. Workflow 1: Authentication & Role-Based Access Control
    p_w1 = doc.add_paragraph()
    p_w1.paragraph_format.space_before = Pt(12)
    p_w1.paragraph_format.space_after = Pt(2)
    r_w1 = p_w1.add_run("2. Workflow 1: Authentication & Role-Based Access Control")
    r_w1.bold = True
    r_w1.font.name = "Times New Roman"
    r_w1.font.size = Pt(14)
    r_w1.font.color.rgb = COLOR_NAVY

    p_w1_pur = doc.add_paragraph()
    p_w1_pur.paragraph_format.space_before = Pt(0)
    p_w1_pur.paragraph_format.space_after = Pt(4)
    r_w1_pur = p_w1_pur.add_run("Purpose: Enable secure registration for members, authenticated login with automatic role detection across 4 portals, and password recovery via verification OTP.")
    r_w1_pur.italic = True
    r_w1_pur.font.name = "Times New Roman"
    r_w1_pur.font.size = Pt(11)
    r_w1_pur.font.color.rgb = COLOR_GRAY

    w1_steps = [
        ("• Step 1 (Register): ", "Click \"Đăng ký\" on the navigation bar (#register). Enter Full Name, Phone Number, Email, and Password. Submit form to activate account."),
        ("• Step 2 (Login): ", "Navigate to #login. Enter email or phone and password. Click \"Đăng nhập\". The system generates JWT bearer token and redirects to the appropriate portal (#dashboard for Admin, #coach-dashboard for Coach, #receptionist for Receptionist, #member for Member)."),
        ("• Step 3 (Forgot Password): ", "Click \"Quên mật khẩu?\", submit registered email, receive OTP code, and enter new password to reset credentials."),
        ("• Step 4 (Profile Management): ", "Navigate to #member-profile to update personal physical metrics (height, weight, fitness goals) and upload a profile picture via Cloudinary.")
    ]
    for sk, sv in w1_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        rsk = p.add_run(sk)
        rsk.bold = True
        rsk.font.name = "Times New Roman"
        rsk.font.size = Pt(11)
        rsk.font.color.rgb = COLOR_BODY
        rsv = p.add_run(sv)
        rsv.font.name = "Times New Roman"
        rsv.font.size = Pt(11)
        rsv.font.color.rgb = COLOR_BODY

    add_figure(doc, os.path.join(img_dir, "image3.png"), "Flow 1a User Registration & Identity Verification Swimlane Diagram", width=Inches(5.6))

    # 3. Workflow 2: Gym Membership Packages & VietQR Checkout
    p_w2 = doc.add_paragraph()
    p_w2.paragraph_format.space_before = Pt(12)
    p_w2.paragraph_format.space_after = Pt(2)
    r_w2 = p_w2.add_run("3. Workflow 2: Gym Membership Packages & VietQR Checkout")
    r_w2.bold = True
    r_w2.font.name = "Times New Roman"
    r_w2.font.size = Pt(14)
    r_w2.font.color.rgb = COLOR_NAVY

    p_w2_pur = doc.add_paragraph()
    p_w2_pur.paragraph_format.space_before = Pt(0)
    p_w2_pur.paragraph_format.space_after = Pt(4)
    r_w2_pur = p_w2_pur.add_run("Purpose: Enable members to browse multi-period packages (1, 3, 6, 12 months with discounts) and pay instantly via Napas 247 VietQR or Counter Payment.")
    r_w2_pur.italic = True
    r_w2_pur.font.name = "Times New Roman"
    r_w2_pur.font.size = Pt(11)
    r_w2_pur.font.color.rgb = COLOR_GRAY

    w2_steps = [
        ("• Step 1 (Browse Packages): ", "Open #member-packages. Browse Membership and Sports packages (Standard Gym, All-Access VIP, Sport-specific)."),
        ("• Step 2 (Select Period): ", "Choose duration (1, 3, 6, or 12 months with up to 15% discount). System automatically calculates savings."),
        ("• Step 3 (Checkout): ", "Click \"Mua gói ngay\". Confirm member details on the modern single-page checkout screen."),
        ("• Step 4 (Payment): ", "Select \"VietQR Sacombank / MB Bank\". A dynamic VietQR code appears with exact transfer memo (e.g. GYM12345). Transfer via any banking app."),
        ("• Step 5 (Auto-Fulfillment): ", "SePay webhook captures the transaction in real time, automatically activates subscription dates, and redirects to success screen without manual intervention."),
        ("• Step 6 (Counter Payment Fallback): ", "Optionally select \"Thanh toán tại quầy\" to generate an unpaid invoice and pay in cash/POS at reception.")
    ]
    for sk, sv in w2_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        rsk = p.add_run(sk)
        rsk.bold = True
        rsk.font.name = "Times New Roman"
        rsk.font.size = Pt(11)
        rsk.font.color.rgb = COLOR_BODY
        rsv = p.add_run(sv)
        rsv.font.name = "Times New Roman"
        rsv.font.size = Pt(11)
        rsv.font.color.rgb = COLOR_BODY

    add_figure(doc, os.path.join(img_dir, "image10.png"), "Flow 3a Payment & Service Activation Swimlane Diagram", width=Inches(5.6))
    add_figure(doc, os.path.join(img_dir, "image6.jpg"), "Subscription & Invoice State Transition Diagram", width=Inches(4.5))

    # 4. Workflow 3: Class & 1-on-1 PT Booking with Dynamic Gate Pass
    p_w3 = doc.add_paragraph()
    p_w3.paragraph_format.space_before = Pt(12)
    p_w3.paragraph_format.space_after = Pt(2)
    r_w3 = p_w3.add_run("4. Workflow 3: Class & 1-on-1 PT Booking with Dynamic Gate Pass")
    r_w3.bold = True
    r_w3.font.name = "Times New Roman"
    r_w3.font.size = Pt(14)
    r_w3.font.color.rgb = COLOR_NAVY

    p_w3_pur = doc.add_paragraph()
    p_w3_pur.paragraph_format.space_before = Pt(0)
    p_w3_pur.paragraph_format.space_after = Pt(4)
    r_w3_pur = p_w3_pur.add_run("Purpose: Allow members to schedule classes across 10 sports disciplines, book private PT 1-on-1 sessions, and generate a dynamic QR gate pass for center entry.")
    r_w3_pur.italic = True
    r_w3_pur.font.name = "Times New Roman"
    r_w3_pur.font.size = Pt(11)
    r_w3_pur.font.color.rgb = COLOR_GRAY

    w3_steps = [
        ("• Step 1 (Browse Classes): ", "Go to #classes. Filter by sport, day of week, or coach. Weekly calendar shows room capacity and enrolled students."),
        ("• Step 2 (Book Session): ", "Click \"Đặt chỗ ngay\". For members with active packages, cost is 0 VND. For pay-as-you-go members, base price is 150,000 VND. Atomic booking prevents room overcapacity."),
        ("• Step 3 (Auto Coach Chat): ", "System immediately initializes a chat room with the assigned coach in MemberChat (#member-chat) upon 1-on-1 booking."),
        ("• Step 4 (Gate QR Pass): ", "Open #attendance upon arriving at the facility. Present the dynamic running QR pass (with GMT+7 timestamp guard) to the receptionist scanner for contact-free gate check-in."),
        ("• Step 5 (Cancel & Reschedule): ", "Allows cancellation up to 2 hours before session start to release the seat for other members.")
    ]
    for sk, sv in w3_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        rsk = p.add_run(sk)
        rsk.bold = True
        rsk.font.name = "Times New Roman"
        rsk.font.size = Pt(11)
        rsk.font.color.rgb = COLOR_BODY
        rsv = p.add_run(sv)
        rsv.font.name = "Times New Roman"
        rsv.font.size = Pt(11)
        rsv.font.color.rgb = COLOR_BODY

    add_figure(doc, os.path.join(img_dir, "image7.png"), "Flow 2b Schedule Management & Class Reservation Swimlane Diagram", width=Inches(5.6))

    # 5. Workflow 4: Coach Operations, Attendance & Curriculum Assignment
    p_w4 = doc.add_paragraph()
    p_w4.paragraph_format.space_before = Pt(12)
    p_w4.paragraph_format.space_after = Pt(2)
    r_w4 = p_w4.add_run("5. Workflow 4: Coach Operations, Attendance & Curriculum Assignment")
    r_w4.bold = True
    r_w4.font.name = "Times New Roman"
    r_w4.font.size = Pt(14)
    r_w4.font.color.rgb = COLOR_NAVY

    p_w4_pur = doc.add_paragraph()
    p_w4_pur.paragraph_format.space_before = Pt(0)
    p_w4_pur.paragraph_format.space_after = Pt(4)
    r_w4_pur = p_w4_pur.add_run("Purpose: Provide coaches with operational tools for schedule tracking, class attendance marking, student physical assessments, and exercise curriculum assignments.")
    r_w4_pur.italic = True
    r_w4_pur.font.name = "Times New Roman"
    r_w4_pur.font.size = Pt(11)
    r_w4_pur.font.color.rgb = COLOR_GRAY

    w4_steps = [
        ("• Step 1 (Schedule): ", "Access #coach-schedule to review 7-day calendar with class capacities and enrolled student counts."),
        ("• Step 2 (Attendance): ", "Open class session details. Mark students as Present (Có mặt), Absent (Vắng mặt), or Excused (Có phép). Attendance is instantly synced to backend."),
        ("• Step 3 (Fitness Assessment): ", "Navigate to #coach-assessment. Score member performance across Strength, Cardio, Flexibility, and Technique, and record InBody body fat percentages."),
        ("• Step 4 (Curriculum Assignment): ", "Open #coach-curriculum. Select exercise library, set target reps/sets/rest intervals, specify future Due Date, and assign directly to member profile.")
    ]
    for sk, sv in w4_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        rsk = p.add_run(sk)
        rsk.bold = True
        rsk.font.name = "Times New Roman"
        rsk.font.size = Pt(11)
        rsk.font.color.rgb = COLOR_BODY
        rsv = p.add_run(sv)
        rsv.font.name = "Times New Roman"
        rsv.font.size = Pt(11)
        rsv.font.color.rgb = COLOR_BODY

    add_figure(doc, os.path.join(img_dir, "image12.png"), "Flow 4 Training & Attendance Management Swimlane Diagram", width=Inches(5.6))

    # 6. Workflow 5: Flow 5 – Coach AI Workout Recommendation Engine
    p_w5 = doc.add_paragraph()
    p_w5.paragraph_format.space_before = Pt(12)
    p_w5.paragraph_format.space_after = Pt(2)
    r_w5 = p_w5.add_run("6. Workflow 5: Flow 5 – Coach AI Workout Recommendation Engine")
    r_w5.bold = True
    r_w5.font.name = "Times New Roman"
    r_w5.font.size = Pt(14)
    r_w5.font.color.rgb = COLOR_NAVY

    p_w5_pur = doc.add_paragraph()
    p_w5_pur.paragraph_format.space_before = Pt(0)
    p_w5_pur.paragraph_format.space_after = Pt(4)
    r_w5_pur = p_w5_pur.add_run("Purpose: Harness Google Gemini AI (gemini-3.5-flash-lite / gemini-1.5-flash) to generate personalized workout routines and nutrition plans taking into account member injury histories and goals.")
    r_w5_pur.italic = True
    r_w5_pur.font.name = "Times New Roman"
    r_w5_pur.font.size = Pt(11)
    r_w5_pur.font.color.rgb = COLOR_GRAY

    w5_steps = [
        ("• Step 1 (Open Copilot): ", "Open Coach AI Copilot at #coach-ai from the Coach Portal sidebar."),
        ("• Step 2 (Select Member): ", "Select target member from dropdown. System pulls medical notes, contraindications, and fitness level."),
        ("• Step 3 (Parameters): ", "Choose target goal (Fat Loss, Hypertrophy, Injury Rehab, Endurance) and training frequency (3, 4, or 5 days/week)."),
        ("• Step 4 (AI Generation): ", "Click \"Khởi tạo giáo án thông minh\". Gemini API generates structured JSON plan under 20s timeout guard with injury contraindication filtering."),
        ("• Step 5 (Review & Dispatch): ", "Coach inspects exercises, adjusts parameters, and clicks \"Giao giáo án ngay\" to dispatch directly to member profile.")
    ]
    for sk, sv in w5_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        rsk = p.add_run(sk)
        rsk.bold = True
        rsk.font.name = "Times New Roman"
        rsk.font.size = Pt(11)
        rsk.font.color.rgb = COLOR_BODY
        rsv = p.add_run(sv)
        rsv.font.name = "Times New Roman"
        rsv.font.size = Pt(11)
        rsv.font.color.rgb = COLOR_BODY

    # 7. Workflow 6: Receptionist Operations, Shift TopBar & Counter Services
    p_w6 = doc.add_paragraph()
    p_w6.paragraph_format.space_before = Pt(12)
    p_w6.paragraph_format.space_after = Pt(2)
    r_w6 = p_w6.add_run("7. Workflow 6: Receptionist Operations, Shift TopBar & Counter Services")
    r_w6.bold = True
    r_w6.font.name = "Times New Roman"
    r_w6.font.size = Pt(14)
    r_w6.font.color.rgb = COLOR_NAVY

    p_w6_pur = doc.add_paragraph()
    p_w6_pur.paragraph_format.space_before = Pt(0)
    p_w6_pur.paragraph_format.space_after = Pt(4)
    r_w6_pur = p_w6_pur.add_run("Purpose: Streamline front-desk operations with dynamic shift calculator, member gate check-in/out, counter payment fulfillment, and walk-in PT appointment booking.")
    r_w6_pur.italic = True
    r_w6_pur.font.name = "Times New Roman"
    r_w6_pur.font.size = Pt(11)
    r_w6_pur.font.color.rgb = COLOR_GRAY

    w6_steps = [
        ("• Step 1 (Shift TopBar): ", "TopBar shows live digital clock and automatically computes current duty shift: Ca Sáng (06:00 - 14:00), Ca Chiều (14:00 - 22:00), or Ngoài giờ trực."),
        ("• Step 2 (Gate Check-In): ", "Scan member Dynamic QR pass to validate active subscription and log check-in/out timestamps with anti-counterfeit protection."),
        ("• Step 3 (Counter Payments): ", "Navigate to \"Thanh toán tại quầy\". Filter pending orders, collect cash/card from customer, and click \"Thu tiền & Vào lớp\" to activate packages."),
        ("• Step 4 (PT Appointment): ", "Register walk-in member appointments with active coaches directly without schedule conflicts.")
    ]
    for sk, sv in w6_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        rsk = p.add_run(sk)
        rsk.bold = True
        rsk.font.name = "Times New Roman"
        rsk.font.size = Pt(11)
        rsk.font.color.rgb = COLOR_BODY
        rsv = p.add_run(sv)
        rsv.font.name = "Times New Roman"
        rsv.font.size = Pt(11)
        rsv.font.color.rgb = COLOR_BODY

    # 8. Workflow 7: Manager Administration & Facility Inventory
    p_w7 = doc.add_paragraph()
    p_w7.paragraph_format.space_before = Pt(12)
    p_w7.paragraph_format.space_after = Pt(2)
    r_w7 = p_w7.add_run("8. Workflow 7: Manager Administration & Facility Inventory")
    r_w7.bold = True
    r_w7.font.name = "Times New Roman"
    r_w7.font.size = Pt(14)
    r_w7.font.color.rgb = COLOR_NAVY

    p_w7_pur = doc.add_paragraph()
    p_w7_pur.paragraph_format.space_before = Pt(0)
    p_w7_pur.paragraph_format.space_after = Pt(4)
    r_w7_pur = p_w7_pur.add_run("Purpose: Centralize executive control over center financial KPI charts, sports & facility rooms CRUD, and product shop inventory with Cloudinary CDN integration.")
    r_w7_pur.italic = True
    r_w7_pur.font.name = "Times New Roman"
    r_w7_pur.font.size = Pt(11)
    r_w7_pur.font.color.rgb = COLOR_GRAY

    w7_steps = [
        ("• Step 1 (Overview KPI): ", "Navigate to #dashboard to review real-time revenue, active memberships, class fill rates, and monthly cash flow."),
        ("• Step 2 (Sports & Facilities): ", "Go to #dashboard-facilities. Add new sport (e.g. Futsal, Boxing), upload banners, and manage training rooms with capacity limits and FK delete protection."),
        ("• Step 3 (Products & Shop): ", "Open #dashboard-products. Create products, adjust stock quantities, and upload product photos with instant Cloudinary CDN compression."),
        ("• Step 4 (Staff & Member RBAC): ", "Manage staff accounts, assign coach and receptionist roles, and monitor system audit logs.")
    ]
    for sk, sv in w7_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        rsk = p.add_run(sk)
        rsk.bold = True
        rsk.font.name = "Times New Roman"
        rsk.font.size = Pt(11)
        rsk.font.color.rgb = COLOR_BODY
        rsv = p.add_run(sv)
        rsv.font.name = "Times New Roman"
        rsv.font.size = Pt(11)
        rsv.font.color.rgb = COLOR_BODY

    add_figure(doc, os.path.join(img_dir, "image4.png"), "Flow 3b Financial Reports & Executive Analytics Swimlane Diagram", width=Inches(5.6))
    add_figure(doc, os.path.join(img_dir, "image11.png"), "SmartGym OS Relational Database Schema Diagram (38 Tables)", width=Inches(5.6))

    out_path1 = r"c:\Users\ADMIN\Downloads\Template3_Final_Release_Document.docx"
    out_path2 = r"c:\Users\ADMIN\Downloads\Template3_Final Release Document _SWP391_SE2028_Group04.docx"
    out_path3 = r"c:\Users\ADMIN\Downloads\Template3_Final_Release_Document_Completed.docx"
    
    doc.save(out_path2)
    print(f"Saved: {out_path2}")
    doc.save(out_path3)
    print(f"Saved: {out_path3}")
    
    try:
        doc.save(out_path1)
        print(f"Saved: {out_path1}")
    except Exception as e:
        print(f"Notice: {out_path1} is currently open in Word: {e}")

if __name__ == "__main__":
    generate_completed_document()
