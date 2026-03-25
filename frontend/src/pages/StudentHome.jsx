import StudentNav from "../components/StudentNav"
import StudentMessageMain from "../components/StudentMessageMain"
import AttendanceIndividualMain from "../components/AttendanceIndividualMain"

const StudentHome = () => {
  return (
    <div className="min-h-screen bg-[#e6f6ee]">
      <StudentNav />

      <div
        className="
          max-w-7xl mx-auto
          px-4 md:px-10
          mt-16            
          grid grid-cols-1 md:grid-cols-2
          gap-10 lg:gap-70   
        "
      >
        <AttendanceIndividualMain />
        <StudentMessageMain />
      </div>
    </div>
  )
}

export default StudentHome
