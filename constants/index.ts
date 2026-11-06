
import {
  Home,
  ArrowLeftRight,
  Users,
  Wallet,
  History,
  Bell,
  Settings,
  HistoryIcon,
  Banknote
} from "lucide-react";

export const FIELD_NAMES = {
  fullName: "Full Name",
  email: "Email Address",
  phoneNumber: "Phone Number",
  password: "Password"
};

export const FIELD_TYPE = {
  fullName: "text",
  email: "email",
  phoneNumber: "text",
  password: "password"
};




export const sidebarLinks = [
  {
    id: 1,
    name: "overview",
    url: "/",
    icon: Home,
  },
  {
    id: 3,
    name: "loanees",
    url: "/loanees",
    icon: Users,
  },
  {
    id: 2,
    name: "transactions",
    url: "/transaction",
    icon: ArrowLeftRight,
  },
  {
    id: 4,
    name: "categories",
    url: "/categories",
    icon: Wallet,
  },
];

export const actionPanel = [
  {
    name: "Defaulted"
  },
  {
    name: "Grace Period"
  },
  {
    name: "Active"
  },
  {
    name: "Paid"
  }
];