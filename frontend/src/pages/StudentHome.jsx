import StudentNav from "../components/StudentNav";
import StudentMessageMain from "../components/StudentMessageMain";
import AttendanceIndividualMain from "../components/AttendanceIndividualMain";


const StudentHome = () => {
  return (
    <div className="">
      <StudentNav/>
      <div className="flex gap-40 mt-32 ">
        <AttendanceIndividualMain/>
        <StudentMessageMain/>
      </div>
    </div>
  );
};

export default StudentHome;
