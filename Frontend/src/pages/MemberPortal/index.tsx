import { useState } from 'react';
import { ClassItem, classItems, MemberPage } from './shared';
import { MemberProfile } from './views/MemberProfile';
import { Overview } from './views/Overview';
import { MemberSection } from './views/MemberSection';
import { PackagesPage } from './views/PackagesPage';
import MemberShell from './components/MemberShell';
import { Classes } from './views/Classes';
import { Confirm } from './views/Confirm';
import MemberPortalV2, { NewMemberPage } from '../../MemberPortalV2';
import PaymentFlow from '../PaymentFlow';
import { CatalogPackage, PackagePeriod } from '../../services/packageApi';

type CheckoutSelection = {
  item: CatalogPackage;
  duration: PackagePeriod;
  discountPct: number;
};

export default function MemberPortal({
  initialPage = "overview",
}: {
  initialPage?: MemberPage
}) {
  const [page, setPage] = useState<MemberPage>(initialPage)
  const [selectedClass, setSelectedClass] = useState<ClassItem>(classItems[1])
  const [checkout, setCheckout] = useState<CheckoutSelection | null>(null)

  if (checkout) {
    return (
      <PaymentFlow
        initialPackage={checkout.item}
        initialDuration={checkout.duration}
        initialDiscountPct={checkout.discountPct}
        onExit={() => setCheckout(null)}
      />
    )
  }

  if (page === "profile") {
    return <MemberProfile onNavigate={setPage} />
  }

  if (["schedule", "success", "workout", "ai"].includes(page)) {
    return (
      <MemberPortalV2
        page={page as NewMemberPage}
        onNavigate={(nextPage) => setPage(nextPage)}
        selectedClass={selectedClass}
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

  if (page === "payment") {
    return (
      <MemberShell page="payment" onNavigate={setPage}>
        <PackagesPage
          onCheckout={(item, duration, discountPct) => setCheckout({ item, duration, discountPct })}
        />
      </MemberShell>
    )
  }

  if (page === "users" || page === "reports") {
    return <MemberSection page={page} onNavigate={setPage} />
  }

  return <Overview onNavigate={setPage} />
}
