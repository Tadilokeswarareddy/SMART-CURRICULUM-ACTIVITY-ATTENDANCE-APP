import random
from datetime import timedelta, time
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction

from api.models import (
    UserModel,
    Branch,
    Year,
    Section,
    Subject,
    TeachingAssignment,
    TimeTable,
    AttendanceSession,
    Attendance,
)
from student.models import StudentModel, SmartTask
from teacher.models import TeacherModel
from app_messages.models import Message


class Command(BaseCommand):
    help = "Clear existing data and seed fake data for attendance management system"

    def handle(self, *args, **kwargs):
        with transaction.atomic():
            self.stdout.write(self.style.WARNING("Deleting old data..."))
            self.clear_data()

            self.stdout.write(self.style.SUCCESS("Creating fresh fake data..."))
            self.seed_all()

            self.stdout.write(self.style.SUCCESS("✅ Fake data created successfully!"))

    def clear_data(self):
        Attendance.objects.all().delete()
        AttendanceSession.objects.all().delete()
        TimeTable.objects.all().delete()
        TeachingAssignment.objects.all().delete()
        Message.objects.all().delete()
        SmartTask.objects.all().delete()

        StudentModel.objects.all().delete()
        TeacherModel.objects.all().delete()

        Subject.objects.all().delete()
        Section.objects.all().delete()
        Branch.objects.all().delete()
        Year.objects.all().delete()

        # keep superusers if you want? currently deleting all custom users
        UserModel.objects.exclude(is_superuser=True).delete()

    def seed_all(self):
        # ---------------------------
        # 1. ADMIN
        # ---------------------------
        admin_user = UserModel.objects.create_user(
            username="admin1",
            password="admin123",
            first_name="System",
            last_name="Admin",
            email="admin@example.com",
            role="admin",
            is_staff=True,
            is_superuser=False
        )

        # ---------------------------
        # 2. BRANCHES
        # ---------------------------
        branches = {}
        for name in ["CSE", "ECE", "EEE"]:
            branches[name] = Branch.objects.create(name=name)

        # ---------------------------
        # 3. YEARS
        # ---------------------------
        years = {}
        for y in [1, 2, 3, 4]:
            years[y] = Year.objects.create(year=y)

        # ---------------------------
        # 4. SECTIONS
        # ---------------------------
        sections = []
        for branch_name, branch in branches.items():
            for y in [1, 2, 3]:
                for sec_name in ["A", "B"]:
                    sections.append(
                        Section.objects.create(
                            branch=branch,
                            year=years[y],
                            name=sec_name
                        )
                    )

        # ---------------------------
        # 5. SUBJECTS
        # ---------------------------
        subject_map = {
            ("CSE", 1): [
                ("Mathematics I", "CSE101"),
                ("Programming in C", "CSE102"),
                ("Digital Logic", "CSE103"),
                ("English Communication", "CSE104"),
            ],
            ("CSE", 2): [
                ("Data Structures", "CSE201"),
                ("OOP with Java", "CSE202"),
                ("DBMS", "CSE203"),
                ("Operating Systems", "CSE204"),
            ],
            ("CSE", 3): [
                ("Computer Networks", "CSE301"),
                ("Web Development", "CSE302"),
                ("Software Engineering", "CSE303"),
                ("Machine Learning", "CSE304"),
            ],
            ("ECE", 1): [
                ("Engineering Physics", "ECE101"),
                ("Basic Electronics", "ECE102"),
                ("Circuit Theory", "ECE103"),
                ("Maths for ECE", "ECE104"),
            ],
            ("ECE", 2): [
                ("Signals and Systems", "ECE201"),
                ("Analog Circuits", "ECE202"),
                ("Microprocessors", "ECE203"),
                ("Communication Systems", "ECE204"),
            ],
            ("ECE", 3): [
                ("VLSI Design", "ECE301"),
                ("Digital Signal Processing", "ECE302"),
                ("Embedded Systems", "ECE303"),
                ("Antenna Theory", "ECE304"),
            ],
            ("EEE", 1): [
                ("Engineering Chemistry", "EEE101"),
                ("Electrical Basics", "EEE102"),
                ("Network Theory", "EEE103"),
                ("Maths for EEE", "EEE104"),
            ],
            ("EEE", 2): [
                ("Electrical Machines", "EEE201"),
                ("Power Systems", "EEE202"),
                ("Control Systems", "EEE203"),
                ("Measurements", "EEE204"),
            ],
            ("EEE", 3): [
                ("Power Electronics", "EEE301"),
                ("Renewable Energy", "EEE302"),
                ("Switchgear Protection", "EEE303"),
                ("Industrial Drives", "EEE304"),
            ],
        }

        subjects = []
        for (branch_name, year_num), sub_list in subject_map.items():
            for sub_name, sub_code in sub_list:
                subjects.append(
                    Subject.objects.create(
                        name=sub_name,
                        code=sub_code,
                        branch=branches[branch_name],
                        year=years[year_num],
                        syllabus_description=f"Syllabus for {sub_name}"
                    )
                )

        # ---------------------------
        # 6. TEACHERS
        # ---------------------------
        teacher_names = [
            ("Ravi", "Sharma"),
            ("Priya", "Mehta"),
            ("Anil", "Verma"),
            ("Sneha", "Kapoor"),
            ("Rahul", "Yadav"),
            ("Kiran", "Patel"),
            ("Neha", "Reddy"),
            ("Arjun", "Singh"),
        ]

        designations = [
            "assistant_professor",
            "associate_professor",
            "lecturer",
            "professor"
        ]

        teachers = []
        for i, (first, last) in enumerate(teacher_names, start=1):
            user = UserModel.objects.create_user(
                username=f"teacher{i}",
                password="teacher123",
                first_name=first,
                last_name=last,
                email=f"teacher{i}@college.com",
                role="teacher"
            )
            teacher = TeacherModel.objects.create(
                user=user,
                phone_number=f"98765000{i:02d}",
                employee_id=f"EMP{i:03d}",
                designation=random.choice(designations),
                department=random.choice(["CSE", "ECE", "EEE"]),
                qualification=random.choice(["M.Tech", "PhD", "M.E"]),
                experience_years=random.randint(2, 15),
                bio=f"{first} {last} is a dedicated faculty member."
            )
            teachers.append(teacher)

        # ---------------------------
        # 7. STUDENTS
        # ---------------------------
        first_names = [
            "Aman", "Rohit", "Sanjay", "Kunal", "Nikhil", "Pooja", "Divya",
            "Ananya", "Harsh", "Yash", "Meena", "Suresh", "Tina", "Vikram",
            "Komal", "Riya", "Abhi", "Lokesh", "Varun", "Simran"
        ]
        last_names = [
            "Reddy", "Kumar", "Sharma", "Patel", "Singh", "Gupta", "Yadav",
            "Verma", "Mishra", "Kapoor"
        ]

        students = []
        roll_counter = 1

        for section in sections:
            for _ in range(5):  # 5 students per section => 60 students total
                first = random.choice(first_names)
                last = random.choice(last_names)
                username = f"student{roll_counter}"
                roll_number = f"{section.branch.name}{section.year.year}{section.name}{roll_counter:03d}"

                user = UserModel.objects.create_user(
                    username=username,
                    password="student123",
                    first_name=first,
                    last_name=last,
                    email=f"{username}@college.com",
                    role="student"
                )

                student = StudentModel.objects.create(
                    user=user,
                    phone_number=f"91234000{roll_counter:03d}"[-10:],
                    roll_number=roll_number,
                    section=section
                )
                students.append(student)
                roll_counter += 1

        # ---------------------------
        # 8. TEACHING ASSIGNMENTS
        # ---------------------------
        assignments = []

        for section in sections:
            section_subjects = Subject.objects.filter(
                branch=section.branch,
                year=section.year
            )

            for subject in section_subjects:
                teacher = random.choice(teachers)
                assignment = TeachingAssignment.objects.create(
                    teacher=teacher,
                    subject=subject,
                    section=section
                )
                assignments.append(assignment)

        # ---------------------------
        # 9. TIMETABLE
        # ---------------------------
        days = ["mon", "tue", "wed", "thu", "fri"]
        slots = [
            (time(9, 0), time(10, 0)),
            (time(10, 0), time(11, 0)),
            (time(11, 15), time(12, 15)),
            (time(1, 0), time(2, 0)),
        ]

        for section in sections:
            section_assignments = list(TeachingAssignment.objects.filter(section=section))
            random.shuffle(section_assignments)

            for i, assignment in enumerate(section_assignments):
                if i < len(days):
                    TimeTable.objects.create(
                        assignment=assignment,
                        day=days[i],
                        start_time=slots[i % len(slots)][0],
                        end_time=slots[i % len(slots)][1]
                    )

        # ---------------------------
        # 10. ATTENDANCE SESSIONS
        # ---------------------------
        sessions = []
        today = timezone.now().date()

        for assignment in assignments[:30]:  # create for some assignments
            for days_ago in range(1, 6):  # last 5 days
                session_date = today - timedelta(days=days_ago)
                start_dt = timezone.now() - timedelta(days=days_ago, hours=random.randint(1, 5))
                expires_dt = start_dt + timedelta(minutes=5)

                session = AttendanceSession.objects.create(
                    assignment=assignment,
                    date=session_date,
                    expires_at=expires_dt,
                    is_active=False
                )
                sessions.append(session)

        # Add one active session for testing QR
        active_assignment = random.choice(assignments)
        active_session = AttendanceSession.objects.create(
            assignment=active_assignment,
            date=today,
            expires_at=timezone.now() + timedelta(minutes=15),
            is_active=True
        )
        sessions.append(active_session)

        # ---------------------------
        # 11. ATTENDANCE RECORDS
        # ---------------------------
        for session in sessions:
            section_students = StudentModel.objects.filter(section=session.assignment.section)

            for student in section_students:
                Attendance.objects.create(
                    student=student,
                    session=session,
                    status=random.choice([True, True, True, False])  # 75% attendance
                )

        # ---------------------------
        # 12. MESSAGES
        # ---------------------------
        Message.objects.create(
            title="Welcome Students",
            message="Welcome to the new academic session. Stay regular and maintain attendance.",
            sent_by=admin_user,
            sender_type="admin",
            target_section=None
        )

        for section in random.sample(sections, 5):
            teacher_assignment = TeachingAssignment.objects.filter(section=section).first()
            if teacher_assignment:
                Message.objects.create(
                    title=f"Reminder for {section}",
                    message="Please be on time for tomorrow's class and bring your lab records.",
                    sent_by=teacher_assignment.teacher.user,
                    sender_type="teacher",
                    target_section=section
                )

        # ---------------------------
        # 13. SMART TASKS
        # ---------------------------
        task_titles = [
            ("Revise DBMS Unit 1", "Study normalization and ER diagrams", 45),
            ("Practice Java OOP", "Solve 3 inheritance problems", 40),
            ("Prepare CN Notes", "Revise OSI model and TCP/IP", 35),
            ("Finish Assignment", "Complete pending internal assignment", 60),
            ("Attendance Check", "Review your subject attendance percentage", 10),
        ]

        for student in random.sample(students, min(15, len(students))):
            for title, desc, dur in random.sample(task_titles, 3):
                SmartTask.objects.create(
                    student=student.user,
                    title=title,
                    description=desc,
                    duration=dur,
                    completed=random.choice([False, False, True])
                )

        # ---------------------------
        # PRINT TEST USERS
        # ---------------------------
        self.stdout.write(self.style.SUCCESS("\n=== LOGIN CREDENTIALS ==="))
        self.stdout.write("ADMIN  -> username: admin1   password: admin123")
        self.stdout.write("TEACHER-> username: teacher1 password: teacher123")
        self.stdout.write("STUDENT-> username: student1 password: student123")