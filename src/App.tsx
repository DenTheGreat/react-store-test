import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import ProductList from './components/ProductList'
import ProductPage from './pages/ProductPage'
import Layout from './components/Layout'
import {SearchProvider} from "./context/SearchContext.tsx";

const App = () => {
    return (
        <SearchProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<ProductList/>}/>
                        <Route path="/product/:id" element={<ProductPage/>}/>
                        <Route path="*" element={<div className="p-4">Page Not Found</div>}/>
                    </Routes>
                </Layout>
            </Router>
        </SearchProvider>
    )
}

export default App
