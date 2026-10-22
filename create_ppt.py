import os
import subprocess
import sys

try:
    import pptx
except ImportError:
    print("Installing python-pptx...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-pptx"])
    import pptx

from pptx import Presentation
from pptx.util import Pt, Inches
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

prs = Presentation()

BG_COLOR = RGBColor(235, 245, 250)
SIDEBAR_COLOR = RGBColor(54, 85, 105)
ARROW_COLOR = RGBColor(51, 51, 51)
TEXT_COLOR = RGBColor(30, 30, 30)
FOOTER_COLOR = RGBColor(100, 100, 100)

def add_template(slide, slide_number=None):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_COLOR

    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.25), Inches(7.5))
    shape.fill.solid()
    shape.fill.fore_color.rgb = SIDEBAR_COLOR
    shape.line.fill.background()

    chevron = slide.shapes.add_shape(MSO_SHAPE.CHEVRON, Inches(0), Inches(1.3), Inches(1.5), Inches(0.7))
    chevron.fill.solid()
    chevron.fill.fore_color.rgb = ARROW_COLOR
    chevron.line.fill.background()
    
    arc1 = slide.shapes.add_shape(MSO_SHAPE.ARC, Inches(-1.5), Inches(1), Inches(3), Inches(6))
    arc1.line.color.rgb = SIDEBAR_COLOR
    arc1.line.width = Pt(1)
    
    arc2 = slide.shapes.add_shape(MSO_SHAPE.ARC, Inches(-1.0), Inches(2), Inches(3), Inches(5))
    arc2.line.color.rgb = SIDEBAR_COLOR
    arc2.line.width = Pt(1.5)

    if slide_number is not None:
        footer = slide.shapes.add_textbox(Inches(0.5), Inches(7.0), Inches(9), Inches(0.5))
        footer.text = f"Review 1 & 2  |  MERN Stack Project{' ' * 60}{str(slide_number).zfill(2)}"
        for run in footer.text_frame.paragraphs[0].runs:
            run.font.name = 'Times New Roman'
            run.font.size = Pt(12)
            run.font.color.rgb = FOOTER_COLOR

def set_font(font, size, bold=False):
    font.name = 'Times New Roman'
    font.size = Pt(size)
    font.bold = bold
    font.color.rgb = TEXT_COLOR

def format_text_frame(text_frame, size, bold=False):
    for p in text_frame.paragraphs:
        set_font(p.font, size, bold)
        for run in p.runs:
            set_font(run.font, size, bold)

# --- Slide 1: Title Slide ---
slide1 = prs.slides.add_slide(prs.slide_layouts[6])
add_template(slide1)

logo = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.5), Inches(0.5), Inches(1.5), Inches(1.5))
logo.fill.solid()
logo.fill.fore_color.rgb = RGBColor(220, 220, 220)
logo.line.color.rgb = RGBColor(150, 150, 150)
logo.text = "[College Logo]"
logo.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
set_font(logo.text_frame.paragraphs[0].font, 16)

tb = slide1.shapes.add_textbox(Inches(3.2), Inches(0.9), Inches(6), Inches(0.5))
tb.text = "Easwari Engineering College"
set_font(tb.text_frame.paragraphs[0].font, 28, bold=True)

tb = slide1.shapes.add_textbox(Inches(1.5), Inches(2.8), Inches(7.5), Inches(1))
tb.text_frame.word_wrap = True
tb.text = "CAMPUS FACILITY RESERVATION SYSTEM"
tb.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
set_font(tb.text_frame.paragraphs[0].font, 28, bold=True)

tb = slide1.shapes.add_textbox(Inches(1.5), Inches(4.8), Inches(4), Inches(1.5))
p1 = tb.text_frame.paragraphs[0]
p1.text = "Under the Guidance of"
set_font(p1.font, 20, bold=True)
p2 = tb.text_frame.add_paragraph()
p2.text = "Ms. Divyanjali"
set_font(p2.font, 18)
p3 = tb.text_frame.add_paragraph()
p3.text = "Technical Trainer, AIML"
set_font(p3.font, 18)

tb = slide1.shapes.add_textbox(Inches(6), Inches(4.8), Inches(4), Inches(1.5))
p1 = tb.text_frame.paragraphs[0]
p1.text = "Presented By"
set_font(p1.font, 20, bold=True)
p2 = tb.text_frame.add_paragraph()
p2.text = "Girupa Shankar V (310624148026)"
set_font(p2.font, 18)


def create_slide(title_text, bullets, slide_num):
    slide = prs.slides.add_slide(prs.slide_layouts[1]) 
    add_template(slide, slide_num)
    
    title_shape = slide.shapes.title
    title_shape.left = Inches(1.8)
    title_shape.top = Inches(1.3)
    title_shape.width = Inches(8)
    title_shape.height = Inches(0.8)
    title_shape.text = title_text
    title_shape.text_frame.paragraphs[0].alignment = PP_ALIGN.LEFT
    format_text_frame(title_shape.text_frame, 20, bold=True)
    
    body_shape = slide.placeholders[1]
    body_shape.left = Inches(1.8)
    body_shape.top = Inches(2.3)
    body_shape.width = Inches(7.8)
    body_shape.height = Inches(4.5)
    
    body_shape.text_frame.clear()
    body_shape.text_frame.word_wrap = True
    
    for i, pt in enumerate(bullets):
        p = body_shape.text_frame.add_paragraph() if i > 0 else body_shape.text_frame.paragraphs[0]
        
        # Handle sub-bullets (starts with '-')
        if pt.startswith('- '):
            p.text = pt[2:]
            p.level = 1
        else:
            p.text = pt
            p.level = 0
            
        set_font(p.font, 18)
        p.space_after = Pt(10)
        
    return slide

# Generating all the requested slides sequentially
slide_num = 1
create_slide("AGENDA", [
    "Scope of This Review",
    "Requirements (Functional & Non-Functional)",
    "Detailed System Architecture",
    "Use Case & ER Diagrams",
    "Module Description & Tech Stack",
    "UI Design, Frontend & Backend Build",
    "Database & API Integration",
    "Progress (70%), Screenshots & Challenges"
], slide_num); slide_num += 1

create_slide("REQUIREMENTS", [
    "Functional Requirements",
    "- User registration & authentication with JWT",
    "- Role-based dashboards for different departments",
    "- Core feature: Reserve, view, and manage facility bookings",
    "- Conflict detection and automated time-window validation",
    "Non-Functional Requirements",
    "- Performance: response time < 2 seconds for API endpoints",
    "- Scalability: can handle concurrent booking requests",
    "- Security: Secure JWT auth and password hashing",
    "- Usability: Responsive, accessible, user-friendly UI"
], slide_num); slide_num += 1

create_slide("ARCHITECTURE", [
    "CLIENT TIER",
    "- React.js components, Axios HTTP client, Context API for state management, CSS modules for styling.",
    "APPLICATION TIER",
    "- Node.js + Express.js backend offering modular REST APIs.",
    "- Middleware for JWT Authentication and request validation.",
    "DATA TIER",
    "- MongoDB (NoSQL) database with Mongoose ODM for schemas.",
    "FLOW",
    "- HTTP/HTTPS requests flow from the client through Express REST endpoints to MongoDB, returning JSON responses."
], slide_num); slide_num += 1

create_slide("USE CASE", [
    "[ Insert Use Case Diagram Here ]",
    "- Identify actors: Admin, Faculty/User.",
    "- User Cases: Login, View Facilities, Reserve Facility, Cancel Booking.",
    "- Admin Cases: Manage Users, Manage Facilities, View All Bookings.",
    "- Show relationships and interactions."
], slide_num); slide_num += 1

create_slide("ER DIAGRAM", [
    "[ Insert ER Diagram Here ]",
    "- Entities: Users, Resources (Facilities), Bookings.",
    "- Attributes: User(ID, Name, Dept, Password), Resource(ID, Name, Capacity, Type), Booking(ID, Resource_ID, User_ID, Start_Time, End_Time).",
    "- Relationships: 1 User can have N Bookings (1:N), 1 Resource can have N Bookings (1:N)."
], slide_num); slide_num += 1

create_slide("MODULES", [
    "User & Authentication Module",
    "- Login, Signup, JWT Token validation, Role handling.",
    "Facility Management Module",
    "- Fetch available facilities, filter by type/capacity.",
    "Booking Module (Core)",
    "- Create reservations, conflict resolution logic, time validation (8 AM - 4 PM limits).",
    "Admin Module",
    "- Add/Update/Remove facilities, view campus-wide booking reports."
], slide_num); slide_num += 1

create_slide("TECH STACK", [
    "Database: MongoDB (NoSQL) + Mongoose ODM",
    "Backend Framework: Express.js",
    "Frontend Library: React.js",
    "Runtime Environment: Node.js",
    "Supporting Tools & Libraries:",
    "- JWT & bcrypt (Auth/Security)",
    "- Axios (HTTP client)",
    "- Postman (API testing)",
    "- Git & GitHub (Version control)"
], slide_num); slide_num += 1

create_slide("UI DESIGN", [
    "[ Insert Wireframes / Mockups Here ]",
    "Key Screens:",
    "- Login / Signup Interface",
    "- Main Dashboard (Available facilities grid)",
    "- Booking Modal (Date & time selection)",
    "- Active Reservations List"
], slide_num); slide_num += 1

create_slide("FRONTEND", [
    "Built with React.js using functional components & hooks.",
    "Component-based structure: Sidebar Navigation, Facility Cards, Booking Forms, Modals.",
    "State management using React state and Context API.",
    "Client-side routing implemented with React Router.",
    "Axios used to consume backend REST APIs asynchronously.",
    "Responsive UI styled with custom CSS variables, gradients, and flexbox grids."
], slide_num); slide_num += 1

create_slide("BACKEND", [
    "Node.js + Express.js server with modular routing structure.",
    "MVC pattern separating routes, controllers, and database models.",
    "Authentication middleware using JSON Web Tokens (JWT).",
    "Input validation and comprehensive error handling for API requests (e.g. overlap prevention).",
    "Environment-based configuration (.env for secrets)."
], slide_num); slide_num += 1

create_slide("DATABASE", [
    "MongoDB used as the primary NoSQL data store.",
    "Mongoose schemas defined for Resources, Users, and Bookings.",
    "Relationships modeled via referencing (e.g. Booking referencing Resource ID).",
    "Persistent data storage ensuring records survive server restarts.",
    "Initial seed data provided for campus facilities (Labs, Auditoriums, Board Rooms)."
], slide_num); slide_num += 1

create_slide("API", [
    "GET /api/resources : Fetch all facilities (supports filtering by type/capacity)",
    "GET /api/bookings?date=YYYY-MM-DD : Fetch active reservations for a specific day",
    "POST /api/bookings : Create a new reservation (includes validation and conflict checks)",
    "DELETE /api/bookings/:id : Cancel an existing reservation",
    "POST /api/auth/login : Authenticate user & issue JWT",
    "POST /api/auth/register : Register a new user"
], slide_num); slide_num += 1

create_slide("STATUS", [
    "Frontend UI (Core Screens): 100%",
    "Backend APIs & Conflict Logic: 100%",
    "Database Integration & Persistence: 100%",
    "User Authentication: 80%",
    "Admin Analytics Module: 50%",
    "Notifications / Alerts: 30%"
], slide_num); slide_num += 1

# Screenshot slide is blank except for title
slide_ss = prs.slides.add_slide(prs.slide_layouts[1]) 
add_template(slide_ss, slide_num)
title_ss = slide_ss.shapes.title
title_ss.left = Inches(1.8); title_ss.top = Inches(1.3); title_ss.width = Inches(8); title_ss.height = Inches(0.8)
title_ss.text = "SCREENSHOTS"
format_text_frame(title_ss.text_frame, 20, bold=True)
slide_ss.placeholders[1].text_frame.clear() # Leave completely blank for user to upload image
slide_num += 1

create_slide("CHALLENGES", [
    "Challenge: Booking Conflicts in real-time.",
    "- Solution: Implemented robust overlap detection logic in the POST /bookings route.",
    "Challenge: Data loss on server restart (In-Memory DB).",
    "- Solution: Migrated to a persistent file-based JSON store / MongoDB Atlas.",
    "Challenge: 24-hour time format confusion.",
    "- Solution: Built a custom AM/PM time picker in React for intuitive input."
], slide_num); slide_num += 1

create_slide("NEXT STEPS", [
    "Complete Admin Module with advanced analytics and utilization reports.",
    "Implement Notification Module (automated email / in-app alerts for bookings).",
    "Conduct thorough integration & user-acceptance testing across devices.",
    "Improve UI accessibility features.",
    "Deploy application to production (e.g., Render/Vercel + MongoDB Atlas)."
], slide_num); slide_num += 1

create_slide("REFERENCES", [
    "[1] MongoDB, Express, React, Node.js — Official Documentation.",
    "[2] 'Smart Campus Resource Management System' by J. Smith et al.",
    "[3] 'Automated Facility Booking in Universities' by A. Kumar.",
    "[4] MDN Web Docs for React concepts and JavaScript fundamentals."
], slide_num); slide_num += 1

# --- Thank You Slide ---
slide_end = prs.slides.add_slide(prs.slide_layouts[6])
add_template(slide_end)
tb = slide_end.shapes.add_textbox(Inches(2), Inches(3), Inches(6), Inches(1))
tb.text = "THANK YOU"
tb.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
set_font(tb.text_frame.paragraphs[0].font, 28, bold=True)


output_path = "Project_Review_1_and_2.pptx"
prs.save(output_path)
print(f"Presentation saved successfully to {output_path}")
