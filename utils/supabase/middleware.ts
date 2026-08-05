import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const updateSession = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  const isVideoEditor = pathname.endsWith("/editor") && request.nextUrl.searchParams.get("mode") !== "photo";
  const isLogin = pathname.endsWith("/login");

  if (!isVideoEditor && !isLogin) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"));
  if (hasSessionCookie) {
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();
    user = sessionUser;
  }

  if (!user && isVideoEditor) {
    const url = request.nextUrl.clone();
    const redirectedFrom = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    url.pathname = pathname.replace(/\/editor$/, "/login");
    url.search = "";
    url.searchParams.set("redirectedFrom", redirectedFrom);
    if (request.nextUrl.searchParams.get("autoupload") === "1") {
      url.searchParams.set("autoupload", "1");
    }
    return NextResponse.redirect(url);
  }

  if (user && pathname.endsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/login", "/editor");

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
};
