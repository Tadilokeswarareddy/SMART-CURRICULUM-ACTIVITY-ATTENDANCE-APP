from django.utils import timezone
from datetime import timedelta

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    UserModel,
    AttendanceSession,
    Attendance,
    TeachingAssignment,
    Branch,
    Year,
    Section,
    Subject,
    TimeTable,
)
from .serializers import (
    UserModelSerializers,
    MyTokenObtainPairSerializer,
    BranchSerializer,
    YearSerializer,
    SectionSerializer,
    SubjectSerializer,
    TeachingAssignmentSerializer,
    TimeTableSerializer,
)
from student.models import StudentModel
from student.serializers import StudentSerializer


class UserRegisterView(generics.ListCreateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserModelSerializers
    permission_classes = [AllowAny]


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# --- Setup Views ---

class BranchListCreateView(generics.ListCreateAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


class YearListCreateView(generics.ListCreateAPIView):
    queryset = Year.objects.all()
    serializer_class = YearSerializer


class SectionListCreateView(generics.ListCreateAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer


class SubjectListCreateView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class TeachingAssignmentListCreateView(generics.ListCreateAPIView):
    """
    GET  → returns ONLY assignments belonging to the logged-in teacher.
    POST → admin creates assignments (unrestricted).
    This was the root cause of "Assignment not found or does not belong to you":
    previously all assignments were returned, so a teacher could select
    another teacher's assignment from the dropdown.
    """
    serializer_class = TeachingAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # If the user is a teacher, filter to only their assignments
        if user.role == 'teacher':
            try:
                return TeachingAssignment.objects.filter(
                    teacher=user.teacher_profile
                ).select_related('subject', 'section', 'section__branch', 'section__year')
            except Exception:
                return TeachingAssignment.objects.none()
        # Admin or other roles get everything
        return TeachingAssignment.objects.all().select_related(
            'subject', 'section', 'section__branch', 'section__year'
        )


class TimeTableListCreateView(generics.ListCreateAPIView):
    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer


# --- Attendance Views ---

class StartAttendanceSession(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'teacher':
            return Response({"error": "Only teachers allowed"}, status=403)

        assignment_id = request.data.get("assignment_id")

        if not assignment_id:
            return Response({"error": "assignment_id is required"}, status=400)

        try:
            assignment = TeachingAssignment.objects.get(
                id=assignment_id,
                teacher=request.user.teacher_profile
            )
        except TeachingAssignment.DoesNotExist:
            return Response({"error": "Assignment not found or does not belong to you"}, status=404)

        # Check for existing active session
        active_session = AttendanceSession.objects.filter(
            assignment=assignment,
            is_active=True
        ).first()

        if active_session:
            if not active_session.is_expired():
                # Return the existing session so the teacher can keep using it
                return Response({
                    "session_id": active_session.id,
                    "qr_token": str(active_session.qr_token),
                    "expires_at": active_session.expires_at,
                    "resumed": True,
                })
            else:
                active_session.is_active = False
                active_session.save()

        session = AttendanceSession.objects.create(
            assignment=assignment,
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        return Response({
            "session_id": session.id,
            "qr_token": str(session.qr_token),
            "expires_at": session.expires_at,
            "resumed": False,
        })


class MarkAttendanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'student':
            return Response({"error": "Only students allowed"}, status=403)

        qr_token = request.data.get("qr_token")

        if not qr_token:
            return Response({"error": "qr_token is required"}, status=400)

        try:
            session = AttendanceSession.objects.get(qr_token=qr_token, is_active=True)
        except AttendanceSession.DoesNotExist:
            return Response({"error": "Invalid or inactive QR code"}, status=400)

        if session.is_expired():
            session.is_active = False
            session.save()
            return Response({"error": "QR code has expired"}, status=400)

        try:
            student = request.user.student_profile
        except Exception:
            return Response({"error": "Student profile not found"}, status=404)

        if student.section != session.assignment.section:
            return Response({"error": "You are not enrolled in this class"}, status=403)

        attendance, created = Attendance.objects.get_or_create(
            student=student,
            session=session,
            defaults={"status": True}
        )

        if not created:
            return Response({"message": "Attendance already marked"}, status=200)

        return Response({"message": "Attendance marked successfully"}, status=201)


# ─── Timetable Views ────────────────────────────────────────────

class StudentTimetableView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            section = request.user.student_profile.section
        except Exception:
            return Response({"error": "Student profile not found"}, status=404)

        if not section:
            return Response({"error": "No section assigned to this student"}, status=400)

        timetable = TimeTable.objects.filter(
            assignment__section=section
        ).select_related('assignment__subject', 'assignment__teacher')

        serializer = TimeTableSerializer(timetable, many=True)
        return Response(serializer.data)


class TeacherTimetableView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            teacher_profile = request.user.teacher_profile
        except Exception:
            return Response({"error": "Teacher profile not found"}, status=404)

        timetable = TimeTable.objects.filter(
            assignment__teacher=teacher_profile
        ).select_related('assignment__subject', 'assignment__section')

        serializer = TimeTableSerializer(timetable, many=True)
        return Response(serializer.data)


# ─── Teacher: View Students of a Section ────────────────────────

class SectionStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, section_id):
        if request.user.role != 'teacher':
            return Response({"error": "Only teachers allowed"}, status=403)

        teaches = TeachingAssignment.objects.filter(
            teacher=request.user.teacher_profile,
            section_id=section_id
        ).exists()

        if not teaches:
            return Response({"error": "You do not teach this section"}, status=403)

        students = StudentModel.objects.filter(
            section_id=section_id
        ).select_related('user')

        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)


# ─── Teacher: Manual Attendance ──────────────────────────────────

class ManualAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'teacher':
            return Response({"error": "Only teachers allowed"}, status=403)

        session_id = request.data.get('session_id')
        present_student_ids = request.data.get('present_student_ids', [])

        if not session_id:
            return Response({"error": "session_id is required"}, status=400)

        try:
            session = AttendanceSession.objects.get(
                id=session_id,
                assignment__teacher=request.user.teacher_profile
            )
        except AttendanceSession.DoesNotExist:
            return Response({"error": "Session not found or not yours"}, status=404)

        all_students = StudentModel.objects.filter(
            section=session.assignment.section
        )

        marked = []
        for student in all_students:
            is_present = student.id in present_student_ids
            attendance, created = Attendance.objects.update_or_create(
                student=student,
                session=session,
                defaults={"status": is_present}
            )
            marked.append({
                "student_id": student.id,
                "roll_number": student.roll_number,
                "name": str(student),
                "status": is_present
            })

        return Response({"marked": marked}, status=200)


# ─── Teacher: Attendance Records for a Session ───────────────────

class SessionAttendanceView(APIView):
    """
    GET /api/attendance/session/<session_id>/
    Returns who was present/absent in a specific session.
    Teacher must own the session.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        if request.user.role != 'teacher':
            return Response({"error": "Only teachers allowed"}, status=403)

        try:
            session = AttendanceSession.objects.select_related(
                'assignment__subject',
                'assignment__section__branch',
            ).get(
                id=session_id,
                assignment__teacher=request.user.teacher_profile
            )
        except AttendanceSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=404)

        records = Attendance.objects.filter(session=session).select_related('student__user')

        attendance_list = [
            {
                "student_id": r.student.id,
                "full_name": r.student.user.get_full_name() or r.student.user.username,
                "roll_number": r.student.roll_number,
                "status": r.status,
                "marked_at": r.marked_at,
            }
            for r in records
        ]

        return Response({
            "session_id": session.id,
            "subject": session.assignment.subject.name,
            "section": str(session.assignment.section),
            "date": session.date,
            "start_time": session.start_time,
            "expires_at": session.expires_at,
            "is_active": session.is_active,
            "attendance": attendance_list,
        })


# ─── Teacher: All Sessions for an Assignment ─────────────────────

class AssignmentSessionsView(APIView):
    """
    GET /api/attendance/sessions/?assignment_id=<id>
    Returns all past sessions for a given assignment (for attendance history).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'teacher':
            return Response({"error": "Only teachers allowed"}, status=403)

        assignment_id = request.query_params.get('assignment_id')
        if not assignment_id:
            return Response({"error": "assignment_id query param required"}, status=400)

        try:
            assignment = TeachingAssignment.objects.get(
                id=assignment_id,
                teacher=request.user.teacher_profile
            )
        except TeachingAssignment.DoesNotExist:
            return Response({"error": "Assignment not found or not yours"}, status=404)

        sessions = AttendanceSession.objects.filter(
            assignment=assignment
        ).order_by('-date', '-start_time')

        data = [
            {
                "session_id": s.id,
                "date": s.date,
                "start_time": s.start_time,
                "is_active": s.is_active,
                "present_count": Attendance.objects.filter(session=s, status=True).count(),
                "total_count": Attendance.objects.filter(session=s).count(),
            }
            for s in sessions
        ]

        return Response(data)


# ─── Student: Individual Subject Attendance ───────────────────────

class StudentSubjectAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user.student_profile
        except Exception:
            return Response({"error": "Student profile not found"}, status=404)

        attendance_qs = Attendance.objects.filter(
            student=student
        ).select_related(
            'session__assignment__subject',
            'session__assignment__teacher'
        )

        summary = {}
        for record in attendance_qs:
            assignment = record.session.assignment
            subject = assignment.subject
            key = subject.id

            if key not in summary:
                summary[key] = {
                    "subject_id": subject.id,
                    "subject_name": subject.name,
                    "subject_code": subject.code,
                    "teacher_name": str(assignment.teacher),
                    "present": 0,
                    "total": 0,
                }

            summary[key]["total"] += 1
            if record.status:
                summary[key]["present"] += 1

        result = []
        total_present = 0
        total_classes = 0

        for data in summary.values():
            pct = round((data["present"] / data["total"]) * 100, 2) if data["total"] > 0 else 0
            result.append({**data, "percentage": pct})
            total_present += data["present"]
            total_classes += data["total"]

        overall = round((total_present / total_classes) * 100, 2) if total_classes > 0 else 0

        return Response({
            "overall_percentage": overall,
            "total_present": total_present,
            "total_classes": total_classes,
            "subjects": result
        })


# ─── Student & Teacher Profile Views ─────────────────────────────

class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user.student_profile
        except Exception:
            return Response({"error": "Student profile not found"}, status=404)

        return Response({
            "username": request.user.username,
            "full_name": request.user.get_full_name(),
            "email": request.user.email,
            "roll_number": student.roll_number,
            "phone_number": student.phone_number,
            "section": str(student.section) if student.section else None,
            "profile_picture": request.build_absolute_uri(student.profile_picture.url) if student.profile_picture else None,
        })


class TeacherProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            teacher = request.user.teacher_profile
        except Exception:
            return Response({"error": "Teacher profile not found"}, status=404)

        assignments = TeachingAssignment.objects.filter(
            teacher=teacher
        ).select_related('subject', 'section')

        subjects_taught = [
            {
                "subject": a.subject.name,
                "section": str(a.section)
            }
            for a in assignments
        ]

        return Response({
            "username": request.user.username,
            "full_name": request.user.get_full_name(),
            "email": request.user.email,
            "phone_number": teacher.phone_number,
            "employee_id": teacher.employee_id,
            "designation": teacher.designation,
            "department": teacher.department,
            "qualification": teacher.qualification,
            "experience_years": teacher.experience_years,
            "bio": teacher.bio,
            "profile_picture": request.build_absolute_uri(teacher.profile_picture.url) if teacher.profile_picture else None,
            "subjects_taught": subjects_taught,
        })