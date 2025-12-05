import { auth } from "@/app/(auth)/auth";

export const config = {
  matcher: [
    "/api/auth/:path*",
  ],
};

export default auth((req) => {
  return undefined;
});
