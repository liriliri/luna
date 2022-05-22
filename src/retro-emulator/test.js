import RetroEmulator from './index'
import test from '../share/test'

test('retro-emulator', (container) => {
  const retroEmulator = new RetroEmulator(container, {
    core: 'https://res.liriliri.io/luna/fceumm_libretro.js',
    browserFS: 'https://res.liriliri.io/luna/browserfs.min.js',
  })

  it('basic', function () {
    retroEmulator.load('https://res.liriliri.io/luna/Contra.nes')
  })

  return retroEmulator
})
