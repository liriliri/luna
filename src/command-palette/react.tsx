import { FC, useEffect, useRef } from 'react'
import CommandPalette, { IOptions } from './index'
import each from 'licia/each'
import types from 'licia/types'
import { useNonInitialEffect, useOption } from '../share/hooks'

interface ICommandPaletteProps extends IOptions {
  visible: boolean
  onClose?: () => void
}

const LunaCommandPalette: FC<ICommandPaletteProps> = (props) => {
  const commandPaletteRef = useRef<HTMLDivElement>(null)
  const commandPalette = useRef<CommandPalette>()
  const doHide = useRef<types.AnyFn>()

  useEffect(() => {
    const cp = new CommandPalette(commandPaletteRef.current!, {
      placeholder: props.placeholder,
      shortcut: props.shortcut,
      commands: props.commands,
      theme: props.theme,
    })
    doHide.current = cp.hide
    cp.hide = function () {
      props.onClose && props.onClose()
    }
    if (props.visible) {
      cp.show()
    }
    commandPalette.current = cp

    return () => commandPalette.current?.destroy()
  }, [])

  useNonInitialEffect(() => {
    if (commandPalette.current) {
      commandPalette.current.hide = function () {
        props.onClose && props.onClose()
      }
    }
  }, [props.onClose])

  useNonInitialEffect(() => {
    if (commandPalette.current) {
      if (props.visible) {
        commandPalette.current.show()
      } else {
        doHide.current && doHide.current.call(commandPalette.current)
      }
    }
  }, [props.visible])

  each(['theme', 'commands'], (key: keyof IOptions) => {
    useOption<CommandPalette, IOptions>(commandPalette, key, props[key])
  })

  return <div ref={commandPaletteRef} />
}

export default LunaCommandPalette
