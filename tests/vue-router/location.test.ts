import { normalizeLocation } from '../../src/plugins/vue-router/utils/location';
describe('Location', () => {
  describe('normalizeLocation', () => {
    it('string', () => {
      const loc = normalizeLocation('/abc?foo=bar&baz=qux#hello')
      expect(loc._normalized).toBe(true)
      expect(loc.path).toBe('/abc')
      expect(loc.hash).toBe('#hello')
      expect(JSON.stringify(loc.query)).toBe(JSON.stringify({
        foo: 'bar',
        baz: 'qux'
      }))
    })

    it('empty string', function () {
      const loc = normalizeLocation('', { path: '/abc' } )
      expect(loc._normalized).toBe(true)
      expect(loc.path).toBe('/abc')
      expect(loc.hash).toBe('')
      expect(JSON.stringify(loc.query)).toBe(JSON.stringify({}))
    })

    it('relative', () => {
      const loc = normalizeLocation('abc?foo=bar&baz=qux#hello', {
        path: '/root/next'
      })
      expect(loc._normalized).toBe(true)
      expect(loc.path).toBe('/root/abc')
      expect(loc.hash).toBe('#hello')
      expect(JSON.stringify(loc.query)).toBe(JSON.stringify({
        foo: 'bar',
        baz: 'qux'
      }))
    })

    it('relative append', () => {
      const loc = normalizeLocation('abc?foo=bar&baz=qux#hello', {
        path: '/root/next'
      }, true)
      expect(loc._normalized).toBe(true)
      expect(loc.path).toBe('/root/next/abc')
      expect(loc.hash).toBe('#hello')
      expect(JSON.stringify(loc.query)).toBe(JSON.stringify({
        foo: 'bar',
        baz: 'qux'
      }))
    })
  })
})
