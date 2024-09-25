import RetroEmulator from './index'
import test from '../share/test'

test('retro-emulator', (container) => {
  const retroEmulator = new RetroEmulator(container, {
    core: 'https://luna.liriliri.io/fceumm_libretro.js',
    browserFS: 'https://luna.liriliri.io/browserfs.min.js',
  })

  it('basic', function () {
    retroEmulator.load('https://luna.liriliri.io/Contra.nes')
  })

  return retroEmulator
})
