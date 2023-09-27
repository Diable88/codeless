'use client'

import { Stack } from '@mui/material'
import axios from 'axios'
import { FC, useEffect } from 'react'
import { Browse } from './Browse'
import { useCodelessStore } from '@/stores/codeless'
import { Header } from './Header'
import { PageLoader } from './PageLoader'
import { ApiKeyWarning } from './ApiKeyWarning'
import { Toolbar } from './Toolbar'
import { Code } from './Code'

import { UserDialog } from '@/dialogs/UserDialog'
import { StarDialog } from '@/dialogs/StarDialog'
import { Preview } from './Preview'

export const Content: FC = () => {
  const hasApiKey = useCodelessStore((state) => state.hasApiKey)

  const id = useCodelessStore((state) => state.id)

  const isInitialized = useCodelessStore((state) => state.isInitialized)

  const model = useCodelessStore((state) => state.model)

  const provider = useCodelessStore((state) => state.provider)

  const setValue = async (key: string, value: string) => {
    await axios({
      method: 'POST',
      url: '/api/settings/setValue',
      data: {
        key,
        value,
      },
    })
  }

  useEffect(() => {
    if (!provider) {
      return
    }
    setValue('provider', provider)
  }, [provider])

  useEffect(() => {
    if (!model) {
      return
    }
    setValue('model', model)
  }, [model])

  if (!isInitialized) {
    return <PageLoader />
  }

  if (!hasApiKey) {
    return <ApiKeyWarning />
  }

  return (
    <>
      <Header />
      <Stack
        alignItems="center"
        height="calc(100vh - 52px)"
        marginTop={id ? '52px' : 0}
        justifyContent="center"
      >
        <Preview />
        <Toolbar />
      </Stack>
      <Code />
      <Browse />
      <UserDialog />
      <StarDialog />
    </>
  )
}
