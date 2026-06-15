import { useEffect } from 'react'

interface PageMetaOptions {
  title: string
  description?: string
}

const DEFAULT_TITLE = 'BeetleX Hackathon Platform'
const DEFAULT_DESCRIPTION =
  'Discover hackathons, register teams, submit projects, and track live leaderboards on the BeetleX platform.'

function setMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attribute}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attribute, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta({ title, description }: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = title === DEFAULT_TITLE ? title : `${title} · BeetleX`
    document.title = fullTitle
    setMetaTag('description', description ?? DEFAULT_DESCRIPTION)
    setMetaTag('og:title', fullTitle, 'property')
    setMetaTag('og:description', description ?? DEFAULT_DESCRIPTION, 'property')
    setMetaTag('twitter:title', fullTitle, 'property')
    setMetaTag('twitter:description', description ?? DEFAULT_DESCRIPTION, 'property')

    return () => {
      document.title = DEFAULT_TITLE
      setMetaTag('description', DEFAULT_DESCRIPTION)
    }
  }, [title, description])
}

export { DEFAULT_DESCRIPTION, DEFAULT_TITLE }
