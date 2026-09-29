import { useState } from 'react';
import { ClassItem, classItems, MemberPage } from './shared';
import { MemberProfile } from './views/MemberProfile';
import { Overview } from './views/Overview';
import { MemberSection } from './views/MemberSection';
import { Classes } from './views/Classes';
import { Confirm } from './views/Confirm';
import MemberPortalV2, { NewMemberPage } from '../../MemberPortalV2';

export default function MemberPortal({
  initialPage = "overview",
}: {
  initialPage?: MemberPage
}) {
  const [page, setPage] = useState<MemberPage>(initialPage)
  const [selectedClass, setSelectedClass] = useState<ClassItem>(classItems[1])

  if (page === "profile") {
    return <MemberProfile onNavigate={setPage} />
  }

  if (["schedule", "success", "workout", "ai"].includes(page)) {
    return (
      <MemberPortalV2
        page={page as NewMemberPage}
        onNavigate={(nextPage) => setPage(nextPage)}
      />
    )
  }

  if (page === "classes") {
    return (
      <Classes
        onNavigate={setPage}
        onSelect={(item) => {
          setSelectedClass(item)
          setPage("confirm")
        }}
      />
    )
  }

  if (page === "confirm") {
    return <Confirm selectedClass={selectedClass} onNavigate={setPage} />
  }

  if (page === "users" || page === "payment" || page === "reports") {
    return <MemberSection page={page} onNavigate={setPage} />
  }

  return <Overview onNavigate={setPage} />
}
