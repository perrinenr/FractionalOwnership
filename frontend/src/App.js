import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute"; // adjust path if needed

// AUTH
import Login from "./pages/authentication/Login";
import Signup from "./pages/authentication/Signup";

// ADMIN
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPendingDeals from "./pages/admin/AdminPendingDeals";
import AdminPendingCompanies from "./pages/admin/AdminPendingCompanies";
import AdminKYCReview from "./pages/admin/AdminKYCReview";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminProfile from "./pages/admin/AdminProfile";

// COMPANY
import CompanyDashboard from "./pages/company/CompanyDashboard";
import Create_Deal from "./pages/company/Create_Deal";
import Deals from "./pages/company/Deals";
import Distribution from "./pages/company/Distribution";
import Create_Distribution from "./pages/company/Create_Distribution";
import CompanyWallet from "./pages/company/Wallet.jsx";

// INVESTOR
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import ExploreDeals from "./pages/investor/ExploreDeals";
import DealDetails from "./pages/investor/DealDetails";
import Portfolio from "./pages/investor/Portfolio";
import Wallet from "./pages/investor/Wallet";
import ProfileSetting from "./pages/investor/ProfileSettings";
import { Toaster } from "react-hot-toast";

import Step1BasicProfile from "./pages/onboarding/Step1BasicProfile";
import Step2KycVerification from "./pages/onboarding/Step2KycVerification";
import Step3SourceOfFunds from "./pages/onboarding/Step3SourceOfFunds";
import Step4CompanyInfo from "./pages/onboarding/Step4CompanyInfo";
import Step5BankAccount from "./pages/onboarding/Step5BankAccount";

import Step1BasicInfoType from "./pages/listing/Step1BasicInfoType";
import Step2DetailsClassification from "./pages/listing/Step2DetailsClassification";
import Step3FundingInformation from "./pages/listing/Step3FundingInformation";
import Step4Financials from "./pages/listing/Step4Financials";
import Step5ValuationTeam from "./pages/listing/Step5ValuationTeam";
import Step6DocumentsMetrics from "./pages/listing/Step6DocumentsMetrics";

// SHARED
import UserProfile from "./pages/company/Profile.jsx";

export default function App() {
  return (
    <>
     <Toaster position="top-right" reverseOrder={false} />
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />

      {/* ADMIN ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/pending-deals" element={<AdminPendingDeals />} />
        <Route path="/pending-companies" element={<AdminPendingCompanies />} />
        <Route path="/kyc-review" element={<AdminKYCReview />} />
        <Route path="/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
      </Route>

      {/* BUSINESS OWNER ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["BUSINESS_OWNER"]} />}>
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/company-deals" element={<Deals />} />
        <Route path="/company-create-deal" element={<Create_Deal />} />
        <Route path="/company-distributions" element={<Distribution />} />
        <Route path="/company-create-distribution" element={<Create_Distribution />} />
        <Route path="/company-wallet" element={<CompanyWallet />} />
      </Route>

      {/* INVESTOR ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["INVESTOR"]} />}>
        <Route path="/investor-dashboard" element={<InvestorDashboard />} />
        <Route path="/InvestorDashboard" element={<InvestorDashboard />} />
        <Route path="/ExploreDeals" element={<ExploreDeals />} />
        <Route path="/DealDetails/:dealId" element={<DealDetails />} />
        <Route path="/Portfolio" element={<Portfolio />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/Wallet" element={<Wallet />} />
        <Route path="/ProfileSetting" element={<ProfileSetting />} />
      </Route>

      {/* SHARED (ANY LOGGED USER) */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "INVESTOR", "BUSINESS_OWNER"]}
          />
        }
      >
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      <Route>
        <Route path="/Step1BasicProfile" element={<Step1BasicProfile />} />
        <Route path="/Step2KycVerification" element={<Step2KycVerification />} />
        <Route path="/Step3SourceOfFunds" element={<Step3SourceOfFunds />} />
        <Route path="/Step4CompanyInfo" element={<Step4CompanyInfo />} />
        <Route path="/Step5BankAccount" element={<Step5BankAccount />} />
      </Route>

      <Route>
      	<Route path="/Step1BasicInfoType" element={<Step1BasicInfoType />} />
        <Route path="/Step2DetailsClassification" element={<Step2DetailsClassification />} />
        <Route path="/Step3FundingInformation" element={<Step3FundingInformation />} />
        <Route path="/Step4Financials" element={<Step4Financials />} />
        <Route path="/Step5ValuationTeam" element={<Step5ValuationTeam />} />
        <Route path="/Step6DocumentsMetrics" element={<Step6DocumentsMetrics />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}