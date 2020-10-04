module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'node',
  verbose: true,
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.(js|ts)$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
}