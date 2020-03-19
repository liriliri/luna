import extend from 'licia/extend'

export default class Visitor {
  id: number
  visited: any[]
  constructor() {
    this.id = 0
    this.visited = []
  }
  set(val: any, extra: any) {
    const { visited, id } = this
    const obj = {
      id,
      val
    }
    extend(obj, extra)
    visited.push(obj)

    this.id++

    return id
  }
  get(val: any) {
    const { visited } = this

    for (let i = 0, len = visited.length; i < len; i++) {
      const obj = visited[i]
      if (val === obj.val) return obj
    }

    return false
  }
}
