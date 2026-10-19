import { Markdown } from '@storybook/blocks'

export function readmePage(markdown) {
  function ReadmePage() {
    return <Markdown>{markdown || ''}</Markdown>
  }

  return ReadmePage
}
