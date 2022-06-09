import RetroHandheld from './index'
import test from '../share/test'

test('retro-emulator', (container) => {
  const retroHandheld = new RetroHandheld(container, {
    core: 'https://res.liriliri.io/luna/fceumm_libretro.js',
    browserFS: 'https://res.liriliri.io/luna/browserfs.min.js',
  })

  it('basic', function () {
    retroHandheld.load('https://res.liriliri.io/luna/Contra.nes')
  })

  return retroHandheld
})
