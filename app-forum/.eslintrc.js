module.exports = {
  extends: ['expo', '@react-native'],
  rules: {
    // Desabilitar regras que causam problemas desnecessários
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-undef': 'off', // TypeScript já cuida disso
    
    // JSX específico
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react/jsx-no-undef': 'off',
    
    // Importações
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    
    // React Native específico
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
  },
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
