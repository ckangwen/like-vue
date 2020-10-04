import { createRouteMap } from '../../src/plugins/vue-router/create-route-map';

const Home = { template: '<div>This is Home</div>' }
const Foo = { template: '<div>This is Foo</div>' }
const FooBar = { template: '<div>This is FooBar</div>' }
const Foobar = { template: '<div>This is foobar</div>' }
const Bar = { template: '<div>This is Bar <router-view></router-view></div>' }
const Baz = { template: '<div>This is Baz</div>' }

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/foo', name: 'foo', component: Foo },
  { path: '*', name: 'wildcard', component: Baz },
  {
    path: '/bar',
    component: Bar,
  }
]

describe('Create Route Map', () => {
  let map = createRouteMap(routes)
  beforeAll(() => {
    map = createRouteMap(routes)
  })

  it('return value', () => {
    expect(map.pathList).toEqual([
      '/',
      '/foo',
      '/bar',
      '*'
    ])
    expect(Object.keys(map.pathMap)).toEqual([
      '/',
      '/foo',
      '*',
      '/bar',
    ])
    expect(Object.keys(map.nameMap)).toEqual([
      'home',
      'foo',
      'wildcard',
    ])
  });
});