# Security

Vireo provides security-oriented defaults and supply-chain controls, but no framework can make an application secure without product-specific threat modeling and operational ownership.

## Framework controls

- Public packages use registry provenance or signed Maven artifacts.
- Release workflows verify immutable registry state.
- Source automation uses pinned provider actions and restricted permissions.
- Generated projects keep secrets out of committed defaults.
- Authentication and authorization integration points are explicit.
- Security reporting instructions are public.

## Application responsibilities

- Resource and action authorization
- Sensitive-data classification
- Session and token policy
- Input validation and output encoding
- Secret distribution and rotation
- Audit retention and incident response
- Dependency and infrastructure patching
- Production threat modeling

## Frontend boundary

Frontend route guards and hidden controls improve UX; they are never the authorization boundary. The backend must reject unauthorized operations independently.

Do not persist access tokens or sensitive domain data merely because a local storage primitive exists. Offline eligibility is a security and product decision.

## Production hardening

Replace demo credentials, restrict origins, configure trusted proxies deliberately, use secure cookies or appropriately protected tokens, enable rate limits where required and connect logs to an owned monitoring path.

## Report a vulnerability

Use the private security-reporting route documented in the framework [security policy](https://github.com/vireocodedev/vireo/security/policy). Do not disclose an unpatched vulnerability in a public issue.
