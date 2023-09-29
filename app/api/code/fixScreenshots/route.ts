import { put } from '@vercel/blob'
import puppeteer, { Browser } from 'puppeteer'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { kv } from '@vercel/kv'

interface Request {
  id: string
  dataUrl: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_USER) {
    return NextResponse.json({}, { status: 403 })
  }

  const ids = await kv.keys('code/*')

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]

    const code = await kv.hgetall<{
      currentStep: number
      history: number[]
      image: string
      latestStep: number
      user: string
      versions: Array<{
        code: string
        messages: Array<{
          content: string
          role: string
        }>
      }>
    }>(id)
    if (!code) {
      return NextResponse.json({}, { status: 409 })
    }
    if (code.image || !code.versions[code.history[code.latestStep]]) {
      continue
    }

    const message = code.versions[code.history[code.latestStep]].code
    const dataUrl = 'data:text/html;charset=utf-8,' + escape(message)

    let browser: Browser

    try {
      browser = await puppeteer.launch({
        headless: true,
      })
      const page = await browser.newPage()
      await page.goto(dataUrl)
      const screenshot = await page.screenshot({ type: 'png' })

      const { url } = await put(id, screenshot, { access: 'public' })

      await kv.hset(id, {
        image: url,
      })

      await browser.close()
    } catch (error) {
      // return NextResponse.json({}, { status: 500 })
    }
  }

  return NextResponse.json({
  })
}