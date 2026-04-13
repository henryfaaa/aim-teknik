import { Route } from "react-router-dom";
import OwnerLayout from "../pages/owner/OwnerLayout";
import OwnerAdminManagement from "../pages/owner/OwnerAdminManagement";
import OwnerLaporan from "../pages/owner/OwnerLaporan";

export default (
  <Route path="/owner" element={<OwnerLayout />}>
    <Route path="manajemen-admin" element={<OwnerAdminManagement />} />
    <Route path="laporan" element={<OwnerLaporan />} />
  </Route>
);
