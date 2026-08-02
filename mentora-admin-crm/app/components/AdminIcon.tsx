import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarsProgress,
  faBrain,
  faBuilding,
  faBullhorn,
  faCalendarDays,
  faChartLine,
  faCheckCircle,
  faComments,
  faCreditCard,
  faDesktop,
  faFileLines,
  faGear,
  faGraduationCap,
  faHeadset,
  faLock,
  faMobileScreen,
  faMoneyBillTrendUp,
  faPlug,
  faShieldHalved,
  faTableColumns,
  faTasks,
  faUserGraduate,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { IconName } from "./adminTypes";

export function AdminIcon({ name }: { name: IconName }) {
  const icons: Record<IconName, IconDefinition> = {
    ai: faBrain,
    analytics: faChartLine,
    automation: faBarsProgress,
    building: faBuilding,
    calendar: faCalendarDays,
    campaign: faBullhorn,
    chat: faComments,
    check: faCheckCircle,
    dashboard: faTableColumns,
    document: faFileLines,
    finance: faMoneyBillTrendUp,
    graduation: faGraduationCap,
    headset: faHeadset,
    integration: faPlug,
    lead: faUserGraduate,
    lock: faLock,
    mail: faComments,
    mobile: faMobileScreen,
    payment: faCreditCard,
    report: faChartLine,
    settings: faGear,
    shield: faShieldHalved,
    task: faTasks,
    organization: faBuilding,
    user: faUsers,
  };

  return (
    <span aria-hidden="true" className="app-icon">
      <FontAwesomeIcon icon={icons[name] ?? faDesktop} />
    </span>
  );
}
