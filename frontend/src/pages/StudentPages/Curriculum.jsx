import React, { useState } from 'react'
import StudentNav from '../../components/StudentNav'
import SmartTask from '../../components/SmartTask'
import TaskStatsWidget from '../../components/TaskStatsWidget'

const Curriculum = () => {
  const [statsRefresh, setStatsRefresh] = useState(0);

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <StudentNav />
      {/* Stats bar above tasks */}
      <div style={{ maxWidth:820, margin:"0 auto", padding:"24px 24px 0" }}>
        <TaskStatsWidget refreshTrigger={statsRefresh} />
      </div>
      <SmartTask onStatsRefresh={() => setStatsRefresh(n => n + 1)} />
    </>
  )
}

export default Curriculum