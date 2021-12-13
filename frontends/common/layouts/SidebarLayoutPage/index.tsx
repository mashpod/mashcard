import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useDocsI18n } from '@/docs/common/hooks'
import { headerBarVar, siderBarVar } from '@/common/reactiveVars'
import { styled } from '@brickdoc/design-system'
import { useReactiveVar } from '@apollo/client'
import { Outlet } from 'react-router-dom'
import { base } from './index.style'

const Layout = styled('div', {
  ...base
})

export const SidebarLayoutPage: React.FC = () => {
  const { t } = useDocsI18n()
  const headerBar = useReactiveVar(headerBarVar)
  const siderBar = useReactiveVar(siderBarVar)

  return (
    <>
      <Helmet titleTemplate={`%s - ${t('app_title')}`} defaultTitle={t('app_title')} />
      <Layout>
        {siderBar !== undefined && <section>{siderBar}</section>}
        <main>
          {headerBar !== undefined && <header>{headerBar}</header>}
          <article>
            <Outlet />
          </article>
        </main>
        <aside>&nbsp;&nbsp;</aside>
      </Layout>
    </>
  )
}
