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
    queryset = TeachingAssignment.objects.all()
    serializer_class = TeachingAssignmentSerializer


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
                return Response({"error": "An active session already exists for this class"}, status=400)
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
            "expires_at": session.expires_at
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
    """Student calls this to get their own timetable based on their section."""
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
    """Teacher calls this to get their own timetable across all sections they teach."""
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
    """Teacher passes section_id and gets all students in that section."""
    permission_classes = [IsAuthenticated]

    def get(self, request, section_id):
        if request.user.role != 'teacher':
            return Response({"error": "Only teachers allowed"}, status=403)

        # Make sure this teacher actually teaches this section
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
    """
    Teacher sends a session_id and a list of student ids who are present.
    All students in the section are marked, present or absent.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'teacher':
            return Response({"error": "Only teachers allowed"}, status=403)

        session_id = request.data.get('session_id')
        present_student_ids = request.data.get('present_student_ids', [])  # list of StudentModel ids

        if not session_id:
            return Response({"error": "session_id is required"}, status=400)

        try:
            session = AttendanceSession.objects.get(
                id=session_id,
                assignment__teacher=request.user.teacher_profile
            )
        except AttendanceSession.DoesNotExist:
            return Response({"error": "Session not found or not yours"}, status=404)

        # Get all students in the section
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


# ─── Student: Individual Subject Attendance ───────────────────────

class StudentSubjectAttendanceView(APIView):
    """Returns attendance breakdown per subject for the logged in student."""
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
    """Returns full profile data for the logged in teacher."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            teacher = request.user.teacher_profile
        except Exception:
            return Response({"error": "Teacher profile not found"}, status=404)

        from api.models import TeachingAssignment
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