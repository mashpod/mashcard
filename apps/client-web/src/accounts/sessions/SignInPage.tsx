import React, { useEffect } from 'react'
import { AuthMethod } from '@/MashcardGraphQL'
import { Helmet } from 'react-helmet-async'
import { useAccountsAuthMethods } from './hooks/useAccountsAuthMethods'
import { useAccountsI18n } from '@/accounts/common/hooks'
import { Button, useBoolean, Box } from '@mashcard/design-system'
import { MoreAuthMethods } from './components/MoreAuthMethods'
import { EmailPasswordSignIn } from './components/EmailPasswordSignIn'
import { isLoadingVar } from '@/common/reactiveVars'

export const SignInPage: React.FC = () => {
  const { t } = useAccountsI18n()
  const [renderEmailPasswordForm, { setTrue: enableEmailPwdSignIn }] = useBoolean(false)
  const { loading, authMethods } = useAccountsAuthMethods(enableEmailPwdSignIn)
  const preferredAuthMethod = authMethods[0]

  useEffect(() => {
    if (!loading && preferredAuthMethod.name === AuthMethod.EmailPassword) enableEmailPwdSignIn()
  })

  isLoadingVar(loading)
  if (loading) return <></>

  const otherAuthMethods = renderEmailPasswordForm
    ? // skip EmailPassword if emailPassword has been rendered.
      authMethods.filter(x => x.name !== AuthMethod.EmailPassword)
    : // `slice(1)` could skip `preferred` auth method.
      authMethods.slice(1)

  return (
    <div>
      <Helmet>
        <title>{t('sessions.sign_in')}</title>
      </Helmet>
      <h1>{t('sessions.sign_in_to_mashcard')}</h1>
      <Box css={{ marginTop: '48px' }}>
        {
          // Primary Area
          renderEmailPasswordForm ? (
            <EmailPasswordSignIn />
          ) : (
            <Button
              size="lg"
              icon={preferredAuthMethod.logo}
              id={`auth-btn-${preferredAuthMethod.name}`}
              style={{ marginTop: '2rem' }}
              onClick={preferredAuthMethod.action}
              block>
              {t('sessions.login_via', { provider: t(`provider.${preferredAuthMethod.name}`) })}
            </Button>
          )
        }
        {otherAuthMethods.length >= 1 && <MoreAuthMethods methods={otherAuthMethods} />}
      </Box>
    </div>
  )
}

export default SignInPage
