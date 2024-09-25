import RetroHandheld from './index'
import test from '../share/test'

test('retro-emulator', (container) => {
  const retroHandheld = new RetroHandheld(container, {
    core: 'https://luna.liriliri.io/fceumm_libretro.js',
    browserFS: 'https://luna.liriliri.io/browserfs.min.js',
  })

  it('basic', function () {
    retroHandheld.load('https://luna.liriliri.io/Contra.nes')
  })

  return retroHandheld
})
