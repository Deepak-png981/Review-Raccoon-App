import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url)
  
  // Check if this is the GitHub callback route
  if (pathname === '/api/auth/callback/github') {
    return handleGitHubCallback(request)
  }
  
  // Skip auth check for authentication routes
  if (
    pathname.startsWith('/api/auth') || 
    pathname === '/login' || 
    pathname.startsWith('/_next') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  // Check if user is authenticated for protected routes
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req: request })
    
    if (!token) {
      console.log('Middleware: Unauthenticated access attempt to', pathname)
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Function to handle GitHub OAuth callback
async function handleGitHubCallback(request: NextRequest) {
  console.log("Middleware: Intercepted GitHub callback")
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Get code and state from the callback URL
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    console.log(`Middleware: GitHub callback received - code: ${code ? 'present' : 'missing'}, state: ${state ? 'present' : 'missing'}`)
    
    if (!code || !state) {
      console.error("Middleware: Missing code or state in GitHub callback")
      return NextResponse.redirect(new URL('/dashboard/repositories?error=missing_params', request.url))
    }
    
    // Get the oauth data from the cookie that contains user ID and expected state
    const oauthDataCookie = request.cookies.get('github_oauth_data')
    
    if (!oauthDataCookie?.value) {
      console.error("Middleware: No github_oauth_data cookie found")
      return NextResponse.redirect(new URL('/dashboard/repositories?error=no_oauth_data', request.url))
    }
    
    // Parse the cookie data
    let oauthData
    try {
      oauthData = JSON.parse(oauthDataCookie.value)
      console.log(`Middleware: Found oauth data in cookie - state: ${oauthData.state ? oauthData.state.substring(0, 5) + '...' : 'missing'}, userId: ${oauthData.userId || 'missing'}`)
    } catch (e) {
      console.error("Middleware: Failed to parse github_oauth_data cookie", e)
      return NextResponse.redirect(new URL('/dashboard/repositories?error=invalid_oauth_data', request.url))
    }
    
    // Verify that the state matches to prevent CSRF attacks
    if (oauthData.state !== state) {
      console.error("Middleware: State mismatch", { 
        cookieState: oauthData.state, 
        callbackState: state 
      })
      return NextResponse.redirect(new URL('/dashboard/repositories?error=state_mismatch', request.url))
    }
    
    // Log and redirect to the processing endpoint
    console.log("Middleware: State validation passed, processing GitHub connection for user:", oauthData.userId)
    
    // Create the processing URL with necessary parameters
    const processingUrl = new URL('/api/user/github-process-connection', request.url)
    processingUrl.searchParams.append('code', code)
    processingUrl.searchParams.append('userId', oauthData.userId)
    
    // Clear the oauth data cookie
    const response = NextResponse.redirect(processingUrl)
    response.cookies.set('github_oauth_data', '', { 
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    })
    
    return response
  } catch (error) {
    console.error("Middleware: Error processing GitHub callback", error)
    return NextResponse.redirect(new URL('/dashboard/repositories?error=middleware_error', request.url))
  }
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/auth/callback/github'
  ]
}
