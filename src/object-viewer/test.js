const container = document.createElement('div')
document.body.appendChild(container)

const objectViewer = new LunaObjectViewer(container, {
  unenumerable: false,
  accessGetter: true,
})

objectViewer.set({ a: 1 })

describe('object-viewer', function () {
  it('basic', function () {
    expect(container.innerHTML).to.not.equal('lalal')
  })
})
