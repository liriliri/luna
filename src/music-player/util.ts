import splitPath from 'licia/splitPath'
import contain from 'licia/contain'

export function splitName(str: string) {
  const { name, ext } = splitPath(str)

  if (contain(name, ' - ')) {
    const parts = name.replace(ext, '').split(' - ')
    return {
      title: parts[1],
      artist: parts[0],
    }
  }

  return {
    title: name,
    artist: '',
  }
}
