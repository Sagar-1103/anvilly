import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/",
  },
  secret: process.env.JWT_SECRET,
});

export const config = {
  matcher: ["/projects/:path*"],
};
