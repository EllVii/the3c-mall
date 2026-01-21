/**
 * Babel Configuration
 * Needed for Jest to transform JSX in frontend tests
 */

export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};
