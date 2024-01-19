import './App.css';
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { BaseRouter } from './components/BaseRouter'

// 1. import `ChakraProvider` component
import { ChakraProvider } from '@chakra-ui/react'

function App() {
  return (
    <ChakraProvider>
      <Router>
        <BaseRouter />
      </Router>
    </ChakraProvider>
  )
}

export default App;
