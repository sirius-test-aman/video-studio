# Module: Deployment

Connects Harness, surfaces pipelines and deployment state, generates
infrastructure as code from the SAD, and helps troubleshoot via MCP.

---

## What it does

After **connecting Harness**, the DevOps area covers Settings, Overview,
Pipelines, Deployments and Logs. **IaC generation from the SAD** works for both
new and existing projects. Troubleshooting runs through MCP.

## Who it is for

DevOps engineers and SREs. **Tech User** role.

## The adoption blocker

**Feature awareness plus setup.** The IaC-from-SAD path is the distinctive
capability and almost certainly the least known. Harness linkage is a barrier
before any value is visible.

## What is genuinely true

- IaC is generated **from the SAD**, so infrastructure traces back to a documented architecture.
- Separate paths for new projects and existing projects.
- Pipelines, deployments and logs are visible inside Velox once Harness is connected.
- Troubleshooting uses MCP.
- Velox does not replace Harness. It feeds and surfaces it.

## What we do not claim

- Never imply Velox deploys anything on its own.
- Never present generated IaC as production-ready without review.
- Do not claim it replaces the Harness console.

## Safe emphasis

1. **IaC from the SAD** — infrastructure that traces to a design document.
2. **Existing toolchain preserved.** Harness stays the deployment platform.

## TODO

Confirm what reviewing and applying generated IaC actually looks like, and whether
anything is ever applied from within Velox. This determines how carefully the
"nothing deploys itself" line needs to be framed.
