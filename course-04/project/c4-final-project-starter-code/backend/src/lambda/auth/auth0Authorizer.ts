import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const secret = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJeQYBGqyex5SyMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi03NDFoeWNsby5hdXRoMC5jb20wHhcNMTkwODEwMDk0MDMxWhcNMzMw
NDE4MDk0MDMxWjAhMR8wHQYDVQQDExZkZXYtNzQxaHljbG8uYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5QgMGKbI9wngcjVB7s85EGCr
dqjsOKysaJhUobf/GBzYiCwpsjPy16x5JO7Vb+8s9N4QOjK1r2LO13BhP+cG5iFV
QnmGWowPq6vklI2qkd2+aDG6lsG93WClSYmzgoF9H9w8Fm9SZg6Wd7nowBhUqtnd
4B5zaj0ZDnRyoJBezL7PC8UZe/Qq41Dyt6WtiKfDcXZfwfHk6OTK5A8L6yRMZ6R5
n1eYAQvVgX1+mi1f55voTxSDPwVzg9TLhEQyKx8vlgoxPu2l4utRcornIvl72ZZz
VYIpwK6VyEyKQ4f6yLZEzC3YrR9btU3L3MYQRcCjiLObjfU/BSiiWN7grN8pQwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSWBUhcApQVusgTh0LL
rBOrSNWU1jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBACwd2WJ8
R8+GzUIZNALD6us8uaRH1pop1Icb5A8810DTn61EBirS4FzMo+I0A3QTzX05AVmt
JYlzIrw4kdR/PRAPR1P2xUvUs2dF6qpxpO3tLX2UQ/ks0+dlTmpdb/AUtTdBguPp
lrLtBssnbzcakqzcIKSgsUPpLYN8fPxlrsobQ21L+17ZBKItrOvB1tBtnxey5CXk
oGtqtl2Si7iHc1xBAlYe7HzpFQOUKZoRjlZPAG+jHxZGZ+CpqBJYDCjAZ9Vmkp5f
NB4rJUm+lPP8UYJ/neH/w7PEk/q/7TEVXvIVTEPA5r4TfDhh8wCZUyLBS0w9cztB
SuSW3GSncB3ra80=
-----END CERTIFICATE-----
`

//const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  return verify(token, secret, {algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
