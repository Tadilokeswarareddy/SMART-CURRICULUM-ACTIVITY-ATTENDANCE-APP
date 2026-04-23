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
      <div style={{ minHeight:"100vh", background:"#f0fdf4" }}>
        <SmartTask onStatsRefresh={() => setStatsRefresh(n => n + 1)} />
        <div style={{ maxWidth:820, margin:"0 auto", padding:"0 24px 48px" }}>
          <TaskStatsWidget refreshTrigger={statsRefresh} />
        </div>
      </div>
    </>
  )
}

export default Curriculum