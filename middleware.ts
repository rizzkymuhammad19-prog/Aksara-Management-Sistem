export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/divisi/:path*",
    "/keuangan/:path*",
    "/absensi/:path*",
    "/settings/:path*",
    "/karyawan/:path*",
    "/task/:path*",
    "/design/:path*",
    "/performance/:path*",
    "/laporan/:path*",
    "/profile/:path*",
  ],
};
