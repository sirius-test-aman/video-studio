# Onboarding: access, profile and tool connections

Not a module. The prerequisites a first-time user has to clear, and the single
biggest thing standing between a newsletter reader and a first session.

---

## What it covers

**Requesting access** through Saviynt, choosing a role, and waiting for approval.
**My Profile** for account information, usage, and connecting tools.
**Connecting Atlassian**, plus Lucid, Harness, GitHub and Bitbucket.

## The access path

1. Saviynt application request at `deluxe.saviyntcloud.com/ECMv6/request/applicationRequest`
2. Select application **SDLC Orchestrator**
3. Add the AD group for the role: `SDLC_Orchestrator_App_Prod_Business` or `SDLC_Orchestrator_App_Prod_Tech`
4. Add a comment stating the purpose
5. Submit, then **wait for approval** — check Pending Request in Saviynt

## Connecting Atlassian

1. `ai-labs.deluxe.com/sdlc`, log in with SSO
2. Profile icon, My Profile
3. Connected Tools, Atlassian, Connect
4. Enter Atlassian domain and `TID@deluxe.com`
5. Create an API token, set expiry to one year, copy it — **it cannot be viewed again**
6. Paste and Link Account
7. Verify via the Profile icon

## My Profile shows

- Display name, email, role (TECH / BUSINESS / BOTH), Atlassian connection status
- Total tokens consumed across modules, and last login date
- Connected tools: Atlassian, Lucid, Harness, GitHub, Bitbucket

## Why this matters for adoption

**Approval is a wait, and the Atlassian token is fiddly.** With 80 to 90 total
users against a 400 target, some of the gap is people who read the newsletter,
started a request, and stalled. A short onboarding video is a legitimate adoption
lever independent of any module.

## What we do not claim

- Never imply access is instant. Approval is required.
- Never show a real API token on screen.
- Do not skip the token expiry step. A missing expiry causes a silent failure later.

## Video candidates

- A 60 to 90 second "get access and connect Atlassian" tutorial. Likely the single most useful video for the adoption target.
- Never a promo. Onboarding is not a value proposition.
